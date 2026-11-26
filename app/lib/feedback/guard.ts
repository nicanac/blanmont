import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserFromRequest, type SessionUser } from '@/app/lib/auth/session';
import { isFeedbackReviewer } from './access';
import { isGithubConfigured } from './github';

type Guard = { ok: true; user: SessionUser } | { ok: false; response: NextResponse };

/** Gate for report routes: logged in, admin or club officer, and GitHub configured. */
export async function requireReviewer(request: NextRequest): Promise<Guard> {
  const user = await getSessionUserFromRequest(request);
  if (!user) {
    return { ok: false, response: NextResponse.json({ error: 'Connexion requise.' }, { status: 401 }) };
  }
  if (!isFeedbackReviewer(user)) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Réservé aux responsables et administrateurs.' }, { status: 403 }),
    };
  }
  if (!(await isGithubConfigured())) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Jeton GitHub manquant : un administrateur doit l’ajouter dans Paramètres.' }, { status: 503 }),
    };
  }
  return { ok: true, user };
}
