#!/bin/bash
set -e

# Read .env
ENV_FILE="$(dirname "$0")/.env"
if [ -f "$ENV_FILE" ]; then
  set -a
  source "$ENV_FILE"
  set +a
fi

DB_PORT="${DB_PORT:-5433}"
DB_USERNAME="${DB_USERNAME:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_NAME="${DB_NAME:-nomenclator_db}"
CONTAINER_NAME="nomenclator-db"
VOLUME_NAME="nomenclator_postgres_data"

case "${1:-start}" in
  start)
    # Create volume if it doesn't exist
    podman volume inspect "$VOLUME_NAME" >/dev/null 2>&1 || podman volume create "$VOLUME_NAME"

    # Check if container already exists
    if podman container inspect "$CONTAINER_NAME" >/dev/null 2>&1; then
      if podman container inspect "$CONTAINER_NAME" --format '{{.State.Status}}' | grep -q running; then
        echo "Container $CONTAINER_NAME is already running."
        exit 0
      fi
      echo "Starting existing container $CONTAINER_NAME..."
      podman start "$CONTAINER_NAME"
    else
      echo "Creating and starting container $CONTAINER_NAME..."
      podman run -d \
        --name "$CONTAINER_NAME" \
        --restart unless-stopped \
        -p "${DB_PORT}:5432" \
        -e POSTGRES_USER="$DB_USERNAME" \
        -e POSTGRES_PASSWORD="$DB_PASSWORD" \
        -e POSTGRES_DB="$DB_NAME" \
        -v "${VOLUME_NAME}:/var/lib/postgresql/data" \
        docker.io/postgres:17-alpine
    fi

    echo "Waiting for PostgreSQL to be ready..."
    for i in $(seq 1 30); do
      if podman exec "$CONTAINER_NAME" pg_isready -U "$DB_USERNAME" >/dev/null 2>&1; then
        echo "PostgreSQL is ready on port ${DB_PORT}."
        exit 0
      fi
      sleep 1
    done
    echo "ERROR: PostgreSQL did not become ready within 30 seconds."
    exit 1
    ;;

  stop)
    echo "Stopping container $CONTAINER_NAME..."
    podman stop "$CONTAINER_NAME" 2>/dev/null || true
    ;;

  destroy)
    echo "Stopping and removing container $CONTAINER_NAME..."
    podman stop "$CONTAINER_NAME" 2>/dev/null || true
    podman rm "$CONTAINER_NAME" 2>/dev/null || true
    echo "Removing volume $VOLUME_NAME..."
    podman volume rm "$VOLUME_NAME" 2>/dev/null || true
    echo "Done."
    ;;

  status)
    if podman container inspect "$CONTAINER_NAME" >/dev/null 2>&1; then
      STATUS=$(podman container inspect "$CONTAINER_NAME" --format '{{.State.Status}}')
      echo "Container $CONTAINER_NAME: $STATUS"
    else
      echo "Container $CONTAINER_NAME does not exist."
    fi
    ;;

  *)
    echo "Usage: $0 {start|stop|destroy|status}"
    exit 1
    ;;
esac