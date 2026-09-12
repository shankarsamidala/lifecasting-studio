# Project instructions for Claude

## Theme & typography — do not change without explicit permission

The color palette, fonts, and design tokens defined in `webstie/src/index.css`
(the `@theme` block: rose/gold/ink/cream palette, `--font-display` Fraunces,
`--font-sans` Inter, `--radius-cast`) are locked.

- **Never introduce new colors** (no raw hex, no arbitrary Tailwind color
  classes like `bg-black`, `text-white`, `from-black`, etc.) in components.
  Always use the existing semantic tokens: `bg-surface`, `bg-surface-alt`,
  `text-text`, `text-text-muted`, `text-primary`, `text-accent`, `border-ink-900/*`.
- **Never change the fonts**, font weights, or type scale defined in
  `index.css` (`h1`–`h4`, `font-display`, `font-sans`) unless explicitly asked.
- **Never restyle a component to a different visual theme** (e.g. dark/black
  backgrounds, different accent color) even if a reference design or pasted
  markup uses one. When implementing a design from an external reference,
  keep its structure/copy/layout but re-skin it with our existing theme
  tokens — ask first if that tradeoff isn't obvious.
- If a task seems to require a new color or font, stop and ask before adding one.
