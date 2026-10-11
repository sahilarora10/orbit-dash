# Orbit Dash

A one-tap neon arcade game. Reverse your orbit, grab stars, and dodge meteors.

**Play:** https://sahilarora10.github.io/orbit-dash/

## Install it on your phone

It's a Progressive Web App (PWA), so it installs straight from the browser. There's no app store, and once installed it plays offline and full-screen.

- **iPhone / iPad (Safari):** open the link → tap **Share** → **Add to Home Screen**.
- **Android (Chrome):** open the link → tap **Install app** (or ⋮ menu → **Add to Home screen**).

## How to play

- **Tap anywhere** (or Space / arrow keys) to reverse direction.
- Grab ★ stars for points. Grab them back-to-back for a combo up to ×5.
- Skim close past a meteor for a **+1** bonus.
- Top-left button: sound on/off. Top-right button: pause. On desktop, **M** and **P** do the same.

## Development

Everything is static, with no build step:

| File | Purpose |
|---|---|
| `index.html` | The whole game (canvas + JS) |
| `manifest.webmanifest` | App name, icons, full-screen display |
| `sw.js` | Service worker for offline play (bump `VERSION` after edits) |
| `icons/` | App icons, regenerated with `node tools/make-icons.mjs` |

Run locally with `python3 -m http.server` and open http://localhost:8000.
