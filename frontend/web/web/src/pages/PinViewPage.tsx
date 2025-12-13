import { useNavigate } from "react-router-dom";
import Header from "./Header";
import MapPicker from "./MapPicker";
import styles from "./PinViewPage.module.css";
import placeholder_2 from "../assets/placeholder3.jpg";
import placeholder_1 from '../assets/placeholder1.jpg';
import ReactionBlock from './ReactionBlock';
import CommentSection from './CommentSection'



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

    const comments = [
    {
      authorName: "jane_anderson",
      authorAvatar: placeholder_1,
      commentText: "Отличное фото! Очень красивое место.",
      commentDate: "2 часа назад"
    },
    {
      authorName: "alex_smith",
      authorAvatar: placeholder_2,
      commentText: "Был там прошлым летом, незабываемые впечатления!",
      commentDate: "5 часов назад"
    },
    {
      authorName: "travel_lover",
      authorAvatar: placeholder_1,
      commentText: "Спасибо за рекомендацию, обязательно посещу!",
      commentDate: "1 день назад"
    }
  ];

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



            <ReactionBlock 
              initialLikes={226}
              initialLiked={false}
              initialBookmarked={false}
              onLike={(isLiked) => console.log('Лайк:', isLiked)}
              onBookmark={(isBookmarked) => console.log('Закладка:', isBookmarked)}
            />
          </div>
          

          <CommentSection 
            comments={comments}
            title="Комментарии"
          />




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
