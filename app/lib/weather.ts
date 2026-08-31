/**
 * Weather & Wind service powered by Open-Meteo API.
 * Default location: Blanmont / Chastre (Brabant Wallon, Belgique): 50.6092° N, 4.6366° E.
 */

export interface RideWeather {
  isAvailable: boolean;
  date: string;
  temperature: number;
  tempMin?: number;
  tempMax?: number;
  weatherCode: number;
  condition: string;
  icon: string;
  windSpeed: number; // km/h
  windDirection: number; // 0-360 degrees
  windCardinal: string; // "N", "NE", "E", "SE", "S", "SO", "O", "NO"
  windDescription: string;
  precipitationProb: number; // percentage (0-100)
}

const DEFAULT_LAT = 50.6092;
const DEFAULT_LON = 4.6366;

export function getWindCardinal(degrees: number): { cardinal: string; name: string } {
  const normalized = ((degrees % 360) + 360) % 360;
  if (normalized >= 337.5 || normalized < 22.5) return { cardinal: 'N', name: 'Nord' };
  if (normalized >= 22.5 && normalized < 67.5) return { cardinal: 'NE', name: 'Nord-Est' };
  if (normalized >= 67.5 && normalized < 112.5) return { cardinal: 'E', name: 'Est' };
  if (normalized >= 112.5 && normalized < 157.5) return { cardinal: 'SE', name: 'Sud-Est' };
  if (normalized >= 157.5 && normalized < 202.5) return { cardinal: 'S', name: 'Sud' };
  if (normalized >= 202.5 && normalized < 247.5) return { cardinal: 'SO', name: 'Sud-Ouest' };
  if (normalized >= 247.5 && normalized < 292.5) return { cardinal: 'O', name: 'Ouest' };
  return { cardinal: 'NO', name: 'Nord-Ouest' };
}

export function getWeatherConditionInfo(code: number): { condition: string; icon: string } {
  switch (code) {
    case 0:
      return { condition: 'Ciel dégagé', icon: '☀️' };
    case 1:
      return { condition: 'Principalement dégagé', icon: '🌤️' };
    case 2:
      return { condition: 'Éclaircies', icon: '⛅' };
    case 3:
      return { condition: 'Couvert', icon: '☁️' };
    case 45:
    case 48:
      return { condition: 'Brume / Brouillard', icon: '🌫️' };
    case 51:
    case 53:
    case 55:
      return { condition: 'Bruine légère', icon: '🌦️' };
    case 61:
    case 63:
      return { condition: 'Pluie modérée', icon: '🌧️' };
    case 65:
      return { condition: 'Forte pluie', icon: '🌧️' };
    case 71:
    case 73:
    case 75:
      return { condition: 'Chutes de neige', icon: '❄️' };
    case 80:
    case 81:
    case 82:
      return { condition: 'Averses', icon: '🌦️' };
    case 95:
    case 96:
    case 99:
      return { condition: 'Risque d\'orage', icon: '⛈️' };
    default:
      return { condition: 'Variable', icon: '⛅' };
  }
}

/**
 * Parses time string like "8h30", "09:00", "13h" into an integer hour (0-23).
 */
export function parseHour(departureStr?: string): number {
  if (!departureStr) return 9; // Default morning 9h
  const match = departureStr.match(/(\d{1,2})/);
  if (match) {
    const val = parseInt(match[1], 10);
    if (val >= 0 && val <= 23) return val;
  }
  return 9;
}

/**
 * Fetches weather forecast from Open-Meteo for a specific ride date and departure time.
 */
export async function getRideWeather(
  isoDate: string,
  departureTime?: string,
  latitude = DEFAULT_LAT,
  longitude = DEFAULT_LON
): Promise<RideWeather | null> {
  if (!isoDate) return null;

  try {
    const targetDate = new Date(isoDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const diffDays = Math.round((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Open-Meteo forecast is available for today up to 14 days ahead
    if (diffDays < 0 || diffDays > 14) {
      return {
        isAvailable: false,
        date: isoDate,
        temperature: 0,
        weatherCode: 0,
        condition: 'Prévisions non disponibles',
        icon: '⛅',
        windSpeed: 0,
        windDirection: 0,
        windCardinal: 'N',
        windDescription: '',
        precipitationProb: 0,
      };
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weathercode,windspeed_10m,winddirection_10m,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,weathercode,windspeed_10m_max,winddirection_10m_dominant,precipitation_probability_max&timezone=Europe%2FBrussels&forecast_days=16`;

    const response = await fetch(url, {
      next: { revalidate: 1800 }, // Cache for 30 minutes
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const hour = parseHour(departureTime);
    const targetTimePrefix = `${isoDate}T${String(hour).padStart(2, '0')}:00`;

    // Find hourly index
    const hourlyTimes: string[] = data.hourly?.time || [];
    let hourlyIdx = hourlyTimes.findIndex((t) => t.startsWith(targetTimePrefix));

    if (hourlyIdx === -1) {
      // Fallback: look for just the date
      hourlyIdx = hourlyTimes.findIndex((t) => t.startsWith(isoDate));
    }

    if (hourlyIdx !== -1) {
      const weatherCode = data.hourly.weathercode[hourlyIdx] ?? 0;
      const temperature = Math.round(data.hourly.temperature_2m[hourlyIdx] ?? 15);
      const windSpeed = Math.round(data.hourly.windspeed_10m[hourlyIdx] ?? 10);
      const windDirection = Math.round(data.hourly.winddirection_10m[hourlyIdx] ?? 0);
      const precipitationProb = Math.round(data.hourly.precipitation_probability[hourlyIdx] ?? 0);

      const { condition, icon } = getWeatherConditionInfo(weatherCode);
      const { cardinal, name: cardinalName } = getWindCardinal(windDirection);

      return {
        isAvailable: true,
        date: isoDate,
        temperature,
        weatherCode,
        condition,
        icon,
        windSpeed,
        windDirection,
        windCardinal: cardinal,
        windDescription: `Vent de ${cardinalName} (${cardinal})`,
        precipitationProb,
      };
    }

    // Daily fallback if hourly wasn't matched
    const dailyDates: string[] = data.daily?.time || [];
    const dailyIdx = dailyDates.indexOf(isoDate);

    if (dailyIdx !== -1) {
      const weatherCode = data.daily.weathercode[dailyIdx] ?? 0;
      const tempMax = Math.round(data.daily.temperature_2m_max[dailyIdx] ?? 15);
      const tempMin = Math.round(data.daily.temperature_2m_min[dailyIdx] ?? 10);
      const windSpeed = Math.round(data.daily.windspeed_10m_max[dailyIdx] ?? 10);
      const windDirection = Math.round(data.daily.winddirection_10m_dominant[dailyIdx] ?? 0);
      const precipitationProb = Math.round(data.daily.precipitation_probability_max[dailyIdx] ?? 0);

      const { condition, icon } = getWeatherConditionInfo(weatherCode);
      const { cardinal, name: cardinalName } = getWindCardinal(windDirection);

      return {
        isAvailable: true,
        date: isoDate,
        temperature: tempMax,
        tempMin,
        tempMax,
        weatherCode,
        condition,
        icon,
        windSpeed,
        windDirection,
        windCardinal: cardinal,
        windDescription: `Vent dominant de ${cardinalName} (${cardinal})`,
        precipitationProb,
      };
    }

    return null;
  } catch (err) {
    console.error('Failed to fetch ride weather:', err);
    return null;
  }
}
