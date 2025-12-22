import React from 'react';
import placeholder_1 from '../assets/placeholder1.jpg';
import styles from './PinGridItem.module.css'; 
import placeholder from '../assets/placeholder3.jpg';


const PinGridItem = ({ pin, onClick }) => {
  const {
    id,
    title,
    location = "Paris",
    author = "jane_anderson",
    authorAvatar = placeholder_1,
    images
  } = pin;

  const imageSrc = images?.[0]?.imageUrl || placeholder;

  return (
    <div className={styles.pin} onClick={onClick}>
      <div className={styles.pinImageWrapper}>
        <img src={imageSrc} alt={title} className={styles.pinImage} />

        <div className={styles.pinLocation}>{location}</div>
        <div className={styles.pinTitle}>{title}</div>
      </div>

      <div className={styles.pinAuthorWrapper}>
        <img src={authorAvatar} className={styles.pinAuthorAvatar} />
        <div className={styles.pinAuthor}>{author}</div>
      </div>
    </div>
  );
};


export default PinGridItem;