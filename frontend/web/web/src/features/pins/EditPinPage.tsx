
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import styles from './CreatePinPage.module.css';

import Header from '../../pages/Header';
import MapModal from '../map/MapModal';
import { useToast } from '../../pages/ToastContext';

import {
  getPinById,
  updatePin,
} from '../../services/pinService';

import type {
  UpdatePinInput,
} from '@/graphql/generated/graphql';

type PinData = NonNullable<
  Awaited<ReturnType<typeof getPinById>>
>;
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000001';

const EditPinPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  const { showToast } = useToast();

  const [originalPin, setOriginalPin] = useState<PinData | null>(null);

  const [pinName, setPinName] = useState('');
  const [pinInfo, setPinInfo] = useState('');

  const [pinLatitude, setPinLatitude] = useState<number | null>(null);
  const [pinLongitude, setPinLongitude] = useState<number | null>(null);

  const [isMapOpen, setIsMapOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Получение пина из GraphQL
  useEffect(() => {
    if (!id) {
      setOriginalPin(null);
      setError('ID пина не указан');
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadPin = async () => {
      setLoading(true);
      setError(null);
      setOriginalPin(null);

      try {
        const pin = await getPinById(id);

        if (cancelled) return;

        if (!pin) {
          setError(`Пин с ID ${id} не найден`);
          return;
        }

        setOriginalPin(pin);

        setPinName(pin.name);
        setPinInfo(pin.description ?? '');

        setPinLatitude(pin.latitude);
        setPinLongitude(pin.longitude);

        setCurrentIndex(0);
      } catch (err: unknown) {
        if (cancelled) return;

        console.error('[EditPinPage] Failed to load pin:', err);
        setError('Не удалось загрузить пин');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadPin();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Координаты, выбранные на другом экране
  useEffect(() => {
    const state: unknown = location.state;

    if (
      typeof state === 'object' &&
      state !== null &&
      'latitude' in state &&
      'longitude' in state &&
      typeof state.latitude === 'number' &&
      typeof state.longitude === 'number'
    ) {
      setPinLatitude(state.latitude);
      setPinLongitude(state.longitude);
    }
  }, [location.state, originalPin]);

  const handleBack = () => {
    if (id) {
      navigate(`/pin/${id}`);
    } else {
      navigate('/feed');
    }
  };

  const isSaveEnabled =
    originalPin !== null &&
    pinName.trim().length > 0 &&
    pinName.length <= 50 &&
    pinInfo.length <= 1000 &&
    pinLatitude !== null &&
    pinLongitude !== null &&
    Number.isFinite(pinLatitude) &&
    Number.isFinite(pinLongitude) &&
    pinLatitude >= -90 &&
    pinLatitude <= 90 &&
    pinLongitude >= -180 &&
    pinLongitude <= 180 &&
    !saving;

  const handleSavePin = async () => {
    if (
      !id ||
      !originalPin ||
      !isSaveEnabled ||
      pinLatitude === null ||
      pinLongitude === null
    ) {
      return;
    }

    const payload: UpdatePinInput = {
      userId: TEMP_USER_ID,
      name: pinName.trim(),
      description: pinInfo,
      latitude: pinLatitude,
      longitude: pinLongitude,
    };

    setSaving(true);

    try {
      const updatedPin = await updatePin(id, payload);

      if (!updatedPin) {
        showToast('Ошибка при сохранении пина', true);
        return;
      }

      showToast('Пин успешно обновлён!');

      navigate(`/pin/${id}`);
    } catch (err: unknown) {
      console.error('[EditPinPage] Failed to update pin:', err);
      showToast('Ошибка при сохранении пина', true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.createCollectionPage}>
        <Header />

        <div className={styles.loadingContainer}>
          <div className={styles.loading}>
            Загрузка пина...
          </div>
        </div>
      </div>
    );
  }

  if (error || !originalPin) {
    return (
      <div className={styles.createCollectionPage}>
        <Header />

        <div className={styles.errorContainer}>
          <h2>Не удалось открыть пин</h2>

          <p>{error ?? 'Данные пина отсутствуют'}</p>

          <button
            type="button"
            onClick={handleBack}
            className={styles.backButton}
          >
            Вернуться назад
          </button>
        </div>
      </div>
    );
  }

  const existingImages = originalPin.images ?? [];
  const currentImage = existingImages[currentIndex];

  return (
    <div className={styles.createCollectionPage}>
      <Header />

      <main className={styles.collectionContent}>
        <div className={styles.h_container}>
          <button
            type="button"
            onClick={handleBack}
            className={styles.back_btn}
            aria-label="Назад"
          />

          <h1>Редактирование пина</h1>
        </div>

        <div className={styles.gridWrapper}>
          <label
            htmlFor="pin-name"
            className={styles.name_label}
          >
            Название:
          </label>

          <div className={styles.name_input_block}>
            <input
              id="pin-name"
              type="text"
              value={pinName}
              onChange={(e) => setPinName(e.target.value)}
              maxLength={50}
              className={
                pinName.length > 50
                  ? styles.error
                  : styles.name_input
              }
            />

            <div className={styles.characterCounter}>
              {pinName.length}/50
            </div>
          </div>

          <label
            htmlFor="pin-description"
            className={styles.discr_label}
          >
            Описание:
          </label>

          <div className={styles.discr_input_block}>
            <textarea
              id="pin-description"
              value={pinInfo}
              onChange={(e) => setPinInfo(e.target.value)}
              maxLength={1000}
              rows={4}
              className={
                pinInfo.length > 1000
                  ? styles.error
                  : styles.discr_input
              }
              placeholder="Опишите ваш пин..."
            />

            <div className={styles.characterCounter}>
              {pinInfo.length}/1000
            </div>
          </div>

          <section className={styles.coverSection}>
            {existingImages.length > 0 && currentImage ? (
              <div className={styles.galleryWrapper}>
                <img
                  src={currentImage.imageUrl}
                  className={styles.galleryImage}
                  alt={`Изображение пина ${currentIndex + 1}`}
                />

                {currentIndex > 0 && (
                  <button
                    type="button"
                    className={styles.navLeft}
                    onClick={() =>
                      setCurrentIndex((prev) => prev - 1)
                    }
                    aria-label="Предыдущее изображение"
                  >
                    ‹
                  </button>
                )}

                {currentIndex < existingImages.length - 1 && (
                  <button
                    type="button"
                    className={styles.navRight}
                    onClick={() =>
                      setCurrentIndex((prev) => prev + 1)
                    }
                    aria-label="Следующее изображение"
                  >
                    ›
                  </button>
                )}

                <div className={styles.counter}>
                  {currentIndex + 1} / {existingImages.length}
                </div>
              </div>
            ) : (
              <div className={styles.coverPlaceholder}>
                Нет изображений
              </div>
            )}

            <p>
              Изображения доступны только для просмотра.
            </p>

            <button
              type="button"
              onClick={() => setIsMapOpen(true)}
              className={styles.mapButton}
            >
              Найти на карте
            </button>

            {pinLatitude !== null && pinLongitude !== null && (
              <div className={styles.coordsInfo}>
                <div>
                  <strong>Широта:</strong>{' '}
                  {pinLatitude.toFixed(6)}
                </div>

                <div>
                  <strong>Долгота:</strong>{' '}
                  {pinLongitude.toFixed(6)}
                </div>
              </div>
            )}
          </section>
        </div>

        <button
          type="button"
          onClick={() => void handleSavePin()}
          disabled={!isSaveEnabled}
          className={styles.saveButton}
        >
          {saving
            ? 'Сохранение...'
            : 'Сохранить изменения'}
        </button>
      </main>

      {isMapOpen && (
        <MapModal
          onClose={() => setIsMapOpen(false)}
          onSelect={(lat: number, lng: number) => {
            setPinLatitude(lat);
            setPinLongitude(lng);
            setIsMapOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default EditPinPage;
