'use client';

import { loginAction } from '../actions';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
    id: string;
    username: string;
    avatarUrl?: string;
    email?: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const member = await loginAction(email, password);
            if (member) {
                setUser({
                    id: member.id,
                    username: member.email || member.name, // Fallback to name if email missing
                    name: member.name,
                    avatarUrl: member.photoUrl,
                    email: member.email
                });
                return true;
            }
            return false;
        } catch (err) {
            console.error('Login failed', err);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
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
