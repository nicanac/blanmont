'use client';

import React, { useState } from 'react';
import { XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

export interface SizeMeasurement {
  size: string;
  chest: string; // Poitrine en cm
  waist: string; // Tour de taille en cm
  hips: string;  // Tour de bassin en cm
}

export const MEN_SIZE_CHART: SizeMeasurement[] = [
  { size: 'XS', chest: '88 - 92', waist: '75 - 79', hips: '89 - 93' },
  { size: 'S', chest: '93 - 97', waist: '80 - 84', hips: '94 - 98' },
  { size: 'M', chest: '98 - 102', waist: '85 - 89', hips: '99 - 103' },
  { size: 'L', chest: '103 - 107', waist: '90 - 94', hips: '104 - 108' },
  { size: 'XL', chest: '108 - 112', waist: '95 - 99', hips: '109 - 113' },
  { size: 'XXL', chest: '113 - 117', waist: '100 - 104', hips: '114 - 118' },
];

export const WOMEN_SIZE_CHART: SizeMeasurement[] = [
  { size: 'XS', chest: '78 - 82', waist: '62 - 66', hips: '86 - 90' },
  { size: 'S', chest: '83 - 87', waist: '67 - 71', hips: '91 - 95' },
  { size: 'M', chest: '88 - 92', waist: '72 - 76', hips: '96 - 100' },
  { size: 'L', chest: '93 - 97', waist: '77 - 81', hips: '101 - 105' },
  { size: 'XL', chest: '98 - 102', waist: '82 - 86', hips: '106 - 110' },
];

interface GobikSizeGuideProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGender?: 'men' | 'women';
  currentSize?: string;
  onSelectSize?: (size: string) => void;
}

export default function GobikSizeGuide({
  isOpen,
  onClose,
  defaultGender = 'men',
  currentSize,
  onSelectSize,
}: GobikSizeGuideProps) {
  const [gender, setGender] = useState<'men' | 'women'>(defaultGender);

  if (!isOpen) return null;

  const chart = gender === 'men' ? MEN_SIZE_CHART : WOMEN_SIZE_CHART;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />

        {/* Modal Window */}
        <div className="relative w-full max-w-2xl overflow-hidden rounded-lg bg-white dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] shadow-2xl z-10 transition-colors p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-[#e4e0d8] dark:border-[#262b38]">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#e03e3e]">
                Guide Technique Gobik Spain
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101216] dark:text-white">
                Guide des tailles &amp; Mensurations
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-[#7d8493] hover:text-[#101216] dark:hover:text-white hover:bg-[#f2efe9] dark:hover:bg-[#1c202a] transition-colors"
              aria-label="Fermer le guide des tailles"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Gender Switcher */}
          <div className="mt-5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setGender('men')}
              className={`flex-1 py-2.5 px-4 rounded-md text-xs font-bold uppercase tracking-wider transition-colors border ${
                gender === 'men'
                  ? 'bg-[#101216] text-white border-[#101216] dark:bg-white dark:text-[#101216] dark:border-white'
                  : 'bg-[#faf8f5] dark:bg-[#161922] text-[#5c6370] dark:text-[#a7adbb] border-[#e4e0d8] dark:border-[#262b38] hover:border-[#101216]/40 dark:hover:border-white/40'
              }`}
            >
              Coupe Homme (Men Fit)
            </button>
            <button
              type="button"
              onClick={() => setGender('women')}
              className={`flex-1 py-2.5 px-4 rounded-md text-xs font-bold uppercase tracking-wider transition-colors border ${
                gender === 'women'
                  ? 'bg-[#101216] text-white border-[#101216] dark:bg-white dark:text-[#101216] dark:border-white'
                  : 'bg-[#faf8f5] dark:bg-[#161922] text-[#5c6370] dark:text-[#a7adbb] border-[#e4e0d8] dark:border-[#262b38] hover:border-[#101216]/40 dark:hover:border-white/40'
              }`}
            >
              Coupe Femme (Women Fit)
            </button>
          </div>

          {/* Sizing Table */}
          <div className="mt-5 overflow-x-auto rounded-lg border border-[#e4e0d8] dark:border-[#262b38]">
            <table className="w-full text-left text-xs tabular-nums">
              <thead className="bg-[#faf8f5] dark:bg-[#161922] border-b border-[#e4e0d8] dark:border-[#262b38] text-[#101216] dark:text-white uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3">Taille</th>
                  <th className="px-4 py-3">Poitrine (cm)</th>
                  <th className="px-4 py-3">Taille (cm)</th>
                  <th className="px-4 py-3">Bassin / Hanches (cm)</th>
                  {onSelectSize && <th className="px-4 py-3 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4e0d8] dark:divide-[#262b38] text-[#3a3f4a] dark:text-[#c4cad4]">
                {chart.map((row) => {
                  const isCurrent = currentSize === row.size;
                  return (
                    <tr
                      key={row.size}
                      className={`hover:bg-[#faf8f5] dark:hover:bg-[#161922] transition-colors ${
                        isCurrent ? 'bg-[#e03e3e]/5 dark:bg-[#e03e3e]/10' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-bold text-[#101216] dark:text-white">
                        <div className="flex items-center gap-2">
                          <span>{row.size}</span>
                          {isCurrent && (
                            <span className="text-[10px] uppercase font-bold text-[#e03e3e]">
                              (actuel)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">{row.chest}</td>
                      <td className="px-4 py-3">{row.waist}</td>
                      <td className="px-4 py-3">{row.hips}</td>
                      {onSelectSize && (
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectSize(row.size);
                              onClose();
                            }}
                            className={`px-3 py-1 rounded text-[11px] font-bold uppercase transition-colors ${
                              isCurrent
                                ? 'bg-[#e03e3e] text-white'
                                : 'bg-[#f2efe9] dark:bg-[#1c202a] text-[#101216] dark:text-[#f5f6f8] hover:bg-[#101216] hover:text-white dark:hover:bg-white dark:hover:text-[#101216]'
                            }`}
                          >
                            {isCurrent ? 'Sélectionné' : 'Choisir'}
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Advice Callout */}
          <div className="mt-5 flex gap-3 p-4 rounded-lg bg-[#faf8f5] dark:bg-[#161922] border border-[#e4e0d8] dark:border-[#262b38] text-xs">
            <InformationCircleIcon className="h-5 w-5 text-[#e03e3e] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-[#101216] dark:text-white">
                Conseil d&apos;ajustement Gobik Performance
              </div>
              <p className="text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
                Les tenues Gobik adoptent une <strong>coupe anatomique ajustée (Slim / Aero)</strong>. Si vous êtes entre deux tailles ou préférez un porter plus décontracté pour les longues sorties d&apos;endurance, nous vous conseillons de <strong>choisir la taille supérieure</strong>.
              </p>
            </div>
          </div>

          {/* Footer Action */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-md bg-[#101216] dark:bg-white text-white dark:text-[#101216] text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer"
            >
              Fermer le guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
