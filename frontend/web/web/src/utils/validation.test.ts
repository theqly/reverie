import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FormValidator, ImageUtils, DateUtils } from './validation';

describe('FormValidator', () => {
  describe('validatePinData', () => {
    it('проходит валидацию для корректных данных', () => {
      const result = FormValidator.validatePinData({
        name: 'Красивое место',
        description: 'Описание',
        latitude: 55.7558,
        longitude: 37.6173,
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('возвращает ошибку для пустого названия', () => {
      const result = FormValidator.validatePinData({
        name: '',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Название пина обязательно');
    });

    it('возвращает ошибку для слишком длинного названия', () => {
      const result = FormValidator.validatePinData({
        name: 'а'.repeat(101),
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Название не должно превышать 100 символов');
    });

    it('возвращает ошибку для слишком длинного описания', () => {
      const result = FormValidator.validatePinData({
        name: 'Название',
        description: 'а'.repeat(1001),
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Описание не должно превышать 1000 символов');
    });

    it('возвращает ошибку для невалидной широты', () => {
      const result1 = FormValidator.validatePinData({
        name: 'Название',
        latitude: 91,
      });
      expect(result1.isValid).toBe(false);
      expect(result1.errors).toContain('Широта должна быть от -90 до 90');

      const result2 = FormValidator.validatePinData({
        name: 'Название',
        latitude: -91,
      });
      expect(result2.isValid).toBe(false);
    });

    it('возвращает ошибку для невалидной долготы', () => {
      const result1 = FormValidator.validatePinData({
        name: 'Название',
        longitude: 181,
      });
      expect(result1.isValid).toBe(false);
      expect(result1.errors).toContain('Долгота должна быть от -180 до 180');

      const result2 = FormValidator.validatePinData({
        name: 'Название',
        longitude: -181,
      });
      expect(result2.isValid).toBe(false);
    });

    it('может возвращать несколько ошибок одновременно', () => {
      const result = FormValidator.validatePinData({
        name: '',
        description: 'а'.repeat(1001),
        latitude: 100,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('validateCollectionData', () => {
    it('проходит валидацию для корректных данных', () => {
      const result = FormValidator.validateCollectionData({
        name: 'Моя коллекция',
        info: 'Описание коллекции',
        collaborators: ['user1', 'user2'],
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('возвращает ошибку для пустого названия', () => {
      const result = FormValidator.validateCollectionData({
        name: '   ',
        collaborators: ['user1'],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Название коллекции обязательно');
    });

    it('возвращает ошибку для пустого массива collaborators', () => {
      const result = FormValidator.validateCollectionData({
        name: 'Название',
        collaborators: [],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Должен быть хотя бы один участник');
    });
  });

  describe('validateCommentData', () => {
    it('проходит валидацию для корректного комментария', () => {
      const result = FormValidator.validateCommentData({
        text: 'Отличный пост!',
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('возвращает ошибку для пустого комментария', () => {
      const result = FormValidator.validateCommentData({
        text: '   ',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Комментарий не может быть пустым');
    });

    it('возвращает ошибку для слишком длинного комментария', () => {
      const result = FormValidator.validateCommentData({
        text: 'а'.repeat(501),
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Комментарий не должен превышать 500 символов');
    });
  });
});

describe('ImageUtils', () => {
  describe('validateImageFile', () => {
    it('проходит валидацию для JPEG файла', () => {
      const file = new File(['content'], 'image.jpg', { type: 'image/jpeg' });
      const result = ImageUtils.validateImageFile(file);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('проходит валидацию для PNG файла', () => {
      const file = new File(['content'], 'image.png', { type: 'image/png' });
      const result = ImageUtils.validateImageFile(file);

      expect(result.isValid).toBe(true);
    });

    it('возвращает ошибку для неподдерживаемого формата', () => {
      const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      const result = ImageUtils.validateImageFile(file);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Разрешены только изображения');
    });

    it('возвращает ошибку для файла больше 10 МБ', () => {
      const largeContent = new Array(11 * 1024 * 1024).fill('a').join('');
      const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
      const result = ImageUtils.validateImageFile(file);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Размер файла не должен превышать');
    });
  });

  describe('formatFileSize', () => {
    it('форматирует байты', () => {
      expect(ImageUtils.formatFileSize(0)).toBe('0 Б');
      expect(ImageUtils.formatFileSize(500)).toBe('500 Б');
    });

    it('форматирует килобайты', () => {
      expect(ImageUtils.formatFileSize(1024)).toBe('1 КБ');
      expect(ImageUtils.formatFileSize(2048)).toBe('2 КБ');
    });

    it('форматирует мегабайты', () => {
      expect(ImageUtils.formatFileSize(1024 * 1024)).toBe('1 МБ');
      expect(ImageUtils.formatFileSize(5 * 1024 * 1024)).toBe('5 МБ');
    });

    it('форматирует с десятичными знаками', () => {
      expect(ImageUtils.formatFileSize(1536)).toBe('1.5 КБ');
      expect(ImageUtils.formatFileSize(1536 * 1024)).toBe('1.5 МБ');
    });
  });
});

describe('DateUtils', () => {
  describe('getRelativeTime', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-12-20T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('возвращает "только что" для свежих дат', () => {
      const date = new Date('2025-12-20T11:59:50Z');
      expect(DateUtils.getRelativeTime(date)).toBe('только что');
    });

    it('возвращает минуты для недавних дат', () => {
      const date = new Date('2025-12-20T11:55:00Z');
      expect(DateUtils.getRelativeTime(date)).toContain('минут');
    });

    it('возвращает часы', () => {
      const date = new Date('2025-12-20T09:00:00Z');
      expect(DateUtils.getRelativeTime(date)).toContain('час');
    });

    it('возвращает дни', () => {
      const date = new Date('2025-12-18T12:00:00Z');
      expect(DateUtils.getRelativeTime(date)).toContain('дня');
    });

    it('возвращает месяцы', () => {
      const date = new Date('2025-11-20T12:00:00Z');
      expect(DateUtils.getRelativeTime(date)).toContain('месяц');
    });

    it('возвращает годы', () => {
      const date = new Date('2024-12-20T12:00:00Z');
      expect(DateUtils.getRelativeTime(date)).toContain('год');
    });

    it('работает со строками дат', () => {
      const result = DateUtils.getRelativeTime('2025-12-20T11:55:00Z');
      expect(result).toContain('минут');
    });
  });
});
