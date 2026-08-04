import { Heart, LogOut, User as UserIcon, FileSpreadsheet, RefreshCw, Building } from "lucide-react";
import { User as FirebaseUser } from "firebase/auth";
import { PemdaNagekeoLogo } from "./PemdaNagekeoLogo";

interface LogoOrbitGiziProps {
  currentUser?: FirebaseUser | null;
  onLogout?: () => void;
  onLogin?: () => void;
  onSync?: () => void;
  syncingSheets?: boolean;
  sheetsSyncUrl?: string | null;
}

export default function LogoOrbitGizi({ 
  currentUser, 
  onLogout,
  onLogin,
  onSync,
  syncingSheets,
  sheetsSyncUrl
}: LogoOrbitGiziProps) {
  return (
    <header className="flex flex-col lg:flex-row items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-5 text-center sm:text-left mb-4 lg:mb-0" id="brand-logo-container">
        
        {/* Official Pemda Kabupaten Nagekeo Shield Emblem Component */}
        <div className="flex items-center space-x-3 shrink-0 mb-3 sm:mb-0">
          <PemdaNagekeoLogo size={72} />
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
                <span>{syncingSheets ? "Proses..." : "Sinkron"}</span>
              </button>
            )}

            {/* User Profile & Logout */}
            <div className="flex items-center space-x-3 bg-slate-100/60 border border-slate-200 px-3 py-1.5 rounded-xl">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || "User"}
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-full border border-slate-300"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center border border-slate-300">
                  <UserIcon className="h-3.5 w-3.5 text-slate-500" />
                </div>
              )}
              <div className="text-left hidden md:block">
                <p className="text-[10px] font-black text-slate-700 leading-tight block max-w-[140px] truncate">
                  {currentUser.displayName || "Pengguna"}
                </p>
                <p className="text-[9px] font-medium text-slate-500 leading-none block max-w-[140px] truncate">
                  {currentUser.email}
                </p>
              </div>
              <button
                onClick={onLogout}
                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 hover:border-rose-300 rounded-lg transition-all duration-150 cursor-pointer flex items-center space-x-1.5 font-bold shadow-3xs text-[11px]"
                title="Keluar dari Aplikasi (Logout)"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          </>
        ) : (
          /* Connect button when not logged in */
          onLogin && (
            <button
              onClick={onLogin}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 px-4 rounded-xl text-xs shadow-xs transition-all cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Hubungkan ke Google Sheets</span>
            </button>
          )
        )}
      </div>
    </header>
  );
}
