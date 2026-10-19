# Repository Guidelines

## Project Structure & Module Organization

This is a Vite static site for Bordados Yussi using vanilla JavaScript, CSS, and GSAP. The main entry point is `src/main.js`, which imports section CSS and initializes feature modules. Keep behavior in focused modules under `src/` such as `navbar.js`, `faq.js`, `form.js`, `animations.js`, and `whatsapp.js`.

Active CSS is imported in `src/main.js`: `site.css` (tokens in `:root` and base styles), `corporate.css`, `product-explorer.css`, `production.css` and `mobile.css`. Other files in `src/css/` are legacy and not loaded. Root `index.html` contains page markup, while `vite.config.js` holds build configuration.

### Media

All published media lives in `public/media/` and is served at `/media/...`:

- `brand/`: logo, favicons, OG image. `public/favicon.ico` stays at the root.
- `hero/`: hero video and poster.
- `productos/{dotacion,antifluido,industrial,escolares,bordado}/`: galleries (`-400/-800/-1200.webp`) and selector covers (`-560`).
- `proceso/`, `nosotros/`, `clientes/` (`cliente-*`), `proveedores/` (`proveedor-*`), `cobertura/` (3D globe geojson and the static mobile map).

Naming: lowercase kebab-case, no spaces or accents, section prefix first, pixel width last. Gallery `data-photo` values include the line folder (`dotacion/dotacion-kit-flags`). See `public/media/README.md` for where each new file goes, and keep `media-manifest.json` updated.

High-resolution originals and pipelines live in `media-source/` (git- and Vercel-ignored, local only). Unused files are moved with `git mv` to `media-archive/public/...` (tracked, not deployed); never delete them.

## Build, Test, and Development Commands

- `npm install`: install project dependencies from `package-lock.json`.
- `npm run dev`: start the Vite development server for local work.
- `npm run build`: create the production build in `dist/`.
- `npm run preview`: serve the production build locally for final checks.

Run `npm run build` before a pull request to catch bundling or asset path problems.

## Coding Style & Naming Conventions

Use ES modules, two-space indentation, single quotes, and no semicolons. Prefer small exported initializer functions named `initFeature`, then call them from `src/main.js` after `DOMContentLoaded`.

Add styles to the active stylesheets imported by `src/main.js` (layout and sections in `site.css`/`corporate.css`, product explorer in `product-explorer.css`, production in `production.css`, small-screen and touch fixes in `mobile.css`). Put shared colors, spacing, typography, and radius values in the `:root` variables of `src/css/site.css`.

## Testing Guidelines

There is no automated test script. For each change, run `npm run build` and manually verify affected sections in a browser. Check responsive layouts, navigation, language switching, forms, WhatsApp actions, animations, and reduced-motion behavior when relevant.

If automated tests are added later, prefer Vitest-compatible `*.test.js` files near the modules they cover and add an `npm test` script.

## Commit & Pull Request Guidelines

The short git history uses concise subjects such as `Premium visual pass: scroll-story hero, brand accent, typography, perf`. Keep commit subjects brief and specific, with a scope before a colon when useful.

Pull requests should include a clear summary, key visual or behavioral changes, manual verification steps, and screenshots or recordings for UI changes. Link related issues when available and mention asset additions or performance-sensitive media changes.

## Security & Configuration Tips

Do not commit secrets or local environment files. Optimize new images and videos before adding them to `public/media/`, and verify that asset paths work after `npm run build` and `npm run preview`.
