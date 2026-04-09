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

function doGet(e) {
  var ha = (e.parameter.ha || '').toUpperCase().trim();

  // --- Validate -------------------------------------------------------
  if (!ha) {
    return _json({ error: "Missing 'ha' parameter. Use ?ha=PHC etc." });
  }
  if (VALID_HAS.indexOf(ha) === -1) {
    return _json({ error: "Invalid HA: " + ha + ". Valid values: " + VALID_HAS.join(', ') });
  }

  // --- Read sheet -----------------------------------------------------
  try {
    var ss    = SpreadsheetApp.openById(SHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);
    var data  = sheet.getDataRange().getValues();
  } catch (err) {
    return _json({ error: "Could not read sheet: " + err.message });
  }

  // --- Map headers ----------------------------------------------------
  var headers = data[0].map(function(h) { return String(h).trim(); });
  var haCol   = headers.indexOf('Health Authority');

  if (haCol === -1) {
    return _json({ error: "Column 'Health Authority' not found in sheet." });
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

  // --- Return ---------------------------------------------------------
  return _json({
    ha: ha,
    count: rows.length,
    timestamp: new Date().toISOString(),
    data: rows
  });
}

function _json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
