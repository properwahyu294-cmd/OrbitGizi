import React, { useState, useMemo } from "react";
import { List, Plus } from "lucide-react";

interface LocationSelectorFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  isDark?: boolean;
}

export function LocationSelectorField({
  label,
  value,
  onChange,
  options,
  placeholder = "Ketik nama baru...",
  isDark = true
}: LocationSelectorFieldProps) {
  const cleanOptions = useMemo(() => {
    const list = Array.from(new Set(options.filter(Boolean)));
    return list;
  }, [options]);

  const isOptionExist = cleanOptions.includes(value);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(!isOptionExist && value !== "" && cleanOptions.length > 0);

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
        <div className="relative">
          <input
            type="text"
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full rounded-xl text-xs sm:text-sm font-bold px-3 py-2 border focus:ring-2 focus:ring-indigo-500/30 focus:outline-none transition-all ${
              isDark 
                ? "bg-slate-950 border-indigo-500/80 text-white placeholder-slate-500 shadow-inner" 
                : "bg-white border-indigo-400 text-slate-900 placeholder-slate-400"
            }`}
          />
        </div>
      ) : (
        <select
          value={cleanOptions.includes(value) ? value : (value || "")}
          onChange={handleSelectChange}
          className={`w-full rounded-xl text-xs sm:text-sm font-bold px-3 py-2 border focus:ring-2 focus:ring-indigo-500/30 focus:outline-none cursor-pointer transition-all ${
            isDark ? "bg-slate-950 border-slate-700/80 text-white hover:border-slate-600" : "bg-white border-slate-300 text-slate-800"
          }`}
        >
          {!value && <option value="">-- Pilih {label} --</option>}
          {cleanOptions.map((opt) => (
            <option key={opt} value={opt} className="bg-slate-900 text-white">
              {opt}
            </option>
          ))}
          <option value="__CUSTOM_NAME__" className="bg-slate-900 text-indigo-300 font-bold">✏️ + Ketik Manual...</option>
        </select>
      )}
    </div>
  );
}
