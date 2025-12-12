import { useNavigate } from "react-router-dom";
import Header from "./Header";
import MapPicker from "./MapPicker";
import styles from "./PinViewPage.module.css";


import placeholder_1 from '../assets/placeholder1.jpg';
import placeholder_2 from '../assets/placeholder2.jpg';
import placeholder_3 from '../assets/placeholder3.jpg';
import placeholder_4 from '../assets/placeholder4.jpg';
import placeholder_6 from '../assets/placeholder6.jpg';
import placeholder_7 from '../assets/placeholder7.jpg';
import placeholder_8 from '../assets/placeholder8.jpg';
import placeholder_9 from '../assets/placeholder9.jpg';
import placeholder_10 from '../assets/placeholder10.jpg';


interface CollectionViewPageProps {
  title?: string;
  description?: string;
  coords?: [number, number];
}



const CollectionViewPage = ({
  title = "Сигнатура функции — это уникальная подпись, которая",
  description = "Описание пина. Здесь будет ваш текст. Описание пина. Описание пина. Описание пина. Здесь будет ваш текст. Описание пина. Здесь будет ваш текст. Описание пина. Здесь будет ваш текст. Описание пина. Здесь будет ваш текст. Описание пина. Здесь будет ваш текст. Описание пина. Здесь будет ваш текст.",
  coords = [55.751244, 37.618423],
}: CollectionViewPageProps) => {
  const navigate = useNavigate();

  const handleBack = () => navigate("/");

  const pins = [
    {
      id: 1,
      image: placeholder_9,
      title: "Cafe le cafe delacrua",
      location: "Paris, France",
      author: "jane_anderson",
      authorAvatar: placeholder_1
    },
    {
      id: 2,
      image: placeholder_2,
      title: "Morning in the mountains",
      location: "Chamonix, France",
      author: "alex_smith",
      authorAvatar: placeholder_2
    },
    {
      id: 3,
      image: placeholder_3,
      title: "Sunset by the lake",
      location: "Lake Tahoe, USA",
      author: "emily_jones",
      authorAvatar: placeholder_3
    },
    {
      id: 4,
      image: placeholder_4,
      title: "City lights at night",
      location: "New York, USA",
      author: "michael_lee",
      authorAvatar: placeholder_4
    },
    {
      id: 6,
      image: placeholder_6,
      title: "Ocean waves",
      location: "Malibu, USA",
      author: "liam_wilson",
      authorAvatar: placeholder_6
    },
    {
      id: 7,
      image: placeholder_7,
      title: "Autumn forest walk",
      location: "Kyoto, Japan",
      author: "hana_tanaka",
      authorAvatar: placeholder_7
    },
    {
      id: 8,
      image: placeholder_8,
      title: "Historic streets",
      location: "Prague, Czechia",
      author: "peter_novak",
      authorAvatar: placeholder_8
    },
    {
      id: 9,
      image: placeholder_9,
      title: "Desert adventures",
      location: "Sahara, Morocco",
      author: "fatima_hassan",
      authorAvatar: placeholder_9
    },
    {
      id: 10,
      image: placeholder_10,
      title: "Cozy cafe corner",
      location: "Lisbon, Portugal",
      author: "carlos_silva",
      authorAvatar: placeholder_10
    },
    {
      id: 11,
      image: placeholder_7,
      title: "Morning coffee ritual",
      location: "Vienna, Austria",
      author: "anna_muller",
      authorAvatar: placeholder_1
    },
    {
      id: 12,
      image: placeholder_2,
      title: "Hidden waterfalls",
      location: "Iceland",
      author: "olafsson",
      authorAvatar: placeholder_2
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
            <h2>Просмотр подборки</h2>
          </div>

          <div className={styles.pinCard}>
            <img src={placeholder_3} className={styles.img1} />
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

            <h3 className={styles.pinsTitle}>Места из этой подборки</h3>

          <div className={styles.pinsWrapper}>
            <div className={styles.pinsGrid}>
                {pins.map(pin => (
                  <div key={pin.id} className={styles.pin}>
                    <div className={styles.pinImageWrapper}>
                      <img src={pin.image} alt={pin.title} className={styles.pinImage} />

                      {/* Верхний правый угол — локация */}
                      <div className={styles.pinLocation}>
                        {pin.location || "Paris"}
                      </div>

                      {/* Нижний центр — название */}
                      <div className={styles.pinTitle}>
                        {pin.title}
                      </div>
                    </div>

                    {/* Имя автора под картинкой */}
                    <div className={styles.pinAuthorWrapper}>
                      <img
                        src={pin.authorAvatar || placeholder_1} // аватарка автора
                        alt="Author Avatar"
                        className={styles.pinAuthorAvatar}
                      />
                      <div className={styles.pinAuthor}>
                        {pin.author || "jane_nderson"}
                      </div>
                    </div>
                  </div>
                ))}
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
                  <div className={styles.commentAuthorName}>jane_аanderson</div>
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

export default CollectionViewPage;
