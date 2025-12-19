// Валидация данных форм
export class FormValidator {
  static validatePinData(data: {
    name?: string;
    description?: string;
    latitude?: number;
    longitude?: number;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Название пина обязательно');
    }

    if (data.name && data.name.length > 100) {
      errors.push('Название не должно превышать 100 символов');
    }

    if (data.description && data.description.length > 1000) {
      errors.push('Описание не должно превышать 1000 символов');
    }

    if (data.latitude !== undefined && (data.latitude < -90 || data.latitude > 90)) {
      errors.push('Широта должна быть от -90 до 90');
    }

    if (data.longitude !== undefined && (data.longitude < -180 || data.longitude > 180)) {
      errors.push('Долгота должна быть от -180 до 180');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateCollectionData(data: {
    name?: string;
    info?: string;
    collaborators?: string[];
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Название коллекции обязательно');
    }

    if (data.name && data.name.length > 100) {
      errors.push('Название не должно превышать 100 символов');
    }

    if (data.info && data.info.length > 500) {
      errors.push('Описание не должно превышать 500 символов');
    }

    if (data.collaborators && data.collaborators.length === 0) {
      errors.push('Должен быть хотя бы один участник');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateCommentData(data: { text?: string }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.text || data.text.trim().length === 0) {
      errors.push('Комментарий не может быть пустым');
    }

    if (data.text && data.text.length > 500) {
      errors.push('Комментарий не должен превышать 500 символов');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Утилиты для работы с изображениями
export class ImageUtils {
  static validateImageFile(file: File): { isValid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSizeInMB = 10;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Разрешены только изображения форматов: JPEG, PNG, WebP, GIF',
      };
    }

    if (file.size > maxSizeInBytes) {
      return {
        isValid: false,
        error: `Размер файла не должен превышать ${maxSizeInMB} МБ`,
      };
    }

    return { isValid: true };
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Б';

    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}

// Утилиты для работы с датами
export class DateUtils {
  static getRelativeTime(date: Date | string): string {
    const now = new Date();
    const past = typeof date === 'string' ? new Date(date) : date;
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'только что';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${this.pluralize(diffInMinutes, 'минуту', 'минуты', 'минут')} назад`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${this.pluralize(diffInHours, 'час', 'часа', 'часов')} назад`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} ${this.pluralize(diffInDays, 'день', 'дня', 'дней')} назад`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} ${this.pluralize(diffInMonths, 'месяц', 'месяца', 'месяцев')} назад`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} ${this.pluralize(diffInYears, 'год', 'года', 'лет')} назад`;
  }

  private static pluralize(n: number, one: string, few: string, many: string): string {
    const mod10 = n % 10;
    const mod100 = n % 100;

    if (mod10 === 1 && mod100 !== 11) {
      return one;
    }

    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
      return few;
    }

    return many;
  }
}
