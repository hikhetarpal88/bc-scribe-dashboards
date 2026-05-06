// =============================================================
// Google Apps Script — BC Scribe Self-Pay Dashboard Proxy
// =============================================================
// Deploy as: Web App → Execute as ME → Anyone can access
// This script sits between the HTML dashboards and the master
// Google Sheet. It filters data server-side so that each
// Health Authority dashboard only ever receives its own rows.
// The Sheet ID never leaves Google's servers.
// =============================================================

var SHEET_ID = '1gYbiE15xltGZeHkNzgyF8iJCmBko75IauWIUySouLvc';
var SHEET_NAME = 'Sheet1';
var VALID_HAS = ['PHSA', 'PHC', 'VCH', 'FHA', 'VIHA', 'IH', 'NH'];
var CACHE_TTL_SECONDS = 60; // ScriptCache TTL — warm responses drop from ~3-5s to ~200ms

function doGet(e) {
  var ha = (e.parameter.ha || '').toUpperCase().trim();

  // --- Validate -------------------------------------------------------
  if (!ha) {
    return _jsonObj({ error: "Missing 'ha' parameter. Use ?ha=PHC etc." });
  }
  if (VALID_HAS.indexOf(ha) === -1) {
    return _jsonObj({ error: "Invalid HA: " + ha + ". Valid values: " + VALID_HAS.join(', ') });
  }

  // --- Serve from cache if warm --------------------------------------
  var cache = CacheService.getScriptCache();
  var cacheKey = 'ha_v1_' + ha;
  try {
    var cached = cache.get(cacheKey);
    if (cached) return _jsonString(cached);
  } catch (err) { /* CacheService can fail under load — just bypass */ }

  // --- Read sheet -----------------------------------------------------
  try {
    var ss    = SpreadsheetApp.openById(SHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);
    var data  = sheet.getDataRange().getValues();
  } catch (err) {
    return _jsonObj({ error: "Could not read sheet: " + err.message });
  }

  // --- Map headers ----------------------------------------------------
  var headers = data[0].map(function(h) { return String(h).trim(); });
  var haCol   = headers.indexOf('Health Authority');

  if (haCol === -1) {
    return _jsonObj({ error: "Column 'Health Authority' not found in sheet." });
  }

  // --- Filter rows ----------------------------------------------------
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][haCol]).trim().toUpperCase() === ha) {
      var row = {};
      for (var j = 0; j < headers.length; j++) {
        var val = data[i][j];
        // Convert Date objects to ISO strings for JSON
        if (val instanceof Date) {
          row[headers[j]] = val.toISOString();
        } else {
          row[headers[j]] = val;
        }
      }
      rows.push(row);
    }
  }

  // --- Serialize + cache + return -------------------------------------
  var body = JSON.stringify({
    ha: ha,
    count: rows.length,
    timestamp: new Date().toISOString(),
    data: rows
  });
  // CacheService.put has a 100KB value limit — skip cache for oversize payloads.
  if (body.length < 95000) {
    try { cache.put(cacheKey, body, CACHE_TTL_SECONDS); } catch (err) {}
  }
  return _jsonString(body);
}

function _jsonObj(obj) { return _jsonString(JSON.stringify(obj)); }

function _jsonString(s) {
  return ContentService
    .createTextOutput(s)
    .setMimeType(ContentService.MimeType.JSON);
}
