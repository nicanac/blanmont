'use client';

import { loginWithStatusAction, logoutAction, getCurrentSessionUserAction } from '../actions';
import type { LoginFailureReason } from '../lib/auth/login-messages';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { checkIsAdmin } from '../utils/auth';
import { User } from '../types';

/** Result of a login attempt: why it failed, so the page can show the right help. */
export type LoginResult = { ok: true } | { ok: false; reason: LoginFailureReason };

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    loginWithReason: (email: string, password: string) => Promise<LoginResult>;
    logout: () => Promise<void>;
    updateUser: (updates: Partial<User>) => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Initialize session from server HttpOnly cookie strictly
    React.useEffect(() => {
        let isMounted = true;

        async function initSession() {
            try {
                const sessionUser = await getCurrentSessionUserAction();
                if (sessionUser && isMounted) {
                    const authenticatedUser: User = {
                        id: sessionUser.id,
                        username: sessionUser.email || sessionUser.name,
                        name: sessionUser.name,
                        avatarUrl: sessionUser.photoUrl || '/images/default-avatar.png',
                        email: sessionUser.email || undefined,
                        role: sessionUser.role,
                        isAdmin: sessionUser.isAdmin,
                    };
                    setUser(authenticatedUser);
                }
            } catch (e) {
                console.warn('Could not verify server session cookie:', e);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        initSession();

        return () => {
            isMounted = false;
        };
    }, []);

    const loginWithReason = async (email: string, password: string): Promise<LoginResult> => {
        try {
            const outcome = await loginWithStatusAction(email, password);
            if (!outcome.ok) return { ok: false, reason: outcome.reason };
            const member = outcome.member;
            const newUser: User = {
                id: member.id,
                username: member.email || member.name, // Fallback to name if email missing
                name: member.name,
                avatarUrl: member.photoUrl,
                email: member.email,
                phone: member.phone,
                role: member.role
            };
            // The admin flag is decided server-side (roles + ADMIN_EMAILS env), read it back.
            try {
                const sessionUser = await getCurrentSessionUserAction();
                newUser.isAdmin = sessionUser?.isAdmin ?? false;
            } catch {
                newUser.isAdmin = false;
            }
            setUser(newUser);
            return { ok: true };
        } catch (err) {
            console.error('Login failed', err);
            return { ok: false, reason: 'unavailable' };
        }
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        return (await loginWithReason(email, password)).ok;
    };

    const logout = async () => {
        try {
            await logoutAction();
        } catch (err) {
            console.error('Logout error on server:', err);
        } finally {
            setUser(null);
        }
    };

    const updateUser = (updates: Partial<User>) => {
        setUser((prev) => {
            if (!prev) return null;
            const updated = { ...prev, ...updates };
            return updated;
        });
    };

    const isAdmin = checkIsAdmin(user);

    return (
        <AuthContext.Provider value={{
            user,
            login,
            loginWithReason,
            logout,
            updateUser,
            isAuthenticated: !!user,
            isAdmin,
            isLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function useAuthOptional(): AuthContextType | null {
    const context = useContext(AuthContext);
    return context ?? null;
}
