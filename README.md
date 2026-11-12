# Starfall: The Ascent

A top-down action RPG with party switching, built on astrology and Gnostic myth.
Meridian is the last free city of Aster. Every night the sky drops monsters on it, and your birth chart is how you fight back.

- **Story:** Chapter 1, "The Minute Meridian Held Its Breath" (about 40 minutes, a cast of 8, saved at every scene).
- **Battle:** pick any party of 3 and play any district, Trial, the boss, or a full Climb.

## Run it
No build step. Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

## Project layout
- `index.html`: the whole game (HTML, CSS and JavaScript, Canvas 2D)
- `docs/`: Lore Bible and the Chapter 1 script draft
- `manifest.webmanifest`, `sw.js`, `icons/`: install-to-home-screen (PWA) and offline support
- `netlify.toml`, `robots.txt`: hosting settings (the site is hidden from search engines)

## Saves
Progress is stored in the browser (localStorage). Use **Builds → Backup** to copy a backup code and restore it on another device.
If a save can't be read, the game keeps a copy of it under `starfall-ascent-save-broken-<time>` and shows a warning on the home screen.
