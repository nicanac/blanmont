'use client';

import React, { useState } from 'react';
import { XMarkIcon, PlayIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useFocusTrap } from '@/app/hooks/useFocusTrap';
import { cn } from '@/app/utils/cn';

export interface TutorialTabConfig {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
}

export interface AdminTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour?: () => void;
  title: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColorClass?: string;
  tabs: TutorialTabConfig[];
  tourButtonLabel?: string;
}

export default function AdminTutorialModal({
  isOpen,
  onClose,
  onStartTour,
  title,
  badge = 'Guide d’utilisation',
  icon: HeaderIcon,
  iconColorClass = 'bg-[#e03e3e]/20 text-[#e03e3e] border-[#e03e3e]/40',
  tabs,
  tourButtonLabel = 'Lancer la visite guidée',
}: AdminTutorialModalProps): React.ReactElement | null {
  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id || '');
  const modalRef = useFocusTrap<HTMLDivElement>({ isOpen, onClose });

  if (!isOpen) return null;

  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-tutorial-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
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
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-md border',
                iconColorClass
              )}
            >
              <HeaderIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="admin-tutorial-title"
                  className="text-base font-extrabold uppercase tracking-tight text-white"
                >
                  {title}
                </h2>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#a7adbb]">
                  {badge}
                </span>
              </div>
              <p className="text-xs text-[#a7adbb]">
                Consultez les bonnes pratiques ou lancez le guidage interactif pas-à-pas.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#a7adbb] hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#262b38] bg-[#0d0f14] px-6 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = tab.id === (currentTab?.id || '');
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer',
                  isActive
                    ? 'border-[#e03e3e] text-white bg-white/5'
                    : 'border-transparent text-[#a7adbb] hover:text-white hover:bg-white/[0.02]'
                )}
              >
                {tab.icon && <tab.icon className="h-4 w-4" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          {currentTab?.content}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#262b38] bg-[#161922] px-6 py-4">
          {onStartTour ? (
            <button
              type="button"
              onClick={onStartTour}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors shadow-xs cursor-pointer"
            >
              <PlayIcon className="h-4 w-4" />
              <span>{tourButtonLabel}</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-[#262b38] bg-white/5 hover:bg-white/10 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors cursor-pointer"
          >
            <CheckIcon className="h-4 w-4 text-emerald-400" />
            <span>Compris, fermer</span>
          </button>
        </div>
      </div>
    </div>
  );
}
