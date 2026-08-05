import React, { useState, useMemo } from "react";
import { MBGBeneficiary, Village, Pillar, WeightRecord } from "../types";
import { 
  BarChart, Bar, AreaChart, Area, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { 
  Activity, TrendingUp, Scale, User, Search, Calendar, 
  CheckCircle2, Plus, ArrowUpRight, Award, Database, Sparkles, Filter
} from "lucide-react";

interface AnalitikGiziViewProps {
  beneficiaries: MBGBeneficiary[];
  villages: Village[];
  pillars: Pillar[];
  mbgMonthlyTrend: Array<{ month: string; target: number; realized: number }>;
  pmtMonthlyTrend: Array<{ month: string; target: number; realized: number }>;
  onAddWeightRecord?: (beneficiaryId: string, record: WeightRecord) => void;
}

export const AnalitikGiziView: React.FC<AnalitikGiziViewProps> = ({
  beneficiaries,
  villages,
  pillars,
  mbgMonthlyTrend,
  pmtMonthlyTrend,
  onAddWeightRecord
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string>(
    beneficiaries.length > 0 ? beneficiaries[0].id : ""
  );
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Modal for quick adding weight measurement directly from child chart
  const [showQuickAddModal, setShowQuickAddModal] = useState<boolean>(false);
  const [newPeriod, setNewPeriod] = useState<string>("Juni 2026");
  const [newWeight, setNewWeight] = useState<string>("18.0");
  const [newHeight, setNewHeight] = useState<string>("115");
  const [newStatusGizi, setNewStatusGizi] = useState<"Normal" | "Gizi Kurang" | "Stunting" | "Risiko Stunting">("Normal");

  // Filter beneficiaries by category and search
  const filteredBeneficiaries = useMemo(() => {
    return beneficiaries.filter((b) => {
      const matchCategory = selectedCategory === "ALL" || b.category === selectedCategory;
      const matchSearch =
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.nik && b.nik.includes(searchTerm)) ||
        (b.location?.kelurahan && b.location.kelurahan.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [beneficiaries, selectedCategory, searchTerm]);

  // Ensure a valid beneficiary is selected
  const currentBeneficiary = useMemo(() => {
    const found = beneficiaries.find((b) => b.id === selectedBeneficiaryId);
    return found || (filteredBeneficiaries.length > 0 ? filteredBeneficiaries[0] : null);
  }, [beneficiaries, selectedBeneficiaryId, filteredBeneficiaries]);

  // Aggregate weight trend across ALL children dynamically
  const aggregatedWeightTrend = useMemo(() => {
    const periodMap: { [period: string]: { totalKg: number; count: number; avgKg: number; totalCm: number } } = {};

    beneficiaries.forEach((ben) => {
      if (selectedCategory !== "ALL" && ben.category !== selectedCategory) return;
      if (ben.weightRecords && ben.weightRecords.length > 0) {
        ben.weightRecords.forEach((rec) => {
          if (!periodMap[rec.period]) {
            periodMap[rec.period] = { totalKg: 0, count: 0, avgKg: 0, totalCm: 0 };
          }
          periodMap[rec.period].totalKg += rec.weightKg;
          periodMap[rec.period].totalCm += rec.heightCm || 0;
          periodMap[rec.period].count += 1;
        });
      }
    });

    const periods = Object.keys(periodMap);
    if (periods.length === 0) {
      return [
        { period: "Januari 2026", avgKg: 0, totalKg: 0, count: 0 },
        { period: "Februari 2026", avgKg: 0, totalKg: 0, count: 0 },
        { period: "Maret 2026", avgKg: 0, totalKg: 0, count: 0 },
      ];
    }

    return periods.map((p) => ({
      period: p,
      avgKg: parseFloat((periodMap[p].totalKg / periodMap[p].count).toFixed(1)),
      avgCm: periodMap[p].totalCm ? parseFloat((periodMap[p].totalCm / periodMap[p].count).toFixed(1)) : undefined,
      totalKg: parseFloat(periodMap[p].totalKg.toFixed(1)),
      count: periodMap[p].count,
    }));
  }, [beneficiaries, selectedCategory]);

  // Individual child weight trend data
  const childWeightData = useMemo(() => {
    if (!currentBeneficiary || !currentBeneficiary.weightRecords) return [];
    return currentBeneficiary.weightRecords.map((r) => ({
      period: r.period,
      weightKg: r.weightKg,
      heightCm: r.heightCm || 0,
      statusGizi: r.statusGizi || "Normal",
    }));
  }, [currentBeneficiary]);

  // Calculate individual weight gain
  const childWeightGain = useMemo(() => {
    if (!currentBeneficiary || !currentBeneficiary.weightRecords || currentBeneficiary.weightRecords.length < 2) {
      return { gainKg: 0, initialKg: 0, currentKg: 0, gainCm: 0 };
    }
    const recs = currentBeneficiary.weightRecords;
    const initial = recs[0];
    const latest = recs[recs.length - 1];
    const gainKg = parseFloat((latest.weightKg - initial.weightKg).toFixed(1));
    const gainCm = latest.heightCm && initial.heightCm ? parseFloat((latest.heightCm - initial.heightCm).toFixed(1)) : 0;
    return {
      gainKg,
      initialKg: initial.weightKg,
      currentKg: latest.weightKg,
      gainCm
    };
  }, [currentBeneficiary]);

  // Handle adding weight record directly from child card
  const handleAddMeasurement = () => {
    if (!currentBeneficiary || !onAddWeightRecord) return;
    const rec: WeightRecord = {
      period: newPeriod,
      weightKg: parseFloat(newWeight) || 15,
      heightCm: parseFloat(newHeight) || 100,
      statusGizi: newStatusGizi,
      measuredAt: new Date().toISOString().split("T")[0]
    };
    onAddWeightRecord(currentBeneficiary.id, rec);
    setShowQuickAddModal(false);
  };

  const pillar1 = pillars.find((p) => p.id === "pilar1") || pillars[0];

  return (
    <div className="space-y-6">
      {/* Category Filter Navigation Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-slate-800 font-black text-xs px-2">
          <Filter className="h-4 w-4 text-indigo-600" />
          <span>KATEGORI SASARAN:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "ALL", label: "Semua Kategori" },
            { id: "Balita", label: "Balita" },
            { id: "Ibu Hamil", label: "Ibu Hamil" },
            { id: "Ibu Menyusui", label: "Ibu Menyusui" },
          ].map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-xs font-black"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Total Penerima Input</span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">{filteredBeneficiaries.length} <span className="text-xs font-bold text-slate-500">Jiwa</span></span>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center space-x-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>Data Riil Terdaftar</span>
            </span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <User className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Total Catatan Pengukuran BB</span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">
              {beneficiaries.reduce((acc, b) => acc + (b.weightRecords ? b.weightRecords.length : 0), 0)} <span className="text-xs font-bold text-slate-500">Entri</span>
            </span>
            <span className="text-[10px] text-indigo-600 font-semibold mt-1 flex items-center space-x-1">
              <Activity className="h-3 w-3" />
              <span>Rekam Berat & Tinggi</span>
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Scale className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Cakupan Terlayani MBG</span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">
              {beneficiaries.filter((b) => b.isReceivedMBG).length} <span className="text-xs font-bold text-slate-500">Anak</span>
            </span>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 flex items-center space-x-1">
              <Sparkles className="h-3 w-3" />
              <span>Makan Bergizi Gratis</span>
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Award className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Rata-rata BB Anak</span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">
              {aggregatedWeightTrend.length > 0 ? aggregatedWeightTrend[aggregatedWeightTrend.length - 1].avgKg : 0} <span className="text-xs font-bold text-slate-500">Kg</span>
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center space-x-1">
              <ArrowUpRight className="h-3 w-3" />
              <span>Tren Pertumbuhan Positif</span>
            </span>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* SECTION 1: GRAFIK PERTUBUHAN KENAIKAN BERAT BADAN PER ANAK */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2 text-indigo-600 mb-1">
              <Scale className="h-5 w-5" />
              <span className="text-xs font-black uppercase tracking-wider">ANALISIS PERTURBUHAN INDIVIDUAL</span>
            </div>
            <h3 className="text-lg font-black text-slate-900">
              Grafik Pertumbuhan Kenaikan Berat Badan Per-Anak
            </h3>
            <p className="text-xs text-slate-500">
              Pilih nama penerima untuk melihat kurva pertumbuhan berat badan (Kg) & tinggi badan (Cm) riil berdasarkan histori pengukuran.
            </p>
          </div>

          {/* Child Selector & Search */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama / NIK..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs font-bold pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-slate-50/50"
              />
            </div>

            <select
              value={currentBeneficiary ? currentBeneficiary.id : ""}
              onChange={(e) => setSelectedBeneficiaryId(e.target.value)}
              className="w-full sm:w-64 text-xs font-black p-2 border border-indigo-200 rounded-xl bg-indigo-50/50 text-indigo-900 focus:outline-none cursor-pointer"
            >
              {filteredBeneficiaries.length === 0 ? (
                <option value="">Tidak ada penerima cocok</option>
              ) : (
                filteredBeneficiaries.map((b) => (
                  <option key={b.id} value={b.id}>
                    👤 {b.name} {b.gender ? `(${b.gender === 'Laki-laki' ? 'L' : 'P'})` : ''} {b.age ? `- ${b.age}` : ''} ({b.category}) - {b.location?.kelurahan || 'Desa'}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {currentBeneficiary ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Child Profile Banner */}
            <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-md space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                    <span className="text-[10px] font-black uppercase text-indigo-300 tracking-wider bg-indigo-900/60 px-2 py-0.5 rounded-md border border-indigo-700/50">
                      {currentBeneficiary.category}
                    </span>
                    {currentBeneficiary.gender && (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                        currentBeneficiary.gender === "Laki-laki" 
                          ? "bg-blue-900/60 text-blue-300 border-blue-700/50" 
                          : "bg-pink-900/60 text-pink-300 border-pink-700/50"
                      }`}>
                        {currentBeneficiary.gender === "Laki-laki" ? "👦 Laki-laki" : "👧 Perempuan"}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xl font-black text-white">{currentBeneficiary.name}</h4>
                  <div className="flex items-center space-x-2 text-xs text-slate-300 font-mono flex-wrap">
                    <span>NIK: {currentBeneficiary.nik || "-"}</span>
                    {currentBeneficiary.age && <span className="text-indigo-200 font-sans font-bold">• {currentBeneficiary.age}</span>}
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-black shadow-xs ${
                  currentBeneficiary.isReceivedMBG ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                }`}>
                  {currentBeneficiary.isReceivedMBG ? "Penerima MBG" : "PMT Prioritas"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Umur / Tgl Lahir:</span>
                  <span className="font-bold text-slate-200 block">{currentBeneficiary.age || "-"}</span>
                  {currentBeneficiary.birthDate && <span className="text-[10px] text-slate-400 font-mono block">{currentBeneficiary.birthDate}</span>}
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Lokasi Desa:</span>
                  <span className="font-bold text-slate-200">{currentBeneficiary.location?.kelurahan || "-"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Posyandu:</span>
                  <span className="font-bold text-slate-200">{currentBeneficiary.location?.posyandu || "-"}</span>
                </div>
              </div>

              {/* Weight Gain Stats Highlight */}
              <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Kenaikan BB:</span>
                  <span className={`text-lg font-black ${childWeightGain.gainKg >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {childWeightGain.gainKg >= 0 ? `+${childWeightGain.gainKg}` : childWeightGain.gainKg} Kg
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">BB Terakhir:</span>
                  <span className="text-lg font-black text-white">{childWeightGain.currentKg} Kg</span>
                </div>
              </div>

              <button
                onClick={() => setShowQuickAddModal(true)}
                className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>+ Catat Pengukuran BB Baru</span>
              </button>
            </div>

            {/* Individual Child Weight Growth Chart */}
            <div className="lg:col-span-8 bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                  <Activity className="h-4 w-4 text-emerald-600" />
                  <span>Kurva Perkembangan Berat Badan ({currentBeneficiary.name})</span>
                </span>
                <span className="text-[10px] font-bold bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-600">
                  {childWeightData.length} Periode Tercatat
                </span>
              </div>

              {childWeightData.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-bold">
                  Belum ada catatan berat badan untuk penerima ini. Klik "+ Catat Pengukuran BB Baru" untuk menambahkan data.
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={childWeightData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="period" tick={{ fontSize: 11, fontWeight: 700, fill: '#475569' }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" domain={['dataMin - 1', 'dataMax + 2']} tick={{ fontSize: 11, fontWeight: 700, fill: '#475569' }} axisLine={false} tickLine={false} label={{ value: 'Kg', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                      <YAxis yAxisId="right" orientation="right" domain={['dataMin - 5', 'dataMax + 5']} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} label={{ value: 'Cm', angle: 90, position: 'insideRight', fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, fontWeight: 700, borderRadius: 12, border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        labelStyle={{ fontWeight: 900, color: '#1e293b' }}
                      />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11, fontWeight: 800 }} />
                      <Line yAxisId="left" name="Berat Badan (Kg)" type="monotone" dataKey="weightKg" stroke="#10b981" strokeWidth={3} dot={{ r: 6, fill: "#10b981", strokeWidth: 2, stroke: "#ffffff" }} activeDot={{ r: 8 }} />
                      <Line yAxisId="right" name="Tinggi Badan (Cm)" type="monotone" dataKey="heightCm" stroke="#6366f1" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 4, fill: "#6366f1" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-300 rounded-2xl">
            <p className="text-sm font-bold text-slate-500">Belum ada data penerima terdaftar.</p>
            <p className="text-xs text-slate-400 mt-1">Silakan tambahkan data penerima di tab Pusat Input Data.</p>
          </div>
        )}
      </div>

      {/* SECTION 2: GRAFIK TREN KENAIKAN BERAT BADAN TOTAL & RATA-RATA */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2 text-emerald-600 mb-0.5">
                <TrendingUp className="h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-wider">AKUMULASI SELURUH ANAK</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Grafik Tren Kenaikan Berat Badan Total & Rata-Rata
              </h3>
              <p className="text-xs text-slate-500">
                Progres rata-rata berat badan (Kg) & total akumulasi dari seluruh anak terdaftar ({selectedCategory === "ALL" ? "Semua Kategori" : selectedCategory}).
              </p>
            </div>
            <span className="text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-xl">
              Terhitung Otomatis
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={aggregatedWeightTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAvgKg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="period" tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, fontWeight: 700, borderRadius: 12, border: '1px solid #e2e8f0' }}
                  labelStyle={{ fontWeight: 900, color: '#334155' }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11, fontWeight: 800 }} />
                <Area name="Rata-rata Berat Badan (Kg)" type="monotone" dataKey="avgKg" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAvgKg)" dot={{ r: 5 }} />
                <Line name="Total Pengukuran Aktif" type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SECTION 3: MULTI-SYSTEM DATA INTEGRATION BADGES */}
        <div className="xl:col-span-4 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-indigo-600" />
              <h3 className="text-xs font-black tracking-widest text-slate-800 uppercase">
                STATUS SINKRONISASI DATA
              </h3>
            </div>
            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
              Pilar 1
            </span>
          </div>

          <div className="space-y-3">
            {pillar1.indicators.map((ind) => {
              let badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
              let statusText = "Tersinkronisasi";
              if (ind.score < 50) {
                badgeStyle = "bg-rose-50 text-rose-700 border-rose-200";
                statusText = "Butuh Input Data";
              } else if (ind.score < 80) {
                badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
                statusText = "Sebagian Sinkron";
              }

              return (
                <div
                  key={ind.id}
                  className="border border-slate-100 rounded-2xl p-3.5 bg-slate-50/60 flex items-center justify-between hover:bg-slate-100/60 transition-colors"
                >
                  <div>
                    <span className="text-xs font-black text-slate-800 block">{ind.name}</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block font-medium">{ind.description}</span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-extrabold border ${badgeStyle}`}>
                      {statusText}
                    </span>
                    <span className="block text-[9px] text-slate-400 mt-1 font-mono">{ind.score}% Valid</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 4: GRAFIK DISTRIBUSI MBG & PMT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Grafik Realisasi MBG */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase">
                REALISASI MBG (MAKAN BERGIZI GRATIS)
              </h3>
              <p className="text-xs font-bold text-slate-800 mt-0.5">Distribusi Pangan Sehat MBG</p>
            </div>
            <Activity className="h-5 w-5 text-emerald-500" />
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mbgMonthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, fontWeight: 700, borderRadius: 8 }} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                <Bar name="Target Sasaran" dataKey="target" fill="#93c5fd" radius={[6, 6, 0, 0]} barSize={18} />
                <Bar name="Realisasi Terlayani" dataKey="realized" fill="#10b981" radius={[6, 6, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grafik Intervensi PMT */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase">
                INTERVENSI PMT (MAKANAN TAMBAHAN)
              </h3>
              <p className="text-xs font-bold text-slate-800 mt-0.5">Cakupan Balita Wasting & Ibu Hamil KEK</p>
            </div>
            <Activity className="h-5 w-5 text-indigo-500" />
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pmtMonthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, fontWeight: 700, borderRadius: 8 }} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                <Area name="Kebutuhan PMT" dataKey="target" stroke="#a5b4fc" fill="#e0e7ff" strokeWidth={2} />
                <Area name="Realisasi Distribusi" dataKey="realized" stroke="#6366f1" fill="#818cf8" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* QUICK MEASUREMENT MODAL */}
      {showQuickAddModal && currentBeneficiary && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider">Catat Pengukuran BB Baru</h3>
                <p className="text-xs text-indigo-300 font-bold">{currentBeneficiary.name} ({currentBeneficiary.category})</p>
              </div>
              <button
                onClick={() => setShowQuickAddModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Tutup
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Periode Pengukuran</label>
                <input
                  type="text"
                  value={newPeriod}
                  onChange={(e) => setNewPeriod(e.target.value)}
                  placeholder="Contoh: Juni 2026"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Berat Badan (Kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tinggi Badan (Cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newHeight}
                    onChange={(e) => setNewHeight(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Status Gizi Pengukuran</label>
                <select
                  value={newStatusGizi}
                  onChange={(e) => setNewStatusGizi(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-bold bg-white focus:outline-none cursor-pointer"
                >
                  <option value="Normal">Normal</option>
                  <option value="Gizi Kurang">Gizi Kurang</option>
                  <option value="Stunting">Stunting</option>
                  <option value="Risiko Stunting">Risiko Stunting</option>
                </select>
              </div>

              <div className="flex space-x-2 pt-3">
                <button
                  onClick={handleAddMeasurement}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2.5 rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
                >
                  Simpan Pengukuran
                </button>
                <button
                  onClick={() => setShowQuickAddModal(false)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-100"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
