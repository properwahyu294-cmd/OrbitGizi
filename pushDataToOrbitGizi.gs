function pushDataToOrbitGizi() {
  var apiUrl = "https://ais-dev-oc3fo343i5ewk25s674wyk-306133081825.asia-southeast1.run.app/api/beneficiaries/batch";
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetNames = ["Penerima MBG", "Ibu Hamil", "Ibu Menyusui"];
  var allData = {};

  sheetNames.forEach(function(sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) return;
    
    var range = sheet.getRange("A2:T" + sheet.getLastRow());
    var values = range.getValues();
    
    allData[sheetName] = values.map(function(row) {
      return {
        id: row[0],
        name: row[1],
        parentName: row[2],
        nik: row[3],
        gender: row[4],
        age: row[5],
        category: row[6],
        weightNotes: row[20] // Catatan (kolom ke-21)
      };
    });
  });
  
  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(allData)
  };
  
  UrlFetchApp.fetch(apiUrl, options);
}
