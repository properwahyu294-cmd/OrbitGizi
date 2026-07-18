export interface Village {
  id: string;
  name: string;
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

export interface PillarIndicator {
  id: string;
  name: string;
  score: number;
  description: string;
}

export interface Pillar {
  id: string;
  name: string;
  weight: number;
  indicators: PillarIndicator[];
}

export interface OrbitGiziData {
  kabupatenName: string;
  lastUpdated: string;
  weights: {
    pilar1: number;
    pilar2: number;
    pilar3: number;
    pilar4: number;
    pilar5: number;
  };
  pillars: Pillar[];
  villages: Village[];
  mbgMonthlyTrend: Array<{ month: string; target: number; realized: number }>;
  pmtMonthlyTrend: Array<{ month: string; target: number; realized: number }>;
  indexScore: number;
  category: {
    label: "Merah" | "Kuning" | "Hijau";
    color: string;
    desc: string;
  };
}

const DEFAULT_WEIGHTS = {
  pilar1: 0.10,
  pilar2: 0.30,
  pilar3: 0.10,
  pilar4: 0.25,
  pilar5: 0.25,
};

const DEFAULT_VILLAGES: Village[] = [];

// Memory state to support seamless client-side mode
let localVillages: Village[] = [];
let localWeights = { ...DEFAULT_WEIGHTS };
let isUsingLocalMode = false;

// Load initial values from LocalStorage or static fallback
function initLocalStorage() {
  const vStored = localStorage.getItem("orbit_gizi_local_villages");
  const wStored = localStorage.getItem("orbit_gizi_local_weights");

  if (vStored) {
    try {
      localVillages = JSON.parse(vStored);
    } catch {
      localVillages = [...DEFAULT_VILLAGES];
    }
  } else {
    localVillages = [...DEFAULT_VILLAGES];
    localStorage.setItem("orbit_gizi_local_villages", JSON.stringify(localVillages));
  }

  if (wStored) {
    try {
      localWeights = JSON.parse(wStored);
    } catch {
      localWeights = { ...DEFAULT_WEIGHTS };
    }
  } else {
    localWeights = { ...DEFAULT_WEIGHTS };
    localStorage.setItem("orbit_gizi_local_weights", JSON.stringify(localWeights));
  }
}

initLocalStorage();

// State-checking helpers
export function isUsingLocalFallback(): boolean {
  return isUsingLocalMode;
}

export function forceLocalMode(enabled: boolean) {
  isUsingLocalMode = enabled;
}

// Client-side math identical to server.ts
function getRatioScore(nominator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((nominator / denominator) * 100)));
}

function calculateVillageScore(v: Village, weights: typeof DEFAULT_WEIGHTS): number {
  // Pilar 1
  const p1 = Math.round((
    getRatioScore(v.pilar1_mbg_sync, v.pilar1_mbg_total) +
    getRatioScore(v.pilar1_pmt_sync, v.pilar1_pmt_total) +
    getRatioScore(v.pilar1_posyandu_sync, v.pilar1_posyandu_total) +
    getRatioScore(v.pilar1_eppgbm_sync, v.pilar1_eppgbm_total)
  ) / 4);

  // Pilar 2
  const p2_active_count = (v.pilar2_dinkes_aktif ? 1 : 0) +
                          (v.pilar2_bgn_aktif ? 1 : 0) +
                          (v.pilar2_pkk_aktif ? 1 : 0) +
                          (v.pilar2_pemdes_aktif ? 1 : 0) +
                          (v.pilar2_puskesmas_aktif ? 1 : 0);
  const p2 = Math.round((p2_active_count / 5) * 100);

  // Pilar 3
  const p3_active_count = (v.pilar3_dashboard_online ? 1 : 0) +
                          (v.pilar3_validasi_data ? 1 : 0) +
                          (v.pilar3_real_time_update ? 1 : 0);
  const p3 = Math.round((p3_active_count / 3) * 100);

  // Pilar 4
  const p4 = Math.round((
    getRatioScore(v.pilar4_mbg_realized, v.pilar4_mbg_target) +
    getRatioScore(v.pilar4_pmt_realized, v.pilar4_pmt_target) +
    getRatioScore(v.pilar4_home_visit, v.pilar4_home_visit_target) +
    getRatioScore(v.pilar4_posyandu_aktif, v.pilar4_posyandu_total)
  ) / 4);

  // Pilar 5
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

  const total = p1 * weights.pilar1 +
                p2 * weights.pilar2 +
                p3 * weights.pilar3 +
                p4 * weights.pilar4 +
                p5 * weights.pilar5;

  return Math.round(total);
}

// Builds final OrbitGiziData object purely on client
function buildLocalAppData(): OrbitGiziData {
  // 1. Recalculate each village
  localVillages.forEach(v => {
    v.score = calculateVillageScore(v, localWeights);
    if (v.score < 50) v.riskLevel = "Merah";
    else if (v.score <= 75) v.riskLevel = "Kuning";
    else v.riskLevel = "Hijau";
  });

  const totalVillages = localVillages.length || 1;

  // Pilar 1 totals
  const mbg_sync_sum = localVillages.reduce((acc, v) => acc + v.pilar1_mbg_sync, 0);
  const mbg_total_sum = localVillages.reduce((acc, v) => acc + v.pilar1_mbg_total, 0);
  const pmt_sync_sum = localVillages.reduce((acc, v) => acc + v.pilar1_pmt_sync, 0);
  const pmt_total_sum = localVillages.reduce((acc, v) => acc + v.pilar1_pmt_total, 0);
  const pos_sync_sum = localVillages.reduce((acc, v) => acc + v.pilar1_posyandu_sync, 0);
  const pos_total_sum = localVillages.reduce((acc, v) => acc + v.pilar1_posyandu_total, 0);
  const epp_sync_sum = localVillages.reduce((acc, v) => acc + v.pilar1_eppgbm_sync, 0);
  const epp_total_sum = localVillages.reduce((acc, v) => acc + v.pilar1_eppgbm_total, 0);

  // Pilar 2
  const dinkes_aktif_count = localVillages.filter(v => v.pilar2_dinkes_aktif).length;
  const bgn_aktif_count = localVillages.filter(v => v.pilar2_bgn_aktif).length;
  const pkk_aktif_count = localVillages.filter(v => v.pilar2_pkk_aktif).length;
  const pemdes_aktif_count = localVillages.filter(v => v.pilar2_pemdes_aktif).length;
  const puskesmas_aktif_count = localVillages.filter(v => v.pilar2_puskesmas_aktif).length;

  // Pilar 3
  const dashboard_online_count = localVillages.filter(v => v.pilar3_dashboard_online).length;
  const validasi_data_count = localVillages.filter(v => v.pilar3_validasi_data).length;
  const real_time_update_count = localVillages.filter(v => v.pilar3_real_time_update).length;

  // Pilar 4
  const mbg_realized_sum = localVillages.reduce((acc, v) => acc + v.pilar4_mbg_realized, 0);
  const mbg_target_sum = localVillages.reduce((acc, v) => acc + v.pilar4_mbg_target, 0);
  const pmt_realized_sum = localVillages.reduce((acc, v) => acc + v.pilar4_pmt_realized, 0);
  const pmt_target_sum = localVillages.reduce((acc, v) => acc + v.pilar4_pmt_target, 0);
  const home_visit_sum = localVillages.reduce((acc, v) => acc + v.pilar4_home_visit, 0);
  const home_visit_target_sum = localVillages.reduce((acc, v) => acc + v.pilar4_home_visit_target, 0);
  const pos_aktif_sum = localVillages.reduce((acc, v) => acc + v.pilar4_posyandu_aktif, 0);
  const pos_total_sum_p4 = localVillages.reduce((acc, v) => acc + v.pilar4_posyandu_total, 0);

  // Pilar 5
  const stunting_prev_sum = localVillages.reduce((acc, v) => acc + v.pilar5_stunting_prev, 0);
  const stunting_curr_sum = localVillages.reduce((acc, v) => acc + v.pilar5_stunting_curr, 0);
  const wasting_prev_sum = localVillages.reduce((acc, v) => acc + v.pilar5_wasting_prev, 0);
  const wasting_curr_sum = localVillages.reduce((acc, v) => acc + v.pilar5_wasting_curr, 0);
  const target_accuracy_avg = localVillages.reduce((acc, v) => acc + v.pilar5_target_accuracy, 0) / totalVillages;

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

  let stunting_reduction_score = localVillages.length > 0 ? 100 : 0;
  if (stunting_prev_sum > 0) {
    if (stunting_curr_sum < stunting_prev_sum) {
      stunting_reduction_score = 100;
    } else if (stunting_curr_sum === stunting_prev_sum) {
      stunting_reduction_score = 75;
    } else {
      stunting_reduction_score = Math.max(0, Math.round(75 - ((stunting_curr_sum - stunting_prev_sum) / stunting_prev_sum) * 100));
    }
  }

  let wasting_reduction_score = localVillages.length > 0 ? 100 : 0;
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

  const pillarsList: Pillar[] = [
    {
      id: "pilar1",
      name: "Pilar 1. Integrasi Data",
      weight: Math.round(localWeights.pilar1 * 100),
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
      weight: Math.round(localWeights.pilar2 * 100),
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
      weight: Math.round(localWeights.pilar3 * 100),
      indicators: [
        { id: "dashboard_online", name: "Dashboard Online Desa", score: dashboard_score, description: `Tersedianya dashboard publik online desa di ${dashboard_online_count} dari ${totalVillages} desa` },
        { id: "validation_flow", name: "Validasi Berjenjang Selesai", score: validation_score, description: `Penyelesaian validasi data gizi di ${validasi_data_count} dari ${totalVillages} desa` },
        { id: "real_time_update", name: "Sistem Pelaporan Real-Time", score: real_time_score, description: `Pelaporan data harian aktif di ${real_time_update_count} dari ${totalVillages} desa` },
      ]
    },
    {
      id: "pilar4",
      name: "Pilar 4. Pelayanan Gizi",
      weight: Math.round(localWeights.pilar4 * 100),
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
      weight: Math.round(localWeights.pilar5 * 100),
      indicators: [
        { id: "stunting_reduction", name: "Penurunan Kasus Stunting", score: stunting_reduction_score, description: `Tren penurunan kumulatif kasus stunting (Dari ${stunting_prev_sum} kasus menjadi ${stunting_curr_sum} kasus)` },
        { id: "wasting_reduction", name: "Penurunan Kasus Wasting", score: wasting_reduction_score, description: `Tren penurunan kumulatif kasus wasting (Dari ${wasting_prev_sum} kasus menjadi ${wasting_curr_sum} kasus)` },
        { id: "target_accuracy", name: "Keakuratan Sasaran Penerima", score: accuracy_score, description: `Tingkat ketepatan sasaran intervensi gizi terpadu rata-rata di kabupaten` },
      ]
    }
  ];

  let indexScore = 0;
  pillarsList.forEach(p => {
    const avgScore = p.indicators.reduce((acc, i) => acc + i.score, 0) / p.indicators.length;
    indexScore += avgScore * (p.weight / 100);
  });
  indexScore = parseFloat(indexScore.toFixed(1));

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
    kabupatenName: "Kabupaten Nagekeo",
    lastUpdated: new Date().toISOString(),
    weights: localWeights,
    pillars: pillarsList,
    villages: localVillages,
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

// Check if response is valid JSON. Returns parsed json or throws.
async function parseResponseSafely(res: Response): Promise<any> {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("text/html") || !res.ok) {
    throw new Error("HTML fallback response detected (likely running as client-only/Cloudflare static host).");
  }
  return await res.json();
}

/**
 * FETCH MAIN DATA
 */
export async function getAppData(): Promise<OrbitGiziData> {
  if (isUsingLocalMode) {
    return buildLocalAppData();
  }

  try {
    const res = await fetch("/api/data");
    const json = await parseResponseSafely(res);
    return json;
  } catch (err) {
    console.warn("API Endpoint unavailable or returned HTML (Cloudflare Pages fallback). Switching to full offline client-side state...", err);
    isUsingLocalMode = true;
    return buildLocalAppData();
  }
}

/**
 * UPDATE WEIGHTS
 */
export async function updateWeightsApi(body: {
  pilar1: number;
  pilar2: number;
  pilar3: number;
  pilar4: number;
  pilar5: number;
}): Promise<OrbitGiziData> {
  if (isUsingLocalMode) {
    localWeights = body;
    localStorage.setItem("orbit_gizi_local_weights", JSON.stringify(localWeights));
    return buildLocalAppData();
  }

  try {
    const res = await fetch("/api/weights/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    return await parseResponseSafely(res);
  } catch {
    isUsingLocalMode = true;
    localWeights = body;
    localStorage.setItem("orbit_gizi_local_weights", JSON.stringify(localWeights));
    return buildLocalAppData();
  }
}

/**
 * ADD VILLAGE
 */
export async function addVillageApi(name: string): Promise<OrbitGiziData> {
  if (isUsingLocalMode) {
    const id = "v_" + Date.now();
    const newVillage: Village = {
      id,
      name: name.trim(),
      riskLevel: "Kuning",
      score: 50,
      coordinates: {
        x: parseFloat((121.15 + Math.random() * 0.20).toFixed(4)),
        y: parseFloat((-8.85 + Math.random() * 0.30).toFixed(4))
      },
      pilar1_mbg_sync: 0,
      pilar1_mbg_total: 100,
      pilar1_pmt_sync: 0,
      pilar1_pmt_total: 20,
      pilar1_posyandu_sync: 0,
      pilar1_posyandu_total: 3,
      pilar1_eppgbm_sync: 0,
      pilar1_eppgbm_total: 100,
      pilar2_dinkes_aktif: false,
      pilar2_bgn_aktif: false,
      pilar2_pkk_aktif: false,
      pilar2_pemdes_aktif: false,
      pilar2_puskesmas_aktif: false,
      pilar3_dashboard_online: false,
      pilar3_validasi_data: false,
      pilar3_real_time_update: false,
      pilar4_mbg_realized: 0,
      pilar4_mbg_target: 100,
      pilar4_pmt_realized: 0,
      pilar4_pmt_target: 20,
      pilar4_home_visit: 0,
      pilar4_home_visit_target: 10,
      pilar4_posyandu_aktif: 0,
      pilar4_posyandu_total: 3,
      pilar5_stunting_prev: 10,
      pilar5_stunting_curr: 10,
      pilar5_wasting_prev: 5,
      pilar5_wasting_curr: 5,
      pilar5_target_accuracy: 50
    };

    localVillages.push(newVillage);
    localStorage.setItem("orbit_gizi_local_villages", JSON.stringify(localVillages));
    return buildLocalAppData();
  }

  try {
    const res = await fetch("/api/villages/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    return await parseResponseSafely(res);
  } catch {
    isUsingLocalMode = true;
    return addVillageApi(name);
  }
}

/**
 * DELETE VILLAGE
 */
export async function deleteVillageApi(id: string): Promise<OrbitGiziData> {
  if (isUsingLocalMode) {
    localVillages = localVillages.filter(v => v.id !== id);
    localStorage.setItem("orbit_gizi_local_villages", JSON.stringify(localVillages));
    return buildLocalAppData();
  }

  try {
    const res = await fetch("/api/villages/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    return await parseResponseSafely(res);
  } catch {
    isUsingLocalMode = true;
    return deleteVillageApi(id);
  }
}

/**
 * UPDATE VILLAGE DATA
 */
export async function updateVillageApi(data: Partial<Village> & { id: string }): Promise<OrbitGiziData> {
  if (isUsingLocalMode) {
    const vIdx = localVillages.findIndex(v => v.id === data.id);
    if (vIdx !== -1) {
      const v = localVillages[vIdx];
      
      const updateNum = (key: keyof Village, val: any) => {
        if (typeof val === "number" && !isNaN(val)) {
          (v as any)[key] = val;
        }
      };

      const updateBool = (key: keyof Village, val: any) => {
        if (typeof val === "boolean") {
          (v as any)[key] = val;
        }
      };

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

      localStorage.setItem("orbit_gizi_local_villages", JSON.stringify(localVillages));
    }
    return buildLocalAppData();
  }

  try {
    const res = await fetch("/api/villages/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return await parseResponseSafely(res);
  } catch {
    isUsingLocalMode = true;
    return updateVillageApi(data);
  }
}

/**
 * RESET DATA
 */
export async function resetDataApi(): Promise<OrbitGiziData> {
  if (isUsingLocalMode) {
    localVillages = [...DEFAULT_VILLAGES];
    localWeights = { ...DEFAULT_WEIGHTS };
    localStorage.setItem("orbit_gizi_local_villages", JSON.stringify(localVillages));
    localStorage.setItem("orbit_gizi_local_weights", JSON.stringify(localWeights));
    return buildLocalAppData();
  }

  try {
    const res = await fetch("/api/data/reset", {
      method: "POST"
    });
    return await parseResponseSafely(res);
  } catch {
    isUsingLocalMode = true;
    return resetDataApi();
  }
}

/**
 * CLEAR DATA
 */
export async function clearDataApi(): Promise<OrbitGiziData> {
  if (isUsingLocalMode) {
    localVillages = [];
    localStorage.setItem("orbit_gizi_local_villages", JSON.stringify(localVillages));
    return buildLocalAppData();
  }

  try {
    const res = await fetch("/api/data/clear", {
      method: "POST"
    });
    return await parseResponseSafely(res);
  } catch {
    isUsingLocalMode = true;
    return clearDataApi();
  }
}

/**
 * GET GEMINI RECOMMENDATIONS WITH CLIENT FALLBACK
 */
export async function getRecommendationsApi(): Promise<{ text: string; source: string }> {
  if (isUsingLocalMode) {
    return generateLocalRecommendations(buildLocalAppData());
  }

  try {
    const res = await fetch("/api/recommendations", {
      method: "POST"
    });
    return await parseResponseSafely(res);
  } catch {
    isUsingLocalMode = true;
    return generateLocalRecommendations(buildLocalAppData());
  }
}

function generateLocalRecommendations(aggregatedData: OrbitGiziData): { text: string; source: string } {
  let weakestPillar = aggregatedData.pillars[0];
  let lowestAvg = 100;
  aggregatedData.pillars.forEach(p => {
    const avg = p.indicators.reduce((sum, i) => sum + i.score, 0) / p.indicators.length;
    if (avg < lowestAvg) {
      lowestAvg = avg;
      weakestPillar = p;
    }
  });

  const villagesList = aggregatedData.villages;
  const redOrYellowVillages = villagesList.filter(v => v.riskLevel === "Merah" || v.riskLevel === "Kuning");
  const prioritasDesa = redOrYellowVillages.length > 0
    ? redOrYellowVillages.map(v => v.name).slice(0, 3).join(", ")
    : "Seluruh desa berstatus Hijau (stabil).";

  const localResponse = `
### 🏢 REKOMENDASI KEBIJAKAN STRATEGIS: TRANSFORMATION ORBIT GIZI
*Rekomendasi ini disusun secara dinamis berdasarkan pemutakhiran data gizi kabupaten (Mode Mandiri Lokal).*

---

#### 1. ⚠️ Analisis Risiko Utama (Fokus pada Pilar Terlemah)
Berdasarkan analisis performa, **${weakestPillar.name}** adalah pilar dengan skor rata-rata terendah yaitu **${lowestAvg.toFixed(1)}/100**. 
* **Risiko Fatal**: Hambatan utama terletak pada indikator dengan skor di bawah optimal. Jika tidak segera diintervensi, kesenjangan data dan kurangnya integrasi layanan akan menyebabkan bantuan makanan bergizi gratis (MBG) dan pemberian makanan tambahan (PMT) salah sasaran.
* **Kerentanan Sektoral**: Koordinasi antar-instansi (OPD) seperti Dinas Kesehatan, PKK, dan Pemerintah Desa masih perlu disinkronkan, terutama dalam pemanfaatan Dana Desa untuk posyandu aktif dan pendampingan gizi di lapangan.

#### 2. 🎯 Prioritas Sasaran (Desa Berisiko Tinggi)
* **Desa Prioritas**: ${prioritasDesa}
* Upayakan bantuan khusus dan aktivasi Posyandu di daerah berkinerja rendah untuk menghentikan laju stunting baru secara langsung di lapangan.

#### 3. 🛠️ Rekomendasi Kebijakan Konkret & Kolaborasi OPD
* **Aktivasi Posyandu Mandiri (Kolaborasi Pemdes & Dinkes & PKK)**:
  Bupati mengeluarkan Instruksi Bersama untuk mewajibkan alokasi minimal 10% Dana Desa untuk operasional Posyandu, insentif kader PKK, dan pengadaan timbangan digital standar Kemenkes.
* **Sinkronisasi Data Multi-Sektor (Kolaborasi BGN & Dinkes)**:
  Mengintegrasikan sistem pelaporan e-PPGBM Puskesmas secara real-time dengan data penerima program Makan Bergizi Gratis (MBG) dari Badan Gizi Nasional untuk memastikan balita *stunting* mendapat porsi protein ganda.
* **Gerakan Home Visit Terpadu (Kolaborasi Puskesmas & Kader PKK)**:
  Meluncurkan program *"Satu Kader Satu Balita Berisiko Gizi"* untuk kunjungan rumah mingguan guna memantau asupan PMT lokal secara langsung di rumah tangga sasaran.

#### 4. 📈 Target Jangka Pendek (3 Bulan)
* Re-aktivasi Posyandu di Desa prioritas tinggi menjadi 100% Aktif pada bulan pertama.
* Integrasi data rujukan e-PPGBM dan MBG mencapai 95% tingkat kevalidan.
* Penurunan jumlah balita berisiko stunting di Desa Prioritas minimal sebesar 15% melalui pemantauan intensif.
  `;

  return { text: localResponse, source: "local_simulation_client" };
}
