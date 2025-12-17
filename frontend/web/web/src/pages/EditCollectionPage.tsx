import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './CreateCollectionPage.module.css';
import InviteCollaboratorModal from './InviteCollaboratorModal';
import Header from './Header';
import { getCollectionById, mockCollections } from '../utils/mockData';

const EditCollectionPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Состояния для полей формы
  const [collectionName, setCollectionName] = useState('');
  const [collectionInfo, setCollectionInfo] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [originalCollection, setOriginalCollection] = useState(null);
  const [loading, setLoading] = useState(true);

  // Загрузка данных коллекции из mockData
  useEffect(() => {
    if (id) {
      const collectionId = parseInt(id);
      const foundCollection = getCollectionById(collectionId);
      
      if (foundCollection) {
        setOriginalCollection(foundCollection);
        setCollectionName(foundCollection.title || '');
        setCollectionInfo(foundCollection.description || '');
        // В моках нет данных о соавторах, можно оставить пустой массив
        // или добавить в mockData поле collaborators
        setCollaborators(foundCollection.collaborators || []);
        
        // Если в коллекции есть изображение, можно попробовать создать файл
        // Но для простоты оставим как есть - пользователь может загрузить новое
      } else {
        console.error(`Коллекция с ID ${id} не найдена`);
        // Можно перенаправить на 404 или показать ошибку
        navigate('/not-found');
      }
      
      setLoading(false);
    }
  }, [id, navigate]);

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
      setCoverImage(file);
    }
  };

  const handleSaveCollection = async () => {
    const payload = {
      id: parseInt(id),
      title: collectionName,
      description: collectionInfo,
      coverImage,
      collaborators,
      // Сохраняем остальные поля из оригинальной коллекции
      ...originalCollection,
      image: coverImage ? URL.createObjectURL(coverImage) : originalCollection?.image,
      updatedAt: new Date().toISOString()
    };

    console.log("Сохранение коллекции:", payload);

    // Здесь бы вызывался API для сохранения
    // await updateCollection(payload);
    
    // После сохранения возвращаемся на страницу коллекции
    navigate(`/collection/${id}`);
  };

  const isSaveEnabled = collectionName.trim().length > 0 &&
                        collectionName.length <= 50 &&
                        collectionInfo.length <= 1000;

  // Показываем загрузку
  if (loading) {
    return (
      <div className={styles.createCollectionPage}>
        <Header />
        <main className={styles.collectionContent}>
          <div className={styles.loading}>Загрузка данных коллекции...</div>
        </main>
      </div>
    );
  }

  // Если коллекция не найдена
  if (!originalCollection) {
    return (
      <div className={styles.createCollectionPage}>
        <Header />
        <main className={styles.collectionContent}>
          <div className={styles.errorContainer}>
            <h2>Коллекция не найдена</h2>
            <p>Коллекция с ID {id} не существует.</p>
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
              <p className={styles.noCollaborators}>Пока нет соавторов</p>
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
                  alt="Обложка подборки"
                  className={styles.coverPreview}
                />
              ) : originalCollection?.image ? (
                <img
                  src={originalCollection.image}
                  alt="Текущая обложка"
                  className={styles.coverPreview}
                />
              ) : (
                <div className={styles.coverPlaceholder}>
                  <span className={styles.plus}>+</span>
                  <p>Текущая обложка</p>
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
              {coverImage || originalCollection?.image ? "Изменить фото" : "Загрузить фото"}
            </label>
          </section>
        </div>
        
        <button
          type="button"
          onClick={handleSaveCollection}
          disabled={!isSaveEnabled}
          className={styles.saveButton}
        >
          Сохранить изменения
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