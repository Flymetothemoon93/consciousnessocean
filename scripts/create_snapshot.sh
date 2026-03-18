#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
OUT_DIR="$ROOT_DIR/snapshots"

STAMP="$(date +"%Y%m%d-%H%M%S")"
SHA="$(git -C "$ROOT_DIR" rev-parse --short HEAD 2>/dev/null || echo "nogit")"
ARCHIVE_NAME="consciousnessocean-${STAMP}-${SHA}.tar.gz"
ARCHIVE_PATH="$OUT_DIR/$ARCHIVE_NAME"

mkdir -p "$OUT_DIR"

tar \
  --exclude=".git" \
  --exclude="snapshots" \
  --exclude=".DS_Store" \
  -czf "$ARCHIVE_PATH" \
  -C "$ROOT_DIR" \
  .

echo "Snapshot created:"
echo "$ARCHIVE_PATH"

if command -v shasum >/dev/null 2>&1; then
  echo
  echo "SHA256:"
  shasum -a 256 "$ARCHIVE_PATH"
fi
