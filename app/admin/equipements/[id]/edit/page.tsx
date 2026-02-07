'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowLeftIcon,
    ShoppingBagIcon,
    CheckIcon,
    CloudArrowUpIcon,
    PhotoIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { Equipment } from '../../../../types/equipment';
import { EQUIPMENT_DATA, EQUIPMENT_CATEGORIES } from '../../../../data/equipment';
import { useImageUpload } from '@/app/hooks/useImageUpload';

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
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
            </div>
        );
    }

    if (!formData.name && !isLoading) {
        return (
            <div className="rounded-xl bg-white p-12 text-center shadow-sm">
                <ShoppingBagIcon className="mx-auto h-16 w-16 text-gray-300" />
                <h2 className="mt-4 text-lg font-semibold text-gray-900">Équipement non trouvé</h2>
                <p className="mt-2 text-gray-500">L&apos;équipement demandé n&apos;existe pas.</p>
                <Link
                    href="/admin/equipements"
                    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
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
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
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
                            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Image du produit</h2>

                                {/* Hidden file input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />

                                {/* Image Preview / Upload Zone */}
                                <div
                                    onClick={() => !formData.imageUrl && fileInputRef.current?.click()}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-200 ${formData.imageUrl
                                        ? 'bg-gray-50'
                                        : isDragOver
                                            ? 'bg-red-50 border-2 border-dashed border-red-400 cursor-pointer'
                                            : 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 cursor-pointer hover:border-red-400 hover:bg-red-50/30'
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
                                                className="absolute top-3 right-3 rounded-full bg-red-600 p-1.5 text-white shadow-lg hover:bg-red-700 transition-colors"
                                            >
                                                <XMarkIcon className="h-4 w-4" />
                                            </button>
                                        </>
                                    ) : isUploading ? (
                                        <div className="flex flex-col items-center justify-center h-full p-6">
                                            <div className="w-16 h-16 rounded-full border-4 border-red-200 border-t-red-600 animate-spin mb-4"></div>
                                            <p className="text-sm font-medium text-gray-600">Upload en cours...</p>
                                            <div className="w-full max-w-[200px] mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-red-600 transition-all duration-300"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                            <p className="mt-2 text-xs text-gray-500">{progress}%</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                                            <CloudArrowUpIcon className={`h-16 w-16 mb-4 transition-colors ${isDragOver ? 'text-red-500' : 'text-gray-300'}`} />
                                            <p className="text-sm font-medium text-gray-700 mb-1">
                                                {isDragOver ? 'Déposez l\'image ici' : 'Glissez une image ici'}
                                            </p>
                                            <p className="text-xs text-gray-500 mb-4">ou cliquez pour sélectionner</p>
                                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors">
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
                                        className="mt-4 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
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
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h2>
                            <div className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
                                        Nom du produit *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        value={formData.name || ''}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                                        placeholder="Nom du produit"
                                    />
                                </div>

                                {/* Category & Price */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-gray-700">
                                            Catégorie *
                                        </label>
                                        <select
                                            id="category"
                                            name="category"
                                            required
                                            value={formData.category || 'Maillot'}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                                        >
                                            {EQUIPMENT_CATEGORIES.filter(c => c !== 'Tous').map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="price" className="mb-1.5 block text-sm font-medium text-gray-700">
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
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                {/* Product Code & GOBIK Reference */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="productCode" className="mb-1.5 block text-sm font-medium text-gray-700">
                                            Code produit
                                        </label>
                                        <input
                                            type="text"
                                            id="productCode"
                                            name="productCode"
                                            value={formData.productCode || ''}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                                            placeholder="Ex: MaiCXPRO"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="gobikReference" className="mb-1.5 block text-sm font-medium text-gray-700">
                                            Référence GOBIK
                                        </label>
                                        <input
                                            type="text"
                                            id="gobikReference"
                                            name="gobikReference"
                                            value={formData.gobikReference || ''}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                                            placeholder="Ex: SHORT SLEEVE JERSEY CX PRO"
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-gray-700">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={3}
                                        value={formData.description || ''}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all resize-none"
                                        placeholder="Description du produit"
                                    />
                                </div>

                                {/* Availability Toggle */}
                                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                                    <div>
                                        <p className="font-medium text-gray-900">Disponibilité</p>
                                        <p className="text-sm text-gray-500">Produit disponible à la commande</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, isAvailable: !prev.isAvailable }))}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isAvailable ? 'bg-red-600' : 'bg-gray-300'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isAvailable ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Sizes & Stock Card */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tailles et Stock</h2>

                            {/* Size Selection */}
                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Tailles disponibles
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {SIZE_OPTIONS.map(size => (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => handleSizeToggle(size)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${formData.sizes?.includes(size)
                                                ? 'bg-red-600 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Stock par taille
                                    </label>
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                                        {formData.sizes.map(size => (
                                            <div
                                                key={size}
                                                className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2"
                                            >
                                                <span className="text-sm font-semibold text-gray-700 min-w-[2rem]">{size}</span>
                                                <input
                                                    type="number"
                                                    value={formData.stock?.[size] || 0}
                                                    onChange={(e) => handleStockChange(size, e.target.value)}
                                                    min="0"
                                                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm text-center focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
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
                                className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Annuler
                            </Link>
                            <button
                                type="submit"
                                disabled={isSaving || isUploading}
                                className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
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
