/**
 * Lifecasting Studio — Tailwind config.
 *
 * Lifted verbatim from the inline <script> that used to configure the CDN
 * build in templates/base.html, so the compiled output is identical to what
 * the browser was generating at runtime.
 *
 * No hex values live here. Every colour resolves from the --rgb-* channels
 * declared in static/css/index.css, which stays the single source of truth.
 * The `<alpha-value>` slot keeps opacity modifiers (border-ink-900/10,
 * bg-ink-900/45) working.
 */
const c = (name) => `rgb(var(--rgb-${name}) / <alpha-value>)`;

module.exports = {
  content: [
    './templates/**/*.html',
    './catalog/**/*.py',
  ],
  theme: {
    extend: {
      colors: {
        'rose-500': c('rose-500'),
        'rose-600': c('rose-600'),
        blush: c('blush'),
        'blush-2': c('blush-2'),

        'ink-900': c('ink-900'),
        'ink-700': c('ink-700'),
        'ink-500': c('ink-500'),

        paper: c('paper'),
        mist: c('mist'),
        sunken: c('sunken'),

        brand: c('brand'),
        'brand-hover': c('brand-hover'),
        primary: c('primary'),
        'primary-hover': c('primary-hover'),
        surface: c('surface'),
        'surface-alt': c('surface-alt'),
        'surface-tint': c('surface-tint'),
        text: c('text'),
        'text-muted': c('text-muted'),
        'text-subtle': c('text-subtle'),

        success: c('success'),
        'success-wash': c('success-wash'),
        whatsapp: c('whatsapp'),
      },
      fontFamily: {
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      /* Type scale with a hard 14px floor. `2xs` exists only for genuine
         legal fine print and small overlay badges. */
      fontSize: {
        '2xs': ['0.8125rem', { lineHeight: '1.5' }],
        xs: ['0.875rem', { lineHeight: '1.5' }],
        sm: ['0.9375rem', { lineHeight: '1.6' }],
        base: ['1.0625rem', { lineHeight: '1.65' }],
        lg: ['1.1875rem', { lineHeight: '1.6' }],
        xl: ['1.375rem', { lineHeight: '1.45' }],
        '2xl': ['1.75rem', { lineHeight: '1.25' }],
        '3xl': ['2.125rem', { lineHeight: '1.2' }],
        '4xl': ['2.625rem', { lineHeight: '1.12' }],
        '5xl': ['3.25rem', { lineHeight: '1.06' }],
        '6xl': ['4rem', { lineHeight: '1.02' }],
        '7xl': ['4.75rem', { lineHeight: '1' }],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.5rem',
        cast: 'var(--radius-cast)',
        'cast-alt': 'var(--radius-cast-alt)',
      },
      boxShadow: {
        rest: 'var(--shadow-rest)',
        lift: 'var(--shadow-lift)',
      },
      transitionTimingFunction: {
        soft: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
