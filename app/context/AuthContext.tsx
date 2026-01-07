'use client';

import { loginAction } from '../actions';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { logger } from '../lib/logger';

interface User {
    id: string;
    username: string;
    avatarUrl?: string;
    email?: string;
    name: string;
    phone?: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    // Initialize from localStorage
    React.useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                logger.error('Failed to parse user from storage');
            }
        }
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const member = await loginAction(email, password);
            if (member) {
                const newUser = {
                    id: member.id,
                    username: member.email || member.name, // Fallback to name if email missing
                    name: member.name,
                    avatarUrl: member.photoUrl,
                    email: member.email,
                    phone: member.phone
                };
                setUser(newUser);
                localStorage.setItem('user', JSON.stringify(newUser));
                return true;
            }
            return false;
        } catch (err) {
            logger.error('Login failed', err);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const updateUser = (updates: Partial<User>) => {
        setUser((prev) => {
            if (!prev) return null;
            const updated = { ...prev, ...updates };
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            updateUser,
            isAuthenticated: !!user
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
