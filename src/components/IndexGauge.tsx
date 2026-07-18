import { Award, ShieldCheck, AlertTriangle, Info, Calendar } from "lucide-react";
import { Category, Weights } from "../types";

interface IndexGaugeProps {
  score: number;
  category: Category;
  weights: Weights;
  lastUpdated: string;
}

export default function IndexGauge({ score, category, weights, lastUpdated }: IndexGaugeProps) {
  // Determine arc stroke offset for circular gauge
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const formattedDate = new Date(lastUpdated).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  // Category visual assets
  const getCategoryInfo = (label: string) => {
    switch (label) {
      case "Hijau":
        return {
          icon: <ShieldCheck className="h-6 w-6 text-emerald-600" />,
          bgColor: "bg-emerald-500",
          gradient: "from-emerald-400 to-teal-500",
          ringColor: "ring-emerald-100",
          badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
          motivational: "Sangat Baik! Pertahankan efisiensi intervensi dan terus tingkatkan cakupan real-time."
        };
      case "Kuning":
        return {
          icon: <AlertTriangle className="h-6 w-6 text-amber-600" />,
          bgColor: "bg-amber-500",
          gradient: "from-amber-400 to-orange-500",
          ringColor: "ring-amber-100",
          badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
          motivational: "Waspada! Dibutuhkan percepatan pelayanan di tingkat desa dan perbaikan real-time update."
        };
      default: // Merah
        return {
          icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
          bgColor: "bg-red-500",
          gradient: "from-red-400 to-rose-600",
          ringColor: "ring-red-100",
          badgeColor: "bg-red-100 text-red-800 border-red-200",
          motivational: "Kritis! Diperlukan intervensi tanggap darurat multisektoral untuk menurunkan stunting secara agresif."
        };
    }
  };

  const catInfo = getCategoryInfo(category.label);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6" id="index-gauge-container">
      {/* Index Score Gauge */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 h-24 w-24 bg-slate-50 rounded-bl-full -z-10 opacity-60"></div>
        
        <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">
          INDEKS TRANSFORMASI ORBIT GIZI
        </h3>

        <div className="relative flex items-center justify-center h-44 w-44">
          {/* SVG Gauge Background */}
          <svg className="transform -rotate-90 w-44 h-44">
            <circle
              cx="88"
              cy="88"
              r={radius}
              className="stroke-slate-100 fill-none"
              strokeWidth="12"
            />
            <circle
              cx="88"
              cy="88"
              r={radius}
              className="stroke-emerald-500 fill-none transition-all duration-1000 ease-out"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                stroke: `url(#gaugeGradient)`,
              }}
            />
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#14b8a6" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Inner Text */}
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-extrabold text-slate-800 tracking-tight">
              {score}
            </span>
            <span className="text-[10px] font-semibold text-slate-400">skor 0 - 100</span>
          </div>
        </div>

        <div className="mt-4 flex items-center space-x-1 text-slate-400 text-xs">
          <Calendar className="h-3.5 w-3.5" />
          <span>Sinc: {formattedDate}</span>
        </div>
      </div>

      {/* District Status */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between relative overflow-hidden">
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${catInfo.bgColor}`}></div>
        
        <div>
          <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">
            STATUS KABUPATEN
          </h3>
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-2.5 rounded-xl ${catInfo.ringColor} bg-slate-50 ring-4`}>
              {catInfo.icon}
            </div>
            <div>
              <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-sm font-semibold border ${catInfo.badgeColor}`}>
                Kategori {category.label}
              </span>
              <p className="text-sm font-medium text-slate-600 mt-1">{category.desc}</p>
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-600 flex items-start space-x-2">
            <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{catInfo.motivational}</p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
          <span className="text-slate-400">Klasifikasi Skor:</span>
          <div className="flex space-x-2 font-semibold">
            <span className="text-red-500">{"<50"} Merah</span>
            <span className="text-amber-500">51-75 Kuning</span>
            <span className="text-emerald-500">76-100 Hijau</span>
          </div>
        </div>
      </div>

      {/* Weights Breakdown */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">
              DISTRIBUSI BOBOT PILAR
            </h3>
            <Award className="h-4 w-4 text-emerald-500" />
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-600 font-medium mb-1">
                <span>P1. Integrasi Data</span>
                <span>{(weights.pilar1 * 100).toFixed(0)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${weights.pilar1 * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 font-medium mb-1">
                <span>P2. Kolaborasi OPD</span>
                <span>{(weights.pilar2 * 100).toFixed(0)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${weights.pilar2 * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 font-medium mb-1">
                <span>P3. Digitalisasi</span>
                <span>{(weights.pilar3 * 100).toFixed(0)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${weights.pilar3 * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 font-medium mb-1">
                <span>P4. Pelayanan Gizi</span>
                <span>{(weights.pilar4 * 100).toFixed(0)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${weights.pilar4 * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 font-medium mb-1">
                <span>P5. Outcome & Dampak</span>
                <span>{(weights.pilar5 * 100).toFixed(0)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${weights.pilar5 * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
