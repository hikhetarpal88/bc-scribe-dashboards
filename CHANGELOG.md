# Changelog — BC Scribe Self-Pay Program Dashboards

All notable changes to these dashboards are documented here.

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
