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
- Top-left button: sound on/off. Top-right button: pause during a round, **Progress** on the start and game-over screens. On desktop, **M** and **P** do the same as the corner buttons.

## 🎁 Gift challenge

Anyone who scores **150 or more** can claim a gift from the organiser. Progress shows a bar toward 150. Once it is reached, the bar becomes a **Gift unlocked** card with **Share result on WhatsApp**, which sends the winning score, time, stars, combo and date. Configure it via `PRIZE_SCORE`, `PRIZE_HOST` and `PRIZE_WHATSAPP` (optional direct number) in `index.html`.

## Track your progress

Every round is saved **on the device, in the browser it is played in** (`localStorage`). There is no account and no server. Tap 📊 (or **PROGRESS** after a round) to see best, rounds, recent average, a chart and history. The game asks the browser to keep this data persistently. On iPhone, adding the game to the Home Screen gives it its own storage, which Safari will not clear for inactivity.

## Compete with friends

**Compete with your friends** (start screen and Progress) opens WhatsApp directly with a challenge link like `https://sahilarora10.github.io/orbit-dash/?beat=42`. Friends who open it see "🎯 Beat your friend: 42" and are told how close they got after each round.

## Development

Everything is static, with no build step:

| File | Purpose |
|---|---|
| `index.html` | The whole game (canvas + JS) |
| `manifest.webmanifest` | App name, icons, full-screen display |
| `sw.js` | Service worker for offline play (bump `VERSION` after edits) |
| `icons/`, `og-image.jpg` | App icons + link-preview image, regenerated with `node tools/make-icons.mjs` |

Run locally with `python3 -m http.server` and open http://localhost:8000.
