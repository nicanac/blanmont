import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDatabase } from '@/app/lib/firebase/admin';
import { delegatedPasswordResetError, verifySectionRequest } from '@/app/lib/auth/admin-access';
import { isOwnerEmail } from '@/app/lib/auth/session-token';
import {
  ensureMemberAccount,
  MemberAccountError,
  normalizeEmail,
  type MemberAuthRecord,
} from '@/app/lib/auth/member-account';
import { recordActivity } from '@/app/lib/logging/activityLogger';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Sets a member's password (admins, or the members section within delegated limits).
 *
 * Works for a member who never logged in: the login account is created for the directory email,
 * moved to it if the email changed, and linked (authUid). Answers the email the member must use.
 */
export async function POST(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const authCheck = await verifySectionRequest(request, 'members');
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const { id } = await context.params;
    const body = (await request.json().catch(() => null)) as { password?: unknown } | null;
    const password = typeof body?.password === 'string' ? body.password : '';

    if (password.length < 6 || password.length > 128) {
      return NextResponse.json(
        { error: 'Le mot de passe doit comporter entre 6 et 128 caractères.' },
        { status: 400 }
      );
    }

    const db = getAdminDatabase();
    const memberSnapshot = await db.ref(`members/${id}`).once('value');

    if (!memberSnapshot.exists()) {
      return NextResponse.json({ error: 'Membre introuvable.' }, { status: 404 });
    }

    const member = memberSnapshot.val() as MemberAuthRecord;
    const denial = delegatedPasswordResetError(authCheck.user, member);
    if (denial) {
      return NextResponse.json({ error: denial }, { status: 403 });
    }

    const loginEmail = normalizeEmail(member.email);
    if (!loginEmail) {
      return NextResponse.json(
        { error: "Ce membre n'a pas d'adresse email dans sa fiche : ajoutez-la d'abord, c'est son identifiant de connexion." },
        { status: 400 }
      );
    }
    // The owner's Firebase-verified email unlocks Paramètres: only the owner sets that password.
    if (isOwnerEmail(loginEmail) && normalizeEmail(authCheck.user.verifiedEmail) !== loginEmail) {
      return NextResponse.json(
        { error: 'Seul le propriétaire du site peut changer le mot de passe de ce compte.' },
        { status: 403 }
      );
    }

    let account;
    try {
      account = await ensureMemberAccount(id, member, 'admin');
    } catch (error) {
      if (error instanceof MemberAccountError && error.problem === 'linked_elsewhere') {
        const holder = error.otherMemberName ? ` (fiche de ${error.otherMemberName})` : '';
        return NextResponse.json(
          {
            error: `L'adresse ${loginEmail} sert déjà de compte de connexion à un autre membre${holder}. Une adresse email ne peut ouvrir qu'un seul compte : donnez une adresse personnelle à ce membre.`,
          },
          { status: 409 }
        );
      }
      throw error;
    }

    await getAdminAuth().updateUser(account.user.uid, { password });

    await recordActivity({
      category: 'auth',
      action: 'auth:password_set_by_admin',
      title: `Mot de passe défini par ${authCheck.user.name} pour ${member.name ?? id}`,
      severity: 'info',
      user: {
        isAuthenticated: true,
        userId: authCheck.user.id,
        userName: authCheck.user.name,
        userEmail: authCheck.user.email,
        role: authCheck.user.role,
      },
      metadata: { memberKey: id, accountCreated: account.created },
    }).catch(() => undefined);

    return NextResponse.json({ success: true, loginEmail, accountCreated: account.created });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json({ error: 'La réinitialisation a échoué. Réessayez.' }, { status: 500 });
  }
}
