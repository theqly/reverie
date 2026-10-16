import PinGridItem from './PinGridItem';
import styles from './PinGridItem.module.css';

type Pin = React.ComponentProps<typeof PinGridItem>['pin'];

interface PinGridProps {
  pins: Pin[];
  onPinClick: (
    pinId: string,
    author?: string,
    ownerId?: string,
  ) => void;
}

const PinGrid = ({ pins, onPinClick }: PinGridProps) => {
  return (
    <div className={styles.pinsGrid}>
      {pins.map((pin) => (
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