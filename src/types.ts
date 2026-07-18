export interface Indicator {
  id: string;
  name: string;
  score: number;
  description: string;
}

export interface Pillar {
  id: string;
  name: string;
  weight: number;
  indicators: Indicator[];
}

export interface Village {
  id: string;
  name: string;
  riskLevel: "Hijau" | "Kuning" | "Merah";
  score: number; // calculated village performance score (0-100)
  coordinates: {
    x: number;
    y: number;
  };

  // Pilar 1: Integrasi Data (raw counts)
  pilar1_mbg_sync: number;
  pilar1_mbg_total: number;
  pilar1_pmt_sync: number;
  pilar1_pmt_total: number;
  pilar1_posyandu_sync: number;
  pilar1_posyandu_total: number;
  pilar1_eppgbm_sync: number;
  pilar1_eppgbm_total: number;

  // Pilar 2: Kolaborasi OPD (toggles)
  pilar2_dinkes_aktif: boolean;
  pilar2_bgn_aktif: boolean;
  pilar2_pkk_aktif: boolean;
  pilar2_pemdes_aktif: boolean;
  pilar2_puskesmas_aktif: boolean;

  // Pilar 3: Digitalisasi (toggles)
  pilar3_dashboard_online: boolean;
  pilar3_validasi_data: boolean;
  pilar3_real_time_update: boolean;

  // Pilar 4: Pelayanan Gizi (raw counts)
  pilar4_mbg_realized: number;
  pilar4_mbg_target: number;
  pilar4_pmt_realized: number;
  pilar4_pmt_target: number;
  pilar4_home_visit: number;
  pilar4_home_visit_target: number;
  pilar4_posyandu_aktif: number;
  pilar4_posyandu_total: number;

  // Pilar 5: Outcome & Dampak (raw counts)
  pilar5_stunting_prev: number;
  pilar5_stunting_curr: number;
  pilar5_wasting_prev: number;
  pilar5_wasting_curr: number;
  pilar5_target_accuracy: number; // 0-100 percentage
}

export interface MonthlyTrend {
  month: string;
  target: number;
  realized: number;
}

export interface Weights {
  pilar1: number;
  pilar2: number;
  pilar3: number;
  pilar4: number;
  pilar5: number;
}

export interface Category {
  label: "Merah" | "Kuning" | "Hijau";
  color: string;
  desc: string;
}

export interface OrbitGiziData {
  kabupatenName: string;
  lastUpdated: string;
  weights: Weights;
  pillars: Pillar[];
  villages: Village[];
  mbgMonthlyTrend: MonthlyTrend[];
  pmtMonthlyTrend: MonthlyTrend[];
  indexScore: number;
  category: Category;
}
