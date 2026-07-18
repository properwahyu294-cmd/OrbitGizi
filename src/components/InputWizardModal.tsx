import { useState, useEffect } from "react";
import { 
  X, 
  Database, 
  Check, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle,
  Info,
  ChevronRight,
  Sparkles,
  BarChart,
  Activity,
  HeartHandshake
} from "lucide-react";
import { Village, Weights } from "../types";

interface InputWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  villages: Village[];
  onSave: (updatedVillageMetrics: Partial<Village>) => Promise<void>;
  weights: Weights;
}

type TabType = "mbg" | "pmt" | "posyandu" | "eppgbm";

export default function InputWizardModal({
  isOpen,
  onClose,
  villages,
  onSave,
  weights
}: InputWizardModalProps) {
  const [selectedVillageId, setSelectedVillageId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabType>("mbg");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Form local state matching selected village
  const [p1MbgSync, setP1MbgSync] = useState<number>(0);
  const [p1MbgTotal, setP1MbgTotal] = useState<number>(100);
  const [p1PmtSync, setP1PmtSync] = useState<number>(0);
  const [p1PmtTotal, setP1PmtTotal] = useState<number>(50);
  const [p1PosSync, setP1PosSync] = useState<number>(0);
  const [p1PosTotal, setP1PosTotal] = useState<number>(4);
  const [p1EppSync, setP1EppSync] = useState<number>(0);
  const [p1EppTotal, setP1EppTotal] = useState<number>(100);

  const [p4MbgRealized, setP4MbgRealized] = useState<number>(0);
  const [p4MbgTarget, setP4MbgTarget] = useState<number>(100);
  const [p4PmtRealized, setP4PmtRealized] = useState<number>(0);
  const [p4PmtTarget, setP4PmtTarget] = useState<number>(50);
  const [p4PosAktif, setP4PosAktif] = useState<number>(0);
  const [p4PosTotal, setP4PosTotal] = useState<number>(4);

  useEffect(() => {
    if (villages.length > 0 && !selectedVillageId) {
      setSelectedVillageId(villages[0].id);
    }
  }, [villages, selectedVillageId]);

  // Load selected village data into state
  useEffect(() => {
    const v = villages.find(x => x.id === selectedVillageId);
    if (v) {
      setP1MbgSync(v.pilar1_mbg_sync);
      setP1MbgTotal(v.pilar1_mbg_total || 100);
      setP1PmtSync(v.pilar1_pmt_sync);
      setP1PmtTotal(v.pilar1_pmt_total || 50);
      setP1PosSync(v.pilar1_posyandu_sync);
      setP1PosTotal(v.pilar1_posyandu_total || 4);
      setP1EppSync(v.pilar1_eppgbm_sync);
      setP1EppTotal(v.pilar1_eppgbm_total || 100);

      setP4MbgRealized(v.pilar4_mbg_realized);
      setP4MbgTarget(v.pilar4_mbg_target || 100);
      setP4PmtRealized(v.pilar4_pmt_realized);
      setP4PmtTarget(v.pilar4_pmt_target || 50);
      setP4PosAktif(v.pilar4_posyandu_aktif);
      setP4PosTotal(v.pilar4_posyandu_total || 4);
      
      setSaveSuccess(false);
    }
  }, [selectedVillageId, villages]);

  if (!isOpen || villages.length === 0) return null;

  const currentVillage = villages.find(x => x.id === selectedVillageId) || villages[0];

  // Helper ratio score function matching backend
  const getRatioScore = (nominator: number, denominator: number): number => {
    if (denominator <= 0) return 100;
    return Math.max(0, Math.min(100, Math.round((nominator / denominator) * 100)));
  };

  // Live Score Calculator
  const calculateLiveScoreAndRisk = () => {
    // Pilar 1: Integrasi Data
    const p1 = Math.round((
      getRatioScore(p1MbgSync, p1MbgTotal) +
      getRatioScore(p1PmtSync, p1PmtTotal) +
      getRatioScore(p1PosSync, p1PosTotal) +
      getRatioScore(p1EppSync, p1EppTotal)
    ) / 4);

    // Pilar 2: Kolaborasi OPD
    const p2_active_count = (currentVillage.pilar2_dinkes_aktif ? 1 : 0) +
                            (currentVillage.pilar2_bgn_aktif ? 1 : 0) +
                            (currentVillage.pilar2_pkk_aktif ? 1 : 0) +
                            (currentVillage.pilar2_pemdes_aktif ? 1 : 0) +
                            (currentVillage.pilar2_puskesmas_aktif ? 1 : 0);
    const p2 = Math.round((p2_active_count / 5) * 100);

    // Pilar 3: Digitalisasi
    const p3_active_count = (currentVillage.pilar3_dashboard_online ? 1 : 0) +
                            (currentVillage.pilar3_validasi_data ? 1 : 0) +
                            (currentVillage.pilar3_real_time_update ? 1 : 0);
    const p3 = Math.round((p3_active_count / 3) * 100);

    // Pilar 4: Pelayanan Gizi
    const p4 = Math.round((
      getRatioScore(p4MbgRealized, p4MbgTarget) +
      getRatioScore(p4PmtRealized, p4PmtTarget) +
      getRatioScore(currentVillage.pilar4_home_visit, currentVillage.pilar4_home_visit_target) +
      getRatioScore(p4PosAktif, p4PosTotal)
    ) / 4);

    // Pilar 5: Outcome
    let stunting_score = 100;
    const s_prev = currentVillage.pilar5_stunting_prev;
    const s_curr = currentVillage.pilar5_stunting_curr;
    if (s_prev > 0) {
      if (s_curr < s_prev) stunting_score = 100;
      else if (s_curr === s_prev) stunting_score = 75;
      else stunting_score = Math.max(0, Math.round(75 - ((s_curr - s_prev) / s_prev) * 100));
    }

    let wasting_score = 100;
    const w_prev = currentVillage.pilar5_wasting_prev;
    const w_curr = currentVillage.pilar5_wasting_curr;
    if (w_prev > 0) {
      if (w_curr < w_prev) wasting_score = 100;
      else if (w_curr === w_prev) wasting_score = 75;
      else wasting_score = Math.max(0, Math.round(75 - ((w_curr - w_prev) / w_prev) * 100));
    }

    const p5 = Math.round((stunting_score + wasting_score + currentVillage.pilar5_target_accuracy) / 3);

    // Weighted Score
    const total = p1 * weights.pilar1 +
                  p2 * weights.pilar2 +
                  p3 * weights.pilar3 +
                  p4 * weights.pilar4 +
                  p5 * weights.pilar5;

    const liveScore = Math.round(total);

    let liveRisk: "Hijau" | "Kuning" | "Merah" = "Kuning";
    if (liveScore >= 75) {
      liveRisk = "Hijau";
    } else if (liveScore < 50) {
      liveRisk = "Merah";
    }

    return { liveScore, liveRisk };
  };

  const { liveScore, liveRisk } = calculateLiveScoreAndRisk();

  const handleSaveMetrics = async () => {
    setIsSaving(true);
    try {
      await onSave({
        id: selectedVillageId,
        pilar1_mbg_sync: p1MbgSync,
        pilar1_mbg_total: p1MbgTotal,
        pilar1_pmt_sync: p1PmtSync,
        pilar1_pmt_total: p1PmtTotal,
        pilar1_posyandu_sync: p1PosSync,
        pilar1_posyandu_total: p1PosTotal,
        pilar1_eppgbm_sync: p1EppSync,
        pilar1_eppgbm_total: p1EppTotal,

        pilar4_mbg_realized: p4MbgRealized,
        pilar4_mbg_target: p4MbgTarget,
        pilar4_pmt_realized: p4PmtRealized,
        pilar4_pmt_target: p4PmtTarget,
        pilar4_posyandu_aktif: p4PosAktif,
        pilar4_posyandu_total: p4PosTotal
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (e) {
      console.error("Gagal menyimpan gizi", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col md:flex-row h-[90vh] md:h-[620px]">
        
        {/* Left Sidebar inside Modal: Village Selector & Live Calculator */}
        <div className="md:w-1/3 bg-slate-900 text-slate-100 p-6 flex flex-col justify-between border-r border-slate-800">
          <div className="space-y-5">
            <div>
              <div className="flex items-center space-x-2 text-indigo-400 mb-1">
                <Database className="h-5 w-5" />
                <span className="text-[10px] font-black tracking-widest uppercase">INPUT PANEL</span>
              </div>
              <h3 className="text-lg font-black text-white tracking-tight">Pusat Input Gizi Terpadu</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Manajemen data berkala MBG, PMT, Posyandu, dan e-PPGBM tingkat desa riil.
              </p>
            </div>

            {/* Select Village Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-[9px] font-black text-slate-400 tracking-wider uppercase">PILIH DESA SASARAN</label>
              <select
                value={selectedVillageId}
                onChange={(e) => setSelectedVillageId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
              >
                {villages.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} (Zona {v.riskLevel})
                  </option>
                ))}
              </select>
            </div>

            {/* Live Analytics Dashboard */}
            <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 space-y-3.5">
              <span className="text-[9px] font-black text-indigo-400 tracking-wider uppercase block">SIMULATOR IMPACT NILAI</span>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Skor Semula</span>
                  <span className="text-base font-black text-slate-300">{currentVillage.score} pts</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Skor Baru (Live)</span>
                  <span className={`text-lg font-black ${
                    liveScore > currentVillage.score 
                      ? "text-emerald-400" 
                      : liveScore < currentVillage.score 
                        ? "text-rose-400" 
                        : "text-indigo-300"
                  }`}>{liveScore} pts</span>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="pt-2 border-t border-slate-700 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400">Klasifikasi Zona</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                  liveRisk === "Hijau" 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                    : liveRisk === "Merah" 
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}>
                  Zona {liveRisk}
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:block text-[10px] text-slate-500 space-y-1">
            <p>• Data langsung dikomparasi secara real-time.</p>
            <p>• Mengoreksi indeks pilar gizi kabupaten.</p>
          </div>
        </div>

        {/* Right Content Area: Form Tabs */}
        <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto bg-slate-50/40">
          
          {/* Header & Tabs */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-1.5 text-slate-800">
                <Sparkles className="h-4.5 w-4.5 text-indigo-600" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Input Data Berkala - {currentVillage.name}</h4>
              </div>
              
              <button 
                onClick={onClose}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-full transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form Category Navigation */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {[
                { id: "mbg", label: "Data MBG", icon: "🍱" },
                { id: "pmt", label: "Data PMT", icon: "🍼" },
                { id: "posyandu", label: "Posyandu", icon: "🏥" },
                { id: "eppgbm", label: "e-PPGBM", icon: "📊" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`py-2 rounded-xl text-xs font-extrabold flex flex-col items-center justify-center space-y-1 border transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-sm">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* TAB CONTENT */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-5 animate-in fade-in duration-200 min-h-[260px] flex flex-col justify-between">
              
              {activeTab === "mbg" && (
                <div className="space-y-4">
                  <div>
                    <h5 className="text-xs font-black text-slate-800 uppercase flex items-center space-x-1.5 border-b border-slate-100 pb-2 mb-3">
                      <span>🍱 DATA MBG (MAKAN BERGIZI GRATIS)</span>
                    </h5>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Memantau sinkronisasi database anak sekolah penerima MBG serta realisasi pendistribusian makanan bergizi gratis.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Pilar 1 Integration */}
                    <div className="bg-slate-50/60 p-3.5 rounded-xl border border-slate-200/60 space-y-3">
                      <span className="text-[9px] font-black text-slate-400 tracking-wider block">PILAR 1: SINKRONISASI DATA</span>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span>Data Terintegrasi</span>
                          <span>{p1MbgSync} / {p1MbgTotal} Anak</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={p1MbgTotal}
                          value={p1MbgSync}
                          onChange={(e) => setP1MbgSync(parseInt(e.target.value) || 0)}
                          className="w-full accent-indigo-600"
                        />
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold text-slate-400">Total Sasaran:</span>
                          <input
                            type="number"
                            min="1"
                            value={p1MbgTotal}
                            onChange={(e) => setP1MbgTotal(Math.max(1, parseInt(e.target.value) || 1))}
                            className="bg-white border border-slate-200 text-slate-800 text-xs font-extrabold w-20 px-2 py-0.5 rounded text-center"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Pilar 4 Distribution */}
                    <div className="bg-slate-50/60 p-3.5 rounded-xl border border-slate-200/60 space-y-3">
                      <span className="text-[9px] font-black text-slate-400 tracking-wider block">PILAR 4: REALISASI DISTRIBUSI</span>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span>Terlayani</span>
                          <span>{p4MbgRealized} / {p4MbgTarget} Anak</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={p4MbgTarget}
                          value={p4MbgRealized}
                          onChange={(e) => setP4MbgRealized(parseInt(e.target.value) || 0)}
                          className="w-full accent-indigo-600"
                        />
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold text-slate-400">Target Distribusi:</span>
                          <input
                            type="number"
                            min="1"
                            value={p4MbgTarget}
                            onChange={(e) => setP4MbgTarget(Math.max(1, parseInt(e.target.value) || 1))}
                            className="bg-white border border-slate-200 text-slate-800 text-xs font-extrabold w-20 px-2 py-0.5 rounded text-center"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "pmt" && (
                <div className="space-y-4">
                  <div>
                    <h5 className="text-xs font-black text-slate-800 uppercase flex items-center space-x-1.5 border-b border-slate-100 pb-2 mb-3">
                      <span>🍼 DATA PMT (MAKANAN TAMBAHAN)</span>
                    </h5>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Mengelola sasaran intervensi pemberian makanan tambahan (PMT) untuk ibu hamil KEK dan balita gizi kurang di desa.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Pilar 1 Integration */}
                    <div className="bg-slate-50/60 p-3.5 rounded-xl border border-slate-200/60 space-y-3">
                      <span className="text-[9px] font-black text-slate-400 tracking-wider block">PILAR 1: SINKRONISASI DATA</span>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span>Data Terintegrasi</span>
                          <span>{p1PmtSync} / {p1PmtTotal} Sasaran</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={p1PmtTotal}
                          value={p1PmtSync}
                          onChange={(e) => setP1PmtSync(parseInt(e.target.value) || 0)}
                          className="w-full accent-indigo-600"
                        />
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold text-slate-400">Total Sasaran PMT:</span>
                          <input
                            type="number"
                            min="1"
                            value={p1PmtTotal}
                            onChange={(e) => setP1PmtTotal(Math.max(1, parseInt(e.target.value) || 1))}
                            className="bg-white border border-slate-200 text-slate-800 text-xs font-extrabold w-20 px-2 py-0.5 rounded text-center"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Pilar 4 Distribution */}
                    <div className="bg-slate-50/60 p-3.5 rounded-xl border border-slate-200/60 space-y-3">
                      <span className="text-[9px] font-black text-slate-400 tracking-wider block">PILAR 4: REALISASI PMT</span>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span>Realisasi PMT</span>
                          <span>{p4PmtRealized} / {p4PmtTarget} Sasaran</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={p4PmtTarget}
                          value={p4PmtRealized}
                          onChange={(e) => setP4PmtRealized(parseInt(e.target.value) || 0)}
                          className="w-full accent-indigo-600"
                        />
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold text-slate-400">Target Intervensi:</span>
                          <input
                            type="number"
                            min="1"
                            value={p4PmtTarget}
                            onChange={(e) => setP4PmtTarget(Math.max(1, parseInt(e.target.value) || 1))}
                            className="bg-white border border-slate-200 text-slate-800 text-xs font-extrabold w-20 px-2 py-0.5 rounded text-center"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "posyandu" && (
                <div className="space-y-4">
                  <div>
                    <h5 className="text-xs font-black text-slate-800 uppercase flex items-center space-x-1.5 border-b border-slate-100 pb-2 mb-3">
                      <span>🏥 DATA UNIT POSYANDU</span>
                    </h5>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Mengawasi ketersediaan pendaftaran & pelaporan digital posyandu serta tingkat keaktifan operasionalnya.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Pilar 1 Integration */}
                    <div className="bg-slate-50/60 p-3.5 rounded-xl border border-slate-200/60 space-y-3">
                      <span className="text-[9px] font-black text-slate-400 tracking-wider block">PILAR 1: POSYANDU DIGITAL</span>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span>Terdigitalisasi</span>
                          <span>{p1PosSync} / {p1PosTotal} Unit</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={p1PosTotal}
                          value={p1PosSync}
                          onChange={(e) => setP1PosSync(parseInt(e.target.value) || 0)}
                          className="w-full accent-indigo-600"
                        />
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold text-slate-400">Jumlah Total Posyandu:</span>
                          <input
                            type="number"
                            min="1"
                            value={p1PosTotal}
                            onChange={(e) => {
                              const val = Math.max(1, parseInt(e.target.value) || 1);
                              setP1PosTotal(val);
                              setP4PosTotal(val);
                            }}
                            className="bg-white border border-slate-200 text-slate-800 text-xs font-extrabold w-16 px-2 py-0.5 rounded text-center"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Pilar 4 Keaktifan */}
                    <div className="bg-slate-50/60 p-3.5 rounded-xl border border-slate-200/60 space-y-3">
                      <span className="text-[9px] font-black text-slate-400 tracking-wider block">PILAR 4: KEAKTIFAN OPERASIONAL</span>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span>Aktif Operasional</span>
                          <span>{p4PosAktif} / {p4PosTotal} Unit</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={p4PosTotal}
                          value={p4PosAktif}
                          onChange={(e) => setP4PosAktif(parseInt(e.target.value) || 0)}
                          className="w-full accent-indigo-600"
                        />
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold text-slate-400">Total Terdaftar:</span>
                          <span className="text-xs font-extrabold text-slate-700">{p4PosTotal} Unit</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "eppgbm" && (
                <div className="space-y-4">
                  <div>
                    <h5 className="text-xs font-black text-slate-800 uppercase flex items-center space-x-1.5 border-b border-slate-100 pb-2 mb-3">
                      <span>📊 DATA e-PPGBM KEMENKES RI</span>
                    </h5>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Mengelola sinkronisasi data pengukuran balita dengan sistem e-PPGBM Kemenkes RI untuk ketepatan sasaran.
                    </p>
                  </div>

                  <div className="pt-2">
                    {/* Pilar 1 Integration */}
                    <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/60 space-y-4 max-w-lg mx-auto">
                      <span className="text-[9px] font-black text-slate-400 tracking-wider block">PILAR 1: SINKRONISASI DATA e-PPGBM</span>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span>Jumlah Balita Sinkron</span>
                          <span>{p1EppSync} / {p1EppTotal} Balita</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={p1EppTotal}
                          value={p1EppSync}
                          onChange={(e) => setP1EppSync(parseInt(e.target.value) || 0)}
                          className="w-full accent-indigo-600"
                        />
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-bold text-slate-400">Total Balita di Desa:</span>
                            <input
                              type="number"
                              min="1"
                              value={p1EppTotal}
                              onChange={(e) => setP1EppTotal(Math.max(1, parseInt(e.target.value) || 1))}
                              className="bg-white border border-slate-200 text-slate-800 text-xs font-extrabold w-24 px-2 py-0.5 rounded text-center"
                            />
                          </div>
                          
                          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Sinkronitas: {Math.round((p1EppSync / p1EppTotal) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Update Prompt */}
              <div className="text-[10px] text-slate-400 font-medium flex items-center justify-center space-x-1 bg-slate-50 py-2 rounded-lg">
                <Info className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>Tekan tombol di bawah untuk menerapkan perubahan ke basis data real-time.</span>
              </div>

            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="border-t border-slate-200/80 pt-4 mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
              <span>Tervalidasi oleh Dinkes Kabupaten Nagekeo</span>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none text-xs font-bold text-slate-500 hover:text-slate-700 bg-white border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
              >
                Batal
              </button>
              
              <button
                onClick={handleSaveMetrics}
                disabled={isSaving}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 text-xs font-black text-white px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer ${
                  saveSuccess 
                    ? "bg-emerald-500 hover:bg-emerald-600 animate-none" 
                    : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg"
                }`}
              >
                {isSaving ? (
                  <span>Menyimpan...</span>
                ) : saveSuccess ? (
                  <>
                    <Check className="h-4.5 w-4.5 text-white" />
                    <span>Berhasil Disimpan!</span>
                  </>
                ) : (
                  <>
                    <Database className="h-4.5 w-4.5" />
                    <span>Simpan & Integrasikan</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
