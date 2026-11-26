<h1 align="center">🎬 Kinokino Movie Redirect</h1>

<p align="center">
  Open the same movie/series page on <strong>kinokino.win</strong> directly from Kinopoisk.
</p>

<p align="center">
  <a href="./README.ru.md">🇷🇺 Русская версия</a>
</p>

## ✨ What It Does

- Adds a **Watch** button on Kinopoisk movie/series pages (also on their sub-pages like cast or reviews).
  If Kinopoisk has no buttons to attach to, a floating button appears in the corner instead.
- Opens the matching page `kinokino.win/film/ID/` (or `/series/ID/`). Ctrl/Cmd+click or middle click opens it in a new tab.
- **Toolbar icon** — click it on a movie page to open that movie on Kinokino.
- **Context menu** — right-click any movie link (search results, lists) → *Открыть на Kinokino*.
- **Settings** — right-click the extension icon → *Options* to change the site domain, so you don't need to update the extension when the mirror moves.

## 🚀 Quick Start

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this project folder

## 🧩 Project Structure

- `manifest.json` — extension manifest (MV3)
- `scripts/content.js` — button on the Kinopoisk page
- `scripts/background.js` — toolbar icon and context menu
- `scripts/shared.js` — URL parsing shared by all parts
- `options/` — settings page (site domain)
- `assets/icons/` — extension icons (`icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`)

## ⚖️ Legal Notice

- This project is **unofficial** and is **not affiliated with, endorsed by, or sponsored by** Kinopoisk or Yandex.
- Do not use third-party logos, trademarks, or brand assets without permission.
- For public distribution, use only original assets you are legally allowed to use.
- You are responsible for compliance with local laws and third-party Terms of Service.

## 📘 Educational Purpose Disclaimer

This project is provided for **educational and informational purposes only**.
It is not intended to facilitate, encourage, or support unlawful activity.
By using, modifying, or distributing this code, you assume full responsibility for legal compliance.

## 📄 License

Licensed under the **MIT License** — see [LICENSE](./LICENSE).
