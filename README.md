<div align="center">

# Claude Limit Guard

**Track your Claude session and weekly usage limits, displayed directly inside Claude.**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](manifest.json)
[![Chrome](https://img.shields.io/badge/Chrome-Supported-yellow.svg)](#install)
[![Edge](https://img.shields.io/badge/Edge-Supported-blue.svg)](#install)
[![No Trackers](https://img.shields.io/badge/Trackers-None-brightgreen.svg)](#why-its-safe)
[![Zero Permissions](https://img.shields.io/badge/Permissions-Zero-brightgreen.svg)](#why-its-safe)

*Unofficial. Not affiliated with or endorsed by Anthropic.*

[Privacy Policy](PRIVACY.md)

</div>

---

## What It Does

Adds a small bar inside your Claude tab showing your live usage limits:

| Feature | Details |
|---|---|
| Session Bar | 5-hour rolling usage with colour-coded warnings |
| Weekly Bar | 7-day usage with live reset countdown |
| Dark Mode | Automatically matches Claude's theme |
| Click to Refresh | Click the bar to fetch the latest limits instantly |

Bar colours: Green = normal, Yellow = approaching limit (80%+), Red = near limit (98%+)

---

## Install

Choose the method that works best for you:

### Option 1 — Chrome Web Store (Recommended)

The easiest way. One click, no setup needed.

<a href="https://chromewebstore.google.com/detail/claude-limit-guard/njmlhjabppkblfpcepmikdnejoehdgki">
  <img src="https://img.shields.io/badge/Install%20from%20Chrome%20Web%20Store-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Install from Chrome Web Store">
</a>

Click the button above → **Add to Chrome** → **Add extension**. Done.

---

### Option 2 — Manual ZIP Install (Chrome & Edge)

No build step. No dependencies. Done in under a minute.

**Step 1: Download**

<a href="https://github.com/sharath2525/Claude-Limit-Guard/releases/latest/download/claude-limit-guard.zip">
  <img src="https://img.shields.io/badge/Download%20Extension-.zip-blue?style=for-the-badge" alt="Download ZIP">
</a>

Click the button above to download from the latest release.

> Use this button only. Do not use the green "Code" button on the repo page — that download has a nested folder inside and will not load correctly.

**Step 2: Extract**

Right-click the downloaded ZIP and choose **Extract All**. You will get a single folder.

**Step 3: Open Extensions**

Type this in your browser address bar and press Enter:

- Chrome: `chrome://extensions`
- Edge: `edge://extensions`

**Step 4: Enable Developer Mode**

Toggle **Developer mode** on using the switch in the top-right corner.

**Step 5: Load the Extension**

Click **Load unpacked** and select the folder you extracted in Step 2.

**Step 6: Pin It**

Click the puzzle-piece icon in your browser toolbar, find **Claude Limit Guard**, and click the pin icon.

**Step 7: Open Claude**

Go to [claude.ai](https://claude.ai) and open any conversation. The usage bars will appear automatically at the bottom of the chat input.

---

### Troubleshooting

| Problem | Fix |
|---|---|
| "Load unpacked" is not visible | Enable Developer mode first (Step 4) |
| Nothing appears on Claude | Reload the Claude tab after loading the extension |
| "Manifest file missing" error | You used the wrong download. Use the Download button above, not "Code → Download ZIP" |
| Extension disappears after browser restart | This is normal for unpacked extensions. Reload it from `chrome://extensions` |

---

## Why It's Safe

### Zero Permissions

The extension requests no browser permissions at all. It only runs on `claude.ai` pages and cannot read or touch any other site or tab.

| Permission | Status |
|---|---|
| Read all websites | Not requested |
| Read cookies | Not requested |
| Browser tabs or history | Not requested |
| Clipboard or downloads | Not requested |
| Extension storage | Not used |

### Network: Same Site Only

The only request made is to the same `claude.ai` domain already open in your browser:

```
GET https://claude.ai/api/organizations/{orgId}/usage
```

No third-party servers. No analytics. Nothing is sent outward.

### Storage: Nothing Saved

No `localStorage`, `sessionStorage`, `chrome.storage`, or cookies are written. All data lives in memory and disappears when you close the tab.

### Code: Clean

| Check | Result |
|---|---|
| `innerHTML` anywhere | None, only `createElement` and `.textContent` |
| `eval()` or dynamic scripts | None |
| External scripts loaded at runtime | None |
| Content Security Policy | `script-src 'self'; object-src 'none'` |

You can verify this yourself. All source code is in the `src/` folder. Open `manifest.json` and check: `permissions: []`, `host_permissions: []`.

---

## How It Works

```
You open claude.ai
        |
        v
Extension starts (runs in isolation, cannot touch page JavaScript)
        |
        |-- Reads the org cookie value to build the API request URL
        |
        |-- GET /api/organizations/{orgId}/usage
        |       Reads: session usage, weekly usage, reset times
        |
        v
Displays session and weekly bars in the Claude interface.
Nothing is sent outward. Everything is local.
```

Usage data is fetched from the API once per hour. The reset countdown shown on the bar updates live every second from that data. Click the bar at any time to fetch fresh data immediately.

---

## FAQ

**Does it send my data anywhere?**
No. It reads usage data from `claude.ai` endpoints that your browser already has access to. Nothing is forwarded or stored.

**Will it break if Anthropic updates Claude?**
Possibly. If Claude's internal API paths change, the extension will stop showing data silently. It will never crash or affect Claude itself.

**Does it work on mobile?**
No. Desktop Chrome and Edge only.

---

## Contributing

PRs are welcome. Please keep `permissions: []` in the manifest and avoid `innerHTML`, `eval()`, or any external network requests.

---

## License

MIT. Copyright (c) 2026 Sharath. See [LICENSE](LICENSE).

---

<div align="center"><i>No trackers. No ads. No nonsense.</i></div>
