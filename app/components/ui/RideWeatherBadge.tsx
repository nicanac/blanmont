'use client';

import React, { useEffect, useState } from 'react';
import { getRideWeather, type RideWeather } from '@/app/lib/weather';

interface RideWeatherBadgeProps {
  isoDate?: string;
  departure?: string;
  compact?: boolean;
}

export default function RideWeatherBadge({ isoDate, departure, compact = false }: RideWeatherBadgeProps) {
  const [weather, setWeather] = useState<RideWeather | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isoDate) return;

    let isMounted = true;
    setLoading(true);

    getRideWeather(isoDate, departure)
      .then((data) => {
        if (isMounted) {
          setWeather(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isoDate, departure]);

  if (!isoDate || loading) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-xl bg-[#f2efe9] px-2.5 py-1 text-xs text-[#5c6370] animate-pulse">
        <span>🌤️</span>
        <span className="text-xs">Météo...</span>
      </div>
    );
  }

  if (!weather || !weather.isAvailable) {
    if (compact) return null;
    return (
      <div className="inline-flex items-center gap-1 rounded-xl bg-[#f2efe9] px-2.5 py-1 text-xs font-medium text-[#5c6370] border border-[#e4e0d8]">
        <span>📅</span>
        <span>Météo disponible J-14</span>
      </div>
    );
  }

  // Wind direction arrow rotation:
  // An arrow pointing UP (↑, 0°) means blowing towards North.
  // Wind FROM South (180°) blows towards North (↑ = 0deg).
  // Wind FROM North (0°) blows towards South (↓ = 180deg).
  // Formula: (windDirection + 180) % 360
  const arrowAngle = (weather.windDirection + 180) % 360;

  if (compact) {
    return (
      <div
        className="inline-flex items-center gap-2 rounded-lg bg-sky-50 px-2 py-0.5 text-xs text-sky-900 border border-sky-100 font-medium"
        title={`${weather.condition} • ${weather.temperature}°C • ${weather.windDescription} à ${weather.windSpeed} km/h • Pluie: ${weather.precipitationProb}%`}
      >
        <span>{weather.icon}</span>
        <span className="font-bold">{weather.temperature}°C</span>
        <span className="text-slate-300">•</span>
        <span className="flex items-center gap-0.5 text-[#3a3f4a]">
          <span
            className="inline-block transition-transform text-sky-600 font-black text-xs"
            style={{ transform: `rotate(${arrowAngle}deg)` }}
          >
            ↑
          </span>
          <span>{weather.windSpeed} km/h {weather.windCardinal}</span>
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-md bg-gradient-to-br from-sky-50 via-white to-sky-50/60 p-3.5 border border-sky-200/80 shadow-xs space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{weather.icon}</span>
          <div>
            <div className="text-xs font-bold text-[#101216]">
              {weather.condition}
            </div>
            <div className="text-xs text-[#5c6370]">
              Prévisions pour le départ {departure ? `(${departure})` : ''}
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-[#101216] tabular-nums">
            {weather.temperature}°C
          </span>
          {weather.precipitationProb > 10 && (
            <div className="text-xs font-semibold text-sky-700">
              💧 {weather.precipitationProb}% pluie
            </div>
          )}
        </div>
      </div>

      {/* Wind & Riding Strategy */}
      <div className="flex items-center justify-between pt-2 border-t border-sky-100/80 text-xs">
        <div className="flex items-center gap-1.5 font-medium text-[#3a3f4a]">
          <span className="text-sm">💨</span>
          <span>
            Vent : <strong className="text-[#101216]">{weather.windSpeed} km/h</strong> ({weather.windCardinal})
          </span>
          <span
            className="inline-block text-sky-600 font-bold text-xs"
            style={{ transform: `rotate(${arrowAngle}deg)` }}
            title={`Direction du vent: ${weather.windDirection}° (${weather.windCardinal})`}
          >
            ↑
          </span>
        </div>

        <span className="text-xs font-medium text-[#3a3f4a] bg-white px-2 py-0.5 rounded-full border border-sky-200/60">
          {weather.windSpeed < 15 ? 'Vent faible' : weather.windSpeed < 30 ? 'Vent modéré' : 'Vent soutenu ⚠️'}
        </span>
      </div>
    </div>
  );
}
