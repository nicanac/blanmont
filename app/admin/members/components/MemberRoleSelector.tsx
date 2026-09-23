'use client';

import React, { useState } from 'react';
import {
  ShieldCheckIcon,
  BanknotesIcon,
  DocumentTextIcon,
  KeyIcon,
  UserIcon,
  CheckIcon,
  PlusIcon,
  XMarkIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { BicycleIcon } from '@/app/components/ui/CyclingIcons';
import {
  CLUB_ROLES,
  hasClubRole,
  toggleClubRole,
  extractCustomRoles,
  SUGGESTED_SPECIALTIES,
} from '@/app/constants/roles';

interface MemberRoleSelectorProps {
  roles: string[];
  onChange: (roles: string[]) => void;
}

export default function MemberRoleSelector({
  roles,
  onChange,
}: MemberRoleSelectorProps): React.ReactElement {
  const [customInput, setCustomInput] = useState('');
  const customRoles = extractCustomRoles(roles);

  const getRoleIcon = (key: string) => {
    switch (key) {
      case 'Capitaine de Route':
        return <BicycleIcon className="h-5 w-5 shrink-0 text-brand" />;
      case 'Président':
        return <ShieldCheckIcon className="h-5 w-5 shrink-0 text-brand" />;
      case 'Trésorier':
        return <BanknotesIcon className="h-5 w-5 shrink-0 text-amber-600" />;
      case 'Secrétaire':
        return <DocumentTextIcon className="h-5 w-5 shrink-0 text-sky-600" />;
      case 'Admin':
        return <KeyIcon className="h-5 w-5 shrink-0 text-ink" />;
      case 'Member':
      default:
        return <UserIcon className="h-5 w-5 shrink-0 text-ink-3" />;
    }
  };

  const getBadgeCategory = (key: string) => {
    switch (key) {
      case 'Capitaine de Route':
        return 'Peloton & Terrain';
      case 'Président':
      case 'Trésorier':
      case 'Secrétaire':
        return 'Bureau & Comité';
      case 'Admin':
        return 'Gestion Back-office';
      case 'Member':
      default:
        return 'Adhérent';
    }
  };

  const handleToggle = (roleKey: string) => {
    const isCurrentlyActive = hasClubRole(roles, roleKey);
    const updated = toggleClubRole(roles, roleKey, !isCurrentlyActive);
    onChange(updated);
  };

  const handleAddCustomRole = (roleToAdd?: string) => {
    const roleName = (roleToAdd || customInput).trim();
    if (!roleName) return;

    // Check if already exists in custom roles (case-insensitive)
    const exists = customRoles.some((r) => r.toLowerCase() === roleName.toLowerCase());
    if (!exists) {
      onChange([...roles, roleName]);
    }
    setCustomInput('');
  };

  const handleRemoveCustomRole = (roleToRemove: string) => {
    const updated = roles.filter(
      (r) => r.toLowerCase().trim() !== roleToRemove.toLowerCase().trim()
    );
    onChange(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomRole();
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold tracking-tight text-ink">
            Rôle(s) &amp; Responsabilités au Club
          </label>
          <span className="text-xs text-ink-3">
            Sélection multiple autorisée
          </span>
        </div>
        <p className="mt-1 text-xs text-ink-3 leading-relaxed">
          Désignez le rôle du membre (ex. <strong>Capitaine de Route</strong> pour l&apos;encadrement des pelotons ou <strong>Bureau</strong> pour la direction).
        </p>
      </div>

      {/* Standard Roles Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CLUB_ROLES.map((roleDef) => {
          const isActive = hasClubRole(roles, roleDef.key);

          return (
            <div
              key={roleDef.key}
              role="checkbox"
              aria-checked={isActive}
              tabIndex={0}
              onClick={() => handleToggle(roleDef.key)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  handleToggle(roleDef.key);
                }
              }}
              className={`relative flex flex-col justify-between p-4 rounded-lg border text-left cursor-pointer transition-all select-none ${
                isActive
                  ? 'border-brand bg-paper shadow-xs ring-1 ring-brand/30'
                  : 'border-line bg-white hover:border-snow-2 hover:bg-paper'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`flex h-8 w-8 md:h-8 md:w-8 items-center justify-center rounded-md border transition-colors ${
                        isActive
                          ? 'border-brand/30 bg-white shadow-xs'
                          : 'border-line bg-paper'
                      }`}
                    >
                      {getRoleIcon(roleDef.key)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-ink truncate">
                        {roleDef.label}
                      </h4>
                      <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-ink-3">
                        {getBadgeCategory(roleDef.key)}
                      </span>
                    </div>
                  </div>

                  {/* Check Indicator */}
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                      isActive
                        ? 'border-brand bg-brand text-white'
                        : 'border-line-strong bg-white'
                    }`}
                  >
                    {isActive && <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />}
                  </div>
                </div>

                <p className="mt-2.5 text-xs text-ink-3 leading-snug">
                  {roleDef.description}
                </p>
              </div>

              {/* Bottom Tag Preview */}
              <div className="mt-3 pt-2.5 border-t border-line/80 flex items-center justify-between">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wider border ${roleDef.badgeStyle}`}
                >
                  {roleDef.key}
                </span>
                <span className="text-xs font-medium text-ink-3">
                  {isActive ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Specialized & Custom Roles (Traceur, Resp. Calendrier, Resp. Maillots...) */}
      <div className="rounded-lg border border-line bg-paper p-4 space-y-3">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-4 w-4 text-brand" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink">
            Spécialités &amp; Rôles Personnalisés
          </h4>
        </div>
        <p className="text-xs text-ink-3 leading-relaxed">
          Pour les fonctions spécifiques (ex. <em>Traceur</em>, <em>Resp. Calendrier</em>, <em>Resp. maillots</em>, <em>Vice-Président</em>).
        </p>

        {/* Existing Custom Tags */}
        {customRoles.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {customRoles.map((cRole) => (
              <span
                key={cRole}
                className="inline-flex items-center gap-1.5 rounded-full bg-white border border-line px-3 py-1 text-xs font-semibold text-ink shadow-xs"
              >
                <span>{cRole}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCustomRole(cRole)}
                  className="rounded-full p-0.5 text-ink-3 hover:bg-line hover:text-ink transition-colors"
                  title={`Supprimer ${cRole}`}
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Input to Add Specialty */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <div className="relative flex-1">
            <input
              id="custom-role-input"
              type="text"
              aria-label="Ajouter un rôle sur mesure"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ajouter un rôle sur mesure (ex: Traceur, Resp. Calendrier...)"
              className="w-full rounded-md border border-line bg-white px-3.5 py-2 text-xs text-ink placeholder:text-ink-3 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors shadow-xs"
            />
          </div>
          <button
            type="button"
            onClick={() => handleAddCustomRole()}
            disabled={!customInput.trim()}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-line bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink hover:bg-paper-2 disabled:opacity-40 transition-colors shadow-xs"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            <span>Ajouter</span>
          </button>
        </div>

        {/* Suggested Quick Add Chips */}
        <div className="pt-2 border-t border-line/60">
          <span className="block text-xs font-semibold uppercase tracking-wider text-ink-3 mb-1.5">
            Suggestions rapides :
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_SPECIALTIES.map((suggestion) => {
              const alreadyHas = customRoles.some(
                (r) => r.toLowerCase() === suggestion.toLowerCase()
              );
              if (alreadyHas) return null;

              return (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleAddCustomRole(suggestion)}
                  className="inline-flex items-center gap-1 rounded-md border border-dashed border-line-strong bg-white/70 px-2 py-0.5 text-xs font-medium text-ink-3 hover:border-brand hover:text-brand hover:bg-white transition-colors"
                >
                  <PlusIcon className="h-3 w-3" />
                  <span>{suggestion}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
