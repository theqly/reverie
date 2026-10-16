import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import styles from './CreateCollectionPage.module.css';
import Header from '../../pages/Header';
import { useToast } from '../../pages/ToastContext';
import placeholder from '../../assets/placeholder1.jpg';
import { getUserIdFromToken } from '../../auth/tokenStorage';
import {
  getBoardById,
  updateCollection,
} from '../../services/collectionsService';
import type { UpdateBoardInput } from '@/graphql/generated/graphql';

type CollectionData = NonNullable<Awaited<ReturnType<typeof getBoardById>>>;

// В некоторых версиях сгенерированного GraphQL-типа это поле ещё отсутствует.
function getBoardCoverUrl(board: CollectionData): string {
  if (
    'boardImageURL' in board &&
    typeof board.boardImageURL === 'string' &&
    board.boardImageURL.length > 0
  ) {
    return board.boardImageURL;
  }

  return board.pins?.[0]?.images?.[0]?.imageUrl ?? placeholder;
}

const EditCollectionPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  const [originalCollection, setOriginalCollection] =
    useState<CollectionData | null>(null);
  const [collectionName, setCollectionName] = useState('');
  const [collectionInfo, setCollectionInfo] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setOriginalCollection(null);
      setError('ID подборки не указан');
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadCollection = async () => {
      setLoading(true);
      setError(null);
      setOriginalCollection(null);

      try {
        const board = await getBoardById(id);
        if (cancelled) return;

        if (!board) {
          setError(`Подборка с ID ${id} не найдена`);
          return;
        }

        setOriginalCollection(board);
        setCollectionName(board.name);
        setCollectionInfo(board.description ?? '');
      } catch (err: unknown) {
        if (cancelled) return;
        console.error('[EditCollectionPage] Load error:', err);
        setError('Не удалось загрузить подборку');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadCollection();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const isSaveEnabled =
    !loading &&
    !saving &&
    originalCollection !== null &&
    collectionName.trim().length > 0 &&
    collectionName.length <= 50 &&
    collectionInfo.length <= 1000;

  const handleSaveCollection = async () => {
    if (!id || !isSaveEnabled) return;

    const userId = getUserIdFromToken();
    if (!userId) {
      setSaveError('Не удалось определить авторизованного пользователя');
      showToast('Для сохранения необходимо войти в аккаунт', true);
      return;
    }

    // accessLevel намеренно не передаём: изменение имени/описания
    // не должно делать приватную или групповую подборку публичной.
    const payload: UpdateBoardInput = {
      userId,
      name: collectionName.trim(),
      description: collectionInfo,
    };

    setSaving(true);
    setSaveError(null);

    try {
      const updatedBoard = await updateCollection(id, payload);
      if (!updatedBoard) {
        throw new Error('Сервер не вернул обновлённую подборку');
      }

      showToast('Подборка успешно обновлена!');
      navigate(`/collection/${id}`);
    } catch (err: unknown) {
      console.error('[EditCollectionPage] Save error:', err);
      const message = err instanceof Error ? err.message : 'Ошибка при сохранении';
      setSaveError(message);
      showToast('Ошибка при сохранении', true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.createCollectionPage}>
        <Header />
        <main className={styles.collectionContent}>
          <div className={styles.loadingContainer}>
            <div className={styles.loading}>Загрузка данных подборки...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !originalCollection) {
    return (
      <div className={styles.createCollectionPage}>
        <Header />
        <main className={styles.collectionContent}>
          <div className={styles.errorContainer}>
            <h2>Не удалось открыть подборку</h2>
            <p>{error ?? 'Данные подборки отсутствуют'}</p>
            <button
              type="button"
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
          <button
            type="button"
            onClick={() => navigate(`/collection/${id}`)}
            className={styles.back_btn}
            aria-label="Назад"
          />
          <h1>Редактировать подборку</h1>
        </div>

        <div className={styles.gridWrapper}>
          <label htmlFor="collection-name" className={styles.name_label}>
            Название:
          </label>
          <div className={styles.name_input_block}>
            <input
              id="collection-name"
              type="text"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              maxLength={50}
              className={styles.name_input}
            />
            <div className={styles.characterCounter}>
              {collectionName.length}/50
            </div>
          </div>

          <label htmlFor="collection-info" className={styles.discr_label}>
            Описание:
          </label>
          <div className={styles.discr_input_block}>
            <textarea
              id="collection-info"
              value={collectionInfo}
              onChange={(e) => setCollectionInfo(e.target.value)}
              maxLength={1000}
              rows={4}
              className={styles.discr_input}
              placeholder="Опишите вашу подборку..."
            />
            <div className={styles.characterCounter}>
              {collectionInfo.length}/1000
            </div>
          </div>

          <section className={styles.coverSection}>
            <div className={styles.coverLabel}>
              <img
                src={getBoardCoverUrl(originalCollection)}
                className={styles.coverPreview}
                alt="Обложка подборки"
              />
            </div>
            <p>Изменение обложки пока недоступно.</p>
          </section>
        </div>

        {saveError && (
          <p role="alert" className={styles.errorMessage}>
            {saveError}
          </p>
        )}

        <button
          type="button"
          disabled={!isSaveEnabled}
          onClick={() => void handleSaveCollection()}
          className={styles.saveButton}
        >
          {saving ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </main>
    </div>
  );
};

export default EditCollectionPage;
