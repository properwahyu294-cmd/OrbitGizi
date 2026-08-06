import React, { useState } from "react";
import { 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Activity, 
  Table, 
  HeartHandshake, 
  Layers, 
  Award, 
  Building2, 
  CheckCircle2, 
  Lock, 
  Database,
  TrendingUp,
  Heart,
  HelpCircle,
  Info,
  BookOpen,
  FileText,
  X,
  Target,
  Compass,
  FileSpreadsheet,
  Users,
  Check,
  ChevronRight
} from "lucide-react";
import BannerCarousel from "./BannerCarousel";

interface LauncherLandingProps {
  onLaunchDashboard: () => void;
  totalBeneficiariesCount: number;
  totalMbgCount: number;
  totalPmtCount: number;
  selectedKabupaten?: string;
}

export const LauncherLanding: React.FC<LauncherLandingProps> = ({
  onLaunchDashboard,
  totalBeneficiariesCount,
  totalMbgCount,
  totalPmtCount,
  selectedKabupaten = "Kabupaten Nagekeo"
}) => {
  const [activeTab, setActiveTab] = useState<"ABOUT" | "GUIDE">("ABOUT");
  const [showModal, setShowModal] = useState<"NONE" | "ABOUT" | "GUIDE">("NONE");

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-white relative overflow-hidden font-sans">
      
      {/* Background Decorative Glowing Gradients & Minimalist Patterns */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/2"></div>
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* TOP LAUNCHER NAVBAR */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl shadow-lg shadow-emerald-500/20 text-slate-950 font-black flex items-center justify-center">
            <Activity className="h-6 w-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                SYSTEM LAUNCHER v2.5
              </span>
              <span className="text-xs text-teal-300/80 font-bold">• {selectedKabupaten}</span>
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">
              Orbit Gizi System
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* TENTANG BUTTON */}
          <button
            onClick={() => setShowModal("ABOUT")}
            className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
          >
            <Info className="h-4 w-4 text-emerald-400" />
            <span>Tentang Aplikasi</span>
          </button>

          {/* PANDUAN BUTTON */}
          <button
            onClick={() => setShowModal("GUIDE")}
            className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
          >
            <BookOpen className="h-4 w-4 text-cyan-400" />
            <span>Panduan Pengguna</span>
          </button>

          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-emerald-500/30 text-xs text-emerald-300 ml-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="font-bold">Firebase & Cyber Guard Protected</span>
          </div>

          <button
            onClick={onLaunchDashboard}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-xs rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02] cursor-pointer active:scale-95"
          >
            <span>Buka Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* MAIN HERO & BANNER CONTENT */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 flex-1 flex flex-col justify-center space-y-10">
        
        {/* HERO TITLE BANNER */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-bold shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
            <span>Platform Transformasi Tata Kelola Gizi Terintegrasi</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Pusat Data Gizi, <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">MBG, PMT</span> & Kesehatan Anak
          </h2>

          <p className="text-slate-300 text-sm sm:text-base font-medium leading-relaxed max-w-2xl mx-auto">
            Sistem analisis presisi tinggi untuk pemantauan Makanan Bergizi Gratis (MBG), Pemberian Makanan Tambahan (PMT), e-PPGBM, dan pencegahan Stunting di Kabupaten Nagekeo.
          </p>

          {/* MAIN LAUNCH ACTION BUTTON */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onLaunchDashboard}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:from-emerald-300 hover:to-cyan-200 text-slate-950 font-black text-sm rounded-2xl flex items-center justify-center space-x-3 transition-all shadow-xl shadow-emerald-500/25 hover:scale-105 cursor-pointer active:scale-95 group"
            >
              <Activity className="h-5 w-5 text-slate-950 group-hover:rotate-12 transition-transform" />
              <span>MASUK KE DASHBOARD UTAMA</span>
              <ArrowRight className="h-5 w-5 text-slate-950 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* HERO CAROUSEL BANNER */}
        <div className="w-full max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/20 bg-slate-900/60 p-2">
          <BannerCarousel />
        </div>

        {/* PROGRAM METRICS & FEATURES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto w-full pt-2">
          
          {/* Card 1: MBG */}
          <div className="bg-slate-900/70 border border-emerald-500/30 rounded-2xl p-5 hover:border-emerald-400 transition-all space-y-3 group backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-xl group-hover:scale-110 transition-transform">
                <Award className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                UTAMA
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-white">Program MBG</h3>
              <p className="text-xs text-slate-300 mt-1 font-medium">Makanan Bergizi Gratis harian untuk Balita, Ibu Hamil & Menyusui.</p>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Total Terjangkau</span>
              <span className="font-black text-emerald-400">{totalMbgCount} Sasaran</span>
            </div>
          </div>

          {/* Card 2: PMT Pemulihan */}
          <div className="bg-slate-900/70 border border-purple-500/30 rounded-2xl p-5 hover:border-purple-400 transition-all space-y-3 group backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-purple-500/20 text-purple-300 rounded-xl group-hover:scale-110 transition-transform">
                <Heart className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                PEMULIHAN
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-white">Program PMT</h3>
              <p className="text-xs text-slate-300 mt-1 font-medium">Pemberian Makanan Tambahan khusus balita gizi kurang & risiko stunting.</p>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Total Terjangkau</span>
              <span className="font-black text-purple-300">{totalPmtCount} Sasaran</span>
            </div>
          </div>

          {/* Card 3: Analytic Data Pivot */}
          <div className="bg-slate-900/70 border border-indigo-500/30 rounded-2xl p-5 hover:border-indigo-400 transition-all space-y-3 group backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-indigo-500/20 text-indigo-300 rounded-xl group-hover:scale-110 transition-transform">
                <Table className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                ANALYTICS
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-white">Analytic Data Pivot</h3>
              <p className="text-xs text-slate-300 mt-1 font-medium">Matriks Pivot Table interaktif, Grafik Recharts, & Laporan Eksekutif AI.</p>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Dimensi Filter</span>
              <span className="font-black text-indigo-300">Posyandu & Status Gizi</span>
            </div>
          </div>

          {/* Card 4: Cyber Security & Firebase Fortress */}
          <div className="bg-slate-900/70 border border-teal-500/30 rounded-2xl p-5 hover:border-teal-400 transition-all space-y-3 group backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-teal-500/20 text-teal-300 rounded-xl group-hover:scale-110 transition-transform">
                <Lock className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">
                SECURITY
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-white">Cyber Security Guard</h3>
              <p className="text-xs text-slate-300 mt-1 font-medium">Firestore ABAC Fortress v2, Anti-SQL/NoSQL Injection & Sanitasi XSS.</p>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Status Proteksi</span>
              <span className="font-black text-emerald-400">✅ Active & Hardened</span>
            </div>
          </div>

        </div>

        {/* SECTION: TENTANG APLIKASI & PANDUAN PENGGUNA (INLINE TABBED CARD) */}
        <div id="info-guide-section" className="max-w-6xl mx-auto w-full bg-slate-900/80 border border-emerald-500/20 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
          
          {/* TAB BUTTONS */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">
                PUSAT INFORMASI & PANDUAN RESMI
              </span>
              <h3 className="text-xl font-black text-white mt-0.5">
                {activeTab === "ABOUT" ? "Tentang System Orbit Gizi v2.5" : "Panduan Pengguna & Alur Kerja"}
              </h3>
            </div>

            <div className="flex items-center space-x-2 bg-slate-950/80 p-1.5 rounded-2xl border border-white/10">
              <button
                onClick={() => setActiveTab("ABOUT")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "ABOUT"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Info className="h-4 w-4" />
                <span>Tentang Aplikasi</span>
              </button>

              <button
                onClick={() => setActiveTab("GUIDE")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "GUIDE"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>Panduan Pengguna</span>
              </button>
            </div>
          </div>

          {/* TAB CONTENT 1: TENTANG APLIKASI */}
          {activeTab === "ABOUT" && (
            <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
              
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-5 space-y-3">
                <h4 className="text-base font-black text-white flex items-center space-x-2">
                  <Target className="h-5 w-5 text-emerald-400" />
                  <span>Visi & Misi Transformasi Gizi</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-300">
                  Orbit Gizi System dikembangkan sebagai tulang punggung digital percepatan penurunan stunting dan efektivitas intervensi program nasional Makanan Bergizi Gratis (MBG) serta Pemberian Makanan Tambahan (PMT) Pemulihan di wilayah Kabupaten Nagekeo.
                </p>
              </div>

              {/* 5 PILAR GRID */}
              <div>
                <h4 className="text-sm font-black text-emerald-400 uppercase tracking-wider mb-3 flex items-center space-x-2">
                  <Layers className="h-4 w-4" />
                  <span>5 Pilar Kinerja Transformasi Gizi Orbit</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-400">PILAR 1 (10%)</span>
                      <span className="p-1 bg-emerald-500/20 rounded text-emerald-300"><Database className="h-3.5 w-3.5" /></span>
                    </div>
                    <h5 className="font-bold text-white text-xs">Sinkronisasi Data Riil</h5>
                    <p className="text-[11px] text-slate-400">Integrasi empat sumber data: MBG, PMT, e-PPGBM, dan data fisik Posyandu.</p>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-indigo-400">PILAR 2 (30%)</span>
                      <span className="p-1 bg-indigo-500/20 rounded text-indigo-300"><HeartHandshake className="h-3.5 w-3.5" /></span>
                    </div>
                    <h5 className="font-bold text-white text-xs">Kolaborasi Multisektoral</h5>
                    <p className="text-[11px] text-slate-400">Sinergi aktif Dinas Kesehatan, Badan Gizi Nasional, PKK, Pemerintah Desa, & Puskesmas.</p>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-cyan-400">PILAR 3 (10%)</span>
                      <span className="p-1 bg-cyan-500/20 rounded text-cyan-300"><Activity className="h-3.5 w-3.5" /></span>
                    </div>
                    <h5 className="font-bold text-white text-xs">Digitalisasi & Real-Time</h5>
                    <p className="text-[11px] text-slate-400">Monitoring real-time, validasi otomatis, dan mitigasi anomaly entry data gizi.</p>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-purple-400">PILAR 4 (25%)</span>
                      <span className="p-1 bg-purple-500/20 rounded text-purple-300"><Award className="h-3.5 w-3.5" /></span>
                    </div>
                    <h5 className="font-bold text-white text-xs">Pelayanan Gizi & Home Visit</h5>
                    <p className="text-[11px] text-slate-400">Kepastian ketercapaian porsi MBG/PMT dan penjangkauan sasaran melalui Kunjungan Rumah.</p>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-rose-400">PILAR 5 (25%)</span>
                      <span className="p-1 bg-rose-500/20 rounded text-rose-300"><TrendingUp className="h-3.5 w-3.5" /></span>
                    </div>
                    <h5 className="font-bold text-white text-xs">Outcome & Dampak Stunting</h5>
                    <p className="text-[11px] text-slate-400">Penurunan angka stunting & wasting dengan pemantauan berat/tinggi badan berkala.</p>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-400">SECURITY</span>
                      <span className="p-1 bg-amber-500/20 rounded text-amber-300"><Lock className="h-3.5 w-3.5" /></span>
                    </div>
                    <h5 className="font-bold text-white text-xs">Cyber Guard Protection</h5>
                    <p className="text-[11px] text-slate-400">Pengamanan data sensitif kesehatan masyarakat berstandar Firestore ABAC Security Fortress.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB CONTENT 2: PANDUAN PENGGUNA TERPERINCI PER MENU */}
          {activeTab === "GUIDE" && (
            <div className="space-y-6">
              
              <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
                    <Compass className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">Panduan Lengkap Fitur & Menu Navigasi Application</h4>
                    <p className="text-xs text-slate-300">Pelajari alur kerja operasional untuk setiap menu di Orbit Gizi System</p>
                  </div>
                </div>

                <button
                  onClick={onLaunchDashboard}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center space-x-2 transition-all cursor-pointer shrink-0"
                >
                  <span>Buka Aplikasi Sekarang</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* MENU GUIDE GRID (7 MENU CARDS) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* MENU 1: IKHTISAR DASHBOARD */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-emerald-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl font-black text-xs">
                        01
                      </span>
                      <h4 className="font-black text-white text-sm">Ikhtisar Utama (Overview)</h4>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      KOMANDO UTAMA
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>Pusat Kontrol Performa Gizi Wilayah.</strong> Menampilkan Indeks Transformasi Orbit Gizi (0 - 100), Status Kategori Risiko Kabupaten/Desa (Hijau, Kuning, Merah), serta visualisasi Dial Gauge interaktif.
                  </p>
                  <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                    <li><strong>Panel Rekapitulasi Eksekutif:</strong> Ringkasan sasaran MBG, PMT, Intervensi Ganda, & Wajib Visit.</li>
                    <li><strong>Skor 5 Pilar:</strong> Detail pencapaian per pilar berbobot rasional.</li>
                    <li><strong>Peta Sebaran Unit/Desa:</strong> Pemetaan spasial titik lokasi dan zona risiko stunting.</li>
                  </ul>
                </div>

                {/* MENU 2: CAKUPAN PROGRAM MBG & PMT */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-teal-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <span className="p-2 bg-teal-500/20 text-teal-400 rounded-xl font-black text-xs">
                        02
                      </span>
                      <h4 className="font-black text-white text-sm">Program MBG & PMT</h4>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">
                      INTERVENSI GIZI
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>Pemantauan Porsi Makanan Bergizi & PMT Pemulihan.</strong> Lacak realisasi distribusi porsi Makanan Bergizi Gratis (MBG) dan Pemberian Makanan Tambahan (PMT).
                  </p>
                  <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                    <li><strong>Grafik Tren Bulanan:</strong> Recharts tren target vs realisasi porsi MBG & PMT.</li>
                    <li><strong>Cakupan Demografi:</strong> Persentase distribusi porsi untuk Balita, Ibu Hamil, & Ibu Menyusui.</li>
                    <li><strong>Evaluasi Capaian Target:</strong> Deteksi dini desa dengan ketimpangan distribusi makanan.</li>
                  </ul>
                </div>

                {/* MENU 3: DATA BALITA & GROWTH CHART */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-cyan-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <span className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl font-black text-xs">
                        03
                      </span>
                      <h4 className="font-black text-white text-sm">Data Balita & Growth Chart</h4>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                      e-PPGBM INTEGRATED
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>Pencatatan Individual Balita (6 - 59 Bulan).</strong> Pantau kurva pertumbuhan standar WHO (Growth Chart) dan kalkulasi otomatis status gizi.
                  </p>
                  <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                    <li><strong>Kurva WHO BB/TB:</strong> Grafik kurva pertumbuhan SD untuk deteksi Stunting & Wasting.</li>
                    <li><strong>Input Penimbangan Baru:</strong> Form cepat penambahan BB/TB bulanan anak.</li>
                    <li><strong>Status MBG & PMT Anak:</strong> Verifikasi bantuan nutrisi yang telah diterima anak.</li>
                  </ul>
                </div>

                {/* MENU 4: IBU HAMIL KEK & RESTI */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-indigo-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl font-black text-xs">
                        04
                      </span>
                      <h4 className="font-black text-white text-sm">Ibu Hamil KEK & Resti</h4>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      1000 HPK MONITORING
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>Pengawasan Khusus Ibu Hamil KEK & Risiko Tinggi.</strong> Perlindungan masa kehamilan untuk mencegah kejadian stunting sejak dalam kandungan.
                  </p>
                  <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                    <li><strong>Pemantauan LILA & Hb:</strong> Lingkar Lengan Atas (&lt;23.5cm KEK) & kadar Anemia Hb.</li>
                    <li><strong>Konsumsi Tablet TTD:</strong> Tracing kepatuhan suplementasi darah selama kehamilan.</li>
                    <li><strong>Porsi PMT Bumil:</strong> Distribusi kudapan tinggi protein untuk ibu hamil KEK.</li>
                  </ul>
                </div>

                {/* MENU 5: KOLABORASI MULTISEKTORAL */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-purple-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <span className="p-2 bg-purple-500/20 text-purple-400 rounded-xl font-black text-xs">
                        05
                      </span>
                      <h4 className="font-black text-white text-sm">Kolaborasi Multisektoral</h4>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                      OPD & PEMDES
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>Evaluasi Keaktifan 5 Lintas Sektor.</strong> Sinergi Dinas Kesehatan, BGN, Pemdes, PKK, Puskesmas, & Posyandu dalam intervensi serentak.
                  </p>
                  <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                    <li><strong>Matriks Kehadiran Petugas:</strong> Presensi Perangkat Desa & Kader saat Posyandu.</li>
                    <li><strong>Home Visit Priority List:</strong> Daftar otomatis sasaran absen penimbangan wajib dikunjungi.</li>
                    <li><strong>Indeks Kemitraan:</strong> Skor sinergisitas antar lembaga desa.</li>
                  </ul>
                </div>

                {/* MENU 6: MATRIKS PIVOT & CETAK REPORT */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-amber-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <span className="p-2 bg-amber-500/20 text-amber-400 rounded-xl font-black text-xs">
                        06
                      </span>
                      <h4 className="font-black text-white text-sm">Matriks Pivot & Cetak Report</h4>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      PRINTABLE REPORT
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>Slicing Data Multidimensi & Cetak Dokumen Resmi.</strong> Sarana pertanggungjawaban program MBG/PMT dengan format Laporan A4 siap cetak.
                  </p>
                  <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                    <li><strong>Pivot Table Interaktif:</strong> Saring data berdasarkan Desa, Posyandu, & Status Gizi.</li>
                    <li><strong>Preview Laporan A4:</strong> Format resmi bertanda tangan Kepala Puskesmas & Petugas.</li>
                    <li><strong>Cetak Direct / PDF:</strong> Sekali klik untuk mengunduh atau mencetak laporan.</li>
                  </ul>
                </div>

                {/* MENU 7: WIZARD INPUT DATA 3-LANGKAH */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-rose-500/40 transition-colors md:col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <span className="p-2 bg-rose-500/20 text-rose-400 rounded-xl font-black text-xs">
                        07
                      </span>
                      <h4 className="font-black text-white text-sm">Wizard Input Data Bulanan (3 Steps)</h4>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                      DATA ENTRY ASSISTANT
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>Asisten Pembaruan Data Terpadu.</strong> Petunjuk langkah-demi-langkah bagi kader/operator desa untuk memasukkan data bulanan tanpa kesalahan:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-bold text-rose-400 block">LANGKAH 1</span>
                      <span className="font-bold text-white text-xs block mt-0.5">Pilih Wilayah & Periode</span>
                      <span className="text-[11px] text-slate-400 block mt-1">Pilih Desa/Kelurahan dan Bulan Penimbangan.</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-bold text-rose-400 block">LANGKAH 2</span>
                      <span className="font-bold text-white text-xs block mt-0.5">Entry Target & Realisasi</span>
                      <span className="text-[11px] text-slate-400 block mt-1">Input porsi MBG, PMT, e-PPGBM, & hasil ukur BB/TB.</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-bold text-rose-400 block">LANGKAH 3</span>
                      <span className="font-bold text-white text-xs block mt-0.5">Verifikasi & Simpan</span>
                      <span className="text-[11px] text-slate-400 block mt-1">Cek keaktifan kader & simpan data terenkripsi.</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* QUICK LAUNCH CTA INSIDE GUIDE */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/80 p-4 rounded-2xl border border-emerald-500/20">
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span className="text-xs text-slate-300">Data Anda tersimpan secara aman dengan proteksi Firebase ABAC & Cyber Guard.</span>
                </div>
                <button
                  onClick={onLaunchDashboard}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center space-x-2 hover:scale-[1.02] transition-transform cursor-pointer shadow-lg shrink-0"
                >
                  <span>Mulai Penggunaan Aplikasi</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

            </div>
          )}

        </div>

      </main>

      {/* FOOTER BAR */}
      <footer className="relative z-10 border-t border-white/10 py-4 px-4 sm:px-8 text-center text-xs text-slate-400 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Orbit Gizi System • Kabupaten Nagekeo. Hak Cipta Dilindungi.</span>
          <div className="flex items-center space-x-3 text-slate-300">
            <button 
              onClick={() => setShowModal("ABOUT")}
              className="hover:text-emerald-400 underline cursor-pointer"
            >
              Tentang System
            </button>
            <span>•</span>
            <button 
              onClick={() => setShowModal("GUIDE")}
              className="hover:text-cyan-400 underline cursor-pointer"
            >
              Panduan Pengguna
            </button>
            <span>•</span>
            <span className="text-emerald-300">e-PPGBM Synchronized</span>
          </div>
        </div>
      </footer>

      {/* MODAL DIALOG POPUP FOR HEADER / FOOTER CLICKS */}
      {showModal !== "NONE" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl relative text-slate-200">
            
            <button
              onClick={() => setShowModal("NONE")}
              className="absolute top-5 right-5 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {showModal === "ABOUT" ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl">
                    <Info className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Tentang Orbit Gizi System v2.5</h3>
                    <p className="text-xs text-emerald-400 font-medium">Kabupaten Nagekeo • Dinas Kesehatan & Pemdes</p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Orbit Gizi System adalah aplikasi analitis tata kelola gizi terintegrasi yang dirancang untuk mendukung penuh program Makanan Bergizi Gratis (MBG), Pemberian Makanan Tambahan (PMT) Pemulihan, serta pemantauan stunting secara presisi berbasis Posyandu dan e-PPGBM.
                </p>

                <div className="space-y-2 border-t border-slate-800 pt-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">Fitur Utama Platform:</h4>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-5">
                    <li>Indeks Transformasi Orbit Gizi berbasis kalkulasi 5 pilar berbobot rasional.</li>
                    <li>Dashboard Rekapitulasi Eksekutif & Matriks Pivot Table per Posyandu.</li>
                    <li>Laporan Portofolio Printable Resmi untuk pertanggungjawaban program MBG/PMT.</li>
                    <li>Pengamanan data terenkripsi berbasis Firestore ABAC Fortress & Cyber Guard Protection.</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-2xl">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Panduan Pengguna Sistem Per Menu</h3>
                    <p className="text-xs text-cyan-400 font-medium">Langkah Praktis Operasional Platform Orbit Gizi</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-300 max-h-[60vh] overflow-y-auto pr-1">
                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-emerald-400 text-xs">1. Ikhtisar Utama (Overview)</span>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] rounded font-bold">Komando Utama</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      Pantau Indeks Transformasi Orbit Gizi (0 - 100), Status Zona Risiko Wilayah (Merah/Kuning/Hijau), Skor 5 Pilar, serta Ringkasan Sasaran MBG & PMT.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-teal-400 text-xs">2. Program MBG & PMT</span>
                      <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 text-[10px] rounded font-bold">Intervensi Gizi</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      Lacak realisasi harian/bulanan distribusi porsi Makanan Bergizi Gratis (MBG) dan Pemberian Makanan Tambahan (PMT) Pemulihan per wilayah.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-cyan-400 text-xs">3. Data Balita & Growth Chart</span>
                      <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-[10px] rounded font-bold">e-PPGBM</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      Monitoring individual anak (6-59 bulan) menggunakan Kurva Pertumbuhan WHO (BB/TB), pendaftaran rekam timbang baru, & klasifikasi Stunting/Wasting.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-indigo-400 text-xs">4. Ibu Hamil KEK & Resti</span>
                      <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] rounded font-bold">1000 HPK</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      Pengawasan khusus Ibu Hamil KEK (LILA &lt; 23.5 cm), Anemia (Hb), konsumsi Tablet TTD, serta distribusi makanan tambahan ibu hamil.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-purple-400 text-xs">5. Kolaborasi Multisektoral</span>
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] rounded font-bold">OPD & Pemdes</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      Evaluasi presensi Perangkat Desa & Kader Posyandu, serta daftar prioritas Kunjungan Rumah (Home Visit) untuk sasaran yang tidak hadir.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-amber-400 text-xs">6. Matriks Pivot & Cetak Report</span>
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] rounded font-bold">Cetak Laporan</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      Filtering data multidimensi per Posyandu/Status Gizi, serta cetak Laporan Portofolio A4 resmi bertanda tangan digital.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-rose-400 text-xs">7. Wizard Input Data Bulanan</span>
                      <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] rounded font-bold">3 Langkah Easy Entry</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      Asisten input data bulanan untuk memperbarui target, realisasi porsi, e-PPGBM, dan presensi kader secara aman & tervalidasi.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowModal("NONE")}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Tutup Panduan
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

