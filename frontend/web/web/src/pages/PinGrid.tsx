import PinGridItem from './PinGridItem';
import styles from './PinGridItem.module.css';

interface Pin {
  id: string | number;
  image?: string;
  title: string;
  location?: string;
}

interface PinGridProps {
  pins: Pin[];
  onPinClick: (id: string | number) => void;
}

const PinGrid = ({ pins, onPinClick }: PinGridProps) => {
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