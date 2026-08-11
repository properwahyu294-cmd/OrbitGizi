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
  Edit3,
  ExternalLink,
  FileSpreadsheet,
  Maximize2,
  RefreshCw,
  Layers,
  FileText
} from "lucide-react";
import { NutritionBannerGallery, BannerImage, DEFAULT_NUTRITION_IMAGES } from "./NutritionBannerGallery";
import { BeneficiaryDetailModal } from "./BeneficiaryDetailModal";
import { AdminNutritionCharts } from "./AdminNutritionCharts";
import { VisitorEmailModal } from "./VisitorEmailModal";
import { MBGBeneficiary } from "../types";
import { DEFAULT_BENEFICIARIES } from "../lib/dataService";

interface PublicDashboardViewProps {
  onBackToLauncher: () => void;
  onOpenLogin: () => void;
  selectedKabupaten: string;
  currentUserEmail?: string | null;
  visitorEmail?: string;
  onSetVisitorEmail?: (email: string) => void;
  isAdmin?: boolean;
  orbitGiziData?: any;
  beneficiaries?: MBGBeneficiary[];
  villages?: any[];
  adminSheetUrl?: string;
  isPublicPublished?: boolean;
  lastPublishedAt?: string;
  onRefreshPublicSheet?: () => Promise<void>;
  isRefreshingSheet?: boolean;
  onPublishData?: () => void;
  onTogglePublishPermission?: (active: boolean) => void;
}

export const PublicDashboardView: React.FC<PublicDashboardViewProps> = ({
  onBackToLauncher,
  onOpenLogin,
  selectedKabupaten,
  currentUserEmail,
  visitorEmail,
  onSetVisitorEmail,
  isAdmin = false,
  orbitGiziData,
  beneficiaries: propBeneficiaries,
  villages: propVillages,
  adminSheetUrl = "https://docs.google.com/spreadsheets/d/1dGTF6wZ2DoPF2qVcjxrjaxDDQzHQjuHgwvKi1DwTkRE/edit?gid=1042318316#gid=1042318316",
  isPublicPublished = true,
  lastPublishedAt,
  onRefreshPublicSheet,
  isRefreshingSheet = false,
  onPublishData,
  onTogglePublishPermission
}) => {
  const [activeTab, setActiveTab] = useState<"SUMMARY" | "SHEET_LIVE" | "BENEFICIARIES" | "GALLERY" | "VILLAGES">("SUMMARY");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [showVisitorModal, setShowVisitorModal] = useState<boolean>(false);
  const [isSyncingSheetLocal, setIsSyncingSheetLocal] = useState<boolean>(false);

  const handleManualRefreshSheet = async () => {
    setIsSyncingSheetLocal(true);
    try {
      if (onRefreshPublicSheet) {
        await onRefreshPublicSheet();
      }
      setIframeKey(prev => prev + 1);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncingSheetLocal(false);
    }
  };

  const currentEmail = currentUserEmail || visitorEmail || "Set Email Pengunjung";
  const isAdminEmail = !!currentUserEmail;

  // Beneficiary detail modal state
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<MBGBeneficiary | null>(null);

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

  // Calculate live beneficiaries list
  const beneficiaries: MBGBeneficiary[] = React.useMemo(() => {
    if (propBeneficiaries !== undefined && propBeneficiaries !== null && Array.isArray(propBeneficiaries)) {
      return propBeneficiaries.filter(b => b && b.id && b.name && String(b.name).trim().length > 0);
    }
    const stored = localStorage.getItem("orbit_gizi_local_beneficiaries");
    if (stored !== null) {
      try {
        const parsed: MBGBeneficiary[] = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed.filter(b => b && b.id && b.name && String(b.name).trim().length > 0);
      } catch {
        // ignore
      }
    }
    return [];
  }, [propBeneficiaries]);

  // Calculate live villages list
  const villages: any[] = React.useMemo(() => {
    if (propVillages && propVillages.length > 0) return propVillages;
    if (orbitGiziData?.villages && orbitGiziData.villages.length > 0) return orbitGiziData.villages;
    const stored = localStorage.getItem("orbit_gizi_local_villages");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // ignore
      }
    }
    return [];
  }, [propVillages, orbitGiziData]);

  const filteredBeneficiaries = beneficiaries.filter(b => {
    const villageName = b.location?.kelurahan || b.location?.puskesmas || "";
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          villageName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "ALL" || b.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Mode pratinjau Google Sheet Embed (preview vs pubhtml vs htmlembed)
  const [embedMode, setEmbedMode] = useState<"preview" | "htmlembed" | "pubhtml">("preview");

  // Derive Google Sheet Embed URL
  const getEmbedUrl = (rawUrl: string, mode: "preview" | "htmlembed" | "pubhtml") => {
    if (!rawUrl) rawUrl = "https://docs.google.com/spreadsheets/d/1dGTF6wZ2DoPF2qVcjxrjaxDDQzHQjuHgwvKi1DwTkRE/edit?gid=1042318316#gid=1042318316";
    const match = rawUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    const sheetId = match && match[1] ? match[1] : "1dGTF6wZ2DoPF2qVcjxrjaxDDQzHQjuHgwvKi1DwTkRE";

    if (mode === "preview") {
      return `https://docs.google.com/spreadsheets/d/${sheetId}/preview`;
    } else if (mode === "htmlembed") {
      return `https://docs.google.com/spreadsheets/d/${sheetId}/htmlembed?widget=true&headers=false`;
    } else {
      return `https://docs.google.com/spreadsheets/d/${sheetId}/pubhtml?widget=true&headers=false`;
    }
  };

  const embedSheetUrl = getEmbedUrl(adminSheetUrl, embedMode);

  const indexScore = orbitGiziData?.indexScore || 82.9;
  const categoryLabel = orbitGiziData?.category?.label || "Hijau";
  const categoryDesc = orbitGiziData?.category?.desc || "Optimal (Sangat Baik & Berkelanjutan)";

  const pillarsList = orbitGiziData?.pillars || [
    {
      id: "pilar1",
      name: "Pilar 1. Sinkronisasi Data",
      weight: 10,
      indicators: [
        { id: "mbg_data", name: "Pilar 1. Sinkronisasi Data - Data MBG Tersinkronisasi", score: 100, description: "Penerima data MBG tersinkronisasi (1 dari 10 anak)" },
        { id: "pmt_data", name: "Pilar 1. Sinkronisasi Data - Data PMT Tersinkronisasi", score: 100, description: "Data ibu hamil KEK & balita gizi kurang tersinkronisasi (1 dari 5 sasaran)" },
        { id: "posyandu_data", name: "Pilar 1. Sinkronisasi Data - Data Posyandu Digital", score: 100, description: "Data pendaftaran & pengukuran posyandu terdigitalisasi (1 dari 1 unit)" },
        { id: "eppgbm_data", name: "Pilar 1. Sinkronisasi Data - Data e-PPGBM Sinkron", score: 100, description: "Sinkronisasi dengan e-PPGBM Kemenkes RI (1 dari 10 balita)" },
      ]
    },
    {
      id: "pilar2",
      name: "Pilar 2. Kolaborasi OPD",
      weight: 30,
      indicators: [
        { id: "dinkes", name: "Pilar 2. Kolaborasi OPD - Keaktifan Dinkes", score: 100, description: "Dinas Kesehatan aktif mendampingi puskesmas di 1 dari 1 desa" },
        { id: "bgn", name: "Pilar 2. Kolaborasi OPD - Kemitraan BGN", score: 100, description: "Badan Gizi Nasional terlibat di 1 dari 1 desa" },
        { id: "pkk", name: "Pilar 2. Kolaborasi OPD - Edukasi Tim PKK", score: 100, description: "Kader PKK menyelenggarakan penyuluhan berkala di 1 dari 1 desa" },
        { id: "pemdes", name: "Pilar 2. Kolaborasi OPD - Dukungan Pemdes (Dana Desa)", score: 100, description: "Alokasi Dana Desa untuk stunting di 1 dari 1 desa" },
        { id: "puskesmas", name: "Pilar 2. Kolaborasi OPD - Pendampingan Puskesmas", score: 100, description: "Rujukan gizi buruk terpantau di 1 dari 1 desa" },
      ]
    },
    {
      id: "pilar3",
      name: "Pilar 3. Digitalisasi",
      weight: 10,
      indicators: [
        { id: "dashboard_online", name: "Pilar 3. Digitalisasi - Dashboard Online Desa", score: 100, description: "Tersedianya dashboard publik online desa di 1 dari 1 desa" },
        { id: "validation_flow", name: "Pilar 3. Digitalisasi - Validasi Berjenjang Selesai", score: 100, description: "Penyelesaian validasi data gizi di 1 dari 1 desa" },
        { id: "real_time_update", name: "Pilar 3. Digitalisasi - Sistem Pelaporan Real-Time", score: 100, description: "Pelaporan data harian aktif di 1 dari 1 desa" },
      ]
    },
    {
      id: "pilar4",
      name: "Pilar 4. Pelayanan Gizi",
      weight: 25,
      indicators: [
        { id: "mbg_coverage", name: "Pilar 4. Pelayanan Gizi - Cakupan Layanan MBG", score: 85, description: "Realisasi distribusi MBG posyandu mencapai 1 dari 10 sasaran" },
        { id: "pmt_coverage", name: "Pilar 4. Pelayanan Gizi - Cakupan Layanan PMT", score: 85, description: "Realisasi PMT ibu hamil & balita mencapai 1 dari 5 sasaran" },
        { id: "home_visit", name: "Pilar 4. Pelayanan Gizi - Rasio Home Visit", score: 90, description: "Kunjungan rumah oleh kader mencapai sasaran prioritas" },
        { id: "posyandu_active", name: "Pilar 4. Pelayanan Gizi - Tingkat Keaktifan Posyandu", score: 100, description: "Kondisi posyandu aktif operasional 100%" },
      ]
    },
    {
      id: "pilar5",
      name: "Pilar 5. Outcome & Dampak",
      weight: 25,
      indicators: [
        { id: "stunting_reduction", name: "Pilar 5. Outcome & Dampak - Penurunan Kasus Stunting", score: 90, description: "Tren penurunan kumulatif kasus stunting berjalan stabil" },
        { id: "wasting_reduction", name: "Pilar 5. Outcome & Dampak - Penurunan Kasus Wasting", score: 90, description: "Tren penurunan kumulatif kasus wasting terpantau optimal" },
        { id: "target_accuracy", name: "Pilar 5. Outcome & Dampak - Keakuratan Sasaran Penerima", score: 95, description: "Tingkat ketepatan sasaran intervensi gizi terpadu di kabupaten" },
      ]
    }
  ];

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
              Orbit Gizi Nagekeo (Akses Publik & Transparansi)
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Connected Admin Google Sheet Link Badge */}
          <a
            href={adminSheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-300 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Buka Google Sheet Admin Nagekeo di Tab Baru"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Sheet Admin Live</span>
            <ExternalLink className="h-3 w-3 text-emerald-600" />
          </a>

          {/* Active Email Badge (Clickable for visitor identification) */}
          <button
            onClick={() => setShowVisitorModal(true)}
            className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-300 text-xs font-mono transition-colors cursor-pointer"
            title="Klik untuk mengubah Email Identitas Pengunjung Anda / Login Google"
          >
            <Mail className="h-3.5 w-3.5 text-emerald-600" />
            <span className="max-w-[180px] truncate font-bold">{currentEmail}</span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${isAdminEmail ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-amber-100 text-amber-800 border border-amber-300"}`}>
              {isAdminEmail ? "ADMIN" : "PENGUNJUNG"}
            </span>
            <Edit3 className="h-3 w-3 text-slate-400 ml-1" />
          </button>

          <button
            onClick={onBackToLauncher}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center space-x-2 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali</span>
          </button>

          {/* TOMBOL MASUK DASHBOARD UTAMA / LOGIN ADMIN */}
          <button
            onClick={onOpenLogin}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl transition-all shadow-md flex items-center space-x-1.5 cursor-pointer animate-in fade-in"
            title={isAdminEmail ? "Akses Admin Terverifikasi" : "Login sebagai Admin / Nakes"}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>{isAdminEmail ? "Masuk Dashboard Utama" : "Masuk Dashboard Utama (Login)"}</span>
          </button>
        </div>
      </header>

      {/* BANNER KONTROL PEMICU & HAK IZIN PUBLIKASI DATA SHEET */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-y border-emerald-500/30 px-4 sm:px-8 py-3.5 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Status Indicator */}
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl shrink-0 ${isPublicPublished ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-amber-500/20 text-amber-400 border border-amber-500/40"}`}>
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${isPublicPublished ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-amber-500/20 text-amber-300 border-amber-500/40"}`}>
                  {isPublicPublished ? "HAK IZIN PUBLIKASI: AKTIF (TERHUBUNG OTOMATIS)" : "HAK IZIN PUBLIKASI: MODE DRAFT"}
                </span>
                <span className="text-[11px] text-slate-300 font-medium">
                  Status: <strong className="text-white font-mono">{lastPublishedAt || "Otomatis Ter-update"}</strong>
                </span>
              </div>
              <p className="text-xs text-slate-300 font-normal mt-0.5">
                {isPublicPublished 
                  ? "Data Google Sheet & Database Publik dimuat secara otomatis & real-time untuk akses transparansi masyarakat." 
                  : "Data publik ditampilkan dalam mode terproteksi. Menunggu pemicu publikasi resmi dari Admin."}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end">
            <button
              onClick={handleManualRefreshSheet}
              disabled={isSyncingSheetLocal || isRefreshingSheet}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              title="Tarik dan muat ulang data dari Google Sheet Publik"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncingSheetLocal || isRefreshingSheet ? "animate-spin" : ""}`} />
              <span>{isSyncingSheetLocal || isRefreshingSheet ? "Memuat Data Sheet..." : "Tarik Data Sheet Publik"}</span>
            </button>

            {/* ADMIN EXCLUSIVE PUBLISH TRIGGER CONTROLS */}
            {isAdmin && (
              <>
                <button
                  onClick={onPublishData}
                  className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs rounded-xl transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
                  title="Pemicu Admin: Publikasikan & sinkronkan seluruh data terkini ke Google Sheet & Dashboard Publik"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>🚀 Pemicu Publikasikan Data</span>
                </button>

                <button
                  onClick={() => onTogglePublishPermission?.(!isPublicPublished)}
                  className={`px-3.5 py-2 font-extrabold text-xs rounded-xl border transition-all cursor-pointer ${
                    isPublicPublished 
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30" 
                      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                  }`}
                  title="Ubah izin publikasi publik"
                >
                  <span>{isPublicPublished ? "Non-aktifkan Izin Publik" : "Aktifkan Izin Publik"}</span>
                </button>
              </>
            )}
          </div>

        </div>
      </div>

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
              onClick={() => setActiveTab("SHEET_LIVE")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-2 ${
                activeTab === "SHEET_LIVE" 
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" 
                  : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300"
              }`}
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>Sheet Admin Live (Google Sheet Sync)</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-extrabold uppercase animate-pulse">LIVE</span>
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
            <span className="text-xs text-slate-600 font-bold bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              Sesi Aktif: {currentEmail}
            </span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-8 flex-1 space-y-8">
        
        {/* TAB 1: SUMMARY & STATS & LAPORAN INDEKS SHEET */}
        {activeTab === "SUMMARY" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* NOTICE BANNER */}
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Transparansi Publik • Synchronized Google Sheets Live</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Laporan Indeks Transformasi Orbit Gizi {selectedKabupaten}
                </h2>
                <p className="text-emerald-100 text-xs sm:text-sm font-medium max-w-2xl leading-relaxed">
                  Laporan publik ini secara langsung merefleksikan seluruh data pada Google Sheet Admin Live. Publik dapat memantau pilar intervensi, detail indikator penyusun, dan daftar sasaran secara real-time.
                </p>
              </div>

              <div className="flex flex-col gap-3 shrink-0">
                <div className="bg-slate-950/80 border border-emerald-500/30 p-5 rounded-2xl text-center min-w-[200px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Skor Indeks Kabupaten</span>
                  <span className="text-3xl font-black text-emerald-400 block mt-1">{indexScore} / 100</span>
                  <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase mt-2 bg-emerald-500 text-slate-950">
                    Kategori {categoryLabel} ({categoryDesc})
                  </span>
                </div>
              </div>
            </div>

            {/* TABEL SKOR PILAR INTERVENSI (Google Sheet Ringkasan Indeks) */}
            <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <Layers className="h-5 w-5 text-emerald-600" />
                    <h3 className="text-lg font-black text-slate-900">TABEL SKOR PILAR INTERVENSI</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Data pilar yang tersinkronisasi otomatis dengan Google Sheet Admin Live.</p>
                </div>
                <button
                  onClick={() => setActiveTab("SHEET_LIVE")}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-300 flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                  <span>Buka Embed Google Sheet Live →</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-600 uppercase tracking-wider">
                      <th className="p-3.5">Nama Pilar Intervensi</th>
                      <th className="p-3.5 text-center">Bobot Pilar (%)</th>
                      <th className="p-3.5 text-center">Skor Rata-Rata Pilar (0-100)</th>
                      <th className="p-3.5 text-right">Status Evaluasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium">
                    {pillarsList.map((p: any, idx: number) => {
                      const avgScore = p.indicators ? Math.round(p.indicators.reduce((acc: number, i: any) => acc + i.score, 0) / p.indicators.length) : 100;
                      return (
                        <tr key={p.id || idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 font-bold text-slate-900 flex items-center space-x-2">
                            <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-[10px]">
                              P{idx + 1}
                            </span>
                            <span>{p.name}</span>
                          </td>
                          <td className="p-3.5 text-center font-mono font-bold text-slate-700">{p.weight}%</td>
                          <td className="p-3.5 text-center font-mono font-black text-emerald-700 text-sm">{avgScore} / 100</td>
                          <td className="p-3.5 text-right">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${
                              avgScore >= 80 ? "bg-emerald-100 text-emerald-800 border border-emerald-300" :
                              avgScore >= 60 ? "bg-amber-100 text-amber-800 border border-amber-300" :
                              "bg-rose-100 text-rose-800 border border-rose-300"
                            }`}>
                              {avgScore >= 80 ? "Optimal" : avgScore >= 60 ? "Perlu Peningkatan" : "Kritis"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* DETIL INDIKATOR PENYUSUN (Google Sheet Tab Detil) */}
            <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
                <FileText className="h-5 w-5 text-teal-600" />
                <div>
                  <h3 className="text-lg font-black text-slate-900">DETIL INDIKATOR PENYUSUN</h3>
                  <p className="text-xs text-slate-500">Rincian indikator dari pilar-pilar gizi terpadu Kabupaten Nagekeo.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-600 uppercase tracking-wider">
                      <th className="p-3.5">Nama Indikator</th>
                      <th className="p-3.5 text-center">Skor (0-100)</th>
                      <th className="p-3.5">Deskripsi Realiasasi & Capaian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium">
                    {pillarsList.flatMap((p: any) => p.indicators || []).map((i: any, idx: number) => (
                      <tr key={i.id || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900 max-w-xs">{i.name}</td>
                        <td className="p-3.5 text-center font-mono font-black text-emerald-700">{i.score}</td>
                        <td className="p-3.5 text-slate-600">{i.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                  <span className="text-xs font-bold uppercase tracking-wider">Posyandu Terdaftar</span>
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

          </div>
        )}

        {/* TAB 2: LIVE EMBEDDED GOOGLE SHEET VIEW */}
        {activeTab === "SHEET_LIVE" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Transparansi Google Sheet Live (Google Drive Interaktif)</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Pratinjau Langsung Spreadsheet Admin Nagekeo
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl">
                  Seluruh tab sheet (Ringkasan Indeks, Data Desa, Penerima MBG, Ibu Hamil, Ibu Menyusui, Catatan Timbang) dapat diakses dan dilihat langsung di bawah ini secara transparan.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIframeKey(prev => prev + 1)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer shadow-sm"
                  title="Muat ulang spreadsheet"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Segarkan Sheet</span>
                </button>

                <a
                  href={adminSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center space-x-2 shadow-md cursor-pointer"
                >
                  <Maximize2 className="h-4 w-4" />
                  <span>Buka di Google Drive ↗</span>
                </a>
              </div>
            </div>

            {/* EMBED MODE SWITCHER BAR */}
            <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-black text-slate-800">Format Pratinjau:</span>
                <button
                  onClick={() => setEmbedMode("preview")}
                  className={`px-3 py-1.5 rounded-xl font-black transition-all cursor-pointer ${
                    embedMode === "preview"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                  }`}
                  title="Gunakan ini jika Google Sheet belum dipublikasikan ke web"
                >
                  Mode Pratinjau Link (Preview)
                </button>

                <button
                  onClick={() => setEmbedMode("pubhtml")}
                  className={`px-3 py-1.5 rounded-xl font-black transition-all cursor-pointer ${
                    embedMode === "pubhtml"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                  }`}
                  title="Gunakan ini jika Google Sheet sudah dilakukan File > Bagikan > Publikasikan ke Web"
                >
                  Mode Publikasi Web (Pubhtml)
                </button>

                <button
                  onClick={() => setEmbedMode("htmlembed")}
                  className={`px-3 py-1.5 rounded-xl font-black transition-all cursor-pointer ${
                    embedMode === "htmlembed"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                  }`}
                  title="Mode tampilan HTML minimal"
                >
                  Mode HTML Embed
                </button>
              </div>

              <div className="text-[11px] text-slate-500 font-medium italic">
                {embedMode === "preview" && "✓ Buka langsung tanpa syarat 'Publikasikan ke web' (cukup akses link publik)."}
                {embedMode === "pubhtml" && "ℹ️ Membutuhkan Google Sheet diterbitkan di 'File > Bagikan > Publikasikan ke Web'."}
                {embedMode === "htmlembed" && "✓ Tampilan dokumen ringan."}
              </div>
            </div>

            {/* EMBED IFRAME */}
            <div className="bg-white/95 backdrop-blur-md border border-slate-300 rounded-3xl overflow-hidden shadow-xl p-2 sm:p-4 min-h-[700px] flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-100 border-b border-slate-200 rounded-t-2xl mb-2 text-xs text-slate-600 font-bold">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="ml-2 font-mono text-slate-700">Google Sheets Viewer Live • Nagekeo ({embedMode.toUpperCase()})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px]">Tersinkronisasi Live</span>
                </div>
              </div>

              <iframe
                key={iframeKey + "_" + embedMode}
                src={embedSheetUrl}
                className="w-full h-[700px] rounded-xl border border-slate-200 shadow-inner"
                title="Google Sheet Admin Orbit Gizi"
                loading="lazy"
              />
            </div>
          </div>
        )}

        {/* TAB 3: BENEFICIARIES READ-ONLY TABLE (WITH CLICKABLE NAMES FOR MODAL) */}
        {activeTab === "BENEFICIARIES" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/95 backdrop-blur-md border border-slate-200 p-6 rounded-3xl shadow-sm">
              <div>
                <h3 className="text-xl font-black text-slate-900">Direktori Data Sasaran & Penerima</h3>
                <p className="text-xs text-slate-500">Klik pada nama sasaran untuk melihat detail rekam medis, riwayat penimbangan, dan petugas pendamping.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari nama atau desa..."
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl text-slate-900 text-xs outline-none"
                  />
                </div>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl text-slate-900 text-xs outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Kategori</option>
                  <option value="Balita">Balita</option>
                  <option value="Ibu Hamil">Ibu Hamil</option>
                  <option value="Ibu Menyusui">Ibu Menyusui</option>
                </select>
              </div>
            </div>

            {/* TABLE */}
            <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                      <th className="p-4">Nama Sasaran (Klik untuk Detail)</th>
                      <th className="p-4">Kategori</th>
                      <th className="p-4">Wilayah / Desa</th>
                      <th className="p-4">Status Gizi Terkini</th>
                      <th className="p-4">Status Intervensi PMT</th>
                      <th className="p-4">Informasi Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium">
                    {filteredBeneficiaries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500 font-bold">
                          Tidak ada data sasaran yang sesuai dengan pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredBeneficiaries.map((b, idx) => (
                        <tr 
                          key={b.id || idx} 
                          onClick={() => setSelectedBeneficiary(b)}
                          className="hover:bg-emerald-50/50 transition-colors cursor-pointer group"
                        >
                          <td className="p-4 font-bold text-slate-900 flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-[10px] group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                              {b.name.charAt(0)}
                            </div>
                            <span className="underline decoration-emerald-500/50 underline-offset-4 group-hover:text-emerald-700 transition-colors">{b.name}</span>
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]">
                              {b.category}
                            </span>
                          </td>
                          <td className="p-4 text-slate-600">{b.location?.kelurahan || b.location?.puskesmas || "Nagekeo"}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-lg font-bold text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {b.weightRecords?.[0]?.statusGizi || "Normal"}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-emerald-700 font-bold">Aktif (MBG & PMT)</span>
                          </td>
                          <td className="p-4">
                            <span className="text-xs font-bold text-emerald-600 group-hover:underline">Lihat Detail →</span>
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

        {/* TAB 4: GALLERY */}
        {activeTab === "GALLERY" && (
          <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
            <NutritionBannerGallery
              images={bannerImages}
              onAddImage={() => {}}
              onDeleteImage={() => {}}
              title="Galeri Lengkap Dokumentasi Gizi Nagekeo"
              subtitle="Kumpulan foto dan banner kegiatan intervensi gizi, Posyandu, dan MBG."
              readOnly={true}
            />
          </div>
        )}

        {/* TAB 5: VILLAGES & DISTRICT RECAP */}
        {activeTab === "VILLAGES" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-6 rounded-3xl shadow-sm">
              <h3 className="text-xl font-black text-slate-900">Rekapitulasi Wilayah & Desa Terdaftar</h3>
              <p className="text-xs text-slate-500">Distribusi posyandu dan pencapaian indikator gizi berdasarkan data terinput.</p>
            </div>

            {villages.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-3xl p-10 text-center space-y-3">
                <div className="inline-flex p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <Building2 className="h-8 w-8" />
                </div>
                <h4 className="text-base font-black text-slate-900">Belum Ada Data Wilayah / Desa</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Belum ada data desa atau penerima MBG yang terdaftar dalam sistem. Silakan login sebagai Admin untuk menginput sasaran atau melakukan Sinkronisasi Otomatis Google Sheets.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {villages.map((v) => {
                  const vBens = beneficiaries.filter(b => b.location?.kelurahan?.toLowerCase().trim() === v.name?.toLowerCase().trim());
                  const stuntingCount = vBens.filter(b => b.weightRecords && b.weightRecords.length > 0 && (b.weightRecords[b.weightRecords.length - 1].statusGizi === "Stunting" || b.weightRecords[b.weightRecords.length - 1].statusGizi === "Risiko Stunting")).length;

                  return (
                    <div key={v.id} className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-slate-900">{v.name}</span>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${
                          v.riskLevel === "Hijau" ? "bg-emerald-100 text-emerald-800" : v.riskLevel === "Kuning" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                        }`}>
                          Zona {v.riskLevel} (Skor: {v.score})
                        </span>
                      </div>

                      <div className="space-y-2 text-xs text-slate-600">
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Posyandu Aktif:</span>
                          <span className="font-bold text-slate-900">{v.pilar4_posyandu_aktif} Pos</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Total Sasaran Terdaftar:</span>
                          <span className="font-bold text-slate-900">{vBens.length} Orang</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Kasus Stunting:</span>
                          <span className="font-bold text-amber-600">{stuntingCount} Kasus</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-white/80 border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500">
        <p>© 2026 Orbit Gizi Kabupaten Nagekeo • Portal Eksekutif Publik & Transparansi Data Gizi</p>
      </footer>

      {/* VISITOR EMAIL IDENTIFICATION MODAL */}
      <VisitorEmailModal
        isOpen={showVisitorModal}
        onClose={() => setShowVisitorModal(false)}
        currentEmail={visitorEmail || ""}
        onSaveEmail={(email) => {
          if (onSetVisitorEmail) onSetVisitorEmail(email);
        }}
        onGoogleLogin={onOpenLogin}
      />

      {/* BENEFICIARY DETAIL MODAL */}
      <BeneficiaryDetailModal
        beneficiary={selectedBeneficiary}
        isOpen={Boolean(selectedBeneficiary)}
        onClose={() => setSelectedBeneficiary(null)}
      />

    </div>
  );
};
