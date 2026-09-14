'use client';

import React, { useEffect, useState } from 'react';
import { ChartBarIcon, ClockIcon } from '@heroicons/react/24/outline';

interface GpxStatsDisplayProps {
  url: string;
}

interface Stats {
  distance: string;
  elevation: number;
  estimatedTime: string;
}

export const isWebUiLink = (url: string): boolean => {
  if (!url) return false;
  return /strava\.com|garmin\.com|komoot/i.test(url);
};

export default function GpxStatsDisplay({ url }: GpxStatsDisplayProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(!isWebUiLink(url));
  const [error, setError] = useState(isWebUiLink(url));

  useEffect(() => {
    if (isWebUiLink(url)) {
      setLoading(false);
      setError(true);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/gpx/stats?url=${encodeURIComponent(url)}`);
        if (!res.ok) {
          throw new Error('Failed to fetch GPX stats');
        }
        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setStats({
          distance: data.distance,
          elevation: data.elevation,
          estimatedTime: data.estimatedTime
        });
        setError(false);
      } catch (err) {
        console.error('Error fetching GPX stats:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [url]);

  // Synchronously return null if it's a web UI link
  if (isWebUiLink(url)) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-[#5c6370] dark:text-[#a7adbb] animate-pulse">
        <div className="h-3.5 w-3.5 rounded-full bg-black/10 dark:bg-white/10" />
        <span>Analyse de la trace...</span>
      </div>
    );
  }

  if (error || !stats) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#101216] dark:text-white bg-[#f2efe9] dark:bg-white/5 border border-[#e4e0d8] dark:border-white/10 px-3 py-2 rounded-md">
      <div className="flex items-center gap-1.5" title="Distance et Dénivelé">
        <ChartBarIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
        <span>
          {stats.distance} km <span className="text-[#5c6370] dark:text-[#a7adbb] px-1">•</span> D+ {stats.elevation}m
        </span>
      </div>
      <div className="flex items-center gap-1.5" title="Temps estimé (base 25km/h)">
        <ClockIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
        <span>~ {stats.estimatedTime}</span>
      </div>
    </div>
  );
}
