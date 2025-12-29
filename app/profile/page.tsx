'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated || !user) {
        return null; // Or a loading spinner
    }

    return (
        <div className="bg-white">
            <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
                {/* Product Image / User Avatar */}
                <div className="lg:max-w-lg lg:self-end">
                    <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200">
                        <img
                            src={user.avatarUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=500&h=500&q=80"}
                            alt={user.name}
                            className="h-full w-full object-cover object-center"
                        />
                    </div>
                </div>

                {/* Product Info / User Details */}
                <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">{user.name}</h1>

                    <div className="mt-3">
                        <h2 className="sr-only">Type de compte</h2>
                        <p className="text-3xl tracking-tight text-gray-900">Membre</p>
                    </div>

                    {/* Reviews / Status */}
                    <div className="mt-3">
                        <h3 className="sr-only">Statut</h3>
                        <div className="flex items-center">
                            <div className="flex items-center">
                                {/* Active Stars (Visual Flourish) */}
                                {[0, 1, 2, 3, 4].map((rating) => (
                                    <svg
                                        key={rating}
                                        className="h-5 w-5 flex-shrink-0 text-brand-primary"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                ))}
                            </div>
                            <p className="sr-only">5 out of 5 stars</p>
                            <span className="ml-3 text-sm font-medium text-brand-primary hover:text-brand-secondary cursor-pointer">
                                Compte Vérifié
                            </span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="sr-only">Description</h3>
                        <div className="space-y-6 text-base text-gray-700">
                            <p>
                                Bienvenue sur votre profil membre du Blanmont Cycling Club.
                                Ici, vous pouvez retrouver les informations liées à votre adhésion.
                                Votre profil est actif et vous permet de participer aux sorties et aux votes.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="flex items-center">
                            <h4 className="text-sm font-medium text-gray-900">Email : </h4>
                            <span className="ml-2 text-sm text-gray-500">{user.email}</span>
                        </div>
                        <div className="flex items-center mt-2">
                            <h4 className="text-sm font-medium text-gray-900">Identifiant : </h4>
                            <span className="ml-2 text-sm text-gray-500 font-mono">{user.id}</span>
                        </div>
                    </div>

                    <form className="mt-10">
                        {/* Fake Actions */}
                        <div className="flex w-full items-center justify-center rounded-md border border-transparent bg-brand-primary px-8 py-3 text-base font-medium text-white hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 cursor-pointer transition-colors">
                            Modifier mes informations
                        </div>
                        <p className="mt-4 text-center text-sm text-gray-500">
                            Pour des raisons de sécurité, veuillez contacter un administrateur pour changer votre email ou mot de passe.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
