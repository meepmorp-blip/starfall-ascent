# Starfall: The Ascent

A top-down action roguelite with party switching, built on astrology and Gnostic myth.
Meridian, 100 years after the first Starfall: the planets drop monsters on the last city, and your birth chart is how you fight back.

## Run it
No build step. Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

## Project layout
- `index.html`: the whole game (HTML, CSS and JavaScript, Canvas 2D)
- `manifest.webmanifest`, `sw.js`, `icons/`: install-to-home-screen (PWA) and offline support
- `netlify.toml`, `robots.txt`: hosting settings (the site is hidden from search engines)

## Saves
Progress is stored in the browser (localStorage). Use **Builds → Backup** to copy a backup code and restore it on another device.
