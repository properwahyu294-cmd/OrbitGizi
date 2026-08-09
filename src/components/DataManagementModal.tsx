import React, { useState } from "react";
import { Trash2, ShieldAlert, Lock, X, CheckCircle2, AlertTriangle, RefreshCcw } from "lucide-react";

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetAllData: () => void;
  onDeleteSelectedData: (options: { beneficiaries: boolean; villages: boolean; banners: boolean }) => void;
  beneficiariesCount: number;
  villagesCount: number;
  bannerCount: number;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  onResetAllData,
  onDeleteSelectedData,
  beneficiariesCount,
  villagesCount,
  bannerCount
}) => {
  const [activeTab, setActiveTab] = useState<"ALL" | "SELECTIVE">("ALL");
  const [pinInput, setPinInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Selective options
  const [delBeneficiaries, setDelBeneficiaries] = useState(false);
  const [delVillages, setDelVillages] = useState(false);
  const [delBanners, setDelBanners] = useState(false);

  if (!isOpen) return null;

  // Compute dynamic PIN: orbitgizi + DD + MM + YYYY
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  const expectedPin = `orbitgizi${dd}${mm}${yyyy}`;

  const handleResetAllSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() !== expectedPin) {
      setError(`PIN salah! Format PIN hari ini adalah "orbitgizi" + TanggalBulanTahun (contoh: orbitgizi${dd}${mm}${yyyy})`);
      return;
    }
    setError(null);
    onResetAllData();
    setSuccess("Semua data berhasil direset ke pengaturan awal!");
    setTimeout(() => {
      setSuccess(null);
      setPinInput("");
      onClose();
    }, 1500);
  };

  const handleSelectiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!delBeneficiaries && !delVillages && !delBanners) {
      setError("Pilih minimal satu kategori data yang ingin dihapus.");
      return;
    }
    if (pinInput.trim() !== expectedPin) {
      setError(`PIN salah! Format PIN hari ini adalah "orbitgizi" + TanggalBulanTahun (contoh: orbitgizi${dd}${mm}${yyyy})`);
      return;
    }
    setError(null);
    onDeleteSelectedData({
      beneficiaries: delBeneficiaries,
      villages: delVillages,
      banners: delBanners
    });
    setSuccess("Data terpilih berhasil dihapus!");
    setTimeout(() => {
      setSuccess(null);
      setPinInput("");
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-rose-500/30 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200 text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Manajemen & Reset Data</h3>
              <p className="text-xs text-rose-400 font-medium">Penghapusan data memerlukan verifikasi PIN keamanan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
          <button
            onClick={() => { setActiveTab("ALL"); setError(null); setPinInput(""); }}
            className={`flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
              activeTab === "ALL" ? "bg-rose-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            }`}
          >
            Hapus Semua Data
          </button>
          <button
            onClick={() => { setActiveTab("SELECTIVE"); setError(null); setPinInput(""); }}
            className={`flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
              activeTab === "SELECTIVE" ? "bg-amber-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            }`}
          >
            Hapus Data Terpilih
          </button>
        </div>

        {success && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-bold flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: RESET ALL */}
        {activeTab === "ALL" && (
          <form onSubmit={handleResetAllSubmit} className="space-y-4">
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl space-y-2">
              <div className="flex items-center space-x-2 text-rose-400 text-xs font-black uppercase tracking-wider">
                <AlertTriangle className="h-4 w-4" />
                <span>Peringatan Penghapusan Total</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tindakan ini akan menghapus seluruh data kustom yang tersimpan di memori lokal (ibu hamil, balita, posyandu, galeri banner, dan indikator wilayah). Sistem akan dikembalikan ke kondisi awal (default).
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Masukkan PIN Verifikasi Keamanan
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder={`Format: orbitgizi + DDMMYYYY (contoh hari ini: orbitgizi${dd}${mm}${yyyy})`}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl text-white text-xs font-mono outline-none"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Format PIN: <code className="text-rose-400 font-mono font-bold">orbitgizi{dd}{mm}{yyyy}</code> (berdasarkan tanggal hari ini: {dd}/{mm}/{yyyy}).
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl transition-all shadow-lg shadow-rose-600/30 cursor-pointer flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Hapus Semua Data</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: SELECTIVE DELETE */}
        {activeTab === "SELECTIVE" && (
          <form onSubmit={handleSelectiveSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Pilih Kategori Data yang Akan Dihapus:
              </label>

              <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                delBeneficiaries ? "bg-amber-500/20 border-amber-500/50 text-white" : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
              }`}>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={delBeneficiaries}
                    onChange={(e) => setDelBeneficiaries(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <div>
                    <span className="text-xs font-black block">Data Ibu Hamil, Ibu Menyusui & Balita</span>
                    <span className="text-[11px] text-slate-400">{beneficiariesCount} data tersimpan</span>
                  </div>
                </div>
              </label>

              <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                delVillages ? "bg-amber-500/20 border-amber-500/50 text-white" : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
              }`}>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={delVillages}
                    onChange={(e) => setDelVillages(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <div>
                    <span className="text-xs font-black block">Data Wilayah / Desa & Posyandu Kustom</span>
                    <span className="text-[11px] text-slate-400">{villagesCount} wilayah/desa</span>
                  </div>
                </div>
              </label>

              <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                delBanners ? "bg-amber-500/20 border-amber-500/50 text-white" : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
              }`}>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={delBanners}
                    onChange={(e) => setDelBanners(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <div>
                    <span className="text-xs font-black block">Galeri Banner & Gambar Kustom</span>
                    <span className="text-[11px] text-slate-400">{bannerCount} gambar</span>
                  </div>
                </div>
              </label>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Masukkan PIN Verifikasi Keamanan
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder={`Format: orbitgizi + DDMMYYYY (contoh hari ini: orbitgizi${dd}${mm}${yyyy})`}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl text-white text-xs font-mono outline-none"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Format PIN: <code className="text-amber-400 font-mono font-bold">orbitgizi{dd}{mm}{yyyy}</code>
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg shadow-amber-600/30 cursor-pointer flex items-center space-x-2"
              >
                <RefreshCcw className="h-4 w-4" />
                <span>Hapus Data Terpilih</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
