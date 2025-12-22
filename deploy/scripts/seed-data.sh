#!/usr/bin/env bash

# Seed script for Reverie database
# Inserts test data directly into PostgreSQL databases
# Usage: ./seed-data.sh

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Database credentials
PROFILE_DB_USER="${PROFILE_POSTGRES_USER:-profile_user}"
PROFILE_DB_NAME="${PROFILE_POSTGRES_DB:-profile_db}"
CONTENT_DB_USER="${CONTENT_POSTGRES_USER:-content_user}"
CONTENT_DB_NAME="${CONTENT_POSTGRES_DB:-content_db}"

# Execute SQL on profile DB
profile_sql() {
  docker exec -i profile_db psql -U "$PROFILE_DB_USER" -d "$PROFILE_DB_NAME" -t -A 2>/dev/null
}

# Execute SQL on content DB
content_sql() {
  docker exec -i content_db psql -U "$CONTENT_DB_USER" -d "$CONTENT_DB_NAME" -t -A 2>/dev/null
}

# Create user in profile DB, return user_id
create_user() {
  local nickname="$1"
  local email="$2"
  local nick_tag="$3"
  local description="$4"

  echo "INSERT INTO users (nickname, email, nick_tag, description, status)
        VALUES ('$nickname', '$email', '$nick_tag', '$description', 'active')
        ON CONFLICT (email) DO UPDATE SET nickname = EXCLUDED.nickname
        RETURNING id;" | profile_sql | head -1
}

# Create pin in content DB, return pin_id
create_pin() {
  local name="$1"
  local owner_id="$2"
  local lat="$3"
  local lng="$4"
  local description="$5"

  echo "INSERT INTO pins (name, owner_id, author_id, latitude, longitude, description, rating)
        VALUES ('$name', '$owner_id', '$owner_id', $lat, $lng, '$description', 0)
        RETURNING id;" | content_sql | head -1
}

# Create board in content DB, return board_id
create_board() {
  local name="$1"
  local owner_id="$2"
  local description="$3"

  # access_level_id=2 is 'public', owner_type_id=1 is 'user'
  echo "INSERT INTO boards (name, owner_id, author_id, owner_type_id, access_level_id, description)
        VALUES ('$name', '$owner_id', '$owner_id', 1, 2, '$description')
        RETURNING id;" | content_sql | head -1
}

# Add pin to board
add_pin_to_board() {
  local pin_id="$1"
  local board_id="$2"
  echo "INSERT INTO board_pins (board_id, pin_id) VALUES ('$board_id', '$pin_id') ON CONFLICT DO NOTHING;" | content_sql
}

# Create collection with pins
create_city_collection() {
  local user_id="$1"
  local city_name="$2"
  shift 2

  local board_id
  board_id=$(create_board "$city_name" "$user_id" "Мои любимые места: $city_name")

  if [ -n "$board_id" ]; then
    log_success "  Board: $city_name"
    for place in "$@"; do
      IFS='|' read -r lat lng name desc <<< "$place"
      local pin_id
      pin_id=$(create_pin "$name" "$user_id" "$lat" "$lng" "$desc")
      if [ -n "$pin_id" ]; then
        add_pin_to_board "$pin_id" "$board_id"
        log_success "    Pin: $name"
      fi
    done
  fi
}

# ============================================
# MAIN
# ============================================

echo ""
echo "=========================================="
echo "  Reverie Database Seeder"
echo "=========================================="
echo ""

# Check DB connections
log_info "Checking database connections..."

if ! docker exec profile_db pg_isready -U "$PROFILE_DB_USER" -d "$PROFILE_DB_NAME" > /dev/null 2>&1; then
  log_error "Cannot connect to profile_db"
  exit 1
fi
log_success "profile_db connected"

if ! docker exec content_db pg_isready -U "$CONTENT_DB_USER" -d "$CONTENT_DB_NAME" > /dev/null 2>&1; then
  log_error "Cannot connect to content_db"
  exit 1
fi
log_success "content_db connected"

echo ""
echo "=========================================="
echo "  Creating Users and Collections"
echo "=========================================="
echo ""

# ============================================
# USER 1: Сара Штельмах (3 collections)
# ============================================
log_info "Creating: Сара Штельмах"
SARA_ID=$(create_user "Сара Штельмах" "sara@example.com" "sara_adventures" "Путешественница и фотограф")
log_success "User: sara_adventures ($SARA_ID)"

if [ -n "$SARA_ID" ]; then
  create_city_collection "$SARA_ID" "Новосибирск" \
    "55.0304|82.9067|Оперный театр|Главный символ города" \
    "55.0282|82.9212|Набережная Оби|Прогулки у реки" \
    "55.0522|82.8981|Зоопарк|Один из лучших в России" \
    "54.8478|83.1064|Академгородок|Научный центр" \
    "55.0419|82.9345|Центральный парк|Отдых в центре"

  create_city_collection "$SARA_ID" "Москва" \
    "55.7539|37.6208|Красная площадь|Сердце России" \
    "55.7312|37.6031|Парк Горького|Лучший парк" \
    "55.7415|37.6208|Третьяковка|Русская живопись" \
    "55.8263|37.6377|ВДНХ|Выставка достижений" \
    "55.7473|37.5373|Москва-Сити|Небоскрёбы"

  create_city_collection "$SARA_ID" "Эдинбург" \
    "55.9486|-3.1999|Эдинбургский замок|Главная достопримечательность" \
    "55.9502|-3.1875|Royal Mile|Историческая улица" \
    "55.9440|-3.1615|Arthurs Seat|Лучший вид" \
    "55.9550|-3.1825|Calton Hill|Панорама города" \
    "55.9520|-3.2180|Dean Village|Уютный уголок"
fi
echo ""

# User 2: Алексей - Санкт-Петербург
log_info "Creating: Алексей Волков"
USER_ID=$(create_user "Алексей Волков" "alexey@example.com" "alexey_adventures" "Люблю открывать новые места")
log_success "User: alexey_adventures ($USER_ID)"
if [ -n "$USER_ID" ]; then
  create_city_collection "$USER_ID" "Санкт-Петербург" \
    "59.9343|30.3351|Эрмитаж|Мировое искусство" \
    "59.9398|30.3146|Петропавловская крепость|История города" \
    "59.9401|30.3289|Дворцовая площадь|Сердце Петербурга" \
    "59.9340|30.3063|Исаакиевский собор|Величественный храм" \
    "59.9520|30.3180|Летний сад|Прогулки в парке"
fi
echo ""

# User 3: Мария - Вильнюс
log_info "Creating: Мария Иванова"
USER_ID=$(create_user "Мария Иванова" "maria@example.com" "masha_travel" "Фотограф и путешественник")
log_success "User: masha_travel ($USER_ID)"
if [ -n "$USER_ID" ]; then
  create_city_collection "$USER_ID" "Вильнюс" \
    "54.6872|25.2797|Старый город|Средневековая атмосфера" \
    "54.6859|25.2877|Кафедральная площадь|Центр города" \
    "54.6833|25.2900|Ворота Аушрос|Исторические ворота" \
    "54.6789|25.2872|Ужупис|Богемный район" \
    "54.6920|25.2650|Тракайский замок|Замок на острове"
fi
echo ""

# User 4: Дмитрий - Берлин
log_info "Creating: Дмитрий Козлов"
USER_ID=$(create_user "Дмитрий Козлов" "dmitry@example.com" "dima_explorer" "Исследую мир")
log_success "User: dima_explorer ($USER_ID)"
if [ -n "$USER_ID" ]; then
  create_city_collection "$USER_ID" "Берлин" \
    "52.5200|13.4050|Бранденбургские ворота|Символ Берлина" \
    "52.5163|13.3777|Рейхстаг|Парламент Германии" \
    "52.5074|13.3903|Чекпойнт Чарли|История холодной войны" \
    "52.5194|13.4067|Музейный остров|Культурное наследие" \
    "52.5145|13.3501|Тиргартен|Зелёный оазис"
fi
echo ""

# User 5: Анна - Рига
log_info "Creating: Анна Петрова"
USER_ID=$(create_user "Анна Петрова" "anna@example.com" "anna_wanderer" "В поисках красоты")
log_success "User: anna_wanderer ($USER_ID)"
if [ -n "$USER_ID" ]; then
  create_city_collection "$USER_ID" "Рига" \
    "56.9496|24.1052|Старая Рига|Средневековый центр" \
    "56.9519|24.1064|Домский собор|Готическая архитектура" \
    "56.9460|24.1059|Памятник Свободы|Символ независимости" \
    "56.9480|24.1020|Дом Черноголовых|Историческое здание" \
    "56.9550|24.1100|Центральный рынок|Гастрономический рай"
fi
echo ""

# User 6: Иван - Хайфа
log_info "Creating: Иван Сидоров"
USER_ID=$(create_user "Иван Сидоров" "ivan@example.com" "ivan_trips" "Путешествую и делюсь")
log_success "User: ivan_trips ($USER_ID)"
if [ -n "$USER_ID" ]; then
  create_city_collection "$USER_ID" "Хайфа" \
    "32.7940|34.9896|Бахайские сады|Террасные сады" \
    "32.8191|34.9983|Стелла Марис|Монастырь на горе" \
    "32.7857|35.0130|Немецкая колония|Исторический район" \
    "32.8030|34.9870|Музей науки|Интерактивный музей" \
    "32.7750|34.9800|Порт Хайфы|Морские виды"
fi
echo ""

# User 7: Елена - Лондон
log_info "Creating: Елена Смирнова"
USER_ID=$(create_user "Елена Смирнова" "elena@example.com" "lena_journey" "Мир глазами художника")
log_success "User: lena_journey ($USER_ID)"
if [ -n "$USER_ID" ]; then
  create_city_collection "$USER_ID" "Лондон" \
    "51.5014|-0.1419|Биг-Бен|Символ Лондона" \
    "51.5081|-0.0759|Тауэр|Крепость и тюрьма" \
    "51.5007|-0.1246|Вестминстерское аббатство|Готический шедевр" \
    "51.5194|-0.1270|Британский музей|Сокровища мира" \
    "51.5030|-0.1195|Лондонский глаз|Панорама города"
fi
echo ""

# User 8: Павел - Нью-Йорк
log_info "Creating: Павел Новиков"
USER_ID=$(create_user "Павел Новиков" "pavel@example.com" "pavel_explore" "Городской исследователь")
log_success "User: pavel_explore ($USER_ID)"
if [ -n "$USER_ID" ]; then
  create_city_collection "$USER_ID" "Нью-Йорк" \
    "40.7580|-73.9855|Таймс-сквер|Сердце Манхэттена" \
    "40.6892|-74.0445|Статуя Свободы|Символ Америки" \
    "40.7484|-73.9857|Эмпайр-стейт|Легендарный небоскрёб" \
    "40.7829|-73.9654|Центральный парк|Зелёный оазис" \
    "40.7061|-74.0089|Бруклинский мост|Архитектурный шедевр"
fi
echo ""

# User 9: Ольга - Глазго
log_info "Creating: Ольга Федорова"
USER_ID=$(create_user "Ольга Федорова" "olga@example.com" "olga_trips" "Коллекционирую впечатления")
log_success "User: olga_trips ($USER_ID)"
if [ -n "$USER_ID" ]; then
  create_city_collection "$USER_ID" "Глазго" \
    "55.8642|-4.2518|Собор Святого Мунго|Средневековый собор" \
    "55.8617|-4.2583|Некрополис|Викторианское кладбище" \
    "55.8688|-4.2883|Университет Глазго|Готическая архитектура" \
    "55.8596|-4.2884|Музей Келвингроув|Искусство и наука" \
    "55.8565|-4.2550|Площадь Джорджа|Центр города"
fi
echo ""

# User 10: Сергей - Иерусалим
log_info "Creating: Сергей Морозов"
USER_ID=$(create_user "Сергей Морозов" "sergey@example.com" "sergey_wander" "Архитектура и история")
log_success "User: sergey_wander ($USER_ID)"
if [ -n "$USER_ID" ]; then
  create_city_collection "$USER_ID" "Иерусалим" \
    "31.7781|35.2354|Стена Плача|Святое место" \
    "31.7784|35.2356|Храмовая гора|Святыня трёх религий" \
    "31.7785|35.2296|Храм Гроба Господня|Христианская святыня" \
    "31.7731|35.2287|Башня Давида|Древняя цитадель" \
    "31.7695|35.2290|Гора Сион|Библейское место"
fi
echo ""

# User 11: Наталья - Париж
log_info "Creating: Наталья Белова"
USER_ID=$(create_user "Наталья Белова" "natasha@example.com" "natasha_travel" "Романтик в путешествиях")
log_success "User: natasha_travel ($USER_ID)"
if [ -n "$USER_ID" ]; then
  create_city_collection "$USER_ID" "Париж" \
    "48.8584|2.2945|Эйфелева башня|Символ Парижа" \
    "48.8606|2.3376|Лувр|Величайший музей" \
    "48.8530|2.3499|Нотр-Дам|Готический шедевр" \
    "48.8738|2.2950|Триумфальная арка|Памятник победы" \
    "48.8462|2.3372|Люксембургский сад|Романтичный парк"
fi
echo ""

# User 12: Андрей - Марсель
log_info "Creating: Андрей Кузнецов"
USER_ID=$(create_user "Андрей Кузнецов" "andrey@example.com" "andrey_explore" "Гастрономический турист")
log_success "User: andrey_explore ($USER_ID)"
if [ -n "$USER_ID" ]; then
  create_city_collection "$USER_ID" "Марсель" \
    "43.2965|5.3698|Старый порт|Сердце Марселя" \
    "43.2838|5.3711|Нотр-Дам-де-ла-Гард|Базилика на холме" \
    "43.2969|5.3805|Ле Панье|Исторический квартал" \
    "43.2102|5.4372|Каланки|Скалистые бухты" \
    "43.2955|5.3600|Форт Сен-Жан|Крепость у моря"
fi
echo ""

# User 13: Татьяна - Оттава
log_info "Creating: Татьяна Попова"
USER_ID=$(create_user "Татьяна Попова" "tatyana@example.com" "tanya_adventures" "Ищу вдохновение")
log_success "User: tanya_adventures ($USER_ID)"
if [ -n "$USER_ID" ]; then
  create_city_collection "$USER_ID" "Оттава" \
    "45.4236|-75.6997|Парламентский холм|Сердце Канады" \
    "45.4295|-75.7089|Канал Ридо|Историческое чудо" \
    "45.4215|-75.6972|Национальная галерея|Канадское искусство" \
    "45.4294|-75.6936|Рынок Байуорд|Местная атмосфера" \
    "45.4106|-75.6956|Музей истории|История Канады"
fi
echo ""

# User 14: Михаил - Мадрид
log_info "Creating: Михаил Соколов"
USER_ID=$(create_user "Михаил Соколов" "mikhail@example.com" "misha_journey" "Фанат архитектуры")
log_success "User: misha_journey ($USER_ID)"
if [ -n "$USER_ID" ]; then
  create_city_collection "$USER_ID" "Мадрид" \
    "40.4168|-3.7038|Пуэрта-дель-Соль|Центр Испании" \
    "40.4138|-3.6921|Музей Прадо|Шедевры живописи" \
    "40.4180|-3.7142|Королевский дворец|Резиденция королей" \
    "40.4153|-3.6844|Парк Ретиро|Зелёный оазис" \
    "40.4196|-3.6881|Пласа-Майор|Историческая площадь"
fi
echo ""

# User 15: Екатерина - Барселона
log_info "Creating: Екатерина Орлова"
USER_ID=$(create_user "Екатерина Орлова" "kate@example.com" "kate_wander" "Культурный туризм")
log_success "User: kate_wander ($USER_ID)"
if [ -n "$USER_ID" ]; then
  create_city_collection "$USER_ID" "Барселона" \
    "41.4036|2.1744|Саграда Фамилия|Шедевр Гауди" \
    "41.3851|2.1734|Готический квартал|Средневековый лабиринт" \
    "41.4145|2.1527|Парк Гуэль|Сказочный парк" \
    "41.3758|2.1894|Барселонета|Пляж и море" \
    "41.3879|2.1699|Рамбла|Знаменитый бульвар"
fi
echo ""

# User 16: Виктор - Барнаул
log_info "Creating: Виктор Лебедев"
USER_ID=$(create_user "Виктор Лебедев" "victor@example.com" "victor_trips" "Сибиряк в путешествиях")
log_success "User: victor_trips ($USER_ID)"
if [ -n "$USER_ID" ]; then
  create_city_collection "$USER_ID" "Барнаул" \
    "53.3548|83.7698|Нагорный парк|Вид на город" \
    "53.3465|83.7768|Площадь Советов|Центр города" \
    "53.3510|83.7850|Речной вокзал|На берегу Оби" \
    "53.3580|83.7600|Изумрудный парк|Зелёный уголок" \
    "53.3400|83.7700|Музей Город|История Барнаула"
fi
echo ""

# User 17: Юлия - Токио
log_info "Creating: Юлия Волкова"
USER_ID=$(create_user "Юлия Волкова" "julia@example.com" "julia_explore" "Азия - моя страсть")
log_success "User: julia_explore ($USER_ID)"
if [ -n "$USER_ID" ]; then
  create_city_collection "$USER_ID" "Токио" \
    "35.6762|139.6503|Синдзюку|Неоновый город" \
    "35.7148|139.7967|Сэнсо-дзи|Древний храм" \
    "35.6586|139.7454|Токийская башня|Вид на город" \
    "35.6595|139.7006|Сибуя|Знаменитый перекрёсток" \
    "35.6852|139.7528|Императорский дворец|Резиденция императора"
fi
echo ""

# User 18: Роман - Киото
log_info "Creating: Роман Николаев"
USER_ID=$(create_user "Роман Николаев" "roman@example.com" "roman_travel" "Традиции и современность")
log_success "User: roman_travel ($USER_ID)"
if [ -n "$USER_ID" ]; then
  create_city_collection "$USER_ID" "Киото" \
    "35.0116|135.7681|Кинкаку-дзи|Золотой павильон" \
    "34.9948|135.7850|Фусими Инари|Тысячи ворот" \
    "35.0394|135.7292|Арасияма|Бамбуковая роща" \
    "35.0033|135.7782|Киёмидзу-дэра|Храм чистой воды" \
    "35.0116|135.7400|Гион|Район гейш"
fi
echo ""

# User 19: Светлана - Осака
log_info "Creating: Светлана Козлова"
USER_ID=$(create_user "Светлана Козлова" "sveta@example.com" "sveta_journey" "Японская культура")
log_success "User: sveta_journey ($USER_ID)"
if [ -n "$USER_ID" ]; then
  create_city_collection "$USER_ID" "Осака" \
    "34.6937|135.5023|Осакский замок|Исторический замок" \
    "34.6687|135.5012|Дотонбори|Еда и неон" \
    "34.6542|135.5065|Тэннодзи|Храм и зоопарк" \
    "34.6660|135.4324|Аквариум Кайюкан|Морская жизнь" \
    "34.7055|135.4983|Умэда|Современный район"
fi
echo ""

# User 20: Артём - Томск
log_info "Creating: Артём Новиков"
USER_ID=$(create_user "Артём Новиков" "artem@example.com" "artem_wander" "Сибирские просторы")
log_success "User: artem_wander ($USER_ID)"
if [ -n "$USER_ID" ]; then
  create_city_collection "$USER_ID" "Томск" \
    "56.4884|84.9480|Лагерный сад|Памятник и парк" \
    "56.4847|84.9480|Университет|Старейший в Сибири" \
    "56.4977|84.9745|Деревянное зодчество|Уникальные дома" \
    "56.4700|84.9500|Набережная Томи|Прогулки у реки" \
    "56.4850|84.9650|Воскресенская гора|Исторический центр"
fi
echo ""

# User 21: Дарья - Тель-Авив
log_info "Creating: Дарья Смирнова"
USER_ID=$(create_user "Дарья Смирнова" "dasha@example.com" "dasha_trips" "Ближний Восток")
log_success "User: dasha_trips ($USER_ID)"
if [ -n "$USER_ID" ]; then
  create_city_collection "$USER_ID" "Тель-Авив" \
    "32.0853|34.7818|Пляж Гордон|Средиземное море" \
    "32.0636|34.7705|Старый Яффо|Древний порт" \
    "32.0741|34.7922|Бульвар Ротшильд|Баухаус" \
    "32.0873|34.7741|Порт Тель-Авива|Развлечения у моря" \
    "32.0656|34.7780|Рынок Кармель|Восточный базар"
fi

echo ""
echo "=========================================="
echo "  Seeding complete!"
echo "  Created: 21 users, 23 collections, 115 pins"
echo "=========================================="
echo ""
