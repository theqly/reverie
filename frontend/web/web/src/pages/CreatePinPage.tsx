import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './CreatePinPage.module.css'; // ← ИМПОРТ СТИЛЕЙ
import AddPinModal from "./AddPinModal";
import InviteCollaboratorModal from './InviteCollaboratorModal';
import Header from './Header'; 
import { createPinWithImages, type CreatePinPayload } from "../services/pinService";
import { useLocation } from 'react-router-dom';
import MapModal from './MapModal';
import { validateImageFile } from '../services/imageService';
import { useToast } from './ToastProvider';
import { addPinToBoard } from "../services/addPinToBoardService";
import {getUserIdFromToken} from '../auth/tokenStorage';

const CreatePinPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  // Извлекаем collectionId из query параметров
  const collectionId = searchParams.get('collectionId');

  // Состояния для полей формы
  const [pinLatitude, setPinLatitude] = useState<number | null>(null);
  const [pinLongitude, setPinLongitude] = useState<number | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [pinName, setPinName] = useState('');
  const [pinInfo, setPinInfo] = useState('');
  const [isAddPinModalOpen, setIsAddPinModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [collaborators, setCollaborators] = useState<string[]>([]);

  const [images, setImages] = useState<File[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Новые состояния для загрузки
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Состояние для хранения ID созданного пина
  const [createdPinId, setCreatedPinId] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pinCount, setPinCount] = useState(0);

  useEffect(() => {
    if (location.state?.latitude && location.state?.longitude) {
      setPinLatitude(location.state.latitude);
      setPinLongitude(location.state.longitude);
    }
  }, [location.state]);

  // Функция для добавления пина в подборку
  const handleAddPinToCollection = async (pinId: string) => {
    if (!collectionId) {
      console.log('Нет collectionId, пропускаем добавление в подборку');
      return;
    }

    try {
      console.log(`Добавляем пин ${pinId} в подборку ${collectionId}`);
      const result = await addPinToBoard(pinId, collectionId);
      
      if (result) {
        console.log("Пин успешно добавлен в подборку");
        showToast(`Пин добавлен в подборку!`);
        
        // После успешного добавления можем показать кнопку перехода к подборке
        // или выполнить другие действия
        return true;
      } else {
        console.error("Не удалось добавить пин в подборку");
        showToast("Не удалось добавить пин в подборку", true);
        return false;
      }
    } catch (error: any) {
      console.error("Ошибка при добавлении пина в подборку:", error);
      showToast("Ошибка при добавлении пина в подборку", true);
      return false;
    }
  };

  // Обработчики
  const handleBack = () => {
    const searchParams = new URLSearchParams(location.search);
    const from = searchParams.get('from');
    
    if (from) {
      navigate(`/${from}`);
    } else if (collectionId) {
      // Если создавали пин для конкретной подборки, возвращаемся к ней
      navigate(`/collection/${collectionId}`);
    } else if (document.referrer && document.referrer.includes(window.location.origin)) {
      const referrerPath = new URL(document.referrer).pathname;
      navigate(referrerPath);
    } else {
      navigate(-1);
    }
  };

  const handleSelectCollection = async (collectionId: string, collectionName: string) => {
    if (!createdPinId) {
      console.error("Пин еще не создан");
      showToast("Сначала создайте пин", true);
      return;
    }
  
    console.log(`Добавляем пин ${createdPinId} в подборку ${collectionName} (${collectionId})`);
    
    try {
      const result = await addPinToBoard(createdPinId, collectionId);
      
      if (result) {
        console.log("Пин успешно добавлен в подборку");
        showToast(`Пин добавлен в "${collectionName}"`);
        
        // Переходим на страницу подборки
        navigate(`/collection/${collectionId}`);
      } else {
        console.error("Не удалось добавить пин в подборку");
        showToast("Не удалось добавить пин в подборку", true);
      }
    } catch (error) {
      console.error("Ошибка при добавлении пина в подборку:", error);
      showToast("Произошла ошибка при добавлении пина в подборку", true);
    }
  };

  const handleAddImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (images.length >= 10) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Недопустимый файл');
      return;
    }
    
    setUploadError(null);
    const newImages = [...images, file];
    setImages(newImages);
    setCurrentIndex(newImages.length - 1);

    console.log("Pin photo added | total:", newImages.length);
  };

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
    setCollaborators(prev => [...prev, name]);
  };

  const handleSavePin = async () => {
    console.log('[CreatePin] Current coordinates:', {
      latitude: pinLatitude,
      longitude: pinLongitude
    });
  
    if (pinLatitude === null || pinLongitude === null) {
      showToast('Выберите точку на карте', true);
      return;
    }

    if (images.length === 0) {
      showToast('Добавьте хотя бы одно изображение', true);
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
      ownerId: String(getUserIdFromToken()), // временно, заглушка
      coverImages: images
    };

    try {
      const result = await createPinWithImages(payload, (fileIndex, progress) => {
        const totalProgress = ((fileIndex + progress.percentage / 100) / images.length) * 100;
        setUploadProgress(Math.round(totalProgress));
      });

      if (result.pin) {
        // Сохраняем ID созданного пина
        const newPinId = result.pin.id;
        setCreatedPinId(newPinId);
        
        console.log('Пин создан:', result.pin);
        console.log('Загружено изображений:', result.uploadedImages.length);
        
        if (result.errors.length > 0) {
          console.warn('Ошибки при загрузке изображений:', result.errors);
        }
        
        // Если есть collectionId в query параметрах, добавляем пин в подборку
        if (collectionId) {
          showToast("Пин создан, добавляем в подборку...");
          
          // Добавляем пин в подборку
          const addedToCollection = await handleAddPinToCollection(newPinId);
          
          if (addedToCollection) {
            // Переходим на страницу подборки
            setTimeout(() => {
              navigate(`/collection/${collectionId}`);
            }, 1000);
          } else {
            // Если не удалось добавить в подборку, переходим на страницу пина
            showToast("Пин создан, но не добавлен в подборку", true);
            navigate(`/pin/${newPinId}`);
          }
        } else {
          // Если нет collectionId, просто переходим на страницу пина
          showToast("Пин успешно создан!");
          navigate(`/pin/${newPinId}`);
        }
      } else {
        setUploadError('Не удалось создать пин');
        showToast('Не удалось создать пин', true);
      }
    } catch (error: any) {
      console.error('Ошибка при создании пина:', error);
      setUploadError(error.message || 'Произошла ошибка');
      showToast(error.message || 'Произошла ошибка при создании пина', true);
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

  // Если есть collectionId, показываем заголовок с указанием подборки
  const getPageTitle = () => {
    if (collectionId) {
      return "Добавить пин в подборку";
    }
    return "Новый пин от @nickname";
  };

  return (
    <div className={styles.createCollectionPage}>
      <Header/>

      <main className={styles.collectionContent}>
        <div className={styles.h_container}>
            <button onClick={handleBack} className={styles.back_btn}></button>
            <h1>{getPageTitle()}</h1>
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
        
        {uploadError && (
          <div className={styles.errorMessage} style={{ marginBottom: '1rem', color: 'red' }}>
            {uploadError}
          </div>
        )}
        
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
            {isUploading 
              ? 'Сохранение...' 
              : collectionId 
                ? 'Создать пин и добавить в подборку' 
                : 'Сохранить пин'}
        </button>

        {createdPinId && !collectionId && (
          <div className={styles.addToCollectionSection}>
            <h3>Хотите добавить этот пин в подборку?</h3>
            <button
              type="button"
              onClick={() => setIsAddPinModalOpen(true)}
              className={styles.addToCollectionButton}
            >
              Выбрать подборку
            </button>
          </div>
        )}

        {isAddPinModalOpen && (
          <AddPinModal 
            onClose={() => setIsAddPinModalOpen(false)} 
            onSelectCollection={handleSelectCollection}
          />
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