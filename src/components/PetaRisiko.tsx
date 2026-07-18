import { 
  MapPin, 
  Info, 
  Edit3, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Trash2, 
  Plus, 
  RefreshCcw,
  ShieldCheck,
  Check,
  Database,
  Users2,
  Cpu,
  Activity,
  Award
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Village } from "../types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface PetaRisikoProps {
  villages: Village[];
  onVillageUpdate: (updatedVillage: Partial<Village>) => Promise<void>;
  onVillageAdd: (name: string) => Promise<void>;
  onVillageDelete: (id: string) => Promise<void>;
  onResetData: () => Promise<void>;
}

export default function PetaRisiko({ 
  villages, 
  onVillageUpdate, 
  onVillageAdd, 
  onVillageDelete,
  onResetData
}: PetaRisikoProps) {
  // Select first village initially, or keep the selected one if still exists
  const [selectedVillageId, setSelectedVillageId] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"p1" | "p2" | "p3" | "p4" | "p5">("p1");

  // New Village state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newVillageName, setNewVillageName] = useState<string>("");
  const [adding, setAdding] = useState<boolean>(false);

  // Edit fields
  const [editName, setEditName] = useState<string>("");
  const [editX, setEditX] = useState<number>(50);
  const [editY, setEditY] = useState<number>(50);

  // Leaflet map refs
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<{ [key: string]: L.CircleMarker }>({});

  // Clean up Leaflet on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update map markers when villages or selected village changes
  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(containerRef.current, {
        center: [-8.68, 121.23], // Center of Nagekeo
        zoom: 11,
        zoomControl: true,
        attributionControl: false,
      });

      // CartoDB Positron light style fits the aesthetic perfectly!
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
    }

    const map = mapRef.current;

    // Remove existing markers
    Object.keys(markersRef.current).forEach((key) => {
      const marker = markersRef.current[key];
      if (marker) {
        marker.remove();
      }
    });
    markersRef.current = {};

    // Create new markers
    villages.forEach((v) => {
      if (typeof v.coordinates?.y !== "number" || typeof v.coordinates?.x !== "number") return;
      
      const isSelected = v.id === selectedVillageId;

      const markerColor = v.riskLevel === "Merah" 
        ? "#ef4444" 
        : v.riskLevel === "Kuning" 
        ? "#f59e0b" 
        : "#10b981";

      const marker = L.circleMarker([v.coordinates.y, v.coordinates.x], {
        radius: isSelected ? 12 : 8,
        fillColor: markerColor,
        color: isSelected ? "#0f172a" : "#ffffff",
        weight: isSelected ? 3 : 1.5,
        fillOpacity: 0.85,
      }).addTo(map);

      marker.bindTooltip(
        `<div class="font-sans text-xs p-1">
          <strong class="text-slate-900">${v.name}</strong><br/>
          <span class="text-[10px] font-semibold text-slate-500">Skor: ${v.score} pts • Zona ${v.riskLevel}</span>
        </div>`,
        {
          direction: "top",
          offset: [0, -5],
          className: "rounded-lg border border-slate-200 bg-white shadow-md p-1 font-sans",
        }
      );

      marker.on("click", () => {
        handleSelectVillage(v);
      });

      markersRef.current[v.id] = marker;
    });

    // Animate map view to selected village coordinate
    const selected = villages.find((v) => v.id === selectedVillageId);
    if (selected && typeof selected.coordinates?.y === "number" && typeof selected.coordinates?.x === "number") {
      map.setView([selected.coordinates.y, selected.coordinates.x], map.getZoom(), {
        animate: true,
      });
    }
  }, [villages, selectedVillageId]);

  // Pilar 1 Inputs
  const [p1MbgSync, setP1MbgSync] = useState<number>(0);
  const [p1MbgTotal, setP1MbgTotal] = useState<number>(100);
  const [p1PmtSync, setP1PmtSync] = useState<number>(0);
  const [p1PmtTotal, setP1PmtTotal] = useState<number>(20);
  const [p1PosSync, setP1PosSync] = useState<number>(0);
  const [p1PosTotal, setP1PosTotal] = useState<number>(3);
  const [p1EppSync, setP1EppSync] = useState<number>(0);
  const [p1EppTotal, setP1EppTotal] = useState<number>(100);

  // Pilar 2 Inputs
  const [p2Dinkes, setP2Dinkes] = useState<boolean>(false);
  const [p2Bgn, setP2Bgn] = useState<boolean>(false);
  const [p2Pkk, setP2Pkk] = useState<boolean>(false);
  const [p2Pemdes, setP2Pemdes] = useState<boolean>(false);
  const [p2Puskesmas, setP2Puskesmas] = useState<boolean>(false);

  // Pilar 3 Inputs
  const [p3Dashboard, setP3Dashboard] = useState<boolean>(false);
  const [p3Validasi, setP3Validasi] = useState<boolean>(false);
  const [p3Realtime, setP3Realtime] = useState<boolean>(false);

  // Pilar 4 Inputs
  const [p4MbgRealized, setP4MbgRealized] = useState<number>(0);
  const [p4MbgTarget, setP4MbgTarget] = useState<number>(100);
  const [p4PmtRealized, setP4PmtRealized] = useState<number>(0);
  const [p4PmtTarget, setP4PmtTarget] = useState<number>(20);
  const [p4HomeRealized, setP4HomeRealized] = useState<number>(0);
  const [p4HomeTarget, setP4HomeTarget] = useState<number>(10);
  const [p4PosActive, setP4PosActive] = useState<number>(0);
  const [p4PosTotal, setP4PosTotal] = useState<number>(3);

  // Pilar 5 Inputs
  const [p5StuntingPrev, setP5StuntingPrev] = useState<number>(10);
  const [p5StuntingCurr, setP5StuntingCurr] = useState<number>(10);
  const [p5WastingPrev, setP5WastingPrev] = useState<number>(5);
  const [p5WastingCurr, setP5WastingCurr] = useState<number>(5);
  const [p5TargetAccuracy, setP5TargetAccuracy] = useState<number>(75);

  // Auto-select first village on mount or when villages change
  useEffect(() => {
    if (villages.length > 0) {
      if (!selectedVillageId || !villages.some(v => v.id === selectedVillageId)) {
        handleSelectVillage(villages[0]);
      }
    } else {
      setSelectedVillageId("");
    }
  }, [villages]);

  const selectedVillage = villages.find((v) => v.id === selectedVillageId) || villages[0];

  const handleSelectVillage = (v: Village) => {
    if (!v) return;
    setSelectedVillageId(v.id);
    setEditName(v.name);
    setEditX(v.coordinates.x);
    setEditY(v.coordinates.y);

    // Load inputs
    setP1MbgSync(v.pilar1_mbg_sync);
    setP1MbgTotal(v.pilar1_mbg_total);
    setP1PmtSync(v.pilar1_pmt_sync);
    setP1PmtTotal(v.pilar1_pmt_total);
    setP1PosSync(v.pilar1_posyandu_sync);
    setP1PosTotal(v.pilar1_posyandu_total);
    setP1EppSync(v.pilar1_eppgbm_sync);
    setP1EppTotal(v.pilar1_eppgbm_total);

    setP2Dinkes(v.pilar2_dinkes_aktif);
    setP2Bgn(v.pilar2_bgn_aktif);
    setP2Pkk(v.pilar2_pkk_aktif);
    setP2Pemdes(v.pilar2_pemdes_aktif);
    setP2Puskesmas(v.pilar2_puskesmas_aktif);

    setP3Dashboard(v.pilar3_dashboard_online);
    setP3Validasi(v.pilar3_validasi_data);
    setP3Realtime(v.pilar3_real_time_update);

    setP4MbgRealized(v.pilar4_mbg_realized);
    setP4MbgTarget(v.pilar4_mbg_target);
    setP4PmtRealized(v.pilar4_pmt_realized);
    setP4PmtTarget(v.pilar4_pmt_target);
    setP4HomeRealized(v.pilar4_home_visit);
    setP4HomeTarget(v.pilar4_home_visit_target);
    setP4PosActive(v.pilar4_posyandu_aktif);
    setP4PosTotal(v.pilar4_posyandu_total);

    setP5StuntingPrev(v.pilar5_stunting_prev);
    setP5StuntingCurr(v.pilar5_stunting_curr);
    setP5WastingPrev(v.pilar5_wasting_prev);
    setP5WastingCurr(v.pilar5_wasting_curr);
    setP5TargetAccuracy(v.pilar5_target_accuracy);

    setIsEditing(false);
  };

  const startEdit = () => {
    setIsEditing(true);
    setActiveTab("p1");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onVillageUpdate({
        id: selectedVillage.id,
        name: editName,
        coordinates: { x: editX, y: editY },
        pilar1_mbg_sync: p1MbgSync,
        pilar1_mbg_total: p1MbgTotal,
        pilar1_pmt_sync: p1PmtSync,
        pilar1_pmt_total: p1PmtTotal,
        pilar1_posyandu_sync: p1PosSync,
        pilar1_posyandu_total: p1PosTotal,
        pilar1_eppgbm_sync: p1EppSync,
        pilar1_eppgbm_total: p1EppTotal,

        pilar2_dinkes_aktif: p2Dinkes,
        pilar2_bgn_aktif: p2Bgn,
        pilar2_pkk_aktif: p2Pkk,
        pilar2_pemdes_aktif: p2Pemdes,
        pilar2_puskesmas_aktif: p2Puskesmas,

        pilar3_dashboard_online: p3Dashboard,
        pilar3_validasi_data: p3Validasi,
        pilar3_real_time_update: p3Realtime,

        pilar4_mbg_realized: p4MbgRealized,
        pilar4_mbg_target: p4MbgTarget,
        pilar4_pmt_realized: p4PmtRealized,
        pilar4_pmt_target: p4PmtTarget,
        pilar4_home_visit: p4HomeRealized,
        pilar4_home_visit_target: p4HomeTarget,
        pilar4_posyandu_aktif: p4PosActive,
        pilar4_posyandu_total: p4PosTotal,

        pilar5_stunting_prev: p5StuntingPrev,
        pilar5_stunting_curr: p5StuntingCurr,
        pilar5_wasting_prev: p5WastingPrev,
        pilar5_wasting_curr: p5WastingCurr,
        pilar5_target_accuracy: p5TargetAccuracy,
      });
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleAddVillage = async () => {
    if (!newVillageName.trim()) return;
    setAdding(true);
    try {
      await onVillageAdd(newVillageName);
      setNewVillageName("");
      setShowAddModal(false);
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteVillage = async () => {
    if (!selectedVillage) return;
    if (confirm(`Apakah Anda yakin ingin menghapus data Desa "${selectedVillage.name}" secara permanen?`)) {
      try {
        await onVillageDelete(selectedVillage.id);
        setSelectedVillageId("");
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Get color for villages
  const getRiskColor = (level: string) => {
    switch (level) {
      case "Hijau":
        return {
          bg: "bg-emerald-500",
          border: "border-emerald-600",
          pulse: "bg-emerald-400",
          text: "text-emerald-600",
          badge: "bg-emerald-50 text-emerald-800 border-emerald-100",
        };
      case "Kuning":
        return {
          bg: "bg-amber-500",
          border: "border-amber-600",
          pulse: "bg-amber-400",
          text: "text-amber-600",
          badge: "bg-amber-50 text-amber-800 border-amber-100",
        };
      default:
        return {
          bg: "bg-rose-500",
          border: "border-rose-600",
          pulse: "bg-rose-400",
          text: "text-rose-600",
          badge: "bg-rose-50 text-rose-800 border-rose-100",
        };
    }
  };

  // Safe percentage helper
  const getPercentage = (num: number, total: number) => {
    if (total <= 0) return 100;
    return Math.round((num / total) * 100);
  };

  const isChanged = !!selectedVillage && (
    editName !== selectedVillage.name ||
    editX !== selectedVillage.coordinates.x ||
    editY !== selectedVillage.coordinates.y ||
    p1MbgSync !== selectedVillage.pilar1_mbg_sync ||
    p1MbgTotal !== selectedVillage.pilar1_mbg_total ||
    p1PmtSync !== selectedVillage.pilar1_pmt_sync ||
    p1PmtTotal !== selectedVillage.pilar1_pmt_total ||
    p1PosSync !== selectedVillage.pilar1_posyandu_sync ||
    p1PosTotal !== selectedVillage.pilar1_posyandu_total ||
    p1EppSync !== selectedVillage.pilar1_eppgbm_sync ||
    p1EppTotal !== selectedVillage.pilar1_eppgbm_total ||
    p2Dinkes !== selectedVillage.pilar2_dinkes_aktif ||
    p2Bgn !== selectedVillage.pilar2_bgn_aktif ||
    p2Pkk !== selectedVillage.pilar2_pkk_aktif ||
    p2Pemdes !== selectedVillage.pilar2_pemdes_aktif ||
    p2Puskesmas !== selectedVillage.pilar2_puskesmas_aktif ||
    p3Dashboard !== selectedVillage.pilar3_dashboard_online ||
    p3Validasi !== selectedVillage.pilar3_validasi_data ||
    p3Realtime !== selectedVillage.pilar3_real_time_update ||
    p4MbgRealized !== selectedVillage.pilar4_mbg_realized ||
    p4MbgTarget !== selectedVillage.pilar4_mbg_target ||
    p4PmtRealized !== selectedVillage.pilar4_pmt_realized ||
    p4PmtTarget !== selectedVillage.pilar4_pmt_target ||
    p4HomeRealized !== selectedVillage.pilar4_home_visit ||
    p4HomeTarget !== selectedVillage.pilar4_home_visit_target ||
    p4PosActive !== selectedVillage.pilar4_posyandu_aktif ||
    p4PosTotal !== selectedVillage.pilar4_posyandu_total ||
    p5StuntingPrev !== selectedVillage.pilar5_stunting_prev ||
    p5StuntingCurr !== selectedVillage.pilar5_stunting_curr ||
    p5WastingPrev !== selectedVillage.pilar5_wasting_prev ||
    p5WastingCurr !== selectedVillage.pilar5_wasting_curr ||
    p5TargetAccuracy !== selectedVillage.pilar5_target_accuracy
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mb-6" id="peta-risiko">
      {/* Header Panel */}
      <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase">
            SISTEM MANAJEMEN DATA & PETA KINERJA DESA RIIL
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            <strong>Tanpa data dummy</strong> • Input nama desa & data aslinya di bawah untuk menghitung indeks secara otomatis.
          </p>
        </div>
        
        {/* Actions bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 rounded-xl shadow-2xs transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Desa</span>
          </button>

          <button
            onClick={onResetData}
            title="Reset data ke kondisi semula"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-xl shadow-2xs transition-all"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            <span>Reset Basis Data</span>
          </button>

          {selectedVillage && (
            <button
              onClick={handleDeleteVillage}
              className="inline-flex items-center p-2 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl transition-all"
              title="Hapus Desa Terpilih"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        
        {/* Geo Map Grid (col-span-6) */}
        <div className="lg:col-span-6 bg-slate-100 h-[420px] relative border-r border-slate-200">
          <div ref={containerRef} className="w-full h-full z-0" />
          
          <div className="absolute bottom-4 left-4 text-[10px] text-slate-700 font-mono tracking-widest pointer-events-none z-10 bg-white/90 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-slate-200/80 shadow-xs">
            GEO-MAP: {villages.length} DESA AKTIF • KABUPATEN NAGEKEO
          </div>

          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-[10px] font-semibold flex items-center space-x-1.5 z-10 shadow-sm">
            <Info className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
            <span>Peta Interaktif Nagekeo - Pilih pin desa</span>
          </div>

          {villages.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/95 p-6 z-20 text-center">
              <AlertCircle className="h-10 w-10 text-slate-500 mx-auto mb-2" />
              <p className="text-xs text-slate-700 font-bold">Tidak ada desa di peta.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors"
              >
                Tambah Desa Pertama
              </button>
            </div>
          )}
        </div>

        {/* Selected Village Info & Dynamic Interactive Editor (col-span-6) */}
        <div className="lg:col-span-6 p-6 flex flex-col justify-between bg-slate-50/20 max-h-[420px] overflow-y-auto">
          {selectedVillage ? (
            <div className="space-y-5">
              {/* Village Header & Info */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[9px] font-extrabold border ${getRiskColor(selectedVillage.riskLevel).badge}`}>
                      Zona {selectedVillage.riskLevel}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">ID: {selectedVillage.id}</span>
                  </div>
                  <h4 className="text-base font-black text-slate-800 mt-1">{selectedVillage.name}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Skor Kinerja Saat Ini: <strong className="text-slate-700">{selectedVillage.score} pts</strong></p>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={handleSave}
                    disabled={!isChanged || saving}
                    className={`inline-flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all ${
                      isChanged
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse cursor-pointer animate-duration-1000"
                        : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                    }`}
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{saving ? "Menyimpan..." : isChanged ? "Simpan Perubahan" : "Sudah Tersimpan"}</span>
                  </button>
                  {isChanged && (
                    <button
                      onClick={() => handleSelectVillage(selectedVillage)}
                      title="Batalkan perubahan"
                      className="p-2 text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Form Content */}
              <div className="space-y-4">
                {/* Section: Nama & Lokasi */}
                <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-200/50 space-y-2.5">
                  <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase block">INFO & KOORDINAT DESA</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[8px] font-bold text-slate-500 uppercase mb-0.5">Nama Desa</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full text-xs font-bold px-2 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-slate-500 uppercase mb-0.5">Bujur (Lng)</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={editX}
                        onChange={(e) => setEditX(parseFloat(e.target.value) || 0)}
                        className="w-full text-xs font-bold px-2 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-slate-500 uppercase mb-0.5">Lintang (Lat)</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={editY}
                        onChange={(e) => setEditY(parseFloat(e.target.value) || 0)}
                        className="w-full text-xs font-bold px-2 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Pilar 1 - Integrasi Data Gizi */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                    <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase flex items-center space-x-1">
                      <Database className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <span>P1: INTEGRASI DATA GIZI (SINKRON / TOTAL)</span>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[8px] font-bold text-slate-500 uppercase mb-0.5">MBG Sinkron / Total</label>
                      <div className="flex items-center space-x-1 bg-slate-50/50 p-1 rounded-lg border border-slate-200">
                        <input
                          type="number" min="0" value={p1MbgSync}
                          onChange={(e) => setP1MbgSync(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-1/2 text-xs font-extrabold px-1.5 py-1 bg-white text-center rounded border border-slate-200 focus:outline-none"
                        />
                        <span className="text-slate-400 font-bold text-xs">/</span>
                        <input
                          type="number" min="1" value={p1MbgTotal}
                          onChange={(e) => setP1MbgTotal(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-1/2 text-xs font-extrabold px-1.5 py-1 bg-white text-center rounded border border-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[8px] font-bold text-slate-500 uppercase mb-0.5">e-PPGBM Sinkron / Total</label>
                      <div className="flex items-center space-x-1 bg-slate-50/50 p-1 rounded-lg border border-slate-200">
                        <input
                          type="number" min="0" value={p1EppSync}
                          onChange={(e) => setP1EppSync(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-1/2 text-xs font-extrabold px-1.5 py-1 bg-white text-center rounded border border-slate-200 focus:outline-none"
                        />
                        <span className="text-slate-400 font-bold text-xs">/</span>
                        <input
                          type="number" min="1" value={p1EppTotal}
                          onChange={(e) => setP1EppTotal(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-1/2 text-xs font-extrabold px-1.5 py-1 bg-white text-center rounded border border-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[8px] font-bold text-slate-500 uppercase mb-0.5">PMT Sinkron / Total</label>
                      <div className="flex items-center space-x-1 bg-slate-50/50 p-1 rounded-lg border border-slate-200">
                        <input
                          type="number" min="0" value={p1PmtSync}
                          onChange={(e) => setP1PmtSync(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-1/2 text-xs font-extrabold px-1.5 py-1 bg-white text-center rounded border border-slate-200 focus:outline-none"
                        />
                        <span className="text-slate-400 font-bold text-xs">/</span>
                        <input
                          type="number" min="1" value={p1PmtTotal}
                          onChange={(e) => setP1PmtTotal(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-1/2 text-xs font-extrabold px-1.5 py-1 bg-white text-center rounded border border-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[8px] font-bold text-slate-500 uppercase mb-0.5">Posyandu Sinkron / Total</label>
                      <div className="flex items-center space-x-1 bg-slate-50/50 p-1 rounded-lg border border-slate-200">
                        <input
                          type="number" min="0" value={p1PosSync}
                          onChange={(e) => setP1PosSync(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-1/2 text-xs font-extrabold px-1.5 py-1 bg-white text-center rounded border border-slate-200 focus:outline-none"
                        />
                        <span className="text-slate-400 font-bold text-xs">/</span>
                        <input
                          type="number" min="1" value={p1PosTotal}
                          onChange={(e) => setP1PosTotal(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-1/2 text-xs font-extrabold px-1.5 py-1 bg-white text-center rounded border border-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: Pilar 2 - Sinergi Kolaborasi OPD */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-2">
                  <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase flex items-center space-x-1">
                    <Users2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>P2: SINERGI KOLABORASI OPD (KLIK UNTUK TOGGLE)</span>
                  </span>
                  
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setP2Dinkes(!p2Dinkes)}
                      className={`text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg border transition-all flex items-center space-x-1 cursor-pointer ${
                        p2Dinkes 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs" 
                          : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <Check className={`h-3 w-3 ${p2Dinkes ? "opacity-100" : "opacity-20"}`} />
                      <span>Dinkes</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setP2Bgn(!p2Bgn)}
                      className={`text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg border transition-all flex items-center space-x-1 cursor-pointer ${
                        p2Bgn 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs" 
                          : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <Check className={`h-3 w-3 ${p2Bgn ? "opacity-100" : "opacity-20"}`} />
                      <span>BGN</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setP2Pkk(!p2Pkk)}
                      className={`text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg border transition-all flex items-center space-x-1 cursor-pointer ${
                        p2Pkk 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs" 
                          : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <Check className={`h-3 w-3 ${p2Pkk ? "opacity-100" : "opacity-20"}`} />
                      <span>PKK</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setP2Pemdes(!p2Pemdes)}
                      className={`text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg border transition-all flex items-center space-x-1 cursor-pointer ${
                        p2Pemdes 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs" 
                          : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <Check className={`h-3 w-3 ${p2Pemdes ? "opacity-100" : "opacity-20"}`} />
                      <span>Pemdes</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setP2Puskesmas(!p2Puskesmas)}
                      className={`text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg border transition-all flex items-center space-x-1 cursor-pointer ${
                        p2Puskesmas 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs" 
                          : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <Check className={`h-3 w-3 ${p2Puskesmas ? "opacity-100" : "opacity-20"}`} />
                      <span>Puskesmas</span>
                    </button>
                  </div>
                </div>

                {/* Section: Pilar 3 - Infrastruktur Digital */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-2">
                  <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase flex items-center space-x-1">
                    <Cpu className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                    <span>P3: INFRASTRUKTUR DIGITAL</span>
                  </span>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setP3Dashboard(!p3Dashboard)}
                      className={`text-[9px] font-extrabold p-2 rounded-lg border transition-all text-center flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                        p3Dashboard 
                          ? "bg-purple-50 text-purple-700 border-purple-300" 
                          : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <span className="uppercase text-[8px] font-bold text-slate-400">Dashboard</span>
                      <span className="font-extrabold text-xs">{p3Dashboard ? "Online (Ya)" : "Offline (Tidak)"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setP3Validasi(!p3Validasi)}
                      className={`text-[9px] font-extrabold p-2 rounded-lg border transition-all text-center flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                        p3Validasi 
                          ? "bg-purple-50 text-purple-700 border-purple-300" 
                          : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <span className="uppercase text-[8px] font-bold text-slate-400">Validasi</span>
                      <span className="font-extrabold text-xs">{p3Validasi ? "Selesai (Ya)" : "Proses (Tidak)"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setP3Realtime(!p3Realtime)}
                      className={`text-[9px] font-extrabold p-2 rounded-lg border transition-all text-center flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                        p3Realtime 
                          ? "bg-purple-50 text-purple-700 border-purple-300" 
                          : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <span className="uppercase text-[8px] font-bold text-slate-400">Real-Time</span>
                      <span className="font-extrabold text-xs">{p3Realtime ? "Aktif (Ya)" : "Pasif (Tidak)"}</span>
                    </button>
                  </div>
                </div>

                {/* Section: Pilar 4 - Cakupan Layanan Gizi */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-3">
                  <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase flex items-center space-x-1">
                    <Activity className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                    <span>P4: CAKUPAN LAYANAN GIZI (TERLAYANI / TARGET)</span>
                  </span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[8px] font-bold text-slate-500 uppercase mb-0.5">MBG Terlayani / Target</label>
                      <div className="flex items-center space-x-1 bg-slate-50/50 p-1 rounded-lg border border-slate-200">
                        <input
                          type="number" min="0" value={p4MbgRealized}
                          onChange={(e) => setP4MbgRealized(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-1/2 text-xs font-extrabold px-1.5 py-1 bg-white text-center rounded border border-slate-200 focus:outline-none"
                        />
                        <span className="text-slate-400 font-bold text-xs">/</span>
                        <input
                          type="number" min="1" value={p4MbgTarget}
                          onChange={(e) => setP4MbgTarget(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-1/2 text-xs font-extrabold px-1.5 py-1 bg-white text-center rounded border border-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[8px] font-bold text-slate-500 uppercase mb-0.5">PMT Terdistribusikan / Target</label>
                      <div className="flex items-center space-x-1 bg-slate-50/50 p-1 rounded-lg border border-slate-200">
                        <input
                          type="number" min="0" value={p4PmtRealized}
                          onChange={(e) => setP4PmtRealized(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-1/2 text-xs font-extrabold px-1.5 py-1 bg-white text-center rounded border border-slate-200 focus:outline-none"
                        />
                        <span className="text-slate-400 font-bold text-xs">/</span>
                        <input
                          type="number" min="1" value={p4PmtTarget}
                          onChange={(e) => setP4PmtTarget(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-1/2 text-xs font-extrabold px-1.5 py-1 bg-white text-center rounded border border-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[8px] font-bold text-slate-500 uppercase mb-0.5">Kunjungan Rumah / Target</label>
                      <div className="flex items-center space-x-1 bg-slate-50/50 p-1 rounded-lg border border-slate-200">
                        <input
                          type="number" min="0" value={p4HomeRealized}
                          onChange={(e) => setP4HomeRealized(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-1/2 text-xs font-extrabold px-1.5 py-1 bg-white text-center rounded border border-slate-200 focus:outline-none"
                        />
                        <span className="text-slate-400 font-bold text-xs">/</span>
                        <input
                          type="number" min="1" value={p4HomeTarget}
                          onChange={(e) => setP4HomeTarget(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-1/2 text-xs font-extrabold px-1.5 py-1 bg-white text-center rounded border border-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[8px] font-bold text-slate-500 uppercase mb-0.5">Posyandu Aktif / Total</label>
                      <div className="flex items-center space-x-1 bg-slate-50/50 p-1 rounded-lg border border-slate-200">
                        <input
                          type="number" min="0" value={p4PosActive}
                          onChange={(e) => setP4PosActive(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-1/2 text-xs font-extrabold px-1.5 py-1 bg-white text-center rounded border border-slate-200 focus:outline-none"
                        />
                        <span className="text-slate-400 font-bold text-xs">/</span>
                        <input
                          type="number" min="1" value={p4PosTotal}
                          onChange={(e) => setP4PosTotal(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-1/2 text-xs font-extrabold px-1.5 py-1 bg-white text-center rounded border border-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: Pilar 5 - Outcomes & Kasus */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-3">
                  <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase flex items-center space-x-1">
                    <Award className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>P5: OUTCOMES & STATUS KASUS BALITA (LALU / KINI)</span>
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[8px] font-bold text-slate-500 uppercase mb-0.5">Kasus Stunting (Lalu / Kini)</label>
                      <div className="flex items-center space-x-1 bg-slate-50/50 p-1 rounded-lg border border-slate-200">
                        <input
                          type="number" min="0" value={p5StuntingPrev}
                          onChange={(e) => setP5StuntingPrev(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-1/2 text-xs font-extrabold px-1.5 py-1 bg-white text-center rounded border border-slate-200 focus:outline-none"
                        />
                        <span className="text-slate-400 font-bold text-xs">/</span>
                        <input
                          type="number" min="0" value={p5StuntingCurr}
                          onChange={(e) => setP5StuntingCurr(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-1/2 text-xs font-extrabold px-1.5 py-1 bg-white text-center rounded border border-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[8px] font-bold text-slate-500 uppercase mb-0.5">Kasus Wasting (Lalu / Kini)</label>
                      <div className="flex items-center space-x-1 bg-slate-50/50 p-1 rounded-lg border border-slate-200">
                        <input
                          type="number" min="0" value={p5WastingPrev}
                          onChange={(e) => setP5WastingPrev(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-1/2 text-xs font-extrabold px-1.5 py-1 bg-white text-center rounded border border-slate-200 focus:outline-none"
                        />
                        <span className="text-slate-400 font-bold text-xs">/</span>
                        <input
                          type="number" min="0" value={p5WastingCurr}
                          onChange={(e) => setP5WastingCurr(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-1/2 text-xs font-extrabold px-1.5 py-1 bg-white text-center rounded border border-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase mb-0.5">
                      <span>Ketepatan Sasaran Penerima</span>
                      <span className="text-emerald-600 font-black">{p5TargetAccuracy}%</span>
                    </div>
                    <input
                      type="range" min="0" max="100" value={p5TargetAccuracy}
                      onChange={(e) => setP5TargetAccuracy(parseInt(e.target.value) || 0)}
                      className="w-full accent-emerald-600 h-1.5 cursor-pointer bg-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                {/* Submit Indicator Prompt */}
                {isChanged && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold p-2.5 rounded-xl flex items-center space-x-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                    <span>Anda memiliki perubahan yang belum disimpan. Klik tombol "Simpan Perubahan" di atas.</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-12 text-center">
              <MapPin className="h-10 w-10 text-slate-300 mb-2 animate-bounce" />
              <h5 className="text-sm font-bold text-slate-700">Pilih Desa di Peta</h5>
              <p className="text-xs text-slate-400 max-w-xs mt-1">Klik salah satu koordinat desa pada peta gizi sebelah kiri untuk menginput data aslinya.</p>
            </div>
          )}

          {selectedVillage && (
            <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-600 leading-relaxed font-semibold">
              💡 <strong>Rekomendasi Tindakan</strong>:{" "}
              {selectedVillage.riskLevel === "Merah"
                ? `Desa ini masuk Zona Merah! Segera sinkronisasikan data MBG, dorong kader PKK untuk mengaktifkan Posyandu, dan minta pendampingan Puskesmas.`
                : selectedVillage.riskLevel === "Kuning"
                ? `Zona Kuning. Tingkatkan koordinasi dengan Pemdes untuk alokasi Dana Desa stunting dan selesaikan validasi data berjenjang.`
                : `Pertahankan status Zona Hijau di ${selectedVillage.name} dengan mengawal keaktifan sistem pelaporan harian real-time.`}
            </div>
          )}
        </div>
      </div>

      {/* Add Village Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Tambah Desa Baru</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Sistem akan menambahkan desa baru dengan koordinat acak di peta dan inisialisasi form kosong. Anda dapat melengkapi datanya setelah desa ditambahkan.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Desa / Kelurahan</label>
                <input
                  type="text"
                  placeholder="Contoh: Desa Karanganyar, Desa Pasir Luhur, dll."
                  value={newVillageName}
                  onChange={(e) => setNewVillageName(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50/50"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddVillage()}
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={handleAddVillage}
                  disabled={adding || !newVillageName.trim()}
                  className="flex-1 text-center bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold py-2.5 rounded-xl transition-colors shadow-xs"
                >
                  {adding ? "Menyimpan..." : "Tambah ke Basis Data"}
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-center text-slate-500 hover:bg-slate-100 text-xs font-bold rounded-xl transition-colors border border-slate-200"
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
}
