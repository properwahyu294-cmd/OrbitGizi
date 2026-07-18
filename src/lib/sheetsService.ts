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
        {
          properties: {
            title: "Ringkasan Indeks",
          },
        },
        {
          properties: {
            title: "Data Desa",
          },
        },
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
 * Clears old data in sheets to prepare for fresh write
 */
async function clearSheets(accessToken: string, spreadsheetId: string): Promise<void> {
  const ranges = ["'Ringkasan Indeks'!A1:Z100", "'Data Desa'!A1:Z1000"];
  for (const range of ranges) {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:clear`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }
}

/**
 * Synchronizes Kabupaten and Villages data to Google Sheets
 */
export async function syncToGoogleSheets(
  accessToken: string,
  kabupatenName: string,
  data: any
): Promise<SheetsSyncResult> {
  let spreadsheetId = localStorage.getItem("orbit_gizi_spreadsheet_id");
  let spreadsheetUrl = localStorage.getItem("orbit_gizi_spreadsheet_url");

  // If we don't have a spreadsheet id or it was cleared, create a new one
  if (!spreadsheetId) {
    const newSheet = await createSpreadsheet(accessToken, kabupatenName);
    spreadsheetId = newSheet.spreadsheetId;
    spreadsheetUrl = newSheet.spreadsheetUrl;
    localStorage.setItem("orbit_gizi_spreadsheet_id", spreadsheetId);
    localStorage.setItem("orbit_gizi_spreadsheet_url", spreadsheetUrl);
  }

  // Clear existing data first to avoid trailing mismatched rows
  try {
    await clearSheets(accessToken, spreadsheetId);
  } catch (err) {
    console.warn("Mencoba membuat spreadsheet baru karena spreadsheet lama mungkin telah dihapus di Drive.");
    // If clearing fails, the file might be deleted or permission changed. Let's create a new one
    const newSheet = await createSpreadsheet(accessToken, kabupatenName);
    spreadsheetId = newSheet.spreadsheetId;
    spreadsheetUrl = newSheet.spreadsheetUrl;
    localStorage.setItem("orbit_gizi_spreadsheet_id", spreadsheetId);
    localStorage.setItem("orbit_gizi_spreadsheet_url", spreadsheetUrl);
    await clearSheets(accessToken, spreadsheetId);
  }

  // Prepare Ringkasan Indeks data
  const summaryValues = [
    ["LAPORAN INDEKS TRANSFORMASI ORBIT GIZI (TERINTEGRASI SINKRON)", ""],
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
