'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (username.length > 0 && password.length > 0) {
            const success = await login(username, password);
            if (success) {
                router.push('/');
            } else {
                setError('Nom d\'utilisateur ou mot de passe incorrect.');
            }
        } else {
            setError('Veuillez entrer un nom d\'utilisateur et un mot de passe.');
        }
    };

    return (
        <div className="flex min-h-[80vh] flex-col justify-center px-6 py-12 lg:px-8 bg-white">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* Optional: Add Logo or Heading here if needed, but design implies minimal look */}
                <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 mb-10">
                    Se connecter
                </h2>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-2xl bg-red-50 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-bold leading-6 text-gray-900 ml-1">
                            Email
                        </label>
                        <div className="mt-2">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="example@example.com"
                                className="block w-full rounded-lg border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="mt-2">
                            <div className="flex items-center justify-between mb-2">
                                <label htmlFor="password" className="block text-sm font-bold leading-6 text-gray-900 ml-1">
                                    Mot de passe
                                </label>
                                <div className="text-sm">
                                    <a href="#" className="font-medium text-brand-primary hover:text-red-700">
                                        Mot de passe oublié ?
                                    </a>
                                </div>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full rounded-lg border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-lg bg-brand-primary px-3 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                        >
                            Continuer
                        </button>
                    </div>
                </form>

                <p className="mt-8 text-center text-sm text-gray-500">
                    Nouveau membre ?{' '}
                    <a href="/register" className="font-medium text-brand-primary hover:text-red-700 underline decoration-1 underline-offset-2">
                        Créer un compte
                    </a>
                </p>
            </div>
        </div>
    );
}
