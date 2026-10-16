
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import styles from './CreateCollectionPage.module.css';

import Header from '../../pages/Header';
import { useToast } from '../../pages/ToastContext';

import {
  getBoardById,
  updateCollection,
} from '../../services/collectionsService';

import {
  AccessLevelType,
  type UpdateBoardInput,
} from '@/graphql/generated/graphql';

type CollectionData = NonNullable<
  Awaited<ReturnType<typeof getBoardById>>
>;

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
      } catch (err) {
        if (cancelled) return;

        console.error(
          '[EditCollectionPage] Failed to load collection:',
          err,
        );

        setError('Не удалось загрузить подборку');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadCollection();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const isSaveEnabled =
    collectionName.trim().length > 0 &&
    collectionName.length <= 50 &&
    collectionInfo.length <= 1000 &&
    !saving;

  const handleSaveCollection = async () => {
    if (!id || !originalCollection || !isSaveEnabled) {
      return;
    }

    // В текущей форме нет доступа к авторизованному
    // пользователю. Не подставляем фиктивный userId.
    //
    // Если GetBoardById возвращает ownerId,
    // используем его только после проверки типа.
    const ownerId =
      'ownerId' in originalCollection &&
      typeof originalCollection.ownerId === 'string'
        ? originalCollection.ownerId
        : null;

    if (!ownerId) {
      console.error(
        '[EditCollectionPage] Missing userId for UpdateBoardInput',
      );

      showToast(
        'Не удалось определить пользователя для сохранения',
        true,
      );
      return;
    }

    const payload: UpdateBoardInput = {
      userId: ownerId,
      name: collectionName.trim(),
      description: collectionInfo,
      accessLevel: AccessLevelType.Public,
    };

    setSaving(true);

    try {
      console.log('[EditCollection] Sending payload:', payload);
      const updatedBoard = await updateCollection(id, payload);

      if (!updatedBoard) {
        showToast('Ошибка при сохранении', true);
        return;
      }

      showToast('Подборка успешно обновлена!');

      navigate(`/collection/${id}`);
    } catch (err: unknown) {
      console.error(
        '[EditCollectionPage] Failed to update collection:',
        err,
      );

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
            <div className={styles.loading}>
              Загрузка данных подборки...
            </div>
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

            <p>
              {error ?? 'Данные подборки отсутствуют'}
            </p>

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
          <button
            onClick={handleBack}
            className={styles.back_btn}
            aria-label="Назад"
          />

          <h1>Редактировать подборку</h1>
        </div>

        <div className={styles.gridWrapper}>
          <label
            htmlFor="collection-name"
            className={styles.name_label}
          >
            Название:
          </label>

          <div className={styles.name_input_block}>
            <input
              id="collection-name"
              type="text"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              maxLength={50}
              className={
                collectionName.length > 50
                  ? styles.error
                  : styles.name_input
              }
            />

            <div className={styles.characterCounter}>
              {collectionName.length}/50
            </div>

            {collectionName.length > 50 && (
              <div className={styles.errorMessage}>
                Название не должно превышать 50 символов
              </div>
            )}
          </div>

          <label
            htmlFor="collection-info"
            className={styles.discr_label}
          >
            Описание:
          </label>

          <div className={styles.discr_input_block}>
            <textarea
              id="collection-info"
              value={collectionInfo}
              onChange={(e) => setCollectionInfo(e.target.value)}
              maxLength={1000}
              rows={4}
              className={
                collectionInfo.length > 1000
                  ? styles.error
                  : styles.discr_input
              }
              placeholder="Опишите вашу подборку..."
            />

            <div className={styles.characterCounter}>
              {collectionInfo.length}/1000
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void handleSaveCollection()}
          disabled={!isSaveEnabled}
          className={styles.saveButton}
        >
          {saving ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </main>
    </div>
  );
};

export default EditCollectionPage;
