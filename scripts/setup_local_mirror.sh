#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DEFAULT_MIRROR_PATH="$(cd "$ROOT_DIR/.." && pwd)/consciousnessocean-mirror.git"
MIRROR_PATH="${1:-$DEFAULT_MIRROR_PATH}"
REMOTE_NAME="mirror-local"

if [ ! -d "$MIRROR_PATH" ]; then
  mkdir -p "$MIRROR_PATH"
  git init --bare "$MIRROR_PATH"
  echo "Created bare mirror repository: $MIRROR_PATH"
else
  if [ ! -d "$MIRROR_PATH/objects" ] || [ ! -f "$MIRROR_PATH/HEAD" ]; then
    echo "Error: $MIRROR_PATH exists but is not a bare git repository."
    exit 1
  fi
fi

if git -C "$ROOT_DIR" remote get-url "$REMOTE_NAME" >/dev/null 2>&1; then
  git -C "$ROOT_DIR" remote set-url "$REMOTE_NAME" "$MIRROR_PATH"
  echo "Updated remote '$REMOTE_NAME' -> $MIRROR_PATH"
else
  git -C "$ROOT_DIR" remote add "$REMOTE_NAME" "$MIRROR_PATH"
  echo "Added remote '$REMOTE_NAME' -> $MIRROR_PATH"
fi

CURRENT_BRANCH="$(git -C "$ROOT_DIR" branch --show-current)"
if [ -n "$CURRENT_BRANCH" ]; then
  git -C "$ROOT_DIR" push "$REMOTE_NAME" "$CURRENT_BRANCH"
  echo "Pushed branch '$CURRENT_BRANCH' to '$REMOTE_NAME'"
fi

echo
echo "Current remotes:"
git -C "$ROOT_DIR" remote -v
