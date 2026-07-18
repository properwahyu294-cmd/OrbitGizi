import { useState } from "react";
import { ChevronRight, HelpCircle, ShieldCheck } from "lucide-react";
import { Pillar, Indicator } from "../types";

interface PilarCardProps {
  pillars: Pillar[];
}

export default function PilarCard({ pillars }: PilarCardProps) {
  const [selectedPilarId, setSelectedPilarId] = useState<string>("pilar1");

  const selectedPilar = pillars.find(p => p.id === selectedPilarId) || pillars[0];

  // Get average score for a pillar
  const getPillarAverage = (pilar: Pillar) => {
    const sum = pilar.indicators.reduce((acc, ind) => acc + ind.score, 0);
    return Math.round(sum / pilar.indicators.length);
  };

  // Color helper for scores
  const getScoreColorClass = (score: number) => {
    if (score < 50) return "text-rose-600 bg-rose-50 border-rose-100";
    if (score <= 75) return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-emerald-600 bg-emerald-50 border-emerald-100";
  };

  const getProgressBarColor = (score: number) => {
    if (score < 50) return "bg-rose-500";
    if (score <= 75) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mb-6" id="pilar-card-container">
      {/* Header */}
      <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase">
            5 PILAR INDIKATOR KABUPATEN TERHITUNG
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Akumulasi terhitung otomatis dari data riil desa di atas. Klik pilar untuk melihat rincian capaian indikator kabupaten.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12">
        {/* Pilar Selector (Left Sidebar) - col-span-5 */}
        <div className="md:col-span-5 border-r border-slate-100 divide-y divide-slate-100">
          {pillars.map((pilar) => {
            const avg = getPillarAverage(pilar);
            const isSelected = pilar.id === selectedPilarId;
            return (
              <button
                key={pilar.id}
                onClick={() => {
                  setSelectedPilarId(pilar.id);
                }}
                className={`w-full text-left px-5 py-4 transition-all duration-200 flex items-center justify-between group ${isSelected ? "bg-emerald-50/40 font-bold border-l-4 border-emerald-500" : "hover:bg-slate-50/50"}`}
              >
                <div className="flex-1 pr-3">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Bobot: {pilar.weight}%</span>
                  <span className={`text-xs font-bold text-slate-800 ${isSelected ? "text-emerald-900" : ""}`}>{pilar.name}</span>
                  
                  {/* Micro Progress Bar */}
                  <div className="h-1 w-24 bg-slate-100 rounded-full mt-2 overflow-hidden">
                    <div className={`h-full ${getProgressBarColor(avg)} rounded-full`} style={{ width: `${avg}%` }}></div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${getScoreColorClass(avg)}`}>
                    {avg}%
                  </span>
                  <ChevronRight className={`h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors ${isSelected ? "text-emerald-500 translate-x-0.5" : ""}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Indicators List (Right Pane) - col-span-7 */}
        <div className="md:col-span-7 p-6 bg-slate-50/30">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-bold tracking-wider text-slate-600 uppercase">
              INDIKATOR UNTUK {selectedPilar.name.toUpperCase()}
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              {selectedPilar.indicators.length} Indikator
            </span>
          </div>

          <div className="space-y-4">
            {selectedPilar.indicators.map((ind) => {
              return (
                <div
                  key={ind.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 transition-all duration-300 hover:shadow-xs relative overflow-hidden"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-3">
                      <span className="text-xs font-bold text-slate-800 block mb-0.5">{ind.name}</span>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{ind.description}</p>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border ${getScoreColorClass(ind.score)}`}>
                        {ind.score}/100
                      </span>
                    </div>
                  </div>

                  {/* Visual linear progress bar */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3.5 overflow-hidden">
                    <div className={`h-full ${getProgressBarColor(ind.score)} rounded-full`} style={{ width: `${ind.score}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 flex items-start space-x-2.5">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-emerald-800 font-medium leading-relaxed">
              <strong>Kalkulasi Data Riil</strong>: Angka indikator di atas dihitung secara akurat berdasarkan total pencapaian dari seluruh desa aktif. Untuk mengubah angka ini, klik <strong>"Ubah Data Riil"</strong> pada panel peta gizi desa di atas.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
