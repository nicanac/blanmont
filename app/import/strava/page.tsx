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
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
                <div className="max-w-md w-full bg-white p-8 rounded-lg shadow text-center">
                    <h1 className="text-2xl font-bold mb-4 text-[#fc4c02]">Connect to Strava</h1>
                    <p className="text-gray-600 mb-6">
                        To import your activities, you need to connect your Strava account.
                    </p>
                    <a
                        href={authLink}
                        className="inline-block bg-[#fc4c02] text-white px-6 py-3 rounded-md font-semibold hover:bg-[#e34402] transition-colors"
                    >
                        Connect with Strava
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Import from Strava</h3>
                        <p className="mt-1 text-sm text-gray-500">Paste an activity URL to create a new Trace.</p>
                    </div>
                    <div className="p-6">
                        <ImportForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
