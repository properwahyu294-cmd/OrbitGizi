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
  Building2
} from "lucide-react";
import { NutritionBannerGallery, BannerImage, DEFAULT_NUTRITION_IMAGES } from "./NutritionBannerGallery";

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

  const [beneficiaries] = useState<any[]>(() => {
    const stored = localStorage.getItem("orbit_gizi_local_beneficiaries");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [
      { id: "b1", name: "Maria Goreti", category: "Ibu Hamil", village: "Mbay I", status: "Terdaftar", risk: "Normal", pmtStatus: "Aktif", date: "2026-08-01" },
      { id: "b2", name: "Yohanes Dapa", category: "Balita", village: "Aesesa", status: "Pemantauan", risk: "Stunting", pmtStatus: "Aktif (MBG)", date: "2026-08-02" },
      { id: "b3", name: "Theresia Woda", category: "Ibu Menyusui", village: "Boawae", status: "Terdaftar", risk: "Normal", pmtStatus: "Aktif", date: "2026-08-03" },
      { id: "b4", name: "Fransiskus Nage", category: "Balita", village: "Mauponggo", status: "Pemantauan", risk: "Gizi Kurang", pmtStatus: "Aktif (PMT)", date: "2026-08-04" },
      { id: "b5", name: "Agnes Keli", category: "Ibu Hamil", village: "Nangaroro", status: "Terdaftar", risk: "KEK", pmtStatus: "Aktif", date: "2026-08-05" }
    ];
  });

  const filteredBeneficiaries = beneficiaries.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.village.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "ALL" || b.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* PUBLIC HEADER NAVBAR */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-emerald-500/20 px-4 sm:px-8 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl shadow-lg text-slate-950">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                DASHBOARD PUBLIK EKSEKUTIF
              </span>
              <span className="text-xs text-emerald-400 font-bold">• {selectedKabupaten}</span>
            </div>
            <h1 className="text-lg font-black text-white tracking-tight">
              Orbit Gizi Nagekeo (Akses Publik / Stakeholder)
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToLauncher}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center space-x-2 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Beranda</span>
          </button>

          <button
            onClick={onOpenLogin}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg flex items-center space-x-1.5 cursor-pointer"
          >
            <span>Login Admin / Nakes</span>
          </button>
        </div>
      </header>

      {/* SUB-NAV TABS */}
      <div className="bg-slate-900/50 border-b border-slate-800 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab("SUMMARY")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-2 ${
                activeTab === "SUMMARY" 
                  ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" 
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Ringkasan Eksekutif & Statistik</span>
            </button>

            <button
              onClick={() => setActiveTab("BENEFICIARIES")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-2 ${
                activeTab === "BENEFICIARIES" 
                  ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" 
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Data Sasaran & Penerima ({beneficiaries.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("GALLERY")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-2 ${
                activeTab === "GALLERY" 
                  ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" 
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Galeri Banner & Foto Gizi ({bannerImages.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("VILLAGES")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-2 ${
                activeTab === "VILLAGES" 
                  ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" 
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <MapPin className="h-4 w-4" />
              <span>Rekapitulasi Wilayah & Kecamatan</span>
            </button>
          </div>

          <div className="text-xs text-emerald-400 font-bold flex items-center space-x-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
            <ShieldCheck className="h-4 w-4" />
            <span>Mode Read-Only (Akses Publik Resmi)</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-8 flex-1 space-y-8">
        
        {/* TAB 1: SUMMARY & STATS */}
        {activeTab === "SUMMARY" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* NOTICE BANNER FOR BUPATI / DINKES */}
            <div className="bg-gradient-to-r from-emerald-950/80 via-teal-950/80 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Transparansi Data & Percepatan Penurunan Stunting</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Selamat Datang di Portal Publik Eksekutif Nagekeo
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm font-medium max-w-2xl leading-relaxed">
                  Dashboard ini dirancang khusus untuk Bupati Nagekeo, Dinas Kesehatan, TP-PKK, Kader Posyandu, dan masyarakat umum untuk memantau indikator Makanan Bergizi Gratis (MBG), PMT, dan status gizi balita secara real-time.
                </p>
              </div>

              <div className="flex flex-col gap-3 shrink-0">
                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Status Integrasi</span>
                  <span className="text-emerald-400 font-black text-xs flex items-center justify-center space-x-1.5 mt-1">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Sinkronisasi e-PPGBM Aktif</span>
                  </span>
                </div>
              </div>
            </div>

            {/* KEY METRICS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Sasaran Terdaftar</span>
                  <Users className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="text-3xl font-black text-white">{beneficiaries.length} Jiwa</div>
                <div className="text-xs text-emerald-400 font-bold flex items-center space-x-1">
                  <span>Balita, Ibu Hamil & Menyusui</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Distribusi MBG / PMT</span>
                  <Heart className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="text-3xl font-black text-white">94.8%</div>
                <div className="text-xs text-cyan-400 font-bold flex items-center space-x-1">
                  <span>Cakupan intervensi gizi tepat sasaran</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Prevalensi Stunting</span>
                  <Activity className="h-5 w-5 text-amber-400" />
                </div>
                <div className="text-3xl font-black text-white">6.4%</div>
                <div className="text-xs text-amber-400 font-bold flex items-center space-x-1">
                  <span>Target penurunan nasional tercapai</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Posyandu Aktif</span>
                  <Building2 className="h-5 w-5 text-teal-400" />
                </div>
                <div className="text-3xl font-black text-white">142 Pos</div>
                <div className="text-xs text-teal-400 font-bold flex items-center space-x-1">
                  <span>Seluruh Kecamatan Nagekeo</span>
                </div>
              </div>
            </div>

            {/* EMBEDDED BANNER GALLERY IN SUMMARY */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <NutritionBannerGallery
                images={bannerImages}
                onAddImage={() => alert("Fitur tambah gambar memerlukan login Admin/Nakes.")}
                onDeleteImage={() => alert("Fitur hapus gambar memerlukan login Admin/Nakes.")}
                title="Galeri Visual & Dokumentasi Gizi Publik"
                subtitle="Dokumentasi kegiatan intervensi gizi, Posyandu, dan Makanan Bergizi Gratis (MBG) di Nagekeo."
              />
            </div>

          </div>
        )}

        {/* TAB 2: BENEFICIARIES READ-ONLY TABLE */}
        {activeTab === "BENEFICIARIES" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
              <div>
                <h3 className="text-xl font-black text-white">Direktori Data Sasaran & Penerima</h3>
                <p className="text-xs text-slate-400">Daftar terintegrasi penerima manfaat MBG dan pemantauan gizi (Mode Tampilan Publik).</p>
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
                      <th className="p-4">Nama Sasaran</th>
                      <th className="p-4">Kategori</th>
                      <th className="p-4">Wilayah / Desa</th>
                      <th className="p-4">Status Risiko</th>
                      <th className="p-4">Status Intervensi PMT</th>
                      <th className="p-4">Tanggal Pendaftaran</th>
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
                        <tr key={b.id || idx} className="hover:bg-slate-800/50 transition-colors">
                          <td className="p-4 font-bold text-white flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-[10px]">
                              {b.name.charAt(0)}
                            </div>
                            <span>{b.name}</span>
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold text-[11px]">
                              {b.category}
                            </span>
                          </td>
                          <td className="p-4 text-slate-300">{b.village}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                              b.risk === "Normal" 
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            }`}>
                              {b.risk || "Normal"}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-teal-400 font-bold">{b.pmtStatus || "Aktif"}</span>
                          </td>
                          <td className="p-4 text-slate-400 font-mono text-[11px]">{b.date || "2026-08-01"}</td>
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
              onAddImage={() => alert("Fitur tambah gambar memerlukan login Admin/Nakes.")}
              onDeleteImage={() => alert("Fitur hapus gambar memerlukan login Admin/Nakes.")}
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

    </div>
  );
};
