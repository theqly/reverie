#!/bin/bash

# Complete seed script that syncs Keycloak and PostgreSQL

set -e

PROFILE_DB_USER="${PROFILE_POSTGRES_USER:-profile_user}"
PROFILE_DB_NAME="${PROFILE_POSTGRES_DB:-profile_db}"
CONTENT_DB_USER="${CONTENT_POSTGRES_USER:-content_user}"
CONTENT_DB_NAME="${CONTENT_POSTGRES_DB:-content_db}"
KEYCLOAK_REALM="reverie-realm"
DEFAULT_PASSWORD="password123"

echo ""
echo "=========================================="
echo "  Complete Reverie Seed"
echo "=========================================="
echo ""

# Login to Keycloak
echo "[INFO] Logging into Keycloak..."
docker exec keycloak /opt/keycloak/bin/kcadm.sh config credentials \
  --server http://localhost:8080 --realm master --user admin --password admin 2>/dev/null
echo "[OK] Logged into Keycloak"

# Clear existing data
echo "[INFO] Clearing existing data..."
docker exec -i profile_db psql -U "$PROFILE_DB_USER" -d "$PROFILE_DB_NAME" -c "TRUNCATE users, followers, settings CASCADE;" 2>/dev/null
docker exec -i content_db psql -U "$CONTENT_DB_USER" -d "$CONTENT_DB_NAME" -c "TRUNCATE pins, boards, board_pins, reaction_pins, reaction_boards, bookmarks_pins, bookmarks_boards, pin_comments, board_comments, pin_images CASCADE;" 2>/dev/null
echo "[OK] PostgreSQL cleared"

# Clear Keycloak users
for user_id in $(docker exec keycloak /opt/keycloak/bin/kcadm.sh get users -r "$KEYCLOAK_REALM" --fields id 2>/dev/null | grep '"id"' | cut -d'"' -f4); do
  docker exec keycloak /opt/keycloak/bin/kcadm.sh delete users/$user_id -r "$KEYCLOAK_REALM" 2>/dev/null || true
done
echo "[OK] Keycloak users cleared"

# Temp file for user IDs
USER_IDS_FILE="/tmp/user_ids.txt"
> "$USER_IDS_FILE"

create_user() {
  local nick_tag=$1 email=$2 nickname=$3 description=$4

  USER_JSON="{\"username\":\"$nick_tag\",\"email\":\"$email\",\"firstName\":\"$nickname\",\"enabled\":true,\"emailVerified\":true,\"credentials\":[{\"type\":\"password\",\"value\":\"$DEFAULT_PASSWORD\",\"temporary\":false}]}"

  docker exec keycloak sh -c "echo '$USER_JSON' > /tmp/user.json"
  docker exec keycloak /opt/keycloak/bin/kcadm.sh create users -r "$KEYCLOAK_REALM" -f /tmp/user.json 2>/dev/null || true

  KC_ID=$(docker exec keycloak /opt/keycloak/bin/kcadm.sh get users -r "$KEYCLOAK_REALM" -q "email=$email" --fields id 2>/dev/null | grep '"id"' | cut -d'"' -f4)

  if [ -n "$KC_ID" ]; then
    docker exec -i profile_db psql -U "$PROFILE_DB_USER" -d "$PROFILE_DB_NAME" -c \
      "INSERT INTO users (id, nickname, email, nick_tag, description, status) VALUES ('$KC_ID', '$nickname', '$email', '$nick_tag', '$description', 'active');" 2>/dev/null
    echo "$nick_tag|$KC_ID" >> "$USER_IDS_FILE"
    echo "[OK] $nick_tag -> $KC_ID"
  fi
}

get_user_id() {
  grep "^$1|" "$USER_IDS_FILE" | cut -d'|' -f2
}

echo ""
echo "[INFO] Creating users..."
create_user "sara_adventures" "sara@example.com" "Сара Штельмах" "Путешественница"
create_user "alexey_adventures" "alexey@example.com" "Алексей Волков" "Люблю открывать места"
create_user "masha_travel" "maria@example.com" "Мария Иванова" "Фотограф"
create_user "dima_explorer" "dmitry@example.com" "Дмитрий Козлов" "Исследую мир"
create_user "anna_wanderer" "anna@example.com" "Анна Петрова" "В поисках красоты"
create_user "ivan_trips" "ivan@example.com" "Иван Сидоров" "Путешествую"
create_user "lena_journey" "elena@example.com" "Елена Смирнова" "Художник"

echo ""
echo "[INFO] Creating collections and pins..."

create_pin() {
  local user_id=$1 name=$2 lat=$3 lng=$4 desc=$5
  docker exec -i content_db psql -U "$CONTENT_DB_USER" -d "$CONTENT_DB_NAME" -t -A -c \
    "INSERT INTO pins (name, owner_id, author_id, latitude, longitude, description, rating) VALUES ('$name', '$user_id', '$user_id', $lat, $lng, '$desc', 0) RETURNING id;" 2>/dev/null | head -1
}

create_board() {
  local user_id=$1 name=$2 desc=$3
  docker exec -i content_db psql -U "$CONTENT_DB_USER" -d "$CONTENT_DB_NAME" -t -A -c \
    "INSERT INTO boards (name, owner_id, author_id, owner_type_id, access_level_id, description) VALUES ('$name', '$user_id', '$user_id', 1, 2, '$desc') RETURNING id;" 2>/dev/null | head -1
}

add_pin_to_board() {
  docker exec -i content_db psql -U "$CONTENT_DB_USER" -d "$CONTENT_DB_NAME" -c \
    "INSERT INTO board_pins (board_id, pin_id) VALUES ('$2', '$1') ON CONFLICT DO NOTHING;" 2>/dev/null
}

# Sara's collections
SARA_ID=$(get_user_id "sara_adventures")
if [ -n "$SARA_ID" ]; then
  BOARD_ID=$(create_board "$SARA_ID" "Новосибирск" "Любимые места")
  PIN_ID=$(create_pin "$SARA_ID" "Оперный театр" "55.0304" "82.9067" "Символ города"); add_pin_to_board "$PIN_ID" "$BOARD_ID"
  PIN_ID=$(create_pin "$SARA_ID" "Набережная Оби" "55.0282" "82.9212" "Прогулки"); add_pin_to_board "$PIN_ID" "$BOARD_ID"
  PIN_ID=$(create_pin "$SARA_ID" "Зоопарк" "55.0522" "82.8981" "Лучший в России"); add_pin_to_board "$PIN_ID" "$BOARD_ID"

  BOARD_ID=$(create_board "$SARA_ID" "Москва" "Столица")
  PIN_ID=$(create_pin "$SARA_ID" "Красная площадь" "55.7539" "37.6208" "Сердце России"); add_pin_to_board "$PIN_ID" "$BOARD_ID"
  PIN_ID=$(create_pin "$SARA_ID" "Парк Горького" "55.7312" "37.6031" "Лучший парк"); add_pin_to_board "$PIN_ID" "$BOARD_ID"
  echo "[OK] Sara: 2 boards, 5 pins"
fi

# Alexey's collection
ALEXEY_ID=$(get_user_id "alexey_adventures")
if [ -n "$ALEXEY_ID" ]; then
  BOARD_ID=$(create_board "$ALEXEY_ID" "Санкт-Петербург" "Северная столица")
  PIN_ID=$(create_pin "$ALEXEY_ID" "Эрмитаж" "59.9343" "30.3351" "Искусство"); add_pin_to_board "$PIN_ID" "$BOARD_ID"
  PIN_ID=$(create_pin "$ALEXEY_ID" "Дворцовая площадь" "59.9401" "30.3289" "Центр"); add_pin_to_board "$PIN_ID" "$BOARD_ID"
  echo "[OK] Alexey: 1 board, 2 pins"
fi

# Maria's collection
MARIA_ID=$(get_user_id "masha_travel")
if [ -n "$MARIA_ID" ]; then
  BOARD_ID=$(create_board "$MARIA_ID" "Вильнюс" "Литва")
  PIN_ID=$(create_pin "$MARIA_ID" "Старый город" "54.6872" "25.2797" "История"); add_pin_to_board "$PIN_ID" "$BOARD_ID"
  echo "[OK] Maria: 1 board, 1 pin"
fi

# Create followers
echo "[INFO] Creating followers..."
docker exec -i profile_db psql -U "$PROFILE_DB_USER" -d "$PROFILE_DB_NAME" << EOF 2>/dev/null
INSERT INTO followers (user_id, follower_id) VALUES
  ('$(get_user_id sara_adventures)', '$(get_user_id alexey_adventures)'),
  ('$(get_user_id sara_adventures)', '$(get_user_id masha_travel)'),
  ('$(get_user_id alexey_adventures)', '$(get_user_id sara_adventures)')
ON CONFLICT DO NOTHING;
EOF
echo "[OK] Followers created"

# Cleanup
rm -f "$USER_IDS_FILE"

echo ""
echo "=========================================="
echo "  Seed Complete!"
echo "=========================================="
echo ""
echo "Login credentials:"
echo "  Email: sara@example.com"
echo "  Password: $DEFAULT_PASSWORD"
echo ""
