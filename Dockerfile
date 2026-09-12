# syntax=docker/dockerfile:1

# ─────────────────────────────────────────────────────────────
# Stage 1 — build the stylesheet
#
# Tailwind is compiled inside the image rather than trusting whatever
# static/css/tailwind.css happens to be committed. That way a template can
# never ship with a class the stylesheet is missing.
# ─────────────────────────────────────────────────────────────
FROM debian:bookworm-slim AS css

ARG TAILWIND_VERSION=3.4.17
WORKDIR /build

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*

# The standalone CLI ships per-architecture; match the build platform.
ARG TARGETARCH
RUN case "${TARGETARCH}" in \
      amd64) ASSET=tailwindcss-linux-x64 ;; \
      arm64) ASSET=tailwindcss-linux-arm64 ;; \
      *) echo "unsupported arch: ${TARGETARCH}" >&2; exit 1 ;; \
    esac \
    && curl -fsSL -o /usr/local/bin/tailwindcss \
       "https://github.com/tailwindlabs/tailwindcss/releases/download/v${TAILWIND_VERSION}/${ASSET}" \
    && chmod +x /usr/local/bin/tailwindcss

COPY tailwind.config.js ./
COPY assets/css/input.css ./assets/css/input.css
COPY templates/ ./templates/
COPY catalog/ ./catalog/

RUN tailwindcss -i assets/css/input.css -o /build/tailwind.css --minify


# ─────────────────────────────────────────────────────────────
# Stage 2 — runtime
# ─────────────────────────────────────────────────────────────
# Matches the development interpreter (3.14.6). requirements.txt was frozen
# from that environment, so pinning the same minor avoids resolving different
# wheels in production than the ones tested locally.
FROM python:3.14-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# No system libpq needed: requirements.txt pins psycopg-binary, which bundles
# its own. Adding libpq5 would be dead weight and could mask a future switch
# to the source build, which genuinely does need it.

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Stylesheet from stage 1, overwriting whatever was committed.
COPY --from=css /build/tailwind.css ./static/css/tailwind.css

# collectstatic runs at BUILD time, not on boot — it needs no database, and
# doing it here keeps container start fast and makes a broken build fail
# loudly instead of at the first request.
#
# DJANGO_SECRET_KEY is a throwaway for this command only; the real one is
# injected at runtime and never baked into a layer.
RUN DJANGO_DEBUG=0 \
    DJANGO_SECRET_KEY=build-time-only-not-used-at-runtime \
    DJANGO_ALLOWED_HOSTS=build.invalid \
    python manage.py collectstatic --noinput --clear

RUN useradd --create-home --uid 10001 appuser && chown -R appuser:appuser /app
USER appuser

# Cloud Run injects PORT and ignores EXPOSE; this documents the default.
ENV PORT=8080
EXPOSE 8080

COPY --chown=appuser:appuser entrypoint.sh /app/entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]
