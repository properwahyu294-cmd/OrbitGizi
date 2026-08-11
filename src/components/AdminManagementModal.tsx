import React, { useState } from "react";
import { UserPlus, ShieldCheck, Trash2, Mail, CheckCircle2, X, AlertCircle, Key, Users } from "lucide-react";
import { registerAdminEmailApi, deleteAdminEmailApi } from "../lib/dataService";

interface AdminManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail: string | null;
  registeredAdmins: string[];
  onAdminsUpdated: (updatedAdmins: string[]) => void;
}

export const AdminManagementModal: React.FC<AdminManagementModalProps> = ({
  isOpen,
  onClose,
  currentUserEmail,
  registeredAdmins,
  onAdminsUpdated
}) => {
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isCurrentUserAdmin = currentUserEmail
    ? registeredAdmins.some(a => a.toLowerCase() === currentUserEmail.toLowerCase())
    : false;

  const handleRegisterCurrentEmail = async () => {
    if (!currentUserEmail) return;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await registerAdminEmailApi(currentUserEmail);
      onAdminsUpdated(res.registeredAdmins);
      setSuccessMsg(`Email ${currentUserEmail} berhasil didaftarkan sebagai Admin / Nakes!`);
    } catch (err: any) {
      setError(err.message || "Gagal mendaftarkan email.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterNewEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes("@")) {
      setError("Masukkan alamat email yang valid.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await registerAdminEmailApi(newEmail.trim());
      onAdminsUpdated(res.registeredAdmins);
      setSuccessMsg(`Email ${newEmail.trim()} berhasil ditambahkan ke daftar Admin!`);
      setNewEmail("");
    } catch (err: any) {
      setError(err.message || "Gagal mendaftarkan email.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (emailToDelete: string) => {
    if (registeredAdmins.length <= 1) {
      alert("Harus menyisakan setidaknya 1 email Admin terdaftar.");
      return;
    }
    if (!confirm(`Hapus ${emailToDelete} dari daftar Admin terdaftar?`)) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await deleteAdminEmailApi(emailToDelete);
      onAdminsUpdated(res.registeredAdmins);
      setSuccessMsg(`Email ${emailToDelete} berhasil dihapus dari daftar Admin.`);
    } catch (err: any) {
      setError(err.message || "Gagal menghapus email admin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-600/50 p-2 rounded-xl border border-emerald-400/30">
              <ShieldCheck className="h-6 w-6 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">Kelola Admin & Registrasi Email</h3>
              <p className="text-xs text-emerald-100/90 font-medium">Otorisasi Hak Akses Nakes / Petugas Orbit Gizi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-emerald-800/60 hover:bg-emerald-800 text-emerald-200 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Current User Status Banner */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
                <Mail className="h-4 w-4 text-emerald-600" />
                <span>Akun Google Terhubung Saat Ini:</span>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-black rounded-full uppercase ${
                isCurrentUserAdmin 
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300" 
                  : "bg-amber-100 text-amber-800 border border-amber-300"
              }`}>
                {isCurrentUserAdmin ? "ADMIN TERDAFTAR" : "PENGUNJUNG / BELUM TERDAFTAR"}
              </span>
            </div>

            <div className="text-sm font-mono font-bold text-slate-800 bg-white px-3 py-2 rounded-lg border border-slate-200 truncate">
              {currentUserEmail || "Belum Login Google"}
            </div>

            {currentUserEmail && !isCurrentUserAdmin && (
              <button
                onClick={handleRegisterCurrentEmail}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <UserPlus className="h-4 w-4" />
                <span>Daftarkan Email Saya ({currentUserEmail}) Sebagai Admin</span>
              </button>
            )}
          </div>

          {/* Error / Success Notifications */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Add New Admin Form */}
          <form onSubmit={handleRegisterNewEmail} className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Tambah Email Admin / Petugas Nakes Lainnya:
            </label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="contoh: petugas.puskesmas@gmail.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="py-2 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 shrink-0"
              >
                <UserPlus className="h-4 w-4" />
                <span>Tambah</span>
              </button>
            </div>
          </form>

          {/* List of Registered Admin Emails */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <div className="flex items-center space-x-1.5">
                <Users className="h-4 w-4 text-emerald-600" />
                <span>Daftar Email Admin Terverifikasi ({registeredAdmins.length}):</span>
              </div>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {registeredAdmins.map((adminEmail) => {
                const isMe = currentUserEmail?.toLowerCase() === adminEmail.toLowerCase();
                return (
                  <div
                    key={adminEmail}
                    className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 text-xs transition-colors"
                  >
                    <div className="flex items-center space-x-2 truncate pr-2">
                      <Key className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span className="font-mono font-medium text-slate-800 truncate">{adminEmail}</span>
                      {isMe && (
                        <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded border border-emerald-300 shrink-0">
                          AKUN ANDA
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteAdmin(adminEmail)}
                      disabled={loading}
                      title="Hapus dari Admin"
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Selesai & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
