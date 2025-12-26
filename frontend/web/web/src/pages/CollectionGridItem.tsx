import placeholder_1 from '../assets/placeholder1.jpg';
import styles from './CollectionGridItem.module.css';

interface Collection {
  id: string | number;
  image?: string;
  title: string;
  location?: string;
  pinsCount?: number;
  author?: string;
  authorAvatar?: string;
}

interface CollectionGridItemProps {
  collection: Collection;
  onClick?: (id: string | number) => void;
}

const CollectionGridItem = ({ collection, onClick }: CollectionGridItemProps) => {
  const {
    id,
    image, // Это может быть undefined или отсутствовать
    boardImageURL, // Добавляем эту строку
    title,
    location,
    pinsCount,
    author = "jane_anderson",
    authorAvatar = placeholder_1
  } = collection;

  // Используем boardImageURL если он есть, иначе image, иначе placeholder
  const imageUrl = boardImageURL || image || placeholder_1;

  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  return (
    <div key={id} className={styles.collectionCard} onClick={handleClick}>
      <div style={{ display: "flex" }}>
        <div className={styles.imgWrapper}>
          {/* Используем imageUrl вместо image */}
          <img src={imageUrl} alt={title} className={styles.img1} />
        </div>
        
        <div className={styles.collectionLabelWrapper}>
          <div className={styles.collectionTitle}>{title}</div>
          
          {/* Показываем только если location есть */}
          {location && (
            <div className={styles.collectionLocation}>{location}</div>
          )}

          <div className={styles.collectionPinsCount}>
            {pinsCount} pins →
          </div>
        </div>
      </div>
      
      <div className={styles.pinAuthorWrapperBoard}>
        <img
          src={authorAvatar}
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

export default CollectionGridItem;
