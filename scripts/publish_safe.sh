#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BRANCH="${1:-$(git -C "$ROOT_DIR" branch --show-current)}"

if [ -z "$BRANCH" ]; then
  echo "Error: could not determine current branch."
  exit 1
fi

echo "Creating snapshot..."
bash "$SCRIPT_DIR/create_snapshot.sh"

echo
echo "Pushing branch '$BRANCH' to all configured remotes..."

FAIL=0
while IFS= read -r remote; do
  [ -z "$remote" ] && continue
  echo "-> git push $remote $BRANCH"
  if ! git -C "$ROOT_DIR" push "$remote" "$BRANCH"; then
    echo "   push failed for remote: $remote"
    FAIL=1
  fi
done < <(git -C "$ROOT_DIR" remote)

echo
if [ "$FAIL" -eq 0 ]; then
  echo "Publish complete: snapshot + push to all remotes succeeded."
else
  echo "Publish finished with errors: at least one remote push failed."
  exit 1
fi
