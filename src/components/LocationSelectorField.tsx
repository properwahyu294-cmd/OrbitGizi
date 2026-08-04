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
    <div className={`p-2.5 rounded-xl border transition-all ${
      isDark ? "bg-slate-800/80 border-slate-700/80" : "bg-slate-50 border-slate-200"
    }`}>
      <div className="flex items-center justify-between mb-1 gap-1">
        <span className={`text-[9px] font-black uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
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
          className={`text-[9px] font-extrabold flex items-center space-x-0.5 cursor-pointer transition-colors ${
            isDark ? "text-indigo-300 hover:text-indigo-200" : "text-indigo-600 hover:text-indigo-800"
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
              <span>Input Manual</span>
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
            className={`w-full rounded-lg text-xs font-black p-1.5 border focus:ring-2 focus:ring-indigo-500/20 focus:outline-none ${
              isDark 
                ? "bg-slate-900 border-indigo-500 text-white placeholder-slate-500" 
                : "bg-white border-indigo-400 text-slate-900 placeholder-slate-400"
            }`}
          />
        </div>
      ) : (
        <select
          value={cleanOptions.includes(value) ? value : (value || "")}
          onChange={handleSelectChange}
          className={`w-full rounded-lg text-xs font-black p-1.5 border focus:ring-2 focus:ring-indigo-500/20 focus:outline-none cursor-pointer ${
            isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-800"
          }`}
        >
          {!value && <option value="">-- Pilih {label} --</option>}
          {cleanOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
          <option value="__CUSTOM_NAME__">✏️ + Ketik Nama Sesuai Kebutuhan...</option>
        </select>
      )}
    </div>
  );
}
