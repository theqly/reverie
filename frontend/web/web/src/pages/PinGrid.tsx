import React from 'react';
import PinGridItem from './PinGridItem';
import styles from './PinGridItem.module.css'; // или используй стили из Feed.module.css

const PinGrid = ({ pins, onPinClick }) => {
  return (
    <div className={styles.pinsGrid}>
      {pins.map(pin => (
        <PinGridItem 
          key={pin.id} 
          pin={pin} 
          onClick={() => onPinClick(pin.id)}
        />
      ))}
    </div>
  );
};

export default PinGrid;