'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  XMarkIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftEllipsisIcon,
  CheckBadgeIcon,
  TrashIcon,
  ArchiveBoxIcon,
  ClockIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { BicycleIcon } from '@/app/components/ui/CyclingIcons';
import { TrialRideRequest, TrialRideStatus, Member } from '@/app/types';
import { useFocusTrap } from '@/app/hooks/useFocusTrap';

interface ProspectDetailModalProps {
  isOpen: boolean;
  prospect: TrialRideRequest | null;
  captains: Member[];
  onClose: () => void;
  onStatusChange: (id: string, status: TrialRideStatus) => Promise<boolean>;
  onSaveDetails: (
    id: string,
    data: {
      adminNotes?: string;
      mentorCaptainId?: string;
      mentorCaptainName?: string;
      status?: TrialRideStatus;
    }
  ) => Promise<boolean>;
  onConvertToMember: (id: string) => Promise<{ success: boolean; memberId?: string; error?: string }>;
  onDelete: (id: string) => Promise<boolean>;
}

function cleanPhoneForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('0')) {
    // Belgian local format: 0475... -> 32475...
    cleaned = '32' + cleaned.substring(1);
  }
  return cleaned;
}

export default function ProspectDetailModal({
  isOpen,
  prospect,
  captains,
  onClose,
  onStatusChange,
  onSaveDetails,
  onConvertToMember,
  onDelete,
}: ProspectDetailModalProps): React.ReactElement | null {
  const modalRef = useFocusTrap<HTMLDivElement>({ isOpen, onClose });

  const [notes, setNotes] = useState('');
  const [selectedCaptainId, setSelectedCaptainId] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);
  const [convertSuccess, setConvertSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync state when prospect changes
  useEffect(() => {
    if (prospect) {
      setNotes(prospect.adminNotes || '');
      setSelectedCaptainId(prospect.mentorCaptainId || '');
      setSaveSuccess(false);
      setConvertError(null);
      setConvertSuccess(prospect.status === 'converted');
    }
  }, [prospect]);

  if (!isOpen || !prospect) return null;

  const handleSaveNotesAndMentor = async (): Promise<void> => {
    setIsSavingNotes(true);
    const chosenCaptain = captains.find((c) => c.id === selectedCaptainId);
    const success = await onSaveDetails(prospect.id, {
      adminNotes: notes,
      mentorCaptainId: selectedCaptainId || undefined,
      mentorCaptainName: chosenCaptain ? chosenCaptain.name : undefined,
    });
    setIsSavingNotes(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleStatusClick = async (newStatus: TrialRideStatus): Promise<void> => {
    await onStatusChange(prospect.id, newStatus);
  };

  const handleConvert = async (): Promise<void> => {
    if (!window.confirm(`Confirmez-vous la création du compte membre officiel pour ${prospect.name} ?`)) {
      return;
    }
    setIsConverting(true);
    setConvertError(null);
    const res = await onConvertToMember(prospect.id);
    setIsConverting(false);
    if (res.success) {
      setConvertSuccess(true);
    } else {
      setConvertError(res.error || 'Erreur lors de la conversion');
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!window.confirm(`Supprimer définitivement la candidature de ${prospect.name} ?`)) {
      return;
    }
    setIsDeleting(true);
    const success = await onDelete(prospect.id);
    setIsDeleting(false);
    if (success) {
      onClose();
    }
  };

  // Pre-formatted WhatsApp text
  const cleanPhone = cleanPhoneForWhatsApp(prospect.phone);
  const firstName = prospect.name.split(' ')[0] || prospect.name;
  const currentMentor = captains.find((c) => c.id === selectedCaptainId);
  const mentorGreeting = currentMentor
    ? `C'est ${currentMentor.name}, capitaine référent du CC Saint-Martin Blanmont`
    : `C'est le secrétariat du CC Saint-Martin Blanmont`;

  const waMessage = encodeURIComponent(
    `Bonjour ${firstName} ! 👋\n${mentorGreeting}.\n\nNous avons bien reçu ta demande pour une sortie d'essai dans le Groupe ${prospect.preferredGroup} (${prospect.bikeType}).\n\nNos sorties partent le samedi à 9h00 (ou dimanche selon météo) depuis la place de Blanmont. Serais-tu disponible pour rouler avec nous prochainement ?\n\nAu plaisir d'échanger et de rouler ensemble ! 🚴‍♂️`
  );
  const waUrl = `https://wa.me/${cleanPhone}?text=${waMessage}`;

  const pipelineSteps: { status: TrialRideStatus; label: string; desc: string }[] = [
    { status: 'pending', label: 'Nouveau', desc: 'À contacter' },
    { status: 'contacted', label: 'Contacté', desc: 'Message envoyé' },
    { status: 'ride_1', label: 'Sortie 1', desc: '1ère découverte' },
    { status: 'ride_2', label: 'Sortie 2', desc: 'Confirmation rythme' },
    { status: 'ride_3', label: 'Sortie 3', desc: 'Dernier galop d\'essai' },
    { status: 'converted', label: 'Adhésion', desc: 'Membre officiel' },
  ];

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="prospect-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#101216] text-[#101216] dark:text-white shadow-2xl overflow-hidden z-10 my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e4e0d8] dark:border-[#222730] px-6 py-4 bg-[#faf8f5] dark:bg-[#161922] shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#e03e3e]/10 text-[#e03e3e] border border-[#e03e3e]/20">
              <BicycleIcon className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="prospect-modal-title"
                className="text-lg sm:text-xl font-extrabold tracking-tight text-[#101216] dark:text-white"
              >
                {prospect.name}
              </h2>
              <p className="text-xs text-[#5c6370] dark:text-[#9ba3af]">
                Candidature déposée le{' '}
                {prospect.createdAt
                  ? new Date(prospect.createdAt).toLocaleDateString('fr-BE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Récemment'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-[#5c6370] hover:text-[#101216] dark:text-[#9ba3af] dark:hover:text-white hover:bg-[#efece5] dark:hover:bg-[#222730] transition-colors"
            title="Fermer la fiche candidat"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Quick Contact Bar & 1-Click WhatsApp Mentor */}
          <div className="rounded-lg border border-[#e4e0d8] dark:border-[#222730] bg-[#faf8f5] dark:bg-[#161922] p-4 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#5c6370] dark:text-[#9ba3af]">
              Prise de contact &amp; Accueil
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              {/* WhatsApp 1-Click */}
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-[#25D366] hover:bg-[#20bd5a] text-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                title="Envoyer un message de bienvenue WhatsApp pré-rempli"
              >
                <ChatBubbleLeftEllipsisIcon className="h-4 w-4" />
                <span>Message WhatsApp Pré-rempli</span>
              </a>

              {/* Phone Call */}
              <a
                href={`tel:${prospect.phone}`}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#e4e0d8] dark:border-[#2b313d] bg-white dark:bg-[#1f232b] px-3 py-2 text-xs font-semibold text-[#101216] dark:text-white hover:bg-[#f2efe9] dark:hover:bg-[#272d38] transition-colors"
              >
                <PhoneIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
                <span className="tabular-nums">{prospect.phone}</span>
              </a>

              {/* Email */}
              <a
                href={`mailto:${prospect.email}?subject=Votre sortie d'essai au CC Saint-Martin Blanmont`}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#e4e0d8] dark:border-[#2b313d] bg-white dark:bg-[#1f232b] px-3 py-2 text-xs font-semibold text-[#101216] dark:text-white hover:bg-[#f2efe9] dark:hover:bg-[#272d38] transition-colors"
              >
                <EnvelopeIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
                <span className="truncate max-w-[180px]">{prospect.email}</span>
              </a>
            </div>
          </div>

          {/* Cycling Profile Information */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-md border border-[#e4e0d8] dark:border-[#222730] p-3 bg-white dark:bg-[#14171e]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5c6370] dark:text-[#9ba3af] block">
                Groupe Souhaité
              </span>
              <span className="mt-1 inline-block font-extrabold text-sm text-[#101216] dark:text-white">
                Groupe {prospect.preferredGroup}
              </span>
            </div>

            <div className="rounded-md border border-[#e4e0d8] dark:border-[#222730] p-3 bg-white dark:bg-[#14171e]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5c6370] dark:text-[#9ba3af] block">
                Type de Vélo
              </span>
              <span className="mt-1 inline-block font-extrabold text-sm text-[#101216] dark:text-white">
                {prospect.bikeType}
              </span>
            </div>

            <div className="rounded-md border border-[#e4e0d8] dark:border-[#222730] p-3 bg-white dark:bg-[#14171e]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5c6370] dark:text-[#9ba3af] block">
                Niveau Déclaré
              </span>
              <span className="mt-1 inline-block font-extrabold text-sm text-[#101216] dark:text-white">
                {prospect.experienceLevel}
              </span>
            </div>

            <div className="rounded-md border border-[#e4e0d8] dark:border-[#222730] p-3 bg-white dark:bg-[#14171e]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5c6370] dark:text-[#9ba3af] block">
                1ère Sortie Voulue
              </span>
              <span className="mt-1 inline-block font-extrabold text-sm tabular-nums text-[#101216] dark:text-white">
                {prospect.firstRideDate || 'Non spécifiée'}
              </span>
            </div>
          </div>

          {/* Candidate Message */}
          {prospect.message && (
            <div className="rounded-lg border border-[#e4e0d8] dark:border-[#222730] p-4 bg-white dark:bg-[#14171e] space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5c6370] dark:text-[#9ba3af]">
                Message du candidat
              </span>
              <p className="text-xs sm:text-sm text-[#101216] dark:text-[#e4e0d8] italic whitespace-pre-wrap">
                &ldquo;{prospect.message}&rdquo;
              </p>
            </div>
          )}

          {/* Status Pipeline Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#5c6370] dark:text-[#9ba3af] block">
              Progression du Candidat (Pipeline CRM)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {pipelineSteps.map((step) => {
                const isActive = prospect.status === step.status;
                return (
                  <button
                    key={step.status}
                    type="button"
                    onClick={() => handleStatusClick(step.status)}
                    className={`rounded-md p-2.5 text-left border transition-all text-xs flex flex-col justify-between ${
                      isActive
                        ? 'border-[#e03e3e] bg-[#e03e3e]/5 dark:bg-[#e03e3e]/10 text-[#101216] dark:text-white shadow-xs font-bold ring-1 ring-[#e03e3e]'
                        : 'border-[#e4e0d8] dark:border-[#222730] bg-white dark:bg-[#16191f] text-[#5c6370] dark:text-[#9ba3af] hover:border-[#101216] dark:hover:border-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{step.label}</span>
                      {isActive && <CheckCircleIcon className="h-4 w-4 text-[#e03e3e]" />}
                    </div>
                    <span className="text-[11px] opacity-75 mt-1 font-normal">{step.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mentor Captain Assignment & Admin Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Captain Mentor Assignment */}
            <div className="space-y-2">
              <label
                htmlFor="mentor-captain"
                className="text-xs font-bold uppercase tracking-wider text-[#5c6370] dark:text-[#9ba3af] block"
              >
                Capitaine Mentor Attitré
              </label>
              <select
                id="mentor-captain"
                value={selectedCaptainId}
                onChange={(e) => setSelectedCaptainId(e.target.value)}
                className="w-full rounded-md border border-[#e4e0d8] dark:border-[#2b313d] bg-white dark:bg-[#16191f] px-3 py-2 text-xs text-[#101216] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#e03e3e]"
              >
                <option value="">-- Aucun capitaine assigné --</option>
                {captains.map((cap) => (
                  <option key={cap.id} value={cap.id}>
                    {cap.name} {cap.role?.length ? `(${Array.isArray(cap.role) ? cap.role.join(', ') : cap.role})` : ''}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[#5c6370] dark:text-[#9ba3af]">
                Le capitaine mentor prend en charge le candidat le jour de la sortie.
              </p>
            </div>

            {/* Save Button for Mentor & Notes */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleSaveNotesAndMentor}
                disabled={isSavingNotes}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#101216] hover:bg-[#222730] dark:bg-white dark:text-[#101216] dark:hover:bg-[#e4e0d8] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors shadow-xs disabled:opacity-50"
              >
                <span>{isSavingNotes ? 'Enregistrement...' : 'Enregistrer Capitaine & Notes'}</span>
                {saveSuccess && <CheckCircleIcon className="h-4 w-4 text-emerald-500" />}
              </button>
            </div>
          </div>

          {/* Admin Internal Notes Textarea */}
          <div className="space-y-2">
            <label
              htmlFor="prospect-notes"
              className="text-xs font-bold uppercase tracking-wider text-[#5c6370] dark:text-[#9ba3af] block"
            >
              Notes Internes du Comité &amp; Débriefing Sorties
            </label>
            <textarea
              id="prospect-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Première sortie réussie le 12/09 dans le groupe B. Bonne aisance technique, souhaite commander un maillot..."
              className="w-full rounded-md border border-[#e4e0d8] dark:border-[#2b313d] bg-white dark:bg-[#16191f] p-3 text-xs text-[#101216] dark:text-white placeholder-[#9ba3af] focus:outline-hidden focus:ring-2 focus:ring-[#e03e3e]"
            />
          </div>

          {/* Member Conversion Card */}
          <div className="rounded-lg border border-[#e4e0d8] dark:border-[#222730] bg-[#faf8f5] dark:bg-[#161922] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CheckBadgeIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#101216] dark:text-white">
                  Intégration Officielle au Club
                </span>
              </div>
              <p className="text-xs text-[#5c6370] dark:text-[#9ba3af] mt-1">
                {prospect.status === 'converted' || convertSuccess
                  ? 'Ce candidat a déjà été converti en membre officiel du club.'
                  : 'Transforme directement ce prospect en compte membre sans ressaisie.'}
              </p>
              {convertError && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                  {convertError}
                </p>
              )}
            </div>

            {prospect.status === 'converted' || convertSuccess ? (
              <Link
                href="/admin/members"
                className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
              >
                <span>Voir dans l&apos;annuaire membres</span>
                <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleConvert}
                disabled={isConverting}
                className="inline-flex items-center gap-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors shadow-xs shrink-0 disabled:opacity-50"
              >
                <CheckBadgeIcon className="h-4 w-4" />
                <span>{isConverting ? 'Création...' : 'Convertir en Membre Club'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[#e4e0d8] dark:border-[#222730] px-6 py-4 bg-[#faf8f5] dark:bg-[#161922] shrink-0">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
          >
            <TrashIcon className="h-4 w-4" />
            <span>{isDeleting ? 'Suppression...' : 'Supprimer cette fiche'}</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleStatusClick('archived')}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#e4e0d8] dark:border-[#2b313d] bg-white dark:bg-[#1f232b] px-3.5 py-2 text-xs font-semibold text-[#5c6370] dark:text-[#9ba3af] hover:text-[#101216] dark:hover:text-white hover:bg-[#efece5] dark:hover:bg-[#272d38] transition-colors"
            >
              <ArchiveBoxIcon className="h-4 w-4" />
              <span>Sans suite / Archiver</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-[#101216] hover:bg-[#222730] dark:bg-white dark:text-[#101216] dark:hover:bg-[#e4e0d8] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
