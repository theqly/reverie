import placeholder_1 from '../assets/placeholder1.jpg';
import placeholder_2 from '../assets/placeholder2.jpg';
import placeholder_3 from '../assets/placeholder3.jpg';
import placeholder_4 from '../assets/placeholder4.jpg';
import placeholder_6 from '../assets/placeholder6.jpg';
import placeholder_7 from '../assets/placeholder7.jpg';
import placeholder_8 from '../assets/placeholder8.jpg';
import placeholder_9 from '../assets/placeholder9.jpg';

const placeholders = [
  placeholder_1, placeholder_2, placeholder_3, placeholder_4,
  placeholder_6, placeholder_7, placeholder_8, placeholder_9
];

/**
 * Возвращает placeholder изображение по ID (консистентно для одного и того же объекта)
 */
export function getPlaceholderById(id: string): string {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return placeholders[hash % placeholders.length];
}

/**
 * Дефолтный аватар для пользователей
 */
export const defaultAvatar = placeholder_3;
