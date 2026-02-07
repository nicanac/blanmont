'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { updateProfilePhotoAction } from '../actions';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../lib/canvasUtils';
import { PageHero } from '../components/ui/PageHero';
import { UserCircleIcon } from '@heroicons/react/20/solid';

// Helper function to read file as Data URL
const readFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => resolve(reader.result as string), false);
        reader.readAsDataURL(file);
    });
};

export default function ProfilePage() {
    const { user, isAuthenticated, updateUser } = useAuth();
    const router = useRouter();
    const [isEditingPhoto, setIsEditingPhoto] = useState(false);

    // Cropper State
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const imageDataUrl = await readFile(file);
            setImageSrc(imageDataUrl);
            setIsEditingPhoto(true);
        }
    };

    const handleSave = async () => {
        try {
            if (imageSrc && croppedAreaPixels && user) {
                const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
                if (croppedBlob) {
                    const formData = new FormData();
                    formData.append('file', croppedBlob, 'profile.jpg');
                    formData.append('memberId', user.id);

                    const newUrl = await updateProfilePhotoAction(formData);

                    if (newUrl) {
                        updateUser({ avatarUrl: newUrl });
                    }

                    // Reset
                    setIsEditingPhoto(false);
                    setImageSrc(null);
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleCancel = () => {
        setIsEditingPhoto(false);
        setImageSrc(null);
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
        <main className="min-h-screen bg-gray-50">
            <PageHero
                title="Mon Profil"
                description="Gérez vos informations personnelles et votre compte membre."
                badge="Espace Membre"
                badgeIcon={<UserCircleIcon className="h-4 w-4" />}
                variant="red"
                size="md"
            />
            <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
                {/* Product Image / User Avatar */}
                <div className="lg:max-w-lg lg:self-end">
                    <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200 relative group">
                        <img
                            src={user.avatarUrl || "/images/default-avatar.svg"}
                            alt={user.name}
                            className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <label className="bg-black/50 text-white px-4 py-2 rounded-md backdrop-blur-sm hover:bg-black/70 cursor-pointer">
                                Change Photo
                                <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Cropper Modal */}
                {isEditingPhoto && imageSrc && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                        <div className="bg-white rounded-lg overflow-hidden w-full max-w-md">
                            <div className="relative h-96 w-full bg-gray-900">
                                <Cropper
                                    image={imageSrc}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    onCropChange={setCrop}
                                    onCropComplete={onCropComplete}
                                    onZoomChange={setZoom}
                                />
                            </div>
                            <div className="p-4 flex flex-col gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">Zoom</span>
                                    <input
                                        type="range"
                                        value={zoom}
                                        min={1}
                                        max={3}
                                        step={0.1}
                                        aria-labelledby="Zoom"
                                        onChange={(e) => setZoom(Number(e.target.value))}
                                        className="w-full"
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={handleCancel}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-4 py-2 bg-brand-primary text-white hover:opacity-90 rounded-md"
                                    >
                                        Save & Upload
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


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
                        <div className="flex w-full items-center justify-center rounded-md border border-transparent bg-brand-primary px-8 py-3 text-base font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 cursor-pointer transition-colors shadow-sm">
                            Modifier mes informations
                        </div>
                        {/* Hidden ID for debugging if needed, but removed from view as requested by user */}
                    </form>
                </div>
            </div>
        </main>
    );
}
