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
        <div className="bg-white py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:mx-0">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl text-brand-primary">Mon Compte</h2>
                    <p className="mt-2 text-lg leading-8 text-gray-600">
                        Gérez vos informations personnelles.
                    </p>
                </div>

                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
                    <div className="grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-3">
                        {/* Profile Card */}
                        <div className="bg-gray-50 rounded-2xl p-8 lg:col-span-1 border border-gray-100 shadow-sm flex flex-col items-center text-center">
                            <img
                                className="h-32 w-32 rounded-full ring-4 ring-white shadow-md mb-6 object-cover"
                                src={user.avatarUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                                alt={user.name}
                            />
                            <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
                            <p className="text-sm text-gray-500 mb-4">{user.username}</p>

                            {/* Roles */}
                            <div className="flex flex-wrap gap-2 justify-center">
                                {/* We don't have roles in the basic user object in AuthContext yet directly populated, 
                                    but assuming it might serve as a placeholder or needs update in AuthContext to carry roles.
                                    For now using a static Member badge or logic if roles were present. 
                                    Actually AuthContext user does not have 'roles' property in the interface defined in AuthContext.tsx lines 6-12.
                                    The full Member type has it. 
                                    I will disable roles display for now to avoid TS error until AuthContext is updated, 
                                    or just display "Membre" generic.
                                */}
                                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                    Membre
                                </span>
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="bg-white rounded-2xl p-8 lg:col-span-2 border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-semibold leading-7 text-gray-900 border-b border-gray-100 pb-4 mb-6">Informations Personnelles</h3>

                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium leading-6 text-gray-500">Nom complet</dt>
                                    <dd className="mt-1 text-sm leading-6 text-gray-900 sm:col-span-2 sm:mt-0">{user.name}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium leading-6 text-gray-500">Email</dt>
                                    <dd className="mt-1 text-sm leading-6 text-gray-900 sm:col-span-2 sm:mt-0">{user.email}</dd>
                                </div>
                                <div className="sm:col-span-2">
                                    <dt className="text-sm font-medium leading-6 text-gray-500">Identifiant</dt>
                                    <dd className="mt-1 text-sm leading-6 text-gray-900 sm:col-span-2 sm:mt-0">{user.id}</dd>
                                </div>
                            </dl>

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <p className="text-sm text-gray-500 italic">
                                    Pour modifier ces informations, veuillez contacter un administrateur du club.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
