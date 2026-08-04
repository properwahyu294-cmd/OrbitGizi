import { useState, useEffect, FormEvent } from "react";
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
  MapPin,
  Building2,
  Users
} from "lucide-react";
import { Village, Weights } from "../types";
import { LocationSelectorField } from "./LocationSelectorField";

interface InputWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  villages: Village[];
  onSave: (updatedVillageMetrics: Partial<Village>) => Promise<void>;
  weights: Weights;
}

type TabType = "mbg" | "pmt" | "posyandu" | "eppgbm" | "location";

export default function InputWizardModal({
  isOpen,
  onClose,
  villages,
  onSave,
  weights
}: InputWizardModalProps) {
  const [selectedVillageId, setSelectedVillageId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabType>("mbg");

  // Dynamic Options derived cleanly from villages
  const propinsiOptions: string[] = Array.from(new Set(villages.map(v => v.locationHierarchy?.propinsi).filter((x): x is string => Boolean(x))));
  const kabupatenOptions: string[] = Array.from(new Set(villages.map(v => v.locationHierarchy?.kabupaten).filter((x): x is string => Boolean(x))));
  const puskesmasOptions: string[] = Array.from(new Set(villages.map(v => v.locationHierarchy?.puskesmas).filter((x): x is string => Boolean(x))));
  const dusunOptions: string[] = Array.from(new Set(villages.map(v => v.locationHierarchy?.dusun).filter((x): x is string => Boolean(x))));
  const posyanduOptions: string[] = Array.from(new Set(villages.map(v => v.locationHierarchy?.posyandu).filter((x): x is string => Boolean(x))));
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

  // Location Hierarchy fields
  const [propinsi, setPropinsi] = useState<string>("Nusa Tenggara Timur");
  const [kabupaten, setKabupaten] = useState<string>("Kabupaten Nagekeo");
  const [puskesmas, setPuskesmas] = useState<string>("Puskesmas Boawae");
  const [dusun, setDusun] = useState<string>("Dusun I Malasera");
  const [posyanduName, setPosyanduName] = useState<string>("Posyandu Mawar");

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

      if (v.locationHierarchy) {
        setPropinsi(v.locationHierarchy.propinsi || "Nusa Tenggara Timur");
        setKabupaten(v.locationHierarchy.kabupaten || "Kabupaten Nagekeo");
        setPuskesmas(v.locationHierarchy.puskesmas || "Puskesmas Boawae");
        setDusun(v.locationHierarchy.dusun || "Dusun I");
        setPosyanduName(v.locationHierarchy.posyandu || "Posyandu Mawar");
      }
      
      setSaveSuccess(false);
    }
  }, [selectedVillageId, villages]);

  if (!isOpen || villages.length === 0) return null;

  const currentVillage = villages.find(x => x.id === selectedVillageId) || villages[0];

  const getRatioScore = (nominator: number, denominator: number): number => {
    if (denominator <= 0) return 100;
    return Math.max(0, Math.min(100, Math.round((nominator / denominator) * 100)));
  };

  // Live Score Calculator
  const calculateLiveScoreAndRisk = () => {
    const p1 = Math.round((
      getRatioScore(p1MbgSync, p1MbgTotal) +
      getRatioScore(p1PmtSync, p1PmtTotal) +
      getRatioScore(p1PosSync, p1PosTotal) +
      getRatioScore(p1EppSync, p1EppTotal)
    ) / 4);

    const p2_active_count = (currentVillage.pilar2_dinkes_aktif ? 1 : 0) +
                            (currentVillage.pilar2_bgn_aktif ? 1 : 0) +
                            (currentVillage.pilar2_pkk_aktif ? 1 : 0) +
                            (currentVillage.pilar2_pemdes_aktif ? 1 : 0) +
                            (currentVillage.pilar2_puskesmas_aktif ? 1 : 0);
    const p2 = Math.round((p2_active_count / 5) * 100);

    const p3_active_count = (currentVillage.pilar3_dashboard_online ? 1 : 0) +
                            (currentVillage.pilar3_validasi_data ? 1 : 0) +
                            (currentVillage.pilar3_real_time_update ? 1 : 0);
    const p3 = Math.round((p3_active_count / 3) * 100);

    const p4 = Math.round((
      getRatioScore(p4MbgRealized, p4MbgTarget) +
      getRatioScore(p4PmtRealized, p4PmtTarget) +
      getRatioScore(currentVillage.pilar4_home_visit, currentVillage.pilar4_home_visit_target) +
      getRatioScore(p4PosAktif, p4PosTotal)
    ) / 4);

    const stuntingReduction = Math.max(0, currentVillage.pilar5_stunting_prev - currentVillage.pilar5_stunting_curr);
    const stuntingScore = Math.min(100, Math.round((stuntingReduction / Math.max(1, currentVillage.pilar5_stunting_prev)) * 100) + 50);
    const p5 = Math.round((stuntingScore + currentVillage.pilar5_target_accuracy) / 2);

    const score = Math.round(
      p1 * weights.pilar1 +
      p2 * weights.pilar2 +
      p3 * weights.pilar3 +
      p4 * weights.pilar4 +
      p5 * weights.pilar5
    );

    let riskLevel: "Hijau" | "Kuning" | "Merah" = "Kuning";
    if (score >= 75) riskLevel = "Hijau";
    else if (score < 50) riskLevel = "Merah";

    return { score, riskLevel, p1, p4 };
  };

  const { score: liveScore, riskLevel: liveRisk, p1: p1Score, p4: p4Score } = calculateLiveScoreAndRisk();

  const handleFormSave = async (e: FormEvent) => {
    e.preventDefault();
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
        pilar4_posyandu_total: p4PosTotal,
        score: liveScore,
        riskLevel: liveRisk,
        locationHierarchy: {
          propinsi,
          kabupaten,
          puskesmas,
          kelurahan: currentVillage.name,
          dusun,
          posyandu: posyanduName
        }
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e: any) {
      alert("Gagal menyimpan data: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-5xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Navigation Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl">
              <Database className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">Formulir Input Data & Indeks Entitas Wilayah</h2>
              <p className="text-xs text-slate-400">Pembaruan indikator untuk Desa, Kelurahan, Posyandu, Puskesmas, atau Kabupaten</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Main Content Body (Vertical Tabs + Form) */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          
          {/* Vertical Sidebar Navigation */}
          <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4 space-y-2 shrink-0 flex flex-col justify-between overflow-y-auto">
            
            <div className="space-y-3">
              <div className="px-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                  PILIH ENTITAS SASARAN
                </label>
                <select
                  value={selectedVillageId}
                  onChange={(e) => setSelectedVillageId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-black text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none cursor-pointer"
                >
                  {villages.map((v) => (
                    <option key={v.id} value={v.id}>
                      [{v.unitType || "Desa"}] {v.name} ({v.riskLevel})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 block mb-2">MODUL INPUT VERTIKAL</span>
                
                <button
                  onClick={() => setActiveTab("mbg")}
                  className={`w-full flex items-center space-x-2.5 p-3 rounded-xl text-xs font-black transition-all cursor-pointer text-left ${
                    activeTab === "mbg"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-700 hover:bg-slate-200/60"
                  }`}
                >
                  <Activity className="h-4 w-4 shrink-0" />
                  <span>1. Integrasi & Realisasi MBG</span>
                </button>

                <button
                  onClick={() => setActiveTab("pmt")}
                  className={`w-full flex items-center space-x-2.5 p-3 rounded-xl text-xs font-black transition-all cursor-pointer text-left ${
                    activeTab === "pmt"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-700 hover:bg-slate-200/60"
                  }`}
                >
                  <BarChart className="h-4 w-4 shrink-0" />
                  <span>2. Intervensi PMT Pemulihan</span>
                </button>

                <button
                  onClick={() => setActiveTab("posyandu")}
                  className={`w-full flex items-center space-x-2.5 p-3 rounded-xl text-xs font-black transition-all cursor-pointer text-left ${
                    activeTab === "posyandu"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-700 hover:bg-slate-200/60"
                  }`}
                >
                  <Building2 className="h-4 w-4 shrink-0" />
                  <span>3. Digitalisasi Posyandu</span>
                </button>

                <button
                  onClick={() => setActiveTab("eppgbm")}
                  className={`w-full flex items-center space-x-2.5 p-3 rounded-xl text-xs font-black transition-all cursor-pointer text-left ${
                    activeTab === "eppgbm"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-700 hover:bg-slate-200/60"
                  }`}
                >
                  <TrendingUp className="h-4 w-4 shrink-0" />
                  <span>4. e-PPGBM Kemenkes</span>
                </button>

                <button
                  onClick={() => setActiveTab("location")}
                  className={`w-full flex items-center space-x-2.5 p-3 rounded-xl text-xs font-black transition-all cursor-pointer text-left ${
                    activeTab === "location"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-700 hover:bg-slate-200/60"
                  }`}
                >
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>5. Hierarki Lokasi Desa</span>
                </button>
              </div>
            </div>

            {/* Live Calculated Score Widget */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2 mt-4">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">PROYEKSI SKOR INDEKS DESA</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900">{liveScore} <span className="text-xs font-medium text-slate-500">/100</span></span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                  liveRisk === "Hijau" ? "bg-emerald-100 text-emerald-800" : liveRisk === "Kuning" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                }`}>
                  {liveRisk}
                </span>
              </div>
            </div>

          </div>

          {/* Form Content Panel */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            
            <form onSubmit={handleFormSave} className="space-y-6">
              
              {activeTab === "mbg" && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-base font-black text-slate-900">🍱 Integrasi & Realisasi Makan Bergizi Gratis (MBG)</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Atur keterhubungan data sasaran anak & realisasi distribusi harian.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">MBG Tersinkronisasi (Pilar 1)</label>
                      <input
                        type="number"
                        min="0"
                        value={p1MbgSync}
                        onChange={(e) => setP1MbgSync(parseInt(e.target.value) || 0)}
                        className="w-full border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">Total Target MBG (Pilar 1)</label>
                      <input
                        type="number"
                        min="1"
                        value={p1MbgTotal}
                        onChange={(e) => setP1MbgTotal(parseInt(e.target.value) || 1)}
                        className="w-full border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">Realisasi Distribusi MBG (Pilar 4)</label>
                      <input
                        type="number"
                        min="0"
                        value={p4MbgRealized}
                        onChange={(e) => setP4MbgRealized(parseInt(e.target.value) || 0)}
                        className="w-full border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">Target Distribusi MBG (Pilar 4)</label>
                      <input
                        type="number"
                        min="1"
                        value={p4MbgTarget}
                        onChange={(e) => setP4MbgTarget(parseInt(e.target.value) || 1)}
                        className="w-full border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "pmt" && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-base font-black text-slate-900">🍼 Intervensi Makanan Tambahan (PMT Pemulihan)</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Pemantauan ibu hamil KEK & balita gizi kurang di {currentVillage.name}.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">Data PMT Tersinkron (Pilar 1)</label>
                      <input
                        type="number"
                        min="0"
                        value={p1PmtSync}
                        onChange={(e) => setP1PmtSync(parseInt(e.target.value) || 0)}
                        className="w-full border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">Total Sasaran PMT (Pilar 1)</label>
                      <input
                        type="number"
                        min="1"
                        value={p1PmtTotal}
                        onChange={(e) => setP1PmtTotal(parseInt(e.target.value) || 1)}
                        className="w-full border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">Realisasi PMT Lapangan (Pilar 4)</label>
                      <input
                        type="number"
                        min="0"
                        value={p4PmtRealized}
                        onChange={(e) => setP4PmtRealized(parseInt(e.target.value) || 0)}
                        className="w-full border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">Target PMT Lapangan (Pilar 4)</label>
                      <input
                        type="number"
                        min="1"
                        value={p4PmtTarget}
                        onChange={(e) => setP4PmtTarget(parseInt(e.target.value) || 1)}
                        className="w-full border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "posyandu" && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-base font-black text-slate-900">🏥 Digitalisasi Posyandu & Keaktifan Layanan</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Status digitalisasi & keaktifan operasional posyandu di desa.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">Posyandu Digital Terkoneksi (Pilar 1)</label>
                      <input
                        type="number"
                        min="0"
                        value={p1PosSync}
                        onChange={(e) => setP1PosSync(parseInt(e.target.value) || 0)}
                        className="w-full border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">Total Unit Posyandu (Pilar 1)</label>
                      <input
                        type="number"
                        min="1"
                        value={p1PosTotal}
                        onChange={(e) => setP1PosTotal(parseInt(e.target.value) || 1)}
                        className="w-full border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">Posyandu Aktif Operasional (Pilar 4)</label>
                      <input
                        type="number"
                        min="0"
                        value={p4PosAktif}
                        onChange={(e) => setP4PosAktif(parseInt(e.target.value) || 0)}
                        className="w-full border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "eppgbm" && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-base font-black text-slate-900">📊 Integrasi Data e-PPGBM Kemenkes RI</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Tingkat kelengkapan entri penimbangan balita e-PPGBM.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">Data Balita e-PPGBM Sinkron</label>
                      <input
                        type="number"
                        min="0"
                        value={p1EppSync}
                        onChange={(e) => setP1EppSync(parseInt(e.target.value) || 0)}
                        className="w-full border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">Total Balita e-PPGBM Terdaftar</label>
                      <input
                        type="number"
                        min="1"
                        value={p1EppTotal}
                        onChange={(e) => setP1EppTotal(parseInt(e.target.value) || 1)}
                        className="w-full border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "location" && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-base font-black text-slate-900">📍 Pengaturan Hierarki Lokasi Desa</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Propinsi, Kabupaten, Puskesmas, Dusun, dan Posyandu desa {currentVillage.name}.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <LocationSelectorField
                      label="PROPINSI"
                      value={propinsi}
                      onChange={setPropinsi}
                      options={propinsiOptions}
                      isDark={false}
                    />

                    <LocationSelectorField
                      label="KABUPATEN"
                      value={kabupaten}
                      onChange={setKabupaten}
                      options={kabupatenOptions}
                      isDark={false}
                    />

                    <LocationSelectorField
                      label="PUSKESMAS PEMBINA"
                      value={puskesmas}
                      onChange={setPuskesmas}
                      options={puskesmasOptions}
                      isDark={false}
                    />

                    <LocationSelectorField
                      label="DUSUN DUKUNGAN"
                      value={dusun}
                      onChange={setDusun}
                      options={dusunOptions}
                      isDark={false}
                    />

                    <div className="sm:col-span-2">
                      <LocationSelectorField
                        label="NAMA POSYANDU UTAMA"
                        value={posyanduName}
                        onChange={setPosyanduName}
                        options={posyanduOptions}
                        isDark={false}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 border border-slate-200 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Tutup
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className={`px-6 py-2.5 rounded-xl font-black text-xs text-white transition-all cursor-pointer shadow-md ${
                    saveSuccess ? "bg-emerald-600" : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {saveSuccess ? "Tersimpan Ke Indeks!" : isSaving ? "Menyimpan..." : "Simpan Perubahan Indeks Desa"}
                </button>
              </div>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
