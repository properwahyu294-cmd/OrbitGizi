import React from "react";
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
  Heart
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

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-emerald-500/30 text-xs text-emerald-300">
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
      <main className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 flex-1 flex flex-col justify-center space-y-8">
        
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto w-full pt-4">
          
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
      </main>

      {/* FOOTER BAR */}
      <footer className="relative z-10 border-t border-white/10 py-4 px-4 sm:px-8 text-center text-xs text-slate-400 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Orbit Gizi System • Kabupaten Nagekeo. Hak Cipta Dilindungi.</span>
          <div className="flex items-center space-x-3 text-slate-300">
            <span className="flex items-center space-x-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>MBG & PMT Integrated</span>
            </span>
            <span>•</span>
            <span className="text-emerald-300">e-PPGBM Synchronized</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
