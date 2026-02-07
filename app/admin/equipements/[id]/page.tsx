'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowLeftIcon,
    PencilIcon,
    ShoppingBagIcon,
    CheckCircleIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';
import { Equipment } from '../../../types/equipment';
import { EQUIPMENT_DATA } from '../../../data/equipment';

export default function ViewEquipmentPage() {
    const params = useParams();
    const router = useRouter();
    // Safely handle params.id which can be string or string[]
    const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
    const [equipment, setEquipment] = useState<Equipment | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEquipment = async () => {
            setIsLoading(true);
            try {
                // Try to fetch from API first (which has its own fallback to mock data)
                const response = await fetch(`/api/admin/equipements/${id}`);

                if (response.ok) {
                    const data = await response.json();
                    setEquipment(data);
                } else {
                    // If API returns 404/500, fallback to local mock data
                    console.warn('API error, using fallback data');
                    const found = EQUIPMENT_DATA.find(e => e.id === id);
                    setEquipment(found || null);
                }
            } catch (error) {
                console.error('Network error, using fallback data:', error);
                const found = EQUIPMENT_DATA.find(e => e.id === params.id);
                setEquipment(found || null);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchEquipment();
        }
    }, [id]);

    const getTotalStock = (stock: Record<string, number>) => {
        return Object.values(stock).reduce((a, b) => a + b, 0);
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!equipment) {
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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/equipements"
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{equipment.name}</h1>
                        <p className="text-sm text-gray-500">Détails de l&apos;équipement</p>
                    </div>
                </div>
                <Link
                    href={`/admin/equipements/${equipment.id}/edit`}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
                >
                    <PencilIcon className="h-4 w-4" />
                    Modifier
                </Link>
            </div>

            {/* Content */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Image */}
                <div className="lg:col-span-1">
                    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
                            {equipment.imageUrl ? (
                                <Image
                                    src={equipment.imageUrl}
                                    alt={equipment.name}
                                    width={400}
                                    height={400}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                    <ShoppingBagIcon className="h-24 w-24 text-gray-300" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Main Info */}
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h2>
                        <dl className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Catégorie</dt>
                                <dd className="mt-1">
                                    <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
                                        {equipment.category}
                                    </span>
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Prix</dt>
                                <dd className="mt-1 text-2xl font-bold text-gray-900">{equipment.price.toFixed(2)} €</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Statut</dt>
                                <dd className="mt-1">
                                    {equipment.isAvailable ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                                            <CheckCircleIcon className="h-4 w-4" />
                                            Disponible
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                                            <XCircleIcon className="h-4 w-4" />
                                            Indisponible
                                        </span>
                                    )}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Stock total</dt>
                                <dd className="mt-1 text-2xl font-bold text-gray-900">{getTotalStock(equipment.stock)} pièces</dd>
                            </div>
                            {equipment.productCode && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Code produit</dt>
                                    <dd className="mt-1 font-mono text-sm text-gray-900">{equipment.productCode}</dd>
                                </div>
                            )}
                            {equipment.gobikReference && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Référence GOBIK</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{equipment.gobikReference}</dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {/* Description */}
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
                        <p className="text-gray-600 leading-relaxed">{equipment.description}</p>
                    </div>

                    {/* Stock by Size */}
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock par taille</h2>
                        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                            {equipment.sizes.map((size) => (
                                <div
                                    key={size}
                                    className={`rounded-lg p-3 text-center ${equipment.stock[size] > 0
                                        ? 'bg-green-50 border border-green-200'
                                        : 'bg-red-50 border border-red-200'
                                        }`}
                                >
                                    <p className="text-sm font-medium text-gray-900">{size}</p>
                                    <p className={`text-lg font-bold ${equipment.stock[size] > 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {equipment.stock[size] || 0}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
