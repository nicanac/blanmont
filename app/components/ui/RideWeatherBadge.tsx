'use client';

import React, { useEffect, useState } from 'react';
import { getRideWeather, type RideWeather } from '@/app/lib/weather';
import { WeatherGlyph, WindArrow } from '@/app/components/carte/WeatherGlyph';
import { cn } from '@/app/utils/cn';

interface RideWeatherBadgeProps {
  isoDate?: string;
  departure?: string;
  compact?: boolean;
  theme?: 'paper' | 'dark';
}

function windLabel(speed: number): string {
  if (speed < 15) return 'Vent faible';
  if (speed < 30) return 'Vent modéré';
  return 'Vent soutenu';
}

export default function RideWeatherBadge({
  isoDate,
  departure,
  compact = false,
  theme = 'paper',
}: RideWeatherBadgeProps) {
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

  const onDark = theme === 'dark';

  if (!isoDate || loading) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-xs animate-pulse',
          onDark
            ? 'border-night-line bg-night-3 text-snow-3'
            : 'border-line bg-paper-2 text-ink-3 dark:border-night-line dark:bg-night-3 dark:text-snow-3'
        )}
      >
        <WeatherGlyph className="size-4" />
        <span className="text-xs">Météo...</span>
      </div>
    );
  }

  if (!weather || !weather.isAvailable) {
    if (compact) return null;
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-xs font-medium',
          onDark
            ? 'border-night-line bg-night-3 text-snow-3'
            : 'border-line bg-paper-2 text-ink-3 dark:border-night-line dark:bg-night-3 dark:text-snow-3'
        )}
      >
        <WeatherGlyph className="size-4" />
        <span>Météo disponible J-14</span>
      </div>
    );
  }

  const summary = `${weather.condition} • ${weather.temperature}°C • ${weather.windDescription} à ${weather.windSpeed} km/h • Pluie: ${weather.precipitationProb}%`;

  if (compact) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 rounded-sm border px-2.5 py-1 text-xs font-medium',
          onDark
            ? 'border-night-line bg-night-3 text-snow'
            : 'border-line bg-white text-ink dark:border-night-line dark:bg-night-2 dark:text-snow'
        )}
        title={summary}
      >
        <WeatherGlyph
          code={weather.weatherCode}
          className={cn('size-4', onDark ? 'text-snow' : 'text-ink dark:text-snow')}
        />
        <span className="font-bold tabular-nums">{weather.temperature}°C</span>
        <span
          className={
            onDark ? 'text-night-line-strong' : 'text-line-strong dark:text-night-line-strong'
          }
          aria-hidden="true"
        >
          |
        </span>
        <span
          className={cn(
            'flex items-center gap-1',
            onDark ? 'text-snow-2' : 'text-ink-2 dark:text-snow-2'
          )}
        >
          <WindArrow fromDeg={weather.windDirection} className="text-hydro dark:text-hydro-soft" />
          <span className="font-semibold tabular-nums">
            {weather.windSpeed} km/h {weather.windCardinal}
          </span>
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'space-y-2.5 rounded-md border p-3.5',
        onDark
          ? 'border-night-line bg-night-3 text-snow'
          : 'border-line bg-white dark:border-night-line dark:bg-night-2'
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <WeatherGlyph
            code={weather.weatherCode}
            className={cn('size-7', onDark ? 'text-snow' : 'text-ink dark:text-snow')}
          />
          <div>
            <div
              className={cn('text-xs font-bold', onDark ? 'text-snow' : 'text-ink dark:text-snow')}
            >
              {weather.condition}
            </div>
            <div className={cn('text-xs', onDark ? 'text-snow-3' : 'text-ink-3 dark:text-snow-3')}>
              Prévisions pour le départ {departure ? `(${departure})` : ''}
            </div>
          </div>
        </div>
        <div className="text-right">
          <span
            className={cn(
              'font-narrow text-lg font-extrabold tabular-nums',
              onDark ? 'text-snow' : 'text-ink dark:text-snow'
            )}
          >
            {weather.temperature}°C
          </span>
          {weather.precipitationProb > 10 && (
            <div
              className={cn(
                'text-xs font-semibold',
                onDark ? 'text-hydro-soft' : 'text-hydro dark:text-hydro-soft'
              )}
            >
              {weather.precipitationProb}% pluie
            </div>
          )}
        </div>
      </div>

      <div
        className={cn(
          'flex items-center justify-between gap-2 border-t pt-2 text-xs',
          onDark ? 'border-night-line' : 'border-line dark:border-night-line'
        )}
      >
        <div
          className={cn(
            'flex items-center gap-1.5 font-medium',
            onDark ? 'text-snow-2' : 'text-ink-2 dark:text-snow-2'
          )}
        >
          <WindArrow fromDeg={weather.windDirection} className="text-hydro dark:text-hydro-soft" />
          <span title={`Direction du vent: ${weather.windDirection}° (${weather.windCardinal})`}>
            Vent :{' '}
            <strong
              className={cn('tabular-nums', onDark ? 'text-snow' : 'text-ink dark:text-snow')}
            >
              {weather.windSpeed} km/h
            </strong>{' '}
            ({weather.windCardinal})
          </span>
        </div>

        <span
          className={cn(
            'rounded-full border px-2 py-0.5 text-xs font-semibold',
            onDark
              ? 'border-night-line text-snow-2'
              : 'border-line bg-paper text-ink-2 dark:border-night-line dark:bg-night-3 dark:text-snow-2'
          )}
        >
          {windLabel(weather.windSpeed)}
        </span>
      </div>
    </div>
  );
}
