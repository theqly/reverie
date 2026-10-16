import { useEffect, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './CreateCollectionPage.module.css';
import InviteCollaboratorModal from '../../pages/InviteCollaboratorModal';
import Header from '../../pages/Header';
import { createCollection } from '../../services/collectionsService';
import { validateImageFile } from '../../services/imageService';
import { getUserIdFromToken } from '../../auth/tokenStorage';

const CreateCollectionPage = () => {
  const navigate = useNavigate();

  const [collectionName, setCollectionName] = useState('');
  const [collectionInfo, setCollectionInfo] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (!coverImage) {
      setCoverPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(coverImage);
    setCoverPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [coverImage]);

  const handleBack = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const from = searchParams.get('from');

    if (from?.startsWith('/') && !from.startsWith('//')) {
      navigate(from);
    } else {
      navigate(-1);
    }
  };

  const handleCoverUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Недопустимый файл');
      event.target.value = '';
      return;
    }

    setUploadError(null);
    setCoverImage(file);
    event.target.value = '';
  };

  const isSaveEnabled =
    !isUploading &&
    collectionName.trim().length > 0 &&
    collectionName.length <= 50 &&
    collectionInfo.length <= 1000;

  const handleSaveCollection = async () => {
    if (!isSaveEnabled) return;

    const currentUser = getUserIdFromToken();
    if (!currentUser) {
      setUploadError('Не удалось определить пользователя. Войдите в аккаунт повторно.');
      return;
    }

    // Модальное окно пока возвращает имена, а CreateGroup ожидает UUID.
    // Не отправляем некорректные данные и не создаём подборку без соавторов молча.
    if (collaborators.length > 0) {
      setUploadError('Создание подборки с соавторами пока недоступно: необходимо получать ID выбранных пользователей.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const result = await createCollection(
        {
          name: collectionName.trim(),
          info: collectionInfo,
          coverImage,
          collaborators: [currentUser],
        },
        (progress) => setUploadProgress(progress.percentage),
      );

      if (!result.success || !result.boardId) {
        setUploadError(result.error || 'Не удалось создать подборку');
        return;
      }

      navigate(`/collection/${result.boardId}`, { replace: true });
    } catch (error: unknown) {
      console.error('[CreateCollectionPage] Creation failed:', error);
      setUploadError(error instanceof Error ? error.message : 'Произошла ошибка');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.createCollectionPage}>
      <Header />

      <main className={styles.collectionContent}>
        <div className={styles.h_container}>
          <button type="button" onClick={handleBack} className={styles.back_btn} aria-label="Назад" />
          <h1>Создание подборки</h1>
        </div>

        <div className={styles.gridWrapper}>
          <label htmlFor="collection-name" className={styles.name_label}>Название:</label>
          <div className={styles.name_input_block}>
            <input
              id="collection-name"
              type="text"
              value={collectionName}
              onChange={(event) => setCollectionName(event.target.value)}
              maxLength={50}
              className={styles.name_input}
            />
            <div className={styles.characterCounter}>{collectionName.length}/50</div>
          </div>

          <label htmlFor="collection-info" className={styles.discr_label}>Описание:</label>
          <div className={styles.discr_input_block}>
            <textarea
              id="collection-info"
              value={collectionInfo}
              onChange={(event) => setCollectionInfo(event.target.value)}
              maxLength={1000}
              rows={4}
              className={styles.discr_input}
            />
            <div className={styles.characterCounter}>{collectionInfo.length}/1000</div>
          </div>

          <label className={styles.collaborator_label}>Соавторы:</label>
          <div className={styles.collaboratorsList}>
            {collaborators.map((name) => (
              <div key={name} className={styles.collaboratorItem}>
                <span>@{name}</span>
                <button
                  type="button"
                  className={styles.removeCollaboratorBtn}
                  onClick={() => setCollaborators((prev) => prev.filter((item) => item !== name))}
                  aria-label={`Удалить соавтора ${name}`}
                >
                  ✕
                </button>
              </div>
            ))}
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
              {coverPreviewUrl ? (
                <img src={coverPreviewUrl} alt="Обложка подборки" className={styles.coverPreview} />
              ) : (
                <div className={styles.coverPlaceholder}>
                  <span className={styles.plus}>+</span>
                </div>
              )}
            </label>
            <input
              id="cover-input"
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className={styles.hiddenInput}
              disabled={isUploading}
            />
            <label htmlFor="cover-input" className={styles.uploadButton}>
              {coverImage ? 'Заменить фото' : 'Загрузить фото'}
            </label>
          </section>
        </div>

        {uploadError && (
          <div role="alert" className={styles.errorMessage} style={{ marginBottom: '1rem', color: 'red' }}>
            {uploadError}
          </div>
        )}

        {isUploading && coverImage && (
          <div className={styles.uploadProgress} style={{ marginBottom: '1rem' }}>
            <div>Загрузка обложки: {uploadProgress}%</div>
            <div style={{ width: '100%', height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px', marginTop: '0.5rem' }}>
              <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: '#4CAF50', borderRadius: '4px', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => void handleSaveCollection()}
          disabled={!isSaveEnabled}
          className={styles.saveButton}
        >
          {isUploading ? 'Сохранение...' : 'Сохранить подборку'}
        </button>

        {isInviteModalOpen && (
          <InviteCollaboratorModal
            onClose={() => setIsInviteModalOpen(false)}
            onAddCollaborator={(name) => {
              setCollaborators((prev) => prev.includes(name) ? prev : [...prev, name]);
            }}
            existingCollaborators={collaborators}
          />
        )}
      </main>
    </div>
  );
};

export default CreateCollectionPage;
