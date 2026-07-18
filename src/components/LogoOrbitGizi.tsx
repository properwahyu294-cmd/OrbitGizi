import { Heart, LogOut, User as UserIcon, FileSpreadsheet, RefreshCw } from "lucide-react";
import { User as FirebaseUser } from "firebase/auth";

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
        
        {/* High-Fidelity SVG Emblem matching the user logo perfectly */}
        <div className="relative flex shrink-0 items-center justify-center bg-white p-1 rounded-full border border-slate-100 shadow-xs mb-3 sm:mb-0">
          <svg viewBox="0 0 120 120" className="w-24 h-24 sm:w-28 sm:h-28 select-none">
            {/* Gradients & Paths Definition */}
            <defs>
              <linearGradient id="orbit-blue" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1d4ed8" />
                <stop offset="100%" stopColor="#1e3a8a" />
              </linearGradient>
              <linearGradient id="orbit-green" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#15803d" />
              </linearGradient>
              <linearGradient id="orbit-gradient-center" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f0fdf4" />
              </linearGradient>
              {/* Outer circular text paths */}
              <path id="curve-top" d="M 12,60 A 48,48 0 0,1 108,60" fill="none" />
              <path id="curve-sub" d="M 22,60 A 38,38 0 0,1 98,60" fill="none" />
            </defs>

            {/* Circular background tracks */}
            <circle cx="60" cy="60" r="54" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
            <circle cx="60" cy="60" r="48" fill="none" stroke="#e2e8f0" strokeWidth="1" />
            <circle cx="60" cy="60" r="38" fill="url(#orbit-gradient-center)" stroke="#cbd5e1" strokeWidth="0.75" strokeDasharray="2 2" />

            {/* Orbit paths crossing */}
            <ellipse cx="60" cy="65" rx="52" ry="16" fill="none" stroke="#1d4ed8" strokeWidth="1.2" opacity="0.8" transform="rotate(-15 60 65)" />
            <ellipse cx="60" cy="65" rx="52" ry="16" fill="none" stroke="#eab308" strokeWidth="1.2" opacity="0.8" transform="rotate(15 60 65)" />

            {/* Curved Texts */}
            <text fill="#1e3a8a" fontSize="5.0" fontWeight="900" letterSpacing="0.2">
              <textPath href="#curve-top" startOffset="50%" textAnchor="middle">
                SINERGI MBG DAN PMT POSYANDU
              </textPath>
            </text>
            <text fill="#16a34a" fontSize="3.8" fontWeight="800" letterSpacing="0.08">
              <textPath href="#curve-sub" startOffset="50%" textAnchor="middle">
                UNTUK GENERASI SEHAT, NAGEKEO HEBAT
              </textPath>
            </text>

            {/* Left Side: MBG Circle Badge */}
            <g transform="translate(12, 60)">
              <circle cx="0" cy="0" r="11" fill="white" stroke="#1e40af" strokeWidth="1" />
              <circle cx="0" cy="0" r="9" fill="url(#orbit-blue)" />
              <text x="0" y="-1.5" fill="white" fontSize="4.5" fontWeight="900" textAnchor="middle">MBG</text>
              <text x="0" y="2.5" fill="white" fontSize="1.8" fontWeight="bold" textAnchor="middle">Makan Bergizi</text>
              <text x="0" y="5.0" fill="white" fontSize="1.8" fontWeight="bold" textAnchor="middle">Gratis</text>
            </g>

            {/* Right Side: PMT Circle Badge */}
            <g transform="translate(108, 60)">
              <circle cx="0" cy="0" r="11" fill="white" stroke="#15803d" strokeWidth="1" />
              <circle cx="0" cy="0" r="9" fill="url(#orbit-green)" />
              <text x="0" y="-1.5" fill="white" fontSize="4.5" fontWeight="900" textAnchor="middle">PMT</text>
              <text x="0" y="2.5" fill="white" fontSize="1.8" fontWeight="bold" textAnchor="middle">PMT</text>
              <text x="0" y="5.0" fill="white" fontSize="1.8" fontWeight="bold" textAnchor="middle">Posyandu</text>
            </g>

            {/* Central Circle silhouettes (Mother, Child, Leaves) */}
            <g transform="translate(0, 4)">
              {/* Central Background circular frame */}
              <circle cx="60" cy="56" r="22" fill="white" stroke="#10b981" strokeWidth="0.5" opacity="0.4" />

              {/* Mother (Left side) */}
              <path d="M 50,72 C 48,64 53,53 51,49 C 50,47 48,47 46,48 C 44,46 43,43 45,41 C 48,39 52,41 53,44 C 55,47 55,52 58,53 C 60,53 62,51 62,49 C 62,47 60,45 58,45 C 56,45 55,43 55,41 C 55,37 59,35 63,37 C 66,39 66,44 63,46 C 61,47 61,50 63,52 C 65,54 67,53 68,51 C 70,47 69,42 66,39 C 69,41 71,45 70,49 C 69,54 64,59 62,63 C 60,67 61,71 62,74 Z" fill="#0f4c81" />
              
              {/* Another Mother figure / Health Worker (Right side) */}
              <path d="M 70,72 C 72,64 67,53 69,49 C 70,47 72,47 74,48 C 76,46 77,43 75,41 C 72,39 68,41 67,44 C 65,47 65,52 62,53 C 60,53 58,51 58,49 C 58,47 60,45 62,45 C 64,45 65,43 65,41 C 65,37 61,35 57,37 C 54,39 54,44 57,46 C 59,47 59,50 57,52 C 55,54 53,53 52,51 C 50,47 51,42 54,39 C 51,41 49,45 50,49 C 51,54 56,59 58,63 C 60,67 59,71 58,74 Z" fill="#10b981" />

              {/* Child (Center) */}
              <circle cx="60" cy="60" r="3.2" fill="#84cc16" />
              <path d="M 56,72 C 56,66 57,64 59,63 L 59,67 L 61,67 L 61,63 C 63,64 64,66 64,72 Z" fill="#84cc16" />
              {/* Arms raised */}
              <path d="M 55,62 C 58,60 59,62 59,64 C 57,65 56,64 55,62 Z" fill="#84cc16" />
              <path d="M 65,62 C 62,60 61,62 61,64 C 63,65 64,64 65,62 Z" fill="#84cc16" />

              {/* Plant Leaves above center */}
              <path d="M 60,45 C 60,40 62,38 65,38 C 65,42 63,45 60,45 Z" fill="#22c55e" />
              <path d="M 60,45 C 57,44 55,41 56,38 C 59,39 60,42 60,45 Z" fill="#84cc16" />
            </g>

            {/* Orbit satellite dots */}
            <circle cx="18" cy="60" r="2" fill="#10b981" />
            <circle cx="102" cy="60" r="2" fill="#eab308" />
          </svg>
        </div>

        {/* Text Branding & Slogans matching user image precisely */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-baseline space-x-0 sm:space-x-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 uppercase sm:normal-case">
              ORBIT<span className="text-emerald-500 font-black">GIZI</span>
            </h1>
            <span className="inline-block mt-1 sm:mt-0 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700 border border-emerald-100 uppercase tracking-wider">
              Zero Stunting Indonesia
            </span>
          </div>
          
          <p className="text-xs text-slate-600 font-bold mt-1.5 leading-tight">
            Orkestrasi Bersama Integrasi Terpadu Gerakan Inovasi Zero Stunting Indonesia
          </p>
          
          <div className="flex items-center space-x-2 mt-2">
            <div className="inline-flex items-center space-x-1 bg-emerald-700 text-white px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wide uppercase">
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
