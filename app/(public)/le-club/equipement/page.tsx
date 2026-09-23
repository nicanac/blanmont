'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
import { SheetHeader } from '@/app/components/carte/SheetHeader';

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
    <main className="min-h-screen bg-paper dark:bg-night text-ink dark:text-snow transition-colors duration-200">
      <SheetHeader
        sheet="Équipement officiel"
        focus={{ x: 55, y: 44 }}
        title="Tenues & équipements"
        description="Portez les couleurs officielles du CC Saint-Martin Blanmont. Vêtements cyclistes haute performance développés par Gobik pour le confort et la vitesse en peloton."
        legend={[
          { term: 'Catalogue officiel', value: `${totalPieces} articles` },
          { term: 'Partenaire technique', value: 'GOBIK Spain' },
          { term: 'Distribution club', value: 'Remise le samedi' },
        ]}
      />

      {/* ──── Main Content Spread (Adaptive Surface) ──── */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 space-y-10">
        {/* Direct Checkout Hub Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-lg border border-line dark:border-night-line bg-white dark:bg-ink shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-paper dark:bg-night-2 border border-line dark:border-night-line text-brand shrink-0">
              <ShoppingBagIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-ink dark:text-white">
                Bon de commande direct &amp; Checkout Club
              </div>
              <div className="text-xs text-ink-3 dark:text-snow-3">
                Générez votre récapitulatif de commande, vérifiez les mensurations Gobik et réservez votre équipement officiel.
              </div>
            </div>
          </div>
          <Link
            href="/checkout"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-ink dark:bg-white text-white dark:text-ink px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity whitespace-nowrap min-h-[44px]"
          >
            <span>Accéder au Checkout</span>
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Category Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 rounded-lg border border-line dark:border-night-line bg-white dark:bg-ink shadow-xs transition-colors">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
            <CheckBadgeIcon className="h-4 w-4 text-brand" />
            <span>Catégories :</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {EQUIPMENT_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors min-h-[44px] ${
                  selectedCategory === category
                    ? 'bg-ink text-white dark:bg-white dark:text-ink'
                    : 'bg-paper-2 dark:bg-night-3 text-ink-3 dark:text-snow-3 hover:bg-line dark:hover:bg-night-line hover:text-ink dark:hover:text-white'
                }`}
              >
                <span>{category}</span>
              </button>
            ))}
          </div>

          <span className="text-xs font-semibold text-ink-3 dark:text-snow-3 tabular-nums">
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
                className="group cursor-pointer flex flex-col rounded-lg border border-line dark:border-night-line bg-white dark:bg-ink overflow-hidden transition-all duration-300 hover:border-brand/40 hover:shadow-lg hover:-translate-y-1"
              >
                {/* Product Apparel Image / Fallback Container */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-night-2 dark:bg-night-3">
                  {hasPhoto ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      unoptimized
                      onError={() => handleImageError(item.id)}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
                    <span className="inline-flex items-center gap-1 rounded-full bg-ink/85 dark:bg-black/85 backdrop-blur-md px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white border border-white/20">
                      {item.category}
                    </span>
                  </div>

                  {/* Availability Badge */}
                  {!item.isAvailable && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="inline-flex rounded-full bg-brand px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
                        Épuisé
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5 flex flex-col flex-grow justify-between space-y-4 bg-white dark:bg-ink">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold tracking-tight text-ink dark:text-white group-hover:text-brand transition-colors leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-xs text-ink-3 dark:text-snow-3 line-clamp-2 leading-relaxed">
                      {item.gobikReference || item.description}
                    </p>
                  </div>

                  {/* Price & Sizes Strip */}
                  <div className="pt-3 border-t border-line dark:border-night-line flex items-end justify-between">
                    <div>
                      <div className="text-2xl font-extrabold text-ink dark:text-white tabular-nums tracking-tight">
                        {item.price.toFixed(2)}&nbsp;€
                      </div>
                      <div className="text-xs font-medium text-ink-3 dark:text-snow-3 mt-0.5">
                        Tailles : {item.sizes.join(' · ')}
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-bold text-brand group-hover:underline">
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
        <section className="rounded-lg border border-line dark:border-night-line bg-white dark:bg-ink text-ink dark:text-white p-8 sm:p-10 mt-16 shadow-xs transition-colors">
          <div className="max-w-3xl space-y-2 mb-8">
            <span className="text-xs font-bold uppercase tracking-[0.08em] text-brand">
              Qualité &amp; Engagement
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.015em] text-ink dark:text-white">
              Une tenue club pensée pour durer
            </h2>
            <p className="text-sm text-ink-3 dark:text-snow-3 leading-relaxed">
              Le Club Cyclo Saint-Martin de Blanmont a sélectionné le fabriquant GOBIK pour équiper ses membres avec des matériaux professionnels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-line dark:border-night-line">
            <div className="space-y-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-paper dark:bg-night-2 border border-line dark:border-night-line text-ink dark:text-white transition-colors group-hover:border-brand group-hover:bg-brand group-hover:text-white">
                <ShieldCheckIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" />
              </div>
              <h3 className="text-base font-bold text-ink dark:text-white">Peaux de Chamois K10 &amp; K9</h3>
              <p className="text-xs text-ink-3 dark:text-snow-3 leading-relaxed">
                Inserts ergonomiques conçus pour plus de 8 heures en selle, éliminant les frottements lors des longues sorties d&apos;endurance.
              </p>
            </div>

            <div className="space-y-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-paper dark:bg-night-2 border border-line dark:border-night-line text-ink dark:text-white transition-colors group-hover:border-brand group-hover:bg-brand group-hover:text-white">
                <TruckIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" />
              </div>
              <h3 className="text-base font-bold text-ink dark:text-white">Distribution Locale Gratuite</h3>
              <p className="text-xs text-ink-3 dark:text-snow-3 leading-relaxed">
                Toutes les commandes sont remises en mains propres sur la Place de Blanmont au départ des sorties du club, sans frais de port.
              </p>
            </div>

            <div className="space-y-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-paper dark:bg-night-2 border border-line dark:border-night-line text-ink dark:text-white transition-colors group-hover:border-brand group-hover:bg-brand group-hover:text-white">
                <CheckBadgeIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" />
              </div>
              <h3 className="text-base font-bold text-ink dark:text-white">Essayage &amp; Échantillons</h3>
              <p className="text-xs text-ink-3 dark:text-snow-3 leading-relaxed">
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
            <div className="relative w-full max-w-4xl overflow-hidden rounded-xl bg-white dark:bg-ink border border-line dark:border-night-line shadow-2xl z-10 transition-colors">
              {/* Header Bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-line dark:border-night-line bg-paper dark:bg-night-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 md:h-8 md:w-8 items-center justify-center rounded bg-brand/10 text-brand">
                    <ShoppingBagIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-ink dark:text-white uppercase tracking-wider">
                      Bon de Commande &amp; Réservation Équipement
                    </h2>
                    <p className="text-xs text-ink-3 dark:text-snow-3">
                      CC Saint-Martin Blanmont · Partenaire GOBIK Custom
                    </p>
                  </div>
                </div>

                <button
                  onClick={closeModal}
                  className="rounded-full p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-ink-3 hover:text-ink dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
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
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-night-2 dark:bg-night-3 border border-line dark:border-night-line">
                      {Boolean(selectedProduct.imageUrl) && !imgErrors[selectedProduct.id] ? (
                        <Image
                          src={selectedProduct.imageUrl}
                          alt={selectedProduct.name}
                          fill
                          unoptimized
                          onError={() => handleImageError(selectedProduct.id)}
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <EquipmentIllustration
                          name={selectedProduct.name}
                          category={selectedProduct.category}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-paper dark:bg-night-2 border border-line dark:border-night-line text-xs font-bold uppercase tracking-wider text-brand mb-1">
                        {selectedProduct.category}
                      </div>
                      <h3 className="text-lg font-bold text-ink dark:text-white tracking-tight">
                        {selectedProduct.name}
                      </h3>
                      <div className="text-xs text-ink-3 dark:text-snow-3 font-mono mt-0.5">
                        Ref. {selectedProduct.id.toUpperCase()} · Coupe {selectedProduct.cut || 'Standard'}
                      </div>
                    </div>
                  </div>

                  {/* Size Selector */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-ink dark:text-white">
                        Taille sélectionnée :&nbsp;
                        <span className="text-brand font-black">{selectedSize}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsSizeGuideOpen(true)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline cursor-pointer min-h-[44px] py-2"
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
                          className={`min-w-[2.75rem] min-h-[44px] rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors border cursor-pointer inline-flex items-center justify-center ${
                            selectedSize === size
                              ? 'bg-ink text-white border-ink dark:bg-white dark:text-ink dark:border-white'
                              : 'bg-paper dark:bg-night-2 text-ink dark:text-snow border-line dark:border-night-line hover:border-ink/40 dark:hover:border-white/40'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity Stepper & Price Breakdown */}
                  <div className="flex items-center justify-between pt-3 border-t border-line dark:border-night-line">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-ink dark:text-white mb-1.5">
                        Quantité :
                      </div>
                      <div className="inline-flex items-center rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2">
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-ink-3 dark:text-snow-3 hover:text-ink dark:hover:text-white transition-colors cursor-pointer"
                          aria-label="Diminuer la quantité"
                        >
                          <MinusIcon className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-9 text-center text-xs font-bold tabular-nums text-ink dark:text-white">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                          className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-ink-3 dark:text-snow-3 hover:text-ink dark:hover:text-white transition-colors cursor-pointer"
                          aria-label="Augmenter la quantité"
                        >
                          <PlusIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-ink-3 dark:text-snow-3">
                        Prix unitaire : {selectedProduct.price.toFixed(2)}&nbsp;€
                      </div>
                      <div className="text-2xl font-extrabold text-ink dark:text-white tabular-nums tracking-tight">
                        {(selectedProduct.price * quantity).toFixed(2)}&nbsp;€
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Member Details & Order Receipt Ticket */}
                <div className="lg:col-span-6 flex flex-col justify-between space-y-5 rounded-lg border border-line dark:border-night-line bg-paper dark:bg-night-2 p-5">
                  <div className="space-y-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-ink dark:text-white border-b border-line dark:border-night-line pb-2">
                      Coordonnées de commande
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label htmlFor="equip-order-name" className="block font-semibold text-ink-3 dark:text-snow-3 mb-1">
                          Nom &amp; Prénom
                        </label>
                        <input
                          id="equip-order-name"
                          type="text"
                          value={effectiveMemberName}
                          onChange={(e) => setMemberName(e.target.value)}
                          placeholder="Ex: Laurent Martin"
                          className="w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-ink px-3 py-2 text-xs text-ink dark:text-white placeholder-ink-3 focus:border-brand focus:outline-hidden"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label htmlFor="equip-order-email" className="block font-semibold text-ink-3 dark:text-snow-3 mb-1">
                            Email
                          </label>
                          <input
                            id="equip-order-email"
                            type="email"
                            value={effectiveMemberEmail}
                            onChange={(e) => setMemberEmail(e.target.value)}
                            placeholder="nom@example.be"
                            className="w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-ink px-3 py-2 text-xs text-ink dark:text-white placeholder-ink-3 focus:border-brand focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label htmlFor="equip-order-phone" className="block font-semibold text-ink-3 dark:text-snow-3 mb-1">
                            Téléphone (optionnel)
                          </label>
                          <input
                            id="equip-order-phone"
                            type="tel"
                            value={memberPhone}
                            onChange={(e) => setMemberPhone(e.target.value)}
                            placeholder="0470 12 34 56"
                            className="w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-ink px-3 py-2 text-xs text-ink dark:text-white placeholder-ink-3 focus:border-brand focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="equip-order-notes" className="block font-semibold text-ink-3 dark:text-snow-3 mb-1">
                          Remarque ou demande d&apos;essayage
                        </label>
                        <input
                          id="equip-order-notes"
                          type="text"
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          placeholder="Ex: souhait d'essayer avant validation..."
                          className="w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-ink px-3 py-2 text-xs text-ink dark:text-white placeholder-ink-3 focus:border-brand focus:outline-hidden"
                        />
                      </div>
                    </div>

                    {/* Receipt Summary Card */}
                    <div className="rounded-md border border-line dark:border-night-line bg-white dark:bg-ink p-3.5 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-ink-3 dark:text-snow-3">
                        <span>
                          {quantity}&times; {selectedProduct.name} ({selectedSize || 'Taille ?'})
                        </span>
                        <span className="font-semibold text-ink dark:text-white tabular-nums">
                          {(selectedProduct.price * quantity).toFixed(2)}&nbsp;€
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-ink-3 dark:text-snow-3">
                        <span>Retrait Place de Blanmont</span>
                        <span className="font-semibold text-ink dark:text-white">Gratuit (0,00 €)</span>
                      </div>
                      <div className="border-t border-line dark:border-night-line pt-2 flex justify-between items-baseline">
                        <span className="font-bold text-ink dark:text-white uppercase tracking-wider text-xs">
                          Total TTC :
                        </span>
                        <span className="text-xl font-extrabold text-brand tabular-nums tracking-tight">
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
                      className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand hover:bg-brand-strong text-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.06em] transition-colors active:scale-[0.98] shadow-xs cursor-pointer"
                    >
                      <JerseyIcon className="h-4 w-4" />
                      <span>Confirmer la commande par email</span>
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyOrder}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-line dark:border-night-line bg-white dark:bg-ink hover:bg-paper-2 dark:hover:bg-night-3 text-ink dark:text-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer min-h-[44px]"
                      >
                        {copied ? (
                          <>
                            <ClipboardDocumentCheckIcon className="h-4 w-4 text-brand" />
                            <span className="text-brand">Copié !</span>
                          </>
                        ) : (
                          <>
                            <ClipboardDocumentIcon className="h-4 w-4 text-ink-3" />
                            <span>Copier le bon</span>
                          </>
                        )}
                      </button>

                      <Link
                        href={`/checkout?product=${encodeURIComponent(selectedProduct.id)}&size=${encodeURIComponent(selectedSize)}&qty=${quantity}`}
                        className="inline-flex items-center justify-center gap-1.5 rounded-md border border-line dark:border-night-line bg-white dark:bg-ink hover:bg-paper-2 dark:hover:bg-night-3 text-ink-3 dark:text-snow-3 px-3.5 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap min-h-[44px]"
                        title="Ouvrir la page de commande dédiée"
                      >
                        <span>Page checkout</span>
                        <ArrowRightIcon className="h-3 w-3" />
                      </Link>
                    </div>

                    <p className="text-center text-xs text-ink-3 dark:text-snow-3">
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
