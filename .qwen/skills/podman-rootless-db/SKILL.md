---
name: podman-rootless-db
description: Set up Podman rootless containers for local development databases, replacing Docker to avoid sudo requirements
source: auto-skill
extracted_at: '2026-05-29T05:06:20.278Z'
---

# Podman Rootless for Local Development Database

## Why Podman over Docker
Docker requires sudo or membership in the `docker` group (which effectively grants root). Podman runs rootless — no daemon, no sudo for daily use, more secure.

## Setup

### 1. Install Podman (one-time, requires sudo)

```bash
sudo apt-get update && sudo apt-get install -y podman
```

### 2. Remove user from Docker group

**Critical:** If the user is in the `docker` group, Podman rootless will fail with a `newuidmap` error because the effective gid (docker group gid) doesn't match the user's primary group gid. Fix:

```bash
sudo deluser <username> docker
newgrp <username>   # or logout and re-login
```

### 3. Adapt docker-compose.yml for Podman

Use `.env` variables in `docker-compose.yml` so both `podman-compose` and the `scripts/db.sh` helper share the same config:

```yaml
services:
  postgres:
    image: postgres:17-alpine
    container_name: nomenclator-db
    restart: unless-stopped
    ports:
      - "${DB_PORT:-5433}:5432"
    environment:
      POSTGRES_USER: ${DB_USERNAME:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
      POSTGRES_DB: ${DB_NAME:-nomenclator_db}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USERNAME:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### 4. Create a `scripts/db.sh` helper

Podman-compose is optional. A `podman run` script is simpler and avoids installing `podman-compose`:

```bash
#!/bin/bash
set -e

ENV_FILE="$(dirname "$0")/../.env"
if [ -f "$ENV_FILE" ]; then
  set -a; source "$ENV_FILE"; set +a
fi

DB_PORT="${DB_PORT:-5433}"
DB_USERNAME="${DB_USERNAME:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_NAME="${DB_NAME:-nomenclator_db}"
CONTAINER_NAME="nomenclator-db"
VOLUME_NAME="nomenclator_postgres_data"

case "${1:-start}" in
  start)
    podman volume inspect "$VOLUME_NAME" >/dev/null 2>&1 || podman volume create "$VOLUME_NAME"
    if podman container inspect "$CONTAINER_NAME" >/dev/null 2>&1; then
      podman start "$CONTAINER_NAME"
    else
      podman run -d --name "$CONTAINER_NAME" --restart unless-stopped \
        -p "${DB_PORT}:5432" \
        -e POSTGRES_USER="$DB_USERNAME" -e POSTGRES_PASSWORD="$DB_PASSWORD" \
        -e POSTGRES_DB="$DB_NAME" \
        -v "${VOLUME_NAME}:/var/lib/postgresql/data" \
        docker.io/postgres:17-alpine
    fi
    # Wait for readiness
    for i in $(seq 1 30); do
      podman exec "$CONTAINER_NAME" pg_isready -U "$DB_USERNAME" >/dev/null 2>&1 && exit 0
      sleep 1
    done
    echo "ERROR: PostgreSQL not ready within 30s"; exit 1
    ;;
  stop)    podman stop "$CONTAINER_NAME" ;;
  destroy) podman stop "$CONTAINER_NAME"; podman rm "$CONTAINER_NAME"; podman volume rm "$VOLUME_NAME" ;;
  status)  podman container inspect "$CONTAINER_NAME" --format '{{.State.Status}}' 2>/dev/null || echo "not found" ;;
  *)       echo "Usage: $0 {start|stop|destroy|status}"; exit 1 ;;
esac
```

## Key insights

- **newuidmap error with docker group**: The `docker` group (gid ~984) causes `newuidmap` to reject the process because effective gid ≠ pw_gid. Removing the user from the `docker` group is the fix — Podman doesn't need it.
- **Image references**: Podman rootless defaults to searching `docker.io`, so `postgres:17-alpine` works. Explicit `docker.io/postgres:17-alpine` is clearer.
- **No daemon needed**: Unlike Docker, Podman doesn't run a background daemon — containers are child processes of the user session. This means `podman ps` works without root.
- **podman-compose is optional**: The `scripts/db.sh` approach with plain `podman run` is simpler and avoids the dependency on `podman-compose`.