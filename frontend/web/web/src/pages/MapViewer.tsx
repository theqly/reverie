import { useEffect, useRef, useState } from 'react';

const loadYandexScript = () => {
  return new Promise<void>((resolve, reject) => {
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

declare global {
  interface Window {
    ymaps?: any;
  }
}

interface Pin {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface MapViewerProps {
  pins: Pin[];
  onPinClick?: (pinId: string) => void;
  width?: string | number;
  height?: string | number;
}

const MapViewer: React.FC<MapViewerProps> = ({
  pins,
  onPinClick,
  width = '100%',
  height = '400px',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    let destroyed = false;

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

          // Удаляем старую карту если есть
          if (mapInstanceRef.current) {
            mapInstanceRef.current.destroy();
            mapInstanceRef.current = null;
          }

          let center: [number, number] = [55.751244, 37.618423];
          const zoom = 10;

          if (pins.length > 0) {
            // Берем центр по первому пину или среднее
            const validPins = pins.filter(p => p.latitude && p.longitude);
            if (validPins.length > 0) {
              const avgLat = validPins.reduce((sum, p) => sum + p.latitude, 0) / validPins.length;
              const avgLon = validPins.reduce((sum, p) => sum + p.longitude, 0) / validPins.length;
              center = [avgLat, avgLon];
            }
          }

          const map = new window.ymaps.Map(mapRef.current, {
            center,
            zoom,
            controls: ['zoomControl'],
          });

          mapInstanceRef.current = map;

          // Добавляем пины
          pins.forEach((pin) => {
            if (!pin.latitude || !pin.longitude) return;

            const placemark = new window.ymaps.Placemark(
              [pin.latitude, pin.longitude],
              {
                balloonContentHeader: pin.name,
                hintContent: pin.name,
              },
              { preset: 'islands#redDotIcon' }
            );

            if (onPinClick) {
              placemark.events.add('click', () => {
                onPinClick(pin.id);
              });
            }

            map.geoObjects.add(placemark);
          });

          // Автоматически подстраиваем масштаб под все пины
          if (pins.length > 1) {
            map.setBounds(map.geoObjects.getBounds(), {
              checkZoomRange: true,
              zoomMargin: 50,
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
      }
    };
  }, [pins, onPinClick]);

  return (
    <div
      ref={mapRef}
      style={{
        width,
        height,
        borderRadius: '12px',
        overflow: 'hidden',
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
            color: '#666',
          }}
        >
          Загрузка карты...
        </p>
      )}
    </div>
  );
};

export default MapViewer;
