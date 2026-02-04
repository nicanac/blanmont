'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { getFirebaseAuth, sendPasswordResetEmail } from '../../lib/firebase/client';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { FirebaseError } from 'firebase/app';

export default function ForgotPasswordPage(): React.ReactElement {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setMessage(null);
        setIsSubmitting(true);

        try {
            const auth = getFirebaseAuth();
            await sendPasswordResetEmail(auth, email);
            setMessage({
                type: 'success',
                text: 'Un email de réinitialisation vous a été envoyé. Vérifiez votre boîte de réception.'
            });
            setEmail('');
        } catch (error: unknown) {
            console.error(error);
            let errorMsg = 'Une erreur est survenue.';
            
            if (error instanceof FirebaseError || (typeof error === 'object' && error !== null && 'code' in error)) {
                const errorCode = (error as { code: string }).code;
                if (errorCode === 'auth/user-not-found') {
                    errorMsg = 'Aucun compte associé à cet email.';
                } else if (errorCode === 'auth/invalid-email') {
                    errorMsg = 'Email invalide.';
                }
            }
            setMessage({
                type: 'error',
                text: errorMsg
            });
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="flex min-h-[80vh] flex-col justify-center px-6 py-12 lg:px-8 bg-white">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/login" className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6">
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Retour à la connexion
                </Link>

                <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 mb-4">
                    Récupération de compte
                </h2>
                <p className="text-center text-gray-600 mb-8">
                    Entrez votre adresse email pour recevoir un lien de réinitialisation.
                </p>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {message && (
                        <div className={`rounded-2xl p-4 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium">{message.text}</h3>
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
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@example.com"
                                className="block w-full rounded-lg border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex w-full justify-center rounded-lg bg-brand-primary px-3 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Envoi en cours...' : 'Envoyer le lien'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
