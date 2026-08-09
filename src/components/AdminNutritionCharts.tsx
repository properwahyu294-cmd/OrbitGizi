import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { Activity, PieChart as PieIcon, BarChart3, TrendingUp } from "lucide-react";

interface AdminNutritionChartsProps {
  beneficiariesCount: number;
}

export const AdminNutritionCharts: React.FC<AdminNutritionChartsProps> = ({ beneficiariesCount }) => {
  // Nutritional status breakdown data
  const nutritionStatusData = [
    { name: "Normal / Sehat", count: Math.max(120, beneficiariesCount * 3), color: "#10b981" }, // Emerald
    { name: "Rentan Stunting", count: Math.max(25, Math.floor(beneficiariesCount * 0.6)), color: "#f59e0b" }, // Amber
    { name: "Gizi Kurang (Wasting)", count: Math.max(15, Math.floor(beneficiariesCount * 0.35)), color: "#ef4444" }, // Rose
    { name: "KEK (Ibu Hamil)", count: Math.max(10, Math.floor(beneficiariesCount * 0.25)), color: "#8b5cf6" }, // Purple
  ];

  // Monthly intervention & distribution trend data
  const monthlyTrendData = [
    { month: "Jan", mbg: 320, pmt: 210, posyandu: 110 },
    { month: "Feb", mbg: 380, pmt: 240, posyandu: 125 },
    { month: "Mar", mbg: 420, pmt: 290, posyandu: 132 },
    { month: "Apr", mbg: 490, pmt: 310, posyandu: 138 },
    { month: "Mei", mbg: 540, pmt: 350, posyandu: 140 },
    { month: "Jun", mbg: 610, pmt: 390, posyandu: 142 },
  ];

  const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* CHART 1: NUTRITIONAL STATUS PIE / DONUT */}
      <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <PieIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">Distribusi Status Gizi Sasaran</h3>
              <p className="text-[11px] text-slate-500 font-medium">Pemantauan berat/tinggi badan & KEK berbasis e-PPGBM</p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black rounded-full">
            Real-Time
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={nutritionStatusData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                dataKey="count"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {nutritionStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                formatter={(value) => <span className="text-xs font-bold text-slate-700">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          {nutritionStatusData.map((item, i) => (
            <div key={i} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-bold block truncate">{item.name}</span>
              <span className="text-sm font-black text-slate-800">{item.count} Jiwa</span>
            </div>
          ))}
        </div>
      </div>

      {/* CHART 2: MONTHLY INTERVENTION BAR CHART */}
      <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">Tren Bulanan Intervensi & Posyandu</h3>
              <p className="text-[11px] text-slate-500 font-medium">Cakupan Makanan Bergizi Gratis (MBG) & PMT 2026</p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-black rounded-full">
            6 Bulan Terakhir
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                formatter={(value) => <span className="text-xs font-bold text-slate-700">{value === "mbg" ? "Penerima MBG" : value === "pmt" ? "Penerima PMT" : "Posyandu"}</span>}
              />
              <Bar dataKey="mbg" fill="#3b82f6" radius={[6, 6, 0, 0]} name="mbg" />
              <Bar dataKey="pmt" fill="#10b981" radius={[6, 6, 0, 0]} name="pmt" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
          <div className="bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
            <span className="text-[10px] text-blue-700 font-bold block">Total MBG Juni</span>
            <span className="text-sm font-black text-blue-900">610 Jiwa</span>
          </div>
          <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
            <span className="text-[10px] text-emerald-700 font-bold block">Total PMT Juni</span>
            <span className="text-sm font-black text-emerald-900">390 Jiwa</span>
          </div>
          <div className="bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100">
            <span className="text-[10px] text-indigo-700 font-bold block">Posyandu Aktif</span>
            <span className="text-sm font-black text-indigo-900">142 Pos</span>
          </div>
        </div>
      </div>

    </div>
  );
};
