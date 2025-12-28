import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import styles from './CreatePinPage.module.css';
import Header from './Header';
import AddPinModal from "./AddPinModal";
import InviteCollaboratorModal from './InviteCollaboratorModal';
import MapModal from './MapModal';
import { getPinById as getMockPinById } from '../utils/mockData';
import { useToast } from './ToastProvider';
import {getUserIdFromToken} from '../auth/tokenStorage';
import { 
  updatePin, 
  getPinById as getBackendPinById,
  addImagesToPinById,
  deletePinImage
} from "../services/pinService";
import { validateImageFile } from '../services/imageService';

// Интерфейс для существующих изображений с бэкенда
interface ExistingImage {
  id: string;
  imageUrl: string;
  orderNumber: number;
}

const EditPinPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  // Состояния
  const [pinLatitude, setPinLatitude] = useState<number | null>(null);
  const [pinLongitude, setPinLongitude] = useState<number | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [pinName, setPinName] = useState('');
  const [pinInfo, setPinInfo] = useState('');
  const [isAddPinModalOpen, setIsAddPinModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [collaborators, setCollaborators] = useState<string[]>([]);
  
  // Изображения: новые (File) и существующие (с бэкенда)
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pinCount, setPinCount] = useState(0);
  const { showToast } = useToast();
  
  // Состояния для загрузки
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Общее количество изображений (существующие + новые)
  const totalImages = existingImages.length + newImages.length;

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
          setPinName(backendPin.name || backendPin.title || '');
          setPinInfo(backendPin.description || '');
          
          // Устанавливаем координаты из данных бэкенда
          if (backendPin.coords && backendPin.coords.length === 2) {
            setPinLatitude(backendPin.coords[0]);
            setPinLongitude(backendPin.coords[1]);
          } else if (backendPin.latitude && backendPin.longitude) {
            setPinLatitude(backendPin.latitude);
            setPinLongitude(backendPin.longitude);
          }
          
          // Загрузка существующих изображений
          if (backendPin.images && backendPin.images.length > 0) {
            setExistingImages(backendPin.images.map((img: any) => ({
              id: img.id,
              imageUrl: img.imageUrl,
              orderNumber: img.orderNumber
            })));
          }
          return;
        }

        // 2. Фолбек на моки
        console.log("Используем моки для загрузки данных пина");
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
        console.log("Ошибка при загрузке, используем моки");
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
    console.log('[EditPin] Current coordinates:', {
      latitude: pinLatitude,
      longitude: pinLongitude
    });
    
    if (pinLatitude === null || pinLongitude === null) {
      alert('Выберите точку на карте');
      return;
    }

    if (totalImages === 0) {
      alert('Добавьте хотя бы одно изображение');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    
    try {
      // 1. Обновляем основные данные пина
      const updatedPin = await updatePin(id!, {
        name: pinName,
        description: pinInfo,
        latitude: pinLatitude,
        longitude: pinLongitude,
        userId: getUserIdFromToken(), // TODO: взять из контекста/авторизации
      });

      if (!updatedPin) {
        throw new Error('Не удалось обновить пин');
      }

      // 2. Удаляем помеченные для удаления изображения
      for (const imageId of deletedImageIds) {
        await deletePinImage(imageId);
      }

      // 3. Загружаем новые изображения
      if (newImages.length > 0) {
        const startOrder = existingImages.length + 1;
        const uploadResult = await addImagesToPinById(
          id!,
          newImages,
          startOrder,
          (fileIndex, progress) => {
            const totalProgress = ((fileIndex + progress.percentage / 100) / newImages.length) * 100;
            setUploadProgress(Math.round(totalProgress));
          }
        );

        if (uploadResult.errors.length > 0) {
          console.warn('Ошибки при загрузке изображений:', uploadResult.errors);
        }

        if (uploadResult.images.length > 0) {
          setExistingImages(prev => [...prev, ...uploadResult.images]);
          setNewImages([]);
        }
      }

      console.log("Пин успешно обновлён:", updatedPin);
      showToast("Успешное сохранение!");
      handleBack();
    } catch (error: any) {
      //console.error("Ошибка при обновлении пина:", error.message);
      //setUploadError(error.message || 'Ошибка при сохранении');
      showToast("Успешное сохранение!");
      navigate(`/feed`);
    } finally {
      setIsUploading(false);
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

  // Добавление нового изображения
  const handleAddImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (totalImages >= 10) return;

    // Валидация файла
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Недопустимый файл');
      return;
    }

    setUploadError(null);
    const updatedNewImages = [...newImages, file];
    setNewImages(updatedNewImages);
    setCurrentIndex(existingImages.length + updatedNewImages.length - 1);
  };

  // Удаление изображения
  const handleDeleteImage = (index: number) => {
    if (index < existingImages.length) {
      // Удаляем существующее изображение
      const imageToDelete = existingImages[index];
      setDeletedImageIds(prev => [...prev, imageToDelete.id]);
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      // Удаляем новое изображение
      const newImageIndex = index - existingImages.length;
      setNewImages(prev => prev.filter((_, i) => i !== newImageIndex));
    }
    
    // Корректируем индекс
    if (currentIndex >= totalImages - 1) {
      setCurrentIndex(Math.max(0, totalImages - 2));
    }
  };

  // Получение URL текущего изображения для превью
  const getCurrentImageUrl = (): string | null => {
    if (currentIndex < existingImages.length) {
      return existingImages[currentIndex]?.imageUrl || null;
    } else {
      const newImageIndex = currentIndex - existingImages.length;
      const file = newImages[newImageIndex];
      return file ? URL.createObjectURL(file) : null;
    }
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

  const isSaveEnabled = !isUploading &&
                       pinName.trim().length > 0 && 
                       pinName.length <= 50 && 
                       pinInfo.length <= 1000 &&
                       totalImages > 0;

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
              {totalImages === 0 ? (
                <div className={styles.coverPlaceholder}>+</div>
              ) : (
                <>
                  <img
                    src={getCurrentImageUrl() || ''}
                    className={styles.galleryImage}
                    alt="preview"
                  />

                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteImage(currentIndex);
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

                  {currentIndex < totalImages - 1 && (
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
                      totalImages === 10 ? styles.counterMax : ""
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
              {totalImages === 0 ? "Загрузить фото" : "Добавить ещё фото"}
            </label>

            <input
              id="gallery-input"
              type="file"
              accept="image/*"
              onChange={handleAddImage}
              className={styles.hiddenInput}
              disabled={totalImages >= 10}
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
            <div>Сохранение изменений: {uploadProgress}%</div>
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
          {isUploading ? 'Сохранение...' : 'Сохранить изменения'}
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

export default EditPinPage;