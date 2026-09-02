'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { Equipment } from '../../types/equipment';
import { EQUIPMENT_CATEGORIES } from '../../data/equipment';
import { toast } from 'sonner';
import EquipementsTutorialModal from './components/EquipementsTutorialModal';
import { useAdminTours } from '../components/tours/adminTours';

export default function AdminEquipementsPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [isLoading, setIsLoading] = useState(true);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const { startEquipementsTour } = useAdminTours();

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await fetch('/api/admin/equipements');
        if (response.ok) {
          const data = await response.json();
          setEquipment(data);
        }
      } catch (error) {
        console.error('Failed to fetch equipment', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEquipment();
  }, []);

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getTotalStock = (stock: Record<string, number>) => {
    return Object.values(stock).reduce((sum, qty) => sum + qty, 0);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet équipement ?')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/equipements/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setEquipment((prev) => prev.filter((item) => item.id !== id));
        toast.success('Équipement supprimé avec succès.');
      } else {
        toast.error('Erreur lors de la suppression.');
      }
    } catch (error) {
      console.error('Error deleting equipment:', error);
      toast.error('Erreur lors de la suppression.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <EquipementsTutorialModal
        isOpen={tutorialOpen}
        onClose={() => setTutorialOpen(false)}
        onStartTour={() => {
          setTimeout(() => {
            startEquipementsTour();
          }, 200);
        }}
      />
      
      {/* Header */}
      <div id="equipements-header-section" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#e4e0d8]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#101216] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white mb-2">
            <ShoppingBagIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
            <span>Catalogue Officiel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101216]">
            Équipements Gobik
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#5c6370]">
            Gérez le stock, les tailles et les articles officiels du club.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setTutorialOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-[#e4e0d8] bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#101216] hover:bg-[#f2efe9] transition-colors shadow-xs"
            title="Ouvrir le guide des équipements"
          >
            <AcademicCapIcon className="h-4 w-4 text-[#e03e3e]" />
            <span>Tutoriel &amp; Guide</span>
          </button>

          <Link
            id="equipements-new-btn"
            href="/admin/equipements/new"
            className="inline-flex items-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors shadow-xs"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Ajouter un équipement</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div id="equipements-search-filter" className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7d8493]" />
          <input
            type="text"
            placeholder="Rechercher un équipement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-[#e4e0d8] bg-white py-2 pl-10 pr-4 text-xs sm:text-sm text-[#101216] placeholder:text-[#7d8493] focus:border-[#e03e3e] focus:outline-none transition-colors shadow-xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedCategory('Tous')}
            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${
              selectedCategory === 'Tous'
                ? 'bg-[#101216] text-white'
                : 'bg-[#f2efe9] text-[#5c6370] hover:bg-[#e4e0d8] hover:text-[#101216]'
            }`}
          >
            Tous
          </button>
          {EQUIPMENT_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${
                selectedCategory === category
                  ? 'bg-[#101216] text-white'
                  : 'bg-[#f2efe9] text-[#5c6370] hover:bg-[#e4e0d8] hover:text-[#101216]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-[#e4e0d8] bg-white p-5 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-[#7d8493]">Total Articles</p>
          <p className="mt-1 text-2xl font-extrabold text-[#101216] tabular-nums">{equipment.length}</p>
        </div>
        <div className="rounded-lg border border-[#e4e0d8] bg-white p-5 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-[#7d8493]">Disponibles</p>
          <p className="mt-1 text-2xl font-extrabold text-emerald-600 tabular-nums">
            {equipment.filter((e) => e.isAvailable).length}
          </p>
        </div>
        <div className="rounded-lg border border-[#e4e0d8] bg-white p-5 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-[#7d8493]">Stock Total</p>
          <p className="mt-1 text-2xl font-extrabold text-[#101216] tabular-nums">
            {equipment.reduce((sum, e) => sum + getTotalStock(e.stock), 0)} pièces
          </p>
        </div>
        <div className="rounded-lg border border-[#e4e0d8] bg-white p-5 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-[#7d8493]">Valeur Stock</p>
          <p className="mt-1 text-2xl font-extrabold text-[#101216] tabular-nums">
            {equipment.reduce((sum, e) => sum + e.price * getTotalStock(e.stock), 0).toLocaleString('fr-BE')} €
          </p>
        </div>
      </div>

      {/* Equipment Table */}
      <div id="equipements-grid-section" className="overflow-hidden rounded-lg border border-[#e4e0d8] bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#e4e0d8]">
            <thead className="bg-[#f2efe9]">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#7d8493]">
                  Équipement
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#7d8493]">
                  Catégorie
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#7d8493]">
                  Prix
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#7d8493]">
                  Stock
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#7d8493]">
                  Statut
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-[#7d8493]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efece5] bg-white text-xs">
              {filteredEquipment.map((item) => (
                <tr key={item.id} className="hover:bg-[#faf8f5] transition-colors">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-[#161922] border border-[#e4e0d8] flex items-center justify-center text-white">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ShoppingBagIcon className="h-5 w-5 text-[#7d8493]" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-[#101216]">{item.name}</p>
                        <p className="text-xs text-[#7d8493] line-clamp-1 max-w-xs">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex rounded-full bg-[#f2efe9] border border-[#e4e0d8] px-2.5 py-0.5 text-xs font-semibold text-[#5c6370]">
                      {item.category}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-xs font-bold text-[#101216] tabular-nums">
                    {item.price.toFixed(2)} €
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-xs font-bold text-[#101216] tabular-nums">
                      {getTotalStock(item.stock)} pièces
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.sizes.slice(0, 4).map((size) => (
                        <span
                          key={size}
                          className={`inline-flex rounded px-1.5 py-0.5 text-xs font-medium ${
                            item.stock[size] > 0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {size}: {item.stock[size] || 0}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider border ${
                        item.isAvailable
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {item.isAvailable ? 'En stock' : 'Épuisé'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/equipements/${item.id}`}
                        className="rounded-md p-1.5 text-[#7d8493] hover:bg-[#f2efe9] hover:text-[#101216] transition-colors"
                        title="Voir"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/equipements/${item.id}/edit`}
                        className="rounded-md p-1.5 text-[#7d8493] hover:bg-[#f2efe9] hover:text-[#101216] transition-colors"
                        title="Modifier"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded-md p-1.5 text-[#7d8493] hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="Supprimer"
                        disabled={isLoading}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEquipment.length === 0 && (
          <div className="px-6 py-12 text-center text-xs text-[#7d8493]">
            Aucun équipement trouvé.
          </div>
        )}
      </div>
    </div>
  );
}
