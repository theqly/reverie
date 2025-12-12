import { useState } from 'react';
import MapPicker from './MapPicker';
import styles from './MapPage.module.css'; // ← ИМПОРТ СТИЛЕЙ
import { useNavigate } from 'react-router-dom';
import Header from './Header'; 


const MapPage = () => {
  const navigate = useNavigate();

  const [coords, setCoords] = useState<[number, number] | null>(null);
    const handleBack = () => {
        navigate('/pin/create');
    };

  
  return (
    <div>
      <Header />
      <main className={styles.collectionContent}>
        <div className={styles.h_container}>

            <button onClick={handleBack} className={styles.back_btn}></button>
            <h2>Выберите точку на карте</h2>

        </div >

        <div className={styles.mapWrap}>
      
        <MapPicker onSelect={(c) => setCoords(c)} />
          </div>
        {coords && (
            <p>
            Выбраны координаты: {coords[0].toFixed(6)}, {coords[1].toFixed(6)}
            </p>
        )}
        

        <button className={styles.saveButton}>  Добавить точку </button>

      </main>
    </div>
  );
};

export default MapPage;
