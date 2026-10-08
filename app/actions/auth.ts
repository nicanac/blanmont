'use server';

import { validateUser } from '../lib/firebase';
import {
  setSessionCookie,
  clearSessionCookie,
  getSessionUser,
  type SessionUser,
} from '../lib/auth/session';
import { getAdminAuth, getAdminDatabase } from '../lib/firebase/admin';
import { LoginSchema, AccountActivationSchema, safeValidate } from '../lib/validation';
import { recordActivity } from '../lib/logging/activityLogger';

/**
 * Server Action to validate user credentials and establish an HttpOnly session cookie.
 *
 * @param email - The email.
 * @param password - The password.
 * @returns The Member object if valid, or null.
 */
export async function loginAction(email: string, password: string) {
  const validation = safeValidate(LoginSchema, { email, password });

  if (!validation.success) {
    await recordActivity({
      category: 'auth',
      action: 'auth:login_failure',
      title: 'Tentative de connexion invalide (format)',
      severity: 'warn',
      user: { isAuthenticated: false, userEmail: email },
      metadata: { reason: 'validation_error' },
    });
    return null;
  }

  const member = await validateUser(validation.data.email, validation.data.password);
  if (member) {
    await setSessionCookie(member);
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
  } else {
    await recordActivity({
      category: 'auth',
      action: 'auth:login_failure',
      title: `Échec de connexion pour ${validation.data.email}`,
      severity: 'warn',
      user: { isAuthenticated: false, userEmail: validation.data.email },
      metadata: { reason: 'invalid_credentials' },
    });
  }
  return member;
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

/**
 * Server Action to generate or send an account activation / password reset link.
 * Automatically provisions the user in Firebase Auth if they don't exist yet,
 * and links authUid with the Realtime Database member record.
 */
export async function requestAccountActivationAction(email: string): Promise<{
  success: boolean;
  message: string;
  directLink?: string;
}> {
  const validation = safeValidate(AccountActivationSchema, { email });

  if (!validation.success) {
    return { success: false, message: validation.errors.map(e => e.message).join(', ') };
  }

  const normalizedEmail = validation.data.email.trim().toLowerCase();

  try {
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDatabase();

    // 1. Check if member exists in Realtime Database
    const membersSnap = await adminDb.ref('members').once('value');
    let memberKey: string | null = null;
    let memberData: any = null;

    if (membersSnap.exists()) {
      membersSnap.forEach((child: any) => {
        const val = child.val();
        if (val.email && String(val.email).trim().toLowerCase() === normalizedEmail) {
          memberKey = child.key;
          memberData = val;
        }
      });
    }

    // If the email is not registered in the club database, reject activation immediately
    if (!memberKey || !memberData) {
      await recordActivity({
        category: 'auth',
        action: 'auth:activation_rejected',
        title: `Activation refusée (non-membre) : ${normalizedEmail}`,
        severity: 'warn',
        user: { isAuthenticated: false, userEmail: normalizedEmail },
        metadata: { reason: 'not_in_directory' },
      });
      return {
        success: false,
        message:
          "Cette adresse email n'est pas enregistrée dans l'annuaire du club. Seuls les membres préalablement ajoutés par un administrateur peuvent activer leur compte. Veuillez contacter un responsable du club si vous êtes membre.",
      };
    }

    // 2. Member exists in club database. Check if user already exists in Firebase Auth, if not create them
    let userRecord: any;
    try {
      userRecord = await adminAuth.getUserByEmail(normalizedEmail);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.message?.includes('user-not-found')) {
        // Create user in Firebase Auth for this verified club member
        userRecord = await adminAuth.createUser({
          email: normalizedEmail,
          displayName: memberData.name || normalizedEmail.split('@')[0],
          emailVerified: true,
        });
      } else {
        throw err;
      }
    }

    // 3. Link authUid to member record if missing or updated
    if (memberKey && userRecord?.uid && memberData.authUid !== userRecord.uid) {
      await adminDb.ref(`members/${memberKey}`).update({
        authUid: userRecord.uid,
      });
    }

    // 4. Generate the password reset / activation link via Firebase Admin SDK
    const rawFirebaseLink = await adminAuth.generatePasswordResetLink(normalizedEmail);
    let inAppLink = rawFirebaseLink;

    try {
      const parsedUrl = new URL(rawFirebaseLink);
      const oobCode = parsedUrl.searchParams.get('oobCode');
      const mode = parsedUrl.searchParams.get('mode') || 'resetPassword';
      if (oobCode) {
        inAppLink = `/auth/action?mode=${mode}&oobCode=${encodeURIComponent(oobCode)}`;
      }
    } catch {
      // fallback to rawFirebaseLink if URL parse fails
    }

    console.log(`[Account Activation] Generated link for member ${memberData.name} (${normalizedEmail}): ${inAppLink}`);

    await recordActivity({
      category: 'auth',
      action: 'auth:activation_requested',
      title: `Lien d'activation généré : ${memberData.name}`,
      severity: 'info',
      user: {
        isAuthenticated: false,
        userId: memberKey,
        userName: memberData.name,
        userEmail: normalizedEmail,
        role: memberData.role,
      },
      metadata: { memberKey },
    });

    return {
      success: true,
      message: 'Compte membre vérifié ! Un lien d\'activation a été généré avec succès.',
      directLink: inAppLink,
    };
  } catch (error: any) {
    console.error('Failed to process account activation:', error);
    return {
      success: false,
      message: error?.message || 'Erreur lors de la génération du lien d\'activation.',
    };
  }
}
