import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CreatePinPage.module.css'; // ← ИМПОРТ СТИЛЕЙ
import logo from '../assets/Reverie.svg';
import AddPinModal from "./AddPinModal";
import InviteCollaboratorModal from './InviteCollaboratorModal';
import Header from './Header'; 
import { createPin } from "../services/pinService";
import { useLocation } from 'react-router-dom';
import MapModal from './MapModal';

const CreatePinPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Состояния для полей формы
  const [pinLatitude, setPinLatitude] = useState<number | null>(null);
  const [pinLongitude, setPinLongitude] = useState<number | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [pinName, setPinName] = useState('');
  const [pinInfo, setPinInfo] = useState('');
  const [isAddPinModalOpen, setIsAddPinModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [collaborators, setCollaborators] = useState<string[]>([]); // ← заглушка: имена соавторов

  const [images, setImages] = useState<File[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [pinCount, setPinCount] = useState(0);

  useEffect(() => {
  if (location.state?.latitude && location.state?.longitude) {
    setPinLatitude(location.state.latitude);
    setPinLongitude(location.state.longitude);
  }
}, [location.state]);

  // Обработчики
const handleBack = () => {
  // Пробуем взять from из URL
  const searchParams = new URLSearchParams(location.search);
  const from = searchParams.get('from');
  
  if (from) {
    // Если есть параметр from - используем его
    navigate(`/${from}`);
  } else if (document.referrer && document.referrer.includes(window.location.origin)) {
    // Если есть реферер и он с нашего сайта - используем его
    const referrerPath = new URL(document.referrer).pathname;
    navigate(referrerPath);
  } else {
    // Иначе возвращаемся в историю или на фид по умолчанию
    navigate(-1);
  }
};

  const handleAddImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ограничение 10 изображений
    if (images.length >= 10) return;

    const newImages = [...images, file];
    setImages(newImages);

    // показываем последнее добавленное
    setCurrentIndex(newImages.length - 1);

    console.log("Pin photo updated | pin_ID");
  };

  const handleAddPin = () => {
    setIsAddPinModalOpen(true);
    setPinCount(prev => prev + 1);
  };

  const handleInviteCollaborator = () => {
    setIsInviteModalOpen(true);
  };

  const handleAddCollaborator = () => {
    // Заглушка: добавляем фиктивного коллаборатора
    const newCollaborator = `Collaborator ${collaborators.length + 1}`;
    setCollaborators(prev => [...prev, newCollaborator]);
  };


   const handleSavePin = async () => {
    console.log('[CreatePin] Current coordinates:', {
      latitude: pinLatitude,
      longitude: pinLongitude
    });
  
  if (pinLatitude === null || pinLongitude === null) {
  alert('Выберите точку на карте');
    return;
  }

  const payload = {
    name: pinName,
    description: pinInfo,
    latitude: pinLatitude,
    longitude: pinLongitude,
    ownerId: '00000000-0000-0000-0000-000000000001', // временно, заглушка
    coverImages: images
  };

    await createPin(payload);
  };

  // Валидация для кнопки сохранения
  const isSaveEnabled = pinName.trim().length > 0 && 
                       pinName.length <= 50 && 
                       pinInfo.length <= 1000 &&
                       images.length > 0;
  return (

    <div className={styles.createCollectionPage}>
      <Header/>

      <main className={styles.collectionContent}>
        <div className={styles.h_container}>
            <button onClick={handleBack} className={styles.back_btn}></button>
            <h1>Новый пин от @nickname</h1>
        </div>


        <div className={styles.gridWrapper}>

            <label htmlFor="collection-name" className={styles.name_label}>Название:</label> 

            <div className={styles.name_input_block}>
                <input
                id="collection-name"
                type="text"
                value={pinName}
                onChange={(e) => setPinName(e.target.value)}
                maxLength={50}
                className={pinName.length > 50 ? styles.error : styles.name_input}
                />

                <div className={styles.characterCounter}>
                {pinName.length}/50
                </div>
                {pinName.length > 50 && (
                <div className={styles.errorMessage}>
                    Collection name must be 50 characters or less
                </div>
                )}
                
            </div>

                        

            <label htmlFor="collection-info" className={styles.discr_label}>Описание:</label>

            <div className={styles.discr_input_block}>
                <textarea
                id="collection-info"
                value={pinInfo}
                onChange={(e) => setPinInfo(e.target.value)}
                maxLength={1000}
                rows={4}
                className={pinInfo.length > 1000 ? styles.error : styles.discr_input}
                />

                <div className={styles.characterCounter}>
                {pinInfo.length}/1000
                </div>
                {pinInfo.length > 1000 && (
                <div className={styles.errorMessage}>
                    Collection info must be 1000 characters or less
                </div>
                )}
            </div>

            


            <section className={styles.coverSection}>

                <label
                    htmlFor="gallery-input"
                    className={styles.galleryWrapper}
                >
                    {images.length === 0 ? (
                    <div className={styles.coverPlaceholder}>+</div>
                    ) : (
                    <>
                        {/* ТЕКУЩЕЕ ИЗОБРАЖЕНИЕ */}
                        <img
                        src={URL.createObjectURL(images[currentIndex])}
                        className={styles.galleryImage}
                        alt="preview"
                        />

                        {/* КРЕСТИК УДАЛЕНИЯ */}
                        <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            const newImages = images.filter((_, i) => i !== currentIndex);

                            setImages(newImages);

                            // корректируем индекс
                            if (currentIndex >= newImages.length) {
                            setCurrentIndex(newImages.length - 1);
                            }
                        }}
                        >
                        ✕
                        </button>

                        {/* ЛЕВАЯ КНОПКА */}
                        {currentIndex > 0 && (
                        <button
                            type="button"
                            className={styles.navLeft}
                            onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCurrentIndex((prev) => prev - 1);
                            }}
                        >
                            ‹
                        </button>
                        )}

                        {/* ПРАВАЯ КНОПКА */}
                        {currentIndex < images.length - 1 && (
                        <button
                            type="button"
                            className={styles.navRight}
                            onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCurrentIndex((prev) => prev + 1);
                            }}
                        >
                            ›
                        </button>
                        )}

                        {/* СЧЁТЧИК */}
                        <div
                        className={`${styles.counter} ${
                            images.length === 10 ? styles.counterMax : ""
                        }`}
                        >
                        {currentIndex + 1} / 10
                        </div>
                    </>
                    )}
                </label>

                {/* КНОПКА ДОБАВЛЕНИЯ */}
                <label
                    htmlFor="gallery-input"
                    className={styles.uploadButton}
                >
                    {images.length === 0 ? "Загрузить фото" : "Добавить ещё фото"}
                </label>

                {/* СКРЫТЫЙ INPUT */}
                <input
                    id="gallery-input"
                    type="file"
                    accept="image/*"
                    onChange={handleAddImage}
                    className={styles.hiddenInput}
                />

                <button
  type="button"
  onClick={() => setIsMapOpen(true)}
  className={styles.mapButton}
>
  Найти на карте
</button>
{pinLatitude !== null && pinLongitude !== null && (
  <div className={styles.coordsInfo}>
    <div>
      <strong>Широта:</strong> {pinLatitude.toFixed(6)}
    </div>
    <div>
      <strong>Долгота:</strong> {pinLongitude.toFixed(6)}
    </div>
  </div>
)}
            </section>

        </div>
        
        
        <button 
            type="button" 
            onClick={handleSavePin}
            disabled={!isSaveEnabled}
            className={styles.saveButton}
          >
            Сохранить пин
        </button>

        {isAddPinModalOpen && (
          <AddPinModal onClose={() => setIsAddPinModalOpen(false)} />
        )}

        {isInviteModalOpen && (
          <InviteCollaboratorModal onClose={() => setIsInviteModalOpen(false)} />
        )}


      </main>
      {isMapOpen && (
      <MapModal
        onClose={() => setIsMapOpen(false)}
        onSelect={(lat, lng) => {
          setPinLatitude(lat);
          setPinLongitude(lng);
        }}
      />
    )}

    </div>
  );
};

export default CreatePinPage;