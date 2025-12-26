import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CreatePinPage.module.css'; // ← ИМПОРТ СТИЛЕЙ
import AddPinModal from "./AddPinModal";
import InviteCollaboratorModal from './InviteCollaboratorModal';
import Header from './Header'; 
import { createPinWithImages, type CreatePinPayload } from "../services/pinService";
import { useLocation } from 'react-router-dom';
import MapModal from './MapModal';
import { validateImageFile } from '../services/imageService';
import { useToast } from './ToastProvider';


const CreatePinPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();


  // Состояния для полей формы
  const [pinLatitude, setPinLatitude] = useState<number | null>(null);
  const [pinLongitude, setPinLongitude] = useState<number | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [pinName, setPinName] = useState('');
  const [pinInfo, setPinInfo] = useState('');
  const [isAddPinModalOpen, setIsAddPinModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [collaborators, setCollaborators] = useState<string[]>([]); // ← заглушка: имена соавторов

  const [images, setImages] = useState<File[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Новые состояния для загрузки
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pinCount, setPinCount] = useState(0);

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

    // Валидация файла
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Недопустимый файл');
      return;
    }
    
    setUploadError(null);
    const newImages = [...images, file];
    setImages(newImages);

    // показываем последнее добавленное
    setCurrentIndex(newImages.length - 1);

    console.log("Pin photo added | total:", newImages.length);
  };

  // Временно не используются - для будущей функциональности
  const _handleAddPin = () => {
    setIsAddPinModalOpen(true);
    setPinCount(prev => prev + 1);
  };
  void _handleAddPin;

  const _handleInviteCollaborator = () => {
    setIsInviteModalOpen(true);
  };
  void _handleInviteCollaborator;

  const handleAddCollaborator = (name: string) => {
    // Добавляем коллаборатора с переданным именем
    setCollaborators(prev => [...prev, name]);
  };


   const handleSavePin = async () => {
    console.log('[CreatePin] Current coordinates:', {
      latitude: pinLatitude,
      longitude: pinLongitude
    });
  
    if (pinLatitude === null || pinLongitude === null) {
      alert('Выберите точку на карте');
      return;
    }

    if (images.length === 0) {
      alert('Добавьте хотя бы одно изображение');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    const payload: CreatePinPayload = {
      name: pinName,
      description: pinInfo,
      latitude: pinLatitude,
      longitude: pinLongitude,
      ownerId: '00000000-0000-0000-0000-000000000001', // временно, заглушка
      coverImages: images
    };

    try {
      const result = await createPinWithImages(payload, (fileIndex, progress) => {
        // Рассчитываем общий прогресс
        const totalProgress = ((fileIndex + progress.percentage / 100) / images.length) * 100;
        setUploadProgress(Math.round(totalProgress));
      });

      if (result.pin) {
        showToast("Успешное сохранение!");

        console.log('Пин создан:', result.pin);
        console.log('Загружено изображений:', result.uploadedImages.length);
        
        if (result.errors.length > 0) {
          console.warn('Ошибки при загрузке изображений:', result.errors);
        }
        
        // Переходим на страницу созданного пина или обратно
        navigate(`/feed`);
      } else {
        setUploadError('Не удалось создать пин');
      }
    } catch (error: any) {
      console.error('Ошибка при создании пина:', error);
      setUploadError(error.message || 'Произошла ошибка');
    } finally {
      setIsUploading(false);
    }
  };

  // Валидация для кнопки сохранения
  const isSaveEnabled = !isUploading &&
                       pinName.trim().length > 0 && 
                       pinName.length <= 50 && 
                       pinInfo.length <= 1000 &&
                       images.length > 0;
  return (

    <div className={styles.createCollectionPage}>
      <Header/>

      <main className={styles.collectionContent}>
        <div className={styles.h_container}>
            <button onClick={handleBack} className={styles.back_btn}></button>
            <h1>Новый пин от @nickname</h1>
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
        
        {/* Показываем ошибку загрузки */}
        {uploadError && (
          <div className={styles.errorMessage} style={{ marginBottom: '1rem', color: 'red' }}>
            {uploadError}
          </div>
        )}
        
        {/* Показываем прогресс загрузки */}
        {isUploading && (
          <div className={styles.uploadProgress} style={{ marginBottom: '1rem' }}>
            <div>Загрузка изображений: {uploadProgress}%</div>
            <div 
              style={{ 
                width: '100%', 
                height: '8px', 
                backgroundColor: '#e0e0e0', 
                borderRadius: '4px',
                marginTop: '0.5rem'
              }}
            >
              <div 
                style={{ 
                  width: `${uploadProgress}%`, 
                  height: '100%', 
                  backgroundColor: '#4CAF50', 
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>
        )}
        
        <button 
            type="button" 
            onClick={handleSavePin}
            disabled={!isSaveEnabled}
            className={styles.saveButton}
          >
            {isUploading ? 'Сохранение...' : 'Сохранить пин'}
        </button>

        {isAddPinModalOpen && (
          <AddPinModal onClose={() => setIsAddPinModalOpen(false)} />
        )}

        {isInviteModalOpen && (
          <InviteCollaboratorModal 
            onClose={() => setIsInviteModalOpen(false)}
            onAddCollaborator={handleAddCollaborator}
            existingCollaborators={collaborators}
          />
        )}


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