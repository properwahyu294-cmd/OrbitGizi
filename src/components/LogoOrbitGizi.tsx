import React, { useState, useEffect, useRef } from "react";
import { Heart, LogOut, User as UserIcon, FileSpreadsheet, RefreshCw, Building, Upload, RotateCcw, Info, Camera, Edit3, Mail, ShieldCheck } from "lucide-react";
import { User as FirebaseUser } from "firebase/auth";
import logoPemdaFile from "../assets/images/LOGOPEMDA (1).png";
import { PemdaNagekeoLogo } from "./PemdaNagekeoLogo";
import { VisitorEmailModal } from "./VisitorEmailModal";

interface LogoOrbitGiziProps {
  currentUser?: FirebaseUser | null;
  visitorEmail?: string;
  onSetVisitorEmail?: (email: string) => void;
  onLogout?: () => void;
  onLogin?: () => void;
  onSync?: () => void;
  syncingSheets?: boolean;
  sheetsSyncUrl?: string | null;
  onOpenLauncher?: () => void;
  onOpenAnalytics?: () => void;
  onOpenAdminManagement?: () => void;
}

export default function LogoOrbitGizi({ 
  currentUser, 
  visitorEmail,
  onSetVisitorEmail,
  onLogout,
  onLogin,
  onSync,
  syncingSheets,
  sheetsSyncUrl,
  onOpenLauncher,
  onOpenAnalytics,
  onOpenAdminManagement
}: LogoOrbitGiziProps) {
  const [customLogo, setCustomLogo] = useState<string | null>(() => {
    return localStorage.getItem("orbit_gizi_custom_logo") || null;
  });
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [showVisitorEmailModal, setShowVisitorEmailModal] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file logo terlalu besar. Maksimal 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setCustomLogo(result);
          localStorage.setItem("orbit_gizi_custom_logo", result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogo = () => {
    setCustomLogo(null);
    localStorage.removeItem("orbit_gizi_custom_logo");
  };

  return (
    <header className="flex flex-col lg:flex-row items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
      {/* Hidden File Input for Direct Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleLogoUpload} 
        accept="image/*" 
        className="hidden" 
      />

      <div className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-5 text-center sm:text-left mb-4 lg:mb-0" id="brand-logo-container">
        
        {/* Logo Container with Upload / Hover Overlay */}
        <div className="flex items-center space-x-3 shrink-0 mb-3 sm:mb-0 group relative">
          <div className="relative group/logo cursor-pointer" title="Klik untuk mengganti logo Pemda">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="bg-white p-1 rounded-2xl shadow-md border border-slate-200 flex items-center justify-center h-20 w-20 relative overflow-hidden group-hover/logo:border-indigo-400 transition-colors"
            >
              <img 
                src={customLogo || logoPemdaFile} 
                alt="Logo Pemda Nagekeo" 
                className="h-full w-full object-contain"
                onError={(e) => {
                  // Fallback if image fails
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-slate-900/70 text-white flex flex-col items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity p-1 text-center">
                <Camera className="h-4 w-4 mb-0.5 text-emerald-400" />
                <span className="text-[9px] font-bold">{customLogo ? "Ganti Logo" : "Upload Logo"}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center space-x-1 text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 py-1 rounded-md transition-colors cursor-pointer"
            >
              <Upload className="h-3 w-3 text-indigo-600" />
              <span>{customLogo ? "Ganti Logo" : "Upload Logo"}</span>
            </button>

            {customLogo ? (
              <button
                onClick={handleResetLogo}
                className="inline-flex items-center space-x-1 text-[9px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                title="Kembalikan ke logo standar Pemda Nagekeo"
              >
                <RotateCcw className="h-2.5 w-2.5" />
                <span>Reset Logo</span>
              </button>
            ) : (
              <button
                onClick={() => setShowGuideModal(true)}
                className="inline-flex items-center space-x-1 text-[9px] font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                <Info className="h-2.5 w-2.5 text-indigo-500" />
                <span>Info Lokasi File</span>
              </button>
            )}
          </div>

          <div className="h-12 w-px bg-slate-200 hidden sm:block"></div>
        </div>

        {/* Text Branding & Slogans with Pemda Banner */}
        <div>
          <div className="flex items-center space-x-2 justify-center sm:justify-start mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-900 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md flex items-center space-x-1">
              <Building className="h-3 w-3 text-indigo-600" />
              <span>PEMERINTAH KABUPATEN NAGEKEO</span>
            </span>
            <span className="inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-100 uppercase tracking-wider">
              Zero Stunting
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline space-x-0 sm:space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 uppercase sm:normal-case">
              ORBIT<span className="text-emerald-500 font-black">GIZI</span>
            </h1>
          </div>
          
          <p className="text-xs text-slate-600 font-bold mt-1 leading-tight">
            Orkestrasi Bersama Integrasi Terpadu Gerakan Inovasi Zero Stunting Indonesia
          </p>
          
          <div className="flex items-center space-x-2 mt-1.5 justify-center sm:justify-start">
            <div className="inline-flex items-center space-x-1 bg-emerald-700 text-white px-2 py-0.5 rounded-md text-[10px] font-black tracking-wide uppercase">
              <span>“Too jogo wagha sama”</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              • Sinergi MBG & PMT Posyandu Terpadu
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-4 lg:mt-0 justify-center">
        {onOpenLauncher && (
          <button
            onClick={onOpenLauncher}
            className="flex items-center space-x-1.5 text-xs font-black text-slate-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
            title="Kembali ke Halaman Utama Launcher"
          >
            <RotateCcw className="h-3.5 w-3.5 text-emerald-700" />
            <span>Laman Launcher</span>
          </button>
        )}

        {currentUser ? (
          <>
            {/* Sync Status Badge */}
            <div className="flex items-center space-x-2 text-xs text-emerald-700 bg-emerald-50/50 px-3.5 py-2 rounded-xl border border-emerald-100 shadow-3xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-mono font-bold uppercase tracking-wider text-[10px]">Sinkronisasi Aktif</span>
            </div>

            {/* Buka Spreadsheet Link */}
            {sheetsSyncUrl && (
              <a
                href={sheetsSyncUrl}
                target="_blank"
                referrerPolicy="no-referrer"
                className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                <span>Buka Spreadsheet ↗</span>
              </a>
            )}

            {/* Sync Now Button */}
            {onSync && (
              <button
                onClick={onSync}
                disabled={syncingSheets}
                className="flex items-center space-x-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 px-3 py-2 rounded-xl transition-colors cursor-pointer shadow-3xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${syncingSheets ? "animate-spin" : ""}`} />
                <span>{syncingSheets ? "Memuat..." : "Muat Data Sheet"}</span>
              </button>
            )}

            {/* Admin Management Button */}
            {onOpenAdminManagement && (
              <button
                onClick={onOpenAdminManagement}
                className="flex items-center space-x-1.5 text-xs font-bold text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-2 rounded-xl transition-colors cursor-pointer shadow-3xs"
                title="Kelola & Daftarkan Email Admin / Operator Nakes"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                <span>Kelola Admin</span>
              </button>
            )}

            {/* User Profile & Logout */}
            <div className="flex items-center space-x-3 bg-slate-100/80 border border-slate-200 px-3 py-1.5 rounded-xl">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || "User"}
                  referrerPolicy="no-referrer"
                  className="w-6.5 h-6.5 rounded-full border border-slate-300"
                />
              ) : (
                <div className="w-6.5 h-6.5 rounded-full bg-white flex items-center justify-center border border-slate-300 text-slate-500">
                  <UserIcon className="h-3.5 w-3.5" />
                </div>
              )}
              <div className="text-left hidden md:block">
                <div className="flex items-center space-x-1.5">
                  <p className="text-[10px] font-black text-slate-800 leading-tight block max-w-[130px] truncate">
                    {currentUser.displayName || "Pengguna"}
                  </p>
                  <span className={`px-1.5 py-0.2 text-[8px] font-black uppercase rounded ${
                    !!currentUser
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}>
                    {!!currentUser ? "ADMIN" : "PENGUNJUNG"}
                  </span>
                </div>
                <p className="text-[9px] font-mono text-slate-500 leading-none block max-w-[160px] truncate">
                  {currentUser.email}
                </p>
              </div>
              <button
                onClick={onLogout}
                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 hover:border-rose-300 rounded-lg transition-all duration-150 cursor-pointer flex items-center space-x-1 font-bold shadow-3xs text-[11px]"
                title="Keluar dari Aplikasi (Logout)"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          </>
        ) : (
          /* Connect button when not logged in with Guest Badge */
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowVisitorEmailModal(true)}
              className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-300 text-xs font-mono transition-colors cursor-pointer"
              title="Klik untuk mengubah Email Identitas Pengunjung Anda"
            >
              <UserIcon className="h-3.5 w-3.5 text-emerald-600" />
              <span className="font-bold max-w-[170px] truncate">
                {visitorEmail || "Set Email Pengunjung"}
              </span>
              <span className="px-1.5 py-0.2 text-[8px] font-black uppercase rounded bg-slate-200 text-slate-700">
                PENGUNJUNG
              </span>
              <Edit3 className="h-3 w-3 text-slate-400 ml-1" />
            </button>

            {onLogin && (
              <button
                onClick={onLogin}
                className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2 px-3.5 rounded-xl text-xs shadow-xs transition-all cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Login Google</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Visitor Email Identification Modal */}
      <VisitorEmailModal
        isOpen={showVisitorEmailModal}
        onClose={() => setShowVisitorEmailModal(false)}
        currentEmail={visitorEmail || ""}
        onSaveEmail={(email) => {
          if (onSetVisitorEmail) onSetVisitorEmail(email);
        }}
        onGoogleLogin={onLogin}
      />

      {/* MODAL PETUNJUK PENEMPATAN LOGO */}
      {showGuideModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                  <Building className="h-5 w-5 text-indigo-600" />
                  <span>Petunjuk Penempatan Logo Pemda</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">2 cara mudah untuk memasang logo daerah Anda</p>
              </div>
              <button 
                onClick={() => setShowGuideModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 text-lg leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-indigo-50/70 p-3.5 rounded-2xl border border-indigo-100">
                <p className="font-bold text-indigo-900 mb-1 flex items-center space-x-1">
                  <span className="bg-indigo-600 text-white rounded-full h-4 w-4 flex items-center justify-center text-[10px]">1</span>
                  <span>Cara Mudah (Langsung via Aplikasi):</span>
                </p>
                <p className="text-slate-700 leading-relaxed">
                  Klik tombol <strong>"Upload Logo"</strong> di samping gambar logo di bagian atas, lalu pilih file gambar logo dari HP/Komputer Anda (Format PNG, JPG, atau WEBP). Logo akan langsung tersimpan dan tampil otomatis.
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <p className="font-bold text-slate-900 mb-1 flex items-center space-x-1">
                  <span className="bg-slate-700 text-white rounded-full h-4 w-4 flex items-center justify-center text-[10px]">2</span>
                  <span>Cara via File Project (Code Editor):</span>
                </p>
                <p className="text-slate-700 leading-relaxed mb-2">
                  Anda bisa meng-upload file gambar logo Anda langsung ke dalam struktur folder aplikasi:
                </p>
                <ul className="list-disc pl-5 space-y-1 font-mono text-[11px] text-slate-800">
                  <li><strong className="text-indigo-600">/src/assets/images/logo_pemda.png</strong></li>
                  <li>Atau di folder <strong className="text-indigo-600">/public/logo_pemda.png</strong></li>
                </ul>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  setShowGuideModal(false);
                  fileInputRef.current?.click();
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Pilih & Upload File Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

