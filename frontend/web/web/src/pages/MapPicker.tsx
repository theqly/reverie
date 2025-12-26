// src/components/MapPicker.tsx
import { useEffect, useRef, useState } from 'react';

/* -------------------------------------
   1. ЗАГРУЗКА СКРИПТА ЯНДЕКС КАРТ (1 раз)
-------------------------------------- */
const loadYandexScript = () => {
  return new Promise<void>((resolve, reject) => {
    // скрипт уже есть — больше ничего не грузим
    if (document.querySelector('script[data-ymaps]')) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src =
      'https://api-maps.yandex.ru/2.1/?apikey=c5d2fc65-8d68-4e47-a253-632bc8aaf398&lang=ru_RU';
    script.async = true;
    script.dataset.ymaps = 'true';
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error('Ошибка загрузки скрипта Яндекс.Карт'));
    document.body.appendChild(script);
  });
};

/* -------------------------------------
   2. TYPING
-------------------------------------- */
declare global {
  interface Window {
    ymaps?: any;
  }
}

interface MapPickerProps {
  onSelect: (coords: [number, number]) => void;
  initialCoords?: [number, number];
  zoom?: number;
  width?: string | number;
  height?: string | number;
  readOnly?: boolean; // Если true - только просмотр, маркер не двигается
}

/* -------------------------------------
   3. COMPONENT
-------------------------------------- */
const MapPicker: React.FC<MapPickerProps> = ({
  onSelect,
  initialCoords = [55.751244, 37.618423],
  zoom = 12,
  width = '100%',
  height = '100vh',
  readOnly = false,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const placemarkRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    let destroyed = false;

    /* ждем появления window.ymaps */
    const waitForYmaps = () =>
      new Promise<void>((resolve) => {
        const check = () => {
          if (window.ymaps) resolve();
          else setTimeout(check, 25);
        };
        check();
      });

    const initMap = async () => {
      try {
        await loadYandexScript();
        await waitForYmaps();

        window.ymaps.ready(() => {
          if (destroyed) return;
          if (!mapRef.current) return;

          // предотвращение повторной инициализации
          if (mapInstanceRef.current) return;

          const map = new window.ymaps.Map(mapRef.current, {
            center: initialCoords,
            zoom,
            controls: ['zoomControl'],
          });

          mapInstanceRef.current = map;

          // Создаём начальный маркер если есть координаты (не дефолтные)
          const hasValidCoords = initialCoords[0] !== 55.751244 || initialCoords[1] !== 37.618423;
          if (hasValidCoords || readOnly) {
            placemarkRef.current = new window.ymaps.Placemark(
              initialCoords,
              {},
              { preset: 'islands#redIcon' }
            );
            map.geoObjects.add(placemarkRef.current);
          }

          // Выбор точки (только если не readOnly)
          if (!readOnly) {
            map.events.add('click', (e: any) => {
              const coords: [number, number] = e.get('coords');

              if (!placemarkRef.current) {
                placemarkRef.current = new window.ymaps.Placemark(
                  coords,
                  {},
                  { preset: 'islands#redIcon' }
                );
                map.geoObjects.add(placemarkRef.current);
              } else {
                placemarkRef.current.geometry.setCoordinates(coords);
              }

              onSelect(coords);
            });
          }

          setMapLoaded(true);
        });
      } catch (err) {
        console.error('Ошибка загрузки Яндекс Карт:', err);
      }
    };

    initMap();

    return () => {
      destroyed = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
        placemarkRef.current = null;
      }
    };
    // важно: зависимости пустые — карта строится 1 раз!
  }, []);

  return (
    <div
      ref={mapRef}
      style={{
        width,
        height,
        border: '1px solid #ccc',
        position: 'relative',
      }}
    >
      {!mapLoaded && (
        <p
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            margin: 0,
          }}
        >
          Загрузка карты...
        </p>
      )}
    </div>
  );
};

export default MapPicker;
