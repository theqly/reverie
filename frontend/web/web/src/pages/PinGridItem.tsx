import React from 'react';
import placeholder_1 from '../assets/placeholder1.jpg';
import styles from './PinGridItem.module.css'; 

const PinGridItem = ({ pin, onClick }) => {
  const {
    id,
    image,
    title,
    location = "Paris",
    author = "jane_anderson",
    authorAvatar = placeholder_1
  } = pin;

  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  return (
    <div key={id} className={styles.pin} onClick={handleClick}>
      <div className={styles.pinImageWrapper}>
        <img src={image} alt={title} className={styles.pinImage} />
        
        {/* Верхний правый угол — локация */}
        <div className={styles.pinLocation}>
          {location}
        </div>

        {/* Нижний центр — название */}
        <div className={styles.pinTitle}>
          {title}
        </div>
      </div>

      {/* Имя автора под картинкой */}
      <div className={styles.pinAuthorWrapper}>
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

export default PinGridItem;