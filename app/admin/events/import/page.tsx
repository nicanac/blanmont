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
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Importation du Calendrier (PDF)
            </h1>
            <p className="text-xs text-slate-500">
              Extraction en 2 étapes : Prévisualisation, correction et enregistrement officiel.
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span
            className={`px-3 py-1 rounded-full ${
              step === 'upload'
                ? 'bg-[#e03e3e] text-white'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            1. Sélection PDF
          </span>
          <span className="text-slate-300">→</span>
          <span
            className={`px-3 py-1 rounded-full ${
              step === 'preview'
                ? 'bg-[#e03e3e] text-white'
                : step === 'success'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-400'
            }`}
          >
            2. Prévisualisation & Validation
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl bg-red-50 p-4 border border-red-200 flex items-start gap-3">
          <ExclamationCircleIcon className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm text-red-800 font-medium">{errorMessage}</div>
        </div>
      )}

      {/* STEP 1: UPLOAD */}
      {step === 'upload' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-xs text-center">
          <div className="max-w-md mx-auto space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-[#e03e3e]">
              <DocumentArrowUpIcon className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">
                Sélectionnez le fichier PDF officiel
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Le fichier sera analysé automatiquement pour en extraire les dates, destinations, départs et distances avant validation.
              </p>
            </div>

            <label className="relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-8 hover:bg-red-50/30 hover:border-red-300 transition-all group">
              <span className="text-sm font-semibold text-slate-700 group-hover:text-[#e03e3e] transition-colors">
                {isProcessing
                  ? 'Extraction des événements en cours...'
                  : 'Choisir le calendrier PDF'}
              </span>
              <span className="mt-1 text-xs text-slate-400">Format .pdf accepté</span>
              <input
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={isProcessing}
              />
            </label>

            {isProcessing && (
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-600">
                <ArrowPathIcon className="h-4 w-4 animate-spin text-[#e03e3e]" />
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
          <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-900">
                {events.length} sorties extraites
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-[#e03e3e]">
                {selectedCount} sélectionnées pour l&apos;import
              </span>
              {fileName && (
                <span className="text-xs text-slate-400 truncate max-w-xs">
                  Fichier : {fileName}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => toggleSelectAll(true)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Tout cocher
              </button>
              <button
                type="button"
                onClick={() => toggleSelectAll(false)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Tout décocher
              </button>
              <button
                type="button"
                onClick={handleAddManualRow}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
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
                className="text-xs font-semibold text-red-600 hover:text-red-700 px-3 py-1.5 rounded-xl hover:bg-red-50 transition-colors"
              >
                Recharger un PDF
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-3 w-10 text-center">
                      <span className="sr-only">Sélectionner</span>
                    </th>
                    <th className="px-3 py-3 font-bold text-slate-700 min-w-[130px]">
                      Date (YYYY-MM-DD)
                    </th>
                    <th className="px-3 py-3 font-bold text-slate-700 min-w-[180px]">
                      Destination / Lieu
                    </th>
                    <th className="px-3 py-3 font-bold text-slate-700 min-w-[100px]">
                      Distances
                    </th>
                    <th className="px-3 py-3 font-bold text-slate-700 min-w-[90px]">
                      Départ
                    </th>
                    <th className="px-3 py-3 font-bold text-slate-700 min-w-[150px]">
                      Lieu RDV / Adresse
                    </th>
                    <th className="px-3 py-3 font-bold text-slate-700 min-w-[160px]">
                      Remarques
                    </th>
                    <th className="px-3 py-3 font-bold text-slate-700 min-w-[160px]">
                      Trace GPX (Lien)
                    </th>
                    <th className="px-3 py-3 w-12 text-center">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {events.map((event) => (
                    <tr
                      key={event.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        !event.selected ? 'opacity-50 bg-slate-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={event.selected}
                          onChange={() => toggleSelectEvent(event.id)}
                          className="h-4 w-4 rounded border-slate-300 text-[#e03e3e] focus:ring-[#e03e3e]"
                        />
                      </td>

                      {/* Date */}
                      <td className="px-3 py-2.5">
                        <input
                          type="date"
                          value={event.isoDate}
                          onChange={(e) =>
                            handleFieldChange(event.id, 'isoDate', e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-mono text-slate-800 focus:border-[#e03e3e] focus:outline-hidden"
                        />
                      </td>

                      {/* Location */}
                      <td className="px-3 py-2.5">
                        <input
                          type="text"
                          value={event.location}
                          onChange={(e) =>
                            handleFieldChange(event.id, 'location', e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-900 focus:border-[#e03e3e] focus:outline-hidden"
                        />
                      </td>

                      {/* Distances */}
                      <td className="px-3 py-2.5">
                        <input
                          type="text"
                          value={event.distances || ''}
                          placeholder="70-90"
                          onChange={(e) =>
                            handleFieldChange(event.id, 'distances', e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-800 focus:border-[#e03e3e] focus:outline-hidden"
                        />
                      </td>

                      {/* Departure */}
                      <td className="px-3 py-2.5">
                        <input
                          type="text"
                          value={event.departure || ''}
                          placeholder="8h30"
                          onChange={(e) =>
                            handleFieldChange(event.id, 'departure', e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-800 focus:border-[#e03e3e] focus:outline-hidden"
                        />
                      </td>

                      {/* Address / RDV */}
                      <td className="px-3 py-2.5">
                        <input
                          type="text"
                          value={event.address || ''}
                          placeholder="Place de Blanmont"
                          onChange={(e) =>
                            handleFieldChange(event.id, 'address', e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-800 focus:border-[#e03e3e] focus:outline-hidden"
                        />
                      </td>

                      {/* Remarks */}
                      <td className="px-3 py-2.5">
                        <input
                          type="text"
                          value={event.remarks || ''}
                          placeholder="Optionnel"
                          onChange={(e) =>
                            handleFieldChange(event.id, 'remarks', e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 focus:border-[#e03e3e] focus:outline-hidden"
                        />
                      </td>

                      {/* GPX Url */}
                      <td className="px-3 py-2.5">
                        <input
                          type="text"
                          value={event.gpxUrl || ''}
                          placeholder="Lien Strava / Garmin / GPX"
                          onChange={(e) =>
                            handleFieldChange(event.id, 'gpxUrl', e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-mono text-slate-600 focus:border-[#e03e3e] focus:outline-hidden"
                        />
                      </td>

                      {/* Delete */}
                      <td className="px-3 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(event.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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
          <div className="sticky bottom-4 z-20 rounded-2xl bg-slate-900/95 backdrop-blur-md p-4 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs sm:text-sm">
              <span className="font-bold text-white">{selectedCount}</span> sortie{selectedCount > 1 ? 's' : ''} prête{selectedCount > 1 ? 's' : ''} à être ajoutée{selectedCount > 1 ? 's' : ''} au calendrier.
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="px-4 py-2 rounded-full text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={isSaving || selectedCount === 0}
                className="inline-flex items-center gap-2 rounded-full bg-[#e03e3e] hover:bg-[#c93434] text-white px-6 py-2.5 text-xs sm:text-sm font-semibold shadow-md transition-all disabled:opacity-50"
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
        <div className="rounded-3xl border border-emerald-200 bg-white p-8 sm:p-12 shadow-xs text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <CheckCircleIcon className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">
              Importation réussie !
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              <strong className="text-emerald-700">{successCount} événements</strong> ont été enregistrés dans la base de données et sont désormais visibles sur le calendrier public.
            </p>
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <Link
              href="/admin/events"
              className="inline-flex items-center rounded-full bg-slate-900 px-6 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              Voir les événements dans l&apos;admin
            </Link>
            <Link
              href="/calendrier"
              className="inline-flex items-center rounded-full bg-[#e03e3e] px-6 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-[#c93434] transition-colors"
            >
              Consulter le calendrier public
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

