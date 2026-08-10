import React, { useState } from "react";
import { Mail, Check, LogIn, X, ShieldAlert, Sparkles } from "lucide-react";

interface VisitorEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
  onSaveEmail: (email: string) => void;
  onGoogleLogin?: () => void;
}

export const VisitorEmailModal: React.FC<VisitorEmailModalProps> = ({
  isOpen,
  onClose,
  currentEmail,
  onSaveEmail,
  onGoogleLogin
}) => {
  const [emailInput, setEmailInput] = useState(
    currentEmail && !currentEmail.includes("pengunjung@public.go.id") ? currentEmail : ""
  );
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setErrorMsg("Mohon masukkan format email yang valid (contoh: nama@gmail.com atau instansi@nagekeo.go.id)");
      return;
    }
    onSaveEmail(trimmed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
            <Mail className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 leading-tight">
              Identitas Pengunjung
            </h3>
            <p className="text-xs font-bold text-slate-500">
              Set Email Anda untuk Catatan Akses Publik
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
          Masukkan alamat email Anda agar sistem mencatat kunjungan & aktivitas Anda dengan email yang sah (bukan anonim).
        </p>

        {onGoogleLogin && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => {
                onClose();
                onGoogleLogin();
              }}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>Login dengan Akun Google (Otomatis)</span>
            </button>

            <div className="relative my-4 flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider absolute">
                Atau Manual
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1">
              Alamat Email Pengunjung:
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="contoh: nama.instansi@gmail.com"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  setErrorMsg("");
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              />
            </div>
            {errorMsg && (
              <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center space-x-1">
                <ShieldAlert className="h-3 w-3 shrink-0" />
                <span>{errorMsg}</span>
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>Simpan Email</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
