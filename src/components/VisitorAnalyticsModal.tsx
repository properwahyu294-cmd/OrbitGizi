import React, { useState, useEffect } from "react";
import { Users, Activity, Eye, UserCheck, ShieldCheck, Calendar, Clock, RefreshCw, FileSpreadsheet, Trash2, CheckCircle, Search, Laptop, Smartphone, Printer } from "lucide-react";
import { VisitorLog, AuditLog } from "../types";
import { getVisitorLogs, getAuditLogs, recordVisitorAccess, clearVisitorLogs, clearAuditLogs, clearAllLogs } from "../lib/analyticsService";

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
  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const refreshData = () => {
    setVisitorLogs(getVisitorLogs());
    setAuditLogs(getAuditLogs());
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
          body * {
            visibility: hidden;
          }
          #printable-log-container, #printable-log-container * {
            visibility: visible;
          }
          #printable-log-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            color: #000 !important;
            background: #fff !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div id="printable-log-container" className="bg-slate-900 border border-slate-700/60 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl text-white overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
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

          <div className="flex items-center space-x-2 no-print">
            <button
              onClick={handlePrintLogs}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center space-x-1.5 shadow-md cursor-pointer"
              title="Cetak Laporan Log / Unduh PDF"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Cetak Log</span>
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
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 no-print">
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
              <span>Hapus Semua Log</span>
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
            <span>Sistem otomatis menghapus log yang berusia lebih dari 90 hari (3 Bulan).</span>
          </div>

          <div className="flex items-center space-x-2 no-print">
            <button
              onClick={handlePrintLogs}
              className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Cetak Log</span>
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
    </div>
  );
};

