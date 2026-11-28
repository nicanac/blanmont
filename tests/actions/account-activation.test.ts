import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { requestAccountActivationAction } from '@/app/actions';
import * as passwordEmail from '@/app/lib/auth/password-email';
import * as activityLogger from '@/app/lib/logging/activityLogger';
import { fakeAdminAuth, fakeMembersDb } from '../lib/fake-firebase';

const MEMBERS = {
  member_1: { name: 'Nicolas Bruyere', email: 'bruyere.nicolas@gmail.com', role: ['Admin'], authUid: 'uid-admin-1' },
  member_2: { name: 'Laurent Cycliste', email: ' Laurent@Blanmont.be ', role: ['Member'] },
};

describe('requestAccountActivationAction', () => {
  let send: ReturnType<typeof vi.spyOn>;
  let record: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    send = vi.spyOn(passwordEmail, 'sendPasswordSetupEmail').mockResolvedValue({ sent: true, continueUrl: null });
    record = vi.spyOn(activityLogger, 'recordActivity').mockResolvedValue('log_1');
  });
  afterEach(() => vi.unstubAllEnvs());

  it('rejects invalid email formats', async () => {
    const { api } = fakeAdminAuth();
    fakeMembersDb(MEMBERS);
    const res = await requestAccountActivationAction('invalid-email-address');
    expect(res.success).toBe(false);
    expect(res.message).toContain('email');
    expect(api.createUser).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it('answers an unknown email exactly like a member, without provisioning or emailing (no enumeration)', async () => {
    const { api } = fakeAdminAuth([{ uid: 'uid-admin-1', email: 'bruyere.nicolas@gmail.com', emailVerified: true }]);
    fakeMembersDb(MEMBERS);
    const unknown = await requestAccountActivationAction('stranger@external.com');
    const member = await requestAccountActivationAction('bruyere.nicolas@gmail.com');

    expect(unknown).toEqual(member);
    expect(unknown.success).toBe(true);
    expect(unknown.message).toContain("Si cette adresse est enregistrée dans l'annuaire du club");
    expect(api.createUser).not.toHaveBeenCalled();
    // Only the member got an email
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith('bruyere.nicolas@gmail.com', null);
  });

  it('creates and links the account of a member who never logged in, then emails the link from the server', async () => {
    const { api } = fakeAdminAuth();
    const db = fakeMembersDb(MEMBERS);

    const res = await requestAccountActivationAction('laurent@blanmont.be');

    expect(res).toEqual({ success: true, message: expect.stringContaining('spams') });
    // The link never reaches the caller: Firebase emails it to the address owner
    expect(JSON.stringify(res)).not.toMatch(/oobCode|https?:|\/auth\/action/);
    expect(api.createUser).toHaveBeenCalledWith({
      email: 'laurent@blanmont.be',
      displayName: 'Laurent Cycliste',
      emailVerified: true,
    });
    expect(db.members.member_2.authUid).toBe('uid-new-1');
    expect(send).toHaveBeenCalledWith('laurent@blanmont.be', null);
  });

  it('does not duplicate an existing account', async () => {
    const { api } = fakeAdminAuth([{ uid: 'uid-admin-1', email: 'bruyere.nicolas@gmail.com', emailVerified: true }]);
    const db = fakeMembersDb(MEMBERS);

    const res = await requestAccountActivationAction('Bruyere.Nicolas@gmail.com ');

    expect(res.success).toBe(true);
    expect(api.createUser).not.toHaveBeenCalled();
    expect(db.update).not.toHaveBeenCalled();
    expect(send).toHaveBeenCalledWith('bruyere.nicolas@gmail.com', null);
  });

  it('gives the new directory email its own account when an admin changed it (never moves an account)', async () => {
    const { api, users } = fakeAdminAuth([{ uid: 'uid-admin-1', email: 'old-address@gmail.com', emailVerified: true }]);
    const db = fakeMembersDb(MEMBERS);

    const res = await requestAccountActivationAction('bruyere.nicolas@gmail.com');

    expect(res.success).toBe(true);
    expect(users.get('uid-admin-1')?.email).toBe('old-address@gmail.com');
    expect(api.createUser).toHaveBeenCalledWith(expect.objectContaining({ email: 'bruyere.nicolas@gmail.com', emailVerified: true }));
    expect(db.members.member_1.authUid).toBe('uid-new-1');
    expect(send).toHaveBeenCalledWith('bruyere.nicolas@gmail.com', null);
  });

  it("never re-points the site owner's record to another address", async () => {
    vi.stubEnv('OWNER_EMAILS', 'owner@blanmont.be');
    const { api } = fakeAdminAuth([{ uid: 'uid-admin-1', email: 'owner@blanmont.be', emailVerified: true }]);
    const db = fakeMembersDb(MEMBERS); // an admin changed the owner's record email to bruyere.nicolas@gmail.com

    const res = await requestAccountActivationAction('bruyere.nicolas@gmail.com');

    expect(res.success).toBe(false);
    expect(api.createUser).not.toHaveBeenCalled();
    expect(db.members.member_1.authUid).toBe('uid-admin-1');
    expect(send).not.toHaveBeenCalled();
  });

  it('replaces an unverified account made outside the site (public API) instead of adopting it', async () => {
    const { api, users } = fakeAdminAuth([{ uid: 'uid-self-made', email: 'laurent@blanmont.be', emailVerified: false }]);
    const db = fakeMembersDb(MEMBERS);

    const res = await requestAccountActivationAction('laurent@blanmont.be');

    expect(res.success).toBe(true);
    expect(api.deleteUser).toHaveBeenCalledWith('uid-self-made');
    expect(users.has('uid-self-made')).toBe(false);
    expect(db.members.member_2.authUid).toBe('uid-new-1');
    expect(send).toHaveBeenCalledWith('laurent@blanmont.be', null);
  });

  it('says so when Firebase cannot send the email, and logs it', async () => {
    fakeAdminAuth([{ uid: 'uid-admin-1', email: 'bruyere.nicolas@gmail.com', emailVerified: true }]);
    fakeMembersDb(MEMBERS);
    send.mockResolvedValueOnce({ sent: false, reason: 'failed', code: 'INTERNAL' });

    const res = await requestAccountActivationAction('bruyere.nicolas@gmail.com');

    expect(res.success).toBe(false);
    expect(res.message).toMatch(/n'a pas pu être envoyé/);
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'auth:activation_email_failed',
        severity: 'error',
        metadata: expect.objectContaining({ firebaseCode: 'INTERNAL' }),
      })
    );
  });

  it('answers a rate-limited request like any other (an email just left; no member enumeration)', async () => {
    fakeAdminAuth([{ uid: 'uid-admin-1', email: 'bruyere.nicolas@gmail.com', emailVerified: true }]);
    fakeMembersDb(MEMBERS);
    send.mockResolvedValueOnce({ sent: false, reason: 'rate_limited', code: 'RESET_PASSWORD_EXCEED_LIMIT' });

    const limited = await requestAccountActivationAction('bruyere.nicolas@gmail.com');
    const stranger = await requestAccountActivationAction('stranger@external.com');

    expect(limited).toEqual(stranger);
    expect(record).toHaveBeenCalledWith(expect.objectContaining({ action: 'auth:activation_rate_limited' }));
  });

  it('never leaks an internal error text', async () => {
    fakeAdminAuth().api.getUserByEmail.mockRejectedValueOnce(new Error('PERMISSION_DENIED: secret internals'));
    fakeMembersDb(MEMBERS);

    const res = await requestAccountActivationAction('bruyere.nicolas@gmail.com');

    expect(res.success).toBe(false);
    expect(res.message).not.toMatch(/PERMISSION|internals/);
  });
});
