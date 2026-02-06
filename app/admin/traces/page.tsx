'use client';

import React from 'react';
import Link from 'next/link';
import {
  PlusCircleIcon,
  CloudArrowUpIcon,
  MapIcon,
} from '@heroicons/react/24/outline';

export default function AdminTracesPage(): React.ReactElement {
  const traceActions = [
    {
      name: 'Ajouter une Trace',
      description: 'Créer une nouvelle trace GPS manuellement',
      href: '/admin/add-trace',
      icon: PlusCircleIcon,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      name: 'Importer depuis Strava',
      description: 'Synchroniser vos traces depuis votre compte Strava',
      href: '/import/strava',
      icon: CloudArrowUpIcon,
      color: 'bg-orange-600 hover:bg-orange-700',
    },
    {
      name: 'Importer depuis GPX',
      description: 'Uploader un fichier GPX depuis Garmin ou autre',
      href: '/import/garmin',
      icon: CloudArrowUpIcon,
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      name: 'Gérer les Traces',
      description: 'Voir et modifier toutes les traces publiées',
      href: '/traces',
      icon: MapIcon,
      color: 'bg-purple-600 hover:bg-purple-700',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Traces</h1>
        <p className="mt-2 text-sm text-gray-500">
          Ajoutez, importez et gérez les traces GPS du club
        </p>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {traceActions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${action.color} transition-colors`}>
                <action.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                  {action.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">{action.description}</p>
              </div>
            </div>
            
            {/* Hover Arrow */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Info Section */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600">
            <svg
              className="h-4 w-4 text-white"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-900">À propos des traces</h4>
            <p className="mt-1 text-sm text-blue-700">
              Les traces GPS permettent aux membres de découvrir de nouveaux parcours. 
              Vous pouvez les ajouter manuellement, les importer depuis Strava, ou uploader des fichiers GPX.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
