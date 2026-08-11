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
  let spreadsheetId = data?.adminSheetId || localStorage.getItem('orbit_gizi_spreadsheet_id_global') || "1dGTF6wZ2DoPF2qVcjxrjaxDDQzHQjuHgwvKi1DwTkRE";
  let spreadsheetUrl = data?.adminSheetUrl || localStorage.getItem('orbit_gizi_spreadsheet_url_global') || "https://docs.google.com/spreadsheets/d/1dGTF6wZ2DoPF2qVcjxrjaxDDQzHQjuHgwvKi1DwTkRE/edit?gid=1042318316#gid=1042318316";

  // Helper to create sheet and save to local storage
  const initNewSpreadsheet = async () => {
    const newSheet = await createSpreadsheet(accessToken, kabupatenName);
    spreadsheetId = newSheet.spreadsheetId;
    spreadsheetUrl = newSheet.spreadsheetUrl;
    localStorage.setItem('orbit_gizi_spreadsheet_id_global', spreadsheetId);
    localStorage.setItem('orbit_gizi_spreadsheet_url_global', spreadsheetUrl);
  };

  // If we don't have a spreadsheet id or it was cleared, create a new one
  if (!spreadsheetId) {
    await initNewSpreadsheet();
  }

  // Ensure all tabs exist

  await ensureSheetTabsExist(accessToken, spreadsheetId!);

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
    let mbgData = (data && Array.isArray(data.beneficiaries))
      ? data.beneficiaries
      : JSON.parse(localStorage.getItem("orbit_gizi_local_beneficiaries") || "[]");
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


export async function pullFromGoogleSheets(accessToken: string, spreadsheetId: string) {
  try {
    const fetchRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?ranges=Penerima%20MBG!A2:Z&ranges=Ibu%20Hamil!A2:Z&ranges=Ibu%20Menyusui!A2:Z`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (fetchRes.ok) {
      const fetchJson = await fetchRes.json();
      const valueRanges = fetchJson.valueRanges || [];
      
      const sheetMbg = valueRanges[0]?.values || [];
      const sheetIbuHamil = valueRanges[1]?.values || [];
      const sheetIbuMenyusui = valueRanges[2]?.values || [];

      const parsedMbg = sheetMbg.map((row: any[]) => ({
        id: (row[0] && row[0] !== "-") ? row[0] : `ben_${Date.now()}_${Math.random().toString(36).substring(2,6)}`,
        name: row[1] !== "-" ? row[1] : "",
        parentName: row[2] !== "-" ? row[2] : "",
        nik: row[3] !== "-" ? row[3] : "",
        gender: row[4] !== "-" ? row[4] : "Laki-laki",
        age: parseInt(row[5]) || 0,
        category: row[6] !== "-" ? row[6] : "Anak Stunting",
        location: {
          propinsi: row[7] !== "-" ? row[7] : "Nusa Tenggara Timur",
          kabupaten: row[8] !== "-" ? row[8] : "Nagekeo",
          puskesmas: row[9] !== "-" ? row[9] : "",
          kelurahan: row[10] !== "-" ? row[10] : "",
          dusun: row[11] !== "-" ? row[11] : "",
          posyandu: row[12] !== "-" ? row[12] : "",
        },
        attendanceStatus: row[13] !== "-" ? row[13] : "Mengunjungi Posyandu",
        isReceivedMBG: row[15] === "YA",
        isReceivedPMT: row[16] === "YA",
        isPetugasDesaHadir: row[17] === "YA",
        isPetugasPosyanduHadir: row[18] === "YA",
        stakeholdersHadir: (row[19] && row[19] !== "-" && row[19] !== "Petugas Desa, Kader Posyandu, Puskesmas") ? row[19].split(", ") : [],
        notes: row[20] !== "-" ? row[20] : ""
      }));

      const parsedIbuHamil = sheetIbuHamil.map((row: any[]) => ({
        id: (row[0] && row[0] !== "-") ? row[0] : `ibu_${Date.now()}_${Math.random().toString(36).substring(2,6)}`,
        namaIbu: row[1] !== "-" ? row[1] : "",
        umur: parseInt(row[2]) || 0,
        nik: row[3] !== "-" ? row[3] : "",
        alamat: row[4] !== "-" ? row[4] : "",
        puskesmas: row[5] !== "-" ? row[5] : "",
        kelurahan: row[6] !== "-" ? row[6] : "",
        dusun: row[7] !== "-" ? row[7] : "",
        posyandu: row[8] !== "-" ? row[8] : "",
        usiaKehamilan: parseInt(row[9]) || 0,
        catatan: row[10] !== "-" ? row[10] : ""
      }));

      const parsedIbuMenyusui = sheetIbuMenyusui.map((row: any[]) => ({
        id: (row[0] && row[0] !== "-") ? row[0] : `ibum_${Date.now()}_${Math.random().toString(36).substring(2,6)}`,
        namaIbu: row[1] !== "-" ? row[1] : "",
        umur: parseInt(row[2]) || 0,
        nik: row[3] !== "-" ? row[3] : "",
        alamat: row[4] !== "-" ? row[4] : "",
        puskesmas: row[5] !== "-" ? row[5] : "",
        kelurahan: row[6] !== "-" ? row[6] : "",
        dusun: row[7] !== "-" ? row[7] : "",
        posyandu: row[8] !== "-" ? row[8] : "",
        bayiNama: row[9] !== "-" ? row[9] : "",
        catatan: row[10] !== "-" ? row[10] : ""
      }));

      // Post back to API to save to server
      const baseUrl = window.location.origin;
      await fetch(`${baseUrl}/api/beneficiaries/batch`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beneficiaries: parsedMbg })
      }).catch(e => console.error(e));
      
      await fetch(`${baseUrl}/api/ibu-hamil/batch`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ibuHamil: parsedIbuHamil })
      }).catch(e => console.error(e));
      
      await fetch(`${baseUrl}/api/ibu-menyusui/batch`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ibuMenyusui: parsedIbuMenyusui })
      }).catch(e => console.error(e));

      return {
        success: true,
        beneficiaries: parsedMbg,
        ibuHamil: parsedIbuHamil,
        ibuMenyusui: parsedIbuMenyusui
      };
    }
  } catch (err) {
    console.error("Error saat pull data dari Google Sheets:", err);
    throw err;
  }
}
