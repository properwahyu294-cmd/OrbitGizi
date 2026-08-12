import React, { useState, useMemo } from "react";
import { List, Plus, Save, CheckCircle2, Trash2 } from "lucide-react";

interface LocationSelectorFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  isDark?: boolean;
  onSaveOption?: (savedVal: string) => void;
  onDeleteOption?: (valToDelete: string) => void;
}

export function LocationSelectorField({
  label,
  value,
  onChange,
  options,
  placeholder = "Ketik nama baru...",
  isDark = false,
  onSaveOption,
  onDeleteOption
}: LocationSelectorFieldProps) {
  const cleanOptions = useMemo(() => {
    return Array.from(new Set(options.filter(Boolean)));
  }, [options]);

  const isOptionExist = cleanOptions.includes(value);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(!isOptionExist && value !== "" && cleanOptions.length > 0);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "__CUSTOM_NAME__") {
      setIsCustomMode(true);
      onChange("");
    } else {
      setIsCustomMode(false);
      onChange(val);
    }
  };

  const handleSaveDataDasar = () => {
    const valToSave = value.trim();
    if (!valToSave) {
      alert(`Silakan ketik nama ${label} terlebih dahulu.`);
      return;
    }

    if (onSaveOption) {
      onSaveOption(valToSave);
    }
    onChange(valToSave);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
    setIsCustomMode(false);
  };

  return (
    <div className={`p-3 rounded-2xl border transition-all ${
      isDark ? "bg-slate-900/90 border-slate-800 hover:border-slate-700" : "bg-slate-50 border-slate-200 hover:border-slate-300"
    }`}>
      <div className="flex items-center justify-between mb-1.5 gap-2">
        <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-600"}`}>
          {label}
        </span>
        <button
          type="button"
          onClick={() => {
            const nextMode = !isCustomMode;
            setIsCustomMode(nextMode);
            if (!nextMode && cleanOptions.length > 0 && !value) {
              onChange(cleanOptions[0]);
            }
          }}
          className={`text-[10px] font-bold flex items-center space-x-1 px-2 py-0.5 rounded-md cursor-pointer transition-all ${
            isDark 
              ? "bg-slate-800 text-indigo-300 border border-slate-700 hover:bg-indigo-900/50 hover:text-indigo-200 hover:border-indigo-600" 
              : "bg-white text-indigo-600 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700"
          }`}
        >
          {isCustomMode ? (
            <>
              <List className="h-3 w-3" />
              <span>Dropdown</span>
            </>
          ) : (
            <>
              <Plus className="h-3 w-3" />
              <span>Manual</span>
            </>
          )}
        </button>
      </div>

      {isCustomMode || cleanOptions.length === 0 ? (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={value}
              placeholder={placeholder}
              onChange={(e) => onChange(e.target.value)}
              className={`flex-1 min-w-0 rounded-xl text-xs sm:text-sm font-bold px-3 py-2 border focus:ring-2 focus:ring-indigo-500/30 focus:outline-none transition-all ${
                isDark 
                  ? "bg-slate-950 border-indigo-500/80 text-white placeholder-slate-500 shadow-inner" 
                  : "bg-white border-indigo-400 text-slate-900 placeholder-slate-400"
              }`}
            />
            <button
              type="button"
              onClick={handleSaveDataDasar}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-md cursor-pointer transition-all flex items-center space-x-1 shrink-0"
              title="Simpan sebagai Data Dasar"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Simpan</span>
            </button>
          </div>
          {savedSuccess && (
            <div className="flex items-center space-x-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-lg animate-in fade-in">
              <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
              <span>Tersimpan sebagai Data Dasar!</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <select
              value={cleanOptions.includes(value) ? value : (value || "")}
              onChange={handleSelectChange}
              className={`flex-1 min-w-0 rounded-xl text-xs sm:text-sm font-bold px-3 py-2 border focus:ring-2 focus:ring-indigo-500/30 focus:outline-none cursor-pointer transition-all ${
                isDark ? "bg-slate-950 border-slate-700/80 text-white hover:border-slate-600" : "bg-white border-slate-300 text-slate-800"
              }`}
            >
              {!value && <option value="">-- Pilih {label} --</option>}
              {cleanOptions.map((opt) => (
                <option key={opt} value={opt} className={isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>
                  {opt}
                </option>
              ))}
              <option value="__CUSTOM_NAME__" className={isDark ? "bg-slate-900 text-indigo-300 font-bold" : "bg-white text-indigo-600 font-bold"}>
                ✏️ + Ketik & Simpan Manual...
              </option>
            </select>
            {value && onDeleteOption && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Hapus nama "${value}" dari daftar ${label}?`)) {
                    onDeleteOption(value);
                    onChange("");
                  }
                }}
                className={`px-2.5 py-2 text-rose-500 hover:text-rose-600 rounded-xl transition-all border shrink-0 cursor-pointer flex items-center space-x-1 ${
                  isDark 
                    ? "bg-slate-950 border-rose-900/60 hover:bg-rose-950/60" 
                    : "bg-white border-rose-200 hover:bg-rose-50"
                }`}
                title={`Hapus "${value}" dari daftar ${label}`}
              >
                <Trash2 className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[10px] font-bold">Hapus</span>
              </button>
            )}
          </div>
          {savedSuccess && (
            <div className="flex items-center space-x-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-lg animate-in fade-in">
              <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
              <span>Tersimpan di daftar!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
