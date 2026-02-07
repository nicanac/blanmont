'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    ShoppingBagIcon,
    FunnelIcon,
    XMarkIcon,
    ChevronDownIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';
import { Equipment } from '../../../types/equipment';
import { EQUIPMENT_CATEGORIES } from '../../../data/equipment';

export default function EquipementPage() {
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('Tous');
    const [selectedProduct, setSelectedProduct] = useState<Equipment | null>(null);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [showFilters, setShowFilters] = useState(false);
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

    // Filter equipment by category
    const filteredEquipment = equipment.filter(
        (item) => selectedCategory === 'Tous' || item.category === selectedCategory
    );

    // Check if size is in stock
    const isInStock = (item: Equipment, size: string) => {
        return (item.stock[size] || 0) > 0;
    };

    // Open product detail modal
    const openProductDetail = (product: Equipment) => {
        setSelectedProduct(product);
        setSelectedSize('');
    };

    // Close modal
    const closeModal = () => {
        setSelectedProduct(null);
        setSelectedSize('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-700 to-red-800 py-20">
                <div className="absolute inset-0 bg-[url('/images/pattern-dots.svg')] opacity-10"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-red-900/30 to-transparent rounded-full blur-2xl"></div>

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm text-white/90 mb-6">
                            <SparklesIcon className="h-4 w-4" />
                            Collection 2026
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                            Équipement Club
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg text-red-100">
                            Portez les couleurs de Blanmont avec fierté. Découvrez notre collection d&apos;équipements
                            cyclistes conçus pour la performance et le confort.
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                    </div>
                ) : (
                    <>
                        {/* Category Filters */}
                        <div className="mb-10">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-500">Filtrer par:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {EQUIPMENT_CATEGORIES.map((category) => (
                                            <button
                                                key={category}
                                                onClick={() => setSelectedCategory(category)}
                                                className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${selectedCategory === category
                                                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25 scale-105'
                                                    : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-red-600 border border-gray-200 hover:border-red-200'
                                                    }`}
                                            >
                                                {category}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500">
                                    {filteredEquipment.length} article{filteredEquipment.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>

                        {/* Products Grid */}
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredEquipment.map((item, index) => (
                                <article
                                    key={item.id}
                                    className="group relative overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-1"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    {/* Product Image */}
                                    <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <ShoppingBagIcon className="h-20 w-20 text-gray-300" />
                                        </div>
                                        {item.imageUrl && (
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.name}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        )}

                                        {/* Overlay on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

                                        {/* Quick View Button */}
                                        <button
                                            onClick={() => openProductDetail(item)}
                                            className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-gray-900 shadow-lg hover:bg-red-600 hover:text-white"
                                        >
                                            Voir les détails
                                        </button>

                                        {/* Category Badge */}
                                        <div className="absolute top-4 left-4">
                                            <span className="inline-flex rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
                                                {item.category}
                                            </span>
                                        </div>

                                        {/* Availability Badge */}
                                        {!item.isAvailable && (
                                            <div className="absolute top-4 right-4">
                                                <span className="inline-flex rounded-full bg-red-500 px-3 py-1 text-xs font-medium text-white">
                                                    Épuisé
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                                            {item.name}
                                        </h3>
                                        <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                                            {item.description}
                                        </p>

                                        <div className="mt-4 flex items-end justify-between">
                                            <div>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {item.price.toFixed(2)} €
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    Tailles: {item.sizes.join(', ')}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => openProductDetail(item)}
                                                className="rounded-lg bg-red-600 p-2.5 text-white transition-all hover:bg-red-700 hover:scale-105 active:scale-95"
                                            >
                                                <ShoppingBagIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* Empty State */}
                        {filteredEquipment.length === 0 && (
                            <div className="rounded-2xl bg-white p-16 text-center shadow-sm border border-gray-100">
                                <ShoppingBagIcon className="mx-auto h-16 w-16 text-gray-300" />
                                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                                    Aucun équipement disponible
                                </h3>
                                <p className="mt-2 text-gray-500">
                                    Aucun article ne correspond à cette catégorie pour le moment.
                                </p>
                                <button
                                    onClick={() => setSelectedCategory('Tous')}
                                    className="mt-6 inline-flex items-center rounded-full bg-red-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                                >
                                    Voir tous les articles
                                </button>
                            </div>
                        )}

                        {/* Info Section */}
                        <section className="mt-16 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 md:p-12 text-white">
                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 rounded-xl bg-red-600/20 p-3">
                                        <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Qualité Premium</h3>
                                        <p className="mt-1 text-sm text-gray-400">
                                            Tissus techniques haute performance pour un confort optimal.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 rounded-xl bg-red-600/20 p-3">
                                        <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Retrait au Club</h3>
                                        <p className="mt-1 text-sm text-gray-400">
                                            Récupérez vos commandes lors des sorties du samedi.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 rounded-xl bg-red-600/20 p-3">
                                        <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Support</h3>
                                        <p className="mt-1 text-sm text-gray-400">
                                            Contactez-nous pour toute question sur les tailles.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </div>

            {/* Product Detail Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                            onClick={closeModal}
                        ></div>

                        {/* Modal Content */}
                        <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                            <button
                                onClick={closeModal}
                                className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-gray-500 shadow-lg hover:bg-white hover:text-gray-900 transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>

                            <div className="grid md:grid-cols-2">
                                {/* Image Section */}
                                <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <ShoppingBagIcon className="h-24 w-24 text-gray-300" />
                                    </div>
                                    {selectedProduct.imageUrl && (
                                        <Image
                                            src={selectedProduct.imageUrl}
                                            alt={selectedProduct.name}
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                </div>

                                {/* Details Section */}
                                <div className="flex flex-col p-8">
                                    <div className="flex-1">
                                        <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                                            {selectedProduct.category}
                                        </span>
                                        <h2 className="mt-4 text-2xl font-bold text-gray-900">
                                            {selectedProduct.name}
                                        </h2>
                                        <p className="mt-4 text-gray-600 leading-relaxed">
                                            {selectedProduct.description}
                                        </p>

                                        <div className="mt-6">
                                            <p className="text-3xl font-bold text-gray-900">
                                                {selectedProduct.price.toFixed(2)} €
                                            </p>
                                        </div>

                                        {/* Size Selection */}
                                        <div className="mt-6">
                                            <h4 className="text-sm font-medium text-gray-900">Taille</h4>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {selectedProduct.sizes.map((size) => {
                                                    const inStock = isInStock(selectedProduct, size);
                                                    return (
                                                        <button
                                                            key={size}
                                                            onClick={() => inStock && setSelectedSize(size)}
                                                            disabled={!inStock}
                                                            className={`min-w-[3rem] rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all ${selectedSize === size
                                                                ? 'border-red-600 bg-red-600 text-white'
                                                                : inStock
                                                                    ? 'border-gray-200 bg-white text-gray-900 hover:border-red-300'
                                                                    : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through'
                                                                }`}
                                                        >
                                                            {size}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {selectedSize && (
                                                <p className="mt-2 text-sm text-green-600">
                                                    ✓ {selectedProduct.stock[selectedSize]} en stock
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-8 space-y-3">
                                        <Link
                                            href={`mailto:info@blanmont.be?subject=Commande équipement: ${selectedProduct.name}&body=Bonjour,%0A%0AJe souhaite commander:%0A- ${selectedProduct.name}%0A- Taille: ${selectedSize || '[À préciser]'}%0A- Prix: ${selectedProduct.price.toFixed(2)} €%0A%0AMerci!`}
                                            className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-semibold transition-all duration-300 ${selectedSize
                                                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                            onClick={(e) => !selectedSize && e.preventDefault()}
                                        >
                                            <ShoppingBagIcon className="h-5 w-5" />
                                            {selectedSize ? 'Commander par email' : 'Sélectionnez une taille'}
                                        </Link>
                                        <p className="text-center text-xs text-gray-500">
                                            Les commandes sont traitées par email. Paiement et retrait lors des sorties club.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
