import React, { useState, useEffect } from "react";
import { UserCheck, Building2, ShieldCheck, Mail, Phone, Lock, Sparkles, CheckCircle2 } from "lucide-react";
import { OperatorProfile } from "../types";
import { saveOperatorProfile, getOperatorProfile } from "../lib/analyticsService";

interface OperatorIdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (profile: OperatorProfile) => void;
  currentUserEmail?: string | null;
}

export const OperatorIdentityModal: React.FC<OperatorIdentityModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentUserEmail
}) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("Petugas Ahli Gizi / Nakes");
  const [instansi, setInstansi] = useState("Puskesmas Boawae / Dinkes Nagekeo");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      const existing = getOperatorProfile();
      if (existing) {
        setName(existing.name || "");
        setRole(existing.role || "Petugas Ahli Gizi / Nakes");
        setInstansi(existing.instansi || "Puskesmas Boawae / Dinkes Nagekeo");
        setEmail(existing.email || currentUserEmail || "");
        setPhone(existing.phone || "");
      } else {
        setEmail(currentUserEmail || "");
      }
    }
  }, [isOpen, currentUserEmail]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Mohon isi Nama Lengkap Petugas / Operator.");
      return;
    }
    if (!email.trim()) {
      setErrorMsg("Mohon isi Email Aktif Petugas.");
      return;
    }

    const profile: OperatorProfile = {
      name: name.trim(),
      role: role.trim(),
      instansi: instansi.trim(),
      email: email.trim(),
      phone: phone.trim()
    };

    saveOperatorProfile(profile);
    setErrorMsg("");
    onConfirm(profile);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 text-white relative overflow-hidden">
        
        {/* Glow accent */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 text-emerald-400">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">
              Verifikasi Pengakses Data
            </span>
            <h3 className="text-lg font-black text-white">Identitas Operator / Petugas Input</h3>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Untuk akuntabilitas dan audit transparansi gizi, mohon konfirmasi identitas Anda sebelum melakukan penambahan atau perubahan data sasaran.
        </p>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-bold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Nama Lengkap Petugas / Operator <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Maria Goreti, S.Gz"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl text-white text-xs outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Peran / Jabatan
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl text-white text-xs outline-none cursor-pointer"
              >
                <option value="Petugas Ahli Gizi / Nakes">Petugas Ahli Gizi / Nakes</option>
                <option value="Kader Posyandu">Kader Posyandu</option>
                <option value="Petugas Puskesmas">Petugas Puskesmas</option>
                <option value="Admin Dinas Kesehatan">Admin Dinas Kesehatan</option>
                <option value="Petugas Desa / BGN">Petugas Desa / BGN</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Instansi / Wilayah Kerja
              </label>
              <input
                type="text"
                value={instansi}
                onChange={(e) => setInstansi(e.target.value)}
                placeholder="Puskesmas Boawae"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl text-white text-xs outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Email Operator <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@nagekeo.go.id"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl text-white text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                No. HP / WhatsApp (Opsional)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08123456789"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl text-white text-xs outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center space-x-2 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Verifikasi & Lanjutkan Input</span>
            </button>
          </div>
        </form>

        <div className="text-[10px] text-slate-400 flex items-center justify-center space-x-1 border-t border-slate-800/80 pt-3">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Audit trail otomatis tersimpan & disinkronkan ke Google Sheets Admin</span>
        </div>

      </div>
    </div>
  );
};
