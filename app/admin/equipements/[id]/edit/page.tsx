'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowLeftIcon,
    CheckIcon,
    CloudArrowUpIcon,
    PhotoIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { JerseyIcon } from '@/app/components/ui/CyclingIcons';
import { Equipment } from '../../../../types/equipment';
import { EQUIPMENT_DATA, EQUIPMENT_CATEGORIES } from '../../../../data/equipment';
import { useImageUpload } from '@/app/hooks/useImageUpload';
import { Spinner } from '@/app/components/ui/Spinner';

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'S/M', 'L/XL', 'Unique'];

export default function EditEquipmentPage() {
    const params = useParams();
    const router = useRouter();
    // Safely handle params.id which can be string or string[]
    const id = (Array.isArray(params?.id) ? params.id[0] : params?.id) || '';
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { uploadImage, isUploading, progress, error: uploadError } = useImageUpload();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    // Form state
    const [formData, setFormData] = useState<Partial<Equipment>>({
        name: '',
        category: 'Maillot',
        description: '',
        price: 0,
        sizes: [],
        stock: {},
        imageUrl: '',
        isAvailable: true,
        gobikReference: '',
        productCode: '',
    });

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                // Try to fetch from API first
                const response = await fetch(`/api/admin/equipements/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setFormData({
                        name: data.name || '',
                        category: data.category || 'Maillot',
                        description: data.description || '',
                        price: data.price || 0,
                        sizes: data.sizes ? [...data.sizes] : [],
                        stock: data.stock ? { ...data.stock } : {},
                        imageUrl: data.imageUrl || '',
                        isAvailable: data.isAvailable ?? true,
                        gobikReference: data.gobikReference || '',
                        productCode: data.productCode || '',
                    });
                } else {
                    // Fallback to local data
                    const found = EQUIPMENT_DATA.find(e => e.id === id);
                    if (found) {
                        setFormData({
                            name: found.name,
                            category: found.category,
                            description: found.description,
                            price: found.price,
                            sizes: [...found.sizes],
                            stock: { ...found.stock },
                            imageUrl: found.imageUrl,
                            isAvailable: found.isAvailable,
                            gobikReference: found.gobikReference || '',
                            productCode: found.productCode || '',
                        });
                    }
                }
            } catch (err) {
                // Fallback to local data on error
                const found = EQUIPMENT_DATA.find(e => e.id === params.id);
                if (found) {
                    setFormData({
                        name: found.name,
                        category: found.category,
                        description: found.description,
                        price: found.price,
                        sizes: [...found.sizes],
                        stock: { ...found.stock },
                        imageUrl: found.imageUrl,
                        isAvailable: found.isAvailable,
                        gobikReference: found.gobikReference || '',
                        productCode: found.productCode || '',
                    });
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchEquipment();
    }, [id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: (e.target as HTMLInputElement).checked,
            }));
        } else if (type === 'number') {
            setFormData(prev => ({
                ...prev,
                [name]: parseFloat(value) || 0,
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSizeToggle = (size: string) => {
        setFormData(prev => {
            const currentSizes = prev.sizes || [];
            const isSelected = currentSizes.includes(size);

            if (isSelected) {
                const newSizes = currentSizes.filter(s => s !== size);
                const newStock = { ...prev.stock };
                delete newStock[size];
                return { ...prev, sizes: newSizes, stock: newStock };
            } else {
                return {
                    ...prev,
                    sizes: [...currentSizes, size],
                    stock: { ...prev.stock, [size]: 0 },
                };
            }
        });
    };

    const handleStockChange = (size: string, value: string) => {
        const numValue = parseInt(value) || 0;
        setFormData(prev => ({
            ...prev,
            stock: { ...prev.stock, [size]: numValue },
        }));
    };

    const handleImageUpload = async (file: File) => {
        try {
            const date = new Date().toISOString().split('T')[0];
            const filename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const path = `equipment/uploads/${date}-${filename}`;

            const url = await uploadImage(file, path);
            setFormData(prev => ({ ...prev, imageUrl: url }));
        } catch (err: any) {
            console.error('Error uploading image:', err);
            setError(`Erreur lors du téléchargement: ${err.message || err}`);
        }
    };

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            await handleImageUpload(e.target.files[0]);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await handleImageUpload(e.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, imageUrl: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            const response = await fetch(`/api/admin/equipements/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/admin/equipements');
                    router.refresh();
                }, 1500);
            } else {
                const data = await response.json();
                setError(data.error || 'Erreur lors de la sauvegarde');
            }
        } catch (err) {
            setError('Erreur lors de la sauvegarde. Veuillez réessayer.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Spinner size="md" />
            </div>
        );
    }

    if (!formData.name && !isLoading) {
        return (
            <div className="rounded-xl bg-white dark:bg-night-2 p-12 text-center shadow-sm border border-line dark:border-night-line">
                <JerseyIcon className="mx-auto h-16 w-16 text-gray-300 dark:text-ink-3" />
                <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Équipement non trouvé</h2>
                <p className="mt-2 text-gray-500 dark:text-snow-3">L&apos;équipement demandé n&apos;existe pas.</p>
                <Link
                    href="/admin/equipements"
                    className="mt-6 inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-white hover:bg-brand-strong transition-colors duration-150"
                >
                    <ArrowLeftIcon className="h-4 w-4" />
                    Retour à la liste
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/equipements"
                    className="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-150"
                >
                    <ArrowLeftIcon className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Modifier l&apos;équipement</h1>
                    <p className="text-sm text-gray-500">{formData.name}</p>
                </div>
            </div>

            {/* Success Message */}
            {success && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-4 flex items-center gap-3">
                    <CheckIcon className="h-5 w-5 text-green-600" />
                    <p className="text-green-800">Équipement modifié avec succès! Redirection...</p>
                </div>
            )}

            {/* Error Message */}
            {(error || uploadError) && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                    <p className="text-red-800">{error || uploadError}</p>
                </div>
            )}

            {/* Form with Grid Layout */}
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                    {/* Left Column - Image Upload (Sticky) */}
                    <div className="xl:col-span-4">
                        <div className="xl:sticky xl:top-6">
                            <div className="rounded-lg border border-line dark:border-night-line bg-white dark:bg-night-2 p-6 shadow-xs">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Image du produit</h2>

                                {/* Hidden file input */}
                                <input
                                     id="equipment-image-file"
                                     ref={fileInputRef}
                                     type="file"
                                     accept="image/*"
                                     aria-label="Téléverser une image du produit"
                                     onChange={handleImageSelect}
                                     className="hidden"
                                />

                                {/* Image Preview / Upload Zone */}
                                <div
                                    onClick={() => !formData.imageUrl && fileInputRef.current?.click()}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-200 ${formData.imageUrl
                                        ? 'bg-paper dark:bg-ink'
                                        : isDragOver
                                             ? 'bg-red-50 dark:bg-red-950/20 border border-dashed border-brand cursor-pointer'
                                             : 'bg-paper dark:bg-ink border border-dashed border-line dark:border-ink-2 cursor-pointer hover:border-brand hover:bg-red-50/20 transition-colors duration-150'
                                        }`}
                                >
                                    {formData.imageUrl ? (
                                        <>
                                            <Image
                                                src={formData.imageUrl}
                                                alt={formData.name || 'Product'}
                                                fill
                                                className="object-cover"
                                            />
                                            {/* Remove button */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeImage();
                                                }}
                                                className="absolute top-3 right-3 rounded-full bg-brand p-1.5 text-white shadow-lg hover:bg-brand-strong transition-colors duration-150"
                                            >
                                                <XMarkIcon className="h-4 w-4" />
                                            </button>
                                        </>
                                    ) : isUploading ? (
                                        <div className="flex flex-col items-center justify-center h-full p-6">
                                            <div className="w-12 h-12 rounded-full border-2 border-brand/20 border-t-brand animate-spin mb-4"></div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-snow-3">Upload en cours...</p>
                                            <div className="w-full max-w-[200px] mt-3 h-1.5 bg-line dark:bg-night-line rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-brand transition-all duration-200"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                            <p className="mt-2 text-xs text-gray-500 dark:text-ink-3">{progress}%</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                                            <CloudArrowUpIcon className={`h-16 w-16 mb-4 transition-colors duration-150 ${isDragOver ? 'text-brand' : 'text-gray-300 dark:text-ink-3'}`} />
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                {isDragOver ? 'Déposez l\'image ici' : 'Glissez une image ici'}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-ink-3 mb-4">ou cliquez pour sélectionner</p>
                                            <span className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-strong transition-colors duration-150">
                                                <PhotoIcon className="h-4 w-4" />
                                                Choisir une image
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Change Image Button (when image exists) */}
                                {formData.imageUrl && !isUploading && (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="mt-4 w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-ink px-4 py-2 text-sm font-medium text-gray-700 dark:text-snow hover:bg-paper dark:hover:bg-night-3 transition-colors duration-150"
                                    >
                                        Changer l&apos;image
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Form Fields */}
                    <div className="xl:col-span-8 space-y-6">
                        {/* Basic Info Card */}
                        <div className="rounded-lg border border-line dark:border-night-line bg-white dark:bg-night-2 p-6 shadow-xs">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations générales</h2>
                            <div className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Nom du produit *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        value={formData.name || ''}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-night text-ink dark:text-snow px-4 py-2.5 focus:border-brand focus:outline-hidden focus:ring-1 focus:ring-brand transition-colors duration-150"
                                        placeholder="Nom du produit"
                                    />
                                </div>

                                {/* Category & Price */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Catégorie *
                                        </label>
                                        <select
                                            id="category"
                                            name="category"
                                            required
                                            value={formData.category || 'Maillot'}
                                            onChange={handleInputChange}
                                            className="w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-night text-ink dark:text-snow px-4 py-2.5 focus:border-brand focus:outline-hidden focus:ring-1 focus:ring-brand transition-colors duration-150"
                                        >
                                            {EQUIPMENT_CATEGORIES.filter(c => c !== 'Tous').map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="price" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Prix (€) *
                                        </label>
                                        <input
                                            type="number"
                                            id="price"
                                            name="price"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={formData.price || ''}
                                            onChange={handleInputChange}
                                            className="w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-night text-ink dark:text-snow px-4 py-2.5 focus:border-brand focus:outline-hidden focus:ring-1 focus:ring-brand transition-colors duration-150"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                {/* Product Code & GOBIK Reference */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="productCode" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Code produit
                                        </label>
                                        <input
                                            type="text"
                                            id="productCode"
                                            name="productCode"
                                            value={formData.productCode || ''}
                                            onChange={handleInputChange}
                                            className="w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-night text-ink dark:text-snow px-4 py-2.5 focus:border-brand focus:outline-hidden focus:ring-1 focus:ring-brand transition-colors duration-150"
                                            placeholder="Ex: MaiCXPRO"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="gobikReference" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Référence GOBIK
                                        </label>
                                        <input
                                            type="text"
                                            id="gobikReference"
                                            name="gobikReference"
                                            value={formData.gobikReference || ''}
                                            onChange={handleInputChange}
                                            className="w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-night text-ink dark:text-snow px-4 py-2.5 focus:border-brand focus:outline-hidden focus:ring-1 focus:ring-brand transition-colors duration-150"
                                            placeholder="Ex: SHORT SLEEVE JERSEY CX PRO"
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={3}
                                        value={formData.description || ''}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-night text-ink dark:text-snow px-4 py-2.5 focus:border-brand focus:outline-hidden focus:ring-1 focus:ring-brand transition-colors duration-150 resize-none"
                                        placeholder="Description du produit"
                                    />
                                </div>

                                {/* Availability Toggle */}
                                <div className="flex items-center justify-between rounded-lg bg-paper dark:bg-ink border border-line dark:border-night-line p-4">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Disponibilité</p>
                                        <p className="text-sm text-gray-500 dark:text-ink-3">Produit disponible à la commande</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, isAvailable: !prev.isAvailable }))}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-150 ${formData.isAvailable ? 'bg-brand' : 'bg-gray-300 dark:bg-night-line'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-150 ${formData.isAvailable ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Sizes & Stock Card */}
                        <div className="rounded-lg border border-line dark:border-night-line bg-white dark:bg-night-2 p-6 shadow-xs">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tailles et Stock</h2>

                            {/* Size Selection */}
                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Tailles disponibles
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {SIZE_OPTIONS.map(size => (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => handleSizeToggle(size)}
                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ${formData.sizes?.includes(size)
                                                ? 'bg-brand text-white shadow-xs'
                                                : 'bg-paper dark:bg-ink border border-line dark:border-night-line text-gray-700 dark:text-snow-3 hover:border-line-strong'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Stock per Size */}
                            {formData.sizes && formData.sizes.length > 0 && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Stock par taille
                                    </label>
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                                        {formData.sizes.map(size => (
                                            <div
                                                key={size}
                                                className="flex items-center gap-2 rounded-md bg-paper dark:bg-ink border border-line dark:border-night-line px-3 py-2"
                                            >
                                                <label htmlFor={`stock-${size}`} className="text-sm font-semibold text-gray-700 dark:text-snow min-w-[2rem] cursor-pointer">{size}</label>
                                                <input
                                                    id={`stock-${size}`}
                                                    type="number"
                                                    value={formData.stock?.[size] || 0}
                                                    onChange={(e) => handleStockChange(size, e.target.value)}
                                                    min="0"
                                                    aria-label={`Stock taille ${size}`}
                                                    className="w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-night text-ink dark:text-snow px-2 py-1 text-sm text-center focus:border-brand focus:outline-hidden focus:ring-1 focus:ring-brand transition-colors duration-150"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3">
                            <Link
                                href="/admin/equipements"
                                className="rounded-md border border-line dark:border-night-line bg-white dark:bg-night-2 px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-snow hover:bg-paper dark:hover:bg-night-3 transition-colors duration-150"
                            >
                                Annuler
                            </Link>
                            <button
                                type="submit"
                                disabled={isSaving || isUploading}
                                className="rounded-md bg-brand px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-strong disabled:opacity-50 transition-colors duration-150"
                            >
                                {isSaving ? 'Enregistrement...' : isUploading ? 'Upload en cours...' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
