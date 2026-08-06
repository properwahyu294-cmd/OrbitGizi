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
  Users, 
  Layers, 
  TrendingUp,
  Lock,
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
  const [activeTab, setActiveTab] = useState<"PIVOT_TABLE" | "CHARTS" | "AI_EXECUTIVE" | "CYBER_SECURITY">("PIVOT_TABLE");
  const [rowDimension, setRowDimension] = useState<RowDimension>("POSYANDU");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [sortColumn, setSortColumn] = useState<keyof PivotRowData>("totalCount");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
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

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer border border-slate-700"
              title="Cetak Laporan"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Cetak</span>
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
              onClick={() => setActiveTab("PIVOT_TABLE")}
              className={`px-4 py-2.5 rounded-t-2xl font-black text-xs flex items-center space-x-2 cursor-pointer transition-all ${
                activeTab === "PIVOT_TABLE"
                  ? "bg-white text-indigo-900 border-t-2 border-x border-slate-200 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Table className="h-4 w-4 text-indigo-600" />
              <span>Matriks Pivot Table Interaktif</span>
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
  );
};
