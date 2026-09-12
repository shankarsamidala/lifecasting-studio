"""
Django settings for Lifecasting Studio project.
"""

import os
from pathlib import Path

from django.core.exceptions import ImproperlyConfigured
from django.urls import reverse_lazy

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


def _load_dotenv(path):
    """Read KEY=VALUE lines from .env into the environment.

    Real environment variables always win, so a host that injects values
    (Cloud Run, systemd) is never overridden by a stale local file.
    """
    if not path.exists():
        return
    for raw in path.read_text().splitlines():
        line = raw.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        key, _, value = line.partition('=')
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and value and key not in os.environ:
            os.environ[key] = value


_load_dotenv(BASE_DIR / '.env')


def _env_bool(name, default=False):
    return os.environ.get(name, str(int(default))).strip().lower() in ('1', 'true', 'yes', 'on')


def _env_list(name):
    return [v.strip() for v in os.environ.get(name, '').split(',') if v.strip()]


DEBUG = _env_bool('DJANGO_DEBUG', default=True)

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', '')
if not SECRET_KEY:
    if not DEBUG:
        raise ImproperlyConfigured(
            'DJANGO_SECRET_KEY must be set when DJANGO_DEBUG is off. It signs '
            'sessions and password-reset tokens. Generate one with: python -c '
            '"from django.core.management.utils import get_random_secret_key as k; print(k())"'
        )
    SECRET_KEY = 'django-insecure-local-development-only-do-not-deploy'

ALLOWED_HOSTS = _env_list('DJANGO_ALLOWED_HOSTS')
if DEBUG:
    # Keep local development reachable even when .env carries the production
    # domains — otherwise runserver answers every request with 400.
    ALLOWED_HOSTS += [h for h in ('localhost', '127.0.0.1', '[::1]', 'testserver')
                      if h not in ALLOWED_HOSTS]

    # Also allow this machine's LAN addresses, so the site can be opened on a
    # phone on the same wifi via http://<lan-ip>:8000/ without editing .env.
    try:
        import socket as _socket
        _lan = {
            info[4][0]
            for info in _socket.getaddrinfo(_socket.gethostname(), None, _socket.AF_INET)
        }
        ALLOWED_HOSTS += [ip for ip in _lan if ip not in ALLOWED_HOSTS]
    except Exception:
        pass

# Django 4+ checks the Origin header on unsafe requests. Behind a proxy this
# must list the public https origins or every POST — including the contact
# form — is rejected with 403.
CSRF_TRUSTED_ORIGINS = _env_list('DJANGO_CSRF_TRUSTED_ORIGINS')

if not DEBUG:
    if not ALLOWED_HOSTS:
        raise ImproperlyConfigured(
            'DJANGO_ALLOWED_HOSTS must list your domains when DJANGO_DEBUG is off.'
        )
    # Cloud Run terminates TLS at its proxy and forwards over HTTP; without
    # this Django believes the request is insecure and breaks secure cookies
    # and redirects.
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'


# Application definition

INSTALLED_APPS = [
    # django-unfold replaces the admin's templates, so it has to be listed
    # above django.contrib.admin for its versions to win template lookup.
    'unfold',
    'unfold.contrib.filters',
    'unfold.contrib.forms',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_tailwind_cli',
    'catalog.apps.CatalogConfig',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    # Must sit directly after SecurityMiddleware and above everything else:
    # it serves static files without Django handling the request at all.
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'catalog.context_processors.global_site_context',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


from urllib.parse import urlparse, unquote

# Database — set DATABASE_URL for Supabase, otherwise SQLite. See .env.example.
DATABASE_URL = os.environ.get('DATABASE_URL', '')

if DATABASE_URL:
    if '[' in DATABASE_URL or ']' in DATABASE_URL:
        raise ImproperlyConfigured(
            "DATABASE_URL still contains placeholders like [PROJECT-REF]. "
            "Replace them with the real values from Supabase (Connect -> "
            "shared pooler), or comment the line out to fall back to SQLite."
        )
    try:
        _url = urlparse(DATABASE_URL)
        _port = _url.port
    except ValueError as exc:
        raise ImproperlyConfigured(f"DATABASE_URL could not be parsed: {exc}") from exc

    if not _url.hostname or not _url.username:
        raise ImproperlyConfigured(
            "DATABASE_URL is missing a host or username. Expected the form "
            "postgresql://postgres.PROJECT_REF:PASSWORD@HOST:5432/postgres"
        )

    _transaction_pooler = _port == 6543

    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': (_url.path or '/postgres').lstrip('/'),
            'USER': unquote(_url.username or ''),
            'PASSWORD': unquote(_url.password or ''),
            'HOST': _url.hostname or '',
            'PORT': str(_url.port or 5432),
            'OPTIONS': {'sslmode': os.environ.get('DB_SSLMODE', 'require')},
            'CONN_MAX_AGE': 0 if _transaction_pooler else 600,
        }
    }

    if _transaction_pooler:
        DATABASES['default']['OPTIONS']['prepare_threshold'] = None
        DATABASES['default']['DISABLE_SERVER_SIDE_CURSORS'] = True
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Asia/Kolkata'

USE_I18N = True

USE_TZ = True


# Static & Media files
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'

# WhiteNoise scans STATIC_ROOT once at startup and caches the file list. In
# development that means any file added after the server booted — a fresh
# collectstatic, a newly installed app's assets — 404s until you restart,
# which looks exactly like "the CSS is broken". Autorefresh re-checks the
# disk per request: fine locally, never in production.
WHITENOISE_AUTOREFRESH = DEBUG

# WhiteNoise serves static straight from the container — at ~1.8MB there is no
# reason to add a bucket. In production it fingerprints filenames and emits
# far-future cache headers; the manifest backend is skipped under DEBUG so
# development doesn't require a collectstatic run after every edit.
STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': (
            'django.contrib.staticfiles.storage.StaticFilesStorage' if DEBUG
            else 'whitenoise.storage.CompressedManifestStaticFilesStorage'
        ),
    },
}

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'


# ─────────────────────────────────────────────────────────────
# django-unfold — admin theme
#
# The studio owner is not a developer, so the admin is a product in its
# own right. Unfold gives it a Tailwind shell; the sidebar below is the
# real win, because it replaces "click through the app index" with a
# fixed, plain-English menu in the order the owner actually works:
# categories first, then the products inside them.
#
# Colours are the site's own brand pink (#ea4c89 = rgb 234 76 137) so the
# admin does not read as a different product. Unfold wants the shades as
# space-separated RGB channels, same convention as static/css/index.css.
# ─────────────────────────────────────────────────────────────
UNFOLD = {
    'SITE_TITLE': 'Lifecasting Studio',
    'SITE_HEADER': 'Lifecasting Studio',
    'SITE_SUBHEADER': 'Manage your website',
    'SITE_URL': '/',
    'SHOW_HISTORY': True,
    'SHOW_VIEW_ON_SITE': True,
    'COLORS': {
        'primary': {
            '50':  '253 242 247',
            '100': '252 231 241',
            '200': '250 207 228',
            '300': '246 169 205',
            '400': '241 120 173',
            '500': '234  76 137',   # #ea4c89 — the brand pink
            '600': '204  61 120',   # #cc3d78 — hover/press
            '700': '172  47  98',
            '800': '143  41  82',
            '900': '120  38  71',
            '950': ' 73  16  39',
        },
    },
    'SIDEBAR': {
        'show_search': True,
        'show_all_applications': False,
        'navigation': [
            {
                'title': 'Catalogue',
                'separator': False,
                'items': [
                    {
                        'title': 'Casting types',
                        'icon': 'category',
                        'link': reverse_lazy('admin:catalog_castingtype_changelist'),
                    },
                    {
                        'title': 'Casting categories',
                        'icon': 'collections_bookmark',
                        'link': reverse_lazy('admin:catalog_category_changelist'),
                    },
                    {
                        'title': 'Casting products',
                        'icon': 'inventory_2',
                        'link': reverse_lazy('admin:catalog_castingmodel_changelist'),
                    },
                ],
            },
            {
                'title': 'Enquiries',
                'separator': True,
                'items': [
                    {
                        'title': 'Contact messages',
                        'icon': 'mail',
                        'link': reverse_lazy('admin:catalog_contactmessage_changelist'),
                    },
                    {
                        'title': 'Reviews',
                        'icon': 'star',
                        'link': reverse_lazy('admin:catalog_testimonial_changelist'),
                    },
                ],
            },
            {
                'title': 'Website content',
                'separator': True,
                'items': [
                    {
                        'title': 'Homepage banners',
                        'icon': 'image',
                        'link': reverse_lazy('admin:catalog_heroimage_changelist'),
                    },
                    {
                        'title': 'Questions & answers',
                        'icon': 'help',
                        'link': reverse_lazy('admin:catalog_faq_changelist'),
                    },
                    {
                        'title': 'Site settings',
                        'icon': 'settings',
                        'link': reverse_lazy('admin:catalog_sitesettings_changelist'),
                    },
                    {
                        'title': 'Footer settings',
                        'icon': 'bottom_panel_open',
                        'link': reverse_lazy('admin:catalog_footersettings_changelist'),
                    },
                    {
                        'title': 'Social links',
                        'icon': 'share',
                        'link': reverse_lazy('admin:catalog_sociallink_changelist'),
                    },
                    {
                        'title': 'Business hours',
                        'icon': 'schedule',
                        'link': reverse_lazy('admin:catalog_businesshour_changelist'),
                    },
                ],
            },
        ],
    },
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
