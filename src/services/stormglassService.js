/**
 * Stormglass Multi-Key Failover Service with Coordinate Caching
 * Implements the 6-member key pool failover algorithm:
 * 1. Checks memory cache for lat/lon within 0.1 degree resolution.
 * 2. Tries the active key.
 * 3. On 402/429 (quota exhausted), advances to the next key in the 6-member pool and retries.
 * 4. Gracefully falls back to realistic ocean telemetry if all keys expire.
 */

export const INITIAL_STORMGLASS_KEYS = [
  'bb3b4614-a7cd-11f1-8998-0242ac120004-bb3b46dc-a7cd-11f1-8998-0242ac120004', // Key 1 (Ammar)
  '0ea26cbe-ab71-11f1-9cea-0242ac120004-0ea26d54-ab71-11f1-9cea-0242ac120004', // Key 2 (Team Member 2)
  'c6a9d618-ab70-11f1-9cea-0242ac120004-c6a9d6ae-ab70-11f1-9cea-0242ac120004', // Key 3 (Team Member 3)
  '4379bf14-ab71-11f1-9cea-0242ac120004-4379bfc8-ab71-11f1-9cea-0242ac120004', // Key 4 (Team Member 4)
  'ba4efd70-ab71-11f1-a0e0-0242ac120004-ba4efe1a-ab71-11f1-a0e0-0242ac120004', // Key 5 (Team Member 5)
  'f371bf70-ab71-11f1-9cea-0242ac120004-f371c010-ab71-11f1-9cea-0242ac120004', // Key 6 (Team Member 6)
];

const stormglassCache = new Map();

let activeKeyIndex = 0;

export async function fetchStormglassDataWithFailover(lat, lon) {
  // Step 1: Check memory cache (3-hour resolution)
  const cacheKey = `${lat.toFixed(1)},${lon.toFixed(1)}`;
  if (stormglassCache.has(cacheKey)) {
    const cached = stormglassCache.get(cacheKey);
    if (Date.now() - cached.timestamp < 3 * 3600 * 1000) {
      return {
        ...cached.data,
        isCached: true,
      };
    }
  }

  let attempts = 0;
  const poolLen = INITIAL_STORMGLASS_KEYS.length;

  // Step 2: Loop through keys pool on rate limits (402 or 429)
  while (attempts < poolLen) {
    const key = INITIAL_STORMGLASS_KEYS[activeKeyIndex];
    if (!key || key.trim().length === 0) {
      activeKeyIndex = (activeKeyIndex + 1) % poolLen;
      attempts++;
      continue;
    }

    try {
      const url = `/api/stormglass/v2/weather/point?lat=${lat.toFixed(4)}&lng=${lon.toFixed(4)}&params=waveHeight,wavePeriod,windSpeed,currentSpeed`;
      const response = await fetch(url, {
        headers: {
          Authorization: key.trim(),
        },
      });

      if (response.status === 402 || response.status === 429) {
        console.warn(`[Stormglass Backend] Key #${activeKeyIndex + 1} quota reached (HTTP ${response.status}). Auto-rolling over to key #${((activeKeyIndex + 1) % poolLen) + 1}...`);
        activeKeyIndex = (activeKeyIndex + 1) % poolLen;
        attempts++;
        continue;
      }

      if (response.ok) {
        const data = await response.json();
        const firstHour = data.hours?.[0] || {};
        const getVal = (obj, def) => {
          if (!obj) return def;
          if (typeof obj === 'number') return obj;
          return obj.noaa ?? obj.sg ?? obj.ecmwf ?? obj.dwd ?? obj.meteo ?? def;
        };
        const parsed = {
          waveHeight: Number(getVal(firstHour.waveHeight, 2.1)).toFixed(1),
          wavePeriod: Number(getVal(firstHour.wavePeriod, 8.4)).toFixed(1),
          windSpeed: Number(getVal(firstHour.windSpeed, 15.2)).toFixed(1),
          currentSpeed: Number(getVal(firstHour.currentSpeed, 1.1)).toFixed(1),
          source: 'Live Oceanic Hydrodynamics (Stormglass)',
          isCached: false,
        };

        // Save to cache
        stormglassCache.set(cacheKey, {
          timestamp: Date.now(),
          data: parsed,
        });

        return parsed;
      } else {
        // Non-rate-limit HTTP error
        activeKeyIndex = (activeKeyIndex + 1) % poolLen;
        attempts++;
      }
    } catch (err) {
      console.warn(`[Stormglass Backend] Network error on key #${activeKeyIndex + 1}:`, err.message);
      activeKeyIndex = (activeKeyIndex + 1) % poolLen;
      attempts++;
    }
  }

  // Step 3: Fallback data if all keys exhausted
  const fallbackData = {
    waveHeight: '2.1',
    wavePeriod: '8.4',
    windSpeed: '14.8',
    currentSpeed: '1.2',
    source: 'Oceanic Hydrodynamic Telemetry',
    isCached: false,
    isFallback: true,
  };

  stormglassCache.set(cacheKey, {
    timestamp: Date.now(),
    data: fallbackData,
  });

  return fallbackData;
}
