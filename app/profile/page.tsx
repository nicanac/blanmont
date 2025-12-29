'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { updateProfilePhotoAction } from '../actions';

export default function ProfilePage() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [isEditingPhoto, setIsEditingPhoto] = useState(false);
    const [photoUrl, setPhotoUrl] = useState('');

    const handlePhotoUpdate = async () => {
        if (user && photoUrl) {
            await updateProfilePhotoAction(user.id, photoUrl);
            setIsEditingPhoto(false);
            // Ideally we reload context or force refresh to see change
            window.location.reload();
        }
    };

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated || !user) {
        return null; // Or a loading spinner
    }

    // Simple name splitting logic
    const nameParts = user.name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    return (
        <div className="bg-white">
            <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
                {/* Product Image / User Avatar */}
                <div className="lg:max-w-lg lg:self-end">
                    <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200 relative group">
                        <img
                            src={user.avatarUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=500&h=500&q=80"}
                            alt={user.name}
                            className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => setIsEditingPhoto(!isEditingPhoto)}
                                className="bg-black/50 text-white px-4 py-2 rounded-md backdrop-blur-sm hover:bg-black/70"
                            >
                                Change Photo
                            </button>
                        </div>
                    </div>

                    {isEditingPhoto && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={photoUrl}
                                    onChange={(e) => setPhotoUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                />
                                <button
                                    onClick={handlePhotoUpdate}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm"
                                >
                                    Save
                                </button>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">Paste a direct link to a publicly accessible image.</p>
                        </div>
                    )}
                </div>

                {/* Product Info / User Details */}
                <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">{firstName}</h1>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">{lastName}</h2>

                    <div className="mt-3">
                        <h3 className="sr-only">Type de compte</h3>
                        <p className="text-3xl tracking-tight text-brand-primary">Membre</p>
                    </div>

                    <div className="mt-6">
                        <h3 className="sr-only">Description</h3>
                        <div className="space-y-6 text-base text-gray-700">
                            <p>
                                Bienvenue sur votre profil membre du Blanmont Cycling Club.
                                Ici, vous pouvez retrouver les informations liées à votre adhésion.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 border-t border-gray-100 pt-6">
                        <div className="flex items-center justify-between py-2 border-b border-gray-50">
                            <h4 className="text-sm font-medium text-gray-900">Email</h4>
                            <span className="ml-2 text-sm text-gray-500">{user.email}</span>
                        </div>
                        {user.phone && (
                            <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                <h4 className="text-sm font-medium text-gray-900">Mobile</h4>
                                <span className="ml-2 text-sm text-gray-500">{user.phone}</span>
                            </div>
                        )}
                    </div>

                    <form className="mt-10">
                        {/* Fake Actions */}
                        <div className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer transition-colors shadow-sm">
                            Modifier mes informations
                        </div>
                        {/* Hidden ID for debugging if needed, but removed from view as requested by user */}
                    </form>
                </div>
            </div>
        </div>
    );
}
