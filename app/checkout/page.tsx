'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  ShieldCheckIcon,
  TruckIcon,
  CheckBadgeIcon,
  QuestionMarkCircleIcon,
  MinusIcon,
  PlusIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
  ShareIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import { JerseyIcon } from '@/app/components/ui/CyclingIcons';
import { Equipment } from '@/app/types/equipment';
import { EQUIPMENT_DATA } from '@/app/data/equipment';
import EquipmentIllustration from '@/app/(public)/le-club/equipement/EquipmentIllustration';
import GobikSizeGuide from '@/app/components/equipment/GobikSizeGuide';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';
import { SheetHeader } from '@/app/components/carte/SheetHeader';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Load product list
  const [equipmentList, setEquipmentList] = useState<Equipment[]>(EQUIPMENT_DATA);
  const [selectedProductId, setSelectedProductId] = useState<string>(
    searchParams.get('product') || EQUIPMENT_DATA[0]?.id || ''
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    searchParams.get('size') || 'M'
  );
  const [quantity, setQuantity] = useState<number>(
    Math.max(1, parseInt(searchParams.get('qty') || '1', 10) || 1)
  );
  const [memberName, setMemberName] = useState<string>('');
  const [memberEmail, setMemberEmail] = useState<string>('');
  const [memberPhone, setMemberPhone] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState<boolean>(false);
  const [copiedOrder, setCopiedOrder] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Fetch updated equipment if API is available
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/equipements');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setEquipmentList(data);
          }
        }
      } catch (err) {
        console.warn('Falling back to static equipment data in checkout', err);
      }
    }
    loadData();
  }, []);

  const selectedProduct =
    equipmentList.find((item) => item.id === selectedProductId) ||
    equipmentList[0] ||
    EQUIPMENT_DATA[0];

  const effectiveSize =
    selectedProduct.sizes.includes(selectedSize)
      ? selectedSize
      : (selectedProduct.sizes[2] || selectedProduct.sizes[0] || 'M');

  const effectiveMemberName = memberName !== '' ? memberName : (user?.name || '');
  const effectiveMemberEmail = memberEmail !== '' ? memberEmail : (user?.email || '');

  const unitPrice = selectedProduct?.price || 0;
  const totalPrice = (unitPrice * quantity).toFixed(2);

  const getOrderSummaryText = () => {
    return `COMMANDE ÉQUIPEMENT · CC SAINT-MARTIN BLANMONT
==================================================
Date : ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
Article : ${selectedProduct.name}
Référence Gobik : ${selectedProduct.gobikReference || selectedProduct.productCode || selectedProduct.id}
Taille : ${effectiveSize}
Quantité : ${quantity}
Prix unitaire : ${unitPrice.toFixed(2)} €
Total à régler : ${totalPrice} €

COORDONNÉES DU MEMBRE :
Nom : ${effectiveMemberName || 'Non renseigné'}
Email : ${effectiveMemberEmail || 'Non renseigné'}
Téléphone : ${memberPhone || 'Non renseigné'}
Remarques / Demande : ${orderNotes || 'Aucune'}

MODALITÉS DE LIVRAISON & PAIEMENT :
- Lieu de retrait : Gratuit, Place de Blanmont lors des sorties club
- Règlement : Virement bancaire sur le compte du club ou en mains propres`;
  };

  const handleCopyOrder = () => {
    const text = getOrderSummaryText();
    navigator.clipboard.writeText(text);
    setCopiedOrder(true);
    toast.success('Récapitulatif de commande copié dans le presse-papiers !');
    setTimeout(() => setCopiedOrder(false), 2500);
  };

  const handleShareLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/checkout?product=${encodeURIComponent(selectedProduct.id)}&size=${encodeURIComponent(effectiveSize)}&qty=${quantity}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      toast.success('Lien direct de commande copié !');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const mailtoSubject = `[Commande Équipement] ${selectedProduct.name} (${effectiveSize}) - ${effectiveMemberName || 'Membre'}`;
  const mailtoUrl = `mailto:info@blanmont.be?subject=${encodeURIComponent(mailtoSubject)}&body=${encodeURIComponent(getOrderSummaryText())}`;

  return (
    <main className="min-h-screen bg-paper dark:bg-night text-ink dark:text-snow transition-colors duration-200">
      <SheetHeader
        sheet="Bon de Commande"
        focus={{ x: 55, y: 44 }}
        title="Bon de commande club"
        description="Réservation des équipements officiels Gobik Spain du Cyclo Club Saint-Martin Blanmont."
        legend={[
          { term: 'Catalogue', value: `${equipmentList.length} articles` },
          { term: 'Partenaire', value: 'GOBIK Spain' },
          { term: 'Distribution', value: 'Place de Blanmont' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/le-club/equipement"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 px-3.5 py-2 font-narrow text-xs font-bold uppercase tracking-[0.08em] text-ink dark:text-snow hover:bg-paper-2 dark:hover:bg-night-3 transition-colors"
            >
              <ArrowLeftIcon className="h-3.5 w-3.5" />
              <span>Catalogue</span>
            </Link>
            <button
              type="button"
              onClick={handleShareLink}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 px-3.5 py-2 font-narrow text-xs font-bold uppercase tracking-[0.08em] text-ink dark:text-snow hover:bg-paper-2 dark:hover:bg-night-3 transition-colors cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <ClipboardDocumentCheckIcon className="h-4 w-4 text-brand" />
                  <span className="text-brand">Lien copié</span>
                </>
              ) : (
                <>
                  <ShareIcon className="h-4 w-4 text-ink-3 dark:text-snow-3" />
                  <span>Partager le lien</span>
                </>
              )}
            </button>
          </div>
        }
      />

      {/* ──── Main Content Spread ──── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Equipment Selector, Sizing, Member Info */}
          <div className="lg:col-span-7 space-y-8">
            {/* Step 1: Product Selection */}
            <section className="rounded-lg border border-line dark:border-night-line bg-white dark:bg-ink p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-line dark:border-night-line pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 md:h-6 md:w-6 items-center justify-center rounded-full bg-ink dark:bg-white text-white dark:text-ink text-xs font-bold">
                    1
                  </span>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-ink dark:text-white">
                    Sélection de l&apos;article
                  </h2>
                </div>

                <span className="text-xs font-semibold text-brand">
                  {selectedProduct.category}
                </span>
              </div>

              {/* Product Card Selector Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-ink-3 dark:text-snow-3 mb-1.5">
                  Choisir un modèle dans le catalogue :
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setSelectedProductId(newId);
                    const prod = equipmentList.find((item) => item.id === newId);
                    if (prod && !prod.sizes.includes(selectedSize)) {
                      setSelectedSize(prod.sizes[2] || prod.sizes[0] || 'M');
                    }
                  }}
                  className="w-full rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-ink dark:text-white focus:border-brand focus:outline-hidden cursor-pointer"
                >
                  {equipmentList.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — {item.price.toFixed(2)} € ({item.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Highlight of Selected Product */}
              <div className="flex flex-col sm:flex-row gap-5 p-4 rounded-lg bg-paper dark:bg-night-2 border border-line dark:border-night-line">
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-md bg-night-2 dark:bg-night-3 border border-line dark:border-night-line self-center sm:self-start">
                  {selectedProduct.imageUrl ? (
                    <Image
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.name}
                      fill
                      unoptimized
                      sizes="112px"
                      className="object-cover"
                    />
                  ) : (
                    <EquipmentIllustration
                      category={selectedProduct.category}
                      name={selectedProduct.name}
                      productCode={selectedProduct.productCode}
                    />
                  )}
                </div>

                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-ink dark:text-white">
                      {selectedProduct.name}
                    </h3>
                    <span className="text-lg font-extrabold text-ink dark:text-white tabular-nums">
                      {unitPrice.toFixed(2)}&nbsp;€
                    </span>
                  </div>

                  {selectedProduct.gobikReference && (
                    <div className="text-xs font-mono text-ink-3 dark:text-snow-3 uppercase">
                      Réf: {selectedProduct.gobikReference}
                    </div>
                  )}

                  <p className="text-xs text-ink-3 dark:text-snow-3 leading-relaxed line-clamp-2">
                    {selectedProduct.description}
                  </p>
                </div>
              </div>
            </section>

            {/* Step 2: Size & Quantity */}
            <section className="rounded-lg border border-line dark:border-night-line bg-white dark:bg-ink p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-line dark:border-night-line pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 md:h-6 md:w-6 items-center justify-center rounded-full bg-ink dark:bg-white text-white dark:text-ink text-xs font-bold">
                    2
                  </span>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-ink dark:text-white">
                    Taille &amp; Quantité
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline cursor-pointer"
                >
                  <QuestionMarkCircleIcon className="h-4 w-4" />
                  <span>Guide des tailles Gobik</span>
                </button>
              </div>

              {/* Size Buttons */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-ink dark:text-white uppercase tracking-wider">
                  Sélectionnez votre taille ({effectiveSize}) :
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {selectedProduct.sizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`min-w-[3.25rem] min-h-[44px] rounded-md px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border cursor-pointer inline-flex items-center justify-center ${
                        effectiveSize === sz
                          ? 'bg-ink text-white border-ink dark:bg-white dark:text-ink dark:border-white shadow-xs'
                          : 'bg-paper dark:bg-night-2 text-ink dark:text-snow border-line dark:border-night-line hover:border-ink/40 dark:hover:border-white/40'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center justify-between pt-4 border-t border-line dark:border-night-line">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-ink dark:text-white mb-1.5">
                    Quantité souhaitée :
                  </div>
                  <div className="inline-flex items-center rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-ink-3 dark:text-snow-3 hover:text-ink dark:hover:text-white transition-colors cursor-pointer"
                      aria-label="Moins"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center text-sm font-bold tabular-nums text-ink dark:text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                      className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-ink-3 dark:text-snow-3 hover:text-ink dark:hover:text-white transition-colors cursor-pointer"
                      aria-label="Plus"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-ink-3 dark:text-snow-3">
                    Sous-total ({quantity} article{quantity > 1 ? 's' : ''}) :
                  </div>
                  <div className="text-2xl font-extrabold text-ink dark:text-white tabular-nums tracking-tight">
                    {totalPrice}&nbsp;€
                  </div>
                </div>
              </div>
            </section>

            {/* Step 3: Member Coordinates */}
            <section className="rounded-lg border border-line dark:border-night-line bg-white dark:bg-ink p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 border-b border-line dark:border-night-line pb-3">
                <span className="flex h-6 w-6 md:h-6 md:w-6 items-center justify-center rounded-full bg-ink dark:bg-white text-white dark:text-ink text-xs font-bold">
                  3
                </span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-ink dark:text-white">
                  Coordonnées du membre
                </h2>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-ink-3 dark:text-snow-3 mb-1">
                    Prénom &amp; Nom de famille *
                  </label>
                  <input
                    type="text"
                    value={effectiveMemberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    placeholder="Ex: Jean Martin"
                    className="w-full rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 px-3.5 py-2.5 text-xs sm:text-sm text-ink dark:text-white placeholder-ink-3 focus:border-brand focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-ink-3 dark:text-snow-3 mb-1">
                      Adresse email *
                    </label>
                    <input
                      type="email"
                      value={effectiveMemberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      placeholder="votre.email@domaine.be"
                      className="w-full rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 px-3.5 py-2.5 text-xs sm:text-sm text-ink dark:text-white placeholder-ink-3 focus:border-brand focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-ink-3 dark:text-snow-3 mb-1">
                      Numéro de téléphone (pour notification SMS)
                    </label>
                    <input
                      type="tel"
                      value={memberPhone}
                      onChange={(e) => setMemberPhone(e.target.value)}
                      placeholder="0470 12 34 56"
                      className="w-full rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 px-3.5 py-2.5 text-xs sm:text-sm text-ink dark:text-white placeholder-ink-3 focus:border-brand focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-ink-3 dark:text-snow-3 mb-1">
                    Remarque ou essayage préalable (optionnel)
                  </label>
                  <textarea
                    rows={2}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Ex: Je souhaite essayer la veste d'un membre du comité avant validation définitive..."
                    className="w-full rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 px-3.5 py-2.5 text-xs sm:text-sm text-ink dark:text-white placeholder-ink-3 focus:border-brand focus:outline-hidden resize-none"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Ticket Receipt & Submission Deck */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            {/* Paper Ticket Summary */}
            <div className="rounded-lg border border-line dark:border-night-line bg-white dark:bg-ink p-6 shadow-md space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-line dark:border-night-line pb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBagIcon className="h-5 w-5 text-brand" />
                  <span className="text-xs font-bold uppercase tracking-wider text-ink dark:text-white">
                    Bon de Commande
                  </span>
                </div>
                <span className="text-xs font-mono text-ink-3 dark:text-snow-3">
                  CC SAINT-MARTIN
                </span>
              </div>

              {/* Line Items */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <div className="font-bold text-ink dark:text-white">
                      {quantity}&times; {selectedProduct.name}
                    </div>
                    <div className="text-xs text-ink-3 dark:text-snow-3">
                      Taille : <span className="font-bold text-ink dark:text-white">{effectiveSize}</span> · {unitPrice.toFixed(2)}&nbsp;€ / pièce
                    </div>
                  </div>
                  <div className="font-bold text-ink dark:text-white tabular-nums">
                    {totalPrice}&nbsp;€
                  </div>
                </div>

                <div className="flex justify-between items-center text-ink-3 dark:text-snow-3 pt-2 border-t border-line dark:border-night-line">
                  <span>Frais de port &amp; conditionnement</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Gratuit (0,00 €)
                  </span>
                </div>

                <div className="flex justify-between items-center text-ink-3 dark:text-snow-3">
                  <span>Lieu de distribution</span>
                  <span className="font-semibold text-ink dark:text-white">
                    Place de Blanmont
                  </span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="pt-4 border-t-2 border-dashed border-line dark:border-night-line flex items-baseline justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-ink dark:text-white">
                    Total TTC à régler
                  </div>
                  <div className="text-xs text-ink-3 dark:text-snow-3">
                    TVA et personnalisation incluses
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-brand tabular-nums tracking-tight">
                  {totalPrice}&nbsp;€
                </div>
              </div>

              {/* Payment Info */}
              <div className="p-4 rounded-md bg-paper dark:bg-night-2 border border-line dark:border-night-line space-y-2 text-xs">
                <div className="font-bold text-ink dark:text-white flex items-center gap-1.5">
                  <CheckBadgeIcon className="h-4 w-4 text-brand" />
                  <span>Modalités de règlement &amp; distribution</span>
                </div>
                <p className="text-ink-3 dark:text-snow-3 leading-relaxed">
                  Le paiement s&apos;effectue par virement bancaire sur le compte du club ou en espèces lors de la remise en main propre. La distribution des tenues a lieu sur la Place de Blanmont avant les sorties du club.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <a
                  href={mailtoUrl}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand hover:bg-brand-strong text-white px-6 py-3.5 text-xs font-bold uppercase tracking-[0.06em] transition-all active:scale-[0.98] shadow-md cursor-pointer"
                >
                  <JerseyIcon className="h-4 w-4" />
                  <span>Confirmer la commande par email</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyOrder}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-line dark:border-night-line bg-white dark:bg-night-2 hover:bg-paper dark:hover:bg-night-3 text-ink dark:text-white px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {copiedOrder ? (
                    <>
                      <ClipboardDocumentCheckIcon className="h-4 w-4 text-brand" />
                      <span className="text-brand">Récapitulatif copié !</span>
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentIcon className="h-4 w-4 text-ink-3" />
                      <span>Copier le récapitulatif (Presse-papiers)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quality Commitment strip */}
            <div className="grid grid-cols-2 gap-3 text-xs text-ink-3 dark:text-snow-3">
              <div className="p-3 rounded-lg border border-line dark:border-night-line bg-white dark:bg-ink flex items-center gap-2.5">
                <ShieldCheckIcon className="h-5 w-5 text-brand shrink-0" />
                <span className="font-semibold text-ink dark:text-white">GOBIK Custom Spain</span>
              </div>
              <div className="p-3 rounded-lg border border-line dark:border-night-line bg-white dark:bg-ink flex items-center gap-2.5">
                <TruckIcon className="h-5 w-5 text-brand shrink-0" />
                <span className="font-semibold text-ink dark:text-white">Remise sans frais</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ──── Sizing Guide Modal ──── */}
      <GobikSizeGuide
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        defaultGender={/femme|women/i.test(selectedProduct.name) ? 'women' : 'men'}
        currentSize={effectiveSize}
        onSelectSize={(sz) => setSelectedSize(sz)}
      />
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-paper dark:bg-night text-ink dark:text-white">
          <div className="text-xs font-bold uppercase tracking-wider text-ink-3">
            Chargement du bon de commande...
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
