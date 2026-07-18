import { Users2, CheckCircle2, ShieldAlert, Award } from "lucide-react";
import { Pillar } from "../types";

interface StakeholderCardProps {
  pillar2: Pillar; // Pilar 2 has indicators Dinkes, BGN, PKK, Pemdes, Puskesmas
}

export default function StakeholderCard({ pillar2 }: StakeholderCardProps) {
  // Map stakeholder icons or descriptions
  const getStakeholderMetadata = (id: string) => {
    switch (id) {
      case "dinkes":
        return {
          shortName: "DINKES",
          fullName: "Dinas Kesehatan",
          role: "Intervensi medis spesifik & klinis",
          color: "border-indigo-100 bg-indigo-50/30 text-indigo-700",
          progressColor: "bg-indigo-500",
        };
      case "bgn":
        return {
          shortName: "BGN",
          fullName: "Badan Gizi Nasional",
          role: "Sponsor & suplai pangan sehat gratis (MBG)",
          color: "border-sky-100 bg-sky-50/30 text-sky-700",
          progressColor: "bg-sky-500",
        };
      case "pkk":
        return {
          shortName: "PKK",
          fullName: "TP PKK Kabupaten",
          role: "Pendampingan keluarga & kader lapangan",
          color: "border-pink-100 bg-pink-50/30 text-pink-700",
          progressColor: "bg-pink-500",
        };
      case "pemdes":
        return {
          shortName: "PEMDES",
          fullName: "Pemerintah Desa",
          role: "Pemberdayaan Dana Desa & Posyandu Aktif",
          color: "border-amber-100 bg-amber-50/30 text-amber-700",
          progressColor: "bg-amber-500",
        };
      default: // puskesmas
        return {
          shortName: "PUSKESMAS",
          fullName: "Puskesmas Kecamatan",
          role: "Pusat rujukan gizi, e-PPGBM, & PMT",
          color: "border-emerald-100 bg-emerald-50/30 text-emerald-700",
          progressColor: "bg-emerald-500",
        };
    }
  };

  // Calculate overall collaboration index
  const collaborationScore = Math.round(
    pillar2.indicators.reduce((acc, curr) => acc + curr.score, 0) / pillar2.indicators.length
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between h-full" id="stakeholder-card">
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center space-x-2">
            <Users2 className="h-4.5 w-4.5 text-slate-500" />
            <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase">
              KONTRIBUSI STAKEHOLDER (KOLABORASI OPD)
            </h3>
          </div>
          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-600">
            Pilar 2
          </span>
        </div>

        {/* Highlight Banner */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block leading-none mb-1">
              Kolaborasi Sektoral
            </span>
            <span className="text-base font-black text-slate-800">
              {collaborationScore}% Tingkat Kemitraan
            </span>
          </div>
          <div className="flex items-center space-x-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
            <Award className="h-4 w-4" />
            <span>Aktif</span>
          </div>
        </div>

        {/* Stakeholder progress lines list */}
        <div className="space-y-3.5">
          {pillar2.indicators.map((ind) => {
            const meta = getStakeholderMetadata(ind.id);
            return (
              <div key={ind.id} className={`rounded-xl border p-3 ${meta.color}`}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <span className="text-xs font-black tracking-wide block leading-tight">{meta.fullName}</span>
                    <span className="text-[10px] font-medium text-slate-500">{meta.role}</span>
                  </div>
                  <span className="text-xs font-black shrink-0 ml-2">{ind.score}%</span>
                </div>
                
                {/* Horizontal contribution bar */}
                <div className="h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden mt-1.5">
                  <div className={`h-full ${meta.progressColor} rounded-full`} style={{ width: `${ind.score}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3.5 border-t border-slate-100">
        <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Realisasi Program Terintegrasi</span>
        <div className="flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center space-x-1 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>5 OPD Tersinkronisasi</span>
          </div>
          <span className="text-[10px] italic font-semibold text-emerald-600">Terbimbing Orbit Gizi</span>
        </div>
      </div>
    </div>
  );
}
