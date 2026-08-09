import React from "react";
import { X, User, Heart, Activity, MapPin, Calendar, Award, FileText, CheckCircle2 } from "lucide-react";
import { MBGBeneficiary } from "../types";

interface BeneficiaryDetailModalProps {
  beneficiary: MBGBeneficiary | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BeneficiaryDetailModal: React.FC<BeneficiaryDetailModalProps> = ({
  beneficiary,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !beneficiary) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200 text-white max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <User className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {beneficiary.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {beneficiary.id}</span>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight mt-0.5">{beneficiary.name}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Nama Orang Tua / Wali</span>
            <span className="text-sm font-black text-white">{beneficiary.parentName || "-"}</span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">NIK / Identitas</span>
            <span className="text-sm font-black font-mono text-emerald-400">{beneficiary.nik || "350xxxxxxxxxxxxx"}</span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Wilayah & Posyandu</span>
            <div className="flex items-center space-x-1.5 text-xs text-slate-200 font-bold">
              <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>{beneficiary.location?.kelurahan || beneficiary.location?.puskesmas || "Nagekeo"} • {beneficiary.location?.posyandu || "Posyandu Melati"}</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Status Intervensi MBG & PMT</span>
            <div className="flex items-center space-x-2 pt-1">
              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${beneficiary.isReceivedMBG !== false ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-slate-800 text-slate-400"}`}>
                {beneficiary.isReceivedMBG !== false ? "MBG Aktif" : "Belum MBG"}
              </span>
              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${beneficiary.isReceivedPMT !== false ? "bg-teal-500/20 text-teal-300 border border-teal-500/30" : "bg-slate-800 text-slate-400"}`}>
                {beneficiary.isReceivedPMT !== false ? "PMT Aktif" : "Tanpa PMT"}
              </span>
            </div>
          </div>
        </div>

        {/* Weight & Height Records History */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">Riwayat Pemantauan Berat & Tinggi Badan</h4>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="p-3">Periode / Tanggal</th>
                  <th className="p-3">Berat Badan (Kg)</th>
                  <th className="p-3">Tinggi Badan (Cm)</th>
                  <th className="p-3">Status Gizi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs">
                {beneficiary.weightRecords && beneficiary.weightRecords.length > 0 ? (
                  beneficiary.weightRecords.map((rec, i) => (
                    <tr key={i} className="hover:bg-slate-900/50">
                      <td className="p-3 font-bold text-slate-300 flex items-center space-x-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        <span>{rec.period || `Pemeriksaan #${i + 1}`}</span>
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-400">{rec.weightKg} kg</td>
                      <td className="p-3 font-mono font-bold text-teal-400">{rec.heightCm || "-"} cm</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          rec.statusGizi === "Normal" || !rec.statusGizi ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                        }`}>
                          {rec.statusGizi || "Normal"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-500 font-bold text-xs">
                      Belum ada riwayat catatan penimbangan (Data e-PPGBM sinkron).
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Officers & Attendance */}
        <div className="space-y-2 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-xs">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px] block mb-1">Petugas Pendamping & Kader Terlibat</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Kader Posyandu</span>
              <span className="font-bold text-slate-200">{beneficiary.officerKaderName || "Ibu Siti Aminah"}</span>
            </div>
            <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Ahli Gizi</span>
              <span className="font-bold text-slate-200">{beneficiary.officerAhliGiziName || "Maria Goreti, S.Gz"}</span>
            </div>
            <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Dokter Anak</span>
              <span className="font-bold text-slate-200">{beneficiary.officerDokterAnakName || "dr. Antonius, Sp.A"}</span>
            </div>
            <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Dinas Kesehatan</span>
              <span className="font-bold text-slate-200">{beneficiary.officerDinkesName || "Tim e-PPGBM"}</span>
            </div>
          </div>
          {beneficiary.notes && (
            <p className="text-slate-300 italic pt-2 border-t border-slate-800 mt-2">
              <span className="font-bold text-emerald-400 not-italic">Catatan Khusus:</span> {beneficiary.notes}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            Tutup Detail
          </button>
        </div>

      </div>
    </div>
  );
};
