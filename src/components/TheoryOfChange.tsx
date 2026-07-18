import { ArrowRight, Database, Settings, BarChart3, Users, Heart } from "lucide-react";

export default function TheoryOfChange({ onInputClick }: { onInputClick?: () => void }) {
  const steps = [
    {
      title: "INPUT",
      icon: <Database className="h-5 w-5 text-indigo-500" />,
      color: "border-indigo-200 bg-indigo-50/50 text-indigo-900",
      accent: "bg-indigo-500",
      items: ["Data MBG", "Data PMT", "Data Posyandu", "Data e-PPGBM"],
    },
    {
      title: "PROSES",
      icon: <Settings className="h-5 w-5 text-cyan-500" />,
      color: "border-cyan-200 bg-cyan-50/50 text-cyan-900",
      accent: "bg-cyan-500",
      items: ["Integrasi data", "Validasi Berjenjang", "Analisis Risiko"],
    },
    {
      title: "OUTPUT",
      icon: <BarChart3 className="h-5 w-5 text-emerald-500" />,
      color: "border-emerald-200 bg-emerald-50/50 text-emerald-900",
      accent: "bg-emerald-500",
      items: ["Dashboard Online", "Peta Risiko Interaktif", "Prioritas Sasaran"],
    },
    {
      title: "OUTCOME",
      icon: <Users className="h-5 w-5 text-amber-500" />,
      color: "border-amber-200 bg-amber-50/50 text-amber-900",
      accent: "bg-amber-500",
      items: ["Intervensi Tepat", "Kolaborasi OPD", "Efisiensi Program"],
    },
    {
      title: "IMPACT",
      icon: <Heart className="h-5 w-5 text-rose-500" />,
      color: "border-rose-200 bg-rose-50/50 text-rose-900",
      accent: "bg-rose-500",
      items: ["Penurunan Stunting", "Transformasi Layanan", "Masyarakat Sehat"],
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs mb-6" id="theory-of-change">
      <div className="mb-4">
        <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase">
          FONDASI DASHBOARD (LOGICAL FRAMEWORK & IMPACT PATHWAY)
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Alur transformasi pelayanan gizi terpadu dari pengumpulan data hingga peningkatan derajat kesehatan masyarakat. Klik <strong className="text-indigo-600">INPUT</strong> untuk mengelola data gizi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {steps.map((step, idx) => {
          const isInputStep = idx === 0;
          return (
            <div key={idx} className="relative flex flex-col">
              <div 
                onClick={() => {
                  if (isInputStep && onInputClick) {
                    onInputClick();
                  }
                }}
                className={`flex-1 rounded-xl p-4 border ${step.color} relative overflow-hidden transition-all duration-300 group ${
                  isInputStep && onInputClick 
                    ? "cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/80 active:scale-[0.99] hover:shadow-sm" 
                    : "hover:shadow-xs"
                }`}
              >
                {/* Thick vertical accent bar on the left */}
                <div className={`absolute top-0 left-0 w-[5px] h-full ${step.accent}`}></div>
                
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {step.icon}
                    <span className="text-[11px] font-black tracking-wider uppercase text-slate-900">{step.title}</span>
                  </div>
                  
                  {/* Arrow trigger for INPUT step matching the uploaded diagram */}
                  {isInputStep && onInputClick && (
                    <div className="bg-white border border-slate-200 shadow-2xs h-6 w-6 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 group-hover:scale-110 group-hover:border-indigo-300 transition-all">
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  )}
                </div>

                <ul className="space-y-1.5">
                  {step.items.map((item, iIndex) => (
                    <li key={iIndex} className="text-xs font-semibold flex items-center space-x-1.5 text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-2 transform -translate-y-1/2 z-10 bg-white rounded-full p-0.5 border border-slate-200 shadow-xs">
                  <ArrowRight className="h-3 w-3 text-slate-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
