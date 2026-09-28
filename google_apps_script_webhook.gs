/**
 * ============================================================================
 * GOOGLE APPS SCRIPT WEBHOOK: ORBIT GIZI INDEKS TRANSFORMASI
 * ============================================================================
 * Petunjuk Pemasangan:
 * 1. Buka Google Sheet Master Anda (Akun: properwahyu294@gmail.com).
 * 2. Klik menu "Ekstensi" (Extensions) > "Apps Script".
 * 3. Hapus semua kode yang ada di editor, lalu Tempel (Paste) seluruh kode ini.
 * 4. Klik tombol "Simpan" (ikon disket).
 * 5. Klik tombol biru "Terapkan" (Deploy) di kanan atas > "Penerapan baru" (New deployment).
 * 6. Pilih jenis: "Aplikasi web" (Web app).
 * 7. Konfigurasi:
 *    - Deskripsi: Webhook Orbit Gizi Otomatis
 *    - Jalankan sebagai (Execute as): Saya (properwahyu294@gmail.com)
 *    - Yang memiliki akses (Who has access): Siapa saja (Anyone)
 * 8. Klik "Terapkan" (Deploy) dan berikan izin akses (Authorize access).
 * 9. Salin URL Aplikasi Web (Webhook URL) yang dihasilkan, lalu masukkan ke menu
 *    Pengaturan Webhook di aplikasi Orbit Gizi.
 * ============================================================================
 */

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var payload = JSON.parse(rawData);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Pastikan semua tab sheet yang dibutuhkan sudah tersedia
    ensureTabsExist(ss);

    var action = payload.action || "sync_all";
    var result = { success: true, timestamp: new Date().toISOString() };

    if (action === "save_beneficiary") {
      saveSingleBeneficiary(ss, payload.data);
      result.message = "Data sasaran berhasil disimpan ke Google Sheet!";
    } else if (action === "delete_beneficiary") {
      deleteSingleBeneficiary(ss, payload.id);
      result.message = "Data sasaran berhasil dihapus dari Google Sheet!";
    } else if (action === "save_ibu_hamil") {
      saveSingleIbuHamil(ss, payload.data);
      result.message = "Data Ibu Hamil berhasil disimpan ke Google Sheet!";
    } else if (action === "delete_ibu_hamil") {
      deleteSingleIbuHamil(ss, payload.id);
      result.message = "Data Ibu Hamil berhasil dihapus dari Google Sheet!";
    } else if (action === "save_ibu_menyusui") {
      saveSingleIbuMenyusui(ss, payload.data);
      result.message = "Data Ibu Menyusui berhasil disimpan ke Google Sheet!";
    } else if (action === "delete_ibu_menyusui") {
      deleteSingleIbuMenyusui(ss, payload.id);
      result.message = "Data Ibu Menyusui berhasil dihapus dari Google Sheet!";
    } else {
      // Sync all full payload
      syncAllData(ss, payload);
      result.message = "Semua data berhasil disinkronkan secara menyeluruh ke Google Sheet!";
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var bens = readBeneficiaries(ss);
    var ibuHamil = readIbuHamil(ss);
    var ibuMenyusui = readIbuMenyusui(ss);
    var catatanTimbang = readCatatanTimbang(ss);

    var response = {
      success: true,
      beneficiaries: bens,
      ibuHamil: ibuHamil,
      ibuMenyusui: ibuMenyusui,
      catatanTimbang: catatanTimbang
    };

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function ensureTabsExist(ss) {
  var required = [
    "Ringkasan Indeks",
    "Data Desa",
    "Daftar Wilayah",
    "Penerima MBG",
    "Ibu Hamil",
    "Ibu Menyusui",
    "Catatan Timbang",
    "Analitik Pengunjung",
    "Audit Log Operator"
  ];
  
  required.forEach(function(title) {
    if (!ss.getSheetByName(title)) {
      ss.insertSheet(title);
    }
  });
}

function syncAllData(ss, payload) {
  // 1. Penerima MBG
  if (Array.isArray(payload.beneficiaries)) {
    var sheetMbg = ss.getSheetByName("Penerima MBG");
    if (sheetMbg) {
      sheetMbg.clear();
      var mbgRows = [
        ["ID", "Nama Beneficiary", "Nama Orang Tua/Wali", "NIK", "Gender", "Usia", "Tanggal Lahir", "Kategori", "Propinsi", "Kabupaten", "Puskesmas", "Kelurahan", "Dusun", "Posyandu", "Status Kunjungan", "Wajib Kunjungan Rumah", "Menerima MBG", "Menerima PMT", "Petugas Desa Hadir", "Petugas Posyandu Hadir", "Stakeholder Kolaborasi", "Catatan"]
      ];
      
      payload.beneficiaries.forEach(function(b) {
        var attendance = b.attendanceStatus || "Mengunjungi Posyandu";
        var needsVisit = attendance === "Tidak Mengunjungi" ? "YA (WAJIB KUNJUNGAN RUMAH)" : "TIDAK";
        var stakeholders = (Array.isArray(b.stakeholdersHadir) && b.stakeholdersHadir.length > 0)
          ? b.stakeholdersHadir.join(", ")
          : "Petugas Desa, Kader Posyandu, Puskesmas";
          
        mbgRows.push([
          b.id || "-",
          b.name || "-",
          b.parentName || "-",
          b.nik || "-",
          b.gender || "Laki-laki",
          b.age || "-",
          b.birthDate || "-",
          b.category || "Balita",
          (b.location && b.location.propinsi) || "Nusa Tenggara Timur",
          (b.location && b.location.kabupaten) || "Kabupaten Nagekeo",
          (b.location && b.location.puskesmas) || "-",
          (b.location && b.location.kelurahan) || "-",
          (b.location && b.location.dusun) || "-",
          (b.location && b.location.posyandu) || "-",
          attendance,
          needsVisit,
          b.isReceivedMBG ? "YA" : "TIDAK",
          b.isReceivedPMT !== false ? "YA" : "TIDAK",
          b.isPetugasDesaHadir !== false ? "YA" : "TIDAK",
          b.isPetugasPosyanduHadir !== false ? "YA" : "TIDAK",
          stakeholders,
          b.notes || "-"
        ]);
      });
      
      if (mbgRows.length > 0) {
        sheetMbg.getRange(1, 1, mbgRows.length, mbgRows[0].length).setValues(mbgRows);
      }
    }
  }

  // 2. Ibu Hamil
  if (Array.isArray(payload.ibuHamil)) {
    var sheetHamil = ss.getSheetByName("Ibu Hamil");
    if (sheetHamil) {
      sheetHamil.clear();
      var hamilRows = [
        ["ID", "Nama Ibu", "Umur", "NIK", "Alamat", "Puskesmas", "Kelurahan", "Dusun", "Posyandu", "Usia Kehamilan", "Catatan"]
      ];
      payload.ibuHamil.forEach(function(h) {
        hamilRows.push([
          h.id || "-",
          h.namaIbu || "-",
          h.umur || 0,
          h.nik || "-",
          h.alamat || "-",
          h.puskesmas || "-",
          h.kelurahan || "-",
          h.dusun || "-",
          h.posyandu || "-",
          h.usiaKehamilan || 0,
          h.catatan || "-"
        ]);
      });
      if (hamilRows.length > 0) {
        sheetHamil.getRange(1, 1, hamilRows.length, hamilRows[0].length).setValues(hamilRows);
      }
    }
  }

  // 3. Ibu Menyusui
  if (Array.isArray(payload.ibuMenyusui)) {
    var sheetMenyusui = ss.getSheetByName("Ibu Menyusui");
    if (sheetMenyusui) {
      sheetMenyusui.clear();
      var menyusuiRows = [
        ["ID", "Nama Ibu", "Umur", "NIK", "Alamat", "Puskesmas", "Kelurahan", "Dusun", "Posyandu", "Nama Bayi", "Catatan"]
      ];
      payload.ibuMenyusui.forEach(function(m) {
        menyusuiRows.push([
          m.id || "-",
          m.namaIbu || "-",
          m.umur || 0,
          m.nik || "-",
          m.alamat || "-",
          m.puskesmas || "-",
          m.kelurahan || "-",
          m.dusun || "-",
          m.posyandu || "-",
          m.bayiNama || "-",
          m.catatan || "-"
        ]);
      });
      if (menyusuiRows.length > 0) {
        sheetMenyusui.getRange(1, 1, menyusuiRows.length, menyusuiRows[0].length).setValues(menyusuiRows);
      }
    }
  }

  // 4. Catatan Timbang
  var sheetTimbang = ss.getSheetByName("Catatan Timbang");
  if (sheetTimbang) {
    var timbangRows = [
      ["ID Penerima", "Nama", "Kategori", "Puskesmas", "Desa / Kelurahan", "Dusun", "Posyandu", "Periode", "Berat (kg)", "Tinggi (cm)", "Status Gizi", "Waktu Pengukuran"]
    ];

    var processTimbang = function(list, defaultCat) {
      if (!Array.isArray(list)) return;
      list.forEach(function(item) {
        var pusk = (item.location && item.location.puskesmas) || item.puskesmas || "-";
        var kel = (item.location && item.location.kelurahan) || item.kelurahan || "-";
        var dusun = (item.location && item.location.dusun) || item.dusun || "-";
        var posy = (item.location && item.location.posyandu) || item.posyandu || "-";
        var id = item.id || "-";
        var name = item.name || item.namaIbu || "-";
        var cat = item.category || defaultCat || "Balita";

        if (Array.isArray(item.weightRecords) && item.weightRecords.length > 0) {
          item.weightRecords.forEach(function(rec) {
            timbangRows.push([
              id,
              name,
              cat,
              pusk,
              kel,
              dusun,
              posy,
              rec.period || "Agustus 2026",
              rec.weightKg != null ? rec.weightKg : "-",
              rec.heightCm != null ? rec.heightCm : "-",
              rec.statusGizi || "Normal",
              rec.measuredAt || new Date().toISOString().split("T")[0]
            ]);
          });
        }
      });
    };

    if (Array.isArray(payload.beneficiaries)) processTimbang(payload.beneficiaries, "Balita");
    if (Array.isArray(payload.ibuHamil)) processTimbang(payload.ibuHamil, "Ibu Hamil");
    if (Array.isArray(payload.ibuMenyusui)) processTimbang(payload.ibuMenyusui, "Ibu Menyusui");

    sheetTimbang.clear();
    if (timbangRows.length > 0) {
      sheetTimbang.getRange(1, 1, timbangRows.length, timbangRows[0].length).setValues(timbangRows);
    }
  }
}

function saveSingleBeneficiary(ss, ben) {
  if (!ben || !ben.id) return;
  var sheet = ss.getSheetByName("Penerima MBG");
  if (!sheet) return;

  var lastRow = sheet.getLastRow();
  var foundRow = -1;

  if (lastRow > 1) {
    var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(ben.id)) {
        foundRow = i + 2;
        break;
      }
    }
  }

  var attendance = ben.attendanceStatus || "Mengunjungi Posyandu";
  var needsVisit = attendance === "Tidak Mengunjungi" ? "YA (WAJIB KUNJUNGAN RUMAH)" : "TIDAK";
  var stakeholders = (Array.isArray(ben.stakeholdersHadir) && ben.stakeholdersHadir.length > 0)
    ? ben.stakeholdersHadir.join(", ")
    : "Petugas Desa, Kader Posyandu, Puskesmas";

  var rowData = [
    ben.id,
    ben.name || "-",
    ben.parentName || "-",
    ben.nik || "-",
    ben.gender || "Laki-laki",
    ben.age || "-",
    ben.birthDate || "-",
    ben.category || "Balita",
    (ben.location && ben.location.propinsi) || "Nusa Tenggara Timur",
    (ben.location && ben.location.kabupaten) || "Kabupaten Nagekeo",
    (ben.location && ben.location.puskesmas) || "-",
    (ben.location && ben.location.kelurahan) || "-",
    (ben.location && ben.location.dusun) || "-",
    (ben.location && ben.location.posyandu) || "-",
    attendance,
    needsVisit,
    ben.isReceivedMBG ? "YA" : "TIDAK",
    ben.isReceivedPMT !== false ? "YA" : "TIDAK",
    ben.isPetugasDesaHadir !== false ? "YA" : "TIDAK",
    ben.isPetugasPosyanduHadir !== false ? "YA" : "TIDAK",
    stakeholders,
    ben.notes || "-"
  ];

  if (foundRow > 0) {
    sheet.getRange(foundRow, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  // Update Catatan Timbang if records present
  if (Array.isArray(ben.weightRecords) && ben.weightRecords.length > 0) {
    var sheetTimbang = ss.getSheetByName("Catatan Timbang");
    if (sheetTimbang) {
      ben.weightRecords.forEach(function(rec) {
        sheetTimbang.appendRow([
          ben.id,
          ben.name || "-",
          ben.category || "Balita",
          (ben.location && ben.location.puskesmas) || "-",
          (ben.location && ben.location.kelurahan) || "-",
          (ben.location && ben.location.dusun) || "-",
          (ben.location && ben.location.posyandu) || "-",
          rec.period || "Agustus 2026",
          rec.weightKg != null ? rec.weightKg : "-",
          rec.heightCm != null ? rec.heightCm : "-",
          rec.statusGizi || "Normal",
          rec.measuredAt || new Date().toISOString().split("T")[0]
        ]);
      });
    }
  }
}

function deleteSingleBeneficiary(ss, id) {
  var sheet = ss.getSheetByName("Penerima MBG");
  if (!sheet) return;
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;

  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = ids.length - 1; i >= 0; i--) {
    if (String(ids[i][0]) === String(id)) {
      sheet.deleteRow(i + 2);
    }
  }
}

function saveSingleIbuHamil(ss, h) {
  if (!h || !h.id) return;
  var sheet = ss.getSheetByName("Ibu Hamil");
  if (!sheet) return;
  var rowData = [
    h.id,
    h.namaIbu || "-",
    h.umur || 0,
    h.nik || "-",
    h.alamat || "-",
    h.puskesmas || "-",
    h.kelurahan || "-",
    h.dusun || "-",
    h.posyandu || "-",
    h.usiaKehamilan || 0,
    h.catatan || "-"
  ];
  sheet.appendRow(rowData);
}

function deleteSingleIbuHamil(ss, id) {
  var sheet = ss.getSheetByName("Ibu Hamil");
  if (!sheet) return;
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = ids.length - 1; i >= 0; i--) {
    if (String(ids[i][0]) === String(id)) {
      sheet.deleteRow(i + 2);
    }
  }
}

function saveSingleIbuMenyusui(ss, m) {
  if (!m || !m.id) return;
  var sheet = ss.getSheetByName("Ibu Menyusui");
  if (!sheet) return;
  var rowData = [
    m.id,
    m.namaIbu || "-",
    m.umur || 0,
    m.nik || "-",
    m.alamat || "-",
    m.puskesmas || "-",
    m.kelurahan || "-",
    m.dusun || "-",
    m.posyandu || "-",
    m.bayiNama || "-",
    m.catatan || "-"
  ];
  sheet.appendRow(rowData);
}

function deleteSingleIbuMenyusui(ss, id) {
  var sheet = ss.getSheetByName("Ibu Menyusui");
  if (!sheet) return;
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = ids.length - 1; i >= 0; i--) {
    if (String(ids[i][0]) === String(id)) {
      sheet.deleteRow(i + 2);
    }
  }
}

function readBeneficiaries(ss) {
  var sheet = ss.getSheetByName("Penerima MBG");
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  var values = sheet.getRange(2, 1, lastRow - 1, 22).getValues();
  return values.filter(function(r) { return r[1] && r[1] !== "-"; }).map(function(r) {
    return {
      id: r[0],
      name: r[1],
      parentName: r[2],
      nik: r[3],
      gender: r[4],
      age: r[5],
      birthDate: r[6],
      category: r[7],
      location: {
        propinsi: r[8],
        kabupaten: r[9],
        puskesmas: r[10],
        kelurahan: r[11],
        dusun: r[12],
        posyandu: r[13]
      },
      attendanceStatus: r[14],
      isReceivedMBG: r[16] === "YA",
      isReceivedPMT: r[17] === "YA",
      isPetugasDesaHadir: r[18] === "YA",
      isPetugasPosyanduHadir: r[19] === "YA",
      notes: r[21]
    };
  });
}

function readIbuHamil(ss) {
  var sheet = ss.getSheetByName("Ibu Hamil");
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  var values = sheet.getRange(2, 1, lastRow - 1, 11).getValues();
  return values.filter(function(r) { return r[1] && r[1] !== "-"; }).map(function(r) {
    return {
      id: r[0],
      namaIbu: r[1],
      umur: parseInt(r[2]) || 0,
      nik: r[3],
      alamat: r[4],
      puskesmas: r[5],
      kelurahan: r[6],
      dusun: r[7],
      posyandu: r[8],
      usiaKehamilan: parseInt(r[9]) || 0,
      catatan: r[10]
    };
  });
}

function readIbuMenyusui(ss) {
  var sheet = ss.getSheetByName("Ibu Menyusui");
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  var values = sheet.getRange(2, 1, lastRow - 1, 11).getValues();
  return values.filter(function(r) { return r[1] && r[1] !== "-"; }).map(function(r) {
    return {
      id: r[0],
      namaIbu: r[1],
      umur: parseInt(r[2]) || 0,
      nik: r[3],
      alamat: r[4],
      puskesmas: r[5],
      kelurahan: r[6],
      dusun: r[7],
      posyandu: r[8],
      bayiNama: r[9],
      catatan: r[10]
    };
  });
}

function readCatatanTimbang(ss) {
  var sheet = ss.getSheetByName("Catatan Timbang");
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  return sheet.getRange(2, 1, lastRow - 1, 12).getValues();
}
