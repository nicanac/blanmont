'use server';

import { headers } from 'next/headers';
import { authenticateMember, type AuthenticatedMember } from '../lib/firebase';
import {
  setSessionCookie,
  clearSessionCookie,
  getSessionUser,
  type SessionUser,
} from '../lib/auth/session';
import { LoginSchema, AccountActivationSchema, safeValidate } from '../lib/validation';
import { recordActivity } from '../lib/logging/activityLogger';
import type { LoginFailureReason } from '../lib/auth/login-messages';
import { ensureMemberAccount, findMemberByEmail, normalizeEmail } from '../lib/auth/member-account';
import { loginContinueUrl, sendPasswordSetupEmail } from '../lib/auth/password-email';

const ACTIVATION_NEUTRAL_MESSAGE =
  "Si cette adresse est enregistrée dans l'annuaire du club, un email pour choisir votre mot de passe vient de partir. Il arrive en général en moins de 2 minutes : pensez à regarder dans vos spams ou courriers indésirables. Rien après 10 minutes ? Contactez un responsable du club.";
const ACTIVATION_FAILED_MESSAGE =
  "L'email n'a pas pu être envoyé pour le moment. Réessayez dans quelques minutes, ou demandez à un responsable du club de vous donner un mot de passe.";

export type LoginOutcome =
  | { ok: true; member: Omit<AuthenticatedMember, 'verifiedEmail'> }
  | { ok: false; reason: LoginFailureReason };

/**
 * Server Action: validates the credentials and, on success, sets the HttpOnly session cookie.
 * On failure it says why (wrong credentials, too many attempts, account not linked to a member...),
 * so the login page can guide the member instead of always pointing to the activation.
 */
export async function loginWithStatusAction(email: string, password: string): Promise<LoginOutcome> {
  // Phones often add a space or a capital to the email: neither is a different address.
  const validation = safeValidate(LoginSchema, { email: typeof email === 'string' ? email.trim() : email, password });

  if (!validation.success) {
    await recordActivity({
      category: 'auth',
      action: 'auth:login_failure',
      title: 'Tentative de connexion invalide (format)',
      severity: 'warn',
      user: { isAuthenticated: false, userEmail: email },
      metadata: { reason: 'validation_error' },
    });
    return { ok: false, reason: 'invalid_credentials' };
  }

  const result = await authenticateMember(validation.data.email, validation.data.password);
  if (!result.ok) {
    await recordActivity({
      category: 'auth',
      action: 'auth:login_failure',
      title: `Échec de connexion pour ${validation.data.email}`,
      severity: result.reason === 'unavailable' || result.reason === 'not_linked' ? 'error' : 'warn',
      user: { isAuthenticated: false, userEmail: validation.data.email },
      metadata: { reason: result.reason, ...(result.code ? { firebaseCode: result.code } : {}) },
    });
    return { ok: false, reason: result.reason };
  }

  // The verified login email goes into the signed cookie only, not back to the browser.
  const { verifiedEmail, ...member } = result.member;
  try {
    await setSessionCookie(member, verifiedEmail ?? null);
  } catch (error) {
    // Typically SessionSecretMissingError: the deployment has no SESSION_SECRET.
    // Refuse the login instead of issuing a token signed with a weak key.
    console.error('[loginAction] Could not create session:', error);
    await recordActivity({
      category: 'auth',
      action: 'auth:login_failure',
      title: `Session impossible pour ${validation.data.email}`,
      severity: 'error',
      user: { isAuthenticated: false, userEmail: validation.data.email },
      metadata: { reason: error instanceof Error ? error.name : 'session_error' },
    });
    return { ok: false, reason: 'unavailable' };
  }

  await recordActivity({
    category: 'auth',
    action: 'auth:login_success',
    title: `Connexion réussie : ${member.name}`,
    severity: 'info',
    user: {
      isAuthenticated: true,
      userId: member.id,
      userName: member.name,
      userEmail: member.email || null,
      role: member.role,
    },
    metadata: { memberId: member.id },
  });
  return { ok: true, member };
}

/**
 * Server Action: validates the credentials and establishes the HttpOnly session cookie.
 *
 * @returns The Member object if valid, or null.
 */
export async function loginAction(
  email: string,
  password: string
): Promise<Omit<AuthenticatedMember, 'verifiedEmail'> | null> {
  const outcome = await loginWithStatusAction(email, password);
  return outcome.ok ? outcome.member : null;
}

/**
 * Server Action to logout and clear the HttpOnly session cookie.
 */
export async function logoutAction(): Promise<void> {
  try {
    const sessionUser = await getSessionUser();
    if (sessionUser) {
      await recordActivity({
        category: 'auth',
        action: 'auth:logout',
        title: `Déconnexion : ${sessionUser.name}`,
        severity: 'info',
        user: {
          isAuthenticated: true,
          userId: sessionUser.id,
          userName: sessionUser.name,
          userEmail: sessionUser.email,
          role: sessionUser.role,
        },
      });
    }
  } catch {
    // Suppress cookie store errors if called outside of active request scope (e.g. isolated unit tests)
  }
  await clearSessionCookie();
}

/**
 * Server Action to fetch the current authenticated session user from HttpOnly cookie.
 */
export async function getCurrentSessionUserAction(): Promise<SessionUser | null> {
  return await getSessionUser();
}

/** Login page of the site that served this request (continue URL of the email). */
async function requestLoginUrl(): Promise<string | null> {
  try {
    const h = await headers();
    return loginContinueUrl(h.get('x-forwarded-host') ?? h.get('host'), h.get('x-forwarded-proto'));
  } catch {
    return null; // Outside a request (tests): the email goes out without a continue URL.
  }
}

/**
 * Server Action for a first login or a forgotten password.
 *
 * For a club member it prepares the login account (creates it, moves it to the directory email,
 * links authUid) and asks Firebase to email the "choose your password" link, from the server, so
 * a failure is never silent. The link is never returned to the caller: only the owner of the
 * address receives it. An address outside the directory gets the same answer as a member's
 * (no member enumeration); only a failed send says so.
 */
export async function requestAccountActivationAction(email: string): Promise<{
  success: boolean;
  message: string;
}> {
  const validation = safeValidate(AccountActivationSchema, { email: typeof email === 'string' ? email.trim() : email });

  if (!validation.success) {
    return { success: false, message: validation.errors.map(e => e.message).join(', ') };
  }

  const normalizedEmail = normalizeEmail(validation.data.email);
  const neutralSuccess = { success: true, message: ACTIVATION_NEUTRAL_MESSAGE };

  try {
    // 1. The address must be a member's directory email.
    const found = await findMemberByEmail(normalizedEmail);
    if (!found) {
      await recordActivity({
        category: 'auth',
        action: 'auth:activation_rejected',
        title: `Activation refusée (non-membre) : ${normalizedEmail}`,
        severity: 'warn',
        user: { isAuthenticated: false, userEmail: normalizedEmail },
        metadata: { reason: 'not_in_directory' },
      });
      return neutralSuccess;
    }
    const { key: memberKey, data: memberData } = found;

    // 2. Login account: created, moved to the directory email and linked as needed.
    const account = await ensureMemberAccount(memberKey, memberData, 'activation');

    // 3. Firebase emails the link to the address (never returned here).
    const mail = await sendPasswordSetupEmail(normalizedEmail, await requestLoginUrl());
    const memberUser = {
      isAuthenticated: false,
      userId: memberKey,
      userName: memberData.name,
      userEmail: normalizedEmail,
      role: memberData.role,
    };

    if (!mail.sent && mail.reason === 'rate_limited') {
      // An email went out for this address a moment ago: same answer as a success (no enumeration).
      await recordActivity({
        category: 'auth',
        action: 'auth:activation_rate_limited',
        title: `Activation redemandée trop vite : ${memberData.name}`,
        severity: 'warn',
        user: memberUser,
        metadata: { memberKey, firebaseCode: mail.code },
      });
      return neutralSuccess;
    }

    if (!mail.sent) {
      console.error(`[activation] Password email not sent (${mail.code})`);
      await recordActivity({
        category: 'auth',
        action: 'auth:activation_email_failed',
        title: `Email d'activation non envoyé : ${memberData.name}`,
        severity: 'error',
        user: memberUser,
        metadata: { memberKey, reason: mail.reason, firebaseCode: mail.code },
      });
      return { success: false, message: ACTIVATION_FAILED_MESSAGE };
    }

    await recordActivity({
      category: 'auth',
      action: 'auth:activation_requested',
      title: `Activation demandée : ${memberData.name}`,
      severity: 'info',
      user: memberUser,
      metadata: {
        memberKey,
        accountCreated: account.created,
        accountLinked: account.linked,
        returnsToSite: Boolean(mail.continueUrl),
        ...(mail.continueUrlRefused ? { continueUrlRefused: mail.continueUrlRefused } : {}),
      },
    });

    return neutralSuccess;
  } catch (error: unknown) {
    console.error('Failed to process account activation:', error);
    await recordActivity({
      category: 'auth',
      action: 'auth:activation_email_failed',
      title: `Activation en erreur : ${normalizedEmail}`,
      severity: 'error',
      user: { isAuthenticated: false, userEmail: normalizedEmail },
      metadata: { reason: error instanceof Error ? error.name : 'unknown' },
    }).catch(() => undefined);
    return { success: false, message: ACTIVATION_FAILED_MESSAGE };
  }
}
