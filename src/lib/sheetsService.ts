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
  const emailSuffix = userEmail ? `_${userEmail.toLowerCase().trim()}` : "";
  const idKey = `orbit_gizi_spreadsheet_id${emailSuffix}`;
  const urlKey = `orbit_gizi_spreadsheet_url${emailSuffix}`;

  let spreadsheetId = localStorage.getItem(idKey);
  let spreadsheetUrl = localStorage.getItem(urlKey);

  // Helper to create sheet and save to local storage
  const initNewSpreadsheet = async () => {
    const newSheet = await createSpreadsheet(accessToken, kabupatenName);
    spreadsheetId = newSheet.spreadsheetId;
    spreadsheetUrl = newSheet.spreadsheetUrl;
    localStorage.setItem(idKey, spreadsheetId);
    localStorage.setItem(urlKey, spreadsheetUrl);
  };

  // If we don't have a spreadsheet id or it was cleared, create a new one
  if (!spreadsheetId) {
    await initNewSpreadsheet();
  }

  // Ensure all tabs exist
  await ensureSheetTabsExist(accessToken, spreadsheetId!);

  // Clear existing data first to avoid trailing mismatched rows
  try {
    await clearSheets(accessToken, spreadsheetId!);
  } catch (err) {
    console.warn("Mencoba membuat spreadsheet baru karena spreadsheet lama mungkin telah dihapus di Drive atau tidak dapat diakses.");
    await initNewSpreadsheet();
    try {
      await ensureSheetTabsExist(accessToken, spreadsheetId!);
      await clearSheets(accessToken, spreadsheetId!);
    } catch (innerErr) {
      console.error("Gagal melakukan pembersihan kedua pada spreadsheet baru:", innerErr);
    }
  }

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
    ["ID", "Nama Beneficiary", "Nama Orang Tua/Wali", "NIK", "Gender", "Usia", "Kategori", "Propinsi", "Kabupaten", "Puskesmas", "Kelurahan", "Dusun", "Posyandu", "Status Kunjungan", "Wajib Kunjungan Rumah", "Menerima MBG", "Menerima PMT", "Petugas Desa Hadir", "Petugas Posyandu Hadir", "Stakeholder Kolaborasi", "Catatan"]
  ];
  try {
    let mbgData = JSON.parse(localStorage.getItem("orbit_gizi_local_beneficiaries") || "[]");
    if (!Array.isArray(mbgData)) mbgData = [];
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
        b?.age || "-",
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
    let ibuHamilData = JSON.parse(localStorage.getItem("orbit_gizi_ibu_hamil") || "[]");
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
    let ibuMenyusuiData = JSON.parse(localStorage.getItem("orbit_gizi_ibu_menyusui") || "[]");
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

    let mbgData = JSON.parse(localStorage.getItem("orbit_gizi_local_beneficiaries") || "[]");
    if (!Array.isArray(mbgData)) mbgData = [];
    processRecords(mbgData);

    let ibuHamilData = JSON.parse(localStorage.getItem("orbit_gizi_ibu_hamil") || "[]");
    if (!Array.isArray(ibuHamilData)) ibuHamilData = [];
    processRecords(ibuHamilData, "Ibu Hamil");

    let ibuMenyusuiData = JSON.parse(localStorage.getItem("orbit_gizi_ibu_menyusui") || "[]");
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
    let visitorData = JSON.parse(localStorage.getItem("orbit_gizi_visitor_logs") || "[]");
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
    ["ID Audit", "Waktu Tindakan (WITA)", "ID Sesi Operator", "Durasi Sesi (Menit)", "Urutan Input Sesi", "Nama Operator", "Jabatan / Peran", "Instansi / Puskesmas", "Email Operator", "Jenis Action", "Deskripsi Kegiatan", "Sasaran / Target"]
  ];
  try {
    let auditData = JSON.parse(localStorage.getItem("orbit_gizi_audit_logs") || "[]");
    if (!Array.isArray(auditData)) auditData = [];
    auditData.forEach((a: any) => {
      const formattedDate = a?.timestamp
        ? new Date(a.timestamp).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) + " WITA"
        : "-";
      auditValues.push([
        a?.id || "-",
        formattedDate,
        a?.sessionId || "-",
        a?.sessionDurationMinutes || 60,
        a?.sessionInputCount ? `Input #${a.sessionInputCount}` : "-",
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
