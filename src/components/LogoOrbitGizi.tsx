import { Orbit, Leaf } from "lucide-react";

export default function LogoOrbitGizi() {
  return (
    <header className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-xs">
      <div className="flex items-center space-x-3 mb-3 sm:mb-0" id="brand-logo-container">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-tr from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-100 animate-pulse">
          <Orbit className="h-7 w-7 text-white absolute" />
          <Leaf className="h-4 w-4 text-emerald-200 relative translate-x-1 -translate-y-1" />
        </div>
        <div>
          <div className="flex items-baseline space-x-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              Orbit<span className="text-emerald-500">Gizi</span>
            </h1>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600 border border-emerald-100">
              Transformasi Kabupaten
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Sistem Integrasi Data & Intervensi Gizi Terpadu
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-mono">Sinkronisasi Lapangan Aktif</span>
      </div>
    </header>
  );
}
