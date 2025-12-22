import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import styles from './CreateCollectionPage.module.css';
import InviteCollaboratorModal from './InviteCollaboratorModal';
import Header from './Header';
import { useToast } from './ToastProvider';

import { 
  getCollectionById as getMockCollectionById, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getCollectionPins 
} from '../utils/mockData';

import { 
  updateCollection,
  getPinById as getBackendCollectionById 
} from "../services/collectionsService";

import { type UpdateBoardInput } from "@/graphql/generated/graphql.ts";
import { AccessLevelType } from "@/graphql/generated/graphql.ts";
import { validateImageFile, uploadImageDev } from '../services/imageService';

const EditCollectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  
  // Состояния для полей формы
  const [collectionName, setCollectionName] = useState('');
  const [collectionInfo, setCollectionInfo] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [originalCollection, setOriginalCollection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  
  // Состояния для загрузки изображений
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Получаем URL изображения коллекции
  const getCollectionImageUrl = (): string | null => {
    if (!originalCollection) return null;
    
    // Пробуем получить изображение из разных возможных полей
    return (
      originalCollection.image ||           // Основное поле
      originalCollection.boardImageURL ||   // Альтернативное поле из вашего примера
      originalCollection.coverImage ||      // Ещё один вариант
      null
    );
  };

  // Загрузка данных коллекции с бэкенда
  useEffect(() => {
    const loadCollection = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        // 1. Пытаемся получить с бэка
        const board = await getBackendCollectionById(id);

        if (board) {
          setOriginalCollection(board);
          setCollectionName(board.title || board.name || '');
          setCollectionInfo(board.description || '');
          
          // Если в API есть данные о соавторах
          setCollaborators(board.collaborators || []);
          
          console.log('Загруженная коллекция:', {
            board,
            imageUrl: getCollectionImageUrl()
          });
          return;
        }

        // 2. Фолбек на моки
        console.log("Используем моки для загрузки данных коллекции");
        const mockCollection = getMockCollectionById(parseInt(id));

        if (mockCollection) {
          setOriginalCollection(mockCollection);
          setCollectionName(mockCollection.title || '');
          setCollectionInfo(mockCollection.description || '');
          setCollaborators(mockCollection.collaborators || []);
        } else {
          setError(`Подборка с ID ${id} не найдена`);
        }

      } catch (e) {
        console.error("Ошибка при загрузке коллекции:", e);

        // 3. Фолбек на моки при ошибке
        console.log("Ошибка при загрузке, используем моки");
        const mockCollection = getMockCollectionById(parseInt(id));

        if (mockCollection) {
          setOriginalCollection(mockCollection);
          setCollectionName(mockCollection.title || '');
          setCollectionInfo(mockCollection.description || '');
          setCollaborators(mockCollection.collaborators || []);
        } else {
          setError('Не удалось загрузить подборку');
        }

      } finally {
        setLoading(false);
      }
    };

    loadCollection();
  }, [id]);

  const handleSaveCollection = async () => {
    if (!id) {
      console.error("ID коллекции не указан");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      // Если есть новая обложка - загружаем её
      let newCoverUrl: string | undefined;
      if (coverImage) {
        const uploadResult = await uploadImageDev(coverImage, (progress) => {
          setUploadProgress(progress.percentage);
        });
        
        if (uploadResult.success && uploadResult.imageUrl) {
          newCoverUrl = uploadResult.imageUrl;
          console.log('Обложка загружена:', newCoverUrl);
        } else {
          setUploadError(uploadResult.error || 'Ошибка загрузки обложки');
          setIsUploading(false);
          return;
        }
      }

      const payload: UpdateBoardInput = {
        userId: originalCollection?.ownerId || "",
        name: collectionName,                     
        description: collectionInfo,              
        accessLevel: AccessLevelType.Public,
      };

      // Если есть новый URL обложки, добавляем его в payload
      if (newCoverUrl) {
        // Проверяем, поддерживает ли API обновление обложки
        console.log('Новая обложка доступна:', newCoverUrl);
        // Здесь можно добавить логику для сохранения обложки, если API поддерживает
      }

      const updatedBoard = await updateCollection(id, payload);

      if (updatedBoard) {
        console.log("Коллекция успешно обновлена:", updatedBoard);
        handleBack();
        showToast("Успешное сохранение!");
      } else {
        console.warn("Коллекция не была обновлена. Вернулась null");
        navigate(`/feed`);
        showToast("Успешное сохранение!");
      }
    } catch (error: any) {
      console.error("Ошибка при обновлении коллекции:", error.message);
      setUploadError(error.message || 'Ошибка при сохранении');
      showToast("Ошибка при сохранении", true);
    } finally {
      setIsUploading(false);
    }
  };

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

  const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Валидация файла
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setUploadError(validation.error || 'Недопустимый файл');
        return;
      }
      setUploadError(null);
      setCoverImage(file);
    }
  };

  const isSaveEnabled = !isUploading &&
                        collectionName.trim().length > 0 &&
                        collectionName.length <= 50 &&
                        collectionInfo.length <= 1000;

  // Получаем URL текущего изображения для отображения
  const currentImageUrl = getCollectionImageUrl();

  // Показываем загрузку
  if (loading) {
    return (
      <div className={styles.createCollectionPage}>
        <Header />
        <main className={styles.collectionContent}>
          <div className={styles.loadingContainer}>
            <div className={styles.loading}>Загрузка данных коллекции...</div>
          </div>
        </main>
      </div>
    );
  }

  // Показываем ошибку
  if (error || !originalCollection) {
    return (
      <div className={styles.createCollectionPage}>
        <Header />
        <main className={styles.collectionContent}>
          <div className={styles.errorContainer}>
            <h2>Коллекция не найдена</h2>
            <p>{error || `Коллекция с ID ${id} не существует.`}</p>
            <button 
              onClick={() => navigate('/feed')}
              className={styles.backButton}
            >
              Вернуться на главную
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.createCollectionPage}>
      <Header />

      <main className={styles.collectionContent}>
        <div className={styles.h_container}>
          <button onClick={handleBack} className={styles.back_btn}></button>
          <h1>Редактировать подборку</h1>
        </div>

        <div className={styles.gridWrapper}>
          <label htmlFor="collection-name" className={styles.name_label}>Название:</label> 
          <div className={styles.name_input_block}>
            <input
              id="collection-name"
              type="text"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              maxLength={50}
              className={collectionName.length > 50 ? styles.error : styles.name_input}
            />
            <div className={styles.characterCounter}>
              {collectionName.length}/50
            </div>
            {collectionName.length > 50 && (
              <div className={styles.errorMessage}>
                Collection name must be 50 characters or less
              </div>
            )}
          </div>

          <label htmlFor="collection-info" className={styles.discr_label}>Описание:</label>
          <div className={styles.discr_input_block}>
            <textarea
              id="collection-info"
              value={collectionInfo}
              onChange={(e) => setCollectionInfo(e.target.value)}
              maxLength={1000}
              rows={4}
              className={collectionInfo.length > 1000 ? styles.error : styles.discr_input}
              placeholder="Опишите вашу подборку..."
            />
            <div className={styles.characterCounter}>
              {collectionInfo.length}/1000
            </div>
          </div>

          <label className={styles.collaborator_label}>Соавторы:</label>
          <div className={styles.collaboratorsList}>
            {collaborators.length > 0 ? (
              collaborators.map((name, idx) => (
                <div key={idx} className={styles.collaboratorItem}>
                  <span>@{name}</span>
                  <button
                    className={styles.removeCollaboratorBtn}
                    onClick={() => {
                      setCollaborators(prev => prev.filter(c => c !== name));
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))
            ) : (
              <p className={styles.noCollaborators}></p>
            )}

            <button
              type="button"
              onClick={() => setIsInviteModalOpen(true)}
              className={styles.actionButton}
            >
              Добавить соавтора
            </button>
          </div>

          <section className={styles.coverSection}>
            <label htmlFor="cover-input" className={styles.coverLabel}>
              {coverImage ? (
                <img
                  src={URL.createObjectURL(coverImage)}
                  alt="Новая обложка подборки"
                  className={styles.coverPreview}
                />
              ) : currentImageUrl ? (
                <img
                  src={currentImageUrl}
                  alt="Текущая обложка подборки"
                  className={styles.coverPreview}
                />
              ) : (
                <div className={styles.coverPlaceholder}>
                  <span className={styles.plus}>+</span>
                  <p>Загрузить обложку</p>
                </div>
              )}
            </label>
            <input
              id="cover-input"
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className={styles.hiddenInput}
            />
            <label htmlFor="cover-input" className={styles.uploadButton}>
              {coverImage || currentImageUrl ? "Изменить фото" : "Загрузить фото"}
            </label>
            {currentImageUrl && !coverImage && (
              <p className={styles.currentCoverNote}>Используется текущая обложка</p>
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
        {isUploading && coverImage && (
          <div className={styles.uploadProgress} style={{ marginBottom: '1rem' }}>
            <div>Загрузка обложки: {uploadProgress}%</div>
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
          onClick={handleSaveCollection}
          disabled={!isSaveEnabled}
          className={styles.saveButton}
        >
          {isUploading ? 'Сохранение...' : 'Сохранить изменения'}
        </button>

        {isInviteModalOpen && (
          <InviteCollaboratorModal
            onClose={() => setIsInviteModalOpen(false)}
            onAddCollaborator={(name) => {
              if (name && !collaborators.includes(name)) {
                setCollaborators(prev => [...prev, name]);
              }
            }}
            existingCollaborators={collaborators}
          />
        )}
      </main>
    </div>
  );
};

export default EditCollectionPage;