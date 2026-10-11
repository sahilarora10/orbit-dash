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

Anyone who scores **150 or more** can ping the organiser to claim a gift. Reaching 150 shows **GIFT UNLOCKED!**, and the Progress screen gets a gold **Claim gift on WhatsApp** button that opens WhatsApp with a ready-made claim message. The threshold, the organiser's name and an optional direct WhatsApp number are set at the top of the prize section in `index.html` (`PRIZE_SCORE`, `PRIZE_HOST`, `PRIZE_WHATSAPP`).

## Track your progress

Every round is saved on your device: score, time survived, stars, best combo, close calls and when you played. Tap the 📊 button (or **PROGRESS** after a round) to see:

- rounds played, best score, average of your last 10, total play time
- an improvement trend comparing your last 10 rounds with the 10 before
- a chart of your last 30 rounds with a 5-round moving average
- your full round history, with each new best marked

Scores stay private on your phone, with no account and no server.

## Share with friends

Tap **Share on WhatsApp** on the start screen or in Progress. It opens WhatsApp directly with a message and a challenge link like `https://sahilarora10.github.io/orbit-dash/?beat=42`. Friends who open it see "🎯 Beat your friend: 42" on the start screen, and after each round the game tells them how close they got.

## Development

Everything is static, with no build step:

| File | Purpose |
|---|---|
| `index.html` | The whole game (canvas + JS) |
| `manifest.webmanifest` | App name, icons, full-screen display |
| `sw.js` | Service worker for offline play (bump `VERSION` after edits) |
| `icons/`, `og-image.jpg` | App icons + link-preview image, regenerated with `node tools/make-icons.mjs` |

Run locally with `python3 -m http.server` and open http://localhost:8000.
