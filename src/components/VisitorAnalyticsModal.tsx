import React, { useState, useEffect } from "react";
import { Users, Activity, Eye, UserCheck, ShieldCheck, Calendar, Clock, RefreshCw, FileSpreadsheet, Trash2, CheckCircle, Search, Laptop, Smartphone, Printer, AlertTriangle } from "lucide-react";
import { VisitorLog, AuditLog } from "../types";
import { getVisitorLogs, getAuditLogs, recordVisitorAccess, clearAllLogs } from "../lib/analyticsService";

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
    (a.sessionId && a.sessionId.toLowerCase().includes(searchTerm.toLowerCase())) ||
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

  const handleClearLogs = () => {
    if (window.confirm("Apakah Anda yakin ingin membersihkan seluruh log pengunjung dan audit input operator?\n\nTindakan ini akan menghapus log tersimpan lokal untuk pemeliharaan sistem.")) {
      const res = clearAllLogs();
      refreshData();
      alert(`Berhasil membersihkan log: ${res.removedAudits} audit log & ${res.removedVisitors} log pengunjung.`);
    }
  };

  const handlePrintAudit = () => {
    window.print();
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 print:hidden">
        <div className="bg-slate-900 border border-slate-700/60 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl text-white overflow-hidden">
          
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">
                    Data Analitik & Audit Transparansi SPBE
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-[9px] font-bold text-emerald-300">
                    Otomatis Purge 3 Bulan
                  </span>
                </div>
                <h2 className="text-lg font-black text-white">Log Pengunjung & Audit Input Operator</h2>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrintAudit}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-md"
                title="Cetak Laporan Audit Trail (PDF)"
              >
                <Printer className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Cetak Audit</span>
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
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  placeholder="Cari email, nama, ID sesi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 pl-8 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
              </div>

              <button
                onClick={handleClearLogs}
                className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer shrink-0"
                title="Pembersih Log Audit"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Bersihkan Log</span>
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

                      <div className="text-[10px] text-slate-400 flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-900">
                        <div className="flex items-center space-x-3">
                          <span>Email: <strong className="text-slate-300">{a.operatorEmail}</strong></span>
                          {a.sessionId && (
                            <span className="text-emerald-400/90 font-mono">
                              ID Sesi: {a.sessionId.substring(0, 12)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {a.sessionDurationMinutes && (
                            <span className="px-2 py-0.5 bg-slate-800 rounded text-[9px] text-slate-300">
                              Durasi Sesi: {a.sessionDurationMinutes} Menit
                            </span>
                          )}
                          {a.sessionInputCount && (
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-bold text-[9px]">
                              Input ke-{a.sessionInputCount}
                            </span>
                          )}
                        </div>
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
              <span>Sistem otomatis menghapus log berusia lebih dari 90 hari & memverifikasi identitas sesi per perangkat (maks 2 jam).</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrintAudit}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Cetak Audit Log</span>
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

      {/* PRINTABLE AUDIT REPORT FOR AUDITORS & DINKES */}
      <div id="printable-audit-report" className="hidden print:block text-slate-900 font-sans p-6 space-y-6 bg-white">
        <style>{`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #printable-audit-report, #printable-audit-report * {
              visibility: visible !important;
            }
            #printable-audit-report {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              padding: 10mm 15mm !important;
              background: white !important;
              color: black !important;
            }
          }
        `}</style>

        {/* Header Document */}
        <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-base font-black uppercase tracking-wider text-slate-900">
              PEMERINTAH KABUPATEN NAGEKEO - DINAS KESEHATAN
            </h1>
            <h2 className="text-xs font-bold text-slate-700">
              DOKUMEN REKAPITULASI AUDIT INTEGRITAS & LOG OPERATOR DATA GIZI (SPBE)
            </h2>
            <p className="text-[10px] text-slate-500">
              Sistem Orbit Gizi Nagekeo - Tanggal Cetak Audit: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-mono px-2 py-1 bg-slate-100 border border-slate-400 rounded font-bold">
              OFFICIAL SPBE AUDIT TRAIL
            </span>
          </div>
        </div>

        {/* Audit Stats Summary */}
        <div className="grid grid-cols-4 gap-2 p-3 bg-slate-50 border border-slate-300 rounded-xl text-center text-[10px]">
          <div>
            <span className="text-slate-500 block">Total Log Audit Action</span>
            <strong className="text-xs font-black">{auditLogs.length} Aktivitas</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Total Sesi Operator</span>
            <strong className="text-xs font-black">
              {Array.from(new Set(auditLogs.map(a => a.sessionId).filter(Boolean))).length} Sesi Unik
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block">Akses Log Pengunjung</span>
            <strong className="text-xs font-black">{visitorLogs.length} Akses</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Standar Keamanan</span>
            <strong className="text-xs font-black">SPBE / Nagekeo Reg.</strong>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="space-y-2">
          <h3 className="font-black text-xs uppercase text-slate-800">
            RINCIAN LOG AKTIVITAS OPERATOR DATA GIZI & SASARAN
          </h3>
          <table className="w-full text-left border-collapse text-[9px] border border-slate-400">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-400 font-bold text-slate-900 uppercase">
                <th className="p-1.5 border-r border-slate-400 w-6">No</th>
                <th className="p-1.5 border-r border-slate-400 w-24">Waktu (WITA)</th>
                <th className="p-1.5 border-r border-slate-400">Nama Operator & Email</th>
                <th className="p-1.5 border-r border-slate-400">Instansi / Unit Kerja</th>
                <th className="p-1.5 border-r border-slate-400 w-20">ID Sesi</th>
                <th className="p-1.5 border-r border-slate-400 w-12">Urutan</th>
                <th className="p-1.5 border-r border-slate-400 w-20">Aksi</th>
                <th className="p-1.5">Deskripsi Kegiatan & Target</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-slate-500">Belum ada data audit log recorded.</td>
                </tr>
              ) : (
                auditLogs.map((a, idx) => (
                  <tr key={a.id || idx} className="border-b border-slate-300">
                    <td className="p-1.5 border-r border-slate-400 font-bold">{idx + 1}</td>
                    <td className="p-1.5 border-r border-slate-400">{formatTime(a.timestamp)}</td>
                    <td className="p-1.5 border-r border-slate-400 font-bold">
                      {a.operatorName}<br />
                      <span className="text-[8px] font-normal text-slate-600">{a.operatorEmail}</span>
                    </td>
                    <td className="p-1.5 border-r border-slate-400">{a.operatorInstansi || "-"}</td>
                    <td className="p-1.5 border-r border-slate-400 font-mono text-[8px]">
                      {a.sessionId ? a.sessionId.substring(0, 10) : "-"}<br />
                      ({a.sessionDurationMinutes || 60}m)
                    </td>
                    <td className="p-1.5 border-r border-slate-400 font-bold">
                      {a.sessionInputCount ? `#${a.sessionInputCount}` : "-"}
                    </td>
                    <td className="p-1.5 border-r border-slate-400 font-bold uppercase text-[8px]">
                      {a.actionType}
                    </td>
                    <td className="p-1.5">
                      {a.description} {a.targetName && <strong>[{a.targetName}]</strong>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Signatures */}
        <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <p className="text-slate-500 text-[10px]">Petugas Auditor Sistem SPBE / Admin</p>
            <div className="h-12" />
            <p className="font-bold border-b border-slate-900 inline-block px-4">Admin Pengelola Orbit Gizi</p>
            <p className="text-[10px] text-slate-500">NIP / NIK Verifikator</p>
          </div>
          <div>
            <p className="text-slate-500 text-[10px]">Mengetahui,<br />Kepala Dinas Kesehatan Kab. Nagekeo</p>
            <div className="h-12" />
            <p className="font-bold border-b border-slate-900 inline-block px-4">dr. Paulina M. N, M.Kes</p>
            <p className="text-[10px] text-slate-500">NIP. 19740812 200212 2 003</p>
          </div>
        </div>
      </div>
    </>
  );
};
