#!/usr/bin/env bash

set -e

PROFILE_DB_USER="${PROFILE_POSTGRES_USER:-profile_user}"
PROFILE_DB_NAME="${PROFILE_POSTGRES_DB:-profile_db}"
CONTENT_DB_USER="${CONTENT_POSTGRES_USER:-content_user}"
CONTENT_DB_NAME="${CONTENT_POSTGRES_DB:-content_db}"
KEYCLOAK_REALM="reverie-realm"

echo ""
echo "=========================================="
echo "  Sync IDs from Keycloak to PostgreSQL"
echo "=========================================="
echo ""

# Build update SQL for profile_db
echo "[INFO] Building update script..."

PROFILE_SQL="BEGIN;

-- Temporarily disable foreign key checks by dropping and recreating constraints
ALTER TABLE followers DROP CONSTRAINT IF EXISTS followers_user_id_fkey;
ALTER TABLE followers DROP CONSTRAINT IF EXISTS followers_follower_id_fkey;
ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_user_id_fkey;
"

CONTENT_SQL="BEGIN;
"

# Get users from Keycloak
KEYCLOAK_DATA=$(docker exec keycloak /opt/keycloak/bin/kcadm.sh get users \
  -r "$KEYCLOAK_REALM" \
  --fields id,email 2>/dev/null)

# Process each Keycloak user
echo "$KEYCLOAK_DATA" | grep -E '"(id|email)"' | sed 's/.*: "\(.*\)".*/\1/' | paste -d'|' - - | while IFS='|' read -r KC_ID KC_EMAIL; do
  if [ -z "$KC_ID" ] || [ -z "$KC_EMAIL" ]; then
    continue
  fi

  # Get PostgreSQL ID
  PG_ID=$(docker exec -i profile_db psql -U "$PROFILE_DB_USER" -d "$PROFILE_DB_NAME" -t -A -c \
    "SELECT id FROM users WHERE email = '$KC_EMAIL';" 2>/dev/null | tr -d ' \n')

  if [ -z "$PG_ID" ] || [ "$KC_ID" = "$PG_ID" ]; then
    continue
  fi

  echo "[INFO] $KC_EMAIL: $PG_ID -> $KC_ID"

  # Add to profile SQL
  echo "UPDATE followers SET user_id = '$KC_ID' WHERE user_id = '$PG_ID';"
  echo "UPDATE followers SET follower_id = '$KC_ID' WHERE follower_id = '$PG_ID';"
  echo "UPDATE settings SET user_id = '$KC_ID' WHERE user_id = '$PG_ID';"
  echo "UPDATE users SET id = '$KC_ID' WHERE id = '$PG_ID';"
done > /tmp/profile_updates.sql

echo "$KEYCLOAK_DATA" | grep -E '"(id|email)"' | sed 's/.*: "\(.*\)".*/\1/' | paste -d'|' - - | while IFS='|' read -r KC_ID KC_EMAIL; do
  if [ -z "$KC_ID" ] || [ -z "$KC_EMAIL" ]; then
    continue
  fi

  PG_ID=$(docker exec -i profile_db psql -U "$PROFILE_DB_USER" -d "$PROFILE_DB_NAME" -t -A -c \
    "SELECT id FROM users WHERE email = '$KC_EMAIL';" 2>/dev/null | tr -d ' \n')

  if [ -z "$PG_ID" ] || [ "$KC_ID" = "$PG_ID" ]; then
    continue
  fi

  # Add to content SQL
  echo "UPDATE pins SET owner_id = '$KC_ID' WHERE owner_id = '$PG_ID';"
  echo "UPDATE pins SET author_id = '$KC_ID' WHERE author_id = '$PG_ID';"
  echo "UPDATE boards SET owner_id = '$KC_ID' WHERE owner_id = '$PG_ID';"
  echo "UPDATE boards SET author_id = '$KC_ID' WHERE author_id = '$PG_ID';"
done > /tmp/content_updates.sql

# Execute profile updates
echo "[INFO] Updating profile_db..."
cat <<EOF | docker exec -i profile_db psql -U "$PROFILE_DB_USER" -d "$PROFILE_DB_NAME"
BEGIN;

ALTER TABLE followers DROP CONSTRAINT IF EXISTS followers_user_id_fkey;
ALTER TABLE followers DROP CONSTRAINT IF EXISTS followers_follower_id_fkey;
ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_user_id_fkey;

$(cat /tmp/profile_updates.sql)

ALTER TABLE followers ADD CONSTRAINT followers_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE followers ADD CONSTRAINT followers_follower_id_fkey
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE settings ADD CONSTRAINT settings_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

COMMIT;
EOF

echo "[OK] profile_db updated"

# Execute content updates
echo "[INFO] Updating content_db..."
cat <<EOF | docker exec -i content_db psql -U "$CONTENT_DB_USER" -d "$CONTENT_DB_NAME"
BEGIN;
$(cat /tmp/content_updates.sql)
COMMIT;
EOF

echo "[OK] content_db updated"

# Cleanup
rm -f /tmp/profile_updates.sql /tmp/content_updates.sql

echo ""
echo "=========================================="
echo "  Verification"
echo "=========================================="
echo ""
echo "Keycloak (alexey@example.com):"
docker exec keycloak /opt/keycloak/bin/kcadm.sh get users -r "$KEYCLOAK_REALM" -q email=alexey@example.com --fields id,email 2>/dev/null

echo ""
echo "PostgreSQL (alexey@example.com):"
docker exec -i profile_db psql -U "$PROFILE_DB_USER" -d "$PROFILE_DB_NAME" -c \
  "SELECT id, email FROM users WHERE email = 'alexey@example.com';"

echo ""
echo "Done!"
