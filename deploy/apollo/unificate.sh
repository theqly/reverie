#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
SCHEMAS_DIR="$SCRIPT_DIR/schemas"

rm -rf "$SCHEMAS_DIR"
mkdir -p "$SCHEMAS_DIR"

for svc in profile content feed; do
  out="$SCHEMAS_DIR/${svc}.graphql"
  : > "$out"

  for f in "$SCRIPT_DIR/../../backend/${svc}-service/graph/schema/"*.graphqls; do
    cat "$f" >> "$out"
    printf '\n' >> "$out"
  done
done
