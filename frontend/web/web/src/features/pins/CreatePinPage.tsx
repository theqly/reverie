import { useEffect, useState, type ChangeEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import styles from './CreatePinPage.module.css';
import Header from '../../pages/Header';
import MapModal from '../map/MapModal';
import { useToast } from '../../pages/ToastContext';
import { getUserIdFromToken } from '../../auth/tokenStorage';
import { createPinWithImages } from '../../services/pinService';
import { validateImageFile } from '../../services/imageService';

const MAX_IMAGES = 10;

const CreatePinPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [pinLatitude, setPinLatitude] = useState<number | null>(null);
  const [pinLongitude, setPinLongitude] = useState<number | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [pinName, setPinName] = useState('');
  const [pinInfo, setPinInfo] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Координаты могут быть переданы со страницы карты.
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
  }, [location.state]);

  // Освобождаем blob URL при смене фотографии или размонтировании.
  useEffect(() => {
    const file = images[currentIndex];
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [images, currentIndex]);

  const handleBack = () => {
    const from = new URLSearchParams(location.search).get('from');
    if (from && /^[a-zA-Z0-9/_-]+$/.test(from)) {
      navigate(`/${from.replace(/^\/+/, '')}`);
    } else {
      navigate('/feed');
    }
  };

  const handleAddImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || saving || images.length >= MAX_IMAGES) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setSaveError(validation.error || 'Недопустимый файл');
      return;
    }

    setSaveError(null);
    setImages((previous) => [...previous, file]);
    setCurrentIndex(images.length);
  };

  const handleDeleteImage = (index: number) => {
    if (saving) return;
    setImages((previous) => previous.filter((_, i) => i !== index));
    setCurrentIndex((previous) => Math.max(0, Math.min(previous, images.length - 2)));
  };

  const validCoordinates =
    pinLatitude !== null &&
    pinLongitude !== null &&
    Number.isFinite(pinLatitude) &&
    Number.isFinite(pinLongitude) &&
    pinLatitude >= -90 && pinLatitude <= 90 &&
    pinLongitude >= -180 && pinLongitude <= 180;

  const isSaveEnabled =
    !saving &&
    pinName.trim().length > 0 &&
    pinName.length <= 50 &&
    pinInfo.length <= 1000 &&
    images.length > 0 &&
    validCoordinates;

  const handleSavePin = async () => {
    if (!isSaveEnabled || pinLatitude === null || pinLongitude === null) return;

    const userId = getUserIdFromToken();
    if (!userId) {
      setSaveError('Не удалось определить пользователя. Войдите в аккаунт повторно.');
      return;
    }

    setSaving(true);
    setSaveError(null);
    setUploadProgress(0);

    try {
      const result = await createPinWithImages(
        {
          name: pinName.trim(),
          description: pinInfo,
          latitude: pinLatitude,
          longitude: pinLongitude,
          ownerId: userId,
          coverImages: images,
        },
        (fileIndex, progress) => {
          setUploadProgress(
            Math.round(((fileIndex + progress.percentage / 100) / images.length) * 100),
          );
        },
      );

      if (!result.pin) {
        setSaveError(result.errors.join('; ') || 'Не удалось создать пин');
        return;
      }

      if (result.errors.length > 0) {
        console.warn('[CreatePinPage] Image upload errors:', result.errors);
        showToast('Пин создан, но не все изображения удалось загрузить', true);
      } else {
        showToast('Пин успешно создан!');
      }

      // Пин уже существует — повторное нажатие «Сохранить» создаст дубликат.
      // Переходим к созданной записи даже при частичных ошибках фотографий.
      navigate(`/pin/${result.pin.id}`, { replace: true });
    } catch (error: unknown) {
      console.error('[CreatePinPage] Failed:', error);
      setSaveError(error instanceof Error ? error.message : 'Не удалось создать пин');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.createCollectionPage}>
      <Header />
      <main className={styles.collectionContent}>
        <div className={styles.h_container}>
          <button type="button" onClick={handleBack} className={styles.back_btn} aria-label="Назад" />
          <h1>Новый пин</h1>
        </div>

        <div className={styles.gridWrapper}>
          <label htmlFor="pin-name" className={styles.name_label}>Название:</label>
          <div className={styles.name_input_block}>
            <input
              id="pin-name"
              type="text"
              value={pinName}
              onChange={(e) => setPinName(e.target.value)}
              maxLength={50}
              className={styles.name_input}
              disabled={saving}
            />
            <div className={styles.characterCounter}>{pinName.length}/50</div>
          </div>

          <label htmlFor="pin-description" className={styles.discr_label}>Описание:</label>
          <div className={styles.discr_input_block}>
            <textarea
              id="pin-description"
              value={pinInfo}
              onChange={(e) => setPinInfo(e.target.value)}
              maxLength={1000}
              rows={4}
              className={styles.discr_input}
              disabled={saving}
            />
            <div className={styles.characterCounter}>{pinInfo.length}/1000</div>
          </div>

          <section className={styles.coverSection}>
            <div className={styles.galleryWrapper}>
              {previewUrl ? (
                <>
                  <img src={previewUrl} className={styles.galleryImage} alt={`Фото ${currentIndex + 1}`} />
                  <button
                    type="button"
                    className={styles.deleteButton}
                    disabled={saving}
                    aria-label="Удалить фото"
                    onClick={() => handleDeleteImage(currentIndex)}
                  >✕</button>
                  {currentIndex > 0 && (
                    <button type="button" className={styles.navLeft} onClick={() => setCurrentIndex((i) => i - 1)}>‹</button>
                  )}
                  {currentIndex < images.length - 1 && (
                    <button type="button" className={styles.navRight} onClick={() => setCurrentIndex((i) => i + 1)}>›</button>
                  )}
                  <div className={`${styles.counter} ${images.length === MAX_IMAGES ? styles.counterMax : ''}`}>
                    {currentIndex + 1} / {MAX_IMAGES}
                  </div>
                </>
              ) : (
                <label htmlFor="gallery-input" className={styles.coverPlaceholder}>+</label>
              )}
            </div>

            <label htmlFor="gallery-input" className={styles.uploadButton}>
              {images.length === 0 ? 'Загрузить фото' : 'Добавить ещё фото'}
            </label>
            <input
              id="gallery-input"
              type="file"
              accept="image/*"
              onChange={handleAddImage}
              className={styles.hiddenInput}
              disabled={saving || images.length >= MAX_IMAGES}
            />

            <button type="button" onClick={() => setIsMapOpen(true)} className={styles.mapButton} disabled={saving}>
              Найти на карте
            </button>
            {pinLatitude !== null && pinLongitude !== null && (
              <div className={styles.coordsInfo}>
                <div><strong>Широта:</strong> {pinLatitude.toFixed(6)}</div>
                <div><strong>Долгота:</strong> {pinLongitude.toFixed(6)}</div>
              </div>
            )}
          </section>
        </div>

        {saveError && <p role="alert" className={styles.errorMessage}>{saveError}</p>}
        {saving && <p>Создание пина и загрузка фотографий: {uploadProgress}%</p>}
        <button
          type="button"
          onClick={() => void handleSavePin()}
          disabled={!isSaveEnabled}
          className={styles.saveButton}
        >
          {saving ? 'Сохранение...' : 'Сохранить пин'}
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

export default CreatePinPage;
