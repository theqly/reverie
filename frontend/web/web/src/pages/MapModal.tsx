import { useState } from 'react';
import MapPicker from './MapPicker';
import styles from './MapModal.module.css';

interface MapModalProps {
  onClose: () => void;
  onSelect: (lat: number, lng: number) => void;
}

const MapModal = ({ onClose, onSelect }: MapModalProps) => {
  const [coords, setCoords] = useState<[number, number] | null>(null);

  const handleSave = () => {
    if (!coords) return;
    onSelect(coords[0], coords[1]);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Выберите точку на карте</h2>

        <MapPicker onSelect={setCoords} />

        {coords && (
          <p>
            {coords[0].toFixed(6)}, {coords[1].toFixed(6)}
          </p>
        )}

        <div className={styles.actions}>
          <button onClick={onClose}>Отмена</button>
          <button onClick={handleSave} disabled={!coords}>
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapModal;
