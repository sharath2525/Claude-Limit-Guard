<div align="center">

# 🛡️ Claude Limit Guard

**Shows your Claude token count, cache timer, and usage limits — right inside the Claude interface.**

<a href="https://github.com/sharath2525/Claude-Limit-Guard/releases/latest">
  <img src="https://img.shields.io/badge/⬇️%20Download%20Extension-Click%20Here-brightgreen?style=for-the-badge" alt="Download">
</a>

> ⚠️ Use the button above — **not** the green "Code → Download ZIP" button (that one causes errors)

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](manifest.json)
[![Chrome](https://img.shields.io/badge/Chrome-Supported-yellow.svg)](#-install)
[![Edge](https://img.shields.io/badge/Edge-Supported-blue.svg)](#-install)
[![No Trackers](https://img.shields.io/badge/Trackers-None-brightgreen.svg)](#-why-its-safe)
[![Zero Permissions](https://img.shields.io/badge/Permissions-Zero-brightgreen.svg)](#-why-its-safe)

> ⚠️ Unofficial tool. Not affiliated with or endorsed by Anthropic.

</div>

---

## 🚀 Install

No build step. No `npm install`. Just download and load.

**Step 1 — Download (use the Release ZIP, not "Download ZIP")**

Go to the [**Releases**](../../releases/latest) page → download **`claude-limit-guard-vX.X.X.zip`**

> ⚠️ Do **not** use the green **`Code → Download ZIP`** button on the main page.
> That ZIP has a nested folder inside which causes a *"Manifest file missing"* error in Edge/Chrome.
> The Release ZIP is built cleanly — no nesting, works first time.

**Step 2 — Extract**

Right-click the ZIP → **Extract All** (Windows) or double-click (Mac).
You'll get a folder with **`manifest.json`** directly inside — no sub-folders to navigate.

**Step 3 — Open Extensions**

Type in your browser address bar and press Enter:
```
chrome://extensions
```
*(Edge users: `edge://extensions`)*

**Step 4 — Enable Developer Mode**

Toggle **Developer mode** ON in the top-right corner.

**Step 5 — Load the Extension**

Click **`Load unpacked`** → select the extracted folder from Step 2.

**Step 6 — Pin It**

Click the 🧩 puzzle-piece icon in your toolbar → find **Claude Limit Guard** → click 📌 to pin it.

**Step 7 — Open Claude**

Go to [claude.ai](https://claude.ai), open any conversation — the bars appear automatically.

**Using Git instead?**
```bash
git clone https://github.com/YOUR_USERNAME/claude-limit-guard.git
```
Then follow Steps 3–7, selecting the cloned folder at Step 5.

---

### Troubleshooting

| Problem | Fix |
|---|---|
| "Load unpacked" not visible | Toggle Developer mode ON first |
| Nothing shows on Claude | Refresh the Claude tab after loading |
| "Manifest file missing" error | You used "Download ZIP" from the main page — download from [Releases](../../releases/latest) instead |
| Extension gone after restart | Normal for unpacked — reload from `chrome://extensions` |

---

## ✨ What It Does

Adds a small info bar inside your Claude tab showing:

| | Feature | Details |
|---|---|---|
| 📊 | **Session Bar** | 5-hour rolling usage with colour-coded warnings |
| 📅 | **Weekly Bar** | 7-day usage with reset countdown |
| 🎨 | **Dark Mode** | Auto-matches Claude's theme |
| 🖱️ | **Click to Refresh** | Click the usage bar to refresh limits manually |

**Bar colours:** 🟢 Normal &nbsp;|&nbsp; 🟡 Approaching limit (≥80%) &nbsp;|&nbsp; 🔴 Near limit (≥98%)

---

## 🔐 Why It's Safe

### Permissions — Zero

The `permissions` array in `manifest.json` is literally `[]` — empty.
The extension only runs on `claude.ai` pages. It cannot touch any other site or tab.

| Permission | Status |
|---|---|
| Read all websites | ❌ Not requested |
| Read cookies | ❌ Not requested |
| Browser tabs / history | ❌ Not requested |
| Clipboard / downloads | ❌ Not requested |
| Extension storage | ❌ Not used |
| `claude.ai` pages only | ✅ Required to show the UI |

### Network — Same Site Only

Every request goes only to `claude.ai` — the same site already open in your browser:
```
GET https://claude.ai/api/organizations/{orgId}/usage
GET https://claude.ai/api/organizations/{orgId}/chat_conversations/{id}
```
No third-party servers. No analytics. No phone-home. Nothing sent outward.

### Storage — Nothing Saved

No `localStorage`, no `sessionStorage`, no `chrome.storage`, no cookies written.
All data is computed in memory and gone when you close the tab.

### Code — Audited Clean

| Risk | Result |
|---|---|
| `innerHTML` anywhere | ✅ None — only `createElement` + `.textContent` |
| `eval()` or dynamic scripts | ✅ None |
| External scripts at runtime | ✅ None |
| XSS / injection vectors | ✅ None found |
| Content Security Policy | ✅ `script-src 'self'; object-src 'none'` |

> 🔍 **Verify yourself:** All source is in `src/` — four small files under 600 lines total. Check `manifest.json`: `permissions: []`, `host_permissions: []`. Open Chrome DevTools Network tab on Claude — you'll see only `claude.ai` requests.

---

## 🔄 Data Flow

```
You open claude.ai
        │
        ▼
Extension starts (isolated — cannot touch page JS)
        │
        ├─► Reads lastActiveOrg cookie value → used to build API URL only
        │
        ├─► GET /api/organizations/{orgId}/usage
        │       └─► Shows: Session bar, Weekly bar, Reset countdown
        │
        └─► Nothing is sent outward. Display is local DOM only.
```

| Data | Refresh |
|---|---|
| Usage bars | Every 1 hour (or click to refresh) |

---

## ❓ FAQ

**Does it send my conversations anywhere?**
No. Token counting is done locally from data `claude.ai` already loads. Nothing is forwarded.

**Is the token count exact?**
No — it's an estimate. Claude uses a proprietary tokeniser; this extension approximates it. Accurate enough to track context usage.

**Will it break if Anthropic updates Claude?**
Possibly. If Claude's UI or API paths change, the extension stops showing data silently — it will never crash Claude itself.

**Does it work on Claude mobile?**
No. Desktop Chrome and Edge only.

---

## 🤝 Contributing

PRs welcome. Please keep `permissions: []` in the manifest and avoid `innerHTML`, `eval()`, or any external network requests.

---

## 📜 License

MIT License — Copyright (c) 2026 Sharath — see [LICENSE](LICENSE)

---

<div align="center">No trackers. No ads. No nonsense.</div>
