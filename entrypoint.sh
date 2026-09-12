#!/usr/bin/env sh
set -e

# Cloud Run starts the container and nothing else — there is no deploy hook.
# Without this, a release carrying a new migration would serve requests against
# a schema that doesn't have the new columns yet, failing at the first query
# rather than at deploy time.
#
# RUN_MIGRATIONS=0 disables it, which is what you want once more than one
# instance can start at a time: concurrent migrate calls on the same database
# race each other. At that point run it as a separate step instead:
#
#   gcloud run jobs create lifecasting-migrate \
#     --image <IMAGE> --region asia-south1 \
#     --set-secrets=DATABASE_URL=lifecasting-db-url:latest \
#     --command python --args manage.py,migrate
#
# Django holds an advisory lock per migration, so a small number of instances
# is survivable — but it is not a guarantee, and it is not worth relying on.
if [ "${RUN_MIGRATIONS:-1}" = "1" ]; then
    echo "==> applying migrations"
    python manage.py migrate --noinput
else
    echo "==> skipping migrations (RUN_MIGRATIONS=0)"
fi

# Cloud Run sets PORT; default matches the Dockerfile for local runs.
PORT="${PORT:-8080}"

# Threads rather than extra workers: this app is I/O-bound (Supabase over the
# network) and Cloud Run bills per instance, so one process with a thread pool
# uses far less memory than several forks.
exec gunicorn config.wsgi:application \
    --bind "0.0.0.0:${PORT}" \
    --workers "${GUNICORN_WORKERS:-1}" \
    --threads "${GUNICORN_THREADS:-8}" \
    --timeout "${GUNICORN_TIMEOUT:-60}" \
    --access-logfile - \
    --error-logfile - \
    --log-level "${GUNICORN_LOG_LEVEL:-info}"
