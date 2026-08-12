const fs = require('fs');
const file = 'src/components/AdminNutritionCharts.tsx';
let code = fs.readFileSync(file, 'utf-8');

// Update imports
if (!code.includes('MBGBeneficiary')) {
    code = code.replace('import React from "react";', 'import React from "react";\nimport { MBGBeneficiary } from "../types";');
}

// Update props
code = code.replace('interface AdminNutritionChartsProps {\n  beneficiariesCount: number;\n}', 
`interface AdminNutritionChartsProps {
  beneficiaries: MBGBeneficiary[];
}`);

code = code.replace('export const AdminNutritionCharts: React.FC<AdminNutritionChartsProps> = ({ beneficiariesCount }) => {',
`export const AdminNutritionCharts: React.FC<AdminNutritionChartsProps> = ({ beneficiaries }) => {
  // Calculate real nutritional status data
  let normal = 0, rentan = 0, giziKurang = 0, kek = 0;
  
  beneficiaries.forEach(b => {
    let status = b.initialStatusGizi;
    if (b.weightRecords && b.weightRecords.length > 0) {
      status = b.weightRecords[b.weightRecords.length - 1].statusGizi || status;
    }
    
    if (status === "Normal") normal++;
    else if (status === "Risiko Stunting") rentan++;
    else if (status === "Gizi Kurang" || status === "Stunting") giziKurang++;
    else if (b.category === "Ibu Hamil" && status !== "Normal") kek++;
    else if (!status) normal++; // default to normal if not set
  });

  const nutritionStatusData = [
    { name: "Normal / Sehat", count: normal, color: "#10b981" },
    { name: "Rentan Stunting", count: rentan, color: "#f59e0b" },
    { name: "Gizi Kurang (Wasting)", count: giziKurang, color: "#ef4444" },
    { name: "KEK (Ibu Hamil)", count: kek, color: "#8b5cf6" },
  ];

  // For monthly trend, let's look at the periods in weightRecords.
  // This is a simplified realistic approach based on actual records, or if no records, fallback to current totals.
  const periodMap = new Map();
  beneficiaries.forEach(b => {
    if (b.weightRecords && b.weightRecords.length > 0) {
      b.weightRecords.forEach(r => {
        if (!periodMap.has(r.period)) {
          periodMap.set(r.period, { month: r.period, mbg: 0, pmt: 0, posyandu: new Set() });
        }
        const p = periodMap.get(r.period);
        if (b.isReceivedMBG !== false) p.mbg++;
        if (b.isReceivedPMT !== false) p.pmt++;
        if (b.location.posyandu) p.posyandu.add(b.location.posyandu);
      });
    }
  });

  let monthlyTrendData = Array.from(periodMap.values()).map(p => ({
    month: p.month.replace("2026", "").trim().substring(0, 3), // short name
    mbg: p.mbg,
    pmt: p.pmt,
    posyandu: p.posyandu.size,
    originalMonth: p.month
  })).sort((a,b) => {
     // A very simple sort if needed, but usually they are already in order of creation if we just take them
     return 0; 
  });

  // If no data, fallback to showing current totals as one data point
  if (monthlyTrendData.length === 0) {
    let currentMbg = 0, currentPmt = 0;
    let posyandus = new Set();
    beneficiaries.forEach(b => {
      if (b.isReceivedMBG !== false) currentMbg++;
      if (b.isReceivedPMT !== false) currentPmt++;
      if (b.location.posyandu) posyandus.add(b.location.posyandu);
    });
    monthlyTrendData = [{
       month: "Saat Ini",
       mbg: currentMbg,
       pmt: currentPmt,
       posyandu: posyandus.size,
       originalMonth: "Saat Ini"
    }];
  }

  // Get the last item for the summary blocks
  const lastTrend = monthlyTrendData[monthlyTrendData.length - 1] || { mbg: 0, pmt: 0, posyandu: 0, month: "Data" };
  const totalMBG = lastTrend.mbg;
  const totalPMT = lastTrend.pmt;
  const totalPosyandu = lastTrend.posyandu;
  const lastTrendLabel = lastTrend.originalMonth || lastTrend.month;
`);

code = code.replace(/const nutritionStatusData = \[[\s\S]*?\];/, '');
code = code.replace(/const monthlyTrendData = \[[\s\S]*?\];/, '');

code = code.replace('Total MBG Juni', 'Total MBG {lastTrendLabel}');
code = code.replace('Total PMT Juni', 'Total PMT {lastTrendLabel}');
code = code.replace('>610 Jiwa<', '>{totalMBG} Jiwa<');
code = code.replace('>390 Jiwa<', '>{totalPMT} Jiwa<');
code = code.replace('>142 Pos<', '>{totalPosyandu} Pos<');

// Fix string interpolation
code = code.replace('Total MBG {lastTrendLabel}', 'Total MBG {lastTrendLabel}'); // React will render it as literal if not in {}. 
// We need to use `{Total MBG ${lastTrendLabel}}` properly.
code = code.replace('>Total MBG {lastTrendLabel}<', '>{`Total MBG ${lastTrendLabel}`}<');
code = code.replace('>Total PMT {lastTrendLabel}<', '>{`Total PMT ${lastTrendLabel}`}<');

fs.writeFileSync(file, code);
