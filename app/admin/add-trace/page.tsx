'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AddTraceForm from '../../components/admin/AddTraceForm';
import { useAuth } from '../../context/AuthContext';

export default function AddTracePage() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
        // Optionally render a loading state or nothing while redirecting
        return null;
    }

    if (!isAuthenticated) return null; // Will redirect

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">Ajouter un Parcours</h1>
                    <p className="mt-2 text-gray-600">
                        Ajoutez manuellement un parcours à la base de données Notion.
                        Connecté en tant que <span className="font-semibold">{user?.name}</span>.
                    </p>
                </div>
                <AddTraceForm />
            </div>
        </div>
    );
}
