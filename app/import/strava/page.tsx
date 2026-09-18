import { getStravaAuthLink, fetchStravaActivityAction } from './actions';
import { cookies } from 'next/headers';
import ImportForm from './ImportForm'; // Client component

export default async function StravaImportPage() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('strava_access_token');

    // If not connected
    if (!accessToken) {
        const authLink = await getStravaAuthLink();
        return (
            <div className="min-h-screen bg-[#faf8f5] dark:bg-[#0a0c10] flex flex-col justify-center items-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-[#161922] border border-[#e4e0d8] dark:border-[#262b38] p-8 rounded-lg shadow text-center">
                    <h1 className="text-2xl font-bold mb-4 text-[#fc4c02]">Connexion à Strava</h1>
                    <p className="text-[#3a3f4a] dark:text-[#d1d5db] mb-6 text-sm">
                        Pour importer vos sorties, vous devez associer votre compte Strava.
                    </p>
                    <a
                        href={authLink}
                        className="inline-block bg-[#fc4c02] text-white px-6 py-3 rounded-md font-semibold hover:bg-[#e34402] transition-colors text-sm"
                    >
                        Se connecter avec Strava
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#faf8f5] dark:bg-[#0a0c10] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white dark:bg-[#161922] border border-[#e4e0d8] dark:border-[#262b38] shadow sm:rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 border-b border-[#e4e0d8] dark:border-[#262b38]">
                        <h3 className="text-lg leading-6 font-medium text-[#101216] dark:text-[#f5f6f8]">Importer depuis Strava</h3>
                        <p className="mt-1 text-sm text-[#5c6370] dark:text-[#a7adbb]">Collez l&apos;URL d&apos;une activité pour créer un nouveau parcours.</p>
                    </div>
                    <div className="p-6">
                        <ImportForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
