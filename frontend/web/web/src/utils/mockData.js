import placeholder_1 from '../assets/placeholder1.jpg';
import placeholder_2 from '../assets/placeholder2.jpg';
import placeholder_3 from '../assets/placeholder3.jpg';
import placeholder_4 from '../assets/placeholder4.jpg';
import placeholder_6 from '../assets/placeholder6.jpg';
import placeholder_7 from '../assets/placeholder7.jpg';
import placeholder_8 from '../assets/placeholder8.jpg';
import placeholder_9 from '../assets/placeholder9.jpg';
import placeholder_10 from '../assets/placeholder9.jpg';

export const mockPins = [
  {
    id: 1,
    image: placeholder_9,
    title: "Cafe le cafe delacrua",
    location: "Paris, France",
    description: "Уютное кафе в центре Парижа с лучшим кофе в городе. Идеальное место для утреннего кофе или работы за ноутбуком.",
    author: "jane_anderson",
    authorAvatar: placeholder_1,
    coords: [48.8566, 2.3522]
  },
  {
    id: 2,
    image: placeholder_2,
    title: "Morning in the mountains",
    location: "Chamonix, France",
    description: "Встреча рассвета в Альпах. Незабываемые виды и свежий горный воздух. Обязательно возьмите теплую одежду!",
    author: "alex_smith",
    authorAvatar: placeholder_2,
    coords: [45.9237, 6.8694]
  },
  {
    id: 3,
    image: placeholder_3,
    title: "Sunset by the lake",
    location: "Lake Tahoe, USA",
    description: "Одно из самых красивых мест для наблюдения за закатом. Вода в озере кристально чистая, идеально для фотографий.",
    author: "emily_jones",
    authorAvatar: placeholder_3,
    coords: [39.0968, -120.0324]
  },
  {
    id: 4,
    image: placeholder_4,
    title: "City lights at night",
    location: "New York, USA",
    description: "Ночной Манхэттен с высоты птичьего полета. Лучший вид открывается с крыши этого здания.",
    author: "michael_lee",
    authorAvatar: placeholder_4,
    coords: [40.7128, -74.0060]
  },
  {
    id: 6,
    image: placeholder_6,
    title: "Ocean waves",
    location: "Malibu, USA",
    description: "Пляж для серферов и любителей океана. Волны здесь идеальные для катания, особенно рано утром.",
    author: "liam_wilson",
    authorAvatar: placeholder_6,
    coords: [34.0259, -118.7798]
  },
  {
    id: 7,
    image: placeholder_7,
    title: "Autumn forest walk",
    location: "Kyoto, Japan",
    description: "Осенний лес в Киото. Листья клена окрашиваются в ярко-красный цвет. Лучшее время для посещения - октябрь.",
    author: "hana_tanaka",
    authorAvatar: placeholder_7,
    coords: [35.0116, 135.7681]
  },
  {
    id: 8,
    image: placeholder_8,
    title: "Historic streets",
    location: "Prague, Czechia",
    description: "Средневековые улочки Праги. Каждый переулок хранит свою историю. Обязательно посетите Старый город.",
    author: "peter_novak",
    authorAvatar: placeholder_8,
    coords: [50.0755, 14.4378]
  },
  {
    id: 9,
    image: placeholder_9,
    title: "Desert adventures",
    location: "Sahara, Morocco",
    description: "Путешествие по пустыне Сахара. Ночлег в бедуинском шатре под миллионами звезд. Незабываемый опыт.",
    author: "fatima_hassan",
    authorAvatar: placeholder_9,
    coords: [31.7917, -7.0926]
  },
  {
    id: 10,
    image: placeholder_10,
    title: "Cozy cafe corner",
    location: "Lisbon, Portugal",
    description: "Маленькое кафе в историческом районе Лиссабона. Здесь подают лучшую паштел де ната в городе.",
    author: "carlos_silva",
    authorAvatar: placeholder_10,
    coords: [38.7223, -9.1393]
  },
  {
    id: 11,
    image: placeholder_7,
    title: "Morning coffee ritual",
    location: "Vienna, Austria",
    description: "Традиционное венское кафе с вековой историей. Идеальное место для утренней газеты и кофе по-венски.",
    author: "anna_muller",
    authorAvatar: placeholder_1,
    coords: [48.2082, 16.3738]
  },
  {
    id: 12,
    image: placeholder_2,
    title: "Hidden waterfalls",
    location: "Iceland",
    description: "Скрытый водопад в исландской долине. Добраться можно только пешком, но виды того стоят.",
    author: "olafsson",
    authorAvatar: placeholder_2,
    coords: [64.9631, -19.0208]
  },
  {
    id: 13,
    image: placeholder_3,
    title: "Mountain sunrise",
    location: "Swiss Alps",
    description: "Встреча восхода солнца в Швейцарских Альпах. На высоте 3000 метров открывается потрясающая панорама.",
    author: "alpine_explorer",
    authorAvatar: placeholder_3,
    coords: [46.8182, 8.2275]
  },
  {
    id: 14,
    image: placeholder_4,
    title: "Urban art district",
    location: "Berlin, Germany",
    description: "Район уличного искусства в Берлине. Каждую неделю появляются новые граффити от художников со всего мира.",
    author: "street_art_lover",
    authorAvatar: placeholder_4,
    coords: [52.5200, 13.4050]
  },
  {
    id: 15,
    image: placeholder_9,
    title: "Seaside cliffs",
    location: "Amalfi Coast, Italy",
    description: "Знаменитые скалы Амальфитанского побережья. Лучший вид открывается с моря или с одной из горных троп.",
    author: "travel_photographer",
    authorAvatar: placeholder_1,
    coords: [40.6340, 14.6027]
  }
];

// Функция для получения пина по ID
export const getPinById = (id) => {
  return mockPins.find(pin => pin.id === parseInt(id));
};

// Функция для получения всех пинов
export const getAllPins = () => {
  return mockPins;
};

export const mockCollections = [
  {
    id: 1,
    image: placeholder_9,
    title: "Подборочка номер тридцать два три часа дня и тд и тп",
    description: "Лучшие кафе Парижа для работы и отдыха. Проверенные места с отличным кофе и атмосферой.",
    pinsCount: 23,
    location: "Paris, France",
    author: "jane_anderson",
    authorAvatar: placeholder_1,
    coords: [48.8566, 2.3522],
    pins: [3, 10, 15] // IDs пинов из этой подборки
  },
  {
    id: 2,
    image: placeholder_7,
    title: "Осенние прогулки",
    description: "Маршруты для осенних прогулок по живописным местам Европы и Азии.",
    pinsCount: 14,
    location: "Worldwide",
    author: "hana_tanaka",
    authorAvatar: placeholder_7,
    coords: [35.0116, 135.7681],
    pins: [4, 14]
  },
  {
    id: 3,
    image: placeholder_3,
    title: "Вечерние огни мегаполиса",
    description: "Лучшие смотровые площадки и бары с видом на ночные города.",
    pinsCount: 31,
    location: "New York City",
    author: "michael_lee",
    authorAvatar: placeholder_3,
    coords: [40.7128, -74.0060],
    pins: [4, 14]
  },
  {
    id: 4,
    image: placeholder_8,
    title: "Исторические улочки",
    description: "Средневековые кварталы и старинные улицы европейских городов.",
    pinsCount: 18,
    location: "Prague, Czechia",
    author: "peter_novak",
    authorAvatar: placeholder_8,
    coords: [50.0755, 14.4378],
    pins: [8, 8, 8]
  }
];

// Функция для получения коллекции по ID
export const getCollectionById = (id) => {
  return mockCollections.find(collection => collection.id === parseInt(id));
};

// Функция для получения пинов коллекции
export const getCollectionPins = (collectionId) => {
  const collection = getCollectionById(collectionId);
  if (!collection || !collection.pins) return [];
  
  return collection.pins.map(pinId => getPinById(pinId)).filter(Boolean);
};