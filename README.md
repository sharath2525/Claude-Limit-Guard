<div align="center">

# Claude Limit Guard

**Tracks your Claude session and weekly usage limits — displayed directly inside the Claude interface.**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](manifest.json)
[![Chrome](https://img.shields.io/badge/Chrome-Supported-yellow.svg)](#install)
[![Edge](https://img.shields.io/badge/Edge-Supported-blue.svg)](#install)
[![No Trackers](https://img.shields.io/badge/Trackers-None-brightgreen.svg)](#why-its-safe)
[![Zero Permissions](https://img.shields.io/badge/Permissions-Zero-brightgreen.svg)](#why-its-safe)

*Unofficial. Not affiliated with or endorsed by Anthropic.*

</div>

---

## What It Does

Adds a compact bar inside your Claude tab showing:

| Feature | Details |
|---|---|
| Session Bar | 5-hour rolling usage with colour-coded warnings |
| Weekly Bar | 7-day usage with reset countdown |
| Dark Mode | Auto-matches Claude's theme |
| Click to Refresh | Click the bar to manually refresh limits |

Bar colours: Green = normal · Yellow = approaching limit (≥80%) · Red = near limit (≥98%)

---

## Install

No build step. No dependencies. Download and load in under a minute.

**Step 1 — Download**

<a href="https://github.com/sharath2525/Claude-Limit-Guard/releases/latest/download/claude-limit-guard.zip">
  <img src="https://img.shields.io/badge/Download%20Extension-.zip-blue?style=for-the-badge" alt="Download ZIP">
</a>

Click the button above. The ZIP extracts with `manifest.json` at the root — ready to load directly.

> Do **not** use the green "Code → Download ZIP" button on the repo page. That ZIP has an extra nested folder which causes a "Manifest file missing" error.

**Step 2 — Extract**

Right-click the downloaded ZIP → **Extract All**. You'll get a single folder with `manifest.json` inside.

**Step 3 — Open Extensions**

Go to `chrome://extensions` in Chrome or `edge://extensions` in Edge.

**Step 4 — Enable Developer Mode**

Toggle **Developer mode** on in the top-right corner.

**Step 5 — Load the Extension**

Click **Load unpacked** → select the folder you extracted in Step 2.

**Step 6 — Pin It**

Click the puzzle-piece icon in your browser toolbar → find **Claude Limit Guard** → pin it.

**Step 7 — Open Claude**

Go to [claude.ai](https://claude.ai) and open any conversation — the usage bars appear automatically.

---

### Troubleshooting

| Problem | Fix |
|---|---|
| "Load unpacked" not visible | Enable Developer mode first |
| Nothing shows on Claude | Refresh the Claude tab after loading |
| "Manifest file missing" error | Use the Download button above, not "Code → Download ZIP" |
| Extension gone after browser restart | Normal for unpacked extensions — reload it from `chrome://extensions` |

---

## Why It's Safe

### Zero Permissions

The `permissions` array in `manifest.json` is `[]` — empty. The extension runs only on `claude.ai` pages and cannot access any other site or tab.

| Permission | Status |
|---|---|
| Read all websites | Not requested |
| Read cookies | Not requested |
| Browser tabs / history | Not requested |
| Clipboard / downloads | Not requested |
| Extension storage | Not used |
| `claude.ai` pages only | Required to display the UI |

### Network — Same Site Only

Every request goes only to `claude.ai` — the same domain already open in your browser:

```
GET https://claude.ai/api/organizations/{orgId}/usage
GET https://claude.ai/api/organizations/{orgId}/chat_conversations/{id}
```

No third-party servers. No analytics. Nothing sent outward.

### Storage — Nothing Saved

No `localStorage`, `sessionStorage`, `chrome.storage`, or cookies written. All data is computed in memory and gone when you close the tab.

### Code — Clean

| Check | Result |
|---|---|
| `innerHTML` anywhere | None — only `createElement` + `.textContent` |
| `eval()` or dynamic scripts | None |
| External scripts at runtime | None |
| XSS / injection vectors | None found |
| Content Security Policy | `script-src 'self'; object-src 'none'` |

Verify yourself: all source is in `src/` — four small files. Check `manifest.json`: `permissions: []`, `host_permissions: []`.

---

## Data Flow

```
You open claude.ai
        │
        ▼
Extension starts (isolated — cannot touch page JS)
        │
        ├── Reads lastActiveOrg cookie → used only to build the API URL
        │
        ├── GET /api/organizations/{orgId}/usage
        │       └── Shows session bar, weekly bar, reset countdown
        │
        └── Nothing is sent outward. Display is local DOM only.
```

Usage bars refresh every 1 hour, or on click.

---

## FAQ

**Does it send my conversations anywhere?**
No. Data comes from `claude.ai` endpoints already loaded in your browser. Nothing is forwarded.

**Is the usage count exact?**
No — it's an estimate based on the same API data Claude uses internally. Accurate enough for tracking context limits.

**Will it break if Anthropic updates Claude?**
Possibly. If Claude's API paths change, the extension stops showing data silently — it will never crash or affect Claude itself.

**Does it work on mobile?**
No. Desktop Chrome and Edge only.

---

## Contributing

PRs welcome. Keep `permissions: []` in the manifest and avoid `innerHTML`, `eval()`, or external network requests.

---

## License

MIT — Copyright (c) 2026 Sharath. See [LICENSE](LICENSE).

---

<div align="center"><i>No trackers. No ads. No nonsense.</i></div>
