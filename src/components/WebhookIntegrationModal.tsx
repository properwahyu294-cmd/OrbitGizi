import React, { useState, useEffect } from "react";
import { 
  Webhook, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Send, 
  RefreshCw, 
  ExternalLink, 
  X, 
  Code, 
  Zap, 
  ShieldCheck, 
  Link as LinkIcon,
  HelpCircle
} from "lucide-react";
import { getWebhookConfigApi, updateWebhookConfigApi, sendWebhookApi, pullWebhookApi } from "../lib/dataService";

interface WebhookIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  currentUserEmail: string;
  onDataRefreshed?: () => void;
}

export const WebhookIntegrationModal: React.FC<WebhookIntegrationModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  currentUserEmail,
  onDataRefreshed
}) => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [savedUrl, setSavedUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [activeTab, setActiveTab] = useState<"SETTINGS" | "SCRIPT" | "GUIDE">("SETTINGS");

  useEffect(() => {
    if (isOpen) {
      getWebhookConfigApi().then(cfg => {
        if (cfg?.webhookUrl) {
          setWebhookUrl(cfg.webhookUrl);
          setSavedUrl(cfg.webhookUrl);
        }
      });
      setTestStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTestStatus(null);
    try {
      const res = await updateWebhookConfigApi(webhookUrl);
      setSavedUrl(res.webhookUrl);
      setTestStatus({
        success: true,
        message: "URL Webhook Google Apps Script berhasil disimpan! Data input baru akan otomatis dikirim ke Google Sheet."
      });
    } catch (err: any) {
      setTestStatus({
        success: false,
        message: "Gagal menyimpan Webhook: " + err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestSendWebhook = async () => {
    setLoading(true);
    setTestStatus(null);
    try {
      const res = await sendWebhookApi({
        action: "test_connection",
        source: "Orbit Gizi UI",
        senderEmail: currentUserEmail || "properwahyu294@gmail.com",
        timestamp: new Date().toISOString()
      });
      setTestStatus({
        success: true,
        message: `Koneksi Webhook Berhasil (200 OK)! Google Sheet merespon dengan baik: ${res.message || "Terkirim"}`
      });
    } catch (err: any) {
      setTestStatus({
        success: false,
        message: "Uji kirim Webhook gagal: " + err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePullFromWebhook = async () => {
    setLoading(true);
    setTestStatus(null);
    try {
      const res = await pullWebhookApi();
      setTestStatus({
        success: true,
        message: "Berhasil menarik data terbaru dari Google Sheet via Webhook!"
      });
      if (onDataRefreshed) onDataRefreshed();
    } catch (err: any) {
      setTestStatus({
        success: false,
        message: "Gagal menarik data via Webhook: " + err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const appsScriptCode = `/**
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
}`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 text-white max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Webhook className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black text-white">Integrasi Webhook Google Sheets</h3>
                <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black rounded-full uppercase">
                  Otomatis doPost
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Kirim dan terima data langsung ke spreadsheet tanpa autentikasi manual berulang</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab("SETTINGS")}
            className={`flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              activeTab === "SETTINGS" ? "bg-emerald-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            }`}
          >
            <Zap className="h-4 w-4" />
            <span>Pengaturan Webhook</span>
          </button>
          <button
            onClick={() => setActiveTab("SCRIPT")}
            className={`flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              activeTab === "SCRIPT" ? "bg-emerald-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            }`}
          >
            <Code className="h-4 w-4" />
            <span>Kode Apps Script</span>
          </button>
          <button
            onClick={() => setActiveTab("GUIDE")}
            className={`flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              activeTab === "GUIDE" ? "bg-emerald-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            <span>Panduan Pasang</span>
          </button>
        </div>

        {/* Status Messages */}
        {testStatus && (
          <div className={`p-3.5 rounded-xl border text-xs font-bold flex items-center space-x-2.5 ${
            testStatus.success 
              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" 
              : "bg-rose-500/20 border-rose-500/40 text-rose-300"
          }`}>
            {testStatus.success ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
            )}
            <span className="leading-relaxed">{testStatus.message}</span>
          </div>
        )}

        {/* TAB 1: SETTINGS */}
        {activeTab === "SETTINGS" && (
          <div className="space-y-5">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-black uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4" />
                <span>Koneksi Multi-Admin Terpusat</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Dengan Webhook Google Apps Script, setiap data yang diinput oleh <strong>Admin mana pun</strong> (baik properwahyu294@gmail.com, bidangplp71@gmail.com, atau ociendema@gmail.com) akan <strong>langsung masuk ke Google Sheet yang sama</strong> secara otomatis di latar belakang melalui fungsi <code className="text-emerald-300 font-mono">doPost</code>.
              </p>
            </div>

            <form onSubmit={handleSaveWebhook} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  URL Webhook Google Apps Script (Web App URL):
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <LinkIcon className="h-4 w-4" />
                  </div>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl text-white text-xs font-mono outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Dapatkan URL ini dari menu <strong>Deploy &gt; New deployment &gt; Web app</strong> di Google Apps Script sheet Anda.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleTestSendWebhook}
                    disabled={loading || !webhookUrl}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/30 transition-all cursor-pointer flex items-center space-x-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>Uji Kirim (doPost)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePullFromWebhook}
                    disabled={loading || !webhookUrl}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-teal-300 font-bold text-xs rounded-xl border border-teal-500/30 transition-all cursor-pointer flex items-center space-x-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    <span>Tarik Data (doGet)</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center space-x-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Simpan Webhook</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: SCRIPT CODE */}
        {activeTab === "SCRIPT" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-300">
                Salin seluruh kode Apps Script di bawah ini, lalu tempel di Google Sheet Anda:
              </p>
              <button
                onClick={handleCopyScript}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center space-x-2 shrink-0"
              >
                {copiedScript ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copiedScript ? "Tersalin!" : "Salin Kode Lengkap"}</span>
              </button>
            </div>

            <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-[11px] font-mono text-emerald-300 max-h-72 overflow-y-auto leading-relaxed select-all">
              {appsScriptCode}
            </pre>
          </div>
        )}

        {/* TAB 3: STEP BY STEP GUIDE */}
        {activeTab === "GUIDE" && (
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-sm font-black text-white flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">1</span>
                <span>Buka Google Sheet Sumber</span>
              </h4>
              <p className="text-slate-400 pl-7">
                Buka Google Sheet Master dengan akun <strong>properwahyu294@gmail.com</strong> (atau akun pemilik sheet).
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-sm font-black text-white flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">2</span>
                <span>Buka Apps Script</span>
              </h4>
              <p className="text-slate-400 pl-7">
                Klik menu atas: <strong>Ekstensi (Extensions) &gt; Apps Script</strong>. Hapus kode bawaan dan tempel kode dari tab <em>Kode Apps Script</em>.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-sm font-black text-white flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">3</span>
                <span>Terapkan sebagai Web App (Penting!)</span>
              </h4>
              <div className="text-slate-400 pl-7 space-y-1.5">
                <p>Klik tombol biru <strong>Terapkan (Deploy) &gt; Penerapan baru (New deployment)</strong>:</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  <li>Pilih jenis: <strong>Aplikasi web (Web app)</strong></li>
                  <li>Jalankan sebagai: <strong>Saya (properwahyu294@gmail.com)</strong></li>
                  <li>Yang memiliki akses: <strong>Siapa saja (Anyone)</strong></li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-sm font-black text-white flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">4</span>
                <span>Tempel URL di Aplikasi Orbit Gizi</span>
              </h4>
              <p className="text-slate-400 pl-7">
                Salin Web App URL yang berakhiran <code className="text-emerald-400 font-mono">/exec</code> lalu tempel di tab <em>Pengaturan Webhook</em> dan klik <strong>Simpan Webhook</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Status: {savedUrl ? "Webhook Aktif Terhubung" : "Webhook Belum Diatur"}</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
