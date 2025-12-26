// Кэш для хранения результатов геокодирования
const geocodeCache = new Map<string, string>();

// Очередь запросов для избежания rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 200; // 200ms между запросами

async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
    );
  }
  lastRequestTime = Date.now();
}

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
    // Ждём, чтобы не превысить лимит запросов
    await waitForRateLimit();

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

/**
 * Загружает локации для массива объектов с координатами.
 * Возвращает Map<id, location> после загрузки всех локаций.
 * Это позволяет обновить состояние один раз вместо N раз.
 */
export async function loadLocationsForItems<T extends { id: string; latitude?: number | null; longitude?: number | null }>(
  items: T[],
  onProgress?: (loaded: number, total: number) => void
): Promise<Map<string, string>> {
  const locations = new Map<string, string>();
  const itemsWithCoords = items.filter(
    item => item.latitude != null && item.longitude != null
  );

  const total = itemsWithCoords.length;

  for (let i = 0; i < itemsWithCoords.length; i++) {
    const item = itemsWithCoords[i];
    const location = await getCityFromCoordinates(item.latitude!, item.longitude!);
    locations.set(item.id, location);

    if (onProgress) {
      onProgress(i + 1, total);
    }
  }

  return locations;
}

/**
 * Загружает локации для массива подборок (по первому пину каждой).
 * Возвращает Map<boardId, location>.
 */
export async function loadLocationsForBoards<T extends { id: string; pins?: Array<{ latitude?: number | null; longitude?: number | null }> | null }>(
  boards: T[],
  onProgress?: (loaded: number, total: number) => void
): Promise<Map<string, string>> {
  const locations = new Map<string, string>();
  const total = boards.length;

  for (let i = 0; i < boards.length; i++) {
    const board = boards[i];
    const location = await getLocationForBoard(board.pins || []);
    locations.set(board.id, location);

    if (onProgress) {
      onProgress(i + 1, total);
    }
  }

  return locations;
}
