/**
 * Why a password login failed, and the French message shown on the login page.
 * Client-safe (no Firebase or server import).
 */
export type LoginFailureReason =
  | 'invalid_credentials'
  | 'too_many_attempts'
  | 'account_disabled'
  | 'not_linked'
  | 'unavailable';

export const LOGIN_FAILURE_MESSAGES: Record<LoginFailureReason, string> = {
  invalid_credentials:
    "Email ou mot de passe incorrect. Utilisez l'adresse email enregistrée au club. Pas encore de mot de passe, ou oublié ? Choisissez « 1ère connexion » : vous recevrez un lien par email.",
  too_many_attempts:
    'Trop de tentatives : par sécurité, ce compte est bloqué quelques minutes. Réessayez plus tard, ou choisissez « 1ère connexion » pour recevoir un lien et définir un nouveau mot de passe tout de suite.',
  account_disabled: 'Ce compte de connexion est désactivé. Contactez un responsable du club.',
  not_linked:
    "Votre mot de passe est correct, mais ce compte n'est relié à aucune fiche membre du club. Contactez un responsable du club.",
  unavailable: 'La connexion est impossible pour le moment. Réessayez dans quelques instants.',
};

/** Maps a Firebase Auth error code (e.g. `auth/too-many-requests`) to a login failure reason. */
export function loginFailureFromFirebaseCode(code: string | undefined): LoginFailureReason {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
    case 'auth/missing-password':
      return 'invalid_credentials';
    case 'auth/too-many-requests':
      return 'too_many_attempts';
    case 'auth/user-disabled':
      return 'account_disabled';
    default:
      return 'unavailable';
  }
}
