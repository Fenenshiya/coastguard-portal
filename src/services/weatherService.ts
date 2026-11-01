import { BeachWeather, TideInfo } from '../types';
import { SEED_WEATHER } from '../data/seedData';

// Map WMO Weather Interpretation Codes
export function getWeatherInterpretation(code: number): string {
  switch (code) {
    case 0: return 'Clear sky';
    case 1: return 'Mainly clear';
    case 2: return 'Partly cloudy';
    case 3: return 'Overcast';
    case 45: case 48: return 'Coastal fog';
    case 51: case 53: case 55: return 'Light drizzle';
    case 61: case 63: case 65: return 'Rain showers';
    case 80: case 81: case 82: return 'Heavy rain showers';
    case 95: case 96: case 99: return 'Thunderstorm warning';
    default: return 'Fair conditions';
  }
}

export function getUVDescription(uv: number): 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme' {
  if (uv <= 2) return 'Low';
  if (uv <= 5) return 'Moderate';
  if (uv <= 7) return 'High';
  if (uv <= 10) return 'Very High';
  return 'Extreme';
}

export function calculateRipRisk(waveHeightM: number, wavePeriodSec: number, windSpeedKmh: number): 'low' | 'moderate' | 'high' {
  // Rip current risk increases with swell height, period energy, and onshore wind
  const energyIndex = waveHeightM * waveHeightM * wavePeriodSec;
  if (energyIndex > 30 || windSpeedKmh > 35) return 'high';
  if (energyIndex > 14 || windSpeedKmh > 20) return 'moderate';
  return 'low';
}

export async function fetchLiveBeachWeather(beachId: string, lat: number, lng: number): Promise<BeachWeather> {
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index&timezone=auto`;
    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&current=wave_height,wave_direction,wave_period&timezone=auto`;

    const [weatherRes, marineRes] = await Promise.allSettled([
      fetch(weatherUrl),
      fetch(marineUrl)
    ]);

    let weatherData: any = null;
    let marineData: any = null;

    if (weatherRes.status === 'fulfilled' && weatherRes.value.ok) {
      weatherData = await weatherRes.value.json();
    }
    if (marineRes.status === 'fulfilled' && marineRes.value.ok) {
      marineData = await marineRes.value.json();
    }

    if (!weatherData && !marineData) {
      console.warn(`[Weather] Could not fetch Open-Meteo, falling back to cached seed for ${beachId}`);
      return SEED_WEATHER[beachId] || SEED_WEATHER['bondi-beach'];
    }

    const currentW = weatherData?.current || {};
    const currentM = marineData?.current || {};

    const tempC = Math.round(currentW.temperature_2m ?? 24);
    const apparentC = Math.round(currentW.apparent_temperature ?? tempC);
    const uv = Math.round(currentW.uv_index ?? 6);
    const windSpeed = Math.round(currentW.wind_speed_10m ?? 18);
    const windDir = Math.round(currentW.wind_direction_10m ?? 90);
    const windGusts = Math.round(currentW.wind_gusts_10m ?? 25);
    const waveHeight = currentM.wave_height ? Number(currentM.wave_height.toFixed(1)) : 1.4;
    const wavePeriod = Math.round(currentM.wave_period ?? 10);
    const weatherCode = currentW.weather_code ?? 1;

    // Simulated calculated tide info based on local time
    const now = new Date();
    const hours = now.getHours();
    const isRising = (hours % 12) < 6;
    const tideInfo: TideInfo = {
      currentStatus: isRising ? 'rising' : 'falling',
      nextHighTide: `${((hours + 4) % 24).toString().padStart(2, '0')}:30`,
      nextLowTide: `${((hours + 10) % 24).toString().padStart(2, '0')}:15`,
      heightM: Number((1.1 + (Math.sin(hours / 2) * 0.5)).toFixed(2))
    };

    return {
      temperatureC: tempC,
      apparentTempC: apparentC,
      uvIndex: uv,
      uvDescription: getUVDescription(uv),
      windSpeedKmh: windSpeed,
      windDirectionDeg: windDir,
      windGustsKmh: windGusts,
      waveHeightM: waveHeight,
      wavePeriodSec: wavePeriod,
      waterTemperatureC: Number((tempC - 2.5).toFixed(1)),
      tide: tideInfo,
      ripCurrentRiskIndex: calculateRipRisk(waveHeight, wavePeriod, windSpeed),
      weatherCode: weatherCode,
      weatherDescription: getWeatherInterpretation(weatherCode),
      fetchedAt: new Date().toISOString()
    };
  } catch (err) {
    console.warn(`[Weather] Error fetching live weather for ${beachId}:`, err);
    return SEED_WEATHER[beachId] || SEED_WEATHER['bondi-beach'];
  }
}
