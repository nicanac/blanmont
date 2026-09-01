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
                const response = await fetch('/api/equipements');
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
        <div className="min-h-screen bg-[#faf8f5]">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-[#0a0c10] border-b border-white/10 py-14 sm:py-20">
                <div className="pointer-events-none absolute -top-24 right-0 w-96 h-96 bg-[#e03e3e]/20 rounded-full blur-[120px]"></div>
                <div className="pointer-events-none absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-[100px]"></div>

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl">
                        <h1 className="text-balance text-white text-[clamp(2rem,5vw,3.5rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.98]">
                            Équipement Club
                        </h1>
                        <p className="mt-5 max-w-[65ch] text-[#a7adbb] text-base sm:text-lg leading-relaxed">
                            Portez les couleurs de Blanmont avec fierté. Découvrez notre collection d&apos;équipements cyclistes conçus pour la performance et le confort.
                        </p>
                        <div className="mt-7 flex flex-wrap items-center gap-4">
                            <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.08em] bg-[#e03e3e]/10 text-[#e03e3e] border border-[#e03e3e]/30">
                                <SparklesIcon className="h-3.5 w-3.5" />
                                Collection 2026
                            </div>
                            <span className="text-xs text-[#a7adbb]/70 flex items-center gap-1.5">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#10b981]"></span>
                                Commandes par email · Retrait aux sorties du samedi
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#e03e3e] border-t-transparent"></div>
                    </div>
                ) : (
                    <>
                        {/* Category Filters */}
                        <div className="mb-10">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-[#5c6370]">Filtrer par :</span>
                                    <div className="flex flex-wrap gap-2">
                                        {EQUIPMENT_CATEGORIES.map((category) => (
                                            <button
                                                key={category}
                                                onClick={() => setSelectedCategory(category)}
                                                className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ${selectedCategory === category
                                                    ? 'bg-gradient-to-r from-red-600 to-[#e03e3e] text-white shadow-md shadow-red-500/25 scale-105'
                                                    : 'bg-white text-[#3a3f4a] hover:bg-[#f2efe9] hover:text-[#e03e3e] border border-[#e4e0d8] hover:border-red-200'
                                                    }`}
                                            >
                                                {category}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm text-[#5c6370] tabular-nums">
                                    {filteredEquipment.length} article{filteredEquipment.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>

                        {/* Products Grid */}
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredEquipment.map((item, index) => (
                                <article
                                    key={item.id}
                                    className="group relative overflow-hidden rounded-md bg-white shadow-xs border border-[#e4e0d8] transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-1"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    {/* Product Image */}
                                    <div className="relative aspect-4/5 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <ShoppingBagIcon className="h-20 w-20 text-slate-300" />
                                        </div>
                                        {item.imageUrl && (
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.name}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        )}

                                        {/* Overlay on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

                                        {/* Quick View Button */}
                                        <button
                                            onClick={() => openProductDetail(item)}
                                            className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 rounded-full bg-white px-6 py-2.5 text-xs font-bold text-[#101216] shadow-lg hover:bg-[#e03e3e] hover:text-white"
                                        >
                                            Voir les détails
                                        </button>

                                        {/* Category Badge */}
                                        <div className="absolute top-4 left-4">
                                            <span className="inline-flex rounded-full bg-white/90 backdrop-blur-xs px-3 py-1 text-xs font-semibold text-[#101216] shadow-xs">
                                                {item.category}
                                            </span>
                                        </div>

                                        {/* Availability Badge */}
                                        {!item.isAvailable && (
                                            <div className="absolute top-4 right-4">
                                                <span className="inline-flex rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
                                                    Épuisé
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-6">
                                        <h3 className="text-lg font-bold text-[#101216] group-hover:text-[#e03e3e] transition-colors leading-snug">
                                            {item.name}
                                        </h3>
                                        <p className="mt-2 text-sm text-[#3a3f4a] line-clamp-2 leading-relaxed">
                                            {item.description}
                                        </p>

                                        <div className="mt-4 flex items-end justify-between pt-2 border-t border-[#efece5]">
                                            <div>
                                                <p className="text-2xl font-extrabold text-[#101216] tabular-nums">
                                                    {item.price.toFixed(2)}&nbsp;€
                                                </p>
                                                <p className="text-xs text-[#5c6370] mt-0.5">
                                                    Tailles : {item.sizes.join(', ')}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => openProductDetail(item)}
                                                className="rounded-full bg-[#e03e3e] p-2.5 text-white transition-all hover:bg-[#c93434] hover:scale-105 active:scale-95 shadow-xs"
                                                aria-label={`Acheter ${item.name}`}
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
                            <div className="rounded-md bg-white p-16 text-center shadow-sm border border-[#efece5]">
                                <ShoppingBagIcon className="mx-auto h-16 w-16 text-gray-300" />
                                <h3 className="mt-4 text-lg font-semibold text-[#101216]">
                                    Aucun équipement disponible
                                </h3>
                                <p className="mt-2 text-[#5c6370]">
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
                        <section className="mt-16 rounded-md bg-gradient-to-br from-gray-900 to-gray-800 p-8 md:p-12 text-white">
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
                        <div className="relative w-full max-w-4xl overflow-hidden rounded-md bg-white shadow-2xl">
                            <button
                                onClick={closeModal}
                                className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-[#5c6370] shadow-lg hover:bg-white hover:text-[#101216] transition-colors"
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
                                        <h2 className="mt-4 text-2xl font-bold text-[#101216]">
                                            {selectedProduct.name}
                                        </h2>
                                        <p className="mt-4 text-[#3a3f4a] leading-relaxed">
                                            {selectedProduct.description}
                                        </p>

                                        <div className="mt-6">
                                            <p className="text-3xl font-bold text-[#101216]">
                                                {selectedProduct.price.toFixed(2)} €
                                            </p>
                                        </div>

                                        {/* Size Selection */}
                                        <div className="mt-6">
                                            <h4 className="text-sm font-medium text-[#101216]">Taille</h4>
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
                                                                    ? 'border-[#e4e0d8] bg-white text-[#101216] hover:border-red-300'
                                                                    : 'border-[#efece5] bg-[#f2efe9] text-gray-300 cursor-not-allowed line-through'
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
                                                : 'bg-[#f2efe9] text-gray-400 cursor-not-allowed'
                                                }`}
                                            onClick={(e) => !selectedSize && e.preventDefault()}
                                        >
                                            <ShoppingBagIcon className="h-5 w-5" />
                                            {selectedSize ? 'Commander par email' : 'Sélectionnez une taille'}
                                        </Link>
                                        <p className="text-center text-xs text-[#5c6370]">
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
