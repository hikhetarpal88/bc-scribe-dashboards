# BC Scribe Self-Pay Program Dashboards — Documentation

## Overview

Seven separate read-only dashboards for tracking AI Scribe Self-Pay sign-ups across BC Health Authorities. Each Health Authority (HA) has its own dashboard with a unique shareable link. Dashboards auto-update from a master Google Sheet via a server-side Apps Script proxy.

---

## Health Authorities & Dashboard Files

| HA Code | Full Name | File | Logos |
|---------|-----------|------|-------|
| PHSA | Provincial Health Services Authority | `phsa.html` | PHSA + HIM |
| PHC | Providence Health Care | `phc.html` | PHC + PHSA + HIM |
| VCH | Vancouver Coastal Health | `vch.html` | VCH + PHSA + HIM |
| FHA | Fraser Health Authority | `fha.html` | FHA + PHSA + HIM |
| VIHA | Island Health | `viha.html` | VIHA + PHSA + HIM |
| IH | Interior Health | `ih.html` | IH + PHSA + HIM |
| NH | Northern Health | `nh.html` | NH + PHSA + HIM |

**Note:** PHSA dashboard shows only 2 logos (PHSA + HIM). All others show 3 (HA-specific + PHSA + HIM).

---

## Architecture

```
┌──────────────┐     ┌───────────────────────┐     ┌───────────────────┐
│  Dashboard   │────>│  Google Apps Script    │────>│  Google Sheet     │
│  (HTML/JS)   │     │  (Server-Side Proxy)   │     │  (Master Data)    │
│  GitHub Pages│<────│  Filters by HA param   │<────│  Sheet1           │
└──────────────┘     └───────────────────────┘     └───────────────────┘
```

### Data Flow
1. Dashboard HTML loads in browser
2. Immediately fires a `fetch()` to the Apps Script proxy with `?ha=<HA_CODE>`
3. Apps Script reads the master Google Sheet, filters rows where `Health Authority` column matches the HA code
4. Returns filtered JSON response (only that HA's data — other HA data never leaves Google's servers)
5. Dashboard deduplicates by email, renders scorecards, charts, and provider table

### Key Benefit
The Google Sheet ID never leaves Google's servers. Each HA only ever receives its own rows.

---

## Hosting

- **Platform:** GitHub Pages (free)
- **Repository:** `hikhetarpal88/bc-scribe-dashboards` (public)
- **Base URL:** `https://hikhetarpal88.github.io/bc-scribe-dashboards/`
- **Individual dashboard URLs:**
  - `https://hikhetarpal88.github.io/bc-scribe-dashboards/phsa.html`
  - `https://hikhetarpal88.github.io/bc-scribe-dashboards/phc.html`
  - `https://hikhetarpal88.github.io/bc-scribe-dashboards/vch.html`
  - `https://hikhetarpal88.github.io/bc-scribe-dashboards/fha.html`
  - `https://hikhetarpal88.github.io/bc-scribe-dashboards/viha.html`
  - `https://hikhetarpal88.github.io/bc-scribe-dashboards/ih.html`
  - `https://hikhetarpal88.github.io/bc-scribe-dashboards/nh.html`
- **Index page** (navigation hub): `https://hikhetarpal88.github.io/bc-scribe-dashboards/`

---

## Google Sheet (Master Data Source)

- **Sheet ID:** `1gYbiE15xltGZeHkNzgyF8iJCmBko75IauWIUySouLvc`
- **Tab:** `Sheet1`
- **Required columns:** `Health Authority`, `First Name`, `Last Name`, `Health Authority Email`, `Clinical Specialty`, `Vendor`
- **Adding new data:** Simply add rows to the Google Sheet. Dashboards auto-refresh on each page load.

---

## Apps Script Proxy

- **Deployed URL:** `https://script.google.com/macros/s/AKfycbw5mxQzV4m9nFrhHGDboWNx_MtBJOvMJ9725_wkfEg9TrrG2H9bd6dQYVCWSMGYlNZ7/exec`
- **Source file (local reference):** `apps-script-proxy.js`
- **Deployment settings:** Web App → Execute as ME → Anyone can access
- **Valid HA parameters:** `PHSA`, `PHC`, `VCH`, `FHA`, `VIHA`, `IH`, `NH`
- **Example request:** `<proxy_url>?ha=PHC`
- **Response format:**
  ```json
  {
    "ha": "PHC",
    "count": 48,
    "timestamp": "2026-04-09T...",
    "data": [
      {
        "Health Authority": "PHC",
        "First Name": "...",
        "Last Name": "...",
        "Health Authority Email": "...",
        "Clinical Specialty": "...",
        "Vendor": "..."
      }
    ]
  }
  ```

### Updating the Apps Script
1. Go to https://script.google.com
2. Open the project linked to this deployment
3. Edit `Code.gs` (reference: `apps-script-proxy.js`)
4. Deploy → Manage deployments → Edit → New version → Deploy

---

## Dashboard Features

### Scorecards (top of page)
- **Total Sign-Ups** — count of unique providers (deduplicated by email)
- **Vendors** — count of distinct vendor names
- **Specialties** — count of distinct clinical specialties

### Filters
- **Vendor** dropdown — filter by AI scribe vendor
- **Specialty** dropdown — filter by clinical specialty
- **Reset** button — clears all filters
- All filters update scorecards, charts, and table in real-time

### Charts (Chart.js 4.4.7)
- **Clinical Specialty** — doughnut chart (top 10 specialties)
- **Vendor** — horizontal bar chart
- Both charts exclude blank values
- Color palette: `#2E7D8C`, `#3aadbe`, `#f5803e`, `#a855f7`, `#ec4899`, `#eab308`, `#14b8a6`, `#6366f1`, `#f43f5e`, `#84cc16`, `#06b6d4`, `#d946ef`

### Provider Database
- **Search bar** — searches by name, email, or specialty
- **Table columns:** Name, Email, Clinical Specialty, Vendor
- Shows "X of Y providers" count
- Scrollable with sticky header

### Data Note
- Displays: "Providers who signed up on or after December 3, 2025"

---

## Design

- **Color scheme:** Teal/blue — `--primary: #1a5c6b`, `--accent: #2E7D8C`, `--accent-light: #3a9aad`
- **Header:** Gradient teal background with white text
- **Logos:** Displayed on white pill backgrounds (`background: rgba(255,255,255,0.95); padding: 6px 12px; border-radius: 8px;`) with dividers between them
- **Cards:** White with `border-radius: 1rem`, subtle box shadows
- **Responsive:** Adapts to mobile (single-column charts below 768px)

---

## File Structure

```
dashboards/
├── index.html              # Navigation hub (links to all 7 dashboards)
├── phc.html                # PHC dashboard (MASTER TEMPLATE)
├── vch.html                # VCH dashboard
├── fha.html                # FHA dashboard
├── viha.html               # VIHA dashboard
├── ih.html                 # IH dashboard
├── nh.html                 # NH dashboard
├── phsa.html               # PHSA dashboard (2 logos only)
├── apps-script-proxy.js    # Local reference of Apps Script code
├── DOCUMENTATION.md        # This file
└── logos/
    ├── phc.png             # Providence Health Care logo
    ├── phsa.png            # Provincial Health Services Authority logo
    ├── vch.png             # Vancouver Coastal Health logo
    ├── fha.svg             # Fraser Health Authority logo
    ├── viha.svg            # Island Health logo
    ├── ih.png              # Interior Health logo (blue version)
    ├── nh.png              # Northern Health logo
    └── him.png             # Health Information Management logo
```

---

## How to Make Changes

### Template Approach
`phc.html` is the **master template**. To make changes across all dashboards:

1. Edit `phc.html`
2. Regenerate all 6 variants using `sed` substitutions:
   ```bash
   # Example for VCH:
   sed \
     -e "s/const HA = 'PHC'/const HA = 'VCH'/g" \
     -e "s/const HA_FULL = 'Providence Health Care'/const HA_FULL = 'Vancouver Coastal Health'/g" \
     -e "s/<title>PHC/<title>VCH/g" \
     -e "s/PHC \&mdash; Providence Health Care/VCH \&mdash; Vancouver Coastal Health/g" \
     -e "s|logos/phc.png|logos/vch.png|g" \
     -e "s|alt=\"PHC Logo\"|alt=\"VCH Logo\"|g" \
     -e "s|?ha=PHC|?ha=VCH|g" \
     phc.html > vch.html
   ```
3. For PHSA, additionally remove the duplicate HA logo (keep only PHSA + HIM):
   ```python
   python3 -c "
   with open('phsa.html','r') as f:
       content = f.read()
   # Remove HA logo + first divider, keeping only PHSA + HIM
   old = '''    <div class=\"logos-row\">
         <img src=\"logos/phsa.png\" alt=\"PHSA Logo\">
         <div class=\"logo-divider\"></div>
         <img src=\"logos/phsa.png\" alt=\"PHSA Logo\">
         <div class=\"logo-divider\"></div>
         <img src=\"logos/him.png\" alt=\"HIM Logo\">
       </div>'''
   new = '''    <div class=\"logos-row\">
         <img src=\"logos/phsa.png\" alt=\"PHSA Logo\">
         <div class=\"logo-divider\"></div>
         <img src=\"logos/him.png\" alt=\"HIM Logo\">
       </div>'''
   content = content.replace(old, new)
   with open('phsa.html','w') as f:
       f.write(content)
   "
   ```
4. Commit and push to `main` — GitHub Pages auto-deploys

### HA Code → Full Name Mapping
| Code | Full Name | Logo File |
|------|-----------|-----------|
| PHSA | Provincial Health Services Authority | `logos/phsa.png` |
| PHC | Providence Health Care | `logos/phc.png` |
| VCH | Vancouver Coastal Health | `logos/vch.png` |
| FHA | Fraser Health Authority | `logos/fha.svg` |
| VIHA | Island Health | `logos/viha.svg` |
| IH | Interior Health | `logos/ih.png` |
| NH | Northern Health | `logos/nh.png` |

---

## Deploying Updates

```bash
cd "/Users/HK/Desktop/PHC/AI Scribe/BC Scribe/dashboards"
git add -A
git commit -m "Description of changes"
git push origin main
```

GitHub Pages typically deploys within 1-2 minutes. Users may need to hard refresh (`Cmd+Shift+R`) to bypass browser cache.

---

## Performance Optimizations

- **LocalStorage caching (stale-while-revalidate):** On first visit, data is cached in `localStorage` under key `scribe_cache_<HA>`. On subsequent visits, cached data renders instantly while fresh data loads in the background. Header shows "(updating...)" during background refresh.
- **Prefetch:** Data fetch starts immediately in `<head>` (runs in parallel with Chart.js CDN download)
- **Preconnect:** DNS/TLS handshake for `cdn.jsdelivr.net` and `script.google.com` starts before any script loads
- **Deduplication:** Handled client-side by email address to prevent duplicate provider entries
- **Chart.js:** Loaded from jsDelivr CDN (cached globally)

---

## Deduplication Logic

Providers are deduplicated by `Health Authority Email` (case-insensitive, trimmed). If multiple rows share the same email, only the first occurrence is kept. Rows with no email are always included.

---

## Security Considerations

- Google Sheet ID is hidden server-side in the Apps Script proxy — never exposed to the browser
- Each dashboard hardcodes its own HA code — it can only fetch its own data
- The Apps Script validates the `ha` parameter against a whitelist
- Dashboards are read-only (no write access to the Sheet)
- GitHub Pages repo is public (required for free hosting)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Dashboard shows old data | Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows) |
| "Error: Could not read sheet" | Check Apps Script deployment is active and Sheet permissions |
| Charts show "No data" | Verify the Google Sheet has rows matching the HA code |
| Logos not loading | Check `logos/` directory has the correct files committed |
| Changes not visible after push | Wait 1-2 min for GitHub Pages deployment, then hard refresh |
| Apps Script returns error | Re-deploy: Script Editor → Deploy → Manage deployments → New version |

---

## Custom URL Options (Not Yet Implemented)

If custom URLs are needed in the future:
1. **Rename repo** (free) — cleaner GitHub Pages path
2. **is-a.dev subdomain** (free) — e.g., `bc-scribe.is-a.dev`
3. **FreeDNS subdomain** (free) — e.g., `bc-scribe.mooo.com`
4. **Custom domain** (~$10/yr) — buy a domain and point CNAME to GitHub Pages
