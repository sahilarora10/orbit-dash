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
- Top-left button: sound on/off. Top-right button: pause during a round, **Progress** on the menu and game-over screens. On desktop, **M** and **P** do the same as the corner buttons.

## Track your progress

Every round is saved on your device: score, time survived, stars, best combo, close calls and when you played. Tap the 📊 button (or **PROGRESS** after a round) to see:

- rounds played, best score, average of your last 10, total play time
- an improvement trend comparing your last 10 rounds with the 10 before
- a chart of your last 30 rounds with a 5-round moving average
- your full round history, with each new best marked

Scores stay private on your phone, with no account and no server.

## Challenge friends

Tap **SHARE SCORE** after a round. It opens your phone's share sheet (WhatsApp, iMessage, ...) with a link like
`https://sahilarora10.github.io/orbit-dash/?beat=42`. Your friend sees "🎯 Beat your friend: 42" on the start screen, and after each round the game tells them how close they got.

## Development

Everything is static, with no build step:

| File | Purpose |
|---|---|
| `index.html` | The whole game (canvas + JS) |
| `manifest.webmanifest` | App name, icons, full-screen display |
| `sw.js` | Service worker for offline play (bump `VERSION` after edits) |
| `icons/`, `og-image.jpg` | App icons + link-preview image, regenerated with `node tools/make-icons.mjs` |

Run locally with `python3 -m http.server` and open http://localhost:8000.
