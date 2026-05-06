# Changelog — BC Scribe Self-Pay Program Dashboards

All notable changes to these dashboards are documented here.

---

## 2026-05-06 — v4.5 Static JSON snapshots — fixes NH firewall blocking

Multiple Northern Health users (Tim, Bjorn, +1) still saw "Failed to fetch" after v4.4, even after hard refresh and switching browsers. Root cause confirmed via redirect-chain inspection: every dashboard request bounces from `script.google.com` → `script.googleusercontent.com`, and NH's corporate firewall blocks the second domain.

### Architecture change — eliminate the Apps Script call from the client

Dashboards now fetch from a **same-origin static JSON file** in the GitHub Pages repo (`data/<HA>.json`). No redirect, no `googleusercontent.com`, no firewall to dodge. Apps Script is kept as a fallback (Tier 3) but rarely used.

**Three-tier data fetch:**
1. **Tier 1** — Head prefetch of `data/<HA>.json` (8s timeout, same-origin = ~50-200ms typical)
2. **Tier 2** — Same-origin retry if Tier 1 missed
3. **Tier 3** — Apps Script proxy (existing path, kept as graceful fallback)

### Added — GitHub Action `.github/workflows/snapshot-data.yml`
- Runs every 15 minutes on a cron schedule
- Calls Apps Script for each of the 7 HAs (from GitHub-hosted runner IPs, not corporate networks)
- Validates JSON shape, retries up to 3x per HA
- Commits to `data/` only if content changed
- `workflow_dispatch` enabled for manual refresh from the Actions tab
- Concurrency-locked to prevent overlapping runs

### Added — Initial data snapshots in `data/`
- All 7 HAs seeded with current data (PHSA: 226, PHC: 43, VCH: 181, FHA: 179, VIHA: 122, IH: 98, NH: 19)
- Total payload ~228KB across all 7 files

### Tradeoff
- Data freshness: 15-min lag instead of instant. Acceptable for this dashboard — vendor signups don't need real-time.
- The 15-min cadence can be tightened to 5 min if needed by editing the cron in the workflow.

---

## 2026-05-06 — v4.4 Deploy v4.3 + tightened timeouts and clearer error UX

The v4.3 patches below were prepared on Apr 24 but never deployed (changes sat uncommitted). User reported the same "Failed to fetch" issue on May 6. Pushing v4.3 + tightening:

### Changed — Tighter timeout budget (60s → ~36s worst case)
- Head prefetch timeout: 20s → 15s (cold start is 3-5s; 15s is comfortable)
- Each retry timeout: 20s → 12s (warm should be sub-second)
- Worst-case total: 15s prefetch + 3×12s retries = ~51s, but in practice the retry loop usually succeeds on attempt 1 or 2

### Changed — Loading message expectation
- "first load can take up to 20s" → "first load can take 5-10 seconds" (matches measured TTFB)

### Changed — Error message is more actionable
- Old: "Could not load data: Failed to fetch — Retry"
- New: "Could not load data (Failed to fetch). Retry · If retry keeps failing, hard refresh (Cmd/Ctrl+Shift+R) or try a different browser."
- Mirrors Naomi's Friday troubleshooting suggestions so users get the same guidance baked into the UI

### Pressure test results
- 9/9 JS edge cases pass (HTTP 500 retry, malformed JSON, error-JSON detection, prefetch+flaky combos, multi-Retry, empty data, localStorage quota)
- Endpoint health verified: 7/7 HAs respond in 1.7-4.4s; bad inputs return proper error JSON

---

## 2026-04-24 — v4.3 Fetch Reliability & Load-Time Fixes (all 7 dashboards + proxy)

Triggered by user feedback: Bjorn Butow (NH) saw "Error: Failed to fetch"; Naomi Brooks (VCH) and Tim Graham (NH) reported slow loads and timeouts. Root cause was Google Apps Script cold-start (2.6–4.9s TTFB) combined with zero retry/timeout handling in the client.

### Fixed — "Failed to fetch" error with no recovery
- Fetch now retries up to 3 times with exponential backoff (1s, 2s) before surfacing an error
- Error UI now shows a **Retry** link instead of a dead error string — one click re-runs `loadData()` without a full page reload
- Transient network hiccups (corporate firewall redirect issues, brief DNS failures) now self-heal invisibly
- `AbortError` timeouts now render as "Request timed out" instead of "Failed to fetch"

### Added — Request timeout (20s)
- Both the head-prefetch and the in-page fallback use `AbortController` to cap each attempt at 20 seconds
- Prevents the indefinite hang users were seeing on first visit

### Added — Server-side 60s cache on the Apps Script proxy
- `apps-script-proxy.js` now uses `CacheService.getScriptCache()` with a 60-second TTL
- Cold request still ~3-5s (unchanged); **warm requests drop to ~150-300ms** — the typical user experience
- Cache key is per-HA (`ha_v1_<HA>`); 100KB limit handled gracefully
- **Redeploy required**: Apps Script → Deploy → Manage deployments → New version

### Added — Extra preconnects for Apps Script redirect target
- Added `preconnect` + `dns-prefetch` for `script.googleusercontent.com`
- Apps Script 302-redirects to this domain; preconnecting saves ~200–400ms of TLS handshake

### Changed — Offline/cache handling
- When a refresh fails but cached data exists, the header now appends "· offline (showing cached data)" instead of silently staying on stale cache
- First-visit loading message is explicit: "Loading data… (first load can take up to 20s)"

### Technical notes
- Head prefetch now wrapped in `AbortController` + silenced unhandled-rejection (handled in `loadData`)
- New helpers: `fetchWithTimeout(url, ms)` and `fetchLive()` (prefetch-first, then retry loop)
- `__dataPromiseConsumed` flag prevents re-awaiting an already-rejected prefetch on Retry click
- Chart.js load unchanged (blocking but preconnected — fast enough at ~70KB gzip)

### QA
- 6/6 fetch logic unit tests pass: success, retry-then-succeed, all-fail, prefetch-hit, prefetch-miss-fallback, AbortError propagation
- All 7 dashboards patched identically (MD5-verified); JS syntax clean (`node --check`)

---

## 2026-04-09 — v4.2 Footer Logo Strip (all 7 dashboards)

### Changed — Logos moved from header to footer
- Removed logo strip from below header — header is now clean title only
- Added "Variation A" footer with all 6 HA logos (PHC, VCH, FHA, VIHA, IH, NH) + "Presented by" PHSA/HIM
- Footer is identical across all 7 dashboards for consistency
- All HA logos displayed in uniform 130×48px cells with max-height:32px constraint

### Fixed — VCH logo aspect ratio
- Cropped VCH logo from 480×250 (1.9:1) to 480×130 (3.7:1) by removing whitespace
- VCH now renders at comparable visual weight to other horizontal logos
- Previously appeared tiny because near-square aspect ratio at constrained height

### Changed — Regeneration script simplified
- Footer logos are hardcoded (same for all dashboards) — no logo path substitution needed
- sed only replaces: title, API ha= param, subtitle, HA const, HA_FULL const

---

## 2026-04-09 — v4 Progress Bars + Logo Containers (all 7 dashboards)

### Changed — Specialty chart: doughnut → progress bars
- Replaced cluttered doughnut chart (17+ slices) with gradient progress bars
- Each bar shows: specialty name, colored fill proportional to count, count badge, percentage
- 12 unique gradient colors cycling through teal, orange, purple, pink, green, gold, indigo, cyan
- Top 10 specialties displayed; footer shows "Top 10 of N specialties shown"
- Doughnut chart retained for vendor breakdown (ideal for 2-3 items)

### Changed — Logo integration: white strip below header
- Moved logos from inside teal header to a dedicated white strip below it
- Original brand colors preserved — no filters, no containers, no pills
- Logos centered with subtle dividers on clean white background
- VCH logo cropped from 480×480 square to 480×250 wide (removed excess whitespace)
- Solves contrast issues across all logo types (icons, text, SVG, PNG)

### Changed — Charts grid layout
- Widened specialty column (1.4fr) and narrowed vendor column (0.6fr)
- Vendor doughnut legend moved to bottom position for better vertical fit

---

## 2026-04-09 — v3.2 Executive Summary Fix (all 7 dashboards)

### Fixed — Executive summary vendor attribution
- Vendor count/name now reflects the **top specialty specifically**, not all specialties combined
- Previously: "Geriatrics leads with 13% of sign-ups across 2 active vendors" (wrong — Geriatrics only uses Heidi)
- Now: "Geriatrics leads with 13% of sign-ups via **Heidi**"

### Fixed — Executive summary when specialty filter is active
- Previously showed misleading "X leads with 100% of sign-ups across N vendors" when filtering by specialty
- Now shows contextual vendor breakdown: e.g., "4 Emergency Medicine providers across Heidi (3), Empathia (1)"
- Single-vendor specialties show "via **VendorName**"

### Added — Urogynaecologist normalization
- Added mapping: "Urogynaecologist" → "Urogynaecology"

---

## 2026-04-09 — v3.1 Specialty Data Normalization (all 7 dashboards)

### Added — Real-time specialty normalization
- 80+ specialty variant mappings applied client-side on every data load
- Normalizes person-titles to field-names (e.g., "Gastroenterologist" → "Gastroenterology")
- Merges duplicates: Emergency Medicine (3 variants), Family Medicine (2), Geriatrics (3), OB/GYN (3), ENT (4), Orthopaedics (3), Respiratory (4), etc.
- Strips hidden unicode characters (non-breaking spaces, zero-width chars) before matching
- PHC: 23 → 17 specialties | PHSA: 52 → 43 | FHA: 49 → 32

---

## 2026-04-09 — v3 Vibrant Premium Redesign (all 7 dashboards)

### Changed — Visual overhaul
- **Scorecards**: Colorful gradient icon squares (teal/amber/purple) with bold dark numbers on white cards
- **Color palette**: Vibrant multi-color (`#2E7D8C`, `#48b5c4`, `#f59e4f`, `#7c5cbf`, `#e85d75`, `#4ecdc4`, etc.)
- **Background**: Clean `#f0f5f7` with white cards for sharp contrast
- **Charts**: Richer donut colors, gradient teal bar chart, no center text in donut
- **Section titles**: Line-through divider style
- **Filters**: Clean bordered inputs, solid teal reset button

### Changed — Table complete redesign
- Circular avatar initials with rotating colors per row
- Bold provider names with avatar beside them
- Teal rounded specialty pills (badges)
- Muted gray email text
- Light header with uppercase labels and teal underline (replaces dark gradient header)
- Subtle row dividers instead of heavy borders

### Added — Executive summary banner (all dashboards)
- Auto-generated one-liner: top specialty + % + vendor count + top 3
- Updates dynamically with filter changes

### Added — Animated count-up scorecards (all dashboards)
- Numbers animate from 0 to final value on page load (600ms eased)

### Removed — Donut center text
- Was showing sum of top 10 slices, not total — caused mismatch with scorecard total

### QA Results (all 7 dashboards verified)
| Dashboard | Providers | Header/Scorecard Match | Avatars | Specialty Pills |
|-----------|-----------|----------------------|---------|-----------------|
| PHSA | 246 | Yes | 246 | 243 |
| PHC | 47 | Yes | 47 | 45 |
| VCH | 204 | Yes | 204 | OK |
| FHA | 186 | Yes | 186 | OK |
| VIHA | 25 | Yes | 25 | OK |
| IH | 40 | Yes | 40 | OK |
| NH | 9 | Yes | 9 | OK |

---

## 2026-04-09

### Added — Local caching for instant load on repeat visits
- Dashboard data is cached in `localStorage` after first successful load
- On return visits, cached data renders immediately while fresh data fetches in background
- Header shows "(updating...)" indicator while stale cache is displayed
- If live fetch fails but cache exists, dashboard still shows last known data

### Added — Parallel data prefetch
- Data fetch now starts in `<head>` immediately, running in parallel with Chart.js CDN download
- Added `preconnect` and `dns-prefetch` hints for `cdn.jsdelivr.net` and `script.google.com`
- Reduces perceived load time by ~1-3 seconds on first visit

### Fixed — Record count mismatch between header and scorecards
- Header "Last refreshed" line was showing raw API count (pre-deduplication)
- Scorecards showed post-dedup count, causing a mismatch (e.g., 248 vs 246 on PHSA)
- Both now use the deduplicated count consistently

### Added — DOCUMENTATION.md
- Comprehensive documentation covering architecture, data flow, file structure, deployment, maintenance, and troubleshooting

### QA Results (all 7 dashboards verified)
| Dashboard | Providers | Header/Scorecard Match |
|-----------|-----------|----------------------|
| PHSA | 246 | Yes |
| PHC | 47 | Yes |
| VCH | 204 | Yes |
| FHA | 186 | Yes |
| VIHA | 25 | Yes |
| IH | 40 | Yes |
| NH | 9 | Yes |
