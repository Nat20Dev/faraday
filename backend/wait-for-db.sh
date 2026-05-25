#!/bin/sh
set -e

until python -c "import psycopg2; psycopg2.connect(host='$POSTGRES_HOST', port='$POSTGRES_PORT', user='$POSTGRES_USER', password='$POSTGRES_PASSWORD', dbname='$POSTGRES_DB')" 2>/dev/null; do
  echo "Waiting for PostgreSQL..."
  sleep 1
done

echo "PostgreSQL is ready."
exec "$@"
