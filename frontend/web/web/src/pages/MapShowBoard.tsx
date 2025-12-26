// src/components/MapPicker.tsx
import { useEffect, useRef, useState } from 'react';

/* -------------------------------------
   1. ЗАГРУЗКА СКРИПТА ЯНДЕКС КАРТ (1 раз)
-------------------------------------- */
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
      reject(new Error('Ошибка загрузки Яндекс.Карт'));
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

export interface Pin {
  id: string;
  coordinates: [number, number];
  title: string;
  description?: string;
  color?: string;
}

interface MapPickerProps {
  onSelect?: (coords: [number, number]) => void;
  onPinClick?: (pin: Pin) => void;
  initialCoords?: [number, number];
  zoom?: number;
  width?: string | number;
  height?: string | number;
  readOnly?: boolean;
  pins?: Pin[];
  autoFitBounds?: boolean;
}

/* -------------------------------------
   3. COMPONENT
-------------------------------------- */
const MapPicker: React.FC<MapPickerProps> = ({
  onSelect,
  onPinClick,
  initialCoords = [55.751244, 37.618423],
  zoom = 12,
  width = '100%',
  height = '100vh',
  readOnly = false,
  pins = [],
  autoFitBounds = false,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const placemarksRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  /* -------------------------------------
     INIT MAP (1 раз)
  -------------------------------------- */
  useEffect(() => {
    let destroyed = false;

    const waitForYmaps = () =>
      new Promise<void>((resolve) => {
        const check = () => {
          if (window.ymaps) resolve();
          else setTimeout(check, 30);
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
          if (mapInstanceRef.current) return;

          const map = new window.ymaps.Map(mapRef.current, {
            center: initialCoords,
            zoom,
            controls: readOnly ? [] : ['zoomControl'],
          });

          mapInstanceRef.current = map;

          // Создаем коллекцию для всех меток
          const objectManager = new window.ymaps.ObjectManager({
            clusterize: true,
            gridSize: 32,
            clusterDisableClickZoom: true,
          });

          // Настраиваем внешний вид кластеров
          objectManager.objects.options.set({
            preset: 'islands#blueDotIcon',
            openBalloonOnClick: true,
            hasBalloon: true,
          });

          objectManager.clusters.options.set({
            preset: 'islands#blueClusterIcons',
          });

          map.geoObjects.add(objectManager);

          // Добавляем обработчик клика по меткам
          objectManager.objects.events.add('click', (e: any) => {
            const objectId = e.get('objectId');
            const pin = pins.find(p => p.id === objectId);
            if (pin && onPinClick) {
              onPinClick(pin);
            }
          });

          // Обработка клика по карте (если не readOnly)
          if (!readOnly && onSelect) {
            map.events.add('click', (e: any) => {
              const coords: [number, number] = e.get('coords');
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
        placemarksRef.current = [];
      }
    };
  }, []);

  /* -------------------------------------
     ОБНОВЛЕНИЕ МЕТОК ПРИ ИЗМЕНЕНИИ pins
  -------------------------------------- */
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    // Находим ObjectManager среди геообъектов карты
    const geoObjects = mapInstanceRef.current.geoObjects;
    let objectManager = null;
    
    geoObjects.each((geoObject: any) => {
      if (geoObject instanceof window.ymaps.ObjectManager) {
        objectManager = geoObject;
      }
    });

    if (!objectManager) return;

    // Удаляем все старые метки
    const objectsToRemove = objectManager.objects.getAll();
    objectManager.remove(objectsToRemove);

    // Добавляем новые метки
    const features = pins.map(pin => ({
      type: 'Feature',
      id: pin.id,
      geometry: {
        type: 'Point',
        coordinates: pin.coordinates,
      },
      properties: {
        hintContent: pin.title,
        balloonContentHeader: pin.title,
        balloonContentBody: pin.description || 'Без описания',
        balloonContentFooter: `<small>ID: ${pin.id}</small>`,
        clusterCaption: pin.title,
      },
      options: {
        preset: pin.color ? `islands#${pin.color}Icon` : 'islands#blueIcon',
        iconColor: pin.color || '#ff1e1eff',
      },
    }));

    if (features.length > 0) {
      objectManager.add({
        type: 'FeatureCollection',
        features,
      });

      // Автоматическое изменение границ карты, чтобы вместить все метки
      if (autoFitBounds && pins.length > 0) {
        setTimeout(() => {
          try {
            const bounds = objectManager.getBounds();
            if (bounds && bounds.length === 2) {
              mapInstanceRef.current.setBounds(bounds, {
                checkZoomRange: true,
                zoomMargin: 50, // отступы от краев
              });
            }
          } catch (e) {
            console.warn('Не удалось автоматически изменить границы карты:', e);
          }
        }, 100);
      }
    }
  }, [pins, mapLoaded, autoFitBounds]);

  /* -------------------------------------
     ОБНОВЛЕНИЕ ЦЕНТРА КАРТЫ ПРИ ИЗМЕНЕНИИ initialCoords
  -------------------------------------- */
  useEffect(() => {
    if (!mapInstanceRef.current || pins.length > 0) return;
    
    mapInstanceRef.current.setCenter(initialCoords);
    mapInstanceRef.current.setZoom(zoom);
  }, [initialCoords, zoom, pins.length]);

  return (
    <div
      ref={mapRef}
      style={{
        width,
        height,
        border: '1px solid #ccc',
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      {!mapLoaded && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            margin: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          }}
        >
          <p style={{ margin: 0 }}>Загрузка карты…</p>
        </div>
      )}
      
      {mapLoaded && pins.length === 0 && !readOnly && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '10px 20px',
            borderRadius: '20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            fontSize: '14px',
            zIndex: 1000,
          }}
        >
          Нажмите на карту, чтобы добавить метку
        </div>
      )}
      
      {mapLoaded && pins.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 1000,
            boxShadow: '0 1px 5px rgba(0,0,0,0.1)',
          }}
        >
          Меток: {pins.length}
        </div>
      )}
    </div>
  );
};

export default MapPicker;