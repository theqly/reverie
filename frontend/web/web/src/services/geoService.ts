// Кэш для хранения результатов геокодирования
const geocodeCache = new Map<string, string>();

interface NominatimResponse {
  place_id: number;
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    country?: string;
  };
}

/**
 * Получает название города по координатам (reverse geocoding)
 * Использует OpenStreetMap Nominatim API
 */
export async function getCityFromCoordinates(
  lat: number,
  lon: number
): Promise<string> {
  const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;

  // Проверяем кэш
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'ru',
          'User-Agent': 'Reverie/1.0'
        }
      }
    );

    if (!response.ok) {
      console.error('[geoService] Nominatim error:', response.status);
      return '';
    }

    const data: NominatimResponse = await response.json();

    // Получаем название города (может быть в разных полях)
    const city =
      data.address.city ||
      data.address.town ||
      data.address.village ||
      data.address.municipality ||
      data.address.state ||
      '';

    // Кэшируем результат
    geocodeCache.set(cacheKey, city);

    return city;
  } catch (error) {
    console.error('[geoService] Reverse geocoding failed:', error);
    return '';
  }
}

/**
 * Получает название города для подборки по координатам первого пина
 */
export async function getLocationForBoard(
  pins: Array<{ latitude?: number | null; longitude?: number | null }>
): Promise<string> {
  // Берем первый пин с валидными координатами
  const pinWithCoords = pins?.find(
    pin => pin.latitude != null && pin.longitude != null
  );

  if (!pinWithCoords || pinWithCoords.latitude == null || pinWithCoords.longitude == null) {
    return '';
  }

  return getCityFromCoordinates(pinWithCoords.latitude, pinWithCoords.longitude);
}
