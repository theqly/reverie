import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import styles from './CreatePinPage.module.css';
import Header from './Header';
import MapModal from './MapModal';
import { getPinById as getMockPinById } from '../utils/mockData';
import { useToast } from './ToastProvider';
import { updatePin, getPinById as getBackendPinById } from "../services/pinService";
import { useCurrentUserId } from '../context/AuthContext';

const EditPinPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const currentUserId = useCurrentUserId();
  const { showToast } = useToast();

  const [pinLatitude, setPinLatitude] = useState<number | null>(null);
  const [pinLongitude, setPinLongitude] = useState<number | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [pinName, setPinName] = useState('');
  const [pinInfo, setPinInfo] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных пина по ID
  useEffect(() => {
    const loadPin = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        // 1. Пытаемся получить с бэка
        const backendPin = await getBackendPinById(id);

        if (backendPin) {
          // Заполняем форму данными с бэкенда
          setPinName(backendPin.name || '');
          setPinInfo(backendPin.description || '');

          // Устанавливаем координаты из данных бэкенда
          if (backendPin.latitude != null && backendPin.longitude != null) {
            setPinLatitude(backendPin.latitude);
            setPinLongitude(backendPin.longitude);
          }

          // TODO: Загрузка существующих изображений
          return;
        }

        // 2. Фолбек на моки
        const mockPin = getMockPinById(parseInt(id));

        if (mockPin) {
          setPinName(mockPin.title || '');
          setPinInfo(mockPin.description || '');
          
          if (mockPin.coords && mockPin.coords.length === 2) {
            setPinLatitude(mockPin.coords[0]);
            setPinLongitude(mockPin.coords[1]);
          }
        } else {
          setError(`Пин с ID ${id} не найден`);
        }

      } catch (e) {
        console.error("Ошибка при загрузке пина:", e);

        // 3. Фолбек на моки при ошибке
        const mockPin = getMockPinById(parseInt(id));

        if (mockPin) {
          setPinName(mockPin.title || '');
          setPinInfo(mockPin.description || '');
          
          if (mockPin.coords && mockPin.coords.length === 2) {
            setPinLatitude(mockPin.coords[0]);
            setPinLongitude(mockPin.coords[1]);
          }
        } else {
          setError('Не удалось загрузить пин');
        }

      } finally {
        setLoading(false);
      }
    };

    loadPin();
  }, [id]);

  // Если данные пришли из состояния навигации (например, с карты)
  useEffect(() => {
    if (location.state?.latitude && location.state?.longitude) {
      setPinLatitude(location.state.latitude);
      setPinLongitude(location.state.longitude);
    }
  }, [location.state]);

  const handleSavePin = async () => {
    if (pinLatitude === null || pinLongitude === null) {
      alert('Выберите точку на карте');
      return;
    }

    if (!id) {
      showToast("ID пина не указан", true);
      return;
    }

    // UpdatePinInput согласно схеме GraphQL
    const updateInput = {
      userId: currentUserId,
      name: pinName,
      description: pinInfo,
      latitude: pinLatitude,
      longitude: pinLongitude,
    };

    try {
      const updatedPin = await updatePin(id, updateInput);

      if (updatedPin) {
        showToast("Успешное сохранение!");
        handleBack();
      } else {
        showToast("Ошибка при сохранении", true);
      }
    } catch (error) {
      console.error("Ошибка при обновлении пина:", error);
      showToast("Ошибка при сохранении", true);
    }
  };

  const handleBack = () => {
    const searchParams = new URLSearchParams(location.search);
    const from = searchParams.get('from');
    
    if (from) {
      navigate(`/${from}`);
    } else if (document.referrer && document.referrer.includes(window.location.origin)) {
      const referrerPath = new URL(document.referrer).pathname;
      navigate(referrerPath);
    } else {
      navigate(-1);
    }
  };

  const handleAddImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || images.length >= 10) return;
    setImages([...images, file]);
    setCurrentIndex(images.length);
  };

  const isSaveEnabled = pinName.trim().length > 0 &&
                       pinName.length <= 50 &&
                       pinInfo.length <= 1000 &&
                       images.length > 0;

  // Показываем загрузку
  if (loading) {
    return (
      <div className={styles.createCollectionPage}>
        <Header />
        <div className={styles.loadingContainer}>
          <div className={styles.loading}>Загрузка...</div>
        </div>
      </div>
    );
  }

  // Показываем ошибку
  if (error) {
    return (
      <div className={styles.createCollectionPage}>
        <Header />
        <div className={styles.errorContainer}>
          <h2>Ошибка загрузки</h2>
          <p>{error}</p>
          <button onClick={handleBack} className={styles.backButton}>
            Вернуться назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.createCollectionPage}>
      <Header />

      <main className={styles.collectionContent}>
        <div className={styles.h_container}>
          <button onClick={handleBack} className={styles.back_btn}></button>
          <h1>Редактирование пина</h1>
        </div>

        <div className={styles.gridWrapper}>
          <label htmlFor="collection-name" className={styles.name_label}>Название:</label> 

          <div className={styles.name_input_block}>
            <input
              id="collection-name"
              type="text"
              value={pinName}
              onChange={(e) => setPinName(e.target.value)}
              maxLength={50}
              className={pinName.length > 50 ? styles.error : styles.name_input}
            />

            <div className={styles.characterCounter}>
              {pinName.length}/50
            </div>
            {pinName.length > 50 && (
              <div className={styles.errorMessage}>
                Collection name must be 50 characters or less
              </div>
            )}
          </div>

          <label htmlFor="collection-info" className={styles.discr_label}>Описание:</label>

          <div className={styles.discr_input_block}>
            <textarea
              id="collection-info"
              value={pinInfo}
              onChange={(e) => setPinInfo(e.target.value)}
              maxLength={1000}
              rows={4}
              className={pinInfo.length > 1000 ? styles.error : styles.discr_input}
            />

            <div className={styles.characterCounter}>
              {pinInfo.length}/1000
            </div>
            {pinInfo.length > 1000 && (
              <div className={styles.errorMessage}>
                Collection info must be 1000 characters or less
              </div>
            )}
          </div>

          <section className={styles.coverSection}>
            <label
              htmlFor="gallery-input"
              className={styles.galleryWrapper}
            >
              {images.length === 0 ? (
                <div className={styles.coverPlaceholder}>+</div>
              ) : (
                <>
                  <img
                    src={URL.createObjectURL(images[currentIndex])}
                    className={styles.galleryImage}
                    alt="preview"
                  />

                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const newImages = images.filter((_, i) => i !== currentIndex);
                      setImages(newImages);
                      if (currentIndex >= newImages.length) {
                        setCurrentIndex(newImages.length - 1);
                      }
                    }}
                  >
                    ✕
                  </button>

                  {currentIndex > 0 && (
                    <button
                      type="button"
                      className={styles.navLeft}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentIndex((prev) => prev - 1);
                      }}
                    >
                      ‹
                    </button>
                  )}

                  {currentIndex < images.length - 1 && (
                    <button
                      type="button"
                      className={styles.navRight}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentIndex((prev) => prev + 1);
                      }}
                    >
                      ›
                    </button>
                  )}

                  <div
                    className={`${styles.counter} ${
                      images.length === 10 ? styles.counterMax : ""
                    }`}
                  >
                    {currentIndex + 1} / 10
                  </div>
                </>
              )}
            </label>

            <label
              htmlFor="gallery-input"
              className={styles.uploadButton}
            >
              {images.length === 0 ? "Загрузить фото" : "Добавить ещё фото"}
            </label>

            <input
              id="gallery-input"
              type="file"
              accept="image/*"
              onChange={handleAddImage}
              className={styles.hiddenInput}
            />

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
                  <strong>Широта:</strong> {pinLatitude.toFixed(6)}
                </div>
                <div>
                  <strong>Долгота:</strong> {pinLongitude.toFixed(6)}
                </div>
              </div>
            )}
          </section>
        </div>
        
        <button
          type="button"
          onClick={handleSavePin}
          disabled={!isSaveEnabled}
          className={styles.saveButton}
        >
          Сохранить изменения
        </button>
      </main>
      
      {isMapOpen && (
        <MapModal
          onClose={() => setIsMapOpen(false)}
          onSelect={(lat, lng) => {
            setPinLatitude(lat);
            setPinLongitude(lng);
          }}
        />
      )}
    </div>
  );
};

export default EditPinPage;