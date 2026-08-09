import React, { useState } from "react";
import { 
  Activity, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  Heart, 
  MapPin, 
  Search, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Building2,
  Mail,
  Lock
} from "lucide-react";
import { NutritionBannerGallery, BannerImage, DEFAULT_NUTRITION_IMAGES } from "./NutritionBannerGallery";
import { BeneficiaryDetailModal } from "./BeneficiaryDetailModal";
import { AdminNutritionCharts } from "./AdminNutritionCharts";
import { MBGBeneficiary } from "../types";

interface PublicDashboardViewProps {
  onBackToLauncher: () => void;
  onOpenLogin: () => void;
  selectedKabupaten: string;
}

export const PublicDashboardView: React.FC<PublicDashboardViewProps> = ({
  onBackToLauncher,
  onOpenLogin,
  selectedKabupaten
}) => {
  const [activeTab, setActiveTab] = useState<"SUMMARY" | "BENEFICIARIES" | "GALLERY" | "VILLAGES">("SUMMARY");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");

  // Email simulation state for public vs admin access testing
  const [currentEmail, setCurrentEmail] = useState<string>("properwahyu294@gmail.com");
  const [emailInput, setEmailInput] = useState<string>("properwahyu294@gmail.com");
  const [showEmailModal, setShowEmailModal] = useState<boolean>(false);

  // Beneficiary detail modal state
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<MBGBeneficiary | null>(null);

  const isAdminEmail = currentEmail.trim().toLowerCase() === "properwahyu294@gmail.com";

  const [bannerImages] = useState<BannerImage[]>(() => {
    const saved = localStorage.getItem("orbit_gizi_dashboard_banner_images") || localStorage.getItem("orbit_gizi_banner_images");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_NUTRITION_IMAGES;
      }
    }
    return DEFAULT_NUTRITION_IMAGES;
  });

  const [beneficiaries] = useState<MBGBeneficiary[]>(() => {
    const stored = localStorage.getItem("orbit_gizi_local_beneficiaries");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [
      { id: "b1", name: "Maria Goreti", category: "Ibu Hamil", location: { propinsi: "NTT", kabupaten: "Nagekeo", puskesmas: "Mbay", kelurahan: "Mbay I", dusun: "Dusun 1", posyandu: "Posyandu Melati" }, isReceivedMBG: true, isReceivedPMT: true, weightRecords: [{ period: "Juli 2026", weightKg: 58, heightCm: 155, statusGizi: "Normal" }] },
      { id: "b2", name: "Yohanes Dapa", category: "Balita", location: { propinsi: "NTT", kabupaten: "Nagekeo", puskesmas: "Aesesa", kelurahan: "Aesesa", dusun: "Dusun 2", posyandu: "Posyandu Kenanga" }, isReceivedMBG: true, isReceivedPMT: true, weightRecords: [{ period: "Juli 2026", weightKg: 11.2, heightCm: 85, statusGizi: "Stunting" }] },
      { id: "b3", name: "Theresia Woda", category: "Ibu Menyusui", location: { propinsi: "NTT", kabupaten: "Nagekeo", puskesmas: "Boawae", kelurahan: "Boawae", dusun: "Dusun 1", posyandu: "Posyandu Anggrek" }, isReceivedMBG: true, isReceivedPMT: true, weightRecords: [{ period: "Juli 2026", weightKg: 52, heightCm: 150, statusGizi: "Normal" }] },
      { id: "b4", name: "Fransiskus Nage", category: "Balita", location: { propinsi: "NTT", kabupaten: "Nagekeo", puskesmas: "Mauponggo", kelurahan: "Mauponggo", dusun: "Dusun 3", posyandu: "Posyandu Mawar" }, isReceivedMBG: true, isReceivedPMT: true, weightRecords: [{ period: "Juli 2026", weightKg: 9.8, heightCm: 79, statusGizi: "Gizi Kurang" }] },
      { id: "b5", name: "Agnes Keli", category: "Ibu Hamil", location: { propinsi: "NTT", kabupaten: "Nagekeo", puskesmas: "Nangaroro", kelurahan: "Nangaroro", dusun: "Dusun 1", posyandu: "Posyandu Dahlia" }, isReceivedMBG: true, isReceivedPMT: true, weightRecords: [{ period: "Juli 2026", weightKg: 54, heightCm: 148, statusGizi: "Normal" }] }
    ];
  });

  const filteredBeneficiaries = beneficiaries.filter(b => {
    const villageName = b.location?.kelurahan || b.location?.puskesmas || "";
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          villageName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "ALL" || b.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setCurrentEmail(emailInput.trim());
    setShowEmailModal(false);
  };

  return (
    <div className="min-h-screen text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white relative overflow-x-hidden"
         style={{
           backgroundColor: "#f1f5f9",
           backgroundImage: `
             radial-gradient(at 10% 10%, rgba(59, 130, 246, 0.1) 0px, transparent 50%),
             radial-gradient(at 90% 90%, rgba(16, 185, 129, 0.08) 0px, transparent 50%),
             linear-gradient(to right, rgba(203, 213, 225, 0.4) 1px, transparent 1px),
             linear-gradient(to bottom, rgba(203, 213, 225, 0.4) 1px, transparent 1px)
           `,
           backgroundSize: "100% 100%, 100% 100%, 36px 36px, 36px 36px"
         }}>
      
      {/* PUBLIC HEADER NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-xl shadow-md text-white">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                DASHBOARD PUBLIK & STAKEHOLDER
              </span>
              <span className="text-xs text-slate-600 font-bold">• {selectedKabupaten}</span>
            </div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">
              Orbit Gizi Nagekeo (Akses Publik Bebas Email)
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Current Email Badge & Switcher */}
          <button
            onClick={() => { setEmailInput(currentEmail); setShowEmailModal(true); }}
            className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-300 text-xs font-mono transition-colors cursor-pointer"
            title="Klik untuk mengganti email pengakses"
          >
            <Mail className="h-3.5 w-3.5 text-emerald-600" />
            <span className="max-w-[180px] truncate">{currentEmail}</span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${isAdminEmail ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>
              {isAdminEmail ? "ADMIN" : "PUBLIK"}
            </span>
          </button>

          <button
            onClick={onBackToLauncher}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center space-x-2 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali</span>
          </button>

          {/* TOMBOL ADMIN HANYA MUNCUL JIKA EMAIL ADALAH properwahyu294@gmail.com */}
          {isAdminEmail ? (
            <button
              onClick={onOpenLogin}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition-all shadow-md flex items-center space-x-1.5 cursor-pointer animate-in fade-in"
              title="Akses Admin Terverifikasi"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Masuk Dashboard Admin</span>
            </button>
          ) : (
            <div className="hidden md:flex items-center space-x-1.5 px-3 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-[11px] font-bold">
              <Lock className="h-3.5 w-3.5" />
              <span>Tombol Admin Sembunyi (Bukan Email Admin)</span>
            </div>
          )}
        </div>
      </header>

      {/* SUB-NAV TABS */}
      <div className="bg-white/70 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab("SUMMARY")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-2 ${
                activeTab === "SUMMARY" 
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" 
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Ringkasan Eksekutif & Grafik</span>
            </button>

            <button
              onClick={() => setActiveTab("BENEFICIARIES")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-2 ${
                activeTab === "BENEFICIARIES" 
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" 
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Data Sasaran & Penerima ({beneficiaries.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("GALLERY")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-2 ${
                activeTab === "GALLERY" 
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" 
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Galeri Banner & Foto Gizi ({bannerImages.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("VILLAGES")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-2 ${
                activeTab === "VILLAGES" 
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" 
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <MapPin className="h-4 w-4" />
              <span>Rekapitulasi Wilayah & Kecamatan</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => { setEmailInput(currentEmail); setShowEmailModal(true); }}
              className="text-xs text-emerald-700 font-bold flex items-center space-x-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Email: {currentEmail} (Klik Ganti)</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-8 flex-1 space-y-8">
        
        {/* TAB 1: SUMMARY & STATS */}
        {activeTab === "SUMMARY" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* NOTICE BANNER */}
            <div className="bg-gradient-to-r from-emerald-950/80 via-teal-950/80 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Transparansi Publik • Klik Nama Sasaran untuk Detail Lengkap</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Portal Eksekutif & Pemantauan Gizi Nagekeo
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm font-medium max-w-2xl leading-relaxed">
                  Dashboard terbuka untuk semua email. Tombol login Admin otomatis disembunyikan untuk publik umum, dan hanya muncul ketika diakses menggunakan email resmi: <code className="text-emerald-400 font-mono font-bold">properwahyu294@gmail.com</code>.
                </p>
              </div>

              <div className="flex flex-col gap-3 shrink-0">
                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Status Akses Email</span>
                  <span className={`font-black text-xs flex items-center justify-center space-x-1.5 mt-1 ${isAdminEmail ? "text-emerald-400" : "text-amber-400"}`}>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{isAdminEmail ? "Akses Admin Aktif" : "Akses Publik Tamu"}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* KEY METRICS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Sasaran</span>
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900">{beneficiaries.length} Jiwa</div>
                <div className="text-xs text-emerald-600 font-bold">Balita, Ibu Hamil & Menyusui</div>
              </div>

              <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Cakupan MBG / PMT</span>
                  <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
                    <Heart className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900">94.8%</div>
                <div className="text-xs text-cyan-600 font-bold">Intervensi tepat sasaran</div>
              </div>

              <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Prevalensi Stunting</span>
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <Activity className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900">6.4%</div>
                <div className="text-xs text-amber-600 font-bold">Target nasional tercapai</div>
              </div>

              <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Posyandu Aktif</span>
                  <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                    <Building2 className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900">142 Pos</div>
                <div className="text-xs text-teal-600 font-bold">Seluruh Kecamatan Nagekeo</div>
              </div>
            </div>

            {/* NUTRITION CHARTS (RECHARTS) */}
            <AdminNutritionCharts beneficiariesCount={beneficiaries.length} />

            {/* EMBEDDED BANNER GALLERY IN SUMMARY */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <NutritionBannerGallery
                images={bannerImages}
                onAddImage={() => alert("Fitur tambah gambar memerlukan login Admin/Nakes dengan email properwahyu294@gmail.com.")}
                onDeleteImage={() => alert("Fitur hapus gambar memerlukan login Admin/Nakes dengan email properwahyu294@gmail.com.")}
                title="Galeri Visual & Dokumentasi Gizi Publik"
                subtitle="Dokumentasi kegiatan intervensi gizi, Posyandu, dan Makanan Bergizi Gratis (MBG) di Nagekeo."
              />
            </div>

          </div>
        )}

        {/* TAB 2: BENEFICIARIES READ-ONLY TABLE (WITH CLICKABLE NAMES FOR MODAL) */}
        {activeTab === "BENEFICIARIES" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
              <div>
                <h3 className="text-xl font-black text-white">Direktori Data Sasaran & Penerima</h3>
                <p className="text-xs text-slate-400">Klik pada nama sasaran untuk melihat detail rekam medis, riwayat penimbangan, dan petugas pendamping.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Search className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari nama atau desa..."
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl text-white text-xs outline-none"
                  />
                </div>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl text-white text-xs outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Kategori</option>
                  <option value="Balita">Balita</option>
                  <option value="Ibu Hamil">Ibu Hamil</option>
                  <option value="Ibu Menyusui">Ibu Menyusui</option>
                </select>
              </div>
            </div>

            {/* TABLE */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="p-4">Nama Sasaran (Klik untuk Detail)</th>
                      <th className="p-4">Kategori</th>
                      <th className="p-4">Wilayah / Desa</th>
                      <th className="p-4">Status Gizi Terkini</th>
                      <th className="p-4">Status Intervensi PMT</th>
                      <th className="p-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-xs font-medium">
                    {filteredBeneficiaries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                          Tidak ada data sasaran yang sesuai dengan pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredBeneficiaries.map((b, idx) => (
                        <tr 
                          key={b.id || idx} 
                          onClick={() => setSelectedBeneficiary(b)}
                          className="hover:bg-slate-800/60 transition-colors cursor-pointer group"
                        >
                          <td className="p-4 font-bold text-white flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-[10px] group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                              {b.name.charAt(0)}
                            </div>
                            <span className="underline decoration-emerald-500/50 underline-offset-4 group-hover:text-emerald-400 transition-colors">{b.name}</span>
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold text-[11px]">
                              {b.category}
                            </span>
                          </td>
                          <td className="p-4 text-slate-300">{b.location?.kelurahan || b.location?.puskesmas || "Nagekeo"}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-lg font-bold text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {b.weightRecords?.[0]?.statusGizi || "Normal"}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-teal-400 font-bold">Aktif (MBG & PMT)</span>
                          </td>
                          <td className="p-4">
                            <span className="text-xs font-bold text-emerald-400 group-hover:underline">Lihat Detail →</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GALLERY */}
        {activeTab === "GALLERY" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-300">
            <NutritionBannerGallery
              images={bannerImages}
              onAddImage={() => alert("Fitur tambah gambar memerlukan login Admin/Nakes dengan email properwahyu294@gmail.com.")}
              onDeleteImage={() => alert("Fitur hapus gambar memerlukan login Admin/Nakes dengan email properwahyu294@gmail.com.")}
              title="Galeri Lengkap Dokumentasi Gizi Nagekeo"
              subtitle="Kumpulan foto dan banner kegiatan intervensi gizi, Posyandu, dan MBG."
            />
          </div>
        )}

        {/* TAB 4: VILLAGES & DISTRICT RECAP */}
        {activeTab === "VILLAGES" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
              <h3 className="text-xl font-black text-white">Rekapitulasi Wilayah & Kecamatan Nagekeo</h3>
              <p className="text-xs text-slate-400">Distribusi posyandu dan pencapaian penurunan stunting per kecamatan.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: "Kecamatan Aesesa", posyandu: 32, balita: 1420, stunting: 18, status: "Normal / Baik" },
                { name: "Kecamatan Boawae", posyandu: 38, balita: 1650, stunting: 24, status: "Perhatian Khusus" },
                { name: "Kecamatan Mauponggo", posyandu: 28, balita: 1120, stunting: 15, status: "Normal / Baik" },
                { name: "Kecamatan Nangaroro", posyandu: 26, balita: 980, stunting: 12, status: "Normal / Baik" },
                { name: "Kecamatan Wolowae", posyandu: 18, balita: 640, stunting: 8, status: "Normal / Baik" }
              ].map((kec, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-white">{kec.name}</span>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${
                      kec.status === "Normal / Baik" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                    }`}>
                      {kec.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Posyandu Aktif:</span>
                      <span className="font-bold text-white">{kec.posyandu} Pos</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Total Sasaran Balita:</span>
                      <span className="font-bold text-white">{kec.balita} Anak</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Kasus Stunting:</span>
                      <span className="font-bold text-amber-400">{kec.stunting} Kasus</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 px-4 text-center text-xs text-slate-400">
        <p>© 2026 Orbit Gizi Kabupaten Nagekeo • Portal Eksekutif Publik & Transparansi Data Gizi</p>
      </footer>

      {/* BENEFICIARY DETAIL MODAL */}
      <BeneficiaryDetailModal
        beneficiary={selectedBeneficiary}
        isOpen={Boolean(selectedBeneficiary)}
        onClose={() => setSelectedBeneficiary(null)}
      />

      {/* EMAIL SWITCHER / TESTER MODAL */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <Mail className="h-5 w-5" />
                </div>
                <h3 className="text-base font-black">Simulasi Akses Email Pengakses</h3>
              </div>
              <button 
                onClick={() => setShowEmailModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Uji coba akses dengan memasukkan email apa saja. Tombol Admin hanya akan muncul jika email adalah <code className="text-emerald-400 font-mono font-bold">properwahyu294@gmail.com</code>.
            </p>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Alamat Email Pengakses
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="contoh: tamu@gmail.com atau properwahyu294@gmail.com"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl text-white text-xs outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg cursor-pointer"
                >
                  Simpan & Perbarui Akses
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
