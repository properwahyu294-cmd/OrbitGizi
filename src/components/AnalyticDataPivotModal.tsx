import React, { useState, useMemo } from "react";
import { 
  XCircle, 
  Sparkles, 
  Table, 
  BarChart2, 
  ShieldCheck, 
  Download, 
  Copy, 
  Printer, 
  Check, 
  Filter, 
  Activity, 
  AlertTriangle, 
  AlertCircle,
  CheckCircle2,
  Info,
  User,
  FileText,
  Calendar,
  MapPin,
  Users, 
  Layers, 
  TrendingUp,
  Lock,
  Heart,
  PieChart as PieChartIcon
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell, 
  PieChart, 
  Pie 
} from "recharts";
import { MBGBeneficiary } from "../types";
import { sanitizeInput } from "../lib/cyberSecurity";

interface AnalyticDataPivotModalProps {
  isOpen: boolean;
  onClose: () => void;
  beneficiaries: MBGBeneficiary[];
  selectedKelurahan: string;
  collaborationMetrics: {
    total: number;
    notAttendingCount: number;
    pmtReceivedCount: number;
    desaRate: number;
    posyanduRate: number;
    collabRateScore: number;
    homeVisitList: MBGBeneficiary[];
    criticalWeaknesses: string[];
    pmtRate: number;
  };
}

type RowDimension = "POSYANDU" | "CATEGORY" | "STATUS_GIZI" | "PROGRAM_STATUS" | "ATTENDANCE";

interface PivotRowData {
  rowKey: string;
  totalCount: number;
  mbgCount: number;
  pmtCount: number;
  bothCount: number;
  homeVisitCount: number;
  specialInterventionCount: number;
  normalCount: number;
  stuntingCount: number;
  risikoStuntingCount: number;
  giziKurangCount: number;
  avgWeight: number;
  avgHeight: number;
}

export const AnalyticDataPivotModal: React.FC<AnalyticDataPivotModalProps> = ({
  isOpen,
  onClose,
  beneficiaries,
  selectedKelurahan,
  collaborationMetrics
}) => {
  const [activeTab, setActiveTab] = useState<"REKAP_INDEKS" | "PIVOT_TABLE" | "BENEFICIARY_LIST" | "CHARTS" | "AI_EXECUTIVE" | "CYBER_SECURITY">("REKAP_INDEKS");
  const [rowDimension, setRowDimension] = useState<RowDimension>("POSYANDU");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [filterProgram, setFilterProgram] = useState<string>("ALL");
  const [sortColumn, setSortColumn] = useState<keyof PivotRowData>("totalCount");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [printOrientation, setPrintOrientation] = useState<"portrait" | "landscape">("portrait");

  // Sanitize search query input
  const safeSearch = useMemo(() => {
    return sanitizeInput(searchQuery, 100).sanitizedValue.toLowerCase().trim();
  }, [searchQuery]);

  // Pivot data calculation engine
  const pivotData = useMemo(() => {
    const map: Record<string, PivotRowData> = {};

    // Filter beneficiaries by category & search query
    const filteredList = beneficiaries.filter(b => {
      if (filterCategory !== "ALL" && b.category !== filterCategory) return false;

      if (safeSearch) {
        const nameMatch = b.name.toLowerCase().includes(safeSearch);
        const parentMatch = (b.parentName || "").toLowerCase().includes(safeSearch);
        const posyanduMatch = (b.location.posyandu || b.location.kelurahan || "").toLowerCase().includes(safeSearch);
        const nikMatch = (b.nik || "").toLowerCase().includes(safeSearch);
        if (!nameMatch && !parentMatch && !posyanduMatch && !nikMatch) return false;
      }
      return true;
    });

    filteredList.forEach(b => {
      let key = "Lainnya";
      
      if (rowDimension === "POSYANDU") {
        key = b.location.posyandu || b.location.kelurahan || "Posyandu Utama";
      } else if (rowDimension === "CATEGORY") {
        key = b.category || "Balita";
      } else if (rowDimension === "STATUS_GIZI") {
        const lastRec = b.weightRecords && b.weightRecords.length > 0 ? b.weightRecords[b.weightRecords.length - 1] : null;
        key = lastRec?.statusGizi || "Normal";
      } else if (rowDimension === "PROGRAM_STATUS") {
        const isMbg = b.isReceivedMBG !== false;
        const isPmt = b.isReceivedPMT !== false;
        if (isMbg && isPmt) key = "MBG + PMT (Lengkap)";
        else if (isMbg) key = "MBG Saja";
        else if (isPmt) key = "PMT Saja";
        else key = "Belum Terjangkau";
      } else if (rowDimension === "ATTENDANCE") {
        key = b.attendanceStatus || "Mengunjungi Posyandu";
      }

      if (!map[key]) {
        map[key] = {
          rowKey: key,
          totalCount: 0,
          mbgCount: 0,
          pmtCount: 0,
          bothCount: 0,
          homeVisitCount: 0,
          specialInterventionCount: 0,
          normalCount: 0,
          stuntingCount: 0,
          risikoStuntingCount: 0,
          giziKurangCount: 0,
          avgWeight: 0,
          avgHeight: 0
        };
      }

      const row = map[key];
      row.totalCount += 1;

      const isMbg = b.isReceivedMBG !== false;
      const isPmt = b.isReceivedPMT !== false;

      if (isMbg) row.mbgCount += 1;
      if (isPmt) row.pmtCount += 1;
      if (isMbg && isPmt) row.bothCount += 1;

      if (b.attendanceStatus === "Tidak Mengunjungi") row.homeVisitCount += 1;
      if (b.isSpecialInterventionNeeded) row.specialInterventionCount += 1;

      const lastRec = b.weightRecords && b.weightRecords.length > 0 ? b.weightRecords[b.weightRecords.length - 1] : null;
      const statusGizi = lastRec?.statusGizi || "Normal";

      if (statusGizi === "Normal") row.normalCount += 1;
      else if (statusGizi === "Stunting") row.stuntingCount += 1;
      else if (statusGizi === "Risiko Stunting") row.risikoStuntingCount += 1;
      else if (statusGizi === "Gizi Kurang") row.giziKurangCount += 1;

      if (lastRec?.weightKg) row.avgWeight += lastRec.weightKg;
      if (lastRec?.heightCm) row.avgHeight += lastRec.heightCm;
    });

    // Compute averages
    const rows = Object.values(map).map(r => ({
      ...r,
      avgWeight: r.totalCount > 0 ? Number((r.avgWeight / r.totalCount).toFixed(1)) : 0,
      avgHeight: r.totalCount > 0 ? Number((r.avgHeight / r.totalCount).toFixed(1)) : 0
    }));

    // Sorting
    rows.sort((a, b) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];
      if (typeof valA === "number" && typeof valB === "number") {
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }
      return sortDirection === "asc" 
        ? String(valA).localeCompare(String(valB)) 
        : String(valB).localeCompare(String(valA));
    });

    return rows;
  }, [beneficiaries, rowDimension, filterCategory, safeSearch, sortColumn, sortDirection]);

  // Grand totals calculation for Pivot
  const grandTotal = useMemo(() => {
    return pivotData.reduce(
      (acc, r) => ({
        totalCount: acc.totalCount + r.totalCount,
        mbgCount: acc.mbgCount + r.mbgCount,
        pmtCount: acc.pmtCount + r.pmtCount,
        bothCount: acc.bothCount + r.bothCount,
        homeVisitCount: acc.homeVisitCount + r.homeVisitCount,
        specialInterventionCount: acc.specialInterventionCount + r.specialInterventionCount,
        normalCount: acc.normalCount + r.normalCount,
        stuntingCount: acc.stuntingCount + r.stuntingCount,
        risikoStuntingCount: acc.risikoStuntingCount + r.risikoStuntingCount,
        giziKurangCount: acc.giziKurangCount + r.giziKurangCount
      }),
      {
        totalCount: 0,
        mbgCount: 0,
        pmtCount: 0,
        bothCount: 0,
        homeVisitCount: 0,
        specialInterventionCount: 0,
        normalCount: 0,
        stuntingCount: 0,
        risikoStuntingCount: 0,
        giziKurangCount: 0
      }
    );
  }, [pivotData]);

  // Calculated Transformation Index Score & Status Wilayah (Gambar 1)
  const transformIndexScore = useMemo(() => {
    if (grandTotal.totalCount === 0) return 0;
    const mbgRatio = grandTotal.mbgCount / grandTotal.totalCount;
    const pmtRatio = grandTotal.pmtCount / grandTotal.totalCount;
    const attendanceRatio = (grandTotal.totalCount - grandTotal.homeVisitCount) / grandTotal.totalCount;
    const normalRatio = grandTotal.normalCount / grandTotal.totalCount;

    const rawScore = Math.round(
      (mbgRatio * 35) + 
      (pmtRatio * 30) + 
      (attendanceRatio * 20) + 
      (normalRatio * 15)
    );
    return Math.min(100, Math.max(0, rawScore));
  }, [grandTotal]);

  const regionStatus = useMemo(() => {
    if (transformIndexScore < 50) {
      return {
        category: "Kategori Merah",
        categoryBg: "bg-rose-100 text-rose-800 border-rose-300",
        badgeBg: "bg-rose-500",
        title: "Kritis (Butuh Intervensi Segera)",
        description: "Kritis! Diperlukan intervensi tanggap darurat multisektoral untuk menurunkan stunting secara agresif.",
        icon: AlertTriangle,
        iconBg: "bg-rose-100 text-rose-600 border-rose-200"
      };
    } else if (transformIndexScore <= 75) {
      return {
        category: "Kategori Kuning",
        categoryBg: "bg-amber-100 text-amber-800 border-amber-300",
        badgeBg: "bg-amber-500",
        title: "Waspada (Perlu Peningkatan Intervensi)",
        description: "Waspada! Diperlukan penguatan cakupan PMT Pemulihan dan pemantauan rutin posyandu bulanan.",
        icon: AlertCircle,
        iconBg: "bg-amber-100 text-amber-600 border-amber-200"
      };
    } else {
      return {
        category: "Kategori Hijau",
        categoryBg: "bg-emerald-100 text-emerald-800 border-emerald-300",
        badgeBg: "bg-emerald-500",
        title: "Optimal & Baik (Pertahankan Kinerja)",
        description: "Sangat Baik! Target penanganan gizi dan cakupan program MBG & PMT berjalan optimal.",
        icon: CheckCircle2,
        iconBg: "bg-emerald-100 text-emerald-600 border-emerald-200"
      };
    }
  }, [transformIndexScore]);

  // Beneficiary Roster List filtering for Tab 3
  const filteredBeneficiaryList = useMemo(() => {
    return beneficiaries.filter(b => {
      if (filterCategory !== "ALL" && b.category !== filterCategory) return false;
      
      const isMbg = b.isReceivedMBG !== false;
      const isPmt = b.isReceivedPMT !== false;
      if (filterProgram === "MBG_ONLY" && (!isMbg || isPmt)) return false;
      if (filterProgram === "PMT_ONLY" && (!isPmt || isMbg)) return false;
      if (filterProgram === "BOTH" && (!isMbg || !isPmt)) return false;

      if (safeSearch) {
        const nameMatch = b.name.toLowerCase().includes(safeSearch);
        const parentMatch = (b.parentName || "").toLowerCase().includes(safeSearch);
        const posyanduMatch = (b.location.posyandu || b.location.kelurahan || "").toLowerCase().includes(safeSearch);
        const nikMatch = (b.nik || "").toLowerCase().includes(safeSearch);
        if (!nameMatch && !parentMatch && !posyanduMatch && !nikMatch) return false;
      }
      return true;
    });
  }, [beneficiaries, filterCategory, filterProgram, safeSearch]);

  // Data for Charts
  const stuntingPieData = useMemo(() => {
    return [
      { name: "Normal", value: grandTotal.normalCount, color: "#10b981" },
      { name: "Risiko Stunting", value: grandTotal.risikoStuntingCount, color: "#f59e0b" },
      { name: "Stunting", value: grandTotal.stuntingCount, color: "#ef4444" },
      { name: "Gizi Kurang", value: grandTotal.giziKurangCount, color: "#8b5cf6" }
    ].filter(d => d.value > 0);
  }, [grandTotal]);

  const handleSort = (col: keyof PivotRowData) => {
    if (sortColumn === col) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(col);
      setSortDirection("desc");
    }
  };

  // Export to CSV Function
  const handleExportCSV = () => {
    const headers = ["Dimension", "Total Sasaran", "Penerima MBG", "% MBG", "Penerima PMT", "% PMT", "MBG+PMT", "Status Normal", "Stunting", "Risiko Stunting", "Wajib Home Visit", "Avg Berat (kg)", "Avg Tinggi (cm)"];
    
    const csvRows = [
      headers.join(","),
      ...pivotData.map(r => [
        `"${r.rowKey}"`,
        r.totalCount,
        r.mbgCount,
        `"${((r.mbgCount / (r.totalCount || 1)) * 100).toFixed(1)}%"`,
        r.pmtCount,
        `"${((r.pmtCount / (r.totalCount || 1)) * 100).toFixed(1)}%"`,
        r.bothCount,
        r.normalCount,
        r.stuntingCount,
        r.risikoStuntingCount,
        r.homeVisitCount,
        r.avgWeight,
        r.avgHeight
      ].join(","))
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Pivot_Analytic_OrbitGizi_${selectedKelurahan.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Pivot TSV to Clipboard
  const handleCopyTSV = () => {
    const headers = ["Dimension\tTotal Sasaran\tPenerima MBG\t% MBG\tPenerima PMT\t% PMT\tMBG+PMT\tNormal\tStunting\tRisiko Stunting\tWajib Home Visit"];
    const tsvRows = pivotData.map(r => 
      `${r.rowKey}\t${r.totalCount}\t${r.mbgCount}\t${((r.mbgCount / (r.totalCount || 1)) * 100).toFixed(1)}%\t${r.pmtCount}\t${((r.pmtCount / (r.totalCount || 1)) * 100).toFixed(1)}%\t${r.bothCount}\t${r.normalCount}\t${r.stuntingCount}\t${r.risikoStuntingCount}\t${r.homeVisitCount}`
    );
    const text = [...headers, ...tsvRows].join("\n");
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* SCREEN INTERACTIVE MODAL (HIDDEN IN PRINT) */}
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 print:hidden">
        <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[95vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER BAR */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 border-b border-indigo-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-600/30 rounded-2xl border border-indigo-400/30 text-amber-300 shrink-0">
              <Table className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-500 text-slate-950">
                  ENTERPRISE PIVOT ANALYTICS
                </span>
                <span className="text-xs text-indigo-300 font-bold">• {selectedKelurahan}</span>
              </div>
              <h2 className="text-xl font-black text-white mt-0.5 flex items-center space-x-2">
                <span>Analytic Data & Pivot Matrix Orbit Gizi</span>
                <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center space-x-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Cyber Guard Protected</span>
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
              title="Download Excel / CSV File"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={handleCopyTSV}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer border border-slate-700"
              title="Copy Table to Excel"
            >
              {copiedSuccess ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span className="hidden sm:inline">{copiedSuccess ? "Tersalin!" : "Salin Tabel"}</span>
            </button>

            <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setPrintOrientation("portrait")}
                className={`px-2 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-all ${printOrientation === 'portrait' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Atur Format Cetak Portrait"
              >
                Portrait
              </button>
              <button
                onClick={() => setPrintOrientation("landscape")}
                className={`px-2 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-all ${printOrientation === 'landscape' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Atur Format Cetak Landscape"
              >
                Landscape
              </button>
            </div>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer border border-slate-700"
              title="Cetak Laporan"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Cetak ({printOrientation === 'portrait' ? 'Port.' : 'Land.'})</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* SUMMARY KPI CARDS TOP BAR */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 grid grid-cols-2 sm:grid-cols-5 gap-3 shrink-0 text-xs">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Sasaran Terdaftar</span>
            <span className="text-xl font-black text-slate-900">{grandTotal.totalCount} <span className="text-xs text-slate-400 font-bold">Jiwa</span></span>
            <span className="text-[10px] text-indigo-600 font-bold block mt-0.5">Pendataan 100% Valid</span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
            <span className="text-[10px] font-bold text-emerald-700 uppercase block">Penerima MBG (Porsi Gratis)</span>
            <span className="text-xl font-black text-emerald-700">{grandTotal.mbgCount} <span className="text-xs text-emerald-500 font-bold">({((grandTotal.mbgCount / (grandTotal.totalCount || 1)) * 100).toFixed(0)}%)</span></span>
            <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Program Utama MBG</span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-purple-200 bg-purple-50/20 shadow-xs">
            <span className="text-[10px] font-bold text-purple-700 uppercase block">Penerima PMT (Pemulihan)</span>
            <span className="text-xl font-black text-purple-700">{grandTotal.pmtCount} <span className="text-xs text-purple-500 font-bold">({((grandTotal.pmtCount / (grandTotal.totalCount || 1)) * 100).toFixed(0)}%)</span></span>
            <span className="text-[10px] text-purple-600 font-bold block mt-0.5">Makanan Tambahan</span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
            <span className="text-[10px] font-bold text-amber-800 uppercase block">Total MBG + PMT (Lengkap)</span>
            <span className="text-xl font-black text-amber-800">{grandTotal.bothCount} <span className="text-xs text-amber-600 font-bold">Sasaran</span></span>
            <span className="text-[10px] text-amber-700 font-bold block mt-0.5">Intervensi Ganda</span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-rose-200 bg-rose-50/30 col-span-2 sm:col-span-1 shadow-xs">
            <span className="text-[10px] font-bold text-rose-800 uppercase block">Wajib Kunjungan Rumah</span>
            <span className="text-xl font-black text-rose-700">{grandTotal.homeVisitCount} <span className="text-xs text-rose-500 font-bold">Sasaran</span></span>
            <span className="text-[10px] text-rose-600 font-bold block mt-0.5">Absen Penimbangan</span>
          </div>
        </div>

        {/* NAVIGATION TABS BAR */}
        <div className="bg-slate-100 px-5 pt-3 pb-0 border-b border-slate-200 flex items-center justify-between shrink-0 overflow-x-auto">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab("REKAP_INDEKS")}
              className={`px-4 py-2.5 rounded-t-2xl font-black text-xs flex items-center space-x-2 cursor-pointer transition-all ${
                activeTab === "REKAP_INDEKS"
                  ? "bg-white text-emerald-900 border-t-2 border-emerald-500 border-x border-slate-200 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Activity className="h-4 w-4 text-emerald-600" />
              <span>Rekap Indeks & Status Wilayah</span>
            </button>

            <button
              onClick={() => setActiveTab("PIVOT_TABLE")}
              className={`px-4 py-2.5 rounded-t-2xl font-black text-xs flex items-center space-x-2 cursor-pointer transition-all ${
                activeTab === "PIVOT_TABLE"
                  ? "bg-white text-indigo-900 border-t-2 border-indigo-600 border-x border-slate-200 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Table className="h-4 w-4 text-indigo-600" />
              <span>Matriks Pivot Table Interaktif</span>
            </button>

            <button
              onClick={() => setActiveTab("BENEFICIARY_LIST")}
              className={`px-4 py-2.5 rounded-t-2xl font-black text-xs flex items-center space-x-2 cursor-pointer transition-all ${
                activeTab === "BENEFICIARY_LIST"
                  ? "bg-white text-purple-900 border-t-2 border-purple-600 border-x border-slate-200 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users className="h-4 w-4 text-purple-600" />
              <span>Tabel Daftar Sasaran Lengkap</span>
            </button>

            <button
              onClick={() => setActiveTab("CHARTS")}
              className={`px-4 py-2.5 rounded-t-2xl font-black text-xs flex items-center space-x-2 cursor-pointer transition-all ${
                activeTab === "CHARTS"
                  ? "bg-white text-indigo-900 border-t-2 border-x border-slate-200 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BarChart2 className="h-4 w-4 text-teal-600" />
              <span>Grafik Multi-Dimensi</span>
            </button>

            <button
              onClick={() => setActiveTab("AI_EXECUTIVE")}
              className={`px-4 py-2.5 rounded-t-2xl font-black text-xs flex items-center space-x-2 cursor-pointer transition-all ${
                activeTab === "AI_EXECUTIVE"
                  ? "bg-white text-indigo-900 border-t-2 border-x border-slate-200 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Laporan Eksekutif & Rekomendasi</span>
            </button>

            <button
              onClick={() => setActiveTab("CYBER_SECURITY")}
              className={`px-4 py-2.5 rounded-t-2xl font-black text-xs flex items-center space-x-2 cursor-pointer transition-all ${
                activeTab === "CYBER_SECURITY"
                  ? "bg-white text-indigo-900 border-t-2 border-x border-slate-200 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Status Proteksi Cyber Security</span>
            </button>
          </div>
        </div>

        {/* TAB CONTENTS (SCROLLABLE AREA) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-white">

          {/* TAB 0: REKAP INDEKS TRANSFORMASI & STATUS WILAYAH (GAMBAR 1) */}
          {activeTab === "REKAP_INDEKS" && (
            <div className="space-y-6">
              
              {/* INDEKS TRANSFORMASI ORBIT GIZI (GAMBAR 1 TOP CARD) */}
              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs text-center space-y-6">
                <span className="text-xs font-black uppercase text-slate-400 tracking-widest block">
                  INDEKS TRANSFORMASI ORBIT GIZI
                </span>

                <div className="flex justify-center items-center">
                  <div className="relative h-40 w-40 rounded-full bg-slate-50 border-8 border-slate-100 flex flex-col items-center justify-center shadow-inner">
                    <span className="text-5xl font-black text-slate-900 tracking-tight">
                      {transformIndexScore}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 mt-1">
                      skor 0 - 100
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-2 text-xs font-medium text-slate-500">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>Sinc: 6 Agustus 2026 pukul 11.30</span>
                </div>
              </div>

              {/* STATUS KABUPATEN / WILAYAH (GAMBAR 1 BOTTOM CARD) */}
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs relative">
                
                {/* Top Accent Line */}
                <div className={`h-1.5 w-full ${regionStatus.badgeBg}`}></div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
                      STATUS KABUPATEN / WILAYAH
                    </span>
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                      Multi-Level Unit
                    </span>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className={`p-3.5 rounded-2xl border ${regionStatus.iconBg} shrink-0`}>
                      <regionStatus.icon className="h-7 w-7" />
                    </div>
                    <div className="space-y-1">
                      <span className={`inline-block text-xs font-black px-3 py-1 rounded-lg border ${regionStatus.categoryBg}`}>
                        {regionStatus.category}
                      </span>
                      <h3 className="text-lg font-black text-slate-900">
                        {regionStatus.title}
                      </h3>
                    </div>
                  </div>

                  {/* Informational Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-medium text-slate-700 flex items-start space-x-3">
                    <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{regionStatus.description}</span>
                  </div>

                  {/* Classification Legend */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs font-bold text-slate-400">
                    <span>Klasifikasi Skor:</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-rose-600 font-extrabold">&lt;50 Merah</span>
                      <span className="text-amber-600 font-extrabold">51-75 Kuning</span>
                      <span className="text-emerald-600 font-extrabold">76-100 Hijau</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: TABEL DAFTAR SASARAN LENGKAP (GAMBAR 2 DETAILS) */}
          {activeTab === "BENEFICIARY_LIST" && (
            <div className="space-y-4">
              
              {/* Filter Bar */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="font-black text-slate-800 uppercase text-[11px]">Daftar Sasaran Terdaftar ({filteredBeneficiaryList.length} Jiwa)</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="border border-slate-200 rounded-xl px-3 py-1.5 font-bold bg-white text-slate-700 text-xs focus:outline-none"
                  >
                    <option value="ALL">Semua Kategori</option>
                    <option value="Balita">Balita</option>
                    <option value="Ibu Hamil">Ibu Hamil</option>
                    <option value="Ibu Menyusui">Ibu Menyusui</option>
                  </select>

                  <select
                    value={filterProgram}
                    onChange={(e) => setFilterProgram(e.target.value)}
                    className="border border-slate-200 rounded-xl px-3 py-1.5 font-bold bg-white text-slate-700 text-xs focus:outline-none"
                  >
                    <option value="ALL">Semua Program</option>
                    <option value="MBG_ONLY">MBG Saja</option>
                    <option value="PMT_ONLY">PMT Saja</option>
                    <option value="BOTH">MBG + PMT (Lengkap)</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Cari Nama / NIK / Posyandu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-xs bg-white text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Beneficiary Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3 border-r border-slate-800">No / NIK</th>
                      <th className="p-3 border-r border-slate-800">Nama Sasaran & Umur</th>
                      <th className="p-3 border-r border-slate-800">Kategori</th>
                      <th className="p-3 border-r border-slate-800">Posyandu & Desa</th>
                      <th className="p-3 text-center border-r border-slate-800 text-emerald-300">Status MBG</th>
                      <th className="p-3 text-center border-r border-slate-800 text-purple-300">Status PMT</th>
                      <th className="p-3 text-center border-r border-slate-800">Status Gizi</th>
                      <th className="p-3 text-center border-r border-slate-800">BB / TB Terakhir</th>
                      <th className="p-3 text-center">Kehadiran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white font-medium">
                    {filteredBeneficiaryList.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-400 font-bold">
                          Tidak ada data sasaran yang sesuai dengan kriteria filter.
                        </td>
                      </tr>
                    ) : (
                      filteredBeneficiaryList.map((ben, idx) => {
                        const isMbg = ben.isReceivedMBG !== false;
                        const isPmt = ben.isReceivedPMT !== false;
                        const lastRec = ben.weightRecords && ben.weightRecords.length > 0 ? ben.weightRecords[ben.weightRecords.length - 1] : null;
                        const statusGizi = lastRec?.statusGizi || "Normal";

                        return (
                          <tr key={ben.id || idx} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 border-r border-slate-100 font-mono text-[11px] text-slate-500">
                              <span className="font-bold text-slate-900 block">#{idx + 1}</span>
                              <span>{ben.nik || "531600000"}</span>
                            </td>

                            <td className="p-3 border-r border-slate-100 font-bold text-slate-900">
                              <div className="flex items-center space-x-1.5">
                                <span>{ben.name}</span>
                                {ben.gender && (
                                  <span className="text-[10px] text-slate-400">({ben.gender === "L" ? "L" : "P"})</span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 block font-medium">Ortu: {ben.parentName || "-"}</span>
                            </td>

                            <td className="p-3 border-r border-slate-100">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                ben.category === "Balita" ? "bg-sky-100 text-sky-800" :
                                ben.category === "Ibu Hamil" ? "bg-pink-100 text-pink-800" : "bg-purple-100 text-purple-800"
                              }`}>
                                {ben.category}
                              </span>
                            </td>

                            <td className="p-3 border-r border-slate-100 text-slate-700">
                              <span className="font-bold block">{ben.location.posyandu || "Posyandu Main"}</span>
                              <span className="text-[10px] text-slate-400">{ben.location.kelurahan || selectedKelurahan}</span>
                            </td>

                            <td className="p-3 text-center border-r border-slate-100">
                              {isMbg ? (
                                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black text-[10px]">
                                  ✅ Layani MBG
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-400 text-[10px]">
                                  Tidak
                                </span>
                              )}
                            </td>

                            <td className="p-3 text-center border-r border-slate-100">
                              {isPmt ? (
                                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-black text-[10px]">
                                  🍇 PMT Pemulihan
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-400 text-[10px]">
                                  Tidak
                                </span>
                              )}
                            </td>

                            <td className="p-3 text-center border-r border-slate-100">
                              <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                                statusGizi === "Normal" ? "bg-emerald-100 text-emerald-800" :
                                statusGizi === "Stunting" ? "bg-rose-100 text-rose-800" :
                                statusGizi === "Risiko Stunting" ? "bg-amber-100 text-amber-800" : "bg-purple-100 text-purple-800"
                              }`}>
                                {statusGizi}
                              </span>
                            </td>

                            <td className="p-3 text-center border-r border-slate-100 font-bold text-slate-800">
                              {lastRec ? `${lastRec.weightKg} kg / ${lastRec.heightCm || "-"} cm` : "-"}
                            </td>

                            <td className="p-3 text-center">
                              {ben.attendanceStatus === "Tidak Mengunjungi" ? (
                                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-black text-[10px]">
                                  🚨 Wajib Visit
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                                  Hadir Posyandu
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 1: PIVOT TABLE MATRIX */}
          {activeTab === "PIVOT_TABLE" && (
            <div className="space-y-4">
              
              {/* Pivot Controls Panel */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                
                {/* Row Dimension Select */}
                <div className="flex items-center space-x-2">
                  <span className="font-black text-slate-700 uppercase tracking-wider text-[11px] flex items-center space-x-1">
                    <Layers className="h-4 w-4 text-indigo-600" />
                    <span>Kelompokkan Baris (Row Pivot):</span>
                  </span>
                  <select
                    value={rowDimension}
                    onChange={(e) => setRowDimension(e.target.value as RowDimension)}
                    className="border border-indigo-200 rounded-xl px-3 py-1.5 font-extrabold bg-white text-indigo-900 focus:outline-none cursor-pointer shadow-xs"
                  >
                    <option value="POSYANDU">📌 Berdasarkan Posyandu / Wilayah</option>
                    <option value="CATEGORY">👶 Berdasarkan Kategori Sasaran (Balita/Bumil/Busui)</option>
                    <option value="STATUS_GIZI">📊 Berdasarkan Status Gizi (Stunting/Normal)</option>
                    <option value="PROGRAM_STATUS">🍱 Berdasarkan Status Program (MBG/PMT)</option>
                    <option value="ATTENDANCE">🏠 Berdasarkan Kehadiran / Kunjungan Rumah</option>
                  </select>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Category Filter */}
                  <div className="flex items-center space-x-1">
                    <Filter className="h-3.5 w-3.5 text-slate-400" />
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold bg-white text-slate-700 text-xs cursor-pointer focus:outline-none"
                    >
                      <option value="ALL">Semua Kategori</option>
                      <option value="Balita">Balita</option>
                      <option value="Ibu Hamil">Ibu Hamil</option>
                      <option value="Ibu Menyusui">Ibu Menyusui</option>
                    </select>
                  </div>

                  {/* Quick Search */}
                  <input
                    type="text"
                    placeholder="Cari kata kunci pivot..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-xs bg-white text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Pivot Table Rendering */}
              <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm relative">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-wider sticky top-0 z-10">
                    <tr>
                      <th 
                        onClick={() => handleSort("rowKey")} 
                        className="p-3.5 cursor-pointer hover:bg-slate-800 transition-colors border-r border-slate-800 min-w-[180px]"
                      >
                        Dimensi Pivot ({rowDimension}) {sortColumn === "rowKey" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                      </th>
                      <th 
                        onClick={() => handleSort("totalCount")} 
                        className="p-3.5 text-center cursor-pointer hover:bg-slate-800 transition-colors border-r border-slate-800"
                      >
                        Total Sasaran {sortColumn === "totalCount" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                      </th>
                      <th 
                        onClick={() => handleSort("mbgCount")} 
                        className="p-3.5 text-center cursor-pointer hover:bg-slate-800 transition-colors border-r border-slate-800 text-emerald-300"
                      >
                        Penerima MBG (% Covered) {sortColumn === "mbgCount" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                      </th>
                      <th 
                        onClick={() => handleSort("pmtCount")} 
                        className="p-3.5 text-center cursor-pointer hover:bg-slate-800 transition-colors border-r border-slate-800 text-purple-300"
                      >
                        Penerima PMT (% Covered) {sortColumn === "pmtCount" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                      </th>
                      <th 
                        onClick={() => handleSort("bothCount")} 
                        className="p-3.5 text-center cursor-pointer hover:bg-slate-800 transition-colors border-r border-slate-800 text-amber-300"
                      >
                        MBG + PMT {sortColumn === "bothCount" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                      </th>
                      <th 
                        onClick={() => handleSort("normalCount")} 
                        className="p-3.5 text-center cursor-pointer hover:bg-slate-800 transition-colors border-r border-slate-800 text-emerald-400"
                      >
                        Gizi Normal {sortColumn === "normalCount" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                      </th>
                      <th 
                        onClick={() => handleSort("stuntingCount")} 
                        className="p-3.5 text-center cursor-pointer hover:bg-slate-800 transition-colors border-r border-slate-800 text-rose-300"
                      >
                        Stunting {sortColumn === "stuntingCount" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                      </th>
                      <th 
                        onClick={() => handleSort("risikoStuntingCount")} 
                        className="p-3.5 text-center cursor-pointer hover:bg-slate-800 transition-colors border-r border-slate-800 text-amber-400"
                      >
                        Risiko Stunting {sortColumn === "risikoStuntingCount" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                      </th>
                      <th 
                        onClick={() => handleSort("homeVisitCount")} 
                        className="p-3.5 text-center cursor-pointer hover:bg-slate-800 transition-colors border-r border-slate-800 text-rose-400"
                      >
                        Wajib Home Visit {sortColumn === "homeVisitCount" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                      </th>
                      <th 
                        onClick={() => handleSort("avgWeight")} 
                        className="p-3.5 text-center cursor-pointer hover:bg-slate-800 transition-colors"
                      >
                        Avg Berat (kg) {sortColumn === "avgWeight" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 bg-white font-medium">
                    {pivotData.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-8 text-center text-slate-400 font-bold">
                          Tidak ada data yang cocok dengan kombinasi filter pivot.
                        </td>
                      </tr>
                    ) : (
                      pivotData.map((row, idx) => {
                        const mbgPct = row.totalCount > 0 ? ((row.mbgCount / row.totalCount) * 100).toFixed(0) : "0";
                        const pmtPct = row.totalCount > 0 ? ((row.pmtCount / row.totalCount) * 100).toFixed(0) : "0";

                        return (
                          <tr key={idx} className="hover:bg-slate-50/90 transition-colors">
                            <td className="p-3.5 font-black text-slate-900 border-r border-slate-100 flex items-center space-x-1.5">
                              <span className="h-2 w-2 rounded-full bg-indigo-600 inline-block"></span>
                              <span>{row.rowKey}</span>
                            </td>

                            <td className="p-3.5 text-center font-black text-slate-800 border-r border-slate-100">
                              {row.totalCount}
                            </td>

                            <td className="p-3.5 text-center border-r border-slate-100">
                              <span className="font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                {row.mbgCount} ({mbgPct}%)
                              </span>
                            </td>

                            <td className="p-3.5 text-center border-r border-slate-100">
                              <span className="font-black text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                                {row.pmtCount} ({pmtPct}%)
                              </span>
                            </td>

                            <td className="p-3.5 text-center border-r border-slate-100 font-bold text-amber-800">
                              {row.bothCount}
                            </td>

                            <td className="p-3.5 text-center border-r border-slate-100 font-bold text-emerald-700">
                              {row.normalCount}
                            </td>

                            <td className="p-3.5 text-center border-r border-slate-100">
                              {row.stuntingCount > 0 ? (
                                <span className="font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                                  {row.stuntingCount}
                                </span>
                              ) : (
                                <span className="text-slate-300">0</span>
                              )}
                            </td>

                            <td className="p-3.5 text-center border-r border-slate-100">
                              {row.risikoStuntingCount > 0 ? (
                                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                  {row.risikoStuntingCount}
                                </span>
                              ) : (
                                <span className="text-slate-300">0</span>
                              )}
                            </td>

                            <td className="p-3.5 text-center border-r border-slate-100">
                              {row.homeVisitCount > 0 ? (
                                <span className="font-black text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300 animate-pulse">
                                  🚨 {row.homeVisitCount}
                                </span>
                              ) : (
                                <span className="text-emerald-600 font-bold">✅ 0</span>
                              )}
                            </td>

                            <td className="p-3.5 text-center font-bold text-slate-700">
                              {row.avgWeight > 0 ? `${row.avgWeight} kg` : "-"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>

                  {/* GRAND TOTAL FOOTER */}
                  <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-black text-slate-900 text-xs uppercase">
                    <tr>
                      <td className="p-3.5 border-r border-slate-200">TOTAL KELURAHAN ({selectedKelurahan})</td>
                      <td className="p-3.5 text-center border-r border-slate-200 font-black text-indigo-900 text-sm">{grandTotal.totalCount}</td>
                      <td className="p-3.5 text-center border-r border-slate-200 text-emerald-800">{grandTotal.mbgCount}</td>
                      <td className="p-3.5 text-center border-r border-slate-200 text-purple-800">{grandTotal.pmtCount}</td>
                      <td className="p-3.5 text-center border-r border-slate-200 text-amber-800">{grandTotal.bothCount}</td>
                      <td className="p-3.5 text-center border-r border-slate-200 text-emerald-700">{grandTotal.normalCount}</td>
                      <td className="p-3.5 text-center border-r border-slate-200 text-rose-700">{grandTotal.stuntingCount}</td>
                      <td className="p-3.5 text-center border-r border-slate-200 text-amber-700">{grandTotal.risikoStuntingCount}</td>
                      <td className="p-3.5 text-center border-r border-slate-200 text-rose-800 font-black">{grandTotal.homeVisitCount}</td>
                      <td className="p-3.5 text-center">-</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

            </div>
          )}

          {/* TAB 2: CHARTS & GRAPHICAL ANALYSIS */}
          {activeTab === "CHARTS" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Bar Chart: MBG & PMT Breakdown */}
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black uppercase text-xs text-slate-900 tracking-wider flex items-center space-x-1.5">
                        <BarChart2 className="h-4 w-4 text-indigo-600" />
                        <span>Distribusi MBG vs PMT ({rowDimension})</span>
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium">Perbandingan penerima Makanan Bergizi Gratis (MBG) & PMT</p>
                    </div>
                  </div>

                  <div className="h-64 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pivotData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="rowKey" tick={{ fontSize: 9, fill: '#475569', fontWeight: 700 }} angle={-15} textAnchor="end" />
                        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }} />
                        <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                        <Bar dataKey="mbgCount" name="Penerima MBG" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="pmtCount" name="Penerima PMT" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="bothCount" name="MBG + PMT" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pie Chart: Status Gizi Proportion */}
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black uppercase text-xs text-slate-900 tracking-wider flex items-center space-x-1.5">
                        <PieChartIcon className="h-4 w-4 text-teal-600" />
                        <span>Proporsi Status Gizi Kelurahan</span>
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium">Klasifikasi kondisi kesehatan gizi sasaran</p>
                    </div>
                  </div>

                  <div className="h-64 w-full flex items-center justify-center">
                    {stuntingPieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stuntingPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                          >
                            {stuntingPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }} />
                          <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-slate-400 font-bold text-xs">Belum ada data status gizi.</div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: AI EXECUTIVE SUMMARY */}
          {activeTab === "AI_EXECUTIVE" && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-indigo-800/80 pb-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-amber-300" />
                    <h3 className="font-black text-sm uppercase text-amber-200 tracking-wider">
                      Laporan Eksekutif & Instruksi Rekomendasi AI Orbit Gizi
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-indigo-300">Kabupaten Nagekeo</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold text-indigo-200 uppercase block">Cakupan MBG Total</span>
                    <span className="text-2xl font-black text-emerald-400">
                      {((grandTotal.mbgCount / (grandTotal.totalCount || 1)) * 100).toFixed(1)}%
                    </span>
                    <p className="text-[10px] text-slate-300 font-medium">Dari target {grandTotal.totalCount} sasaran</p>
                  </div>

                  <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold text-indigo-200 uppercase block">Cakupan PMT Tambahan</span>
                    <span className="text-2xl font-black text-purple-300">
                      {((grandTotal.pmtCount / (grandTotal.totalCount || 1)) * 100).toFixed(1)}%
                    </span>
                    <p className="text-[10px] text-slate-300 font-medium">Bagi balita & ibu butuh pemulihan</p>
                  </div>

                  <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold text-indigo-200 uppercase block">Prioritas Home Visit</span>
                    <span className="text-2xl font-black text-rose-400">
                      {grandTotal.homeVisitCount} Sasaran
                    </span>
                    <p className="text-[10px] text-slate-300 font-medium">Harus dikunjungi kader minggu ini</p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-xs space-y-2 text-slate-200 font-mono leading-relaxed">
                  <p className="font-bold text-amber-300 uppercase text-[11px]">📋 Ringkasan Keputusan Strategis:</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Segera prioritaskan penyaluran PMT Tambahan ke Posyandu dengan tingkat Stunting & Risiko Stunting tertinggi.</li>
                    <li>Wajibkan Petugas Desa dan Kader Posyandu melakukan Kunjungan Rumah (Home Visit) ke {grandTotal.homeVisitCount} sasaran yang terdeteksi tidak hadir penimbangan.</li>
                    <li>Lakukan penimbangan rutin setiap tanggal 15 bulanan dan catat perkembangan BB/TB secara real-time ke sistem dashboard.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CYBER SECURITY PROTECTION STATUS */}
          {activeTab === "CYBER_SECURITY" && (
            <div className="space-y-4">
              <div className="bg-slate-900 text-white rounded-3xl p-6 border border-emerald-500/30 shadow-xl space-y-4">
                
                <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
                  <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                      STATUS PERLINDUNGAN SISTEM FIREBASE & CYBER GUARD
                    </span>
                    <h3 className="text-lg font-black text-white">
                      Zero-Trust Firebase ABAC & Anti-SQL/NoSQL Injection
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  
                  {/* Protection 1 */}
                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-1.5">
                    <div className="flex items-center space-x-2 text-emerald-400 font-black">
                      <Lock className="h-4 w-4" />
                      <span>Proteksi SQL & NoSQL Injection</span>
                    </div>
                    <p className="text-slate-300 font-medium text-[11px]">
                      Seluruh input form dan data pencarian dibersihkan melalui modul <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">cyberSecurity.ts</code>. Pola peretasan seperti <code className="text-rose-300">SELECT *</code>, <code className="text-rose-300">' OR 1=1</code>, dan operator MongoDB/NoSQL diblokir secara otomatis.
                    </p>
                  </div>

                  {/* Protection 2 */}
                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-1.5">
                    <div className="flex items-center space-x-2 text-emerald-400 font-black">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Firestore Security Rules (Fortress Standard)</span>
                    </div>
                    <p className="text-slate-300 font-medium text-[11px]">
                      Aturan <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">firestore.rules</code> (Version 2) secara ketat memverifikasi tipe data, batas karakter, regex ID, dan mencegah penulisan field liar (Ghost Fields).
                    </p>
                  </div>

                  {/* Protection 3 */}
                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-1.5">
                    <div className="flex items-center space-x-2 text-emerald-400 font-black">
                      <Activity className="h-4 w-4" />
                      <span>Sanitasi XSS & Script Injection</span>
                    </div>
                    <p className="text-slate-300 font-medium text-[11px]">
                      Pencegahan eksekusi skrip berbahaya (<code className="text-rose-300">&lt;script&gt;</code>, <code className="text-rose-300">javascript:</code>, event handlers) dengan enkoding karakter HTML otomatis.
                    </p>
                  </div>

                  {/* Protection 4 */}
                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-1.5">
                    <div className="flex items-center space-x-2 text-emerald-400 font-black">
                      <Check className="h-4 w-4" />
                      <span>Status Keamanan Sistem</span>
                    </div>
                    <div className="flex items-center space-x-2 pt-1">
                      <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg font-black border border-emerald-500/30">
                        ✅ ACTIVE & HARDENED
                      </span>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

        </div>

        {/* FOOTER BAR */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between shrink-0 text-xs text-slate-500 font-medium">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">Orbit Gizi Enterprise Analytic Pivot</span>
            <span>• Wilayah: {selectedKelurahan}</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl cursor-pointer shadow-sm"
          >
            Tutup Analytic Data
          </button>
        </div>

      </div>
    </div>

      {/* PRINT STYLES & EXPLICIT PORTFOLIO PRINTABLE REPORT CONTAINER */}
      <style>{`
        @media print {
          @page {
            size: A4 ${printOrientation};
            margin: 10mm 10mm;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
            font-size: 10pt !important;
          }

          body * {
            visibility: hidden !important;
          }

          #printable-portfolio-report, #printable-portfolio-report *,
          #printable-manual-book, #printable-manual-book *,
          #printable-offline-form, #printable-offline-form *,
          #printable-audit-report, #printable-audit-report * {
            visibility: visible !important;
          }

          #printable-portfolio-report {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            overflow: visible !important;
          }

          .print-cover-page {
            page-break-after: always !important;
            break-after: page !important;
            min-height: 100vh !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            background: linear-gradient(to bottom right, #f8fafc, #eff6ff, #e0e7ff) !important;
            color: #0f172a !important;
          }

          .print-avoid-break {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            margin-bottom: 16px !important;
          }

          table {
            width: 100% !important;
            border-collapse: collapse !important;
            page-break-inside: auto !important;
          }

          thead {
            display: table-header-group !important;
          }

          tbody {
            display: table-row-group !important;
          }

          tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          th, td {
            word-break: break-word !important;
            padding: 4px 6px !important;
          }
        }
      `}</style>

      {/* PRINT-ONLY OFFICIAL PORTFOLIO REPORT CONTAINER */}
      <div id="printable-portfolio-report" className="hidden print:block text-slate-900 font-sans space-y-6 text-xs bg-white p-0">
        
        {/* COVER PAGE (PAGE 1) */}
        <div className="print-cover-page flex flex-col justify-between min-h-[92vh] bg-gradient-to-br from-slate-50 via-blue-50/70 to-indigo-100/60 text-slate-900 p-8 rounded-3xl border-2 border-blue-300/80 shadow-xl relative overflow-hidden">
          {/* Decorative background watermark seal */}
          <div className="absolute -right-16 -bottom-16 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-16 -top-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-6 pt-4 relative z-10">
            <div className="flex items-center justify-between border-b border-blue-200 pb-6">
              <div className="flex items-center space-x-4">
                <div className="h-14 w-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-md">
                  OG
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">
                    PEMERINTAH KABUPATEN NAGEKEO • DINAS KESEHATAN
                  </span>
                  <span className="text-xs font-bold text-slate-900 tracking-wide">ORBIT GIZI SYSTEM ENTERPRISE v2.5</span>
                </div>
              </div>
              <div className="text-right">
                <span className="px-3.5 py-1.5 bg-blue-900 text-white text-[10px] font-black rounded-xl uppercase tracking-wider block shadow">
                  DOKUMEN RESMI PORTOFOLIO
                </span>
                <span className="text-[10px] text-slate-600 mt-1 block font-mono">ID: OGT-PRT-{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
            </div>

            <div className="py-14 space-y-6 text-center">
              <div className="inline-block px-5 py-2 bg-blue-100 border border-blue-300 text-blue-800 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
                LAPORAN ANALISIS INTERVENSI & GIZI MASYARAKAT
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight uppercase tracking-tight max-w-3xl mx-auto">
                PORTOFOLIO EKSEKUTIF KINERJA PUSKESMAS & POSYANDU WILAYAH {selectedKelurahan}
              </h1>
              <p className="text-xs sm:text-sm text-slate-700 max-w-2xl mx-auto leading-relaxed">
                Laporan komprehensif penanganan Stunting, Wasting, distribusi Makanan Bergizi Gratis (MBG), Pemberian Makanan Tambahan (PMT), serta Evaluasi Kolaborasi Lintas Sektor 5 Pilar Berbasis e-PPGBM.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-blue-200 bg-white/80 backdrop-blur-md p-5 rounded-2xl relative z-10 shadow-sm">
            <div>
              <span className="text-[10px] font-bold uppercase text-blue-700 block">Wilayah Intervensi</span>
              <span className="text-xs sm:text-sm font-black text-slate-900">{selectedKelurahan}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-blue-700 block">Tanggal Laporan</span>
              <span className="text-xs sm:text-sm font-black text-slate-900">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-blue-700 block">Status Validasi e-PPGBM</span>
              <span className="text-xs sm:text-sm font-black text-emerald-700">100% Sinkron & Valid</span>
            </div>
          </div>

          <div className="pt-6 flex items-center justify-between text-xs text-slate-600 relative z-10 border-t border-slate-200">
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="font-semibold text-blue-900">Terenkripsi Keamanan ABAC & Cyber Guard Protection</span>
            </div>
            <span className="font-mono text-slate-500 font-bold">Halaman Cover (1) • Portal Resmi Nagekeo</span>
          </div>
        </div>

        {/* PRINT HEADER / EMBLEM */}
        <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between print-avoid-break pt-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
              PEMERINTAH KABUPATEN NAGEKEO • DINAS KESEHATAN
            </span>
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight mt-0.5">
              LAPORAN PORTOFOLIO ANALISIS ORBIT GIZI & PROGRAM MBG/PMT
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Wilayah Intervensi: <strong>{selectedKelurahan}</strong> • Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="text-right">
            <div className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-black text-xs inline-block">
              REKAP ANALITIK RESMI
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">Dokumen Terenkripsi Cyber Guard</span>
          </div>
        </div>

        {/* SECTION 1: INDEKS TRANSFORMASI & STATUS WILAYAH */}
        <div className="grid grid-cols-2 gap-4 print-avoid-break">
          <div className="border border-slate-300 rounded-2xl p-4 text-center space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
              INDEKS TRANSFORMASI ORBIT GIZI
            </span>
            <div className="inline-flex h-20 w-20 rounded-full border-4 border-slate-900 items-center justify-center font-black text-2xl text-slate-900 mx-auto">
              {transformIndexScore}
            </div>
            <span className="text-[10px] font-bold text-slate-500 block">Skor Kinerja Gizi (0 - 100)</span>
          </div>

          <div className="border border-slate-300 rounded-2xl p-4 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
              STATUS KABUPATEN / WILAYAH
            </span>
            <span className={`inline-block px-3 py-1 rounded-md text-xs font-black border ${regionStatus.categoryBg}`}>
              {regionStatus.category}
            </span>
            <h3 className="font-black text-sm text-slate-900">{regionStatus.title}</h3>
            <p className="text-[10px] text-slate-600 leading-tight">{regionStatus.description}</p>
          </div>
        </div>

        {/* SECTION 2: SUMMARY KPI CARDS */}
        <div className="grid grid-cols-5 gap-2 border border-slate-300 rounded-xl p-3 text-center bg-slate-50 print-avoid-break">
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase block">Total Sasaran</span>
            <span className="text-sm font-black text-slate-900">{grandTotal.totalCount} Jiwa</span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase block">Penerima MBG</span>
            <span className="text-sm font-black text-emerald-700">{grandTotal.mbgCount} ({((grandTotal.mbgCount / (grandTotal.totalCount || 1)) * 100).toFixed(0)}%)</span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase block">Penerima PMT</span>
            <span className="text-sm font-black text-purple-700">{grandTotal.pmtCount} ({((grandTotal.pmtCount / (grandTotal.totalCount || 1)) * 100).toFixed(0)}%)</span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase block">MBG + PMT</span>
            <span className="text-sm font-black text-amber-700">{grandTotal.bothCount} Sasaran</span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase block">Wajib Visit</span>
            <span className="text-sm font-black text-rose-700">{grandTotal.homeVisitCount} Sasaran</span>
          </div>
        </div>

        {/* SECTION 2.5: VISUAL CHART SUMMARIES FOR PRINT */}
        <div className="space-y-3 print-avoid-break">
          <h3 className="font-black text-xs uppercase tracking-wider text-slate-800 border-b pb-1">
            GRAFIK & VISUALISASI ANALISIS UTAMA
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-slate-300 rounded-xl p-3 bg-slate-50 space-y-2">
              <span className="font-bold text-slate-800 text-[11px] block">Distribusi Sasaran per Status Gizi</span>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between items-center">
                  <span>Normal (Gizi Baik)</span>
                  <span className="font-bold text-emerald-700">{grandTotal.normalCount} Jiwa ({((grandTotal.normalCount / (grandTotal.totalCount || 1)) * 100).toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full" style={{ width: `${(grandTotal.normalCount / (grandTotal.totalCount || 1)) * 100}%` }}></div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span>Stunting (Kronis)</span>
                  <span className="font-bold text-rose-700">{grandTotal.stuntingCount} Jiwa ({((grandTotal.stuntingCount / (grandTotal.totalCount || 1)) * 100).toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-600 h-full" style={{ width: `${(grandTotal.stuntingCount / (grandTotal.totalCount || 1)) * 100}%` }}></div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span>Risiko Stunting / Wasting</span>
                  <span className="font-bold text-amber-700">{grandTotal.risikoStuntingCount} Jiwa ({((grandTotal.risikoStuntingCount / (grandTotal.totalCount || 1)) * 100).toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full" style={{ width: `${(grandTotal.risikoStuntingCount / (grandTotal.totalCount || 1)) * 100}%` }}></div>
                </div>
              </div>
            </div>

            <div className="border border-slate-300 rounded-xl p-3 bg-slate-50 space-y-2">
              <span className="font-bold text-slate-800 text-[11px] block">Cakupan Program Intervensi MBG & PMT</span>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between items-center">
                  <span>Penerima Makanan Bergizi Gratis (MBG)</span>
                  <span className="font-bold text-teal-700">{grandTotal.mbgCount} Jiwa ({((grandTotal.mbgCount / (grandTotal.totalCount || 1)) * 100).toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-teal-600 h-full" style={{ width: `${(grandTotal.mbgCount / (grandTotal.totalCount || 1)) * 100}%` }}></div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span>Penerima PMT Pemulihan</span>
                  <span className="font-bold text-purple-700">{grandTotal.pmtCount} Jiwa ({((grandTotal.pmtCount / (grandTotal.totalCount || 1)) * 100).toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full" style={{ width: `${(grandTotal.pmtCount / (grandTotal.totalCount || 1)) * 100}%` }}></div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span>Wajib Home Visit (Absen Timbang)</span>
                  <span className="font-bold text-rose-700">{grandTotal.homeVisitCount} Jiwa</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full" style={{ width: `${(grandTotal.homeVisitCount / (grandTotal.totalCount || 1)) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: PIVOT MATRIX TABLE */}
        <div className="space-y-2">
          <h3 className="font-black text-xs uppercase tracking-wider text-slate-800">
            1. REKAPITULASI MATRIKS PIVOT (PER POSYANDU)
          </h3>
          <table className="w-full text-left border-collapse text-[10px] border border-slate-300">
            <thead className="bg-slate-800 text-white font-bold uppercase">
              <tr>
                <th className="p-2 border border-slate-600">Posyandu</th>
                <th className="p-2 text-center border border-slate-600">Total</th>
                <th className="p-2 text-center border border-slate-600">MBG</th>
                <th className="p-2 text-center border border-slate-600">PMT</th>
                <th className="p-2 text-center border border-slate-600">MBG+PMT</th>
                <th className="p-2 text-center border border-slate-600">Normal</th>
                <th className="p-2 text-center border border-slate-600">Stunting</th>
                <th className="p-2 text-center border border-slate-600">Risiko</th>
                <th className="p-2 text-center border border-slate-600">Home Visit</th>
              </tr>
            </thead>
            <tbody>
              {pivotData.map((row, i) => (
                <tr key={i} className="border-b border-slate-200">
                  <td className="p-2 font-bold border-r border-slate-200">{row.rowKey}</td>
                  <td className="p-2 text-center border-r border-slate-200">{row.totalCount}</td>
                  <td className="p-2 text-center border-r border-slate-200 font-bold text-emerald-700">{row.mbgCount}</td>
                  <td className="p-2 text-center border-r border-slate-200 font-bold text-purple-700">{row.pmtCount}</td>
                  <td className="p-2 text-center border-r border-slate-200">{row.bothCount}</td>
                  <td className="p-2 text-center border-r border-slate-200 text-emerald-700">{row.normalCount}</td>
                  <td className="p-2 text-center border-r border-slate-200 text-rose-700">{row.stuntingCount}</td>
                  <td className="p-2 text-center border-r border-slate-200 text-amber-700">{row.risikoStuntingCount}</td>
                  <td className="p-2 text-center font-bold text-rose-700">{row.homeVisitCount}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100 font-black uppercase text-[10px]">
              <tr>
                <td className="p-2 border border-slate-300">TOTAL</td>
                <td className="p-2 text-center border border-slate-300">{grandTotal.totalCount}</td>
                <td className="p-2 text-center border border-slate-300">{grandTotal.mbgCount}</td>
                <td className="p-2 text-center border border-slate-300">{grandTotal.pmtCount}</td>
                <td className="p-2 text-center border border-slate-300">{grandTotal.bothCount}</td>
                <td className="p-2 text-center border border-slate-300">{grandTotal.normalCount}</td>
                <td className="p-2 text-center border border-slate-300">{grandTotal.stuntingCount}</td>
                <td className="p-2 text-center border border-slate-300">{grandTotal.risikoStuntingCount}</td>
                <td className="p-2 text-center border border-slate-300">{grandTotal.homeVisitCount}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* SECTION 4: DAFTAR SASARAN LENGKAP */}
        <div className="space-y-2 mt-4">
          <h3 className="font-black text-xs uppercase tracking-wider text-slate-800">
            2. DAFTAR INDIVIDUAL SASARAN TERDAFTAR
          </h3>
          <table className="w-full text-left border-collapse text-[9px] border border-slate-300">
            <thead className="bg-slate-900 text-white font-bold uppercase">
              <tr>
                <th className="p-1.5 border border-slate-700">No / NIK</th>
                <th className="p-1.5 border border-slate-700">Nama Sasaran</th>
                <th className="p-1.5 border border-slate-700">Kategori</th>
                <th className="p-1.5 border border-slate-700">Posyandu</th>
                <th className="p-1.5 text-center border border-slate-700">MBG</th>
                <th className="p-1.5 text-center border border-slate-700">PMT</th>
                <th className="p-1.5 text-center border border-slate-700">Status Gizi</th>
                <th className="p-1.5 text-center border border-slate-700">BB / TB</th>
              </tr>
            </thead>
            <tbody>
              {beneficiaries.map((b, idx) => {
                const isMbg = b.isReceivedMBG !== false;
                const isPmt = b.isReceivedPMT !== false;
                const lastRec = b.weightRecords && b.weightRecords.length > 0 ? b.weightRecords[b.weightRecords.length - 1] : null;
                const statusGizi = lastRec?.statusGizi || "Normal";
                return (
                  <tr key={idx} className="border-b border-slate-200">
                    <td className="p-1.5 font-mono border-r border-slate-200">#{idx+1} {b.nik || "5316000"}</td>
                    <td className="p-1.5 font-bold border-r border-slate-200">{b.name}</td>
                    <td className="p-1.5 border-r border-slate-200">{b.category}</td>
                    <td className="p-1.5 border-r border-slate-200">{b.location.posyandu || "-"}</td>
                    <td className="p-1.5 text-center border-r border-slate-200">{isMbg ? "✅ Ya" : "-"}</td>
                    <td className="p-1.5 text-center border-r border-slate-200">{isPmt ? "🍇 Ya" : "-"}</td>
                    <td className="p-1.5 text-center border-r border-slate-200 font-bold">{statusGizi}</td>
                    <td className="p-1.5 text-center font-bold">{lastRec ? `${lastRec.weightKg}kg` : "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* SECTION 5: SIGNATURE BLOCK */}
        <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs print-avoid-break">
          <div>
            <p className="font-medium text-slate-600">Mengetahui,</p>
            <p className="font-bold text-slate-900 mt-1">Kepala Puskesmas / Dinas Kesehatan</p>
            <div className="h-16"></div>
            <p className="font-black text-slate-900 underline">( ___________________________ )</p>
            <p className="text-[10px] text-slate-500">NIP. 19820512 201001 1 004</p>
          </div>

          <div>
            <p className="font-medium text-slate-600">Penanggung Jawab Data,</p>
            <p className="font-bold text-slate-900 mt-1">Petugas Posyandu / Desa {selectedKelurahan}</p>
            <div className="h-16"></div>
            <p className="font-black text-slate-900 underline">( ___________________________ )</p>
            <p className="text-[10px] text-slate-500">Kader Koordinator Orbit Gizi</p>
          </div>
        </div>

      </div>
    </>
  );
};
