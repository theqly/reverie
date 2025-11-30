import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CreatePinPage.module.css'; // ← ИМПОРТ СТИЛЕЙ
import logo from '../assets/Reverie.svg';
import AddPinModal from "./AddPinModal";
import InviteCollaboratorModal from './InviteCollaboratorModal';
import Header from './Header'; 



const CreatePinPage = () => {
  const navigate = useNavigate();
  
  // Состояния для полей формы
  const [collectionName, setCollectionName] = useState('');
  const [collectionInfo, setCollectionInfo] = useState('');
  const [isAddPinModalOpen, setIsAddPinModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [collaborators, setCollaborators] = useState<string[]>([]); // ← заглушка: имена соавторов

  const [images, setImages] = useState<File[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [pinCount, setPinCount] = useState(0);

  // Обработчики
  const handleBack = () => {
    navigate('/');
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

  const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCoverImage(file);
    }
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


  const handleSaveCollection = () => {
    // Заглушка для сохранения
    console.log('Save collection:', {
      name: collectionName,
      info: collectionInfo,
      cover: coverImage,
      pinCount
    });
  };

  // Валидация для кнопки сохранения
  const isSaveEnabled = collectionName.trim().length > 0 && 
                       collectionName.length <= 50 && 
                       collectionInfo.length <= 1000 &&
                       coverImage !== null;
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
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                maxLength={50}
                className={collectionName.length > 50 ? styles.error : styles.name_input}
                />

                <div className={styles.characterCounter}>
                {collectionName.length}/50
                </div>
                {collectionName.length > 50 && (
                <div className={styles.errorMessage}>
                    Collection name must be 50 characters or less
                </div>
                )}
                
            </div>

                        

            <label htmlFor="collection-info" className={styles.discr_label}>Описание:</label>

            <div className={styles.discr_input_block}>
                <textarea
                id="collection-info"
                value={collectionInfo}
                onChange={(e) => setCollectionInfo(e.target.value)}
                maxLength={1000}
                rows={4}
                className={collectionInfo.length > 1000 ? styles.error : styles.discr_input}
                />

                <div className={styles.characterCounter}>
                {collectionInfo.length}/1000
                </div>
                {collectionInfo.length > 1000 && (
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

                <button onClick={() => navigate('/map')} className={styles.mapButton}>Найти на карте</button>
            </section>

        </div>
        
        
        <button 
            type="button" 
            onClick={handleSaveCollection}
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
    </div>
  );
};

export default CreatePinPage;