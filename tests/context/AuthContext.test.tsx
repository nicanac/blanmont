/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '@/app/context/AuthContext';
import * as actions from '@/app/actions';

// Mock server actions
vi.mock('@/app/actions', () => ({
  loginAction: vi.fn(),
  logoutAction: vi.fn(),
  getCurrentSessionUserAction: vi.fn(),
}));

describe('AuthContext & AuthProvider', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('throws an error if useAuth is called outside of AuthProvider', () => {
    // Suppress console.error from React boundary
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within an AuthProvider'
    );
    spy.mockRestore();
  });

  it('initializes with null user when no active session cookie exists', async () => {
    vi.mocked(actions.getCurrentSessionUserAction).mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isAdmin).toBe(false);
  });

  it('hydrates user from active server session cookie', async () => {
    vi.mocked(actions.getCurrentSessionUserAction).mockResolvedValue({
      id: 'member-10',
      email: 'president@blanmont.be',
      name: 'Nicolas Bruyere',
      role: ['President', 'Admin'],
      isAdmin: true,
      iat: 12345,
      exp: 67890,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.user?.name).toBe('Nicolas Bruyere');
  });

  it('handles login successfully and updates user state', async () => {
    vi.mocked(actions.getCurrentSessionUserAction).mockResolvedValue(null);
    vi.mocked(actions.loginAction).mockResolvedValue({
      id: 'member-25',
      email: 'cycliste@blanmont.be',
      name: 'Laurent Cycliste',
      role: 'Member',
      photoUrl: 'https://example.com/avatar.jpg',
    } as any);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let success = false;
    await act(async () => {
      success = await result.current.login('cycliste@blanmont.be', 'password123');
    });

    expect(success).toBe(true);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.id).toBe('member-25');
    expect(result.current.user?.name).toBe('Laurent Cycliste');
    expect(result.current.isAdmin).toBe(false);
  });

  it('handles login failure gracefully', async () => {
    vi.mocked(actions.getCurrentSessionUserAction).mockResolvedValue(null);
    vi.mocked(actions.loginAction).mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let success = true;
    await act(async () => {
      success = await result.current.login('bad@blanmont.be', 'wrongpassword');
    });

    expect(success).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('handles logout and clears user state', async () => {
    vi.mocked(actions.getCurrentSessionUserAction).mockResolvedValue({
      id: 'member-10',
      email: 'member@blanmont.be',
      name: 'Member Test',
      role: ['Member'],
      isAdmin: false,
      iat: 12345,
      exp: 67890,
    });
    vi.mocked(actions.logoutAction).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(actions.logoutAction).toHaveBeenCalledTimes(1);
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('updates user profile via updateUser', async () => {
    vi.mocked(actions.getCurrentSessionUserAction).mockResolvedValue({
      id: 'member-10',
      email: 'member@blanmont.be',
      name: 'Old Name',
      role: ['Member'],
      isAdmin: false,
      iat: 12345,
      exp: 67890,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user?.name).toBe('Old Name');
    });

    act(() => {
      result.current.updateUser({ name: 'New Name', phone: '+32470123456' });
    });

    expect(result.current.user?.name).toBe('New Name');
    expect(result.current.user?.phone).toBe('+32470123456');
  });
});
