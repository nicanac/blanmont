'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/app/lib/canvasUtils';
import {
  XMarkIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

import { useFocusTrap } from '@/app/hooks/useFocusTrap';

interface MemberCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  memberName?: string;
  aspectRatio?: number;
  onClose: () => void;
  onCropConfirmed: (croppedBlob: Blob) => Promise<void> | void;
}

export default function MemberCropModal({
  isOpen,
  imageSrc,
  memberName,
  aspectRatio = 4 / 5,
  onClose,
  onCropConfirmed,
}: MemberCropModalProps): React.ReactElement | null {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const modalRef = useFocusTrap<HTMLDivElement>({ isOpen, onClose });

  const onCropComplete = useCallback(
    (_croppedArea: unknown, pixelCrop: { x: number; y: number; width: number; height: number }) => {
      setCroppedAreaPixels(pixelCrop);
    },
    []
  );

  if (!isOpen || !imageSrc) return null;

  const handleConfirm = async (): Promise<void> => {
    if (!imageSrc || !croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedBlob) {
        throw new Error('Échec de la génération du recadrage');
      }
      await onCropConfirmed(croppedBlob);
      toast.success('Photo recadrée avec succès ! Pensez à enregistrer le membre.');
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du recadrage';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-crop-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 sm:p-6"
    >
      <div className="bg-ink border border-night-line rounded-xl overflow-hidden w-full max-w-3xl shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-night-line flex items-center justify-between bg-night">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 md:h-8 md:w-8 rounded-md bg-brand/20 border border-brand/40 flex items-center justify-center text-brand">
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 id="member-crop-title" className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                Recadrage Photo · {memberName || 'Membre'}
              </h3>
              <p className="text-xs text-snow-3">
                Ratio portrait 4:5 (exactement comme sur /members) · Glissez et zoomez pour centrer le visage
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            aria-label="Fermer le recadrage"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md p-2 text-snow-3 hover:text-white hover:bg-white/10 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Cropper Viewport */}
        <div className="relative h-[340px] sm:h-[440px] w-full bg-night">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        {/* Modal Controls & Actions */}
        <div className="p-4 sm:p-5 bg-night-2 border-t border-night-line space-y-4">
          {/* Zoom Control Bar */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-snow-3 shrink-0">
              Zoom :
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
              className="p-1 rounded text-snow-3 hover:text-white hover:bg-white/10 transition-colors"
              title="Zoom arrière"
            >
              <MagnifyingGlassMinusIcon className="h-4 w-4" />
            </button>
            <input
              id="member-crop-zoom-slider"
              type="range"
              min={1}
              max={3}
              step={0.05}
              aria-label="Niveau de zoom du recadrage photo"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-brand cursor-pointer"
            />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
              className="p-1 rounded text-snow-3 hover:text-white hover:bg-white/10 transition-colors"
              title="Zoom avant"
            >
              <MagnifyingGlassPlusIcon className="h-4 w-4" />
            </button>
            <span className="text-xs font-mono text-white shrink-0 w-12 text-right">
              {zoom.toFixed(1)}x
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-night-line">
            <p className="text-xs text-ink-3">
              Astuce : Déplacez directement le sujet à la souris ou au doigt pour un cadrage optimal.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-snow-3 hover:text-white hover:bg-white/5 rounded-md transition-colors min-h-[40px]"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 px-6 py-2 bg-brand hover:bg-brand-strong text-white text-xs font-bold uppercase tracking-wider rounded-md shadow-lg shadow-brand/25 transition-colors disabled:opacity-50 min-h-[40px]"
              >
                {isProcessing && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
                <span>{isProcessing ? 'Enregistrement...' : 'Valider ce cadrage'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
