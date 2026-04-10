# Changelog — BC Scribe Self-Pay Program Dashboards

All notable changes to these dashboards are documented here.

---

## 2026-04-09 — v4 Progress Bars + Logo Containers (all 7 dashboards)

### Changed — Specialty chart: doughnut → progress bars
- Replaced cluttered doughnut chart (17+ slices) with gradient progress bars
- Each bar shows: specialty name, colored fill proportional to count, count badge, percentage
- 12 unique gradient colors cycling through teal, orange, purple, pink, green, gold, indigo, cyan
- Top 10 specialties displayed; footer shows "Top 10 of N specialties shown"
- Doughnut chart retained for vendor breakdown (ideal for 2-3 items)

### Changed — Logo integration: frosted glass pills
- Logos displayed in original brand colors on semi-transparent frosted glass pills
- `backdrop-filter: blur(8px)` for subtle glass effect against teal header
- No rigid containers — pills auto-size to each logo's aspect ratio
- VCH logo cropped from 480×480 square to 480×250 wide (removed excess whitespace)
- All logos now render at consistent 38px height with 16px horizontal padding

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
