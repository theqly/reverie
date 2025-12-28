import React from 'react';
import PinGridItem from './PinGridItem';
import styles from './PinGridItem.module.css'; 



const PinGrid = ({ pins, onPinClick }) => {
  return (
    <div className={styles.pinsGrid}>
      {pins.map(pin => (
        <PinGridItem 
          key={pin.id} 
          pin={pin} 
          onClick={() => onPinClick(pin.id, pin.author, pin.ownerId)}
        />
      ))}
    </div>
  );
};

export default PinGrid;