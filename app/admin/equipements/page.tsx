'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    MagnifyingGlassIcon,
    ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import { Equipment } from '../../types/equipment';

import { EQUIPMENT_CATEGORIES } from '../../data/equipment';

export default function AdminEquipementsPage() {
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tous');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                const response = await fetch('/api/admin/equipements');
                if (response.ok) {
                    const data = await response.json();
                    setEquipment(data);
                }
            } catch (error) {
                console.error('Failed to fetch equipment', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEquipment();
    }, []);

    // Filter equipment based on search and category
    const filteredEquipment = equipment.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Tous' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Calculate total stock for an item
    const getTotalStock = (stock: Record<string, number>) => {
        return Object.values(stock).reduce((sum, qty) => sum + qty, 0);
    };

    // Delete equipment
    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet équipement ?')) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/admin/equipements/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setEquipment((prev) => prev.filter((item) => item.id !== id));
            } else {
                alert('Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Error deleting equipment:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des Équipements</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Gérez les équipements du club disponibles à la vente
                    </p>
                </div>
                <Link
                    href="/admin/equipements/new"
                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-red-700 transition-colors"
                >
                    <PlusIcon className="h-5 w-5" />
                    Ajouter un équipement
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher un équipement..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                    {EQUIPMENT_CATEGORIES.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${selectedCategory === category
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Total Équipements</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{equipment.length}</p>
                </div>
                <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Disponibles</p>
                    <p className="mt-1 text-2xl font-bold text-green-600">
                        {equipment.filter((e) => e.isAvailable).length}
                    </p>
                </div>
                <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Stock Total</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                        {equipment.reduce((sum, e) => sum + getTotalStock(e.stock), 0)} pièces
                    </p>
                </div>
                <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Valeur Stock</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                        {equipment.reduce((sum, e) => sum + e.price * getTotalStock(e.stock), 0).toLocaleString('fr-FR')} €
                    </p>
                </div>
            </div>

            {/* Equipment Table */}
            <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Équipement
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Catégorie
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Prix
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Stock
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Statut
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {filteredEquipment.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                {item.imageUrl ? (
                                                    <Image
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        width={48}
                                                        height={48}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                        <ShoppingBagIcon className="h-6 w-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{item.name}</p>
                                                <p className="text-sm text-gray-500 line-clamp-1 max-w-xs">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                        {item.price.toFixed(2)} €
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="text-sm">
                                            <span className="font-medium text-gray-900">
                                                {getTotalStock(item.stock)}
                                            </span>
                                            <span className="text-gray-500"> pièces</span>
                                        </div>
                                        <div className="mt-1 flex flex-wrap gap-1">
                                            {item.sizes.slice(0, 4).map((size) => (
                                                <span
                                                    key={size}
                                                    className={`inline-flex rounded px-1.5 py-0.5 text-xs ${item.stock[size] > 0
                                                        ? 'bg-green-50 text-green-700'
                                                        : 'bg-red-50 text-red-700'
                                                        }`}
                                                >
                                                    {size}: {item.stock[size] || 0}
                                                </span>
                                            ))}
                                            {item.sizes.length > 4 && (
                                                <span className="text-xs text-gray-400">+{item.sizes.length - 4}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${item.isAvailable
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {item.isAvailable ? 'Disponible' : 'Indisponible'}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/equipements/${item.id}`}
                                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                                                title="Voir"
                                            >
                                                <EyeIcon className="h-5 w-5" />
                                            </Link>
                                            <Link
                                                href={`/admin/equipements/${item.id}/edit`}
                                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                                                title="Modifier"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-colors"
                                                title="Supprimer"
                                                disabled={isLoading}
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredEquipment.length === 0 && (
                    <div className="px-6 py-12 text-center">
                        <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-300" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun équipement</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm || selectedCategory !== 'Tous'
                                ? 'Aucun équipement ne correspond à votre recherche.'
                                : 'Commencez par ajouter un équipement.'}
                        </p>
                        {!searchTerm && selectedCategory === 'Tous' && (
                            <Link
                                href="/admin/equipements/new"
                                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                            >
                                <PlusIcon className="h-4 w-4" />
                                Ajouter un équipement
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}


