import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './CreatePinPage.module.css';
import Header from './Header';
import { createPin } from "../services/pinService";
import MapModal from './MapModal';
import { useCurrentUserId } from '../context/AuthContext';
import { findUser } from '../services/profileService';

const CreatePinPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUserId = useCurrentUserId();

  const [userNickname, setUserNickname] = useState<string>('');

  const [pinLatitude, setPinLatitude] = useState<number | null>(null);
  const [pinLongitude, setPinLongitude] = useState<number | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [pinName, setPinName] = useState('');
  const [pinInfo, setPinInfo] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загружаем никнейм пользователя из базы
  useEffect(() => {
    const loadUserNickname = async () => {
      const userData = await findUser({ id: currentUserId });
      if (userData?.nickTag) {
        setUserNickname(userData.nickTag);
      }
    };
    loadUserNickname();
  }, [currentUserId]);

  useEffect(() => {
  if (location.state?.latitude && location.state?.longitude) {
    setPinLatitude(location.state.latitude);
    setPinLongitude(location.state.longitude);
  }
}, [location.state]);

  // Обработчики
const handleBack = () => {
  // Пробуем взять from из URL
  const searchParams = new URLSearchParams(location.search);
  const from = searchParams.get('from');
  
  if (from) {
    // Если есть параметр from - используем его
    navigate(`/${from}`);
  } else if (document.referrer && document.referrer.includes(window.location.origin)) {
    // Если есть реферер и он с нашего сайта - используем его
    const referrerPath = new URL(document.referrer).pathname;
    navigate(referrerPath);
  } else {
    // Иначе возвращаемся в историю или на фид по умолчанию
    navigate(-1);
  }
};

  const handleAddImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ограничение 10 изображений
    if (images.length >= 10) return;

    const newImages = [...images, file];
    setImages(newImages);

    setCurrentIndex(newImages.length - 1);
  };

  const handleSavePin = async () => {
    if (pinLatitude === null || pinLongitude === null) {
      setError('Выберите точку на карте');
      return;
    }

    if (!pinName.trim()) {
      setError('Введите название пина');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // 1. Создаём пин
      const payload = {
        name: pinName.trim(),
        description: pinInfo.trim() || undefined,
        latitude: pinLatitude,
        longitude: pinLongitude,
        ownerId: currentUserId,
        coverImages: images
      };

      const createdPin = await createPin(payload);

      if (createdPin) {
        // Переходим на вкладку "Пины" в своём профиле
        navigate('/profile?tab=pins');
      } else {
        setError('Не удалось создать пин. Попробуйте еще раз.');
      }
    } catch (err) {
      console.error('[CreatePin] Error creating pin:', err);
      setError('Ошибка при создании пина. Проверьте подключение.');
    } finally {
      setIsSaving(false);
    }
  };

  // Валидация для кнопки сохранения
  // Обязательно: название и координаты. Изображения пока необязательны (S3 не реализован)
  const isSaveEnabled = pinName.trim().length > 0 &&
                       pinName.length <= 50 &&
                       pinInfo.length <= 1000 &&
                       pinLatitude !== null &&
                       pinLongitude !== null &&
                       !isSaving;
  return (

    <div className={styles.createCollectionPage}>
      <Header/>

      <main className={styles.collectionContent}>
        <div className={styles.h_container}>
            <button onClick={handleBack} className={styles.back_btn}></button>
            <h1>Новый пин от @{userNickname || '...'}</h1>
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
                        {/* ТЕКУЩЕЕ ИЗОБРАЖЕНИЕ */}
                        <img
                        src={URL.createObjectURL(images[currentIndex])}
                        className={styles.galleryImage}
                        alt="preview"
                        />

                        {/* КРЕСТИК УДАЛЕНИЯ */}
                        <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            const newImages = images.filter((_, i) => i !== currentIndex);

                            setImages(newImages);

                            // корректируем индекс
                            if (currentIndex >= newImages.length) {
                            setCurrentIndex(newImages.length - 1);
                            }
                        }}
                        >
                        ✕
                        </button>

                        {/* ЛЕВАЯ КНОПКА */}
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

                        {/* ПРАВАЯ КНОПКА */}
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

                        {/* СЧЁТЧИК */}
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

                {/* КНОПКА ДОБАВЛЕНИЯ */}
                <label
                    htmlFor="gallery-input"
                    className={styles.uploadButton}
                >
                    {images.length === 0 ? "Загрузить фото" : "Добавить ещё фото"}
                </label>

                {/* СКРЫТЫЙ INPUT */}
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

        {error && (
          <div className={styles.errorMessage} style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* Подсказка что нужно заполнить */}
        {!isSaveEnabled && !isSaving && (
          <div style={{ color: '#888', marginBottom: '1rem', textAlign: 'center', fontSize: '14px' }}>
            {!pinName.trim() && <div>Введите название пина</div>}
            {(pinLatitude === null || pinLongitude === null) && <div>Выберите точку на карте</div>}
          </div>
        )}

        <button
            type="button"
            onClick={handleSavePin}
            disabled={!isSaveEnabled}
            className={styles.saveButton}
          >
            {isSaving ? 'Сохранение...' : 'Сохранить пин'}
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

export default CreatePinPage;