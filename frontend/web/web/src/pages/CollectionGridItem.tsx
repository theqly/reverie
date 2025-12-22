import React from 'react';
import placeholder_1 from '../assets/placeholder1.jpg';
import styles from './CollectionGridItem.module.css';

const CollectionGridItem = ({ collection, onClick }) => {
  const {
    id,
    image,
    title,
    location,
    pinsCount,
    author = "jane_anderson",
    authorAvatar = placeholder_1
  } = collection;

  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  return (
    <div key={id} className={styles.collectionCard} onClick={handleClick}>
      <div style={{ display: "flex" }}>
        <div className={styles.imgWrapper}>
          <img src={image} alt={title} className={styles.img1} />
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