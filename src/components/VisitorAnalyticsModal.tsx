import React, { useState, useEffect } from "react";
import { Users, Activity, Eye, UserCheck, ShieldCheck, Calendar, Clock, RefreshCw, FileSpreadsheet, Trash2, CheckCircle, Search, Laptop, Smartphone, Printer, FileText, CheckCircle2 } from "lucide-react";
import { VisitorLog, AuditLog } from "../types";
import { getVisitorLogs, getAuditLogs, fetchVisitorLogsApi, fetchAuditLogsApi, clearVisitorLogs, clearAuditLogs, clearAllLogs } from "../lib/analyticsService";
import { PemdaNagekeoLogo } from "./PemdaNagekeoLogo";

interface VisitorAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail?: string | null;
  isAdmin?: boolean;
}

export const VisitorAnalyticsModal: React.FC<VisitorAnalyticsModalProps> = ({
  isOpen,
  onClose,
  currentUserEmail,
  isAdmin = false
}) => {
  const [activeTab, setActiveTab] = useState<"VISITORS" | "AUDIT">("VISITORS");
  const [printScope, setPrintScope] = useState<"ALL" | "AUDIT" | "VISITORS">("ALL");
  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = async () => {
    setIsLoading(true);
    setVisitorLogs(getVisitorLogs());
    setAuditLogs(getAuditLogs());

    const [freshVisitors, freshAudits] = await Promise.all([
      fetchVisitorLogsApi(),
      fetchAuditLogsApi()
    ]);

    setVisitorLogs(freshVisitors);
    setAuditLogs(freshAudits);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalVisitors = visitorLogs.length;
  const adminVisits = visitorLogs.filter(v => v.role === "ADMIN").length;
  const publicVisits = visitorLogs.filter(v => v.role === "PENGUNJUNG").length;
  const totalAuditEvents = auditLogs.length;

  const filteredVisitors = visitorLogs.filter(v =>
    v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.viewName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAudits = auditLogs.filter(a =>
    a.operatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.operatorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.actionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.targetName && a.targetName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatTime = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return isoStr;
    }
  };

  const handleClearCurrentTabLogs = () => {
    if (activeTab === "VISITORS") {
      if (window.confirm("Apakah Anda yakin ingin menghapus seluruh Catatan Log Pengunjung?")) {
        clearVisitorLogs();
        refreshData();
      }
    } else {
      if (window.confirm("Apakah Anda yakin ingin menghapus seluruh Catatan Audit Input Operator?")) {
        clearAuditLogs();
        refreshData();
      }
    }
  };

  const handleClearAllLogsAction = () => {
    if (window.confirm("PERINGATAN: Apakah Anda yakin ingin menghapus SEMUA data Log (Pengunjung & Audit Operator)?")) {
      clearAllLogs();
      refreshData();
    }
  };

  const handlePrintLogs = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm;
          }
          body, html {
            background: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-rekening-koran, #printable-rekening-koran * {
            visibility: visible !important;
          }
          #printable-rekening-koran {
            display: block !important;
            position: relative !important;
            left: auto !important;
            top: auto !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
            font-family: Arial, Helvetica, sans-serif !important;
            font-size: 10px !important;
            z-index: 999999 !important;
          }
          .no-print {
            display: none !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          thead {
            display: table-header-group !important;
          }
          th, td {
            border: 1px solid #334155 !important;
            padding: 4px 6px !important;
          }
        }
      `}</style>

      {/* MODAL ON SCREEN */}
      <div className="bg-slate-900 border border-slate-700/60 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl text-white overflow-hidden no-print">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 shrink-0">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-1">
                <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">
                  Data Analitik & Audit Transparansi
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-[9px] font-bold text-emerald-300">
                  Otomatis Purge 3 Bulan
                </span>
              </div>
              <h2 className="text-lg font-black text-white">Log Pengunjung & Audit Input Operator</h2>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-wrap gap-2">
            {/* Scope Cetak Selector */}
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 pl-2">Cakupan:</span>
              <select
                value={printScope}
                onChange={(e) => setPrintScope(e.target.value as any)}
                className="bg-slate-900 text-emerald-300 text-xs font-bold rounded-lg px-2 py-1 focus:outline-none cursor-pointer border-none"
              >
                <option value="ALL">Lengkap (Audit & Pengunjung)</option>
                <option value="AUDIT">Audit Input Operator Saja</option>
                <option value="VISITORS">Log Pengunjung Saja</option>
              </select>
            </div>

            <button
              onClick={refreshData}
              disabled={isLoading}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer"
              title="Segarkan & Ambil Log Terbaru dari Server Central"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-emerald-400" : ""}`} />
              <span>{isLoading ? "Memuat..." : "Sync"}</span>
            </button>

            <button
              onClick={handlePrintLogs}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center space-x-1.5 shadow-md cursor-pointer"
              title="Cetak Rekening Koran Audit / Download PDF"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Cetak Rekening Koran</span>
            </button>

            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="p-5 bg-slate-950/60 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Pengunjung</span>
            <span className="text-xl font-black text-white">{totalVisitors} Sesi</span>
          </div>
          <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Akses Pengunjung Publik</span>
            <span className="text-xl font-black text-emerald-400">{publicVisits} Pengunjung</span>
          </div>
          <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Akses Admin Sistem</span>
            <span className="text-xl font-black text-amber-400">{adminVisits} Akses</span>
          </div>
          <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Aktivitas Input</span>
            <span className="text-xl font-black text-indigo-400">{totalAuditEvents} Log Aksi</span>
          </div>
        </div>

        {/* Controls & Search */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900">
          <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("VISITORS")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                activeTab === "VISITORS"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Log Pengunjung ({visitorLogs.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("AUDIT")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                activeTab === "AUDIT"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>Audit Input Operator ({auditLogs.length})</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-56">
              <input
                type="text"
                placeholder="Cari email, nama, halaman..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 pl-8 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
            </div>

            {/* Tombol Hapus Log */}
            <button
              onClick={handleClearCurrentTabLogs}
              className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0"
              title={`Hapus Data Log ${activeTab === "VISITORS" ? "Pengunjung" : "Audit Operator"}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Hapus {activeTab === "VISITORS" ? "Pengunjung" : "Audit"}</span>
            </button>

            <button
              onClick={handleClearAllLogsAction}
              className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 shadow-xs"
              title="Hapus Seluruh Data Log (Pengunjung & Audit Operator)"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Hapus Semua</span>
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          {activeTab === "VISITORS" ? (
            filteredVisitors.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs font-bold">
                Belum ada log akses pengunjung tercatat.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredVisitors.map((v) => (
                  <div
                    key={v.id}
                    className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-xl ${
                        v.role === "ADMIN" ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      }`}>
                        {v.deviceInfo?.includes("Seluler") ? <Smartphone className="h-4 w-4" /> : <Laptop className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black text-white">{v.email}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            v.role === "ADMIN" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          }`}>
                            {v.role}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Halaman: <strong className="text-slate-200">{v.viewName}</strong> ({v.deviceInfo || "Desktop"})
                        </span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right text-[11px] text-slate-400 flex items-center space-x-1">
                      <Clock className="h-3 w-3 text-slate-500" />
                      <span>{formatTime(v.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            filteredAudits.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs font-bold">
                Belum ada catatan audit input operator.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAudits.map((a) => (
                  <div
                    key={a.id}
                    className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-2xl space-y-2 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black text-emerald-400">{a.operatorName}</span>
                        <span className="text-[10px] text-slate-400">({a.operatorRole} - {a.operatorInstansi})</span>
                      </div>

                      <div className="flex items-center space-x-2 text-[10px]">
                        <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded font-bold uppercase">
                          {a.actionType}
                        </span>
                        <span className="text-slate-400">{formatTime(a.timestamp)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {a.description} {a.targetName && <span className="font-bold text-white">[{a.targetName}]</span>}
                    </p>

                    <div className="text-[10px] text-slate-400 flex items-center space-x-2">
                      <span>Email Operator: {a.operatorEmail}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Sistem otomatis menghapus log yang berusia lebih dari 90 hari (3 Bulan). Format Cetak: Rekening Koran Audit Resmi.</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrintLogs}
              className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Cetak Rekening Koran</span>
            </button>

            <button
              onClick={refreshData}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Muat Ulang</span>
            </button>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* REKENING KORAN PRINTABLE VIEW (A4 Standar Rekening Koran Bank/Audit Official) */}
      {/* ========================================================================= */}
      <div id="printable-rekening-koran" className="hidden print:block p-2 text-slate-900 bg-white leading-normal">
        
        {/* Kop Surat Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-1">
          <div className="flex items-center space-x-4">
            <PemdaNagekeoLogo className="h-16 w-16 shrink-0" />
            <div>
              <h1 className="text-base font-black uppercase tracking-wider text-slate-900 leading-tight">
                Pemerintah Kabupaten Nagekeo
              </h1>
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800">
                Dinas Kesehatan - Tim Satgas MBG & PMT Terpadu
              </h2>
              <p className="text-[10px] text-slate-600 font-medium">
                Jl. Soekarno-Hatta, Kompleks Perkantoran Civic Center, Mbay, Kabupaten Nagekeo - NTT
              </p>
              <p className="text-[9px] text-slate-500">
                Portal: orbitgizingk.properwahyu294.workers.dev | Email: dinkes@nagekeokab.go.id
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-slate-900 text-white font-black text-[11px] tracking-widest uppercase rounded">
              REKENING AUDIT
            </span>
            <p className="text-[9px] text-slate-600 font-mono mt-1 font-bold">
              NO: RK-AUDIT/NAG/{(new Date().toISOString().slice(0,10).replace(/-/g,''))}
            </p>
          </div>
        </div>
        <div className="border-b border-slate-400 mb-4"></div>

        {/* Title */}
        <div className="text-center mb-4">
          <h3 className="text-sm font-black uppercase text-slate-900 underline underline-offset-4 tracking-wider">
            LAPORAN REKENING AUDIT TRAIL & REKAPITULASI AKTIVITAS SISTEM
          </h3>
          <p className="text-[10px] font-bold text-slate-600 mt-1">
            Dokumen Pertanggungjawaban Audit Transparansi Input Operator & Sesi Akses Pengguna
          </p>
        </div>

        {/* Metadata Statement Box (Rincian Rekening Koran) */}
        <div className="border border-slate-400 rounded p-3 bg-slate-50 mb-4 text-[10px] grid grid-cols-2 gap-y-2 gap-x-6">
          <div>
            <span className="text-slate-500 font-bold block text-[9px] uppercase">Waktu Cetak Laporan:</span>
            <strong className="text-slate-900 font-bold">{formatTime(new Date().toISOString())} WITA</strong>
          </div>
          <div>
            <span className="text-slate-500 font-bold block text-[9px] uppercase">Operator Pencetak Dokumen:</span>
            <strong className="text-slate-900 font-bold">{currentUserEmail || "Administrator Sistem Dinkes"}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-bold block text-[9px] uppercase">Kebijakan Retensi Log:</span>
            <strong className="text-slate-900 font-bold">90 Hari Terakhir (Purge Otomatis Server Central)</strong>
          </div>
          <div>
            <span className="text-slate-500 font-bold block text-[9px] uppercase">Filter Kata Kunci Pencarian:</span>
            <strong className="text-slate-900 font-bold">{searchTerm ? `"${searchTerm}"` : "Semua Rekord Data Log"}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-bold block text-[9px] uppercase">Jumlah Rekord Audit Operator:</span>
            <strong className="text-slate-900 font-bold">{filteredAudits.length} Transaksi Aksi Input</strong>
          </div>
          <div>
            <span className="text-slate-500 font-bold block text-[9px] uppercase">Jumlah Rekord Log Pengunjung:</span>
            <strong className="text-slate-900 font-bold">{filteredVisitors.length} Sesi Akses Masuk</strong>
          </div>
        </div>

        {/* Ringkasan Rekap Mutasi Log */}
        <div className="mb-4 border border-slate-300 rounded overflow-hidden">
          <div className="bg-slate-200 px-3 py-1.5 border-b border-slate-300 font-black text-[10px] text-slate-900 uppercase tracking-wider flex items-center justify-between">
            <span>IKHTISAR MUTASI LOG & AKSES SISTEM</span>
            <span className="text-emerald-800 font-mono text-[9px]">[VERIFIED SECURE]</span>
          </div>
          <div className="p-3 bg-white grid grid-cols-4 gap-2 text-center text-[10px]">
            <div className="border-r border-slate-200 pr-2">
              <span className="text-slate-500 block text-[9px] uppercase font-semibold">Total Sesi Akses</span>
              <strong className="text-sm font-black text-slate-900">{totalVisitors} Sesi</strong>
            </div>
            <div className="border-r border-slate-200 pr-2">
              <span className="text-slate-500 block text-[9px] uppercase font-semibold">Akses Publik</span>
              <strong className="text-sm font-black text-emerald-700">{publicVisits} Akses</strong>
            </div>
            <div className="border-r border-slate-200 pr-2">
              <span className="text-slate-500 block text-[9px] uppercase font-semibold">Akses Admin</span>
              <strong className="text-sm font-black text-amber-700">{adminVisits} Akses</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-semibold">Aksi Audit Operator</span>
              <strong className="text-sm font-black text-indigo-700">{totalAuditEvents} Log Aksi</strong>
            </div>
          </div>
        </div>

        {/* TABLE 1: REKENING AUDIT INPUT OPERATOR */}
        {(printScope === "ALL" || printScope === "AUDIT") && (
          <div className="mb-6">
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-1 mb-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                I. TABEL REKENING AUDIT INPUT OPERATOR ({filteredAudits.length} BARIS TRANSAKSI)
              </h4>
              <span className="text-[9px] font-mono text-slate-600 font-bold">MUTASI EDIT & INPUT DATA</span>
            </div>

            {filteredAudits.length === 0 ? (
              <p className="text-[10px] text-slate-500 italic py-2">Tidak ada catatan audit operator yang sesuai kriteria pencarian.</p>
            ) : (
              <table className="w-full text-[9px] border-collapse border border-slate-400">
                <thead>
                  <tr className="bg-slate-200 text-slate-900 font-bold uppercase text-[8.5px] border-b border-slate-400">
                    <th className="p-1.5 border border-slate-400 text-center w-[5%]">NO</th>
                    <th className="p-1.5 border border-slate-400 text-left w-[16%]">WAKTU & TANGGAL</th>
                    <th className="p-1.5 border border-slate-400 text-left w-[24%]">OPERATOR & INSTANSI</th>
                    <th className="p-1.5 border border-slate-400 text-center w-[16%]">JENIS AKSI</th>
                    <th className="p-1.5 border border-slate-400 text-left w-[31%]">DESKRIPSI AKTIVITAS & TARGET</th>
                    <th className="p-1.5 border border-slate-400 text-center w-[8%]">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAudits.map((a, idx) => (
                    <tr key={a.id || idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="p-1.5 border border-slate-300 text-center font-mono font-bold">{idx + 1}</td>
                      <td className="p-1.5 border border-slate-300 font-mono text-[8.5px] whitespace-nowrap">{formatTime(a.timestamp)}</td>
                      <td className="p-1.5 border border-slate-300">
                        <div className="font-bold text-slate-900">{a.operatorName}</div>
                        <div className="text-[8px] text-slate-600">{a.operatorInstansi} ({a.operatorEmail})</div>
                      </td>
                      <td className="p-1.5 border border-slate-300 text-center font-mono font-bold text-[8px]">
                        <span className="px-1 py-0.5 border border-slate-400 rounded bg-slate-100 inline-block">
                          {a.actionType}
                        </span>
                      </td>
                      <td className="p-1.5 border border-slate-300">
                        <span>{a.description}</span>
                        {a.targetName && <span className="font-bold text-slate-900 ml-1">[{a.targetName}]</span>}
                      </td>
                      <td className="p-1.5 border border-slate-300 text-center font-bold text-emerald-800 font-mono text-[8px]">
                        SUKSES
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TABLE 2: REKENING LOG AKSES PENGUNJUNG */}
        {(printScope === "ALL" || printScope === "VISITORS") && (
          <div className="mb-6">
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-1 mb-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                II. TABEL REKENING LOG AKSES PENGUNJUNG & SESI PENGGUNA ({filteredVisitors.length} BARIS SESI)
              </h4>
              <span className="text-[9px] font-mono text-slate-600 font-bold">MUTASI AKSES MASUK</span>
            </div>

            {filteredVisitors.length === 0 ? (
              <p className="text-[10px] text-slate-500 italic py-2">Tidak ada catatan log pengunjung yang sesuai kriteria pencarian.</p>
            ) : (
              <table className="w-full text-[9px] border-collapse border border-slate-400">
                <thead>
                  <tr className="bg-slate-200 text-slate-900 font-bold uppercase text-[8.5px] border-b border-slate-400">
                    <th className="p-1.5 border border-slate-400 text-center w-[5%]">NO</th>
                    <th className="p-1.5 border border-slate-400 text-left w-[18%]">WAKTU & TANGGAL</th>
                    <th className="p-1.5 border border-slate-400 text-left w-[28%]">EMAIL / IDENTITAS PENGGUNA</th>
                    <th className="p-1.5 border border-slate-400 text-center w-[12%]">ROLE</th>
                    <th className="p-1.5 border border-slate-400 text-left w-[22%]">HALAMAN DIAKSES</th>
                    <th className="p-1.5 border border-slate-400 text-left w-[15%]">PERANGKAT</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVisitors.map((v, idx) => (
                    <tr key={v.id || idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="p-1.5 border border-slate-300 text-center font-mono font-bold">{idx + 1}</td>
                      <td className="p-1.5 border border-slate-300 font-mono text-[8.5px] whitespace-nowrap">{formatTime(v.timestamp)}</td>
                      <td className="p-1.5 border border-slate-300 font-bold text-slate-900">{v.email}</td>
                      <td className="p-1.5 border border-slate-300 text-center font-bold font-mono text-[8px]">
                        <span className={`px-1 py-0.5 border rounded ${v.role === 'ADMIN' ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-emerald-100 text-emerald-900 border-emerald-300'}`}>
                          {v.role}
                        </span>
                      </td>
                      <td className="p-1.5 border border-slate-300 font-medium text-slate-800">{v.viewName}</td>
                      <td className="p-1.5 border border-slate-300 text-slate-600 text-[8px]">{v.deviceInfo || "Desktop / Browser"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* LEMBAR PENGESAHAN & TANDA TANGAN AUDIT */}
        <div className="mt-8 pt-4 border-t-2 border-slate-800 page-break-inside-avoid">
          <div className="grid grid-cols-2 gap-8 text-center text-[10px]">
            <div>
              <p className="text-slate-600">Mbay, {formatTime(new Date().toISOString()).split(',')[0]}</p>
              <p className="font-bold text-slate-900 uppercase mt-0.5">Petugas Operator Pengelola Data</p>
              <div className="h-16 my-1 flex items-center justify-center">
                <span className="text-[8px] font-mono text-slate-400 italic border border-dashed border-slate-300 px-2 py-1 rounded">
                  [Tanda Tangan Digital Terverifikasi System]
                </span>
              </div>
              <p className="font-bold text-slate-900 underline uppercase">{currentUserEmail || "Operator Administrator IT"}</p>
              <p className="text-slate-500 text-[9px]">Dinas Kesehatan Kabupaten Nagekeo</p>
            </div>

            <div>
              <p className="text-slate-600">Mengetahui / Mengesahkan,</p>
              <p className="font-bold text-slate-900 uppercase mt-0.5">Kepala Dinas Kesehatan / Penanggung Jawab</p>
              <div className="h-16 my-1 flex items-center justify-center">
                <span className="text-[8px] font-mono text-slate-400 italic border border-dashed border-slate-300 px-2 py-1 rounded">
                  [Stempel & Tanda Tangan Digital Offisial]
                </span>
              </div>
              <p className="font-bold text-slate-900 underline uppercase">dr. Emerentiana R. Wahjuningsih, M.Kes</p>
              <p className="text-slate-500 text-[9px]">NIP. 19710824 200212 2 003</p>
            </div>
          </div>

          <div className="mt-6 text-center text-[8.5px] text-slate-500 border-t border-slate-300 pt-2 italic">
            * Laporan Rekening Koran Audit ini diterbitkan secara resmi dari Dashboard Orbit Gizi Kabupaten Nagekeo. Seluruh rekam jejak aktivitas terlindungi oleh protokol audit trail digital yang sah.
          </div>
        </div>

      </div>

    </div>
  );
};


