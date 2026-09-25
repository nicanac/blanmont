'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { parsePdfForPreviewAction, saveImportedEventsAction } from './actions';
import { CalendarEvent } from '@/app/types';
import {
  ArrowLeftIcon,
  DocumentArrowUpIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  TrashIcon,
  PlusIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { toast } from 'sonner';

interface PreviewEventItem extends CalendarEvent {
  selected: boolean;
}

export default function ImportEventsPage() {
  const router = useRouter();
  const [step, setStep] = useState<'upload' | 'preview' | 'success'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [events, setEvents] = useState<PreviewEventItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number>(0);

  // Step 1: Upload and Parse PDF
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setFileName(file.name);
    const formData = new FormData();
    formData.append('file', file);

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const response = await parsePdfForPreviewAction(formData);
      if (response.success && response.events && response.events.length > 0) {
        setEvents(
          response.events.map((ev, index) => ({
            ...ev,
            id: ev.id || `temp-${index + 1}`,
            selected: true,
          }))
        );
        setStep('preview');
      } else {
        setErrorMessage(response.message || 'Aucun événement détecté dans le PDF.');
      }
    } catch (error) {
      console.error('Error parsing PDF:', error);
      setErrorMessage(
        'Une erreur est survenue lors du traitement du fichier: ' +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Selection toggle
  const toggleSelectAll = (select: boolean) => {
    setEvents((prev) => prev.map((e) => ({ ...e, selected: select })));
  };

  const toggleSelectEvent = (id: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, selected: !e.selected } : e))
    );
  };

  // Field change
  const handleFieldChange = (id: string, field: keyof CalendarEvent, value: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  // Delete line
  const handleDeleteRow = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // Add empty row
  const handleAddManualRow = () => {
    const today = new Date().toISOString().split('T')[0];
    const newEvent: PreviewEventItem = {
      id: `manual-${Date.now()}`,
      isoDate: today,
      location: 'Place de Blanmont',
      distances: '70-90',
      departure: '8h30',
      address: 'Place de Blanmont',
      remarks: '',
      alternative: '',
      group: 'Blanmont',
      gpxUrl: '',
      selected: true,
    };
    setEvents((prev) => [newEvent, ...prev]);
  };

  // Step 2: Confirm and Save to Firebase
  const handleConfirmImport = async () => {
    const selectedEvents = events.filter((e) => e.selected);
    if (selectedEvents.length === 0) {
      toast.error('Veuillez sélectionner au moins un événement à importer.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const cleanEventsToSave: CalendarEvent[] = selectedEvents.map((e) => ({
        id: e.id,
        isoDate: e.isoDate,
        location: e.location,
        distances: e.distances,
        departure: e.departure,
        address: e.address,
        remarks: e.remarks,
        alternative: e.alternative,
        group: e.group || 'Blanmont',
        gpxUrl: e.gpxUrl || '',
      }));

      const res = await saveImportedEventsAction(cleanEventsToSave);
      if (res.success) {
        setSuccessCount(res.count || selectedEvents.length);
        setStep('success');
      } else {
        setErrorMessage(res.message || 'Échec de l’importation.');
      }
    } catch (error) {
      console.error('Error saving events:', error);
      setErrorMessage(
        'Erreur lors de l’enregistrement: ' +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCount = events.filter((e) => e.selected).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/events"
            className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white transition-colors duration-150"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Importation du Calendrier (PDF)
            </h1>
            <p className="text-xs text-ink-3 dark:text-snow-3">
              Extraction en 2 étapes : Prévisualisation, correction et enregistrement officiel.
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 text-xs font-semibold font-mono">
          <span
            className={`px-3 py-1 rounded-full ${
              step === 'upload'
                ? 'bg-brand text-white'
                : 'bg-vert/10 border border-vert/30 text-vert dark:text-vert-light'
            }`}
          >
            1. Sélection PDF
          </span>
          <span className="text-ink-3 dark:text-snow-3">→</span>
          <span
            className={`px-3 py-1 rounded-full ${
              step === 'preview'
                ? 'bg-brand text-white'
                : step === 'success'
                  ? 'bg-vert/10 border border-vert/30 text-vert dark:text-vert-light'
                  : 'bg-paper-2 dark:bg-night-3 text-ink-3 dark:text-snow-3 border border-line dark:border-night-line'
            }`}
          >
            2. Prévisualisation & Validation
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-sm bg-brand/10 p-4 border border-brand/30 flex items-start gap-3">
          <ExclamationCircleIcon className="h-5 w-5 text-brand shrink-0 mt-0.5" />
          <div className="text-sm text-brand font-medium">{errorMessage}</div>
        </div>
      )}

      {/* STEP 1: UPLOAD */}
      {step === 'upload' && (
        <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-8 sm:p-12 text-center">
          <div className="max-w-md mx-auto space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-sm bg-brand/10 text-brand border border-brand/20">
              <DocumentArrowUpIcon className="h-8 w-8 md:h-8 md:w-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-ink dark:text-snow-1 font-semiwide">
                Sélectionnez le fichier PDF officiel
              </h2>
              <p className="text-xs text-ink-3 dark:text-snow-3 leading-relaxed">
                Le fichier sera analysé automatiquement pour en extraire les dates, destinations, départs et distances avant validation.
              </p>
            </div>

            <label htmlFor="events-pdf-upload" className="relative flex cursor-pointer flex-col items-center justify-center rounded-sm border border-dashed border-line dark:border-night-line bg-paper-2 dark:bg-night p-8 hover:border-brand hover:bg-brand/5 transition-colors duration-150 group">
              <span className="text-sm font-semibold text-ink-2 dark:text-snow-2 group-hover:text-brand transition-colors duration-150 font-mono">
                {isProcessing
                  ? 'Extraction des événements en cours...'
                  : 'Choisir le calendrier PDF'}
              </span>
              <span className="mt-1 text-xs text-ink-3 dark:text-snow-3 font-mono">Format .pdf accepté</span>
              <input
                id="events-pdf-upload"
                type="file"
                aria-label="Choisir le calendrier PDF"
                className="hidden"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={isProcessing}
              />
            </label>

            {isProcessing && (
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-ink-2 dark:text-snow-2 font-mono">
                <ArrowPathIcon className="h-4 w-4 animate-spin text-brand" />
                <span>Analyse du document et extraction des sorties...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: PREVIEW & EDIT TABLE */}
      {step === 'preview' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="rounded-md bg-paper dark:bg-night-2 border border-line dark:border-night-line p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {events.length} sorties extraites
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/30 text-brand">
                {selectedCount} sélectionnées pour l&apos;import
              </span>
              {fileName && (
                <span className="text-xs text-ink-3 dark:text-snow-3 truncate max-w-xs">
                  Fichier : {fileName}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => toggleSelectAll(true)}
                className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-md border border-line dark:border-night-line hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-150"
              >
                Tout cocher
              </button>
              <button
                type="button"
                onClick={() => toggleSelectAll(false)}
                className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-md border border-line dark:border-night-line hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-150"
              >
                Tout décocher
              </button>
              <button
                type="button"
                onClick={handleAddManualRow}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-ink hover:bg-slate-100 dark:hover:bg-white/10 transition-colors duration-150"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                <span>Ajouter une ligne</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('upload');
                  setEvents([]);
                }}
                className="text-xs font-semibold text-brand hover:text-brand-strong px-3 py-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors duration-150"
              >
                Recharger un PDF
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="min-w-full divide-y divide-line dark:divide-night-line text-left text-xs">
                <thead className="bg-paper-2 dark:bg-night sticky top-0 z-10 font-mono text-ink-3 dark:text-snow-3">
                  <tr>
                    <th className="px-3 py-3 w-10 text-center">
                      <span className="sr-only">Sélectionner</span>
                    </th>
                    <th className="px-3 py-3 font-bold text-ink dark:text-snow-1 min-w-[130px]">
                      Date (YYYY-MM-DD)
                    </th>
                    <th className="px-3 py-3 font-bold text-ink dark:text-snow-1 min-w-[180px]">
                      Destination / Lieu
                    </th>
                    <th className="px-3 py-3 font-bold text-ink dark:text-snow-1 min-w-[100px]">
                      Distances
                    </th>
                    <th className="px-3 py-3 font-bold text-ink dark:text-snow-1 min-w-[90px]">
                      Départ
                    </th>
                    <th className="px-3 py-3 font-bold text-ink dark:text-snow-1 min-w-[150px]">
                      Lieu RDV / Adresse
                    </th>
                    <th className="px-3 py-3 font-bold text-ink dark:text-snow-1 min-w-[160px]">
                      Remarques
                    </th>
                    <th className="px-3 py-3 font-bold text-ink dark:text-snow-1 min-w-[160px]">
                      Trace GPX (Lien)
                    </th>
                    <th className="px-3 py-3 w-12 text-center">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/40 dark:divide-night-line">
                  {events.map((event) => (
                    <tr
                      key={event.id}
                      className={`hover:bg-paper-2/60 dark:hover:bg-night-3/60 transition-colors duration-150 ${
                        !event.selected ? 'opacity-40 bg-paper-2/30 dark:bg-night-3/30' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-3 py-2.5 text-center">
                        <input
                          id={`event-select-${event.id}`}
                          type="checkbox"
                          aria-label={`Sélectionner l'événement du ${event.isoDate || event.location || 'nouveau'}`}
                          checked={event.selected}
                          onChange={() => toggleSelectEvent(event.id)}
                          className="h-4 w-4 rounded-xs border-line dark:border-night-line text-brand focus:ring-brand"
                        />
                      </td>

                      {/* Date */}
                      <td className="px-3 py-2.5">
                        <input
                          id={`event-date-${event.id}`}
                          type="date"
                          aria-label={`Date pour ${event.location || 'l\'événement'}`}
                          value={event.isoDate}
                          onChange={(e) =>
                            handleFieldChange(event.id, 'isoDate', e.target.value)
                          }
                          className="w-full rounded-sm border border-line dark:border-night-line bg-paper-2 dark:bg-night px-2.5 py-1 text-xs font-mono text-ink dark:text-snow-1 focus:border-brand focus:outline-hidden transition-colors duration-150"
                        />
                      </td>

                      {/* Location */}
                      <td className="px-3 py-2.5">
                        <input
                          id={`event-location-${event.id}`}
                          type="text"
                          aria-label={`Lieu pour l'événement du ${event.isoDate || 'sélectionné'}`}
                          value={event.location}
                          onChange={(e) =>
                            handleFieldChange(event.id, 'location', e.target.value)
                          }
                          className="w-full rounded-sm border border-line dark:border-night-line bg-paper-2 dark:bg-night px-2.5 py-1 text-xs font-medium text-ink dark:text-snow-1 focus:border-brand focus:outline-hidden transition-colors duration-150"
                        />
                      </td>

                      {/* Distances */}
                      <td className="px-3 py-2.5">
                        <input
                          id={`event-distances-${event.id}`}
                          type="text"
                          aria-label={`Distances pour ${event.location || 'l\'événement'}`}
                          value={event.distances || ''}
                          placeholder="70-90"
                          onChange={(e) =>
                            handleFieldChange(event.id, 'distances', e.target.value)
                          }
                          className="w-full rounded-sm border border-line dark:border-night-line bg-paper-2 dark:bg-night px-2.5 py-1 text-xs font-mono text-ink dark:text-snow-1 focus:border-brand focus:outline-hidden transition-colors duration-150"
                        />
                      </td>

                      {/* Departure */}
                      <td className="px-3 py-2.5">
                        <input
                          id={`event-departure-${event.id}`}
                          type="text"
                          aria-label={`Heure de départ pour ${event.location || 'l\'événement'}`}
                          value={event.departure || ''}
                          placeholder="8h30"
                          onChange={(e) =>
                            handleFieldChange(event.id, 'departure', e.target.value)
                          }
                          className="w-full rounded-sm border border-line dark:border-night-line bg-paper-2 dark:bg-night px-2.5 py-1 text-xs font-mono text-ink dark:text-snow-1 focus:border-brand focus:outline-hidden transition-colors duration-150"
                        />
                      </td>

                      {/* Address / RDV */}
                      <td className="px-3 py-2.5">
                        <input
                          id={`event-address-${event.id}`}
                          type="text"
                          aria-label={`Adresse de départ pour ${event.location || 'l\'événement'}`}
                          value={event.address || ''}
                          placeholder="Place de Blanmont"
                          onChange={(e) =>
                            handleFieldChange(event.id, 'address', e.target.value)
                          }
                          className="w-full rounded-sm border border-line dark:border-night-line bg-paper-2 dark:bg-night px-2.5 py-1 text-xs text-ink dark:text-snow-1 focus:border-brand focus:outline-hidden transition-colors duration-150"
                        />
                      </td>

                      {/* Remarks */}
                      <td className="px-3 py-2.5">
                        <input
                          id={`event-remarks-${event.id}`}
                          type="text"
                          aria-label={`Remarques pour ${event.location || 'l\'événement'}`}
                          value={event.remarks || ''}
                          placeholder="Optionnel"
                          onChange={(e) =>
                            handleFieldChange(event.id, 'remarks', e.target.value)
                          }
                          className="w-full rounded-sm border border-line dark:border-night-line bg-paper-2 dark:bg-night px-2.5 py-1 text-xs text-ink-3 dark:text-snow-3 focus:border-brand focus:outline-hidden transition-colors duration-150"
                        />
                      </td>

                      {/* GPX Url */}
                      <td className="px-3 py-2.5">
                        <input
                          id={`event-gpx-${event.id}`}
                          type="text"
                          aria-label={`Lien GPX pour ${event.location || 'l\'événement'}`}
                          value={event.gpxUrl || ''}
                          placeholder="Lien Strava / Garmin / GPX"
                          onChange={(e) =>
                            handleFieldChange(event.id, 'gpxUrl', e.target.value)
                          }
                          className="w-full rounded-sm border border-line dark:border-night-line bg-paper-2 dark:bg-night px-2.5 py-1 text-xs font-mono text-ink-3 dark:text-snow-3 focus:border-brand focus:outline-hidden transition-colors duration-150"
                        />
                      </td>

                      {/* Delete */}
                      <td className="px-3 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(event.id)}
                          className="rounded-sm p-1.5 text-ink-3 hover:text-brand hover:bg-paper-2 dark:hover:bg-night transition-colors duration-150 cursor-pointer"
                          title="Supprimer cette ligne"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sticky Confirmation Bar */}
          <div className="sticky bottom-4 z-20 rounded-md bg-ink border border-night-line p-4 text-snow-1 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
            <div className="text-xs sm:text-sm">
              <span className="font-bold text-white tabular-nums">{selectedCount}</span> sortie{selectedCount > 1 ? 's' : ''} prête{selectedCount > 1 ? 's' : ''} à être ajoutée{selectedCount > 1 ? 's' : ''} au calendrier.
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="px-4 py-2 rounded-sm text-xs font-semibold text-snow-3 hover:text-white hover:bg-white/10 transition-colors duration-150 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={isSaving || selectedCount === 0}
                className="inline-flex items-center gap-2 rounded-sm bg-brand hover:bg-brand-strong text-white px-6 py-2.5 text-xs sm:text-sm font-semibold transition-colors duration-150 disabled:opacity-50 cursor-pointer uppercase tracking-wider"
              >
                {isSaving ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    <span>Enregistrement dans le calendrier...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Valider et importer {selectedCount} événements</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: SUCCESS */}
      {step === 'success' && (
        <div className="rounded-md border border-vert/30 bg-paper dark:bg-night-2 p-8 sm:p-12 text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-sm bg-vert/10 text-vert border border-vert/30">
            <CheckCircleIcon className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-ink dark:text-snow-1 font-semiwide">
              Importation réussie !
            </h2>
            <p className="text-sm text-ink-2 dark:text-snow-3 max-w-md mx-auto">
              <strong className="text-vert font-mono tabular-nums">{successCount} événements</strong> ont été enregistrés dans la base de données et sont désormais visibles sur le calendrier public.
            </p>
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <Link
              href="/admin/events"
              className="inline-flex items-center rounded-sm bg-ink dark:bg-paper-2 dark:text-ink px-6 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-ink-2 dark:hover:bg-paper-3 transition-colors duration-150 font-mono"
            >
              Voir les événements dans l&apos;admin
            </Link>
            <Link
              href="/calendrier"
              className="inline-flex items-center rounded-sm bg-brand px-6 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-brand-strong transition-colors duration-150 font-mono uppercase tracking-wider"
            >
              Consulter le calendrier public
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

