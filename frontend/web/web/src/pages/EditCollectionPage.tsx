import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './CreateCollectionPage.module.css';
import InviteCollaboratorModal from './InviteCollaboratorModal';
import Header from './Header';
// import { updateCollection } from "../services/collectionsService";

const EditCollectionPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // предполагаем, что путь будет что-то вроде /edit-collection/:id

  // Состояния для полей формы
  const [collectionName, setCollectionName] = useState('');
  const [collectionInfo, setCollectionInfo] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [collaborators, setCollaborators] = useState<string[]>([]);

  const [coverImage, setCoverImage] = useState<File | null>(null);

  // --- Эмуляция загрузки данных с сервера ---
  useEffect(() => {
    console.log(`Загружаем данные подборки id=${id}... (заглушка)`);
    // тут можно сделать fetch → заглушка:
    setTimeout(() => {
      setCollectionName("Моя существующая подборка");
      setCollectionInfo("Описание, загруженное с сервера. Можно редактировать.");
      setCollaborators(["alice", "bob", "charlie"]);
      // Для cover — заглушка: берем дефолтный файл из public или assets
      // Но для простоты оставим null, тогда пользователь может загрузить новый cover
    }, 300);
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCoverImage(file);
    }
  };

  const handleSaveCollection = async () => {
    const payload = {
      id,
      name: collectionName,
      info: collectionInfo,
      coverImage,
      collaborators
    };

    // Здесь бы вызывался updateCollection(payload)
    console.log("updateCollection called with payload:", payload);

    // После сохранения можно вернуться назад или куда нужно
    navigate(-1);
  };

  const isSaveEnabled = collectionName.trim().length > 0 &&
                        collectionName.length <= 50 &&
                        collectionInfo.length <= 1000;

  return (
    <div className={styles.createCollectionPage}>
      <Header />

      <main className={styles.collectionContent}>
        <div className={styles.h_container}>
          <button onClick={handleBack} className={styles.back_btn}></button>
          <h1>Редактировать подборку</h1>
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
                Название должно быть не более 50 символов
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
          </div>

          <label className={styles.collaborator_label}>Соавторы:</label>
          <div className={styles.collaboratorsList}>
            {collaborators.map((name, idx) => (
              <div key={idx} className={styles.collaboratorItem}>
                <span>@{name}</span>
                <button
                  className={styles.removeCollaboratorBtn}
                  onClick={() => {
                    setCollaborators(prev => prev.filter(c => c !== name));
                  }}
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setIsInviteModalOpen(true)}
              className={styles.actionButton}
            >
              Добавить соавтора
            </button>
          </div>

          <section className={styles.coverSection}>
            <label htmlFor="cover-input" className={styles.coverLabel}>
              {coverImage ? (
                <img
                  src={URL.createObjectURL(coverImage)}
                  alt="Обложка подборки"
                  className={styles.coverPreview}
                />
              ) : (
                <div className={styles.coverPlaceholder}>
                  <span className={styles.plus}>+</span>
                </div>
              )}
            </label>
            <input
              id="cover-input"
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className={styles.hiddenInput}
            />
            <label htmlFor="cover-input" className={styles.uploadButton}>
              {coverImage ? "Изменить фото" : "Загрузить фото"}
            </label>
          </section>
        </div>

        <button
          type="button"
          onClick={handleSaveCollection}
          disabled={!isSaveEnabled}
          className={styles.saveButton}
        >
          Сохранить изменения
        </button>

        {isInviteModalOpen && (
          <InviteCollaboratorModal
            onClose={() => setIsInviteModalOpen(false)}
            onAddCollaborator={(name) => {
              setCollaborators(prev => [...prev, name]);
            }}
            existingCollaborators={collaborators}
          />
        )}
      </main>
    </div>
  );
};

export default EditCollectionPage;
