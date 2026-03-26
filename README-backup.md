# Backup Workflow

## 1) Create a local snapshot

From the project root:

```bash
bash scripts/create_snapshot.sh
```

This writes a timestamped archive to:

`snapshots/consciousnessocean-YYYYMMDD-HHMMSS-<commit>.tar.gz`

## 2) Configure a local mirror remote (one-time)

From the project root:

```bash
bash scripts/setup_local_mirror.sh
```

Default mirror path:

`../consciousnessocean-mirror.git`

You can pass a custom path:

```bash
bash scripts/setup_local_mirror.sh /custom/path/consciousnessocean-mirror.git
```

## 3) Recommended publish routine

Run this before each push:

1. `bash scripts/create_snapshot.sh`
2. `git add -A`
3. `git commit -m "..."` (if there are changes)
4. `bash scripts/publish_safe.sh`

`publish_safe.sh` will create a snapshot and push to all configured remotes (`origin`, `mirror-local`, etc.).

## 4) Restore from a snapshot

From any folder:

```bash
mkdir restore-copy
tar -xzf /path/to/consciousnessocean-*.tar.gz -C restore-copy
```

## 5) Emergency entry point

If the full site UI has issues, use:

`/emergency.html`
