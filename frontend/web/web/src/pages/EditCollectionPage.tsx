import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import styles from './CreateCollectionPage.module.css';
import InviteCollaboratorModal from './InviteCollaboratorModal';
import Header from './Header';
import { useToast } from './ToastProvider';
import {getUserIdFromToken} from '../auth/tokenStorage';

import {
  getCollectionById as getMockCollectionById,
} from '../utils/mockData';

import {
  updateCollection,
  getPinById as getBackendCollectionById,
} from '../services/collectionsService';

import { type UpdateBoardInput, AccessLevelType } from '@/graphql/generated/graphql';
import { validateImageFile } from '../services/imageService';
import placeholder from "../assets/placeholder1.jpg";

const EditCollectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { showToast } = useToast();

  const [collectionName, setCollectionName] = useState('');
  const [collectionInfo, setCollectionInfo] = useState('');
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [originalCollection, setOriginalCollection] = useState<any>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  /* =======================
     Helpers
  ======================= */

  const getCollectionImageUrl = (): string => {
    if (coverImage) return URL.createObjectURL(coverImage);
    if (originalCollection?.image || originalCollection?.boardImageURL || originalCollection?.coverImage) {
      return originalCollection.image || originalCollection.boardImageURL || originalCollection.coverImage;
    }
    return placeholder; // fallback placeholder
  };

  /* =======================
     Load collection
  ======================= */

  useEffect(() => {
    const loadCollection = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const board = await getBackendCollectionById(id);

        if (board) {
          setOriginalCollection(board);
          setCollectionName(board.title || board.name || '');
          setCollectionInfo(board.description || '');
          setCollaborators(board.collaborators || []);
          return;
        }

        const mock = getMockCollectionById(parseInt(id));
        if (mock) {
          setOriginalCollection(mock);
          setCollectionName(mock.title || '');
          setCollectionInfo(mock.description || '');
          setCollaborators(mock.collaborators || []);
        } else {
          setError(`Подборка с ID ${id} не найдена`);
        }
      } catch (e) {
        const mock = getMockCollectionById(parseInt(id));
        if (mock) {
          setOriginalCollection(mock);
          setCollectionName(mock.title || '');
          setCollectionInfo(mock.description || '');
          setCollaborators(mock.collaborators || []);
        } else {
          setError('Не удалось загрузить подборку');
        }
      } finally {
        setLoading(false);
      }
    };

    loadCollection();
  }, [id]);

  /* =======================
     Handlers
  ======================= */

  const handleSaveCollection = async () => {
    if (!id || !originalCollection) return;

    setIsSaving(true);
    setUploadError(null);

    try {
      const payload: UpdateBoardInput = {
        userId: getUserIdFromToken(),
        name: collectionName.trim(),
        description: collectionInfo.trim(),
        accessLevel: AccessLevelType.Public,
      };

      // Обложка принципиально НЕ обновляется
      await updateCollection(id, payload);

      showToast('Успешное сохранение!');
      handleBack();
    } catch (e: any) {
      setUploadError(e.message || 'Ошибка при сохранении');
      showToast('Ошибка при сохранении', true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Недопустимый файл');
      return;
    }

    setCoverImage(file);
    setUploadError(null);
  };

  const handleBack = () => {
    const params = new URLSearchParams(location.search);
    const from = params.get('from');
    if (from) {
      navigate(`/${from}`);
    } else {
      navigate(-1);
    }
  };

  const isSaveEnabled =
    !isSaving &&
    collectionName.trim().length > 0 &&
    collectionName.length <= 50 &&
    collectionInfo.length <= 1000;

  /* =======================
     Render states
  ======================= */

  if (loading) {
    return (
      <div className={styles.createCollectionPage}>
        <Header />
        <main className={styles.collectionContent}>
          <div className={styles.loading}>Загрузка данных коллекции…</div>
        </main>
      </div>
    );
  }

  if (error || !originalCollection) {
    return (
      <div className={styles.createCollectionPage}>
        <Header />
        <main className={styles.collectionContent}>
          <h2>Коллекция не найдена</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/feed')}>На главную</button>
        </main>
      </div>
    );
  }

  /* =======================
     JSX
  ======================= */

  return (
    <div className={styles.createCollectionPage}>
      <Header />
      <main className={styles.collectionContent}>
        <div className={styles.h_container}>
          <button onClick={handleBack} className={styles.back_btn} />
          <h1>Редактировать подборку</h1>
        </div>

        <div className={styles.gridWrapper}>
          <label>Название:</label>
          <input
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            maxLength={50}
            className={styles.name_input}
          />

          <label>Описание:</label>
          <textarea
            value={collectionInfo}
            onChange={(e) => setCollectionInfo(e.target.value)}
            maxLength={1000}
            rows={4}
            className={styles.discr_input}
          />

          <label>Соавторы:</label>
          <div className={styles.collaboratorsList}>
            {collaborators.map((c) => (
              <div key={c} className={styles.collaboratorItem}>
                @{c}
                <button onClick={() => setCollaborators(prev => prev.filter(x => x !== c))}>✕</button>
              </div>
            ))}
            <button className={styles.actionButton} onClick={() => setIsInviteModalOpen(true)}>Добавить соавтора</button>
          </div>

          <section className={styles.coverSection}>
            <label htmlFor="cover-input" className={styles.coverLabel}>
              <img
                src={getCollectionImageUrl()}
                className={styles.coverPreview}
                alt="Обложка подборки"
              />
            </label>
            <input
              id="cover-input"
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className={styles.hiddenInput}
            />
          </section>
        </div>

        {uploadError && <div className={styles.errorMessage}>{uploadError}</div>}

        <button
          disabled={!isSaveEnabled}
          onClick={handleSaveCollection}
          className={styles.saveButton}
        >
          {isSaving ? 'Сохранение…' : 'Сохранить изменения'}
        </button>

        {isInviteModalOpen && (
          <InviteCollaboratorModal
            onClose={() => setIsInviteModalOpen(false)}
            onAddCollaborator={(name) =>
              setCollaborators(prev => prev.includes(name) ? prev : [...prev, name])
            }
            existingCollaborators={collaborators}
          />
        )}
      </main>
    </div>
  );
};

export default EditCollectionPage;
