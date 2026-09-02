'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  XMarkIcon,
  ShoppingBagIcon,
  PlayIcon,
  PlusIcon,
  TagIcon,
  CubeIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';

interface EquipementsTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
}

export default function EquipementsTutorialModal({
  isOpen,
  onClose,
  onStartTour,
}: EquipementsTutorialModalProps): React.ReactElement | null {
  const [activeTab, setActiveTab] = useState<'catalog' | 'stock' | 'orders'>('catalog');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl rounded-xl border border-[#262b38] bg-[#0a0c10] text-white shadow-2xl overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#262b38] px-6 py-4 bg-[#161922]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <ShoppingBagIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold uppercase tracking-tight text-white">
                  Guide du Vestiaire Gobik &amp; Stocks
                </h2>
                <span className="text-[0.6875rem] font-bold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5">
                  Boutique Club
                </span>
              </div>
              <p className="text-xs text-[#a7adbb]">
                Gestion du catalogue officiel, inventaire des tailles et réassort
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-[#7d8493] hover:bg-white/10 hover:text-white transition-colors"
          >
            <span className="sr-only">Fermer</span>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#262b38] bg-[#101216] px-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeTab === 'catalog'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-[#7d8493] hover:text-white'
            }`}
          >
            <ShoppingBagIcon className="h-4 w-4 text-emerald-400" />
            <span>1. Catalogue Officiel</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stock')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeTab === 'stock'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-[#7d8493] hover:text-white'
            }`}
          >
            <CubeIcon className="h-4 w-4 text-sky-400" />
            <span>2. Tailles &amp; Inventaire</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-[#7d8493] hover:text-white'
            }`}
          >
            <TagIcon className="h-4 w-4 text-amber-400" />
            <span>3. Commandes &amp; Réassort</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* TAB 1: CATALOG */}
          {activeTab === 'catalog' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 text-[#a7adbb] leading-relaxed">
                Les équipements du CC Saint-Martin Blanmont sont fabriqués par l&apos;équipementier <strong>Gobik</strong>. Vous gérez ici les modèles présentés aux membres sur la boutique publique (<span className="text-white font-mono">/le-club/equipement</span>).
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
                  <h4 className="font-bold text-white text-xs">Photos &amp; Description</h4>
                  <p className="text-[#a7adbb] text-xs">
                    Ajoutez des photos de face/dos des maillots et vestes pour que les cyclistes apprécient les finitions et détails techniques.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
                  <h4 className="font-bold text-white text-xs">Catégories &amp; Tarifs</h4>
                  <p className="text-[#a7adbb] text-xs">
                    Classez chaque pièce (Maillots, Cuissards, Vestes, Accessoires) et fixez le prix adhérent subventionné par le club.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STOCK */}
          {activeTab === 'stock' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 text-[#a7adbb] leading-relaxed">
                Le stock est géré finement par taille (<span className="text-white font-mono font-bold">XS, S, M, L, XL, 2XL</span>).
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
                  <h4 className="font-bold text-white text-xs">Mise à Jour Rapide</h4>
                  <p className="text-[#a7adbb] text-xs">
                    Lors de la réception d&apos;un carton ou d&apos;une vente à un membre lors d&apos;une permanence, ajustez la quantité de la taille concernée en 1 clic.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
                  <h4 className="font-bold text-white text-xs">Indicateur d&apos;Épuisement</h4>
                  <p className="text-[#a7adbb] text-xs">
                    Lorsqu&apos;une taille atteint 0 pièce, elle est marquée comme &laquo; Épuisée &raquo; sur le site public pour éviter les commandes impossibles.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 text-[#a7adbb] leading-relaxed">
                Le club organise 2 commandes groupées par an auprès de Gobik (Printemps &amp; Automne).
              </div>

              <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 flex items-start gap-3">
                <LightBulbIcon className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-white text-xs">Astuce de gestion :</span>
                  <p className="text-xs text-[#a7adbb]">
                    Consultez régulièrement l&apos;état des stocks pour anticiper les réassorts avant le début de la saison estivale.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[#262b38] bg-[#161922] px-6 py-4 gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onStartTour();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-[#262b38] bg-[#0a0c10] hover:bg-white/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors"
          >
            <PlayIcon className="h-4 w-4 text-emerald-400" />
            <span>Lancer la visite interactive</span>
          </button>

          <Link
            href="/admin/equipements/new"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors shadow-xs"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Ajouter un Équipement</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
