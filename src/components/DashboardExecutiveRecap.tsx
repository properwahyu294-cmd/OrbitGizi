import { useState } from "react";
import { 
  BarChart3, 
  Users, 
  Apple, 
  Grape, 
  Heart, 
  Home, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Printer, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  PieChart, 
  FileSpreadsheet,
  Activity,
  Layers,
  MapPin
} from "lucide-react";
import { Village, MBGBeneficiary } from "../types";

interface DashboardExecutiveRecapProps {
  villages: Village[];
  beneficiaries: MBGBeneficiary[];
  onOpenAnalyticPivot: () => void;
  onOpenInputWizard: () => void;
}

export default function DashboardExecutiveRecap({
  villages,
  beneficiaries,
  onOpenAnalyticPivot,
  onOpenInputWizard
}: DashboardExecutiveRecapProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [selectedVillageFilter, setSelectedVillageFilter] = useState<string>("SEMUA");

  // Filtered beneficiaries
  const activeBens = selectedVillageFilter === "SEMUA"
    ? beneficiaries
    : beneficiaries.filter(b => b.location?.kelurahan?.toLowerCase().trim() === selectedVillageFilter.toLowerCase().trim());

  // Calculations
  const totalCount = activeBens.length || 0;
  const mbgCount = activeBens.filter(b => b.isReceivedMBG !== false).length;
  const pmtCount = activeBens.filter(b => b.isReceivedPMT !== false).length;
  const bothCount = activeBens.filter(b => b.isReceivedMBG !== false && b.isReceivedPMT !== false).length;
  const homeVisitCount = activeBens.filter(b => 
    b.attendanceStatus === "Tidak Mengunjungi"
  ).length;

  // Category counts
  const balitaCount = activeBens.filter(b => b.category === "Balita").length;
  const ibuHamilCount = activeBens.filter(b => b.category === "Ibu Hamil").length;
  const ibuMenyusuiCount = activeBens.filter(b => b.category === "Ibu Menyusui").length;

  // Nutritional status breakdown from latest weightRecords
  let normalCount = 0;
  let stuntingCount = 0;
  let risikoStuntingCount = 0;
  let wastingCount = 0;

  activeBens.forEach(b => {
    if (b.weightRecords && b.weightRecords.length > 0) {
      const latest = b.weightRecords[b.weightRecords.length - 1];
      const st = (latest.statusGizi || "").toLowerCase();
      if (st.includes("stunting") && !st.includes("risiko")) {
        stuntingCount++;
      } else if (st.includes("risiko")) {
        risikoStuntingCount++;
      } else if (st.includes("kurang") || st.includes("wasting") || st.includes("buruk")) {
        wastingCount++;
      } else {
        normalCount++;
      }
    } else {
      normalCount++;
    }
  });

  // Village summary matrix
  const villageSummaryMatrix = villages.map(v => {
    const vBens = beneficiaries.filter(b => 
      b.location?.kelurahan && b.location.kelurahan.toLowerCase().trim() === v.name.toLowerCase().trim()
    );
    const vTotal = vBens.length;
    const vMbg = vBens.filter(b => b.isReceivedMBG !== false).length;
    const vPmt = vBens.filter(b => b.isReceivedPMT !== false).length;
    const vHomeVisit = vBens.filter(b => b.attendanceStatus === "Tidak Mengunjungi").length;
    
    let vStunting = 0;
    vBens.forEach(b => {
      if (b.weightRecords && b.weightRecords.length > 0) {
        const latest = b.weightRecords[b.weightRecords.length - 1];
        if (latest.statusGizi === "Stunting") vStunting++;
      }
    });

    return {
      village: v,
      totalCount: vTotal,
      mbgCount: vMbg,
      pmtCount: vPmt,
      homeVisitCount: vHomeVisit,
      stuntingCount: vStunting
    };
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden transition-all duration-300">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4.5 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-300 shrink-0">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider rounded-md">
                REKAPITULASI TERPADU 2026
              </span>
              <span className="text-slate-400 text-xs hidden sm:inline">•</span>
              <span className="text-slate-300 text-xs font-semibold">Cakupan Program MBG & PMT</span>
            </div>
            <h3 className="text-base font-black text-white tracking-tight mt-0.5">
              Panel Rekapitulasi Data & Distribusi Intervensi Gizi
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button
            onClick={onOpenAnalyticPivot}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Matriks Pivot & Cetak Report</span>
          </button>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer"
            title={isExpanded ? "Sembunyikan Rekap" : "Tampilkan Rekap"}
          >
            {isExpanded ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 space-y-6">

          {/* VILLAGE SELECTOR BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Filter Rekap Wilayah:</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSelectedVillageFilter("SEMUA")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedVillageFilter === "SEMUA"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                Seluruh Kabupaten ({beneficiaries.length} Sasaran)
              </button>
              
              {villages.map(v => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVillageFilter(v.name)}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    selectedVillageFilter.toLowerCase().trim() === v.name.toLowerCase().trim()
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>

          {/* 1. TOP STATS KPI GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            
            {/* CARD 1: TOTAL SASARAN */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Total Terdaftar</span>
                <Users className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 block leading-none">{totalCount}</span>
                <span className="text-[10px] text-slate-500 font-medium block mt-1">Jiwa Penerima Manfaat</span>
              </div>
              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px]">
                <span className="text-slate-500">Balita: <strong>{balitaCount}</strong></span>
                <span className="text-slate-500">Bumil: <strong>{ibuHamilCount}</strong></span>
              </div>
            </div>

            {/* CARD 2: REALISASI MBG */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">Penerima MBG</span>
                <Apple className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <span className="text-2xl font-black text-emerald-900 block leading-none">{mbgCount}</span>
                <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                  Cakupan {((mbgCount / (totalCount || 1)) * 100).toFixed(0)}% Sasaran
                </span>
              </div>
              <div className="pt-2 border-t border-emerald-200/80 text-[10px] text-emerald-800 font-medium">
                Makan Bergizi Gratis Aktif
              </div>
            </div>

            {/* CARD 3: REALISASI PMT */}
            <div className="bg-purple-50/70 border border-purple-200/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-purple-800 tracking-wider">Penerima PMT</span>
                <Grape className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <span className="text-2xl font-black text-purple-900 block leading-none">{pmtCount}</span>
                <span className="text-[10px] text-purple-700 font-semibold block mt-1">
                  Cakupan {((pmtCount / (totalCount || 1)) * 100).toFixed(0)}% Sasaran
                </span>
              </div>
              <div className="pt-2 border-t border-purple-200/80 text-[10px] text-purple-800 font-medium">
                Pemberian Makanan Tambahan
              </div>
            </div>

            {/* CARD 4: KOMBINASI MBG+PMT */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">MBG + PMT</span>
                <Sparkles className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <span className="text-2xl font-black text-amber-900 block leading-none">{bothCount}</span>
                <span className="text-[10px] text-amber-700 font-semibold block mt-1">
                  Penerima Layanan Ganda
                </span>
              </div>
              <div className="pt-2 border-t border-amber-200/80 text-[10px] text-amber-800 font-medium">
                Intervensi Gizi Intensif
              </div>
            </div>

            {/* CARD 5: HOME VISIT WAJIB */}
            <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3.5 space-y-2 col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-rose-800 tracking-wider">Wajib Kunjungan</span>
                <Home className="h-4 w-4 text-rose-600" />
              </div>
              <div>
                <span className="text-2xl font-black text-rose-900 block leading-none">{homeVisitCount}</span>
                <span className="text-[10px] text-rose-700 font-semibold block mt-1">
                  Absen / Risti Kunjungan
                </span>
              </div>
              <div className="pt-2 border-t border-rose-200/80 text-[10px] text-rose-800 font-medium">
                Target Prioritas Kader
              </div>
            </div>

          </div>

          {/* 2. REKAP STATUS GIZI & DISTRIBUSI KATEGORI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* STATUS GIZI BALITA & BUMIL BREAKDOWN */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <Activity className="h-4 w-4 text-indigo-600" />
                  <span>Rekap Kategori Status Gizi (Hasil Pengukuran)</span>
                </h4>
                <span className="text-[10px] font-bold text-slate-500">e-PPGBM Integrated</span>
              </div>

              <div className="space-y-2 text-xs">
                {/* Normal */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                  <div className="flex items-center space-x-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                    <span className="font-bold text-slate-800">Gizi Normal / Sesuai Usia</span>
                  </div>
                  <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    {normalCount} Jiwa ({((normalCount / (totalCount || 1)) * 100).toFixed(0)}%)
                  </span>
                </div>

                {/* Stunting */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                  <div className="flex items-center space-x-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                    <span className="font-bold text-slate-800">Terindikasi Stunting</span>
                  </div>
                  <span className="font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                    {stuntingCount} Jiwa ({((stuntingCount / (totalCount || 1)) * 100).toFixed(0)}%)
                  </span>
                </div>

                {/* Risiko Stunting */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                  <div className="flex items-center space-x-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                    <span className="font-bold text-slate-800">Risiko Stunting / Potensi Pendek</span>
                  </div>
                  <span className="font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                    {risikoStuntingCount} Jiwa ({((risikoStuntingCount / (totalCount || 1)) * 100).toFixed(0)}%)
                  </span>
                </div>

                {/* Wasting */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                  <div className="flex items-center space-x-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-purple-500"></span>
                    <span className="font-bold text-slate-800">Gizi Kurang / Wasting</span>
                  </div>
                  <span className="font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                    {wastingCount} Jiwa ({((wastingCount / (totalCount || 1)) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* REKAP PROPORSI KATEGORI DEMOGRAFI */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <Users className="h-4 w-4 text-indigo-600" />
                  <span>Rekap Demografi Kelompok Target Gizi</span>
                </h4>
                <span className="text-[10px] font-bold text-slate-500">Gizi 1000 HPK</span>
              </div>

              <div className="space-y-2 text-xs">
                {/* Balita */}
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-800">Balita (6 - 59 Bulan)</span>
                    <span className="font-black text-indigo-600">{balitaCount} Anak</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full" 
                      style={{ width: `${(balitaCount / (totalCount || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Ibu Hamil */}
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-800">Ibu Hamil (KEK & Resti)</span>
                    <span className="font-black text-pink-600">{ibuHamilCount} Ibu</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-pink-500 rounded-full" 
                      style={{ width: `${(ibuHamilCount / (totalCount || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Ibu Menyusui */}
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-800">Ibu Menyusui / Nifas</span>
                    <span className="font-black text-rose-600">{ibuMenyusuiCount} Ibu</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-rose-500 rounded-full" 
                      style={{ width: `${(ibuMenyusuiCount / (totalCount || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* 3. REKAPITULASI WILAYAH INTERVENSI MATRIX TABLE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <Layers className="h-4 w-4 text-indigo-600" />
                <span>Tabel Rekapitulasi Wilayah Intervensi & Kinerja Posyandu</span>
              </h4>
              <button
                onClick={onOpenAnalyticPivot}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
              >
                <span>Buka Matriks Pivot Lengkap</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold uppercase text-[10px]">
                    <th className="p-3">Nama Desa / Kelurahan</th>
                    <th className="p-3 text-center">Zona Risiko</th>
                    <th className="p-3 text-center">Skor Indeks</th>
                    <th className="p-3 text-center">Total Sasaran</th>
                    <th className="p-3 text-center">Realisasi MBG</th>
                    <th className="p-3 text-center">Realisasi PMT</th>
                    <th className="p-3 text-center">Stunting</th>
                    <th className="p-3 text-center">Wajib Visit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {villageSummaryMatrix.map((row, idx) => {
                    const zColor = row.village.riskLevel === "Hijau"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : row.village.riskLevel === "Kuning"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-rose-50 text-rose-700 border-rose-200";

                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold text-slate-900 flex items-center space-x-2">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{row.village.name}</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black border ${zColor}`}>
                            {row.village.riskLevel}
                          </span>
                        </td>
                        <td className="p-3 text-center font-black text-slate-900">{row.village.score}</td>
                        <td className="p-3 text-center font-bold text-slate-700">{row.totalCount} Jiwa</td>
                        <td className="p-3 text-center font-bold text-emerald-700">{row.mbgCount}</td>
                        <td className="p-3 text-center font-bold text-purple-700">{row.pmtCount}</td>
                        <td className="p-3 text-center font-bold text-rose-700">{row.stuntingCount} Anak</td>
                        <td className="p-3 text-center font-bold text-amber-700">{row.homeVisitCount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
