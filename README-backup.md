# Backup Workflow

## 1) Create a local snapshot

From the project root:

```bash
bash scripts/create_snapshot.sh
```

This writes a timestamped archive to:

`snapshots/consciousnessocean-YYYYMMDD-HHMMSS-<commit>.tar.gz`

## 2) Recommended publish routine

Run this before each push:

1. `bash scripts/create_snapshot.sh`
2. `git add -A`
3. `git commit -m "..."` (if there are changes)
4. `git push origin main`

## 3) Restore from a snapshot

From any folder:

```bash
mkdir restore-copy
tar -xzf /path/to/consciousnessocean-*.tar.gz -C restore-copy
```

## 4) Emergency entry point

If the full site UI has issues, use:

`/emergency.html`
