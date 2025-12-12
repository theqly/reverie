import { useNavigate } from "react-router-dom";
import Header from "./Header";
import MapPicker from "./MapPicker";
import styles from "./PinViewPage.module.css";
import placeholder_2 from "../assets/placeholder3.jpg";
import placeholder_1 from '../assets/placeholder1.jpg';


interface PinViewPageProps {
  title?: string;
  description?: string;
  coords?: [number, number];
}

const PinViewPage = ({
  title = "Сигнатура функции — это уникальная подпись, которая",
  description = "Описание пина. Здесь будет ваш текст. Описание пина. Описание пина. Описание пина. Здесь будет ваш текст. Описание пина. Здесь будет ваш текст. Описание пина. Здесь будет ваш текст. Описание пина. Здесь будет ваш текст. Описание пина. Здесь будет ваш текст. Описание пина. Здесь будет ваш текст.",
  coords = [55.751244, 37.618423],
}: PinViewPageProps) => {
  const navigate = useNavigate();

  const handleBack = () => navigate("/");

  return (
    <div className={styles.pageWrapper}>
      <Header />

      <div className={styles.contentWrapper}>
        {/* Левая колонка — скроллимый контент */}
        <div className={styles.leftColumn}>
          <div className={styles.h_container}>
            <button onClick={handleBack} className={styles.back_btn}></button>
            <h2>Просмотр пина</h2>
          </div>

          <div className={styles.pinCard}>
            <img src={placeholder_2} className={styles.img1} />
            <h3 className={styles.pinTitle}>{title}</h3>
            <p className={styles.collectionLocation}>Paris</p>
            <p className={styles.pinDescription}>{description}</p>

            <p className={styles.pinCoords}>
              Координаты: {coords[0]}, {coords[1]}
            </p>
            <div className={styles.reactionBlock}>
              <div className={styles.likesWrapper}>
                <button></button>
                <p>226</p>
              </div>
              <div className={styles.bmWrapper}>
                <button></button>
              </div>
            </div>
          </div>

          <div className={styles.commentWrapper}>
            <p>Комментарии</p>
            <section className={styles.commentSection}>
              <div className={styles.commentCard}>
                <div className={styles.commentAuthorWrapper}>
                  <img
                    src={placeholder_1} // аватарка автора
                    alt="Author Avatar"
                    className={styles.commentAuthorAvatar}
                  />
                  <div className={styles.commentAuthorName}>jane_anderson</div>
                </div>
                <div className={styles.commentText}>
                  Это пример комментария. Здесь может быть длинный текст, и карточка будет автоматически расширяться.
                </div>
                <div className={styles.commentDate}>2 часа назад</div>
              </div>
            </section>
          </div>
        </div>

        {/* Правая фиксированная карта */}
        <div className={styles.mapWrapperFixed}>
          <MapPicker onSelect={() => {}} initialCoords={coords} readOnly />
        </div>
      </div>
    </div>
  );
};

export default PinViewPage;
