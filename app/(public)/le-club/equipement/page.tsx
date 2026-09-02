'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBagIcon,
  XMarkIcon,
  SparklesIcon,
  ShieldCheckIcon,
  TruckIcon,
  ArrowRightIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { Equipment } from '../../../types/equipment';
import { EQUIPMENT_CATEGORIES, EQUIPMENT_DATA } from '../../../data/equipment';
import EquipmentIllustration from './EquipmentIllustration';

export default function EquipementPage() {
  const [equipment, setEquipment] = useState<Equipment[]>(EQUIPMENT_DATA);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedProduct, setSelectedProduct] = useState<Equipment | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await fetch('/api/equipements');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setEquipment(data);
          }
        }
      } catch (error) {
        console.warn('Using default equipment data fallback', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEquipment();
  }, []);

  const filteredEquipment = equipment.filter((item) => {
    if (selectedCategory === 'Tous') return true;
    if (selectedCategory === 'Short') return item.category === 'Short' || item.category === 'Collant';
    return item.category === selectedCategory;
  });

  const handleImageError = (id: string) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  const openProductDetail = (product: Equipment) => {
    setSelectedProduct(product);
    setSelectedSize(product.sizes[2] || product.sizes[0] || 'M');
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setSelectedSize('');
  };

  const totalPieces = equipment.length;
  const categoriesCount = EQUIPMENT_CATEGORIES.length - 1;

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      {/* ──── Editorial Cover Hero (Ink) ──── */}
      <section className="relative overflow-hidden bg-[#0a0c10] text-white border-b border-[#262b38]">
        {/* Ambient red glow */}
        <div className="pointer-events-none absolute -top-40 -right-24 h-[500px] w-[500px] rounded-full bg-[#e03e3e]/15 blur-[140px]" />

        <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20 sm:pb-12 lg:px-8">
          {/* Top row: Title */}
          <div className="space-y-4 max-w-3xl pb-10 border-b border-white/10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#f5f6f8]">
              <span className="h-2 w-2 rounded-full bg-[#e03e3e] animate-pulse" />
              Collection 2026 · GOBIK Custom Wear
            </div>

            <h1 className="text-[clamp(2.25rem,6vw,4.25rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-balance">
              Tenues &amp; <span className="text-[#e03e3e] italic">Équipements</span>
            </h1>

            <p className="max-w-2xl text-base text-[#a7adbb] leading-relaxed">
              Portez les couleurs officielles du CC Saint-Martin Blanmont. Vêtements cyclistes haute performance développés par Gobik pour le confort et la vitesse en peloton.
            </p>
          </div>

          {/* Telemetry ribbon on Ink */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
            {/* Pieces in collection */}
            <div className="rounded-lg border border-white/15 bg-[#161922]/90 backdrop-blur-md p-5 flex items-start gap-4 shadow-xl">
              <div className="rounded-md bg-[#e03e3e]/15 border border-[#e03e3e]/30 p-2.5 text-[#e03e3e] shrink-0 mt-0.5">
                <SparklesIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#e03e3e]">
                  Catalogue Officiel
                </span>
                <div className="mt-1 text-sm font-bold text-white tabular-nums">
                  {totalPieces} articles disponibles
                </div>
                <p className="mt-1 text-xs text-[#a7adbb]">
                  Maillots, cuissards, vestes &amp; collants
                </p>
              </div>
            </div>

            {/* Technical partner */}
            <div className="rounded-lg border border-white/15 bg-[#161922]/90 backdrop-blur-md p-5 flex items-start gap-4 shadow-xl">
              <div className="rounded-md bg-white/5 border border-white/10 p-2.5 text-[#f5f6f8] shrink-0 mt-0.5">
                <ShieldCheckIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7d8493]">
                  Partenaire Technique
                </span>
                <div className="mt-1 text-sm font-bold text-white">
                  GOBIK Spain Custom
                </div>
                <p className="mt-1 text-xs text-[#a7adbb]">
                  Peaux de chamois K10/K9 &amp; textiles italiens
                </p>
              </div>
            </div>

            {/* Pickup & orders */}
            <div className="rounded-lg border border-white/15 bg-[#161922]/90 backdrop-blur-md p-5 flex items-start gap-4 shadow-xl">
              <div className="rounded-md bg-white/5 border border-white/10 p-2.5 text-[#f5f6f8] shrink-0 mt-0.5">
                <TruckIcon className="h-5 w-5 text-sky-400" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7d8493]">
                  Commandes &amp; Retrait
                </span>
                <div className="mt-1 text-sm font-bold text-white">
                  Distribution au Club
                </div>
                <p className="mt-1 text-xs text-[#a7adbb]">
                  Paiement &amp; remise lors des sorties du samedi
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Main Content Spread (Paper) ──── */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 space-y-10">
        {/* Category Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 rounded-lg border border-[#e4e0d8] bg-white shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7d8493]">
            <CheckBadgeIcon className="h-4 w-4 text-[#e03e3e]" />
            <span>Catégories :</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {EQUIPMENT_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#101216] text-white'
                    : 'bg-[#f2efe9] text-[#5c6370] hover:bg-[#e4e0d8] hover:text-[#101216]'
                }`}
              >
                <span>{category}</span>
              </button>
            ))}
          </div>

          <span className="text-xs font-semibold text-[#7d8493] tabular-nums">
            {filteredEquipment.length} article{filteredEquipment.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Equipment Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredEquipment.map((item) => {
            const hasPhoto = Boolean(item.imageUrl) && !imgErrors[item.id];

            return (
              <article
                key={item.id}
                onClick={() => openProductDetail(item)}
                className="group cursor-pointer flex flex-col rounded-lg border border-[#e4e0d8] bg-white overflow-hidden transition-all duration-300 hover:border-[#e03e3e]/40 hover:shadow-lg hover:-translate-y-1"
              >
                {/* Product Apparel Image / Fallback Container */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#161922]">
                  {hasPhoto ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      onError={() => handleImageError(item.id)}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <EquipmentIllustration
                      category={item.category}
                      name={item.name}
                      productCode={item.productCode}
                    />
                  )}

                  {/* Category Pill Tag */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#101216]/85 backdrop-blur-md px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white border border-white/20">
                      {item.category}
                    </span>
                  </div>

                  {/* Availability Badge */}
                  {!item.isAvailable && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="inline-flex rounded-full bg-[#e03e3e] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
                        Épuisé
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5 flex flex-col flex-grow justify-between space-y-4 bg-white">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold tracking-tight text-[#101216] group-hover:text-[#e03e3e] transition-colors leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-xs text-[#5c6370] line-clamp-2 leading-relaxed">
                      {item.gobikReference || item.description}
                    </p>
                  </div>

                  {/* Price & Sizes Strip */}
                  <div className="pt-3 border-t border-[#e4e0d8] flex items-end justify-between">
                    <div>
                      <div className="text-2xl font-extrabold text-[#101216] tabular-nums tracking-tight">
                        {item.price.toFixed(2)}&nbsp;€
                      </div>
                      <div className="text-xs font-medium text-[#7d8493] mt-0.5">
                        Tailles : {item.sizes.join(' · ')}
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#e03e3e] group-hover:underline">
                      <span>Détails</span>
                      <ArrowRightIcon className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* ──── Technical & Quality Club Manifesto ──── */}
        <section className="rounded-lg border border-[#262b38] bg-[#101216] text-white p-8 sm:p-10 mt-16">
          <div className="max-w-3xl space-y-2 mb-8">
            <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#e03e3e]">
              Qualité &amp; Engagement
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.015em] text-white">
              Une tenue club pensée pour durer
            </h2>
            <p className="text-sm text-[#a7adbb] leading-relaxed">
              Le Club Cyclo Saint-Martin de Blanmont a sélectionné le fabriquant GOBIK pour équiper ses membres avec des matériaux professionnels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-[#262b38]">
            <div className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#e03e3e]/15 text-[#e03e3e]">
                <ShieldCheckIcon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Peaux de Chamois K10 &amp; K9</h3>
              <p className="text-xs text-[#a7adbb] leading-relaxed">
                Inserts ergonomiques conçus pour plus de 8 heures en selle, éliminant les frottements lors des longues sorties d&apos;endurance.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-sky-500/15 text-sky-400">
                <TruckIcon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Distribution Locale Gratuite</h3>
              <p className="text-xs text-[#a7adbb] leading-relaxed">
                Toutes les commandes sont remises en mains propres sur la Place de Blanmont au départ des sorties du club, sans frais de port.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-400">
                <CheckBadgeIcon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Essayage &amp; Échantillons</h3>
              <p className="text-xs text-[#a7adbb] leading-relaxed">
                Des tenues témoins sont disponibles auprès des membres du comité pour essayer votre taille avant de passer commande.
              </p>
            </div>
          </div>
        </section>
      </section>

      {/* ──── Product Detail & Order Modal ──── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
              onClick={closeModal}
            />

            {/* Modal Box */}
            <div className="relative w-full max-w-3xl overflow-hidden rounded-lg bg-white border border-[#e4e0d8] shadow-2xl z-10">
              {/* Close button */}
              <button
                onClick={closeModal}
                className="absolute right-4 top-4 z-20 rounded-full bg-[#101216]/80 p-2 text-white hover:bg-[#e03e3e] transition-colors"
                aria-label="Fermer"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Left: Product Visual */}
                <div className="relative aspect-square md:aspect-auto min-h-[300px] bg-[#161922]">
                  {Boolean(selectedProduct.imageUrl) && !imgErrors[selectedProduct.id] ? (
                    <img
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.name}
                      onError={() => handleImageError(selectedProduct.id)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <EquipmentIllustration
                      category={selectedProduct.category}
                      name={selectedProduct.name}
                      productCode={selectedProduct.productCode}
                    />
                  )}
                </div>

                {/* Right: Technical Details & Size Selector */}
                <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div>
                      <span className="inline-flex rounded-full bg-[#e03e3e]/10 text-[#e03e3e] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                        {selectedProduct.category}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101216] mt-2">
                        {selectedProduct.name}
                      </h2>
                      {selectedProduct.gobikReference && (
                        <p className="text-xs font-mono text-[#7d8493] mt-1 uppercase">
                          Ref: {selectedProduct.gobikReference}
                        </p>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-[#3a3f4a] leading-relaxed">
                      {selectedProduct.description}
                    </p>

                    <div className="text-3xl font-extrabold text-[#101216] tabular-nums tracking-tight">
                      {selectedProduct.price.toFixed(2)}&nbsp;€
                    </div>

                    {/* Size Selector */}
                    <div className="space-y-2 pt-2 border-t border-[#e4e0d8]">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#101216]">
                        Sélectionner une taille :
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`min-w-[2.75rem] rounded-md px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors border ${
                              selectedSize === size
                                ? 'bg-[#101216] text-white border-[#101216]'
                                : 'bg-[#f2efe9] text-[#101216] border-[#e4e0d8] hover:border-[#101216]/40'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Order Button CTA */}
                  <div className="space-y-2 pt-4 border-t border-[#e4e0d8]">
                    <a
                      href={`mailto:info@blanmont.be?subject=${encodeURIComponent(
                        `Commande équipement: ${selectedProduct.name} (${selectedSize || 'Taille à préciser'})`
                      )}&body=${encodeURIComponent(
                        `Bonjour,\n\nJe souhaite commander la tenue suivante :\n- Article : ${selectedProduct.name}\n- Référence : ${selectedProduct.productCode || selectedProduct.id}\n- Taille : ${selectedSize || 'À préciser'}\n- Prix : ${selectedProduct.price.toFixed(2)} €\n\nNom et prénom :\nTéléphone :\n\nMerci !`
                      )}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.06em] transition-colors active:scale-[0.98] shadow-md"
                    >
                      <ShoppingBagIcon className="h-4 w-4" />
                      <span>Commander par email ({selectedSize || 'Taille'})</span>
                    </a>
                    <p className="text-center text-xs text-[#7d8493]">
                      Paiement &amp; retrait sur la Place de Blanmont lors des sorties.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
