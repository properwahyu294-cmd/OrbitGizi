import { useState, useEffect } from "react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  AreaChart, 
  Area,
  Legend
} from "recharts";
import { 
  RefreshCw, 
  Database, 
  Settings, 
  Activity, 
  MapPin, 
  Award, 
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
  Search,
  LayoutDashboard,
  Map,
  Brain,
  Handshake
} from "lucide-react";

// Types
import { OrbitGiziData, Village, Pillar, Indicator } from "./types";

// Components
import LogoOrbitGizi from "./components/LogoOrbitGizi";
import IndexGauge from "./components/IndexGauge";
import TheoryOfChange from "./components/TheoryOfChange";
import PetaRisiko from "./components/PetaRisiko";
import PilarCard from "./components/PilarCard";
import StakeholderCard from "./components/StakeholderCard";
import RecommendationCard from "./components/RecommendationCard";
import InputWizardModal from "./components/InputWizardModal";

// Firebase & Sheets integration
import { initAuth, googleSignIn, logout } from "./lib/firebase";
import { syncToGoogleSheets } from "./lib/sheetsService";
import { User } from "firebase/auth";
import { FileSpreadsheet, LogOut, CheckCircle, AlertCircle } from "lucide-react";

export default function App() {
  const [data, setData] = useState<OrbitGiziData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [villageSearch, setVillageSearch] = useState<string>("");
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [showInputWizard, setShowInputWizard] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Firebase & Google Sheets integration state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [syncingSheets, setSyncingSheets] = useState<boolean>(false);
  const [sheetsSyncUrl, setSheetsSyncUrl] = useState<string | null>(
    localStorage.getItem("orbit_gizi_spreadsheet_url")
  );
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);

  // Form states for Weights config
  const [weightP1, setWeightP1] = useState<number>(10);
  const [weightP2, setWeightP2] = useState<number>(30);
  const [weightP3, setWeightP3] = useState<number>(10);
  const [weightP4, setWeightP4] = useState<number>(25);
  const [weightP5, setWeightP5] = useState<number>(25);
  const [weightError, setWeightError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const response = await fetch("/api/data");
      if (!response.ok) {
        throw new Error("Gagal memuat data utama Orbit Gizi.");
      }
      const json = await response.json();
      setData(json);
      setWeightP1(json.weights.pilar1 * 100);
      setWeightP2(json.weights.pilar2 * 100);
      setWeightP3(json.weights.pilar3 * 100);
      setWeightP4(json.weights.pilar4 * 100);
      setWeightP5(json.weights.pilar5 * 100);
      setError(null);
    } catch (e: any) {
      setError(e.message || "Koneksi ke server terputus.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  // Initialize auth state on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setGoogleToken(token);
      },
      () => {
        setCurrentUser(null);
        setGoogleToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setSyncError(null);
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setGoogleToken(res.accessToken);
        // After successful login, auto sync to make user experience amazing!
        setTimeout(() => {
          handleSyncSheetsDirect(res.accessToken);
        }, 800);
      }
    } catch (err: any) {
      setSyncError("Gagal masuk dengan Google: " + err.message);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setGoogleToken(null);
      setSheetsSyncUrl(null);
      localStorage.removeItem("orbit_gizi_spreadsheet_id");
      localStorage.removeItem("orbit_gizi_spreadsheet_url");
    } catch (err: any) {
      setSyncError("Gagal keluar: " + err.message);
    }
  };

  const handleSyncSheetsDirect = async (token: string) => {
    if (!data) return;
    setSyncingSheets(true);
    setSyncError(null);
    setSyncSuccess(false);
    try {
      const result = await syncToGoogleSheets(token, data.kabupatenName, data);
      setSheetsSyncUrl(result.spreadsheetUrl);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 5000);
    } catch (err: any) {
      console.error(err);
      setSyncError("Gagal sinkronisasi data: " + err.message);
    } finally {
      setSyncingSheets(false);
    }
  };

  const handleSyncSheets = async () => {
    if (!googleToken) {
      // Prompt login first
      await handleGoogleLogin();
    } else {
      await handleSyncSheetsDirect(googleToken);
    }
  };

  // Handle indicator scores changes
  const handleIndicatorUpdate = async (pilarId: string, indicatorId: string, newScore: number) => {
    try {
      const res = await fetch("/api/indicators/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pilarId, indicatorId, newScore }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal memperbarui nilai indikator.");
      }
      setRefreshTrigger(prev => prev + 1);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  // Handle village metrics changes
  const handleVillageUpdate = async (updatedMetrics: Partial<Village>) => {
    try {
      const res = await fetch("/api/villages/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedMetrics),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal memperbarui data desa.");
      }
      setRefreshTrigger(prev => prev + 1);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  // Handle adding a new village
  const handleVillageAdd = async (name: string) => {
    try {
      const res = await fetch("/api/villages/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal menambahkan desa baru.");
      }
      setRefreshTrigger(prev => prev + 1);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  // Handle deleting a village
  const handleVillageDelete = async (id: string) => {
    try {
      const res = await fetch("/api/villages/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal menghapus desa.");
      }
      setRefreshTrigger(prev => prev + 1);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  // Handle resetting database
  const handleResetData = async () => {
    try {
      const res = await fetch("/api/data/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal mereset data.");
      }
      setRefreshTrigger(prev => prev + 1);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  // Handle clearing all database records
  const handleClearData = async () => {
    try {
      const res = await fetch("/api/data/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal menghapus semua data.");
      }
      setRefreshTrigger(prev => prev + 1);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  // Handle saving weights config
  const handleSaveWeights = async () => {
    const sum = weightP1 + weightP2 + weightP3 + weightP4 + weightP5;
    if (sum !== 100) {
      setWeightError(`Total bobot harus bernilai tepat 100%. Sekarang: ${sum}%`);
      return;
    }

    setWeightError(null);
    try {
      const res = await fetch("/api/weights/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pilar1: weightP1 / 100,
          pilar2: weightP2 / 100,
          pilar3: weightP3 / 100,
          pilar4: weightP4 / 100,
          pilar5: weightP5 / 100,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal memperbarui bobot.");
      }

      setShowConfigModal(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (e: any) {
      setWeightError(e.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="relative h-14 w-14 mb-4">
          <div className="absolute inset-0 rounded-xl border-4 border-slate-200"></div>
          <div className="absolute inset-0 rounded-xl border-4 border-emerald-500 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-sm font-bold text-slate-600 animate-pulse">Memuat Panel Transformasi Orbit Gizi...</p>
        <p className="text-xs text-slate-400 mt-1">Mengintegrasikan basis data MBG, PMT, Posyandu & e-PPGBM</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full shadow-lg text-center">
          <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-black text-slate-800">Sistem Luring (Offline)</h3>
          <p className="text-sm text-slate-500 mt-2">{error || "Terjadi kendala saat menyinkronkan data."}</p>
          <button
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            className="mt-5 w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-md transition-all duration-200"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Koneksikan Kembali</span>
          </button>
        </div>
      </div>
    );
  }

  // Filtered villages
  const filteredVillages = data.villages.filter(v => 
    v.name.toLowerCase().includes(villageSearch.toLowerCase())
  );

  // Sorting villages by performance score descending
  const sortedVillages = [...data.villages].sort((a, b) => b.score - a.score);

  // Extract Pilar 2 (Kolaborasi)
  const pillar2 = data.pillars.find(p => p.id === "pilar2")!;
  // Extract Pilar 1 (Integrasi Data)
  const pillar1 = data.pillars.find(p => p.id === "pilar1")!;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* 1. Header & Brand Logo */}
      <LogoOrbitGizi />

      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Action Header Panel - Permanent at top */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white border border-slate-200 rounded-2xl p-4 shadow-xs gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center space-x-2">
              <Layers className="h-5 w-5 text-indigo-600" />
              <span>Dashboard Transformasi Orbit Gizi</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kabupaten aktif: <strong className="text-slate-700 font-bold">{data.kabupatenName}</strong> • Real-time update terpadu
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Google Sheets Integration Section */}
            <div className="flex items-center space-x-2 bg-emerald-50/40 border border-emerald-100 p-1.5 px-3 rounded-xl">
              {currentUser ? (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center space-x-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-800">
                      Sheets Terhubung
                    </span>
                  </div>
                  {sheetsSyncUrl && (
                    <a
                      href={sheetsSyncUrl}
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className="text-[10px] font-black text-emerald-600 hover:underline bg-emerald-100/50 px-1.5 py-0.5 rounded-md"
                    >
                      Buka Spreadsheet ↗
                    </a>
                  )}
                  <button
                    onClick={handleSyncSheets}
                    disabled={syncingSheets}
                    className="text-[10px] font-black text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 px-2 py-1 rounded-md cursor-pointer flex items-center space-x-1"
                  >
                    <FileSpreadsheet className="h-3 w-3" />
                    <span>{syncingSheets ? "Menyinkronkan..." : "Sinkronisasi"}</span>
                  </button>
                  <button
                    onClick={handleGoogleLogout}
                    title="Putuskan Hubungan Google Sheets"
                    className="p-1 hover:bg-rose-100 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <LogOut className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGoogleLogin}
                  className="text-[10px] font-black text-emerald-800 hover:text-emerald-950 flex items-center space-x-1 cursor-pointer"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Hubungkan ke Google Sheets</span>
                </button>
              )}
            </div>

            <button
              onClick={() => setShowConfigModal(true)}
              className="flex items-center justify-center space-x-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <Settings className="h-4 w-4 text-slate-500" />
              <span>Atur Bobot Pilar</span>
            </button>
            
            <button
              onClick={() => setRefreshTrigger(prev => prev + 1)}
              className="p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Sync Feedbacks */}
        {(syncSuccess || syncError) && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            {syncSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl p-3 flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="flex-1">Data berhasil disinkronisasi ke Google Sheets! Seluruh data Orbit Gizi Anda aman dan ter-update di Google Sheets.</span>
                {sheetsSyncUrl && (
                  <a
                    href={sheetsSyncUrl}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] shadow-2xs"
                  >
                    Buka Spreadsheet
                  </a>
                )}
              </div>
            )}
            {syncError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl p-3 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                <span>{syncError}</span>
              </div>
            )}
          </div>
        )}

        {/* Workspace with Left Vertical Navigation Tab Menu */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Sidebar Menu Panel */}
          <div className="lg:w-72 shrink-0 space-y-4">
            
            {/* Horizontal scroll track on small mobile screens, vertical menu list on large desktop screens */}
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 gap-2 scrollbar-none bg-slate-100/50 p-2 rounded-2xl lg:bg-transparent lg:p-0">
              {[
                {
                  id: "overview",
                  name: "Ringkasan Indeks",
                  desc: "Nilai Indeks & Bobot Pilar",
                  icon: <LayoutDashboard className="h-4.5 w-4.5" />
                },
                {
                  id: "fondasi",
                  name: "Fondasi Program (ToC)",
                  desc: "Alur Transformasi Gizi",
                  icon: <Layers className="h-4.5 w-4.5" />
                },
                {
                  id: "peta",
                  name: "Peta & Kinerja Desa",
                  desc: "Zona Risiko & Leaderboard",
                  icon: <Map className="h-4.5 w-4.5" />
                },
                {
                  id: "analitik",
                  name: "Analitik Gizi (MBG/PMT)",
                  desc: "Grafik & Integrasi Data",
                  icon: <Activity className="h-4.5 w-4.5" />
                },
                {
                  id: "pilar",
                  name: "Pilar Transformasi",
                  desc: "Detail Nilai Tiap Pilar",
                  icon: <Award className="h-4.5 w-4.5" />
                },
                {
                  id: "rekomendasi",
                  name: "Analisis Data",
                  desc: "Rekomendasi Kebijakan Strategis",
                  icon: <Sparkles className="h-4.5 w-4.5 text-emerald-500" />
                },
                {
                  id: "sinergi",
                  name: "Sinergi Stakeholder",
                  desc: "Kolaborasi OPD Kabupaten",
                  icon: <Handshake className="h-4.5 w-4.5" />
                }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-3 text-left p-3 rounded-xl transition-all w-52 sm:w-56 lg:w-full shrink-0 border cursor-pointer ${
                      isActive
                        ? "bg-white border-indigo-200 text-indigo-700 shadow-xs lg:border-l-[4px] lg:border-l-indigo-600 lg:rounded-l-none"
                        : "bg-transparent border-transparent text-slate-500 hover:bg-white/70 hover:text-slate-800"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-500"}`}>
                      {tab.icon}
                    </div>
                    <div className="truncate">
                      <span className="text-xs font-black block leading-tight">{tab.name}</span>
                      <span className="text-[10px] text-slate-400 font-medium truncate block mt-0.5 leading-none">{tab.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Kabupaten Profile Info widget in Sidebar (Desktop only) */}
            <div className="hidden lg:block bg-slate-900 text-slate-300 rounded-2xl p-4.5 border border-slate-800 shadow-xs space-y-3.5">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-indigo-400 tracking-wider uppercase">SISTEM INTEGRASI</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 block">Kecamatan Pantauan</span>
                <span className="text-xs font-black text-white">7 Wilayah Terpadu</span>
              </div>
              <div className="pt-2.5 border-t border-slate-800 flex justify-between items-center text-[10px]">
                <span className="text-slate-400 font-semibold">Total Indikator</span>
                <span className="font-mono text-emerald-400 font-bold">14 Parameter Riil</span>
              </div>
            </div>

          </div>

          {/* Active Worksite Area (Content Panel) */}
          <div className="flex-1 min-w-0">
            
            {activeTab === "overview" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* Score Gauge Widget */}
                <IndexGauge 
                  score={data.indexScore} 
                  category={data.category} 
                  weights={data.weights} 
                  lastUpdated={data.lastUpdated}
                />
                
                {/* Zona Sebaran Desa Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center space-x-3.5 shadow-2xs">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Zona Hijau (Aman)</span>
                      <span className="text-lg font-black text-slate-800">
                        {data.villages.filter(v => v.riskLevel === "Hijau").length} Desa
                      </span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center space-x-3.5 shadow-2xs">
                    <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Zona Kuning (Waspada)</span>
                      <span className="text-lg font-black text-slate-800">
                        {data.villages.filter(v => v.riskLevel === "Kuning").length} Desa
                      </span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center space-x-3.5 shadow-2xs">
                    <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Zona Merah (Rentan)</span>
                      <span className="text-lg font-black text-slate-800">
                        {data.villages.filter(v => v.riskLevel === "Merah").length} Desa
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-100/60 rounded-2xl p-4 border border-slate-200/60 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-slate-800 uppercase">Input Berkala Data Gizi Riil Desa</h4>
                    <p className="text-[11px] text-slate-500">Mulai integrasikan data bulanan MBG, PMT, Posyandu, dan e-PPGBM menggunakan Modul Wizard.</p>
                  </div>
                  <button
                    onClick={() => setShowInputWizard(true)}
                    className="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 transition-all shadow-xs cursor-pointer"
                  >
                    Buka Wizard Input Data
                  </button>
                </div>

              </div>
            )}

            {activeTab === "fondasi" && (
              <div className="animate-in fade-in duration-200">
                <TheoryOfChange onInputClick={() => setShowInputWizard(true)} />
              </div>
            )}

            {activeTab === "peta" && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-in fade-in duration-200">
                
                {/* 4. Peta Risiko (Map & Village Stats Editor) */}
                <div className="xl:col-span-8">
                  <PetaRisiko 
                    villages={data.villages} 
                    onVillageUpdate={handleVillageUpdate} 
                    onVillageAdd={handleVillageAdd}
                    onVillageDelete={handleVillageDelete}
                    onResetData={handleResetData}
                    onClearData={handleClearData}
                  />
                </div>

                {/* 8. Kinerja Desa (Leaderboard) */}
                <div className="xl:col-span-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs" id="kinerja-desa">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4.5 w-4.5 text-slate-500" />
                        <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase">
                          PERINGKAT KINERJA DESA
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">Total: {data.villages.length}</span>
                    </div>

                    {/* Mini search input */}
                    <div className="relative mb-3.5">
                      <input
                        type="text"
                        placeholder="Cari desa..."
                        value={villageSearch}
                        onChange={(e) => setVillageSearch(e.target.value)}
                        className="w-full text-xs font-semibold pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50/50"
                      />
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    </div>

                    <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                      {filteredVillages.length === 0 ? (
                        <p className="text-xs font-bold text-slate-400 text-center py-4">Desa tidak ditemukan.</p>
                      ) : (
                        filteredVillages.map((v) => {
                          let riskColor = "bg-emerald-500";
                          let riskText = "text-emerald-600 bg-emerald-50";
                          if (v.riskLevel === "Merah") {
                            riskColor = "bg-rose-500";
                            riskText = "text-rose-600 bg-rose-50";
                          } else if (v.riskLevel === "Kuning") {
                            riskColor = "bg-amber-500";
                            riskText = "text-amber-600 bg-amber-50";
                          }

                          return (
                            <div 
                              key={v.id} 
                              className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-xl hover:shadow-2xs transition-shadow"
                            >
                              <div className="flex-1 pr-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-slate-800">{v.name}</span>
                                  <span className="text-[9px] font-mono text-slate-400 font-semibold">{v.pilar5_stunting_curr} Kasus</span>
                                </div>
                                <div className="h-1 w-full bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                                  <div className={`h-full ${riskColor} rounded-full`} style={{ width: `${v.score}%` }}></div>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ${riskText}`}>
                                  {v.score} pts
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === "analitik" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  
                  {/* Left Column for Charts */}
                  <div className="xl:col-span-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Grafik MBG */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs" id="grafik-mbg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase">
                              GRAFIK REALISASI MBG (MAKAN BERGIZI GRATIS)
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">Tren target bulanan vs realisasi distribusi pangan sehat sekolah</p>
                          </div>
                          <Activity className="h-4 w-4 text-emerald-500" />
                        </div>

                        <div className="h-56">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.mbgMonthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} />
                              <YAxis tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} />
                              <Tooltip 
                                contentStyle={{ fontSize: 11, fontWeight: 600, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }} 
                                labelStyle={{ fontWeight: 800, color: '#334155' }}
                              />
                              <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                              <Bar name="Target Sasaran (Anak)" dataKey="target" fill="#93c5fd" radius={[4, 4, 0, 0]} barSize={16} />
                              <Bar name="Realisasi Terlayani" dataKey="realized" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Grafik PMT */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs" id="grafik-pmt">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase">
                              GRAFIK INTERVENSI PMT (MAKANAN TAMBAHAN)
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">Cakupan PMT balita wasting & ibu hamil KEK tingkat kabupaten</p>
                          </div>
                          <Activity className="h-4 w-4 text-indigo-500" />
                        </div>

                        <div className="h-56">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.pmtMonthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorPmt" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} />
                              <YAxis tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} />
                              <Tooltip 
                                contentStyle={{ fontSize: 11, fontWeight: 600, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }} 
                                labelStyle={{ fontWeight: 800, color: '#334155' }}
                              />
                              <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                              <Area name="Kebutuhan PMT" dataKey="target" stroke="#a5b4fc" fill="none" strokeWidth={2} dot={{ r: 3 }} />
                              <Area name="Realisasi Distribusi" dataKey="realized" stroke="#6366f1" fillOpacity={1} fill="url(#colorPmt)" strokeWidth={2.5} dot={{ r: 4 }} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Right Column for Integrasi Data (Pilar 1) */}
                  <div className="xl:col-span-4">
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs" id="data-integrasi">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <Database className="h-4.5 w-4.5 text-slate-500" />
                          <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase">
                            7. DATA INTEGRASI MULTI-SISTEM
                          </h3>
                        </div>
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-600">
                          Pilar 1
                        </span>
                      </div>

                      <div className="space-y-3">
                        {pillar1.indicators.map((ind) => {
                          let badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-100";
                          let statusText = "Tersinkronisasi";
                          if (ind.score < 60) {
                            badgeStyle = "bg-rose-50 text-rose-700 border-rose-100";
                            statusText = "Keterlambatan";
                          } else if (ind.score < 80) {
                            badgeStyle = "bg-amber-50 text-amber-700 border-amber-100";
                            statusText = "Validasi Berjalan";
                          }

                          return (
                            <div 
                              key={ind.id} 
                              className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 flex items-center justify-between"
                            >
                              <div>
                                <span className="text-xs font-bold text-slate-800 block">{ind.name}</span>
                                <div className="flex items-center space-x-1.5 mt-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                  <span className="text-[10px] text-slate-400 font-mono">Kevalidan: {ind.score}%</span>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[9px] font-bold border ${badgeStyle}`}>
                                  {statusText}
                                </span>
                                <span className="block text-[8px] text-slate-400 mt-1 font-mono">Latency ~0.8s</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {activeTab === "pilar" && (
              <div className="animate-in fade-in duration-200">
                <PilarCard pillars={data.pillars} />
              </div>
            )}

            {activeTab === "rekomendasi" && (
              <div className="animate-in fade-in duration-200">
                <RecommendationCard 
                  lastUpdated={data.lastUpdated} 
                  triggerRefresh={refreshTrigger} 
                />
              </div>
            )}

            {activeTab === "sinergi" && (
              <div className="animate-in fade-in duration-200">
                <StakeholderCard pillar2={pillar2} />
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Footer Branding */}
      <footer className="mt-12 bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-center text-xs font-medium">
        <p>© 2026 Orbit Gizi Kabupaten • Sistem Analisis Gizi Terintegrasi Nasional</p>
        <p className="text-[10px] text-slate-600 mt-1">Dinkes • Badan Gizi Nasional • PKK • Pemdes • Puskesmas</p>
      </footer>

      {/* Weights Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Pengaturan Bobot Indeks</h3>
              <button 
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Tutup
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Sesuaikan porsi bobot pengaruh dari setiap pilar indikator gizi. <strong>Total kumulatif pilar wajib bernilai tepat 100%</strong>.
              </p>

              {weightError && (
                <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 text-rose-700 text-xs font-bold">
                  {weightError}
                </div>
              )}

              <div className="space-y-3.5">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>P1. Integrasi Data</span>
                    <span>{weightP1}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" value={weightP1} 
                    onChange={(e) => setWeightP1(parseInt(e.target.value) || 0)}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>P2. Kolaborasi OPD</span>
                    <span>{weightP2}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" value={weightP2} 
                    onChange={(e) => setWeightP2(parseInt(e.target.value) || 0)}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>P3. Digitalisasi</span>
                    <span>{weightP3}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" value={weightP3} 
                    onChange={(e) => setWeightP3(parseInt(e.target.value) || 0)}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>P4. Pelayanan Gizi</span>
                    <span>{weightP4}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" value={weightP4} 
                    onChange={(e) => setWeightP4(parseInt(e.target.value) || 0)}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>P5. Outcome & Dampak</span>
                    <span>{weightP5}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" value={weightP5} 
                    onChange={(e) => setWeightP5(parseInt(e.target.value) || 0)}
                    className="w-full accent-emerald-500"
                  />
                </div>
              </div>

              {/* Total helper */}
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-600">
                <span>Total Akumulatif:</span>
                <span className={weightP1 + weightP2 + weightP3 + weightP4 + weightP5 === 100 ? "text-emerald-600" : "text-rose-500"}>
                  {weightP1 + weightP2 + weightP3 + weightP4 + weightP5}%
                </span>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={handleSaveWeights}
                  className="flex-1 text-center bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl transition-colors shadow-xs"
                >
                  Simpan Konfigurasi
                </button>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 text-center text-slate-500 hover:bg-slate-100 text-xs font-bold rounded-xl transition-colors border border-slate-200"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Gizi Input Wizard Modal */}
      <InputWizardModal
        isOpen={showInputWizard}
        onClose={() => setShowInputWizard(false)}
        villages={data.villages}
        onSave={handleVillageUpdate}
        weights={data.weights}
      />

    </div>
  );
}
