'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  XMarkIcon,
  ShieldCheckIcon,
  TruckIcon,
  ArrowRightIcon,
  CheckBadgeIcon,
  MinusIcon,
  PlusIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
  QuestionMarkCircleIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import { JerseyIcon } from '@/app/components/ui/CyclingIcons';
import { Equipment } from '../../../types/equipment';
import { EQUIPMENT_CATEGORIES, EQUIPMENT_DATA } from '../../../data/equipment';
import EquipmentIllustration from './EquipmentIllustration';
import GobikSizeGuide from '@/app/components/equipment/GobikSizeGuide';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';

export default function EquipementPage() {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>(EQUIPMENT_DATA);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedProduct, setSelectedProduct] = useState<Equipment | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [memberName, setMemberName] = useState<string>('');
  const [memberEmail, setMemberEmail] = useState<string>('');
  const [memberPhone, setMemberPhone] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

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
    setQuantity(1);
    setCopied(false);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setSelectedSize('');
    setQuantity(1);
    setCopied(false);
  };

  const effectiveMemberName = memberName !== '' ? memberName : (user?.name || '');
  const effectiveMemberEmail = memberEmail !== '' ? memberEmail : (user?.email || '');

  const getOrderSummaryText = (product: Equipment, size: string, qty: number) => {
    const total = (product.price * qty).toFixed(2);
    return `COMMANDE ÉQUIPEMENT · CC SAINT-MARTIN BLANMONT
==================================================
Article : ${product.name}
Référence Gobik : ${product.gobikReference || product.productCode || product.id}
Taille choisie : ${size || 'À préciser'}
Quantité : ${qty}
Prix unitaire : ${product.price.toFixed(2)} €
Total à régler : ${total} €

COORDONNÉES DU MEMBRE :
Nom : ${effectiveMemberName || 'Non renseigné'}
Email : ${effectiveMemberEmail || 'Non renseigné'}
Téléphone : ${memberPhone || 'Non renseigné'}
Remarques / Essayage : ${orderNotes || 'Aucune'}

MODALITÉS CLUB :
- Retrait : Gratuit, Place de Blanmont lors des sorties club
- Paiement : Virement sur le compte du club ou remise en main propre`;
  };

  const handleCopyOrder = () => {
    if (!selectedProduct) return;
    const text = getOrderSummaryText(selectedProduct, selectedSize, quantity);
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Récapitulatif de commande copié dans le presse-papiers !');
    setTimeout(() => setCopied(false), 2500);
  };

  const totalPieces = equipment.length;

  return (
    <main className="min-h-screen bg-[#faf8f5] dark:bg-[#0a0c10] text-[#101216] dark:text-[#f5f6f8] transition-colors duration-200">
      {/* ──── Editorial Cover Hero (Adaptive Light / Dark) ──── */}
      <section className="relative overflow-hidden editorial-hero-surface border-b border-[#e4e0d8] dark:border-[#262b38] transition-colors duration-200">
        {/* Atmospheric Background Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-[0.035] dark:opacity-[0.025] leading-none text-center">
          <span className="text-[clamp(6rem,22vw,28rem)] font-extrabold uppercase tracking-tighter text-[#101216] dark:text-white whitespace-nowrap">
            BLANMONT
          </span>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20 sm:pb-12 lg:px-8 z-10">
          {/* Top row: Title */}
          <div className="space-y-3 max-w-3xl pb-8 border-b border-[#e4e0d8] dark:border-white/10">
            <h1 className="text-[clamp(2.25rem,6vw,4.25rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-[#101216] dark:text-white text-balance">
              Tenues &amp; <span className="text-[#e03e3e] italic">Équipements</span>
            </h1>

            <p className="max-w-2xl text-base text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
              Portez les couleurs officielles du CC Saint-Martin Blanmont. Vêtements cyclistes haute performance développés par Gobik pour le confort et la vitesse en peloton.
            </p>
          </div>

          {/* Stat Strip on Hero (Horizontal Hairline Structure) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#e4e0d8] dark:divide-white/10 pt-6">
            {/* Pieces in collection */}
            <div className="py-3 sm:py-0 sm:px-6 first:sm:pl-0 flex items-center gap-4 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#101216] dark:text-[#f5f6f8] shrink-0 transition-colors group-hover:border-[#e03e3e] group-hover:bg-[#e03e3e] group-hover:text-white">
                <JerseyIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#101216] dark:text-white tabular-nums tracking-tight">
                  {totalPieces} articles
                </div>
                <div className="text-xs uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] font-semibold">
                  Catalogue officiel
                </div>
              </div>
            </div>

            {/* Technical partner */}
            <div className="py-3 sm:py-0 sm:px-6 flex items-center gap-4 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#101216] dark:text-[#f5f6f8] shrink-0 transition-colors group-hover:border-[#e03e3e] group-hover:bg-[#e03e3e] group-hover:text-white">
                <ShieldCheckIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" aria-hidden="true" />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-bold text-[#101216] dark:text-white tracking-tight">
                  GOBIK Spain
                </div>
                <div className="text-xs uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] font-semibold">
                  Partenaire technique
                </div>
              </div>
            </div>

            {/* Pickup & orders */}
            <div className="py-3 sm:py-0 sm:px-6 last:sm:pr-0 flex items-center gap-4 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#101216] dark:text-[#f5f6f8] shrink-0 transition-colors group-hover:border-[#e03e3e] group-hover:bg-[#e03e3e] group-hover:text-white">
                <TruckIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" aria-hidden="true" />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-bold text-[#101216] dark:text-white tracking-tight">
                  Distribution club
                </div>
                <div className="text-xs uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] font-semibold">
                  Remise le samedi
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Main Content Spread (Adaptive Surface) ──── */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 space-y-10">
        {/* Direct Checkout Hub Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#101216] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[#faf8f5] dark:bg-[#161922] border border-[#e4e0d8] dark:border-[#262b38] text-[#e03e3e] shrink-0">
              <ShoppingBagIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#101216] dark:text-white">
                Bon de commande direct &amp; Checkout Club
              </div>
              <div className="text-xs text-[#5c6370] dark:text-[#a7adbb]">
                Générez votre récapitulatif de commande, vérifiez les mensurations Gobik et réservez votre équipement officiel.
              </div>
            </div>
          </div>
          <Link
            href="/checkout"
            className="inline-flex items-center gap-2 rounded-md bg-[#101216] dark:bg-white text-white dark:text-[#101216] px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            <span>Accéder au Checkout</span>
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Category Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#101216] shadow-xs transition-colors">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7d8493] dark:text-[#a7adbb]">
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
                    ? 'bg-[#101216] text-white dark:bg-white dark:text-[#101216]'
                    : 'bg-[#f2efe9] dark:bg-[#1c202a] text-[#5c6370] dark:text-[#a7adbb] hover:bg-[#e4e0d8] dark:hover:bg-[#262b38] hover:text-[#101216] dark:hover:text-white'
                }`}
              >
                <span>{category}</span>
              </button>
            ))}
          </div>

          <span className="text-xs font-semibold text-[#7d8493] dark:text-[#a7adbb] tabular-nums">
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
                className="group cursor-pointer flex flex-col rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#101216] overflow-hidden transition-all duration-300 hover:border-[#e03e3e]/40 hover:shadow-lg hover:-translate-y-1"
              >
                {/* Product Apparel Image / Fallback Container */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#161922] dark:bg-[#1c202a]">
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
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#101216]/85 dark:bg-black/85 backdrop-blur-md px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white border border-white/20">
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
                <div className="p-5 flex flex-col flex-grow justify-between space-y-4 bg-white dark:bg-[#101216]">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold tracking-tight text-[#101216] dark:text-white group-hover:text-[#e03e3e] transition-colors leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] line-clamp-2 leading-relaxed">
                      {item.gobikReference || item.description}
                    </p>
                  </div>

                  {/* Price & Sizes Strip */}
                  <div className="pt-3 border-t border-[#e4e0d8] dark:border-[#262b38] flex items-end justify-between">
                    <div>
                      <div className="text-2xl font-extrabold text-[#101216] dark:text-white tabular-nums tracking-tight">
                        {item.price.toFixed(2)}&nbsp;€
                      </div>
                      <div className="text-xs font-medium text-[#7d8493] dark:text-[#a7adbb] mt-0.5">
                        Tailles : {item.sizes.join(' · ')}
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#e03e3e] group-hover:underline">
                      <span>Commander</span>
                      <ArrowRightIcon className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* ──── Technical & Quality Club Manifesto ──── */}
        <section className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#101216] text-[#101216] dark:text-white p-8 sm:p-10 mt-16 shadow-xs transition-colors">
          <div className="max-w-3xl space-y-2 mb-8">
            <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#e03e3e]">
              Qualité &amp; Engagement
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.015em] text-[#101216] dark:text-white">
              Une tenue club pensée pour durer
            </h2>
            <p className="text-sm text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
              Le Club Cyclo Saint-Martin de Blanmont a sélectionné le fabriquant GOBIK pour équiper ses membres avec des matériaux professionnels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-[#e4e0d8] dark:border-[#262b38]">
            <div className="space-y-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[#faf8f5] dark:bg-[#171a21] border border-[#e4e0d8] dark:border-[#262b38] text-[#101216] dark:text-white transition-colors group-hover:border-[#e03e3e] group-hover:bg-[#e03e3e] group-hover:text-white">
                <ShieldCheckIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" />
              </div>
              <h3 className="text-base font-bold text-[#101216] dark:text-white">Peaux de Chamois K10 &amp; K9</h3>
              <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
                Inserts ergonomiques conçus pour plus de 8 heures en selle, éliminant les frottements lors des longues sorties d&apos;endurance.
              </p>
            </div>

            <div className="space-y-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[#faf8f5] dark:bg-[#171a21] border border-[#e4e0d8] dark:border-[#262b38] text-[#101216] dark:text-white transition-colors group-hover:border-[#e03e3e] group-hover:bg-[#e03e3e] group-hover:text-white">
                <TruckIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" />
              </div>
              <h3 className="text-base font-bold text-[#101216] dark:text-white">Distribution Locale Gratuite</h3>
              <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
                Toutes les commandes sont remises en mains propres sur la Place de Blanmont au départ des sorties du club, sans frais de port.
              </p>
            </div>

            <div className="space-y-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[#faf8f5] dark:bg-[#171a21] border border-[#e4e0d8] dark:border-[#262b38] text-[#101216] dark:text-white transition-colors group-hover:border-[#e03e3e] group-hover:bg-[#e03e3e] group-hover:text-white">
                <CheckBadgeIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" />
              </div>
              <h3 className="text-base font-bold text-[#101216] dark:text-white">Essayage &amp; Échantillons</h3>
              <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
                Des tenues témoins sont disponibles auprès des membres du comité pour essayer votre taille avant de passer commande.
              </p>
            </div>
          </div>
        </section>
      </section>

      {/* ──── Product Detail & Club Checkout Sheet Modal ──── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex min-h-full items-center justify-center p-3 sm:p-6">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
              onClick={closeModal}
            />

            {/* Modal Box */}
            <div className="relative w-full max-w-4xl overflow-hidden rounded-xl bg-white dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] shadow-2xl z-10 transition-colors">
              {/* Header Bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#e4e0d8] dark:border-[#262b38] bg-[#faf8f5] dark:bg-[#14171f]">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-[#e03e3e]/10 text-[#e03e3e]">
                    <ShoppingBagIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#101216] dark:text-white uppercase tracking-wider">
                      Bon de Commande &amp; Réservation Équipement
                    </h2>
                    <p className="text-[11px] text-[#7d8493] dark:text-[#a7adbb]">
                      CC Saint-Martin Blanmont · Partenaire GOBIK Custom
                    </p>
                  </div>
                </div>

                <button
                  onClick={closeModal}
                  className="rounded-full p-2 text-[#7d8493] hover:text-[#101216] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  aria-label="Fermer"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Body Spread */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8">
                {/* Left Column: Product Spec & Selection */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="flex gap-4 items-start">
                    {/* Visual thumbnail */}
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-[#161922] dark:bg-[#1c202a] border border-[#e4e0d8] dark:border-[#262b38]">
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
                          className="scale-90"
                        />
                      )}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <span className="inline-flex rounded-full bg-[#e03e3e]/10 text-[#e03e3e] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        {selectedProduct.category}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold tracking-tight text-[#101216] dark:text-white leading-snug">
                        {selectedProduct.name}
                      </h3>
                      {selectedProduct.gobikReference && (
                        <p className="text-[11px] font-mono text-[#7d8493] dark:text-[#a7adbb] uppercase truncate">
                          Ref: {selectedProduct.gobikReference}
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
                    {selectedProduct.description}
                  </p>

                  {/* Size Selector + Size Guide Link */}
                  <div className="space-y-3 pt-3 border-t border-[#e4e0d8] dark:border-[#262b38]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#101216] dark:text-white">
                        Taille ({selectedSize || 'À choisir'}) :
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsSizeGuideOpen(true)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#e03e3e] hover:underline cursor-pointer"
                      >
                        <QuestionMarkCircleIcon className="h-4 w-4" />
                        <span>Guide des tailles Gobik</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.sizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`min-w-[2.75rem] min-h-[2.5rem] rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors border cursor-pointer ${
                            selectedSize === size
                              ? 'bg-[#101216] text-white border-[#101216] dark:bg-white dark:text-[#101216] dark:border-white'
                              : 'bg-[#faf8f5] dark:bg-[#161922] text-[#101216] dark:text-[#f5f6f8] border-[#e4e0d8] dark:border-[#262b38] hover:border-[#101216]/40 dark:hover:border-white/40'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity Stepper & Price Breakdown */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#e4e0d8] dark:border-[#262b38]">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-[#101216] dark:text-white mb-1.5">
                        Quantité :
                      </div>
                      <div className="inline-flex items-center rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-[#faf8f5] dark:bg-[#161922]">
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          className="p-2 text-[#5c6370] dark:text-[#a7adbb] hover:text-[#101216] dark:hover:text-white transition-colors cursor-pointer"
                          aria-label="Diminuer la quantité"
                        >
                          <MinusIcon className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-9 text-center text-xs font-bold tabular-nums text-[#101216] dark:text-white">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                          className="p-2 text-[#5c6370] dark:text-[#a7adbb] hover:text-[#101216] dark:hover:text-white transition-colors cursor-pointer"
                          aria-label="Augmenter la quantité"
                        >
                          <PlusIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-[#7d8493] dark:text-[#a7adbb]">
                        Prix unitaire : {selectedProduct.price.toFixed(2)}&nbsp;€
                      </div>
                      <div className="text-2xl font-extrabold text-[#101216] dark:text-white tabular-nums tracking-tight">
                        {(selectedProduct.price * quantity).toFixed(2)}&nbsp;€
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Member Details & Order Receipt Ticket */}
                <div className="lg:col-span-6 flex flex-col justify-between space-y-5 rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-[#faf8f5] dark:bg-[#14171f] p-5">
                  <div className="space-y-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#101216] dark:text-white border-b border-[#e4e0d8] dark:border-[#262b38] pb-2">
                      Coordonnées de commande
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block font-semibold text-[#5c6370] dark:text-[#a7adbb] mb-1">
                          Nom &amp; Prénom
                        </label>
                        <input
                          type="text"
                          value={effectiveMemberName}
                          onChange={(e) => setMemberName(e.target.value)}
                          placeholder="Ex: Laurent Martin"
                          className="w-full rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#101216] px-3 py-2 text-xs text-[#101216] dark:text-white placeholder-[#9aa0a6] focus:border-[#e03e3e] focus:outline-hidden"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block font-semibold text-[#5c6370] dark:text-[#a7adbb] mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={effectiveMemberEmail}
                            onChange={(e) => setMemberEmail(e.target.value)}
                            placeholder="nom@example.be"
                            className="w-full rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#101216] px-3 py-2 text-xs text-[#101216] dark:text-white placeholder-[#9aa0a6] focus:border-[#e03e3e] focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-[#5c6370] dark:text-[#a7adbb] mb-1">
                            Téléphone (optionnel)
                          </label>
                          <input
                            type="tel"
                            value={memberPhone}
                            onChange={(e) => setMemberPhone(e.target.value)}
                            placeholder="0470 12 34 56"
                            className="w-full rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#101216] px-3 py-2 text-xs text-[#101216] dark:text-white placeholder-[#9aa0a6] focus:border-[#e03e3e] focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-[#5c6370] dark:text-[#a7adbb] mb-1">
                          Remarque ou demande d&apos;essayage
                        </label>
                        <input
                          type="text"
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          placeholder="Ex: souhait d'essayer avant validation..."
                          className="w-full rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#101216] px-3 py-2 text-xs text-[#101216] dark:text-white placeholder-[#9aa0a6] focus:border-[#e03e3e] focus:outline-hidden"
                        />
                      </div>
                    </div>

                    {/* Receipt Summary Card */}
                    <div className="rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#101216] p-3.5 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-[#5c6370] dark:text-[#a7adbb]">
                        <span>
                          {quantity}&times; {selectedProduct.name} ({selectedSize || 'Taille ?'})
                        </span>
                        <span className="font-semibold text-[#101216] dark:text-white tabular-nums">
                          {(selectedProduct.price * quantity).toFixed(2)}&nbsp;€
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[#5c6370] dark:text-[#a7adbb]">
                        <span>Retrait Place de Blanmont</span>
                        <span className="font-semibold text-[#101216] dark:text-white">Gratuit (0,00 €)</span>
                      </div>
                      <div className="border-t border-[#e4e0d8] dark:border-[#262b38] pt-2 flex justify-between items-baseline">
                        <span className="font-bold text-[#101216] dark:text-white uppercase tracking-wider text-[11px]">
                          Total TTC :
                        </span>
                        <span className="text-xl font-extrabold text-[#e03e3e] tabular-nums tracking-tight">
                          {(selectedProduct.price * quantity).toFixed(2)}&nbsp;€
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Deck */}
                  <div className="space-y-2.5 pt-2">
                    <a
                      href={`mailto:info@blanmont.be?subject=${encodeURIComponent(
                        `[Commande Équipement] ${selectedProduct.name} (${selectedSize || 'Taille à préciser'}) - ${effectiveMemberName || 'Membre'}`
                      )}&body=${encodeURIComponent(getOrderSummaryText(selectedProduct, selectedSize, quantity))}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.06em] transition-colors active:scale-[0.98] shadow-xs cursor-pointer"
                    >
                      <JerseyIcon className="h-4 w-4" />
                      <span>Confirmer la commande par email</span>
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyOrder}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#101216] hover:bg-[#f2efe9] dark:hover:bg-[#1c202a] text-[#101216] dark:text-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <ClipboardDocumentCheckIcon className="h-4 w-4 text-[#e03e3e]" />
                            <span className="text-[#e03e3e]">Copié !</span>
                          </>
                        ) : (
                          <>
                            <ClipboardDocumentIcon className="h-4 w-4 text-[#7d8493]" />
                            <span>Copier le bon</span>
                          </>
                        )}
                      </button>

                      <Link
                        href={`/checkout?product=${encodeURIComponent(selectedProduct.id)}&size=${encodeURIComponent(selectedSize)}&qty=${quantity}`}
                        className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#101216] hover:bg-[#f2efe9] dark:hover:bg-[#1c202a] text-[#5c6370] dark:text-[#a7adbb] px-3.5 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap"
                        title="Ouvrir la page de commande dédiée"
                      >
                        <span>Page checkout</span>
                        <ArrowRightIcon className="h-3 w-3" />
                      </Link>
                    </div>

                    <p className="text-center text-[11px] text-[#7d8493] dark:text-[#a7adbb]">
                      Paiement par virement ou à la remise en main propre le samedi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──── Gobik Sizing Guide Modal ──── */}
      {selectedProduct && (
        <GobikSizeGuide
          isOpen={isSizeGuideOpen}
          onClose={() => setIsSizeGuideOpen(false)}
          defaultGender={/femme|women/i.test(selectedProduct.name) ? 'women' : 'men'}
          currentSize={selectedSize}
          onSelectSize={(sz) => setSelectedSize(sz)}
        />
      )}
    </main>
  );
}
