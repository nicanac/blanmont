'use client';

import React, { useState } from 'react';
import {
  CheckCircleIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  MapPinIcon,
  CalendarDaysIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

const GROUPS = [
  { id: 'A', name: 'Groupe A', speed: '> 30 km/h', desc: 'Sportif & rythmé' },
  { id: 'B', name: 'Groupe B', speed: '25 – 28 km/h', desc: 'Cœur du peloton' },
  { id: 'C', name: 'Groupe C', speed: '< 25 km/h', desc: 'Rando & progression' },
  { id: 'VTT', name: 'Groupe VTT', speed: 'Chemins & bois', desc: 'Sentiers techniques' },
] as const;

const BIKE_TYPES = ['Route', 'VTT', 'Gravel', 'VAE'] as const;
const LEVELS = ['Débutant', 'Intermédiaire', 'Confirmé', 'Compétiteur'] as const;

export default function TrialRideForm(): React.ReactElement {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredGroup: 'B' as 'A' | 'B' | 'C' | 'VTT',
    bikeType: 'Route' as 'Route' | 'VTT' | 'Gravel' | 'VAE',
    experienceLevel: 'Intermédiaire' as 'Débutant' | 'Intermédiaire' | 'Confirmé' | 'Compétiteur',
    firstRideDate: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/rejoindre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Erreur lors de l\'envoi de la demande');
      }

      setIsSubmitted(true);
      toast.success('Demande enregistrée ! Un capitaine de route va vous contacter.');
    } catch (err: any) {
      toast.error(err.message || 'Impossible d\'enregistrer votre demande. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-8 sm:p-10 shadow-xs text-center space-y-6 animate-fadeIn">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
          <CheckCircleIcon className="h-8 w-8" />
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="text-2xl font-extrabold text-[#101216] dark:text-white tracking-tight">
            Demande d&apos;essai bien reçue !
          </h3>
          <p className="text-sm text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
            Merci <strong className="text-[#101216] dark:text-white">{formData.name}</strong>. Un capitaine de route du {formData.preferredGroup === 'VTT' ? 'Groupe VTT' : `Groupe ${formData.preferredGroup}`} prendra contact avec vous par email ou téléphone avant votre première sortie.
          </p>
        </div>

        <div className="rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-[#faf8f5] dark:bg-[#101216] p-5 max-w-lg mx-auto text-left space-y-3 text-xs text-[#3a3f4a] dark:text-[#c4cad4]">
          <div className="font-bold uppercase tracking-wider text-[#101216] dark:text-white flex items-center gap-1.5">
            <MapPinIcon className="h-4 w-4 text-[#e03e3e]" />
            <span>Rappel du rendez-vous</span>
          </div>
          <p>
            • <strong>Lieu</strong> : Place de Blanmont (en face de l&apos;église Saint-Martin)
          </p>
          <p>
            • <strong>Horaire</strong> : Samedi à 8h15 (départ du peloton à 8h30 précises)
          </p>
          <p>
            • <strong>Équipement indispensable</strong> : Casque rigide obligatoire, vélo en ordre mécanique, 2 chambres à air de rechange.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsSubmitted(false);
            setFormData({
              name: '',
              email: '',
              phone: '',
              preferredGroup: 'B',
              bikeType: 'Route',
              experienceLevel: 'Intermédiaire',
              firstRideDate: '',
              message: '',
            });
          }}
          className="inline-flex items-center gap-2 rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#101216] dark:text-white hover:bg-[#f2efe9] dark:hover:bg-[#1f242d] transition-colors"
        >
          <span>Envoyer une autre demande</span>
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-6 sm:p-10 shadow-xs space-y-8"
    >
      <div className="space-y-1.5 border-b border-[#e4e0d8] dark:border-[#262b38] pb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-[#101216] dark:text-white tracking-tight">
          Réservez votre première sortie d&apos;essai gratuite
        </h3>
        <p className="text-xs sm:text-sm text-[#5c6370] dark:text-[#a7adbb]">
          Sans engagement &bull; 3 sorties test gratuites &bull; Encadré par un capitaine de route
        </p>
      </div>

      {/* Speed Group Selector */}
      <div className="space-y-3">
        <div id="trial-group-label" className="block text-xs font-bold uppercase tracking-wider text-[#101216] dark:text-white">
          1. Quel groupe d&apos;allure souhaitez-vous tester ? *
        </div>
        <div role="radiogroup" aria-labelledby="trial-group-label" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {GROUPS.map((g) => {
            const isSelected = formData.preferredGroup === g.id;
            return (
              <button
                key={g.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setFormData({ ...formData, preferredGroup: g.id })}
                className={`flex flex-col text-left p-3.5 rounded-md border transition-all cursor-pointer min-h-[44px] ${
                  isSelected
                    ? 'border-[#e03e3e] bg-[#e03e3e]/5 dark:bg-[#e03e3e]/10 text-[#101216] dark:text-white shadow-xs'
                    : 'border-[#e4e0d8] dark:border-[#262b38] bg-[#faf8f5] dark:bg-[#101216] text-[#5c6370] dark:text-[#a7adbb] hover:border-[#101216]/30 dark:hover:border-white/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-[#101216] dark:text-white">{g.name}</span>
                  <span
                    className={`h-2 w-2 rounded-full ${isSelected ? 'bg-[#e03e3e]' : 'bg-transparent'}`}
                  />
                </div>
                <span className="text-xs font-semibold text-[#e03e3e] tabular-nums">{g.speed}</span>
                <span className="text-xs text-[#5c6370] dark:text-[#a7adbb] mt-0.5">{g.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bike Type & Level */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div id="trial-bike-label" className="block text-xs font-bold uppercase tracking-wider text-[#101216] dark:text-white">
            2. Type de vélo utilisé
          </div>
          <div role="radiogroup" aria-labelledby="trial-bike-label" className="grid grid-cols-2 gap-2">
            {BIKE_TYPES.map((b) => {
              const isSelected = formData.bikeType === b;
              return (
                <button
                  key={b}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setFormData({ ...formData, bikeType: b })}
                  className={`px-3 py-2.5 text-xs font-semibold rounded-md border text-center transition-colors cursor-pointer min-h-[44px] flex items-center justify-center ${
                    isSelected
                      ? 'border-[#e03e3e] bg-[#e03e3e] text-white'
                      : 'border-[#e4e0d8] dark:border-[#262b38] bg-[#faf8f5] dark:bg-[#101216] text-[#3a3f4a] dark:text-[#c4cad4] hover:bg-[#f2efe9]'
                  }`}
                >
                  {b}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <div id="trial-level-label" className="block text-xs font-bold uppercase tracking-wider text-[#101216] dark:text-white">
            3. Votre niveau / habitude
          </div>
          <div role="radiogroup" aria-labelledby="trial-level-label" className="grid grid-cols-2 gap-2">
            {LEVELS.map((lvl) => {
              const isSelected = formData.experienceLevel === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setFormData({ ...formData, experienceLevel: lvl })}
                  className={`px-3 py-2.5 text-xs font-semibold rounded-md border text-center transition-colors cursor-pointer min-h-[44px] flex items-center justify-center ${
                    isSelected
                      ? 'border-[#e03e3e] bg-[#e03e3e] text-white'
                      : 'border-[#e4e0d8] dark:border-[#262b38] bg-[#faf8f5] dark:bg-[#101216] text-[#3a3f4a] dark:text-[#c4cad4] hover:bg-[#f2efe9]'
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Date & Contact Information */}
      <div className="space-y-4 pt-2">
        <div className="block text-xs font-bold uppercase tracking-wider text-[#101216] dark:text-white">
          4. Vos coordonnées pour vous accueillir
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="trial-name" className="block text-xs text-[#5c6370] dark:text-[#a7adbb] mb-1">
              Nom et Prénom *
            </label>
            <input
              id="trial-name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="ex: Jean Dupont"
              className="w-full rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#101216] px-3.5 py-2.5 text-xs text-[#101216] dark:text-white placeholder-[#5c6370] dark:placeholder-[#a7adbb] focus:border-[#e03e3e] focus:outline-none focus:ring-1 focus:ring-[#e03e3e] caret-[#e03e3e] min-h-[44px]"
            />
          </div>

          <div>
            <label htmlFor="trial-email" className="block text-xs text-[#5c6370] dark:text-[#a7adbb] mb-1">
              Adresse Email *
            </label>
            <input
              id="trial-email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="ex: jean.dupont@email.be"
              className="w-full rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#101216] px-3.5 py-2.5 text-xs text-[#101216] dark:text-white placeholder-[#5c6370] dark:placeholder-[#a7adbb] focus:border-[#e03e3e] focus:outline-none focus:ring-1 focus:ring-[#e03e3e] caret-[#e03e3e] min-h-[44px]"
            />
          </div>

          <div>
            <label htmlFor="trial-phone" className="block text-xs text-[#5c6370] dark:text-[#a7adbb] mb-1">
              Numéro de Téléphone / GSM *
            </label>
            <input
              id="trial-phone"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="ex: +32 470 12 34 56"
              className="w-full rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#101216] px-3.5 py-2.5 text-xs text-[#101216] dark:text-white placeholder-[#5c6370] dark:placeholder-[#a7adbb] focus:border-[#e03e3e] focus:outline-none focus:ring-1 focus:ring-[#e03e3e] caret-[#e03e3e] min-h-[44px]"
            />
          </div>

          <div>
            <label htmlFor="trial-firstRideDate" className="block text-xs text-[#5c6370] dark:text-[#a7adbb] mb-1">
              Date envisagée pour votre premier samedi (optionnel)
            </label>
            <input
              id="trial-firstRideDate"
              type="date"
              value={formData.firstRideDate}
              onChange={(e) => setFormData({ ...formData, firstRideDate: e.target.value })}
              className="w-full rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#101216] px-3.5 py-2.5 text-xs text-[#101216] dark:text-white placeholder-[#5c6370] dark:placeholder-[#a7adbb] focus:border-[#e03e3e] focus:outline-none focus:ring-1 focus:ring-[#e03e3e] caret-[#e03e3e] min-h-[44px]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="trial-message" className="block text-xs text-[#5c6370] dark:text-[#a7adbb] mb-1">
            Remarques ou questions éventuelles pour les capitaines
          </label>
          <textarea
            id="trial-message"
            rows={3}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Ex : Je roule habituellement seul à 27 km/h, j'aimerais tester le peloton en groupe B..."
            className="w-full rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#101216] px-3.5 py-2.5 text-xs text-[#101216] dark:text-white placeholder-[#5c6370] dark:placeholder-[#a7adbb] focus:border-[#e03e3e] focus:outline-none focus:ring-1 focus:ring-[#e03e3e] caret-[#e03e3e]"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.06em] transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-[#e03e3e]/20"
        >
          {isSubmitting ? (
            <>
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
              <span>Enregistrement en cours...</span>
            </>
          ) : (
            <>
              <span>Confirmer ma demande d&apos;essai gratuite</span>
              <PaperAirplaneIcon className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
