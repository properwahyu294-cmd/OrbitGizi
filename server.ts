import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { parse } from 'csv-parse/sync';
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// File path for persistent database store
const DATA_FILE = path.join(process.cwd(), "data_store.json");

// Dynamic Initial Villages Database
interface Village {
  id: string;
  name: string;
  unitType?: "Desa" | "Kelurahan" | "Sekolah" | "Posyandu" | "Puskesmas" | "Kabupaten" | "Propinsi";
  riskLevel: "Hijau" | "Kuning" | "Merah";
  score: number;
  coordinates: { x: number; y: number };
  pilar1_mbg_sync: number;
  pilar1_mbg_total: number;
  pilar1_pmt_sync: number;
  pilar1_pmt_total: number;
  pilar1_posyandu_sync: number;
  pilar1_posyandu_total: number;
  pilar1_eppgbm_sync: number;
  pilar1_eppgbm_total: number;
  pilar2_dinkes_aktif: boolean;
  pilar2_bgn_aktif: boolean;
  pilar2_pkk_aktif: boolean;
  pilar2_pemdes_aktif: boolean;
  pilar2_puskesmas_aktif: boolean;
  pilar3_dashboard_online: boolean;
  pilar3_validasi_data: boolean;
  pilar3_real_time_update: boolean;
  pilar4_mbg_realized: number;
  pilar4_mbg_target: number;
  pilar4_pmt_realized: number;
  pilar4_pmt_target: number;
  pilar4_home_visit: number;
  pilar4_home_visit_target: number;
  pilar4_posyandu_aktif: number;
  pilar4_posyandu_total: number;
  pilar5_stunting_prev: number;
  pilar5_stunting_curr: number;
  pilar5_wasting_prev: number;
  pilar5_wasting_curr: number;
  pilar5_target_accuracy: number;
}

const DEFAULT_ADMIN_SHEET_URL = "https://docs.google.com/spreadsheets/d/1dGTF6wZ2DoPF2qVcjxrjaxDDQzHQjuHgwvKi1DwTkRE/edit?gid=1042318316#gid=1042318316";
const DEFAULT_ADMIN_SHEET_ID = "1dGTF6wZ2DoPF2qVcjxrjaxDDQzHQjuHgwvKi1DwTkRE";

const SEED_VILLAGES: Village[] = [];

const SEED_BENEFICIARIES: any[] = [];

// Memory state loaded from data_store.json
let adminSheetUrl = DEFAULT_ADMIN_SHEET_URL;
let adminSheetId = DEFAULT_ADMIN_SHEET_ID;
let kabupatenName = "Kabupaten Nagekeo";
let lastUpdated = new Date().toISOString();
let weights = {
  pilar1: 0.10,
  pilar2: 0.30,
  pilar3: 0.10,
  pilar4: 0.25,
  pilar5: 0.25,
};
let villages: Village[] = [];
let beneficiaries: any[] = [];
let ibuHamil: any[] = [];
let ibuMenyusui: any[] = [];
let bannerImages: any[] = [];
let dashboardBannerImages: any[] = [];
let visitorLogs: any[] = [];
let auditLogs: any[] = [];

// Load data store from disk or initialize with seeds
function loadStoreFromDisk() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const fileData = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(fileData);
      adminSheetUrl = parsed.adminSheetUrl || DEFAULT_ADMIN_SHEET_URL;
      adminSheetId = parsed.adminSheetId || DEFAULT_ADMIN_SHEET_ID;
      kabupatenName = parsed.kabupatenName || "Kabupaten Nagekeo";
      weights = parsed.weights || weights;
      villages = Array.isArray(parsed.villages) && parsed.villages.length > 0 ? parsed.villages : [...SEED_VILLAGES];
      beneficiaries = Array.isArray(parsed.beneficiaries) ? parsed.beneficiaries : [];
      ibuHamil = Array.isArray(parsed.ibuHamil) ? parsed.ibuHamil : [];
      ibuMenyusui = Array.isArray(parsed.ibuMenyusui) ? parsed.ibuMenyusui : [];
      bannerImages = Array.isArray(parsed.bannerImages) ? parsed.bannerImages : [];
      dashboardBannerImages = Array.isArray(parsed.dashboardBannerImages) ? parsed.dashboardBannerImages : [];
      visitorLogs = Array.isArray(parsed.visitorLogs) ? parsed.visitorLogs : [];
      auditLogs = Array.isArray(parsed.auditLogs) ? parsed.auditLogs : [];
      lastUpdated = parsed.lastUpdated || new Date().toISOString();
    } else {
      villages = [...SEED_VILLAGES];
      beneficiaries = [...SEED_BENEFICIARIES];
      saveStoreToDisk();
    }
  } catch (e) {
    console.error("Gagal membaca data_store.json, menggunakan seed awal:", e);
    villages = [...SEED_VILLAGES];
    beneficiaries = [...SEED_BENEFICIARIES];
    saveStoreToDisk();
  }
}

// Save data store to disk synchronously
function saveStoreToDisk() {
  try {
    lastUpdated = new Date().toISOString();
    const payload = {
      adminSheetUrl,
      adminSheetId,
      kabupatenName,
      lastUpdated,
      weights,
      villages,
      beneficiaries,
      ibuHamil,
      ibuMenyusui,
      bannerImages,
      dashboardBannerImages,
      visitorLogs,
      auditLogs
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), "utf-8");
  } catch (e) {
    console.error("Gagal menyimpan data_store.json:", e);
  }
}

loadStoreFromDisk();

function parseCsv(text: string): string[][] {
  return parse(text, {
    skip_empty_lines: true,
  });
}

async function autoImportFromGoogleSheet() {
  try {
    const mbgRes = await fetch(`https://docs.google.com/spreadsheets/d/${adminSheetId}/gviz/tq?tqx=out:csv&sheet=Penerima%20MBG`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    console.error('MBG Res Status:', mbgRes.status, mbgRes.statusText);
    if (mbgRes.ok) {
      const csvText = await mbgRes.text();
      console.error('MBG CSV Response (first 200 chars):', csvText.substring(0, 200));
      const rows = parseCsv(csvText);
      (global as any).lastMbgRowsLength = rows.length;
      const dataRows = rows.slice(1).filter(r => r.length > 0 && r.some(c => c !== ""));
      if (dataRows.length > 0) {
        const sheetBens = dataRows.map((row, idx) => ({
          id: (row[0] && row[0] !== "-" && row[0] !== "") ? row[0] : `ben_${Date.now()}_${idx}`,
          name: row[1] || "",
          parentName: row[2] || "",
          nik: row[3] || "",
          gender: row[4] || "Laki-laki",
          age: parseInt(row[5]) || 2,
          category: row[6] || "Anak Stunting",
          location: {
            propinsi: row[7] || "Nusa Tenggara Timur",
            kabupaten: row[8] || "Nagekeo",
            puskesmas: row[9] || "",
            kelurahan: row[10] || "",
            dusun: row[11] || "",
            posyandu: row[12] || "",
          },
          attendanceStatus: row[13] || "Mengunjungi Posyandu",
          isReceivedMBG: row[15] === "YA",
          isReceivedPMT: row[16] === "YA",
          isPetugasDesaHadir: row[17] === "YA",
          isPetugasPosyanduHadir: row[18] === "YA",
          stakeholdersHadir: row[19] ? row[19].split(",").map(s => s.trim()).filter(Boolean) : [],
          notes: row[20] || "",
          weightRecords: []
        }));

        sheetBens.forEach(sb => {
          const idx = beneficiaries.findIndex(b => b.id === sb.id || (sb.nik && b.nik === sb.nik));
          if (idx !== -1) {
            beneficiaries[idx] = {
              ...beneficiaries[idx],
              ...sb,
              weightRecords: (beneficiaries[idx].weightRecords && beneficiaries[idx].weightRecords.length > 0)
                ? beneficiaries[idx].weightRecords
                : sb.weightRecords
            };
          } else {
            beneficiaries.push(sb);
          }
        });
      }
    }

    const hamilRes = await fetch(`https://docs.google.com/spreadsheets/d/${adminSheetId}/gviz/tq?tqx=out:csv&sheet=Ibu%20Hamil`);
    if (hamilRes.ok) {
      const csvText = await hamilRes.text();
      const rows = parseCsv(csvText);
      const dataRows = rows.slice(1).filter(r => r.length > 0 && r.some(c => c !== ""));
      if (dataRows.length > 0) {
        const sheetHamil = dataRows.map((row, idx) => ({
          id: (row[0] && row[0] !== "-" && row[0] !== "") ? row[0] : `ibu_${Date.now()}_${idx}`,
          namaIbu: row[1] || "",
          umur: parseInt(row[2]) || 25,
          nik: row[3] || "",
          alamat: row[4] || "",
          puskesmas: row[5] || "",
          kelurahan: row[6] || "",
          dusun: row[7] || "",
          posyandu: row[8] || "",
          usiaKehamilan: parseInt(row[9]) || 1,
          catatan: row[10] || ""
        }));
        sheetHamil.forEach(sh => {
          const idx = ibuHamil.findIndex(i => i.id === sh.id || (sh.nik && i.nik === sh.nik));
          if (idx !== -1) {
            ibuHamil[idx] = { ...ibuHamil[idx], ...sh };
          } else {
            ibuHamil.push(sh);
          }
        });
      }
    }

    const menyusuiRes = await fetch(`https://docs.google.com/spreadsheets/d/${adminSheetId}/gviz/tq?tqx=out:csv&sheet=Ibu%20Menyusui`);
    if (menyusuiRes.ok) {
      const csvText = await menyusuiRes.text();
      const rows = parseCsv(csvText);
      const dataRows = rows.slice(1).filter(r => r.length > 0 && r.some(c => c !== ""));
      if (dataRows.length > 0) {
        const sheetMenyusui = dataRows.map((row, idx) => ({
          id: (row[0] && row[0] !== "-" && row[0] !== "") ? row[0] : `ibum_${Date.now()}_${idx}`,
          namaIbu: row[1] || "",
          umur: parseInt(row[2]) || 25,
          nik: row[3] || "",
          alamat: row[4] || "",
          puskesmas: row[5] || "",
          kelurahan: row[6] || "",
          dusun: row[7] || "",
          posyandu: row[8] || "",
          bayiNama: row[9] || "",
          catatan: row[10] || ""
        }));
        sheetMenyusui.forEach(sm => {
          const idx = ibuMenyusui.findIndex(i => i.id === sm.id || (sm.nik && i.nik === sm.nik));
          if (idx !== -1) {
            ibuMenyusui[idx] = { ...ibuMenyusui[idx], ...sm };
          } else {
            ibuMenyusui.push(sm);
          }
        });
      }
    }

    const timbangRes = await fetch(`https://docs.google.com/spreadsheets/d/${adminSheetId}/gviz/tq?tqx=out:csv&sheet=Catatan%20Timbang`);
    if (timbangRes.ok) {
      const csvText = await timbangRes.text();
      const rows = parseCsv(csvText);
      const dataRows = rows.slice(1).filter(r => r.length > 1 && r[0] && r[0] !== "" && r[0] !== "ID Penerima");
      if (dataRows.length > 0) {
        dataRows.forEach(row => {
          const benId = row[0];
          const rec = {
            period: row[3] || "Maret 2026",
            weightKg: parseFloat(row[4]) || 12,
            heightCm: parseFloat(row[5]) || 90,
            statusGizi: row[6] || "Normal",
            measuredAt: row[7] || new Date().toISOString()
          };
          const ben = beneficiaries.find(b => b.id === benId);
          if (ben) {
            if (!ben.weightRecords) ben.weightRecords = [];
            const exists = ben.weightRecords.some(r => r.period === rec.period);
            if (!exists) {
              ben.weightRecords.push(rec);
            }
          }
        });
      }
    }

    saveStoreToDisk();
  } catch (e) {
    console.warn("Gagal auto import dari Google Sheet saat startup:", e);
  }
}

autoImportFromGoogleSheet();

// Helper to get score out of fraction
function getRatioScore(nominator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((nominator / denominator) * 100)));
}

// Helper to calculate a single village's performance score (0-100)
function calculateVillageScore(v: Village): number {
  // Pilar 1: Integrasi Data
  const p1 = Math.round((
    getRatioScore(v.pilar1_mbg_sync, v.pilar1_mbg_total) +
    getRatioScore(v.pilar1_pmt_sync, v.pilar1_pmt_total) +
    getRatioScore(v.pilar1_posyandu_sync, v.pilar1_posyandu_total) +
    getRatioScore(v.pilar1_eppgbm_sync, v.pilar1_eppgbm_total)
  ) / 4);

  // Pilar 2: Kolaborasi OPD
  const p2_active_count = (v.pilar2_dinkes_aktif ? 1 : 0) +
                          (v.pilar2_bgn_aktif ? 1 : 0) +
                          (v.pilar2_pkk_aktif ? 1 : 0) +
                          (v.pilar2_pemdes_aktif ? 1 : 0) +
                          (v.pilar2_puskesmas_aktif ? 1 : 0);
  const p2 = Math.round((p2_active_count / 5) * 100);

  // Pilar 3: Digitalisasi
  const p3_active_count = (v.pilar3_dashboard_online ? 1 : 0) +
                          (v.pilar3_validasi_data ? 1 : 0) +
                          (v.pilar3_real_time_update ? 1 : 0);
  const p3 = Math.round((p3_active_count / 3) * 100);

  // Pilar 4: Pelayanan Gizi
  const p4 = Math.round((
    getRatioScore(v.pilar4_mbg_realized, v.pilar4_mbg_target) +
    getRatioScore(v.pilar4_pmt_realized, v.pilar4_pmt_target) +
    getRatioScore(v.pilar4_home_visit, v.pilar4_home_visit_target) +
    getRatioScore(v.pilar4_posyandu_aktif, v.pilar4_posyandu_total)
  ) / 4);

  // Pilar 5: Outcome
  // Stunting Reduction
  let stunting_score = 100;
  if (v.pilar5_stunting_prev > 0) {
    if (v.pilar5_stunting_curr < v.pilar5_stunting_prev) {
      stunting_score = 100;
    } else if (v.pilar5_stunting_curr === v.pilar5_stunting_prev) {
      stunting_score = 75;
    } else {
      stunting_score = Math.max(0, Math.round(75 - ((v.pilar5_stunting_curr - v.pilar5_stunting_prev) / v.pilar5_stunting_prev) * 100));
    }
  }

  // Wasting Reduction
  let wasting_score = 100;
  if (v.pilar5_wasting_prev > 0) {
    if (v.pilar5_wasting_curr < v.pilar5_wasting_prev) {
      wasting_score = 100;
    } else if (v.pilar5_wasting_curr === v.pilar5_wasting_prev) {
      wasting_score = 75;
    } else {
      wasting_score = Math.max(0, Math.round(75 - ((v.pilar5_wasting_curr - v.pilar5_wasting_prev) / v.pilar5_wasting_prev) * 100));
    }
  }

  const p5 = Math.round((stunting_score + wasting_score + v.pilar5_target_accuracy) / 3);

  // Weighted score
  const total = p1 * weights.pilar1 +
                p2 * weights.pilar2 +
                p3 * weights.pilar3 +
                p4 * weights.pilar4 +
                p5 * weights.pilar5;

  return Math.round(total);
}

// Function to calculate and construct full data model based on live villages
function buildAppData() {
  // 1. Recalculate each village's individual score and risk level
  villages.forEach(v => {
    v.score = calculateVillageScore(v);
    if (v.score < 50) v.riskLevel = "Merah";
    else if (v.score <= 75) v.riskLevel = "Kuning";
    else v.riskLevel = "Hijau";
  });

  // Helper to get totals
  const totalVillages = villages.length || 1;

  // 2. Sums for Pilar 1
  const mbg_sync_sum = villages.reduce((acc, v) => acc + v.pilar1_mbg_sync, 0);
  const mbg_total_sum = villages.reduce((acc, v) => acc + v.pilar1_mbg_total, 0);
  const pmt_sync_sum = villages.reduce((acc, v) => acc + v.pilar1_pmt_sync, 0);
  const pmt_total_sum = villages.reduce((acc, v) => acc + v.pilar1_pmt_total, 0);
  const pos_sync_sum = villages.reduce((acc, v) => acc + v.pilar1_posyandu_sync, 0);
  const pos_total_sum = villages.reduce((acc, v) => acc + v.pilar1_posyandu_total, 0);
  const epp_sync_sum = villages.reduce((acc, v) => acc + v.pilar1_eppgbm_sync, 0);
  const epp_total_sum = villages.reduce((acc, v) => acc + v.pilar1_eppgbm_total, 0);

  // 3. Counts for Pilar 2
  const dinkes_aktif_count = villages.filter(v => v.pilar2_dinkes_aktif).length;
  const bgn_aktif_count = villages.filter(v => v.pilar2_bgn_aktif).length;
  const pkk_aktif_count = villages.filter(v => v.pilar2_pkk_aktif).length;
  const pemdes_aktif_count = villages.filter(v => v.pilar2_pemdes_aktif).length;
  const puskesmas_aktif_count = villages.filter(v => v.pilar2_puskesmas_aktif).length;

  // 4. Counts for Pilar 3
  const dashboard_online_count = villages.filter(v => v.pilar3_dashboard_online).length;
  const validasi_data_count = villages.filter(v => v.pilar3_validasi_data).length;
  const real_time_update_count = villages.filter(v => v.pilar3_real_time_update).length;

  // 5. Sums for Pilar 4
  const mbg_realized_sum = villages.reduce((acc, v) => acc + v.pilar4_mbg_realized, 0);
  const mbg_target_sum = villages.reduce((acc, v) => acc + v.pilar4_mbg_target, 0);
  const pmt_realized_sum = villages.reduce((acc, v) => acc + v.pilar4_pmt_realized, 0);
  const pmt_target_sum = villages.reduce((acc, v) => acc + v.pilar4_pmt_target, 0);
  const home_visit_sum = villages.reduce((acc, v) => acc + v.pilar4_home_visit, 0);
  const home_visit_target_sum = villages.reduce((acc, v) => acc + v.pilar4_home_visit_target, 0);
  const pos_aktif_sum = villages.reduce((acc, v) => acc + v.pilar4_posyandu_aktif, 0);
  const pos_total_sum_p4 = villages.reduce((acc, v) => acc + v.pilar4_posyandu_total, 0);

  // 6. Sums/Averages for Pilar 5
  const stunting_prev_sum = villages.reduce((acc, v) => acc + v.pilar5_stunting_prev, 0);
  const stunting_curr_sum = villages.reduce((acc, v) => acc + v.pilar5_stunting_curr, 0);
  const wasting_prev_sum = villages.reduce((acc, v) => acc + v.pilar5_wasting_prev, 0);
  const wasting_curr_sum = villages.reduce((acc, v) => acc + v.pilar5_wasting_curr, 0);
  const target_accuracy_avg = villages.reduce((acc, v) => acc + v.pilar5_target_accuracy, 0) / totalVillages;

  // Calculate dynamic indicator scores
  const mbg_data_score = getRatioScore(mbg_sync_sum, mbg_total_sum);
  const pmt_data_score = getRatioScore(pmt_sync_sum, pmt_total_sum);
  const posyandu_data_score = getRatioScore(pos_sync_sum, pos_total_sum);
  const eppgbm_data_score = getRatioScore(epp_sync_sum, epp_total_sum);

  const dinkes_score = Math.round((dinkes_aktif_count / totalVillages) * 100);
  const bgn_score = Math.round((bgn_aktif_count / totalVillages) * 100);
  const pkk_score = Math.round((pkk_aktif_count / totalVillages) * 100);
  const pemdes_score = Math.round((pemdes_aktif_count / totalVillages) * 100);
  const puskesmas_score = Math.round((puskesmas_aktif_count / totalVillages) * 100);

  const dashboard_score = Math.round((dashboard_online_count / totalVillages) * 100);
  const validation_score = Math.round((validasi_data_count / totalVillages) * 100);
  const real_time_score = Math.round((real_time_update_count / totalVillages) * 100);

  const mbg_coverage_score = getRatioScore(mbg_realized_sum, mbg_target_sum);
  const pmt_coverage_score = getRatioScore(pmt_realized_sum, pmt_target_sum);
  const home_visit_score = getRatioScore(home_visit_sum, home_visit_target_sum);
  const posyandu_active_score = getRatioScore(pos_aktif_sum, pos_total_sum_p4);

  // Outcome score calculations
  let stunting_reduction_score = villages.length > 0 ? 100 : 0;
  if (stunting_prev_sum > 0) {
    if (stunting_curr_sum < stunting_prev_sum) {
      stunting_reduction_score = 100;
    } else if (stunting_curr_sum === stunting_prev_sum) {
      stunting_reduction_score = 75;
    } else {
      stunting_reduction_score = Math.max(0, Math.round(75 - ((stunting_curr_sum - stunting_prev_sum) / stunting_prev_sum) * 100));
    }
  }

  let wasting_reduction_score = villages.length > 0 ? 100 : 0;
  if (wasting_prev_sum > 0) {
    if (wasting_curr_sum < wasting_prev_sum) {
      wasting_reduction_score = 100;
    } else if (wasting_curr_sum === wasting_prev_sum) {
      wasting_reduction_score = 75;
    } else {
      wasting_reduction_score = Math.max(0, Math.round(75 - ((wasting_curr_sum - wasting_prev_sum) / wasting_prev_sum) * 100));
    }
  }

  const accuracy_score = Math.round(target_accuracy_avg);

  // Construct Pillars object
  const pillarsList = [
    {
      id: "pilar1",
      name: "Pilar 1. Integrasi Data",
      weight: Math.round(weights.pilar1 * 100),
      indicators: [
        { id: "mbg_data", name: "Data MBG Terintegrasi", score: mbg_data_score, description: `Penerima data MBG tersinkronisasi (${mbg_sync_sum} dari ${mbg_total_sum} anak)` },
        { id: "pmt_data", name: "Data PMT Terintegrasi", score: pmt_data_score, description: `Data ibu hamil KEK & balita gizi kurang tersinkronisasi (${pmt_sync_sum} dari ${pmt_total_sum} sasaran)` },
        { id: "posyandu_data", name: "Data Posyandu Digital", score: posyandu_data_score, description: `Data pendaftaran & pengukuran posyandu terdigitalisasi (${pos_sync_sum} dari ${pos_total_sum} unit)` },
        { id: "eppgbm_data", name: "Data e-PPGBM Sinkron", score: eppgbm_data_score, description: `Integrasi dengan e-PPGBM Kemenkes RI (${epp_sync_sum} dari ${epp_total_sum} balita)` },
      ]
    },
    {
      id: "pilar2",
      name: "Pilar 2. Kolaborasi OPD",
      weight: Math.round(weights.pilar2 * 100),
      indicators: [
        { id: "dinkes", name: "Keaktifan Dinkes", score: dinkes_score, description: `Dinas Kesehatan aktif mendampingi puskesmas di ${dinkes_aktif_count} dari ${totalVillages} desa` },
        { id: "bgn", name: "Kemitraan BGN", score: bgn_score, description: `Badan Gizi Nasional terlibat di ${bgn_aktif_count} dari ${totalVillages} desa` },
        { id: "pkk", name: "Edukasi Tim PKK", score: pkk_score, description: `Kader PKK menyelenggarakan penyuluhan berkala di ${pkk_aktif_count} dari ${totalVillages} desa` },
        { id: "pemdes", name: "Dukungan Pemdes (Dana Desa)", score: pemdes_score, description: `Alokasi Dana Desa untuk stunting di ${pemdes_aktif_count} dari ${totalVillages} desa` },
        { id: "puskesmas", name: "Pendampingan Puskesmas", score: puskesmas_score, description: `Rujukan gizi buruk terpantau di ${puskesmas_aktif_count} dari ${totalVillages} desa` },
      ]
    },
    {
      id: "pilar3",
      name: "Pilar 3. Digitalisasi",
      weight: Math.round(weights.pilar3 * 100),
      indicators: [
        { id: "dashboard_online", name: "Dashboard Online Desa", score: dashboard_score, description: `Tersedianya dashboard publik online desa di ${dashboard_online_count} dari ${totalVillages} desa` },
        { id: "validation_flow", name: "Validasi Berjenjang Selesai", score: validation_score, description: `Penyelesaian validasi data gizi di ${validasi_data_count} dari ${totalVillages} desa` },
        { id: "real_time_update", name: "Sistem Pelaporan Real-Time", score: real_time_score, description: `Pelaporan data harian aktif di ${real_time_update_count} dari ${totalVillages} desa` },
      ]
    },
    {
      id: "pilar4",
      name: "Pilar 4. Pelayanan Gizi",
      weight: Math.round(weights.pilar4 * 100),
      indicators: [
        { id: "mbg_coverage", name: "Cakupan Layanan MBG", score: mbg_coverage_score, description: `Realisasi distribusi MBG sekolah mencapai ${mbg_realized_sum} dari ${mbg_target_sum} anak` },
        { id: "pmt_coverage", name: "Cakupan Layanan PMT", score: pmt_coverage_score, description: `Realisasi PMT ibu hamil & balita mencapai ${pmt_realized_sum} dari ${pmt_target_sum} sasaran` },
        { id: "home_visit", name: "Rasio Home Visit", score: home_visit_score, description: `Kunjungan rumah oleh kader mencapai ${home_visit_sum} dari ${home_visit_target_sum} sasaran prioritas` },
        { id: "posyandu_active", name: "Tingkat Keaktifan Posyandu", score: posyandu_active_score, description: `Kondisi posyandu aktif operasional mencapai ${pos_aktif_sum} dari ${pos_total_sum_p4} posyandu` },
      ]
    },
    {
      id: "pilar5",
      name: "Pilar 5. Outcome & Dampak",
      weight: Math.round(weights.pilar5 * 100),
      indicators: [
        { id: "stunting_reduction", name: "Penurunan Kasus Stunting", score: stunting_reduction_score, description: `Tren penurunan kumulatif kasus stunting (Dari ${stunting_prev_sum} kasus menjadi ${stunting_curr_sum} kasus)` },
        { id: "wasting_reduction", name: "Penurunan Kasus Wasting", score: wasting_reduction_score, description: `Tren penurunan kumulatif kasus wasting (Dari ${wasting_prev_sum} kasus menjadi ${wasting_curr_sum} kasus)` },
        { id: "target_accuracy", name: "Keakuratan Sasaran Penerima", score: accuracy_score, description: `Tingkat ketepatan sasaran intervensi gizi terpadu rata-rata di kabupaten` },
      ]
    }
  ];

  // Calculate Overall index score
  let indexScore = 0;
  pillarsList.forEach(p => {
    const avgScore = p.indicators.reduce((acc, i) => acc + i.score, 0) / p.indicators.length;
    indexScore += avgScore * (p.weight / 100);
  });
  indexScore = parseFloat(indexScore.toFixed(1));

  // Determine Category
  let categoryLabel: "Merah" | "Kuning" | "Hijau" = "Kuning";
  let categoryColor = "text-yellow-600 bg-yellow-50 border-yellow-200";
  let categoryDesc = "Waspada (Butuh Peningkatan Pelayanan & Koordinasi)";

  if (indexScore < 50) {
    categoryLabel = "Merah";
    categoryColor = "text-red-500 bg-red-50 border-red-200";
    categoryDesc = "Kritis (Butuh Intervensi Segera)";
  } else if (indexScore >= 75) {
    categoryLabel = "Hijau";
    categoryColor = "text-green-600 bg-green-50 border-green-200";
    categoryDesc = "Optimal (Sangat Baik & Berkelanjutan)";
  }

  // Create dynamic trend curves based on live village data
  const mbgMonthlyTrend = [
    { month: "Jan", target: Math.round(mbg_target_sum * 0.8), realized: Math.round(mbg_realized_sum * 0.75) },
    { month: "Feb", target: Math.round(mbg_target_sum * 0.85), realized: Math.round(mbg_realized_sum * 0.8) },
    { month: "Mar", target: Math.round(mbg_target_sum * 0.9), realized: Math.round(mbg_realized_sum * 0.85) },
    { month: "Apr", target: Math.round(mbg_target_sum * 0.95), realized: Math.round(mbg_realized_sum * 0.9) },
    { month: "May", target: mbg_target_sum, realized: Math.round(mbg_realized_sum * 0.95) },
    { month: "Jun", target: mbg_target_sum, realized: mbg_realized_sum },
  ];

  const pmtMonthlyTrend = [
    { month: "Jan", target: Math.round(pmt_target_sum * 0.8), realized: Math.round(pmt_realized_sum * 0.7) },
    { month: "Feb", target: Math.round(pmt_target_sum * 0.85), realized: Math.round(pmt_realized_sum * 0.75) },
    { month: "Mar", target: Math.round(pmt_target_sum * 0.9), realized: Math.round(pmt_realized_sum * 0.8) },
    { month: "Apr", target: Math.round(pmt_target_sum * 0.95), realized: Math.round(pmt_realized_sum * 0.9) },
    { month: "May", target: pmt_target_sum, realized: Math.round(pmt_realized_sum * 0.95) },
    { month: "Jun", target: pmt_target_sum, realized: pmt_realized_sum },
  ];

  return {
    kabupatenName,
    lastUpdated,
    adminSheetUrl,
    adminSheetId,
    weights,
    pillars: pillarsList,
    villages,
    mbgMonthlyTrend,
    pmtMonthlyTrend,
    indexScore,
    category: {
      label: categoryLabel,
      color: categoryColor,
      desc: categoryDesc
    }
  };
}

// API: Get App State
app.get("/api/data", async (req, res) => {
  await autoImportFromGoogleSheet();
  const aggregatedData = buildAppData();
  res.json({ ...aggregatedData, debug_rows_length: (global as any).lastMbgRowsLength });
});

// API: Get Beneficiaries List
app.get("/api/beneficiaries", async (req, res) => {
  await autoImportFromGoogleSheet();
  res.json({
    success: true,
    beneficiaries,
    ibuHamil,
    ibuMenyusui
  });
});

// API: Save or Update Beneficiary
app.post("/api/beneficiaries/save", (req, res) => {
  const ben = req.body;
  if (!ben || !ben.id) {
    return res.status(400).json({ error: "Data sasaran tidak valid (ID diperlukan)." });
  }

  const existingIdx = beneficiaries.findIndex(b => b.id === ben.id);
  if (existingIdx !== -1) {
    beneficiaries[existingIdx] = ben;
  } else {
    beneficiaries.unshift(ben);
  }

  saveStoreToDisk();

  res.json({
    success: true,
    message: `Data sasaran ${ben.name} berhasil disimpan di basis data server.`,
    beneficiaries,
    appData: buildAppData()
  });
});

// API: Delete Beneficiary
app.post("/api/beneficiaries/delete", (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "ID sasaran diperlukan." });
  }

  beneficiaries = beneficiaries.filter(b => b.id !== id);
  saveStoreToDisk();

  res.json({
    success: true,
    message: "Data sasaran berhasil dihapus dari server.",
    beneficiaries,
    appData: buildAppData()
  });
});

// API: Batch update beneficiaries
app.post("/api/beneficiaries/batch", (req, res) => {
  const { beneficiaries: newList } = req.body;
  if (Array.isArray(newList)) {
    newList.forEach(item => {
      const idx = beneficiaries.findIndex(b => b.id === item.id || (item.nik && b.nik === item.nik));
      if (idx !== -1) {
        beneficiaries[idx] = {
          ...beneficiaries[idx],
          ...item,
          weightRecords: (item.weightRecords && item.weightRecords.length > 0) ? item.weightRecords : beneficiaries[idx].weightRecords
        };
      } else {
        beneficiaries.push(item);
      }
    });
    saveStoreToDisk();
  }
  res.json({
    success: true,
    message: "Batch sasaran berhasil diperbarui.",
    beneficiaries,
    appData: buildAppData()
  });
});

// API: Get Ibu Hamil List
app.get("/api/ibu-hamil", (req, res) => {
  res.json({ success: true, list: ibuHamil });
});

// API: Batch update ibu hamil
app.post("/api/ibu-hamil/batch", (req, res) => {
  const { ibuHamil: newList } = req.body;
  if (Array.isArray(newList)) {
    newList.forEach(item => {
      const idx = ibuHamil.findIndex(i => i.id === item.id || (item.nik && i.nik === item.nik));
      if (idx !== -1) {
        ibuHamil[idx] = { ...ibuHamil[idx], ...item };
      } else {
        ibuHamil.push(item);
      }
    });
    saveStoreToDisk();
  }
  res.json({ success: true });
});

// API: Save or Update Ibu Hamil
app.post("/api/ibu-hamil/save", (req, res) => {
  const item = req.body;
  if (!item || !item.id) {
    return res.status(400).json({ error: "Data ibu hamil tidak valid (ID diperlukan)." });
  }
  const idx = ibuHamil.findIndex(b => b.id === item.id);
  if (idx !== -1) {
    ibuHamil[idx] = item;
  } else {
    ibuHamil.unshift(item);
  }
  saveStoreToDisk();
  res.json({ success: true, message: "Data Ibu Hamil berhasil disimpan ke server.", list: ibuHamil });
});

// API: Delete Ibu Hamil
app.post("/api/ibu-hamil/delete", (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "ID ibu hamil diperlukan." });
  }
  ibuHamil = ibuHamil.filter(b => b.id !== id);
  saveStoreToDisk();
  res.json({ success: true, message: "Data Ibu Hamil berhasil dihapus dari server.", list: ibuHamil });
});

// API: Get Ibu Menyusui List
app.get("/api/ibu-menyusui", (req, res) => {
  res.json({ success: true, list: ibuMenyusui });
});

// API: Batch update ibu menyusui
app.post("/api/ibu-menyusui/batch", (req, res) => {
  const { ibuMenyusui: newList } = req.body;
  if (Array.isArray(newList)) {
    newList.forEach(item => {
      const idx = ibuMenyusui.findIndex(i => i.id === item.id || (item.nik && i.nik === item.nik));
      if (idx !== -1) {
        ibuMenyusui[idx] = { ...ibuMenyusui[idx], ...item };
      } else {
        ibuMenyusui.push(item);
      }
    });
    saveStoreToDisk();
  }
  res.json({ success: true });
});

// API: Save or Update Ibu Menyusui
app.post("/api/ibu-menyusui/save", (req, res) => {
  const item = req.body;
  if (!item || !item.id) {
    return res.status(400).json({ error: "Data ibu menyusui tidak valid (ID diperlukan)." });
  }
  const idx = ibuMenyusui.findIndex(b => b.id === item.id);
  if (idx !== -1) {
    ibuMenyusui[idx] = item;
  } else {
    ibuMenyusui.unshift(item);
  }
  saveStoreToDisk();
  res.json({ success: true, message: "Data Ibu Menyusui berhasil disimpan ke server.", list: ibuMenyusui });
});

// API: Delete Ibu Menyusui
app.post("/api/ibu-menyusui/delete", (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "ID ibu menyusui diperlukan." });
  }
  ibuMenyusui = ibuMenyusui.filter(b => b.id !== id);
  saveStoreToDisk();
  res.json({ success: true, message: "Data Ibu Menyusui berhasil dihapus dari server.", list: ibuMenyusui });
});

// API: Get Banners List
app.get("/api/banners", (req, res) => {
  res.json({ success: true, bannerImages, dashboardBannerImages });
});

// API: Save Banners List
app.post("/api/banners/save", (req, res) => {
  const { type, images } = req.body;
  if (Array.isArray(images)) {
    if (type === "dashboard") {
      dashboardBannerImages = images;
    } else {
      bannerImages = images;
    }
    saveStoreToDisk();
  }
  res.json({ success: true, bannerImages, dashboardBannerImages });
});

// API: Get Visitor Logs
app.get("/api/analytics/visitor-logs", (req, res) => {
  res.json({ success: true, list: visitorLogs });
});

// API: Record Visitor Log
app.post("/api/analytics/visitor-logs/record", (req, res) => {
  const item = req.body;
  if (item && typeof item === "object") {
    const log = item.id ? item : {
      id: "v_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      email: item.email || "pengunjung@public.go.id",
      role: item.role || "PENGUNJUNG",
      viewName: item.viewName || "Halaman Utama",
      deviceInfo: item.deviceInfo || "Perangkat Web"
    };
    visitorLogs.unshift(log);
    if (visitorLogs.length > 2000) visitorLogs = visitorLogs.slice(0, 2000);
    saveStoreToDisk();
  }
  res.json({ success: true, list: visitorLogs });
});

// API: Clear Visitor Logs
app.post("/api/analytics/visitor-logs/clear", (req, res) => {
  visitorLogs = [];
  saveStoreToDisk();
  res.json({ success: true, list: [] });
});

// API: Get Audit Logs
app.get("/api/analytics/audit-logs", (req, res) => {
  res.json({ success: true, list: auditLogs });
});

// API: Record Audit Log
app.post("/api/analytics/audit-logs/record", (req, res) => {
  const item = req.body;
  if (item && typeof item === "object") {
    const log = item.id ? item : {
      id: "a_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      operatorName: item.operatorName || item.operator?.name || "Petugas Anonim",
      operatorRole: item.operatorRole || item.operator?.role || "Petugas Nakes",
      operatorInstansi: item.operatorInstansi || item.operator?.instansi || "Dinas Kesehatan / Puskesmas",
      operatorEmail: item.operatorEmail || item.operator?.email || "admin@nagekeo.go.id",
      actionType: item.actionType || "AKSES_SISTEM",
      description: item.description || "Melakukan tindakan pada sistem",
      targetName: item.targetName
    };
    auditLogs.unshift(log);
    if (auditLogs.length > 2000) auditLogs = auditLogs.slice(0, 2000);
    saveStoreToDisk();
  }
  res.json({ success: true, list: auditLogs });
});

// API: Clear Audit Logs
app.post("/api/analytics/audit-logs/clear", (req, res) => {
  auditLogs = [];
  saveStoreToDisk();
  res.json({ success: true, list: [] });
});

// API: Get Admin Sheet Config
app.get("/api/sheets/config", (req, res) => {
  res.json({
    success: true,
    adminSheetUrl,
    adminSheetId
  });
});

// API: Update Admin Sheet Config
app.post("/api/sheets/config", (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "URL Sheet Admin tidak valid." });
  }

  adminSheetUrl = url.trim();
  const match = adminSheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    adminSheetId = match[1];
  }
  saveStoreToDisk();

  res.json({
    success: true,
    message: "URL Google Sheet Admin berhasil diperbarui.",
    adminSheetUrl,
    adminSheetId
  });
});

// API: Pull data from Google Sheet
app.post("/api/sheets/pull", async (req, res) => {
  try {
    await autoImportFromGoogleSheet();
    res.json({
      success: true,
      message: "Data berhasil ditarik dan dimuat dari Google Sheet!",
      ...buildAppData()
    });
  } catch (e: any) {
    res.status(500).json({ error: "Gagal menarik data dari Google Sheet: " + e.message });
  }
});

// API: Save/Update weights
app.post("/api/weights/update", (req, res) => {
  const { pilar1, pilar2, pilar3, pilar4, pilar5 } = req.body;
  const sum = pilar1 + pilar2 + pilar3 + pilar4 + pilar5;
  if (Math.abs(sum - 1.0) > 0.01) {
    return res.status(400).json({ error: "Total bobot harus bernilai tepat 100% (1.0). Sekarang: " + (sum * 100).toFixed(0) + "%" });
  }

  weights = { pilar1, pilar2, pilar3, pilar4, pilar5 };
  saveStoreToDisk();

  res.json({
    success: true,
    message: "Bobot pilar berhasil diperbarui",
    ...buildAppData()
  });
});

// API: Add New Village / Unit
app.post("/api/villages/add", (req, res) => {
  const { name, unitType } = req.body;
  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Nama unit/wilayah tidak boleh kosong." });
  }

  const id = "v_" + Date.now();
  // generate standard initial values for a new village/unit so they can edit it
  const newVillage: Village = {
    id,
    name: name.trim(),
    unitType: unitType || "Desa",
    riskLevel: "Kuning" as const,
    score: 50,
    coordinates: {
      x: parseFloat((121.15 + Math.random() * 0.20).toFixed(4)), // Longitude
      y: parseFloat((-8.85 + Math.random() * 0.30).toFixed(4))  // Latitude
    },
    // Pilar 1 Raw Inputs
    pilar1_mbg_sync: 0,
    pilar1_mbg_total: 100,
    pilar1_pmt_sync: 0,
    pilar1_pmt_total: 20,
    pilar1_posyandu_sync: 0,
    pilar1_posyandu_total: 3,
    pilar1_eppgbm_sync: 0,
    pilar1_eppgbm_total: 100,
    // Pilar 2 Toggles
    pilar2_dinkes_aktif: false,
    pilar2_bgn_aktif: false,
    pilar2_pkk_aktif: false,
    pilar2_pemdes_aktif: false,
    pilar2_puskesmas_aktif: false,
    // Pilar 3 Toggles
    pilar3_dashboard_online: false,
    pilar3_validasi_data: false,
    pilar3_real_time_update: false,
    // Pilar 4 Raw counts
    pilar4_mbg_realized: 0,
    pilar4_mbg_target: 100,
    pilar4_pmt_realized: 0,
    pilar4_pmt_target: 20,
    pilar4_home_visit: 0,
    pilar4_home_visit_target: 10,
    pilar4_posyandu_aktif: 0,
    pilar4_posyandu_total: 3,
    // Pilar 5 raw counts
    pilar5_stunting_prev: 10,
    pilar5_stunting_curr: 10,
    pilar5_wasting_prev: 5,
    pilar5_wasting_curr: 5,
    pilar5_target_accuracy: 50
  };

  villages.push(newVillage);
  saveStoreToDisk();

  res.json({
    success: true,
    message: `Desa ${name} berhasil ditambahkan ke basis data.`,
    ...buildAppData()
  });
});

// API: Delete a Village
app.post("/api/villages/delete", (req, res) => {
  const { id } = req.body;
  const initialLength = villages.length;
  villages = villages.filter(v => v.id !== id);

  if (villages.length === initialLength) {
    return res.status(404).json({ error: "Desa tidak ditemukan." });
  }

  saveStoreToDisk();
  res.json({
    success: true,
    message: "Desa berhasil dihapus.",
    ...buildAppData()
  });
});

// API: Update Village Raw Data completely
app.post("/api/villages/update", (req, res) => {
  const data = req.body;
  if (!data.id) {
    return res.status(400).json({ error: "ID desa diperlukan." });
  }

  const vIdx = villages.findIndex(v => v.id === data.id);
  if (vIdx === -1) {
    return res.status(404).json({ error: "Desa tidak ditemukan." });
  }

  const v = villages[vIdx];

  // Helper function to update numeric fields safely
  const updateNum = (key: keyof typeof v, val: any) => {
    if (typeof val === "number" && !isNaN(val)) {
      (v as any)[key] = val;
    }
  };

  // Helper function to update boolean fields safely
  const updateBool = (key: keyof typeof v, val: any) => {
    if (typeof val === "boolean") {
      (v as any)[key] = val;
    }
  };

  // Update Name, unitType & position if present
  if (data.name && typeof data.name === "string" && data.name.trim() !== "") {
    v.name = data.name.trim();
  }
  if (data.unitType && typeof data.unitType === "string") {
    v.unitType = data.unitType as any;
  }
  if (data.coordinates && typeof data.coordinates.x === "number" && typeof data.coordinates.y === "number") {
    v.coordinates = data.coordinates;
  }

  // Pilar 1
  updateNum("pilar1_mbg_sync", data.pilar1_mbg_sync);
  updateNum("pilar1_mbg_total", data.pilar1_mbg_total);
  updateNum("pilar1_pmt_sync", data.pilar1_pmt_sync);
  updateNum("pilar1_pmt_total", data.pilar1_pmt_total);
  updateNum("pilar1_posyandu_sync", data.pilar1_posyandu_sync);
  updateNum("pilar1_posyandu_total", data.pilar1_posyandu_total);
  updateNum("pilar1_eppgbm_sync", data.pilar1_eppgbm_sync);
  updateNum("pilar1_eppgbm_total", data.pilar1_eppgbm_total);

  // Pilar 2
  updateBool("pilar2_dinkes_aktif", data.pilar2_dinkes_aktif);
  updateBool("pilar2_bgn_aktif", data.pilar2_bgn_aktif);
  updateBool("pilar2_pkk_aktif", data.pilar2_pkk_aktif);
  updateBool("pilar2_pemdes_aktif", data.pilar2_pemdes_aktif);
  updateBool("pilar2_puskesmas_aktif", data.pilar2_puskesmas_aktif);

  // Pilar 3
  updateBool("pilar3_dashboard_online", data.pilar3_dashboard_online);
  updateBool("pilar3_validasi_data", data.pilar3_validasi_data);
  updateBool("pilar3_real_time_update", data.pilar3_real_time_update);

  // Pilar 4
  updateNum("pilar4_mbg_realized", data.pilar4_mbg_realized);
  updateNum("pilar4_mbg_target", data.pilar4_mbg_target);
  updateNum("pilar4_pmt_realized", data.pilar4_pmt_realized);
  updateNum("pilar4_pmt_target", data.pilar4_pmt_target);
  updateNum("pilar4_home_visit", data.pilar4_home_visit);
  updateNum("pilar4_home_visit_target", data.pilar4_home_visit_target);
  updateNum("pilar4_posyandu_aktif", data.pilar4_posyandu_aktif);
  updateNum("pilar4_posyandu_total", data.pilar4_posyandu_total);

  // Pilar 5
  updateNum("pilar5_stunting_prev", data.pilar5_stunting_prev);
  updateNum("pilar5_stunting_curr", data.pilar5_stunting_curr);
  updateNum("pilar5_wasting_prev", data.pilar5_wasting_prev);
  updateNum("pilar5_wasting_curr", data.pilar5_wasting_curr);
  updateNum("pilar5_target_accuracy", data.pilar5_target_accuracy);

  saveStoreToDisk();

  res.json({
    success: true,
    message: `Data desa ${v.name} berhasil diperbarui.`,
    ...buildAppData()
  });
});

// API: Reset dataset to initial
app.post("/api/data/reset", (req, res) => {
  villages = JSON.parse(JSON.stringify(SEED_VILLAGES));
  beneficiaries = JSON.parse(JSON.stringify(SEED_BENEFICIARIES));
  weights = {
    pilar1: 0.10,
    pilar2: 0.30,
    pilar3: 0.10,
    pilar4: 0.25,
    pilar5: 0.25
  };
  saveStoreToDisk();
  res.json({
    success: true,
    message: "Basis data direset ke kondisi standar.",
    ...buildAppData()
  });
});

// API: Clear all villages data completely
app.post("/api/data/clear", (req, res) => {
  villages = [];
  beneficiaries = [];
  saveStoreToDisk();
  res.json({
    success: true,
    message: "Semua data desa berhasil dihapus. Sistem sekarang kosong.",
    ...buildAppData()
  });
});

// API: Generate policy recommendations with Gemini API
app.post("/api/recommendations", async (req, res) => {
  const aggregatedData = buildAppData();
  const indexScore = aggregatedData.indexScore;
  const category = aggregatedData.category;
  
  // Format current pillars/indicators for the prompt
  const pillarStatusText = aggregatedData.pillars.map(p => {
    const avgScore = p.indicators.reduce((acc, i) => acc + i.score, 0) / p.indicators.length;
    const indicatorsText = p.indicators.map(i => `- ${i.name}: ${i.score}/100`).join("\n");
    return `### ${p.name} (Bobot: ${p.weight}%, Skor Rata-rata: ${avgScore.toFixed(1)}/100)\n${indicatorsText}`;
  }).join("\n\n");

  const villageStatusText = aggregatedData.villages.map(v => 
    `- ${v.name}: Skor ${v.score}/100 (${v.riskLevel}), Kasus Stunting: ${v.pilar5_stunting_curr} (Bulan lalu: ${v.pilar5_stunting_prev}), Posyandu Aktif: ${v.pilar4_posyandu_aktif}/${v.pilar4_posyandu_total}`
  ).join("\n");

  const prompt = `
Anda adalah konsultan gizi ahli dan analis kebijakan publik senior di Indonesia.
Berdasarkan data "Indeks Transformasi Orbit Gizi" terbaru untuk daerah kabupaten berikut:

Nama Kabupaten: ${aggregatedData.kabupatenName}
Skor Indeks Keseluruhan: ${indexScore} / 100
Kategori Status Kabupaten: ${category.label} (${category.desc})

Berikut detail pilar beserta skor indikator-indikatornya (dihitung secara matematis dari input riil desa-desa):
${pillarStatusText}

Kondisi Risiko Desa (Diinput Riil oleh Pengguna):
${villageStatusText}

Tolong berikan Analisis Risiko dan Rekomendasi Kebijakan yang konkret, aplikatif, dan strategis dengan struktur output menggunakan Bahasa Indonesia yang formal namun humanis:

1. **Analisis Risiko Utama**: Identifikasi pilar atau indikator terlemah (skor paling rendah) dan jelaskan dampaknya jika tidak diintervensi (misal: real-time update rendah, kolaborasi pemdes rendah, kunjungan rumah rendah).
2. **Prioritas Sasaran**: Desa mana saja yang harus diprioritaskan terlebih dahulu dan apa alasannya berdasarkan statistik desa (misal: Desa Cilaku dengan risiko Merah).
3. **Rekomendasi Kebijakan Konkret**:
   - Berikan rekomendasi spesifik untuk masing-masing pilar yang lemah.
   - Usulkan langkah kolaborasi OPD (Dinkes, PKK, Pemdes, BGN, Puskesmas) untuk meluncurkan program bersama.
   - Cara meningkatkan integrasi data gizi (Data MBG, Data PMT, Data Posyandu, Data e-PPGBM).
4. **Target Jangka Pendek (3 Bulan)**: Apa indikator utama keberhasilan jangka pendek yang harus dicapai.

Tulis rekomendasi kebijakan ini dengan format Markdown yang indah, rapi, inspiratif, dan mudah dibaca oleh Bupati, Kepala Dinas Kesehatan, Kepala Puskesmas, dan Kepala Desa. Hindari bahasa yang terlalu akademis atau jargon teknis yang tidak perlu.
  `;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      // If API Key is not set or placeholder, return a highly rich, dynamic local response based on current low scores
      console.log("Gemini API Key missing or placeholder. Generating local smart recommendations...");
      
      // Find the weakest pilar
      let weakestPillar = aggregatedData.pillars[0];
      let lowestAvg = 100;
      aggregatedData.pillars.forEach(p => {
        const avg = p.indicators.reduce((sum, i) => sum + i.score, 0) / p.indicators.length;
        if (avg < lowestAvg) {
          lowestAvg = avg;
          weakestPillar = p;
        }
      });

      const localResponse = `
### 🏢 REKOMENDASI KEBIJAKAN STRATEGIS: TRANSFORMATION ORBIT GIZI
*Rekomendasi ini disusun secara dinamis berdasarkan analisis data real-time indikator Kabupaten.*

---

#### 1. ⚠️ Analisis Risiko Utama (Fokus pada Pilar Terlemah)
Berdasarkan analisis performa, **${weakestPillar.name}** adalah pilar dengan skor rata-rata terendah yaitu **${lowestAvg.toFixed(1)}/100**. 
* **Risiko Fatal**: Hambatan utama terletak pada indikator dengan skor di bawah optimal. Jika tidak segera diintervensi, kesenjangan data dan kurangnya integrasi layanan akan menyebabkan bantuan makanan bergizi gratis (MBG) dan pemberian makanan tambahan (PMT) salah sasaran.
* **Kerentanan Sektoral**: Koordinasi antar-instansi (OPD) seperti Dinas Kesehatan, PKK, dan Pemerintah Desa masih perlu disinkronkan, terutama dalam pemanfaatan Dana Desa untuk posyandu aktif dan pendampingan gizi di lapangan.

#### 2. 🎯 Prioritas Sasaran (Desa Berisiko Tinggi)
* **Desa dengan Kasus Tertinggi**: Desa-desa yang berstatus Merah atau Kuning dengan peningkatan atau tingginya prevalensi stunting membutuhkan intervensi mendesak.
* Upayakan bantuan khusus dan aktivasi Posyandu di daerah berkinerja rendah untuk menghentikan laju stunting baru.

#### 3. 🛠️ Rekomendasi Kebijakan Konkret & Kolaborasi OPD
* **Aktivasi Posyandu Mandiri (Kolaborasi Pemdes & Dinkes & PKK)**:
  Bupati mengeluarkan Instruksi Bersama untuk mewajibkan alokasi minimal 10% Dana Desa untuk operasional Posyandu, insentif kader PKK, dan pengadaan timbangan digital standar Kemenkes.
* **Sinkronisasi Data Multi-Sektor (Kolaborasi BGN & Dinkes)**:
  Mengintegrasikan sistem pelaporan e-PPGBM Puskesmas secara real-time dengan data penerima program Makan Bergizi Gratis (MBG) dari Badan Gizi Nasional untuk memastikan balita *stunting* mendapat porsi protein ganda.
* **Gerakan Home Visit Terpadu (Kolaborasi Puskesmas & Kader PKK)**:
  Meluncurkan program *"Satu Kader Satu Balita Berisiko Gizi"* untuk kunjungan mingguan guna memantau asupan PMT lokal secara langsung di rumah tangga sasaran.

#### 4. 📈 Target Jangka Pendek (3 Bulan)
* Re-aktivasi Posyandu di Desa prioritas tinggi menjadi 100% Aktif pada bulan pertama.
* Integrasi data rujukan e-PPGBM dan MBG mencapai 95% tingkat kevalidan.
* Penurunan jumlah balita berisiko stunting di Desa Prioritas minimal sebesar 15% melalui pemantauan intensif.
      `;
      return res.json({ text: localResponse, source: "local_simulation" });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    res.json({ text: response.text, source: "gemini" });

  } catch (error: any) {
    console.error("Gemini API Error, falling back to local simulation:", error);
    
    // Fallback to local dynamic recommendation engine
    let weakestPillar = aggregatedData.pillars[0];
    let lowestAvg = 100;
    aggregatedData.pillars.forEach(p => {
      const avg = p.indicators.reduce((sum, i) => sum + i.score, 0) / p.indicators.length;
      if (avg < lowestAvg) {
        lowestAvg = avg;
        weakestPillar = p;
      }
    });

    const localResponse = `
### 🏢 REKOMENDASI KEBIJAKAN STRATEGIS: TRANSFORMATION ORBIT GIZI
*Rekomendasi ini disusun secara dinamis berdasarkan pemutakhiran data gizi kabupaten.*

---

#### 1. ⚠️ Analisis Risiko Utama (Fokus pada Pilar Terlemah)
Berdasarkan analisis performa, **${weakestPillar.name}** adalah pilar dengan skor rata-rata terendah yaitu **${lowestAvg.toFixed(1)}/100**. 
* **Risiko Fatal**: Hambatan utama terletak pada indikator dengan skor di bawah optimal. Jika tidak segera diintervensi, kesenjangan data dan kurangnya integrasi layanan akan menyebabkan bantuan makanan bergizi gratis (MBG) dan pemberian makanan tambahan (PMT) salah sasaran.
* **Kerentanan Sektoral**: Koordinasi antar-instansi (OPD) seperti Dinas Kesehatan, PKK, dan Pemerintah Desa masih perlu disinkronkan, terutama dalam pemanfaatan Dana Desa untuk posyandu aktif dan pendampingan gizi di lapangan.

#### 2. 🎯 Prioritas Sasaran (Desa Berisiko Tinggi)
${aggregatedData.villages.length > 0 
  ? `* **Desa Prioritas**: ${aggregatedData.villages.filter(v => v.riskLevel === "Merah" || v.riskLevel === "Kuning").map(v => v.name).slice(0, 3).join(", ") || "Semua desa terpantau stabil."}`
  : `* **Desa Prioritas**: Belum ada data desa yang tersedia.`}
* Upayakan bantuan khusus dan aktivasi Posyandu di daerah berkinerja rendah untuk menghentikan laju stunting baru.

#### 3. 🛠️ Rekomendasi Kebijakan Konkret & Kolaborasi OPD
* **Aktivasi Posyandu Mandiri (Kolaborasi Pemdes & Dinkes & PKK)**:
  Bupati mengeluarkan Instruksi Bersama untuk mewajibkan alokasi minimal 10% Dana Desa untuk operasional Posyandu, insentif kader PKK, dan pengadaan timbangan digital standar Kemenkes.
* **Sinkronisasi Data Multi-Sektor (Kolaborasi BGN & Dinkes)**:
  Mengintegrasikan sistem pelaporan e-PPGBM Puskesmas secara real-time dengan data penerima program Makan Bergizi Gratis (MBG) dari Badan Gizi Nasional untuk memastikan balita *stunting* mendapat porsi protein ganda.
* **Gerakan Home Visit Terpadu (Kolaborasi Puskesmas & Kader PKK)**:
  Meluncurkan program *"Satu Kader Satu Balita Berisiko Gizi"* untuk kunjungan mingguan guna memantau asupan PMT lokal secara langsung di rumah tangga sasaran.

#### 4. 📈 Target Jangka Pendek (3 Bulan)
* Re-aktivasi Posyandu di Desa prioritas tinggi menjadi 100% Aktif pada bulan pertama.
* Integrasi data rujukan e-PPGBM dan MBG mencapai 95% tingkat kevalidan.
* Penurunan jumlah balita berisiko stunting di Desa Prioritas minimal sebesar 15% melalui pemantauan intensif.
    `;
    res.json({ text: localResponse, source: "local_simulation_fallback" });
  }
});

// Setup Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
