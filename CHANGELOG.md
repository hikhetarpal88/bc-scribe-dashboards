# Changelog — BC Scribe Self-Pay Program Dashboards

All notable changes to these dashboards are documented here.

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
