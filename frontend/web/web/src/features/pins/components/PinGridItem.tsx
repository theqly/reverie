
import styles from './PinGridItem.module.css';

import placeholder_1 from '../../../assets/placeholder1.jpg';
import placeholder from '../../../assets/placeholder3.jpg';

interface PinGridItemData {
  id: string;
  title: string;
  location?: string;
  author?: string;
  authorAvatar?: string | null;
  image?: string | null;
  images?: Array<{
    imageUrl: string;
  }> | null;
}

interface PinGridItemProps {
  pin: PinGridItemData;
  onClick?: () => void;
}

const PinGridItem = ({
  pin,
  onClick,
}: PinGridItemProps) => {
  const {
    title,
    location = '',
    author = 'Автор неизвестен',
    authorAvatar = placeholder_1,
    image,
    images,
  } = pin;

  const imageSrc =
    images?.[0]?.imageUrl ||
    image ||
    placeholder;

  return (
    <div
      className={styles.pin}
      onClick={onClick}
    >
      <div className={styles.pinImageWrapper}>
        <img
          src={imageSrc}
          alt={title}
          className={styles.pinImage}
        />

        <div className={styles.pinLocation}>
          {location}
        </div>

        <div className={styles.pinTitle}>
          {title}
        </div>
      </div>

      <div className={styles.pinAuthorWrapper}>
        <img
          src={authorAvatar ?? placeholder_1}
          alt={`Аватар ${author}`}
          className={styles.pinAuthorAvatar}
        />

        <div className={styles.pinAuthor}>
          {author}
        </div>
      </div>
    </div>
  );
};

export default PinGridItem;
