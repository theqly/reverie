import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./CreatePinPage.module.css";

import Header from "./Header";
import AddPinModal from "./AddPinModal";
import InviteCollaboratorModal from "./InviteCollaboratorModal";

const EditPinPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // ← например, /edit-pin/:id

  // Основные поля
  const [collectionName, setCollectionName] = useState("");
  const [collectionInfo, setCollectionInfo] = useState("");

  // Галерея
  const [images, setImages] = useState<File[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Ковер
  const [coverImage, setCoverImage] = useState<File | null>(null);

  // Модалки
  const [isAddPinModalOpen, setIsAddPinModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Соавторы
  const [collaborators, setCollaborators] = useState<string[]>([]);

  // Валидация
  const isSaveEnabled =
    collectionName.trim().length > 0 &&
    collectionName.length <= 50 &&
    collectionInfo.length <= 1000 &&
    coverImage !== null;

  // -------------------------------------------------------
  // 🔥 Заглушка загрузки данных с сервера
  // -------------------------------------------------------
  useEffect(() => {
    console.log(`Fetching pin ${id}... (stub request)`);

    // имитация ответа сервера
    setTimeout(() => {
      setCollectionName("Мой прекрасный пин");
      setCollectionInfo("Описание пина, загруженное с сервера...");
      setCollaborators(["Anna", "Kirill"]);
    }, 300);

    // заглушка загруженного изображения
    // имитация одного фейкового файла
    fetch("/placeholder.jpg") // добавь любой файл в public, иначе поменяй на свой
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "image.jpg", { type: "image/jpeg" });
        setImages([file]);
        setCoverImage(file);
      });
  }, [id]);

  // -------------------------------------------------------
  // 📌 Обработчики
  // -------------------------------------------------------

  const handleBack = () => {
    navigate(-1);
  };

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (images.length >= 10) return;

    const newImages = [...images, file];
    setImages(newImages);
    setCurrentIndex(newImages.length - 1);
  };

  const handleSave = () => {
    console.log("Saving edited pin... (stub)", {
      id,
      name: collectionName,
      info: collectionInfo,
      images,
      cover: coverImage,
      collaborators,
    });

    navigate(`/pin/${id}`);
  };

  const handleAddCollaborator = () => {
    const newC = `Collaborator ${collaborators.length + 1}`;
    setCollaborators((prev) => [...prev, newC]);
  };

  // -------------------------------------------------------

  return (
    <div className={styles.createCollectionPage}>
      <Header />

      <main className={styles.collectionContent}>
        <div className={styles.h_container}>
          <button onClick={handleBack} className={styles.back_btn}></button>
          <h1>Редактирование пина</h1>
        </div>

        <div className={styles.gridWrapper}>
          {/* --- Название --- */}
          <label className={styles.name_label}>Название:</label>
          <div className={styles.name_input_block}>
            <input
              type="text"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              maxLength={50}
              className={
                collectionName.length > 50 ? styles.error : styles.name_input
              }
            />
            <div className={styles.characterCounter}>
              {collectionName.length}/50
            </div>
          </div>

          {/* --- Описание --- */}
          <label className={styles.discr_label}>Описание:</label>
          <div className={styles.discr_input_block}>
            <textarea
              value={collectionInfo}
              onChange={(e) => setCollectionInfo(e.target.value)}
              maxLength={1000}
              rows={4}
              className={
                collectionInfo.length > 1000
                  ? styles.error
                  : styles.discr_input
              }
            />
            <div className={styles.characterCounter}>
              {collectionInfo.length}/1000
            </div>
          </div>

          {/* --- Галерея --- */}
          <section className={styles.coverSection}>
            <label htmlFor="gallery-input" className={styles.galleryWrapper}>
              {images.length === 0 ? (
                <div className={styles.coverPlaceholder}>+</div>
              ) : (
                <>
                  <img
                    src={URL.createObjectURL(images[currentIndex])}
                    className={styles.galleryImage}
                    alt="preview"
                  />

                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const newImages = images.filter(
                        (_, i) => i !== currentIndex
                      );
                      setImages(newImages);
                      if (currentIndex >= newImages.length) {
                        setCurrentIndex(newImages.length - 1);
                      }
                    }}
                  >
                    ✕
                  </button>

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

            <label htmlFor="gallery-input" className={styles.uploadButton}>
              Добавить фото
            </label>

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
          onClick={handleSave}
          disabled={!isSaveEnabled}
          className={styles.saveButton}
        >
          Сохранить изменения
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

export default EditPinPage;
