import { useEffect, useState, type ChangeEvent } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import styles from './CreatePinPage.module.css';
import Header from '../../pages/Header';
import MapModal from '../map/MapModal';
import AddPinModal from '../collections/components/AddPinModal';
import { useToast } from '../../pages/ToastContext';
import { getUserIdFromToken } from '../../auth/tokenStorage';
import { createPinWithImages, type CreatePinPayload } from '../../services/pinService';
import { validateImageFile } from '../../services/imageService';
import { addPinToBoard } from '../../services/addPinToBoardService';

const MAX_IMAGES = 10;

const CreatePinPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const collectionId = searchParams.get('collectionId');

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
  const [createdPinId, setCreatedPinId] = useState<string | null>(null);
  const [isAddPinModalOpen, setIsAddPinModalOpen] = useState(false);
  const [addingToCollection, setAddingToCollection] = useState(false);

  useEffect(() => {
    const state: unknown = location.state;
    if (
      typeof state === 'object' && state !== null &&
      'latitude' in state && 'longitude' in state &&
      typeof state.latitude === 'number' && typeof state.longitude === 'number'
    ) {
      setPinLatitude(state.latitude);
      setPinLongitude(state.longitude);
    }
  }, [location.state]);

  // Each preview URL is revoked when it is replaced or the page unmounts.
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
    const from = searchParams.get('from');
    if (from && /^[a-zA-Z0-9/_-]+$/.test(from)) {
      navigate(`/${from.replace(/^\/+/, '')}`);
    } else if (collectionId) {
      navigate(`/collection/${collectionId}`);
    } else {
      navigate('/feed');
    }
  };

  const handleAddImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || saving || createdPinId || images.length >= MAX_IMAGES) return;

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
    if (saving || createdPinId) return;
    setImages((previous) => previous.filter((_, i) => i !== index));
    setCurrentIndex((previous) => Math.max(0, Math.min(previous, images.length - 2)));
  };

  const validCoordinates =
    pinLatitude !== null && pinLongitude !== null &&
    Number.isFinite(pinLatitude) && Number.isFinite(pinLongitude) &&
    pinLatitude >= -90 && pinLatitude <= 90 &&
    pinLongitude >= -180 && pinLongitude <= 180;

  const isSaveEnabled =
    !saving && !createdPinId &&
    pinName.trim().length > 0 && pinName.length <= 50 &&
    pinInfo.length <= 1000 && images.length > 0 && validCoordinates;

  const addCreatedPinToBoard = async (pinId: string, boardId: string) => {
    try {
      // The service is expected to return a truthy value on success.
      const added = await addPinToBoard(pinId, boardId);
      if (!added) {
        showToast('Пин создан, но не добавлен в подборку', true);
        return false;
      }
      showToast('Пин добавлен в подборку!');
      return true;
    } catch (error: unknown) {
      console.error('[CreatePinPage] Failed to add pin to board:', error);
      showToast('Пин создан, но не добавлен в подборку', true);
      return false;
    }
  };

  const handleSelectCollection = async (boardId: string, boardName: string) => {
    if (!createdPinId || addingToCollection) return;

    setAddingToCollection(true);
    try {
      const added = await addCreatedPinToBoard(createdPinId, boardId);
      if (added) {
        setIsAddPinModalOpen(false);
        showToast(`Пин добавлен в «${boardName}»`);
        navigate(`/collection/${boardId}`, { replace: true });
      }
    } finally {
      setAddingToCollection(false);
    }
  };

  const handleSavePin = async () => {
    if (!isSaveEnabled || pinLatitude === null || pinLongitude === null) return;

    const userId = getUserIdFromToken();
    if (!userId) {
      setSaveError('Не удалось определить пользователя. Войдите в аккаунт повторно.');
      return;
    }

    const payload: CreatePinPayload = {
      name: pinName.trim(),
      description: pinInfo,
      latitude: pinLatitude,
      longitude: pinLongitude,
      ownerId: userId,
      coverImages: images,
    };

    setSaving(true);
    setSaveError(null);
    setUploadProgress(0);

    try {
      const result = await createPinWithImages(payload, (fileIndex, progress) => {
        setUploadProgress(
          Math.round(((fileIndex + progress.percentage / 100) / images.length) * 100),
        );
      });

      if (!result.pin) {
        setSaveError(result.errors.join('; ') || 'Не удалось создать пин');
        return;
      }

      const newPinId = result.pin.id;
      // Block a second create even if subsequent image/board operations fail.
      setCreatedPinId(newPinId);

      if (result.errors.length > 0) {
        console.warn('[CreatePinPage] Image upload errors:', result.errors);
        showToast('Пин создан, но не все изображения удалось загрузить', true);
      } else {
        showToast('Пин успешно создан!');
      }

      if (collectionId) {
        const added = await addCreatedPinToBoard(newPinId, collectionId);
        if (added) {
          navigate(`/collection/${collectionId}`, { replace: true });
        } else {
          navigate(`/pin/${newPinId}`, { replace: true });
        }
      }
      // Without collectionId, let the user choose a board or open the pin.
      // The save button stays disabled to prevent creating a duplicate.
    } catch (error: unknown) {
      console.error('[CreatePinPage] Failed to create pin:', error);
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
          <h1>{collectionId ? 'Добавить пин в подборку' : 'Новый пин'}</h1>
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
              disabled={saving || !!createdPinId}
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
              disabled={saving || !!createdPinId}
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
                    disabled={saving || !!createdPinId}
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
              disabled={saving || !!createdPinId || images.length >= MAX_IMAGES}
            />

            <button
              type="button"
              onClick={() => setIsMapOpen(true)}
              className={styles.mapButton}
              disabled={saving || !!createdPinId}
            >Найти на карте</button>
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

        {!createdPinId ? (
          <button
            type="button"
            onClick={() => void handleSavePin()}
            disabled={!isSaveEnabled}
            className={styles.saveButton}
          >
            {saving ? 'Сохранение...' : collectionId ? 'Создать пин и добавить в подборку' : 'Сохранить пин'}
          </button>
        ) : !collectionId ? (
          <div className={styles.addToCollectionSection}>
            <p>Пин создан. Можно открыть его или добавить в подборку.</p>
            <button type="button" className={styles.saveButton} onClick={() => navigate(`/pin/${createdPinId}`, { replace: true })}>
              Открыть пин
            </button>
            <button
              type="button"
              className={styles.addToCollectionButton}
              disabled={addingToCollection}
              onClick={() => setIsAddPinModalOpen(true)}
            >Выбрать подборку</button>
          </div>
        ) : null}
      </main>

      {isAddPinModalOpen && (
        <AddPinModal
          onClose={() => setIsAddPinModalOpen(false)}
          onSelectCollection={handleSelectCollection}
        />
      )}

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
