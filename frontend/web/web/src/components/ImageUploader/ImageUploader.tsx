import { useState, useCallback, useRef, useEffect } from 'react';
import styles from './ImageUploader.module.css';
import { validateImageFile, createPreviewUrl, revokePreviewUrl } from '@/services/imageService';
import { MAX_PIN_IMAGES } from '@/types/image';

export interface ExistingImage {
  id: string;
  imageUrl: string;
  orderNumber: number;
}

interface ImageUploaderProps {
  // Существующие изображения (для редактирования)
  existingImages?: ExistingImage[];
  // Новые файлы
  newImages?: File[];
  // Максимальное количество изображений
  maxImages?: number;
  // Колбэки
  onImagesChange: (newImages: File[]) => void;
  onExistingImageDelete?: (imageId: string) => void;
  // Показывать ли одиночный режим (только одно изображение)
  singleMode?: boolean;
  // Disabled состояние
  disabled?: boolean;
  // Текст для кнопки
  uploadButtonText?: string;
  addMoreButtonText?: string;
  // Ошибка
  error?: string | null;
}

const ImageUploader = ({
  existingImages = [],
  newImages = [],
  maxImages = MAX_PIN_IMAGES,
  onImagesChange,
  onExistingImageDelete,
  singleMode = false,
  disabled = false,
  uploadButtonText = 'Загрузить фото',
  addMoreButtonText = 'Добавить ещё фото',
  error: externalError
}: ImageUploaderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalImages = existingImages.length + newImages.length;
  const canAddMore = totalImages < maxImages && !disabled;
  const error = externalError || localError;

  // Создаём превью URL для новых изображений
  useEffect(() => {
    const urls = newImages.map(file => createPreviewUrl(file));
    setPreviewUrls(urls);

    // Очищаем URL при размонтировании или изменении
    return () => {
      urls.forEach(url => revokePreviewUrl(url));
    };
  }, [newImages]);

  // Корректируем индекс при изменении количества изображений
  useEffect(() => {
    if (currentIndex >= totalImages && totalImages > 0) {
      setCurrentIndex(totalImages - 1);
    }
  }, [totalImages, currentIndex]);

  const getCurrentImageUrl = useCallback((): string | null => {
    if (totalImages === 0) return null;
    
    if (currentIndex < existingImages.length) {
      return existingImages[currentIndex]?.imageUrl || null;
    } else {
      const newImageIndex = currentIndex - existingImages.length;
      return previewUrls[newImageIndex] || null;
    }
  }, [currentIndex, existingImages, previewUrls, totalImages]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Сбрасываем input для повторного выбора того же файла
    event.target.value = '';

    // В одиночном режиме заменяем изображение
    if (singleMode) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setLocalError(validation.error || 'Недопустимый файл');
        return;
      }
      setLocalError(null);
      onImagesChange([file]);
      setCurrentIndex(0);
      return;
    }

    // В множественном режиме добавляем
    if (totalImages >= maxImages) {
      setLocalError(`Максимум ${maxImages} изображений`);
      return;
    }

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setLocalError(validation.error || 'Недопустимый файл');
      return;
    }

    setLocalError(null);
    const updatedImages = [...newImages, file];
    onImagesChange(updatedImages);
    setCurrentIndex(existingImages.length + updatedImages.length - 1);
  }, [newImages, existingImages.length, maxImages, totalImages, singleMode, onImagesChange]);

  const handleDelete = useCallback(() => {
    if (totalImages === 0) return;

    if (currentIndex < existingImages.length) {
      // Удаляем существующее изображение
      const imageToDelete = existingImages[currentIndex];
      if (onExistingImageDelete) {
        onExistingImageDelete(imageToDelete.id);
      }
    } else {
      // Удаляем новое изображение
      const newImageIndex = currentIndex - existingImages.length;
      const updatedImages = newImages.filter((_, i) => i !== newImageIndex);
      onImagesChange(updatedImages);
    }

    // Корректируем индекс
    if (currentIndex >= totalImages - 1 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex, existingImages, newImages, totalImages, onImagesChange, onExistingImageDelete]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalImages - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, totalImages]);

  const openFileDialog = useCallback(() => {
    if (canAddMore) {
      fileInputRef.current?.click();
    }
  }, [canAddMore]);

  const currentImageUrl = getCurrentImageUrl();

  return (
    <div className={styles.container}>
      {/* Область превью */}
      <div 
        className={`${styles.previewArea} ${canAddMore ? styles.clickable : ''}`}
        onClick={totalImages === 0 ? openFileDialog : undefined}
      >
        {totalImages === 0 ? (
          <div className={styles.placeholder}>
            <span className={styles.plusIcon}>+</span>
            <p>{uploadButtonText}</p>
          </div>
        ) : (
          <>
            <img
              src={currentImageUrl || ''}
              alt={`Изображение ${currentIndex + 1}`}
              className={styles.previewImage}
            />

            {/* Кнопка удаления */}
            {!disabled && (
              <button
                type="button"
                className={styles.deleteButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                aria-label="Удалить изображение"
              >
                ✕
              </button>
            )}

            {/* Навигация */}
            {!singleMode && totalImages > 1 && (
              <>
                {currentIndex > 0 && (
                  <button
                    type="button"
                    className={styles.navLeft}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    aria-label="Предыдущее изображение"
                  >
                    ‹
                  </button>
                )}

                {currentIndex < totalImages - 1 && (
                  <button
                    type="button"
                    className={styles.navRight}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    aria-label="Следующее изображение"
                  >
                    ›
                  </button>
                )}
              </>
            )}

            {/* Счётчик */}
            {!singleMode && (
              <div className={`${styles.counter} ${totalImages >= maxImages ? styles.counterMax : ''}`}>
                {currentIndex + 1} / {maxImages}
              </div>
            )}
          </>
        )}
      </div>

      {/* Скрытый input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className={styles.hiddenInput}
        disabled={disabled || (!singleMode && totalImages >= maxImages)}
      />

      {/* Кнопка добавления */}
      {!singleMode && totalImages > 0 && canAddMore && (
        <button
          type="button"
          onClick={openFileDialog}
          className={styles.addButton}
          disabled={disabled}
        >
          {addMoreButtonText}
        </button>
      )}

      {singleMode && totalImages > 0 && (
        <button
          type="button"
          onClick={openFileDialog}
          className={styles.addButton}
          disabled={disabled}
        >
          Изменить фото
        </button>
      )}

      {/* Ошибка */}
      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
