#!/usr/bin/env bash

# Sync users from profile_db to Keycloak
# Usage: ./sync-users-to-keycloak.sh

set -e

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

# Keycloak settings
KEYCLOAK_URL="http://localhost:8080"
KEYCLOAK_REALM="reverie-realm"
KEYCLOAK_ADMIN="${KEYCLOAK_ADMIN:-admin}"
KEYCLOAK_ADMIN_PASSWORD="${KEYCLOAK_ADMIN_PASSWORD:-admin}"

echo ""
echo "=========================================="
echo "  Sync Users to Keycloak"
echo "=========================================="
echo ""

# Login to Keycloak
log_info "Logging into Keycloak..."
docker exec keycloak /opt/keycloak/bin/kcadm.sh config credentials \
  --server "$KEYCLOAK_URL" \
  --realm master \
  --user "$KEYCLOAK_ADMIN" \
  --password "$KEYCLOAK_ADMIN_PASSWORD" 2>/dev/null

if [ $? -ne 0 ]; then
  log_error "Failed to login to Keycloak"
  exit 1
fi
log_success "Logged into Keycloak"

# Get users from profile_db
log_info "Fetching users from profile_db..."

# Get all users as JSON-like format
USERS=$(docker exec -i profile_db psql -U "$PROFILE_DB_USER" -d "$PROFILE_DB_NAME" -t -A -F'|' <<EOF
SELECT id, email, nickname, nick_tag FROM users;
EOF
)

if [ -z "$USERS" ]; then
  log_warn "No users found in profile_db"
  exit 0
fi

echo ""
log_info "Creating users in Keycloak..."
echo ""

# Process each user
while IFS='|' read -r user_id email nickname nick_tag; do
  if [ -z "$user_id" ]; then
    continue
  fi

  # Default password (user should change it)
  DEFAULT_PASSWORD="password123"

  # Check if user exists in Keycloak
  EXISTING=$(docker exec keycloak /opt/keycloak/bin/kcadm.sh get users \
    -r "$KEYCLOAK_REALM" \
    -q "email=$email" \
    --fields id 2>/dev/null | grep -o '"id"' || true)

  if [ -n "$EXISTING" ]; then
    log_warn "User $email already exists in Keycloak, skipping"
    continue
  fi

  # Create user in Keycloak with specific ID
  log_info "Creating user: $nickname ($email)"

  # Create user JSON
  USER_JSON=$(cat <<EOJSON
{
  "id": "$user_id",
  "username": "$nick_tag",
  "email": "$email",
  "firstName": "$nickname",
  "enabled": true,
  "emailVerified": true,
  "credentials": [{
    "type": "password",
    "value": "$DEFAULT_PASSWORD",
    "temporary": false
  }]
}
EOJSON
)

  # Write JSON to temp file in container and create user
  docker exec keycloak sh -c "echo '$USER_JSON' > /tmp/user.json"

  RESULT=$(docker exec keycloak /opt/keycloak/bin/kcadm.sh create users \
    -r "$KEYCLOAK_REALM" \
    -f /tmp/user.json 2>&1) || true

  if echo "$RESULT" | grep -q "Created"; then
    log_success "  Created: $nick_tag ($email) with password: $DEFAULT_PASSWORD"
  elif echo "$RESULT" | grep -q "already exists"; then
    log_warn "  User $email already exists"
  else
    log_error "  Failed to create $email: $RESULT"
  fi

done <<< "$USERS"

echo ""
echo "=========================================="
echo "  Sync complete!"
echo "  Default password for all users: password123"
echo "=========================================="
echo ""
