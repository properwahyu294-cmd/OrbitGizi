import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Dynamic Initial Villages Database
let villages = [
  {
    id: "v1",
    name: "Desa Labolewa",
    riskLevel: "Hijau" as const,
    score: 92,
    coordinates: { x: 121.275, y: -8.604 },
    pilar1_mbg_sync: 240,
    pilar1_mbg_total: 240,
    pilar1_pmt_sync: 45,
    pilar1_pmt_total: 45,
    pilar1_posyandu_sync: 5,
    pilar1_posyandu_total: 5,
    pilar1_eppgbm_sync: 250,
    pilar1_eppgbm_total: 250,
    pilar2_dinkes_aktif: true,
    pilar2_bgn_aktif: true,
    pilar2_pkk_aktif: true,
    pilar2_pemdes_aktif: true,
    pilar2_puskesmas_aktif: true,
    pilar3_dashboard_online: true,
    pilar3_validasi_data: true,
    pilar3_real_time_update: true,
    pilar4_mbg_realized: 240,
    pilar4_mbg_target: 240,
    pilar4_pmt_realized: 45,
    pilar4_pmt_target: 45,
    pilar4_home_visit: 15,
    pilar4_home_visit_target: 15,
    pilar4_posyandu_aktif: 5,
    pilar4_posyandu_total: 5,
    pilar5_stunting_prev: 15,
    pilar5_stunting_curr: 10,
    pilar5_wasting_prev: 8,
    pilar5_wasting_curr: 4,
    pilar5_target_accuracy: 95
  },
  {
    id: "v2",
    name: "Desa Kelewae",
    riskLevel: "Kuning" as const,
    score: 68,
    coordinates: { x: 121.208, y: -8.758 },
    pilar1_mbg_sync: 150,
    pilar1_mbg_total: 310,
    pilar1_pmt_sync: 80,
    pilar1_pmt_total: 80,
    pilar1_posyandu_sync: 3,
    pilar1_posyandu_total: 5,
    pilar1_eppgbm_sync: 180,
    pilar1_eppgbm_total: 310,
    pilar2_dinkes_aktif: true,
    pilar2_bgn_aktif: false,
    pilar2_pkk_aktif: true,
    pilar2_pemdes_aktif: true,
    pilar2_puskesmas_aktif: false,
    pilar3_dashboard_online: false,
    pilar3_validasi_data: true,
    pilar3_real_time_update: false,
    pilar4_mbg_realized: 230,
    pilar4_mbg_target: 310,
    pilar4_pmt_realized: 75,
    pilar4_pmt_target: 80,
    pilar4_home_visit: 12,
    pilar4_home_visit_target: 28,
    pilar4_posyandu_aktif: 4,
    pilar4_posyandu_total: 5,
    pilar5_stunting_prev: 30,
    pilar5_stunting_curr: 28,
    pilar5_wasting_prev: 15,
    pilar5_wasting_curr: 13,
    pilar5_target_accuracy: 82
  },
  {
    id: "v3",
    name: "Desa Selalejo",
    riskLevel: "Merah" as const,
    score: 38,
    coordinates: { x: 121.196, y: -8.841 },
    pilar1_mbg_sync: 0,
    pilar1_mbg_total: 180,
    pilar1_pmt_sync: 20,
    pilar1_pmt_total: 110,
    pilar1_posyandu_sync: 1,
    pilar1_posyandu_total: 4,
    pilar1_eppgbm_sync: 40,
    pilar1_eppgbm_total: 180,
    pilar2_dinkes_aktif: false,
    pilar2_bgn_aktif: false,
    pilar2_pkk_aktif: true,
    pilar2_pemdes_aktif: false,
    pilar2_puskesmas_aktif: true,
    pilar3_dashboard_online: false,
    pilar3_validasi_data: false,
    pilar3_real_time_update: false,
    pilar4_mbg_realized: 45,
    pilar4_mbg_target: 180,
    pilar4_pmt_realized: 25,
    pilar4_pmt_target: 110,
    pilar4_home_visit: 5,
    pilar4_home_visit_target: 45,
    pilar4_posyandu_aktif: 1,
    pilar4_posyandu_total: 4,
    pilar5_stunting_prev: 40,
    pilar5_stunting_curr: 42,
    pilar5_wasting_prev: 20,
    pilar5_wasting_curr: 22,
    pilar5_target_accuracy: 50
  },
  {
    id: "v4",
    name: "Desa Olaia",
    riskLevel: "Kuning" as const,
    score: 72,
    coordinates: { x: 121.291, y: -8.622 },
    pilar1_mbg_sync: 210,
    pilar1_mbg_total: 290,
    pilar1_pmt_sync: 60,
    pilar1_pmt_total: 65,
    pilar1_posyandu_sync: 3,
    pilar1_posyandu_total: 4,
    pilar1_eppgbm_sync: 200,
    pilar1_eppgbm_total: 290,
    pilar2_dinkes_aktif: true,
    pilar2_bgn_aktif: true,
    pilar2_pkk_aktif: false,
    pilar2_pemdes_aktif: true,
    pilar2_puskesmas_aktif: true,
    pilar3_dashboard_online: true,
    pilar3_validasi_data: true,
    pilar3_real_time_update: false,
    pilar4_mbg_realized: 250,
    pilar4_mbg_target: 290,
    pilar4_pmt_realized: 60,
    pilar4_pmt_target: 65,
    pilar4_home_visit: 15,
    pilar4_home_visit_target: 22,
    pilar4_posyandu_aktif: 3,
    pilar4_posyandu_total: 4,
    pilar5_stunting_prev: 25,
    pilar5_stunting_curr: 23,
    pilar5_wasting_prev: 12,
    pilar5_wasting_curr: 10,
    pilar5_target_accuracy: 78
  }
];

let weights = {
  pilar1: 0.10, // Integrasi Data
  pilar2: 0.30, // Kolaborasi
  pilar3: 0.10, // Digitalisasi
  pilar4: 0.25, // Pelayanan
  pilar5: 0.25, // Outcome
};

let kabupatenName = "Kabupaten Nagekeo";
let lastUpdated = new Date().toISOString();

// Helper to get score out of fraction
function getRatioScore(nominator: number, denominator: number): number {
  if (denominator <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round((nominator / denominator) * 100)));
}

// Helper to calculate a single village's performance score (0-100)
function calculateVillageScore(v: typeof villages[0]): number {
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
  let stunting_reduction_score = 100;
  if (stunting_prev_sum > 0) {
    if (stunting_curr_sum < stunting_prev_sum) {
      stunting_reduction_score = 100;
    } else if (stunting_curr_sum === stunting_prev_sum) {
      stunting_reduction_score = 75;
    } else {
      stunting_reduction_score = Math.max(0, Math.round(75 - ((stunting_curr_sum - stunting_prev_sum) / stunting_prev_sum) * 100));
    }
  }

  let wasting_reduction_score = 100;
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
app.get("/api/data", (req, res) => {
  const aggregatedData = buildAppData();
  res.json(aggregatedData);
});

// API: Save/Update weights
app.post("/api/weights/update", (req, res) => {
  const { pilar1, pilar2, pilar3, pilar4, pilar5 } = req.body;
  const sum = pilar1 + pilar2 + pilar3 + pilar4 + pilar5;
  if (Math.abs(sum - 1.0) > 0.01) {
    return res.status(400).json({ error: "Total bobot harus bernilai tepat 100% (1.0). Sekarang: " + (sum * 100).toFixed(0) + "%" });
  }

  weights = { pilar1, pilar2, pilar3, pilar4, pilar5 };
  lastUpdated = new Date().toISOString();

  res.json({
    success: true,
    message: "Bobot pilar berhasil diperbarui",
    ...buildAppData()
  });
});

// API: Add New Village
app.post("/api/villages/add", (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Nama desa tidak boleh kosong." });
  }

  const id = "v_" + Date.now();
  // generate standard initial values for a new village so they can edit it
  const newVillage = {
    id,
    name: name.trim(),
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
  lastUpdated = new Date().toISOString();

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

  lastUpdated = new Date().toISOString();
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

  // Update Name & position if present
  if (data.name && typeof data.name === "string" && data.name.trim() !== "") {
    v.name = data.name.trim();
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

  lastUpdated = new Date().toISOString();

  res.json({
    success: true,
    message: `Data desa ${v.name} berhasil diperbarui.`,
    ...buildAppData()
  });
});

// API: Reset dataset to initial
app.post("/api/data/reset", (req, res) => {
  villages = [
    {
      id: "v1",
      name: "Desa Labolewa",
      riskLevel: "Hijau",
      score: 92,
      coordinates: { x: 121.275, y: -8.604 },
      pilar1_mbg_sync: 240,
      pilar1_mbg_total: 240,
      pilar1_pmt_sync: 45,
      pilar1_pmt_total: 45,
      pilar1_posyandu_sync: 5,
      pilar1_posyandu_total: 5,
      pilar1_eppgbm_sync: 250,
      pilar1_eppgbm_total: 250,
      pilar2_dinkes_aktif: true,
      pilar2_bgn_aktif: true,
      pilar2_pkk_aktif: true,
      pilar2_pemdes_aktif: true,
      pilar2_puskesmas_aktif: true,
      pilar3_dashboard_online: true,
      pilar3_validasi_data: true,
      pilar3_real_time_update: true,
      pilar4_mbg_realized: 240,
      pilar4_mbg_target: 240,
      pilar4_pmt_realized: 45,
      pilar4_pmt_target: 45,
      pilar4_home_visit: 15,
      pilar4_home_visit_target: 15,
      pilar4_posyandu_aktif: 5,
      pilar4_posyandu_total: 5,
      pilar5_stunting_prev: 15,
      pilar5_stunting_curr: 10,
      pilar5_wasting_prev: 8,
      pilar5_wasting_curr: 4,
      pilar5_target_accuracy: 95
    },
    {
      id: "v2",
      name: "Desa Kelewae",
      riskLevel: "Kuning",
      score: 68,
      coordinates: { x: 121.208, y: -8.758 },
      pilar1_mbg_sync: 150,
      pilar1_mbg_total: 310,
      pilar1_pmt_sync: 80,
      pilar1_pmt_total: 80,
      pilar1_posyandu_sync: 3,
      pilar1_posyandu_total: 5,
      pilar1_eppgbm_sync: 180,
      pilar1_eppgbm_total: 310,
      pilar2_dinkes_aktif: true,
      pilar2_bgn_aktif: false,
      pilar2_pkk_aktif: true,
      pilar2_pemdes_aktif: true,
      pilar2_puskesmas_aktif: false,
      pilar3_dashboard_online: false,
      pilar3_validasi_data: true,
      pilar3_real_time_update: false,
      pilar4_mbg_realized: 230,
      pilar4_mbg_target: 310,
      pilar4_pmt_realized: 75,
      pilar4_pmt_target: 80,
      pilar4_home_visit: 12,
      pilar4_home_visit_target: 28,
      pilar4_posyandu_aktif: 4,
      pilar4_posyandu_total: 5,
      pilar5_stunting_prev: 30,
      pilar5_stunting_curr: 28,
      pilar5_wasting_prev: 15,
      pilar5_wasting_curr: 13,
      pilar5_target_accuracy: 82
    },
    {
      id: "v3",
      name: "Desa Selalejo",
      riskLevel: "Merah",
      score: 38,
      coordinates: { x: 121.196, y: -8.841 },
      pilar1_mbg_sync: 0,
      pilar1_mbg_total: 180,
      pilar1_pmt_sync: 20,
      pilar1_pmt_total: 110,
      pilar1_posyandu_sync: 1,
      pilar1_posyandu_total: 4,
      pilar1_eppgbm_sync: 40,
      pilar1_eppgbm_total: 180,
      pilar2_dinkes_aktif: false,
      pilar2_bgn_aktif: false,
      pilar2_pkk_aktif: true,
      pilar2_pemdes_aktif: false,
      pilar2_puskesmas_aktif: true,
      pilar3_dashboard_online: false,
      pilar3_validasi_data: false,
      pilar3_real_time_update: false,
      pilar4_mbg_realized: 45,
      pilar4_mbg_target: 180,
      pilar4_pmt_realized: 25,
      pilar4_pmt_target: 110,
      pilar4_home_visit: 5,
      pilar4_home_visit_target: 45,
      pilar4_posyandu_aktif: 1,
      pilar4_posyandu_total: 4,
      pilar5_stunting_prev: 40,
      pilar5_stunting_curr: 42,
      pilar5_wasting_prev: 20,
      pilar5_wasting_curr: 22,
      pilar5_target_accuracy: 50
    },
    {
      id: "v4",
      name: "Desa Olaia",
      riskLevel: "Kuning",
      score: 72,
      coordinates: { x: 121.291, y: -8.622 },
      pilar1_mbg_sync: 210,
      pilar1_mbg_total: 290,
      pilar1_pmt_sync: 60,
      pilar1_pmt_total: 65,
      pilar1_posyandu_sync: 3,
      pilar1_posyandu_total: 4,
      pilar1_eppgbm_sync: 200,
      pilar1_eppgbm_total: 290,
      pilar2_dinkes_aktif: true,
      pilar2_bgn_aktif: true,
      pilar2_pkk_aktif: false,
      pilar2_pemdes_aktif: true,
      pilar2_puskesmas_aktif: true,
      pilar3_dashboard_online: true,
      pilar3_validasi_data: true,
      pilar3_real_time_update: false,
      pilar4_mbg_realized: 250,
      pilar4_mbg_target: 290,
      pilar4_pmt_realized: 60,
      pilar4_pmt_target: 65,
      pilar4_home_visit: 15,
      pilar4_home_visit_target: 22,
      pilar4_posyandu_aktif: 3,
      pilar4_posyandu_total: 4,
      pilar5_stunting_prev: 25,
      pilar5_stunting_curr: 23,
      pilar5_wasting_prev: 12,
      pilar5_wasting_curr: 10,
      pilar5_target_accuracy: 78
    }
  ];
  weights = {
    pilar1: 0.10,
    pilar2: 0.30,
    pilar3: 0.10,
    pilar4: 0.25,
    pilar5: 0.25
  };
  lastUpdated = new Date().toISOString();
  res.json({
    success: true,
    message: "Basis data direset ke kondisi standar.",
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

*(Catatan: Anda dapat mengonfigurasi **GEMINI_API_KEY** di panel Secrets untuk mengaktifkan analisis bertenaga kecerdasan buatan Gemini yang disesuaikan secara dinamis.)*
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
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Gagal menghasilkan rekomendasi berbasis AI. Silakan coba beberapa saat lagi.", details: error.message });
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
