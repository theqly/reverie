import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CreateCollectionPage.module.css'; // ← ИМПОРТ СТИЛЕЙ
import AddPinModal from "./AddPinModal";
import InviteCollaboratorModal from './InviteCollaboratorModal';
import Header from './Header'; 
import { createCollection } from "../services/collectionsService";



const CreateCollectionPage = () => {
  const navigate = useNavigate();

  //запросы: создание новой подборки, получение пользователя по никнейму, 
  // получение пинов-своих/пинов-лайкнутых/закладок/, создание пина, получение подписок пользователя, получение пина по ссылке(???)
  
  //что должно происходить при приглашении в ревери?

  
  // Состояния для полей формы
  const [collectionName, setCollectionName] = useState('');
  const [collectionInfo, setCollectionInfo] = useState('');
  const [isAddPinModalOpen, setIsAddPinModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [collaborators, setCollaborators] = useState<string[]>([]); // ← заглушка: имена соавторов



  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [pinCount, setPinCount] = useState(0);

  // Обработчики
  const handleBack = () => {
    navigate('/');
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




  const handleSaveCollection = async () => {
    const payload = {
      name: collectionName,
      info: collectionInfo,
      coverImage,
      collaborators
    };

    await createCollection(payload);

    console.log("createCollection вызвана с payload:", payload);
  };





  // Валидация для кнопки сохранения
  const isSaveEnabled = collectionName.trim().length > 0 && 
                       collectionName.length <= 50 && 
                       collectionInfo.length <= 1000;

  return (

    <div className={styles.createCollectionPage}>
      <Header/>

      <main className={styles.collectionContent}>
        <div className={styles.h_container}>
            <button onClick={handleBack} className={styles.back_btn}></button>
            <h1>Создание подборки @nickname</h1>
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

            <label className={styles.pin_label}>Пины (5):</label>

            <button 
            type="button" 
            onClick={handleAddPin}
            className={styles.actionButton}
            >
                Добавить пин
            </button>


            <label className={styles.collaborator_label}>Соавторы: </label>

            

            <div className={styles.collaboratorsList}>
              {collaborators.map((name, idx) => (
                <div key={idx} className={styles.collaboratorItem}>
                  {name}
                </div>
              ))}

              <button 
                type="button" 
                onClick={handleInviteCollaborator}
                className={styles.actionButton}
              >
                Добавить соавтора
              </button>
            </div>


            <section className={styles.coverSection}>

              {/* Кликабельная область с картинкой */}
              <label htmlFor="cover-input" className={styles.coverLabel}>
                {coverImage ? (
                  <img
                    src={URL.createObjectURL(coverImage)}
                    alt="Collection cover"
                    className={styles.coverPreview}
                  />
                ) : (
                  <div className={styles.coverPlaceholder}>
                    <span className={styles.plus}>+</span>
                  </div>
                )}
              </label>

              {/* Скрытый input */}
              <input
                id="cover-input"
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className={styles.hiddenInput}
              />

              {/* Кнопка «Загрузить фото» */}
              <label htmlFor="cover-input" className={styles.uploadButton}>
                Загрузить фото
              </label>
          </section>

            
        </div>
        
        
        <button 
            type="button" 
            onClick={handleSaveCollection}
            disabled={!isSaveEnabled}
            className={styles.saveButton}
          >
            Сохранить подборку
        </button>

        {isAddPinModalOpen && (
          <AddPinModal onClose={() => setIsAddPinModalOpen(false)} />
        )}

        {isInviteModalOpen && (
          <InviteCollaboratorModal 
              onClose={() => setIsInviteModalOpen(false)}
              onAddCollaborator={(name) => {
                setCollaborators(prev => [...prev, name]);
              }}
          />
        )}
      </main>
    </div>
  );
};

export default CreateCollectionPage;