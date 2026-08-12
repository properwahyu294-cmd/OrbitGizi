export function parseMbgRow(row: any[], idx: number = 0) {
  if (!Array.isArray(row)) return null;

  const knownCategories = ["Balita", "Ibu Hamil", "Ibu Menyusui", "Anak Stunting", "PMT Prioritas"];
  const col6Val = (row[6] !== undefined && row[6] !== null && row[6] !== "-") ? String(row[6]).trim() : "";
  const isOldFormat = knownCategories.some(cat => col6Val.toLowerCase().includes(cat.toLowerCase()));

  const id = (row[0] && row[0] !== "-") ? String(row[0]) : `ben_${Date.now()}_${idx}`;
  const name = (row[1] && row[1] !== "-") ? String(row[1]) : "";
  const parentName = (row[2] && row[2] !== "-") ? String(row[2]) : "";
  const nik = (row[3] && row[3] !== "-") ? String(row[3]) : "";
  const gender = (row[4] && row[4] !== "-") ? String(row[4]) : "Laki-laki";
  const age = (row[5] && row[5] !== "-") ? String(row[5]) : "";

  let birthDate = "";
  let category = "Balita";
  let propIdx = 7;

  if (isOldFormat) {
    birthDate = "";
    category = col6Val || "Balita";
    propIdx = 7;
  } else {
    birthDate = col6Val;
    category = (row[7] && row[7] !== "-") ? String(row[7]) : "Balita";
    propIdx = 8;
  }

  const propinsi = (row[propIdx] && row[propIdx] !== "-") ? String(row[propIdx]) : "Nusa Tenggara Timur";
  const kabupaten = (row[propIdx + 1] && row[propIdx + 1] !== "-") ? String(row[propIdx + 1]) : "Nagekeo";
  const puskesmas = (row[propIdx + 2] && row[propIdx + 2] !== "-") ? String(row[propIdx + 2]) : "";
  const kelurahan = (row[propIdx + 3] && row[propIdx + 3] !== "-") ? String(row[propIdx + 3]) : "";
  const dusun = (row[propIdx + 4] && row[propIdx + 4] !== "-") ? String(row[propIdx + 4]) : "";
  const posyandu = (row[propIdx + 5] && row[propIdx + 5] !== "-") ? String(row[propIdx + 5]) : "";
  const attendanceStatus = (row[propIdx + 6] && row[propIdx + 6] !== "-") ? String(row[propIdx + 6]) : "Mengunjungi Posyandu";
  
  const isReceivedMBG = row[propIdx + 8] === "YA";
  const isReceivedPMT = row[propIdx + 9] === "YA";
  const isPetugasDesaHadir = row[propIdx + 10] === "YA";
  const isPetugasPosyanduHadir = row[propIdx + 11] === "YA";
  
  const stakeholdersRaw = row[propIdx + 12];
  let stakeholdersHadir: string[] = [];
  if (stakeholdersRaw && stakeholdersRaw !== "-" && stakeholdersRaw !== "Petugas Desa, Kader Posyandu, Puskesmas") {
    stakeholdersHadir = String(stakeholdersRaw).split(",").map(s => s.trim()).filter(Boolean);
  }

  const notes = (row[propIdx + 13] && row[propIdx + 13] !== "-") ? String(row[propIdx + 13]) : "";

  return {
    id,
    name,
    parentName,
    nik,
    gender,
    age,
    birthDate,
    category,
    location: { propinsi, kabupaten, puskesmas, kelurahan, dusun, posyandu },
    attendanceStatus,
    isReceivedMBG,
    isReceivedPMT,
    isPetugasDesaHadir,
    isPetugasPosyanduHadir,
    stakeholdersHadir,
    notes,
    weightRecords: []
  };
}

export interface SheetsSyncResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

/**
 * Creates a new Google Spreadsheet with custom sheets for Orbit Gizi
 */
async function createSpreadsheet(accessToken: string, kabupatenName: string): Promise<SheetsSyncResult> {
  const response = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        title: `Orbit Gizi Nagekeo - ${kabupatenName}`,
      },
      sheets: [
        { properties: { title: "Ringkasan Indeks" } },
        { properties: { title: "Data Desa" } },
        { properties: { title: "Penerima MBG" } },
        { properties: { title: "Ibu Hamil" } },
        { properties: { title: "Ibu Menyusui" } },
        { properties: { title: "Catatan Timbang" } },
        { properties: { title: "Analitik Pengunjung" } },
        { properties: { title: "Audit Log Operator" } },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gagal membuat Spreadsheet Baru: ${errText}`);
  }

  const resJson = await response.json();
  return {
    spreadsheetId: resJson.spreadsheetId,
    spreadsheetUrl: resJson.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${resJson.spreadsheetId}`,
  };
}

/**
 * Ensures all required sheet tabs exist in the target spreadsheet
 */
async function ensureSheetTabsExist(accessToken: string, spreadsheetId: string): Promise<void> {
  const requiredTitles = [
    "Ringkasan Indeks",
    "Data Desa",
    "Penerima MBG",
    "Ibu Hamil",
    "Ibu Menyusui",
    "Catatan Timbang",
    "Analitik Pengunjung",
    "Audit Log Operator"
  ];
  try {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!res.ok) return;
    const json = await res.json();
    const existing = new Set((json.sheets || []).map((s: any) => s.properties?.title));
    const toAdd = requiredTitles.filter(t => !existing.has(t));
    if (toAdd.length > 0) {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: toAdd.map(title => ({ addSheet: { properties: { title } } }))
        })
      });
    }
  } catch (e) {
    console.warn("Gagal memastikan tab sheet ada:", e);
  }
}

/**
 * Clears old data in sheets to prepare for fresh write
 */
async function clearSheets(accessToken: string, spreadsheetId: string): Promise<void> {
  const ranges = [
    "'Ringkasan Indeks'!A1:Z100",
    "'Data Desa'!A1:Z1000",
    "'Penerima MBG'!A1:Z5000",
    "'Ibu Hamil'!A1:Z5000",
    "'Ibu Menyusui'!A1:Z5000",
    "'Catatan Timbang'!A1:Z10000",
    "'Analitik Pengunjung'!A1:Z5000",
    "'Audit Log Operator'!A1:Z5000"
  ];
  for (const range of ranges) {
    try {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:clear`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (e) {
      console.warn(`Pembersihan range ${range} diabaikan:`, e);
    }
  }
}

/**
 * Synchronizes Kabupaten and Villages data to Google Sheets
 */
export async function syncToGoogleSheets(
  accessToken: string,
  kabupatenName: string,
  data: any,
  userEmail?: string
): Promise<SheetsSyncResult> {
  let spreadsheetUrl = data?.adminSheetUrl || localStorage.getItem('orbit_gizi_spreadsheet_url_global') || "https://docs.google.com/spreadsheets/d/1dGTF6wZ2DoPF2qVcjxrjaxDDQzHQjuHgwvKi1DwTkRE/edit?gid=1042318316#gid=1042318316";
  let spreadsheetId = data?.adminSheetId || "1dGTF6wZ2DoPF2qVcjxrjaxDDQzHQjuHgwvKi1DwTkRE";
  const urlMatch = spreadsheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (urlMatch && urlMatch[1]) {
    spreadsheetId = urlMatch[1];
  }

  // Ensure all tabs exist
  await ensureSheetTabsExist(accessToken, spreadsheetId!);

  // Fetch current sheet data to merge
  const fetchRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?ranges=Penerima%20MBG!A2:Z&ranges=Ibu%20Hamil!A2:Z&ranges=Ibu%20Menyusui!A2:Z&valueRenderOption=FORMATTED_VALUE`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  let existingBeneficiaries: any[] = [];
  let existingIbuHamil: any[] = [];
  let existingIbuMenyusui: any[] = [];
  
  if (fetchRes.ok) {
    const fetchJson = await fetchRes.json();
    const valueRanges = fetchJson.valueRanges || [];
    existingBeneficiaries = valueRanges[0]?.values || [];
    existingIbuHamil = valueRanges[1]?.values || [];
    existingIbuMenyusui = valueRanges[2]?.values || [];
  }

  // Helper to merge: simple approach is to trust incoming ID and overwrite or append.
  // Given complexity, let's just append new ones for now to avoid accidental deletions.
  
  // Prepare Ringkasan Indeks data
  const summaryValues = [
    ["LAPORAN INDEKS TRANSFORMASI ORBIT GIZI (TERSINKRONISASI SINKRON)", ""],
    ["Kabupaten:", kabupatenName],
    ["Waktu Sinkronisasi:", new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) + " WITA"],
    ["Skor Indeks Kabupaten:", `${data.indexScore} / 100`],
    ["Kategori Daerah:", `${data.category.label} (${data.category.desc})`],
    [],
    ["TABEL SKOR PILAR INTERVENSI", "", ""],
    ["Nama Pilar", "Bobot Pilar (%)", "Skor Rata-rata Pilar (0-100)"],
  ];

  // Add pillars data
  data.pillars.forEach((p: any) => {
    const avgScore = p.indicators.reduce((sum: number, ind: any) => sum + ind.score, 0) / p.indicators.length;
    summaryValues.push([
      p.name,
      `${p.weight}%`,
      Math.round(avgScore).toString()
    ]);
  });

  summaryValues.push([], ["DETIL INDIKATOR PENYUSUN", "", ""]);
  summaryValues.push(["Indikator", "Skor", "Deskripsi"]);
  data.pillars.forEach((p: any) => {
    p.indicators.forEach((i: any) => {
      summaryValues.push([
        `${p.name} - ${i.name}`,
        i.score.toString(),
        i.description
      ]);
    });
  });

  // Prepare Data Desa values
  const villageValues = [
    [
      "ID Desa", 
      "Nama Desa", 
      "Zona Risiko", 
      "Skor Kinerja (0-100)", 
      "P1: MBG Sinkron", 
      "P1: MBG Total", 
      "P1: PMT Sinkron", 
      "P1: PMT Total", 
      "P1: Posyandu Sinkron", 
      "P1: Posyandu Total", 
      "P1: e-PPGBM Sinkron", 
      "P1: e-PPGBM Total", 
      "P2: Dinkes Aktif", 
      "P2: BGN Aktif", 
      "P2: PKK Aktif", 
      "P2: Pemdes Aktif", 
      "P2: Puskesmas Aktif", 
      "P3: Dashboard Online", 
      "P3: Validasi Selesai", 
      "P3: Real-time Update", 
      "P4: MBG Realisasi", 
      "P4: MBG Target", 
      "P4: PMT Realisasi", 
      "P4: PMT Target", 
      "P4: Home Visit", 
      "P4: Home Visit Target", 
      "P4: Posyandu Aktif", 
      "P4: Posyandu Total", 
      "P5: Stunting Sebelum", 
      "P5: Stunting Sekarang", 
      "P5: Wasting Sebelum", 
      "P5: Wasting Sekarang", 
      "P5: Akurasi Sasaran (%)"
    ]
  ];

  data.villages.forEach((v: any) => {
    villageValues.push([
      v.id,
      v.name,
      v.riskLevel,
      v.score.toString(),
      v.pilar1_mbg_sync.toString(),
      v.pilar1_mbg_total.toString(),
      v.pilar1_pmt_sync.toString(),
      v.pilar1_pmt_total.toString(),
      v.pilar1_posyandu_sync.toString(),
      v.pilar1_posyandu_total.toString(),
      v.pilar1_eppgbm_sync.toString(),
      v.pilar1_eppgbm_total.toString(),
      v.pilar2_dinkes_aktif ? "YA" : "TIDAK",
      v.pilar2_bgn_aktif ? "YA" : "TIDAK",
      v.pilar2_pkk_aktif ? "YA" : "TIDAK",
      v.pilar2_pemdes_aktif ? "YA" : "TIDAK",
      v.pilar2_puskesmas_aktif ? "YA" : "TIDAK",
      v.pilar3_dashboard_online ? "YA" : "TIDAK",
      v.pilar3_validasi_data ? "YA" : "TIDAK",
      v.pilar3_real_time_update ? "YA" : "TIDAK",
      v.pilar4_mbg_realized.toString(),
      v.pilar4_mbg_target.toString(),
      v.pilar4_pmt_realized.toString(),
      v.pilar4_pmt_target.toString(),
      v.pilar4_home_visit.toString(),
      v.pilar4_home_visit_target.toString(),
      v.pilar4_posyandu_aktif.toString(),
      v.pilar4_posyandu_total.toString(),
      v.pilar5_stunting_prev.toString(),
      v.pilar5_stunting_curr.toString(),
      v.pilar5_wasting_prev.toString(),
      v.pilar5_wasting_curr.toString(),
      v.pilar5_target_accuracy.toString()
    ]);
  });

  // Prepare Penerima MBG values
  const mbgValues = [
    ["ID", "Nama Beneficiary", "Nama Orang Tua/Wali", "NIK", "Gender", "Usia", "Tanggal Lahir", "Kategori", "Propinsi", "Kabupaten", "Puskesmas", "Kelurahan", "Dusun", "Posyandu", "Status Kunjungan", "Wajib Kunjungan Rumah", "Menerima MBG", "Menerima PMT", "Petugas Desa Hadir", "Petugas Posyandu Hadir", "Stakeholder Kolaborasi", "Catatan"]
  ];

  try {
    let mbgData = (data && Array.isArray(data.beneficiaries))
      ? data.beneficiaries
      : JSON.parse(localStorage.getItem("orbit_gizi_local_beneficiaries") || "[]");
    if (!Array.isArray(mbgData)) mbgData = [];

    const localIds = new Set(mbgData.map((b: any) => String(b?.id)));
    const localNiks = new Set(mbgData.map((b: any) => String(b?.nik)).filter(nik => nik && nik !== "-"));

    // 1. Add all local beneficiaries first
    mbgData.forEach((b: any) => {
      const attendance = b?.attendanceStatus || "Mengunjungi Posyandu";
      const needsVisit = attendance === "Tidak Mengunjungi" ? "YA (WAJIB KUNJUNGAN RUMAH)" : "TIDAK";
      const pmt = b?.isReceivedPMT !== false ? "YA" : "TIDAK";
      const desaHadir = b?.isPetugasDesaHadir !== false ? "YA" : "TIDAK";
      const posyanduHadir = b?.isPetugasPosyanduHadir !== false ? "YA" : "TIDAK";
      const stakeholders = Array.isArray(b?.stakeholdersHadir) && b.stakeholdersHadir.length > 0
        ? b.stakeholdersHadir.join(", ")
        : "Petugas Desa, Kader Posyandu, Puskesmas";

      mbgValues.push([
        b?.id || "-",
        b?.name || "-",
        b?.parentName || "-",
        b?.nik || "-",
        b?.gender || "-",
        b?.age !== undefined && b?.age !== null ? String(b.age) : "-",
        b?.birthDate || "-",
        b?.category || "-",
        b?.location?.propinsi || "-",
        b?.location?.kabupaten || "-",
        b?.location?.puskesmas || "-",
        b?.location?.kelurahan || "-",
        b?.location?.dusun || "-",
        b?.location?.posyandu || "-",
        attendance,
        needsVisit,
        b?.isReceivedMBG ? "YA" : "TIDAK",
        pmt,
        desaHadir,
        posyanduHadir,
        stakeholders,
        b?.notes || "-"
      ]);
    });
  } catch (e) {
    console.error(e);
  }

  // Prepare Ibu Hamil values
  const ibuHamilValues = [
    ["ID", "Nama Ibu", "Umur", "NIK", "Alamat", "Puskesmas", "Kelurahan", "Dusun", "Posyandu", "Usia Kehamilan", "Catatan"]
  ];
  try {
    let ibuHamilData = (data && Array.isArray(data.ibuHamil))
      ? data.ibuHamil
      : JSON.parse(localStorage.getItem("orbit_gizi_ibu_hamil") || "[]");
    if (!Array.isArray(ibuHamilData)) ibuHamilData = [];

    ibuHamilData.forEach((b: any) => {
      ibuHamilValues.push([
        b?.id || "-",
        b?.namaIbu || "-",
        b?.umur || "-",
        b?.nik || "-",
        b?.alamat || "-",
        b?.puskesmas || "-",
        b?.kelurahan || "-",
        b?.dusun || "-",
        b?.posyandu || "-",
        b?.usiaKehamilan || "-",
        b?.catatan || "-"
      ]);
    });
  } catch (e) {
    console.error(e);
  }

  // Prepare Ibu Menyusui values
  const ibuMenyusuiValues = [
    ["ID", "Nama Ibu", "Umur", "NIK", "Alamat", "Puskesmas", "Kelurahan", "Dusun", "Posyandu", "Nama Bayi", "Catatan"]
  ];
  try {
    let ibuMenyusuiData = (data && Array.isArray(data.ibuMenyusui))
      ? data.ibuMenyusui
      : JSON.parse(localStorage.getItem("orbit_gizi_ibu_menyusui") || "[]");
    if (!Array.isArray(ibuMenyusuiData)) ibuMenyusuiData = [];

    ibuMenyusuiData.forEach((b: any) => {
      ibuMenyusuiValues.push([
        b?.id || "-",
        b?.namaIbu || "-",
        b?.umur || "-",
        b?.nik || "-",
        b?.alamat || "-",
        b?.puskesmas || "-",
        b?.kelurahan || "-",
        b?.dusun || "-",
        b?.posyandu || "-",
        b?.bayiNama || "-",
        b?.catatan || "-"
      ]);
    });
  } catch (e) {
    console.error(e);
  }

  // Prepare Catatan Timbang values
  const catatanTimbangValues = [
    ["ID Penerima", "Nama", "Kategori", "Periode", "Berat (kg)", "Tinggi (cm)", "Status Gizi", "Waktu Pengukuran"]
  ];
    
  try {
    const processRecords = (data: any[], categoryStr: string | null = null) => {
      if (!Array.isArray(data)) return;
      data.forEach(b => {
        if (b && b.weightRecords && Array.isArray(b.weightRecords)) {
          b.weightRecords.forEach((record: any) => {
            catatanTimbangValues.push([
              b?.id || "-",
              b?.name || b?.namaIbu || "-",
              categoryStr || b?.category || "-",
              record?.period || "-",
              record?.weightKg != null ? record.weightKg : "-",
              record?.heightCm != null ? record.heightCm : "-",
              record?.statusGizi || "-",
              record?.measuredAt || "-"
            ]);
          });
        }
      });
    };

    let mbgData = (data && Array.isArray(data.beneficiaries))
      ? data.beneficiaries
      : JSON.parse(localStorage.getItem("orbit_gizi_local_beneficiaries") || "[]");
    if (!Array.isArray(mbgData)) mbgData = [];
    processRecords(mbgData);

    let ibuHamilData = (data && Array.isArray(data.ibuHamil))
      ? data.ibuHamil
      : JSON.parse(localStorage.getItem("orbit_gizi_ibu_hamil") || "[]");
    if (!Array.isArray(ibuHamilData)) ibuHamilData = [];
    processRecords(ibuHamilData, "Ibu Hamil");

    let ibuMenyusuiData = (data && Array.isArray(data.ibuMenyusui))
      ? data.ibuMenyusui
      : JSON.parse(localStorage.getItem("orbit_gizi_ibu_menyusui") || "[]");
    if (!Array.isArray(ibuMenyusuiData)) ibuMenyusuiData = [];
    processRecords(ibuMenyusuiData, "Ibu Menyusui");
  } catch (e) {
    console.error(e);
  }

  // Prepare Analitik Pengunjung values
  const visitorValues = [
    ["ID Log", "Waktu Akses (WITA)", "Email Pengunjung", "Role / Hak Akses", "Tampilan Terakhir Dilihat", "Jenis Perangkat"]
  ];
  try {
    let visitorData = (data && Array.isArray(data.visitorLogs))
      ? data.visitorLogs
      : JSON.parse(localStorage.getItem("orbit_gizi_visitor_logs") || "[]");
    if (!Array.isArray(visitorData)) visitorData = [];
    visitorData.forEach((v: any) => {
      const formattedDate = v?.timestamp
        ? new Date(v.timestamp).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) + " WITA"
        : "-";
      visitorValues.push([
        v?.id || "-",
        formattedDate,
        v?.email || "pengunjung@public.go.id",
        v?.role || "PENGUNJUNG",
        v?.viewName || "Dashboard Utama",
        v?.deviceInfo || "Komputer / Desktop"
      ]);
    });
  } catch (e) {
    console.error("Error reading visitor logs for sheet sync:", e);
  }

  // Prepare Audit Log Operator values
  const auditValues = [
    ["ID Audit", "Waktu Tindakan (WITA)", "Nama Operator", "Jabatan / Peran", "Instansi / Puskesmas", "Email Operator", "Jenis Action", "Deskripsi Kegiatan", "Sasaran / Target"]
  ];
  try {
    let auditData = (data && Array.isArray(data.auditLogs))
      ? data.auditLogs
      : JSON.parse(localStorage.getItem("orbit_gizi_audit_logs") || "[]");
    if (!Array.isArray(auditData)) auditData = [];
    auditData.forEach((a: any) => {
      const formattedDate = a?.timestamp
        ? new Date(a.timestamp).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) + " WITA"
        : "-";
      auditValues.push([
        a?.id || "-",
        formattedDate,
        a?.operatorName || "Petugas Anonim",
        a?.operatorRole || "Petugas Nakes",
        a?.operatorInstansi || "Dinas Kesehatan / Puskesmas",
        a?.operatorEmail || "-",
        a?.actionType || "INPUT_DATA",
        a?.description || "-",
        a?.targetName || "-"
      ]);
    });
  } catch (e) {
    console.error("Error reading audit logs for sheet sync:", e);
  }

  // Clear spreadsheet ranges before writing updated values to ensure deleted rows are completely removed
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchClear`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ranges: [
          "'Ringkasan Indeks'!A1:Z500",
          "'Data Desa'!A1:Z2000",
          "'Penerima MBG'!A1:Z10000",
          "'Ibu Hamil'!A1:Z5000",
          "'Ibu Menyusui'!A1:Z5000",
          "'Catatan Timbang'!A1:Z20000",
          "'Analitik Pengunjung'!A1:Z10000",
          "'Audit Log Operator'!A1:Z10000"
        ]
      })
    });
  } catch (clearErr) {
    console.warn("Batch clear warning (ignorable):", clearErr);
  }

  // Batch update spreadsheet values
  const writeResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      valueInputOption: "USER_ENTERED",
      data: [
        {
          range: "'Ringkasan Indeks'!A1",
          values: summaryValues,
        },
        {
          range: "'Data Desa'!A1",
          values: villageValues,
        },
        {
          range: "'Penerima MBG'!A1",
          values: mbgValues,
        },
        {
          range: "'Ibu Hamil'!A1",
          values: ibuHamilValues,
        },
        {
          range: "'Ibu Menyusui'!A1",
          values: ibuMenyusuiValues,
        },
        {
          range: "'Catatan Timbang'!A1",
          values: catatanTimbangValues,
        },
        {
          range: "'Analitik Pengunjung'!A1",
          values: visitorValues,
        },
        {
          range: "'Audit Log Operator'!A1",
          values: auditValues,
        },
      ],
    }),
  });

  if (!writeResponse.ok) {
    const errText = await writeResponse.text();
    throw new Error(`Gagal menulis data ke Spreadsheet: ${errText}`);
  }

  return {
    spreadsheetId,
    spreadsheetUrl: spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
  };
}


function parseCsvSimple(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let curr = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        curr += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(curr.trim());
      curr = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(curr.trim());
      if (row.some(c => c !== '')) {
        lines.push(row);
      }
      row = [];
      curr = '';
    } else {
      curr += char;
    }
  }
  if (curr || row.length > 0) {
    row.push(curr.trim());
    if (row.some(c => c !== '')) {
      lines.push(row);
    }
  }
  return lines;
}

export function parseAndMergeCatatanTimbang(
  catatanRows: any[][],
  parsedMbg: any[],
  parsedIbuHamil: any[] = [],
  parsedIbuMenyusui: any[] = []
) {
  if (!Array.isArray(catatanRows) || catatanRows.length === 0) return;

  catatanRows.forEach(row => {
    if (!Array.isArray(row) || row.length < 2) return;

    const idPenerima = (row[0] && row[0] !== "-" && row[0] !== "ID Penerima") ? String(row[0]).trim() : "";
    const nama = (row[1] && row[1] !== "-" && row[1] !== "Nama") ? String(row[1]).trim() : "";
    
    if (!idPenerima && !nama) return;

    const period = (row[3] && row[3] !== "-") ? String(row[3]).trim() : "Agustus 2026";
    
    // Convert Indonesian comma decimal "8,6" -> "8.6"
    const rawWeight = String(row[4] || "").replace(",", ".").trim();
    const weightKg = parseFloat(rawWeight);

    const rawHeight = String(row[5] || "").replace(",", ".").trim();
    const heightCm = parseFloat(rawHeight);

    const statusGizi = (row[6] && row[6] !== "-") ? String(row[6]).trim() as any : undefined;
    const measuredAt = (row[7] && row[7] !== "-") ? String(row[7]).trim() : undefined;

    if (isNaN(weightKg) && (isNaN(heightCm) || heightCm <= 0)) return;

    const newRecord = {
      period,
      weightKg: !isNaN(weightKg) ? weightKg : 0,
      heightCm: (!isNaN(heightCm) && heightCm > 0) ? heightCm : undefined,
      statusGizi,
      measuredAt
    };

    const attachToTarget = (target: any) => {
      if (!target.weightRecords) target.weightRecords = [];
      const existingIdx = target.weightRecords.findIndex((r: any) => r.period === period);
      if (existingIdx !== -1) {
        target.weightRecords[existingIdx] = { ...target.weightRecords[existingIdx], ...newRecord };
      } else {
        target.weightRecords.push(newRecord);
      }
      if (newRecord.weightKg > 0) target.initialWeightKg = newRecord.weightKg;
      if (newRecord.heightCm) target.initialHeightCm = newRecord.heightCm;
      if (newRecord.statusGizi) target.initialStatusGizi = newRecord.statusGizi;
    };

    // Match MBG beneficiary
    let matched = parsedMbg.find(b => 
      (idPenerima && b.id === idPenerima) || 
      (nama && b.name && b.name.toLowerCase() === nama.toLowerCase())
    );
    if (matched) {
      attachToTarget(matched);
      return;
    }

    // Match Ibu Hamil
    let matchedHamil = parsedIbuHamil.find(h => 
      (idPenerima && h.id === idPenerima) || 
      (nama && h.namaIbu && h.namaIbu.toLowerCase() === nama.toLowerCase())
    );
    if (matchedHamil) {
      attachToTarget(matchedHamil);
      return;
    }

    // Match Ibu Menyusui
    let matchedMenyusui = parsedIbuMenyusui.find(m => 
      (idPenerima && m.id === idPenerima) || 
      (nama && m.namaIbu && m.namaIbu.toLowerCase() === nama.toLowerCase())
    );
    if (matchedMenyusui) {
      attachToTarget(matchedMenyusui);
      return;
    }
  });
}

export async function pullFromGoogleSheets(accessToken: string, spreadsheetId: string) {
  // 1. Direct OAuth Google Sheets API pull
  if (accessToken) {
    try {
      const fetchRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?ranges=Penerima%20MBG!A2:Z&ranges=Ibu%20Hamil!A2:Z&ranges=Ibu%20Menyusui!A2:Z&ranges=Catatan%20Timbang!A2:Z&valueRenderOption=FORMATTED_VALUE`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (fetchRes.ok) {
        const fetchJson = await fetchRes.json();
        const valueRanges = fetchJson.valueRanges || [];
        
        const sheetMbg = valueRanges[0]?.values || [];
        const sheetIbuHamil = valueRanges[1]?.values || [];
        const sheetIbuMenyusui = valueRanges[2]?.values || [];
        const sheetCatatanTimbang = valueRanges[3]?.values || [];

        const parsedMbg = sheetMbg
          .filter((r: any[]) => r && r[1] && r[1] !== "-" && r[1] !== "Nama")
          .map((row: any[], idx: number) => parseMbgRow(row, idx))
          .filter(Boolean);

        const parsedIbuHamil = sheetIbuHamil.filter((r: any[]) => r && r[1] && r[1] !== "Nama Ibu").map((row: any[]) => ({
          id: (row[0] && row[0] !== "-") ? row[0] : `ibu_${Date.now()}_${Math.random().toString(36).substring(2,6)}`,
          namaIbu: (row[1] && row[1] !== "-") ? row[1] : "",
          umur: parseInt(row[2]) || 0,
          nik: (row[3] && row[3] !== "-") ? row[3] : "",
          alamat: (row[4] && row[4] !== "-") ? row[4] : "",
          puskesmas: row[5] !== "-" ? row[5] : "",
          kelurahan: row[6] !== "-" ? row[6] : "",
          dusun: row[7] !== "-" ? row[7] : "",
          posyandu: row[8] !== "-" ? row[8] : "",
          usiaKehamilan: parseInt(row[9]) || 0,
          catatan: (row[10] && row[10] !== "-") ? row[10] : ""
        }));

        const parsedIbuMenyusui = sheetIbuMenyusui.filter((r: any[]) => r && r[1] && r[1] !== "Nama Ibu").map((row: any[]) => ({
          id: (row[0] && row[0] !== "-") ? row[0] : `ibum_${Date.now()}_${Math.random().toString(36).substring(2,6)}`,
          namaIbu: (row[1] && row[1] !== "-") ? row[1] : "",
          umur: parseInt(row[2]) || 0,
          nik: (row[3] && row[3] !== "-") ? row[3] : "",
          alamat: (row[4] && row[4] !== "-") ? row[4] : "",
          puskesmas: row[5] !== "-" ? row[5] : "",
          kelurahan: row[6] !== "-" ? row[6] : "",
          dusun: row[7] !== "-" ? row[7] : "",
          posyandu: row[8] !== "-" ? row[8] : "",
          bayiNama: (row[9] && row[9] !== "-") ? row[9] : "",
          catatan: (row[10] && row[10] !== "-") ? row[10] : ""
        }));

        parseAndMergeCatatanTimbang(sheetCatatanTimbang, parsedMbg, parsedIbuHamil, parsedIbuMenyusui);

        // Persist to local storage for static host environment (e.g. Cloudflare Workers / Pages)
        try {
          localStorage.setItem("orbit_gizi_local_beneficiaries", JSON.stringify(parsedMbg));
          localStorage.setItem("orbit_gizi_ibu_hamil", JSON.stringify(parsedIbuHamil));
          localStorage.setItem("orbit_gizi_local_ibu_hamil", JSON.stringify(parsedIbuHamil));
          localStorage.setItem("orbit_gizi_ibu_menyusui", JSON.stringify(parsedIbuMenyusui));
          localStorage.setItem("orbit_gizi_local_ibu_menyusui", JSON.stringify(parsedIbuMenyusui));
        } catch (e) {
          console.warn("Error saving to localStorage cache:", e);
        }

        return {
          success: true,
          beneficiaries: parsedMbg,
          ibuHamil: parsedIbuHamil,
          ibuMenyusui: parsedIbuMenyusui
        };
      } else {
        console.warn(`Direct OAuth Sheet pull returned status ${fetchRes.status}.`);
      }
    } catch (err) {
      console.warn("Direct OAuth Sheet fetch error:", err);
    }
  }

  // 2. Client-side Public Google Sheet CSV pull (works on Cloudflare Workers / Static SPA)
  try {
    const csvMbgRes = await fetch(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=Penerima%20MBG&headers=1`);
    if (csvMbgRes.ok) {
      const csvText = await csvMbgRes.text();
      const rows = parseCsvSimple(csvText);
      const dataRows = rows.slice(1).filter(r => r.length > 0 && r.some(c => c !== ""));
      const parsedMbg = dataRows.map((row, idx) => parseMbgRow(row, idx)).filter(Boolean);

      let parsedIbuHamil: any[] = [];
      try {
        const csvHamilRes = await fetch(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=Ibu%20Hamil&headers=1`);
        if (csvHamilRes.ok) {
          const hamilText = await csvHamilRes.text();
          const hamilRows = parseCsvSimple(hamilText).slice(1);
          parsedIbuHamil = hamilRows.map((row, idx) => ({
            id: (row[0] && row[0] !== "-") ? row[0] : `ibu_${Date.now()}_${idx}`,
            namaIbu: row[1] || "",
            umur: parseInt(row[2]) || 0,
            nik: row[3] || "",
            alamat: row[4] || "",
            puskesmas: row[5] || "",
            kelurahan: row[6] || "",
            dusun: row[7] || "",
            posyandu: row[8] || "",
            usiaKehamilan: parseInt(row[9]) || 0,
            catatan: row[10] || ""
          })).filter(h => h.namaIbu && h.namaIbu !== "Nama Ibu");
        }
      } catch (e) { console.warn("Client CSV Ibu Hamil error:", e); }

      let parsedIbuMenyusui: any[] = [];
      try {
        const csvMenyusuiRes = await fetch(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=Ibu%20Menyusui&headers=1`);
        if (csvMenyusuiRes.ok) {
          const menyusuiText = await csvMenyusuiRes.text();
          const menyusuiRows = parseCsvSimple(menyusuiText).slice(1);
          parsedIbuMenyusui = menyusuiRows.map((row, idx) => ({
            id: (row[0] && row[0] !== "-") ? row[0] : `ibum_${Date.now()}_${idx}`,
            namaIbu: row[1] || "",
            umur: parseInt(row[2]) || 0,
            nik: row[3] || "",
            alamat: row[4] || "",
            puskesmas: row[5] || "",
            kelurahan: row[6] || "",
            dusun: row[7] || "",
            posyandu: row[8] || "",
            bayiNama: row[9] || "",
            catatan: row[10] || ""
          })).filter(m => m.namaIbu && m.namaIbu !== "Nama Ibu");
        }
      } catch (e) { console.warn("Client CSV Ibu Menyusui error:", e); }

      try {
        const csvTimbangRes = await fetch(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=Catatan%20Timbang&headers=1`);
        if (csvTimbangRes.ok) {
          const timbangText = await csvTimbangRes.text();
          const timbangRows = parseCsvSimple(timbangText).slice(1);
          parseAndMergeCatatanTimbang(timbangRows, parsedMbg, parsedIbuHamil, parsedIbuMenyusui);
        }
      } catch (e) { console.warn("Client CSV Catatan Timbang error:", e); }

      if (parsedMbg.length > 0 || parsedIbuHamil.length > 0) {
        try {
          localStorage.setItem("orbit_gizi_local_beneficiaries", JSON.stringify(parsedMbg));
          localStorage.setItem("orbit_gizi_ibu_hamil", JSON.stringify(parsedIbuHamil));
          localStorage.setItem("orbit_gizi_local_ibu_hamil", JSON.stringify(parsedIbuHamil));
          localStorage.setItem("orbit_gizi_ibu_menyusui", JSON.stringify(parsedIbuMenyusui));
          localStorage.setItem("orbit_gizi_local_ibu_menyusui", JSON.stringify(parsedIbuMenyusui));
        } catch (e) {}

        return {
          success: true,
          beneficiaries: parsedMbg,
          ibuHamil: parsedIbuHamil,
          ibuMenyusui: parsedIbuMenyusui,
          isCsvFallback: true
        };
      }
    }
  } catch (csvErr) {
    console.warn("Client-side CSV pull error:", csvErr);
  }

  // 3. Fallback to server-side autoImport endpoint if Express server exists
  try {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const serverRes = await fetch(`${baseUrl}/api/sheets/pull`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    if (serverRes.ok) {
      const serverJson = await serverRes.json();
      if (Array.isArray(serverJson.beneficiaries)) {
        try {
          localStorage.setItem("orbit_gizi_local_beneficiaries", JSON.stringify(serverJson.beneficiaries));
          if (serverJson.ibuHamil) localStorage.setItem("orbit_gizi_local_ibu_hamil", JSON.stringify(serverJson.ibuHamil));
          if (serverJson.ibuMenyusui) localStorage.setItem("orbit_gizi_local_ibu_menyusui", JSON.stringify(serverJson.ibuMenyusui));
        } catch (e) {}
      }
      return {
        success: true,
        beneficiaries: serverJson.beneficiaries || [],
        ibuHamil: serverJson.ibuHamil || [],
        ibuMenyusui: serverJson.ibuMenyusui || [],
        isFallback: true
      };
    }
  } catch (serverErr) {
    console.warn("Server-side pull fallback error:", serverErr);
  }

  throw new Error(`Akses ke Google Sheet ditolak / gagal. Pastikan spreadsheet Google Anda disetel "Anyone with the link can view/edit" di Google Drive agar dapat diakses oleh semua akun operator.`);
}
