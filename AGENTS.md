# Repository Guidelines

## Project Structure & Module Organization

This is a Vite static site for Bordados Yussi using vanilla JavaScript, CSS, and GSAP. The main entry point is `src/main.js`, which imports section CSS and initializes feature modules. Keep behavior in focused modules under `src/` such as `navbar.js`, `faq.js`, `form.js`, `animations.js`, and `whatsapp.js`.

CSS is organized by page section in `src/css/`, with shared tokens and base styles in `src/css/main.css`. Static assets live in `public/`; media is mainly under `public/img/`. Root `index.html` contains page markup, while `vite.config.js` holds build configuration.

## Build, Test, and Development Commands

- `npm install`: install project dependencies from `package-lock.json`.
- `npm run dev`: start the Vite development server for local work.
- `npm run build`: create the production build in `dist/`.
- `npm run preview`: serve the production build locally for final checks.

Run `npm run build` before a pull request to catch bundling or asset path problems.

## Coding Style & Naming Conventions

Use ES modules, two-space indentation, single quotes, and no semicolons. Prefer small exported initializer functions named `initFeature`, then call them from `src/main.js` after `DOMContentLoaded`.

Keep section styles in the matching CSS file, for example hero styles in `src/css/hero.css` and FAQ styles in `src/css/faq.css`. Put shared colors, spacing, typography, and radius values in `:root` variables in `src/css/main.css`.

## Testing Guidelines

There is no automated test script. For each change, run `npm run build` and manually verify affected sections in a browser. Check responsive layouts, navigation, language switching, forms, WhatsApp actions, animations, and reduced-motion behavior when relevant.

If automated tests are added later, prefer Vitest-compatible `*.test.js` files near the modules they cover and add an `npm test` script.

## Commit & Pull Request Guidelines

The short git history uses concise subjects such as `Premium visual pass: scroll-story hero, brand accent, typography, perf`. Keep commit subjects brief and specific, with a scope before a colon when useful.

Pull requests should include a clear summary, key visual or behavioral changes, manual verification steps, and screenshots or recordings for UI changes. Link related issues when available and mention asset additions or performance-sensitive media changes.

## Security & Configuration Tips

Do not commit secrets or local environment files. Optimize new images and videos before adding them to `public/img/`, and verify that asset paths work after `npm run build` and `npm run preview`.
