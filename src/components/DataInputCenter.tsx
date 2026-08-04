import { useState, useMemo, FormEvent, useEffect } from "react";
import { 
  Building2, 
  MapPin, 
  Users, 
  Scale, 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  FileSpreadsheet, 
  TrendingUp, 
  Sparkles, 
  Trash2, 
  ChevronRight, 
  ShieldCheck,
  Check,
  Edit3,
  Award
} from "lucide-react";
import { Village, MBGBeneficiary, WeightRecord, LocationHierarchy } from "../types";
import { LocationSelectorField } from "./LocationSelectorField";

interface DataInputCenterProps {
  villages: Village[];
  beneficiaries: MBGBeneficiary[];
  onSaveBeneficiary: (beneficiary: MBGBeneficiary) => void;
  onDeleteBeneficiary: (id: string) => void;
  onAddWeightRecord: (beneficiaryId: string, record: WeightRecord) => void;
  onUpdateVillageMetrics: (updatedVillage: Partial<Village>) => Promise<void>;
}

const PERIOD_OPTIONS = [
  "Maret 2026",
  "April 2026",
  "Mei 2026",
  "Juni 2026",
  "Juli 2026",
  "Agustus 2026",
  "Periode TW1 2026",
  "Periode TW2 2026",
  "Periode TW3 2026",
  "Periode TW4 2026"
];

export default function DataInputCenter({
  villages,
  beneficiaries,
  onSaveBeneficiary,
  onDeleteBeneficiary,
  onAddWeightRecord,
  onUpdateVillageMetrics
}: DataInputCenterProps) {
  // Navigation sub-tabs within Pusat Input Data
  const [activeSubTab, setActiveSubTab] = useState<"location_sync" | "beneficiaries" | "weight_records">("location_sync");

  // Selected Location Filters & Form Hierarchies
  const [selectedPropinsi, setSelectedPropinsi] = useState<string>(villages[0]?.locationHierarchy?.propinsi || "Nusa Tenggara Timur");
  const [selectedKabupaten, setSelectedKabupaten] = useState<string>(villages[0]?.locationHierarchy?.kabupaten || "Kabupaten Nagekeo");
  const [selectedPuskesmas, setSelectedPuskesmas] = useState<string>(villages[0]?.locationHierarchy?.puskesmas || "Puskesmas Boawae");
  const [selectedKelurahan, setSelectedKelurahan] = useState<string>(villages[0]?.name || "");
  const [selectedDusun, setSelectedDusun] = useState<string>(villages[0]?.locationHierarchy?.dusun || "");
  const [selectedPosyandu, setSelectedPosyandu] = useState<string>(villages[0]?.locationHierarchy?.posyandu || "");

  // Dynamic Options Lists (clean: derived dynamically from actual input & app data, no hardcoded dummy lists)
  const propinsiOptions = useMemo(() => {
    const set = new Set<string>();
    if (selectedPropinsi) set.add(selectedPropinsi);
    villages.forEach(v => v.locationHierarchy?.propinsi && set.add(v.locationHierarchy.propinsi));
    beneficiaries.forEach(b => b.location?.propinsi && set.add(b.location.propinsi));
    return Array.from(set).filter(Boolean);
  }, [villages, beneficiaries, selectedPropinsi]);

  const kabupatenOptions = useMemo(() => {
    const set = new Set<string>();
    if (selectedKabupaten) set.add(selectedKabupaten);
    villages.forEach(v => v.locationHierarchy?.kabupaten && set.add(v.locationHierarchy.kabupaten));
    beneficiaries.forEach(b => b.location?.kabupaten && set.add(b.location.kabupaten));
    return Array.from(set).filter(Boolean);
  }, [villages, beneficiaries, selectedKabupaten]);

  const puskesmasOptions = useMemo(() => {
    const set = new Set<string>();
    if (selectedPuskesmas) set.add(selectedPuskesmas);
    villages.forEach(v => v.locationHierarchy?.puskesmas && set.add(v.locationHierarchy.puskesmas));
    beneficiaries.forEach(b => b.location?.puskesmas && set.add(b.location.puskesmas));
    return Array.from(set).filter(Boolean);
  }, [villages, beneficiaries, selectedPuskesmas]);

  const villageOptions = useMemo(() => {
    const set = new Set<string>();
    if (selectedKelurahan) set.add(selectedKelurahan);
    villages.forEach(v => v.name && set.add(v.name));
    beneficiaries.forEach(b => b.location?.kelurahan && set.add(b.location.kelurahan));
    return Array.from(set).filter(Boolean);
  }, [villages, beneficiaries, selectedKelurahan]);

  const dusunOptions = useMemo(() => {
    const set = new Set<string>();
    if (selectedDusun) set.add(selectedDusun);
    villages.forEach(v => v.locationHierarchy?.dusun && set.add(v.locationHierarchy.dusun));
    beneficiaries.forEach(b => b.location?.dusun && set.add(b.location.dusun));
    return Array.from(set).filter(Boolean);
  }, [villages, beneficiaries, selectedDusun]);

  const posyanduOptions = useMemo(() => {
    const set = new Set<string>();
    if (selectedPosyandu) set.add(selectedPosyandu);
    villages.forEach(v => v.locationHierarchy?.posyandu && set.add(v.locationHierarchy.posyandu));
    beneficiaries.forEach(b => b.location?.posyandu && set.add(b.location.posyandu));
    return Array.from(set).filter(Boolean);
  }, [villages, beneficiaries, selectedPosyandu]);

  // Beneficiary Search & Filter
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  // New Beneficiary Form Location & Details State
  const [showAddBenModal, setShowAddBenModal] = useState<boolean>(false);
  const [benName, setBenName] = useState<string>("");
  const [benNik, setBenNik] = useState<string>("");
  const [benCategory, setBenCategory] = useState<"Siswa SD" | "PAUD" | "Balita" | "Ibu Hamil">("Siswa SD");
  const [benReceivedMBG, setBenReceivedMBG] = useState<boolean>(true);
  const [benInitialWeight, setBenInitialWeight] = useState<string>("18.5");
  const [benInitialHeight, setBenInitialHeight] = useState<string>("110");
  const [benNotes, setBenNotes] = useState<string>("");
  
  // Beneficiary Specific Location State (Defaults to header selections)
  const [benKelurahan, setBenKelurahan] = useState<string>(selectedKelurahan);
  const [benDusun, setBenDusun] = useState<string>(selectedDusun);
  const [benPosyandu, setBenPosyandu] = useState<string>(selectedPosyandu);
  const [benPuskesmas, setBenPuskesmas] = useState<string>(selectedPuskesmas);

  // Sync beneficiary location state when header changes or modal opens
  useEffect(() => {
    if (showAddBenModal) {
      setBenKelurahan(selectedKelurahan);
      setBenDusun(selectedDusun);
      setBenPosyandu(selectedPosyandu);
      setBenPuskesmas(selectedPuskesmas);
    }
  }, [showAddBenModal, selectedKelurahan, selectedDusun, selectedPosyandu, selectedPuskesmas]);

  // Weight Measurement Form State
  const [selectedBenId, setSelectedBenId] = useState<string>("");
  const [measPeriod, setMeasPeriod] = useState<string>("Januari 2026");
  const [measWeight, setMeasWeight] = useState<string>("");
  const [measHeight, setMeasHeight] = useState<string>("");
  const [measSuccess, setMeasSuccess] = useState<boolean>(false);

  // Village metrics editor state (for location_sync sub-tab)
  const currentVillage = useMemo(() => {
    return villages.find(v => v.name.toLowerCase() === selectedKelurahan.toLowerCase()) || villages[0] || {
      id: "v_1",
      name: selectedKelurahan,
      riskLevel: "Kuning",
      score: 65,
      coordinates: { x: 121.2, y: -8.8 },
      pilar1_mbg_sync: 85,
      pilar1_mbg_total: 100,
      pilar1_pmt_sync: 22,
      pilar1_pmt_total: 30,
      pilar1_posyandu_sync: 4,
      pilar1_posyandu_total: 5,
      pilar1_eppgbm_sync: 90,
      pilar1_eppgbm_total: 100,
      pilar2_dinkes_aktif: true,
      pilar2_bgn_aktif: true,
      pilar2_pkk_aktif: true,
      pilar2_pemdes_aktif: true,
      pilar2_puskesmas_aktif: true,
      pilar3_dashboard_online: true,
      pilar3_validasi_data: true,
      pilar3_real_time_update: true,
      pilar4_mbg_realized: 85,
      pilar4_mbg_target: 100,
      pilar4_pmt_realized: 22,
      pilar4_pmt_target: 30,
      pilar4_home_visit: 15,
      pilar4_home_visit_target: 20,
      pilar4_posyandu_aktif: 4,
      pilar4_posyandu_total: 5,
      pilar5_stunting_prev: 18,
      pilar5_stunting_curr: 12,
      pilar5_wasting_prev: 8,
      pilar5_wasting_curr: 4,
      pilar5_target_accuracy: 88
    };
  }, [villages, selectedKelurahan]);

  // Form local states for village sync metrics
  const [mbgSync, setMbgSync] = useState<number>(currentVillage.pilar1_mbg_sync);
  const [mbgTotal, setMbgTotal] = useState<number>(currentVillage.pilar1_mbg_total);
  const [pmtSync, setPmtSync] = useState<number>(currentVillage.pilar1_pmt_sync);
  const [pmtTotal, setPmtTotal] = useState<number>(currentVillage.pilar1_pmt_total);
  const [posSync, setPosSync] = useState<number>(currentVillage.pilar1_posyandu_sync);
  const [posTotal, setPosTotal] = useState<number>(currentVillage.pilar1_posyandu_total);
  const [isSavingVillage, setIsSavingVillage] = useState<boolean>(false);
  const [saveVillageSuccess, setSaveVillageSuccess] = useState<boolean>(false);

  // Filtered Beneficiaries List
  const filteredBeneficiaries = useMemo(() => {
    return beneficiaries.filter(b => {
      const matchSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (b.nik && b.nik.includes(searchTerm)) ||
                          b.location.kelurahan.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = categoryFilter === "ALL" || b.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [beneficiaries, searchTerm, categoryFilter]);

  // Calculate status gizi helper based on weight & height/age
  const calculateStatusGizi = (weight: number, height?: number): "Normal" | "Gizi Kurang" | "Stunting" | "Risiko Stunting" => {
    if (weight < 10) return "Risiko Stunting";
    if (height && height < 85) return "Stunting";
    if (weight < 12) return "Gizi Kurang";
    return "Normal";
  };

  // Submit Handler for New Beneficiary
  const handleCreateBeneficiary = (e: FormEvent) => {
    e.preventDefault();
    if (!benName.trim()) return;

    const initialWeightVal = parseFloat(benInitialWeight) || 15;
    const initialHeightVal = parseFloat(benInitialHeight) || 100;

    const newBen: MBGBeneficiary = {
      id: "ben_" + Date.now(),
      name: benName.trim(),
      nik: benNik.trim() || `5316${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      category: benCategory,
      location: {
        propinsi: selectedPropinsi,
        kabupaten: selectedKabupaten,
        puskesmas: benPuskesmas || selectedPuskesmas,
        kelurahan: benKelurahan || selectedKelurahan,
        dusun: benDusun || selectedDusun,
        posyandu: benPosyandu || selectedPosyandu
      },
      isReceivedMBG: benReceivedMBG,
      weightRecords: [
        {
          period: "Januari 2026",
          weightKg: initialWeightVal,
          heightCm: initialHeightVal,
          statusGizi: calculateStatusGizi(initialWeightVal, initialHeightVal),
          measuredAt: new Date().toISOString().split("T")[0]
        }
      ],
      notes: benNotes.trim() || undefined
    };

    onSaveBeneficiary(newBen);
    setBenName("");
    setBenNik("");
    setBenNotes("");
    setShowAddBenModal(false);
  };

  // Submit Handler for Adding Weight Record
  const handleAddWeightMeasurement = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedBenId || !measWeight) return;

    const weightVal = parseFloat(measWeight);
    const heightVal = parseFloat(measHeight) || undefined;

    if (isNaN(weightVal)) return;

    const newRecord: WeightRecord = {
      period: measPeriod,
      weightKg: weightVal,
      heightCm: heightVal,
      statusGizi: calculateStatusGizi(weightVal, heightVal),
      measuredAt: new Date().toISOString().split("T")[0]
    };

    onAddWeightRecord(selectedBenId, newRecord);
    setMeasWeight("");
    setMeasHeight("");
    setMeasSuccess(true);
    setTimeout(() => setMeasSuccess(false), 2500);
  };

  // Handle Village Sync Metrics Save
  const handleSaveVillageSync = async () => {
    setIsSavingVillage(true);
    try {
      await onUpdateVillageMetrics({
        id: currentVillage.id,
        pilar1_mbg_sync: mbgSync,
        pilar1_mbg_total: mbgTotal,
        pilar1_pmt_sync: pmtSync,
        pilar1_pmt_total: pmtTotal,
        pilar1_posyandu_sync: posSync,
        pilar1_posyandu_total: posTotal,
        pilar4_mbg_realized: mbgSync,
        pilar4_mbg_target: mbgTotal
      });
      setSaveVillageSuccess(true);
      setTimeout(() => setSaveVillageSuccess(false), 2500);
    } catch (e) {
      console.error("Gagal update data desa", e);
    } finally {
      setIsSavingVillage(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-6 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2 text-indigo-400">
                <Building2 className="h-5 w-5" />
                <span className="text-[11px] font-black tracking-widest uppercase">PUSAT ENTRI & HIERARKI WILAYAH</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Sistem Entri Data Berjenjang & MBG
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Kelola data lokasi berjenjang (Propinsi s.d. Posyandu), nama-nama penerima MBG (Makan Bergizi Gratis), serta histori pengukuran berat badan berkala.
              </p>
            </div>

            <button
              onClick={() => setShowAddBenModal(true)}
              className="inline-flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black px-5 py-3.5 rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer text-xs sm:text-sm shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>+ Tambah Penerima MBG Baru</span>
            </button>
          </div>

          {/* Location Hierarchy Quick Select Grid - Spacious & Clean */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black tracking-wider uppercase text-indigo-300 flex items-center space-x-1.5">
                <span>📍</span>
                <span>Pilih / Ketik Hierarki Lokasi Aktif</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                Data yang dipilih langsung tersinkron ke formulir di bawah
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* Propinsi */}
              <LocationSelectorField
                label="1. PROPINSI"
                value={selectedPropinsi}
                onChange={setSelectedPropinsi}
                options={propinsiOptions}
                placeholder="Contoh: NTT"
                isDark={true}
              />

              {/* Kabupaten */}
              <LocationSelectorField
                label="2. KABUPATEN"
                value={selectedKabupaten}
                onChange={setSelectedKabupaten}
                options={kabupatenOptions}
                placeholder="Kab. Nagekeo"
                isDark={true}
              />

              {/* Puskesmas */}
              <LocationSelectorField
                label="3. PUSKESMAS"
                value={selectedPuskesmas}
                onChange={setSelectedPuskesmas}
                options={puskesmasOptions}
                placeholder="Puskesmas..."
                isDark={true}
              />

              {/* Kelurahan / Desa */}
              <LocationSelectorField
                label="4. KELURAHAN / DESA"
                value={selectedKelurahan}
                onChange={setSelectedKelurahan}
                options={villageOptions}
                placeholder="Ketik Desa Baru..."
                isDark={true}
              />

              {/* Dusun */}
              <LocationSelectorField
                label="5. DUSUN"
                value={selectedDusun}
                onChange={setSelectedDusun}
                options={dusunOptions}
                placeholder="Dusun..."
                isDark={true}
              />

              {/* Posyandu */}
              <LocationSelectorField
                label="6. POSYANDU"
                value={selectedPosyandu}
                onChange={setSelectedPosyandu}
                options={posyanduOptions}
                placeholder="Posyandu..."
                isDark={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Selector Bar */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-xs">
        <button
          onClick={() => setActiveSubTab("location_sync")}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            activeSubTab === "location_sync"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>1. Sinkronisasi Data Wilayah</span>
        </button>

        <button
          onClick={() => setActiveSubTab("beneficiaries")}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            activeSubTab === "beneficiaries"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>2. Daftar Penerima MBG ({beneficiaries.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("weight_records")}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            activeSubTab === "weight_records"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Scale className="h-4 w-4" />
          <span>3. Catat Berat Badan Bulanan</span>
        </button>
      </div>

      {/* SUB-TAB 1: SINKRONISASI DATA WILAYAH */}
      {activeSubTab === "location_sync" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Pusat Integrasi Data Desa / Kelurahan: {selectedKelurahan}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Wilayah: {selectedPropinsi} → {selectedKabupaten} → {selectedPuskesmas} → {selectedKelurahan}
              </p>
            </div>

            <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-extrabold">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Status Desa: Zona {currentVillage.riskLevel || "Hijau"} ({currentVillage.score || 85} Pts)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* MBG Integration */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-700 uppercase">🍱 MBG (Makan Bergizi Gratis)</span>
                <span className="text-[10px] font-black text-slate-400">Pilar 1 & 4</span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-extrabold text-slate-600 block mb-1">
                    Anak Tersinkronisasi ({mbgSync} / {mbgTotal})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={mbgTotal}
                    value={mbgSync}
                    onChange={(e) => setMbgSync(parseInt(e.target.value) || 0)}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Total Target MBG:</span>
                  <input
                    type="number"
                    min="1"
                    value={mbgTotal}
                    onChange={(e) => setMbgTotal(Math.max(1, parseInt(e.target.value) || 1))}
                    className="bg-white border border-slate-300 rounded px-2 py-1 text-center font-black w-24 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* PMT Integration */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-700 uppercase">🍼 PMT (Makanan Tambahan)</span>
                <span className="text-[10px] font-black text-slate-400">Pilar 1 & 4</span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-extrabold text-slate-600 block mb-1">
                    Ibu Hamil / Balita Terlayani ({pmtSync} / {pmtTotal})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={pmtTotal}
                    value={pmtSync}
                    onChange={(e) => setPmtSync(parseInt(e.target.value) || 0)}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Total Target PMT:</span>
                  <input
                    type="number"
                    min="1"
                    value={pmtTotal}
                    onChange={(e) => setPmtTotal(Math.max(1, parseInt(e.target.value) || 1))}
                    className="bg-white border border-slate-300 rounded px-2 py-1 text-center font-black w-24 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Posyandu Sync */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-700 uppercase">🏥 Unit Posyandu Digital</span>
                <span className="text-[10px] font-black text-slate-400">Pilar 1 & 4</span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-extrabold text-slate-600 block mb-1">
                    Posyandu Digital ({posSync} / {posTotal})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={posTotal}
                    value={posSync}
                    onChange={(e) => setPosSync(parseInt(e.target.value) || 0)}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Total Unit Posyandu:</span>
                  <input
                    type="number"
                    min="1"
                    value={posTotal}
                    onChange={(e) => setPosTotal(Math.max(1, parseInt(e.target.value) || 1))}
                    className="bg-white border border-slate-300 rounded px-2 py-1 text-center font-black w-20 text-xs"
                  />
                </div>
              </div>
            </div>

          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-xs font-medium text-slate-500">
              *Perubahan data wilayah langsung mempengaruhi perhitungan Indeks Transformasi Orbit Gizi.
            </span>

            <button
              onClick={handleSaveVillageSync}
              disabled={isSavingVillage}
              className={`px-6 py-2.5 rounded-xl font-black text-xs text-white transition-all cursor-pointer shadow-md flex items-center space-x-2 ${
                saveVillageSuccess ? "bg-emerald-600" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {saveVillageSuccess ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Tersimpan ke Indeks!</span>
                </>
              ) : (
                <span>{isSavingVillage ? "Menyimpan..." : "Simpan Data Wilayah Ini"}</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: DAFTAR PENERIMA MBG */}
      {activeSubTab === "beneficiaries" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama penerima, NIK, atau lokasi desa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-xs font-bold text-slate-500">Kategori:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold bg-white text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="Siswa SD">Siswa SD</option>
                <option value="PAUD">PAUD</option>
                <option value="Balita">Balita</option>
                <option value="Ibu Hamil">Ibu Hamil</option>
              </select>

              <button
                onClick={() => setShowAddBenModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Baru</span>
              </button>
            </div>
          </div>

          {/* Table of Beneficiaries */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="p-3.5">Nama & NIK</th>
                  <th className="p-3.5">Kategori</th>
                  <th className="p-3.5">Hierarki Lokasi (Puskesmas / Desa / Dusun / Posyandu)</th>
                  <th className="p-3.5">Status MBG</th>
                  <th className="p-3.5">BB Terakhir</th>
                  <th className="p-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredBeneficiaries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                      Belum ada data penerima MBG yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredBeneficiaries.map((b) => {
                    const latestWeight = b.weightRecords[b.weightRecords.length - 1];
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <p className="font-black text-slate-900">{b.name}</p>
                          <p className="text-[10px] font-mono text-slate-400">NIK: {b.nik || "-"}</p>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {b.category}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-600 leading-tight">
                          <p className="font-bold text-slate-800">{b.location.kelurahan} — {b.location.dusun}</p>
                          <p className="text-[10px] text-slate-400">{b.location.puskesmas} ({b.location.posyandu})</p>
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => onSaveBeneficiary({ ...b, isReceivedMBG: !b.isReceivedMBG })}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black flex items-center space-x-1 cursor-pointer transition-all ${
                              b.isReceivedMBG
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-amber-100 text-amber-800 border border-amber-300"
                            }`}
                          >
                            {b.isReceivedMBG ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                <span>Terlayani MBG</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 text-amber-600" />
                                <span>Belum Terima</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="p-3.5 font-bold text-slate-800">
                          {latestWeight ? (
                            <div>
                              <span>{latestWeight.weightKg} kg</span>
                              <span className="text-[10px] text-slate-400 block font-normal">
                                {latestWeight.period} ({latestWeight.statusGizi || "Normal"})
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => onDeleteBeneficiary(b.id)}
                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Penerima"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: CATAT BERAT BADAN BULANAN & PERIODE */}
      {activeSubTab === "weight_records" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Input Form for Weight Record */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5 lg:col-span-1">
            <div className="flex items-center space-x-2 text-indigo-700">
              <Scale className="h-5 w-5" />
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">Entri Hasil Timbang BB</h3>
            </div>

            <form onSubmit={handleAddWeightMeasurement} className="space-y-4">
              
              {/* Select Beneficiary */}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                  PILIH PENERIMA / ANAK
                </label>
                <select
                  value={selectedBenId}
                  onChange={(e) => setSelectedBenId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none cursor-pointer"
                  required
                >
                  <option value="">-- Pilih Penerima MBG --</option>
                  {beneficiaries.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.category} - {b.location.kelurahan})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Period */}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                  PERIODE PENGUKURAN
                </label>
                <select
                  value={measPeriod}
                  onChange={(e) => setMeasPeriod(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none cursor-pointer"
                >
                  {PERIOD_OPTIONS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Weight Kg */}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                  BERAT BADAN (KG)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Contoh: 18.5"
                  value={measWeight}
                  onChange={(e) => setMeasWeight(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                  required
                />
              </div>

              {/* Height Cm */}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                  TINGGI / PANJANG BADAN (CM) - OPSIONAL
                </label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="Contoh: 110.5"
                  value={measHeight}
                  onChange={(e) => setMeasHeight(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className={`w-full py-3 rounded-xl font-black text-xs text-white transition-all cursor-pointer shadow-md flex items-center justify-center space-x-2 ${
                  measSuccess ? "bg-emerald-600" : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {measSuccess ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Hasil Timbang Berhasil Dicatat!</span>
                  </>
                ) : (
                  <span>Simpan Hasil Penimbangan</span>
                )}
              </button>
            </form>
          </div>

          {/* Right: History Log of Weight Measurements */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 lg:col-span-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-indigo-600" />
              <span>Histori Pengukuran Berat Badan Berdasarkan Penerima</span>
            </h3>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {beneficiaries.map(ben => (
                <div key={ben.id} className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-slate-50/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">{ben.name}</h4>
                      <p className="text-[10px] font-medium text-slate-500">
                        {ben.location.kelurahan} ({ben.location.posyandu}) — Kategori: {ben.category}
                      </p>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                      ben.isReceivedMBG ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-slate-200 text-slate-700 border-slate-300"
                    }`}>
                      {ben.isReceivedMBG ? "Penerima MBG" : "Non-MBG"}
                    </span>
                  </div>

                  {/* Weight Log Records Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {ben.weightRecords.map((rec, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 p-2.5 rounded-xl shadow-2xs space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 block">{rec.period}</span>
                        <p className="text-sm font-black text-slate-900">{rec.weightKg} kg</p>
                        {rec.heightCm && (
                          <span className="text-[10px] text-slate-500 font-semibold block">{rec.heightCm} cm</span>
                        )}
                        <span className={`text-[9px] font-bold block ${
                          rec.statusGizi === "Normal" 
                            ? "text-emerald-600" 
                            : rec.statusGizi === "Stunting" 
                              ? "text-rose-600" 
                              : "text-amber-600"
                        }`}>
                          {rec.statusGizi || "Normal"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ADD BENEFICIARY MODAL */}
      {showAddBenModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-indigo-600">
                <Users className="h-5 w-5" />
                <h3 className="text-sm font-black uppercase text-slate-900">Tambah Penerima MBG Baru</h3>
              </div>
              <button
                onClick={() => setShowAddBenModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBeneficiary} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">NAMA LENGKAP PENERIMA *</label>
                <input
                  type="text"
                  placeholder="Contoh: Maria Goreti Beda"
                  value={benName}
                  onChange={(e) => setBenName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">NIK / NISN (OPSIONAL)</label>
                <input
                  type="text"
                  placeholder="5316..."
                  value={benNik}
                  onChange={(e) => setBenNik(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                />
              </div>

              {/* Location Selection with Dropdown & Custom Input */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
                <span className="text-[10px] font-black uppercase text-indigo-700 block">
                  📍 LOKASI DESA & POSYANDU PENERIMA
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <LocationSelectorField
                    label="KELURAHAN / DESA"
                    value={benKelurahan}
                    onChange={setBenKelurahan}
                    options={villageOptions}
                    placeholder="Nama Desa..."
                    isDark={false}
                  />
                  <LocationSelectorField
                    label="POSYANDU"
                    value={benPosyandu}
                    onChange={setBenPosyandu}
                    options={posyanduOptions}
                    placeholder="Nama Posyandu..."
                    isDark={false}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <LocationSelectorField
                    label="DUSUN"
                    value={benDusun}
                    onChange={setBenDusun}
                    options={dusunOptions}
                    placeholder="Nama Dusun..."
                    isDark={false}
                  />
                  <LocationSelectorField
                    label="PUSKESMAS"
                    value={benPuskesmas}
                    onChange={setBenPuskesmas}
                    options={puskesmasOptions}
                    placeholder="Puskesmas..."
                    isDark={false}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">KATEGORI</label>
                  <select
                    value={benCategory}
                    onChange={(e) => setBenCategory(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 font-bold bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="Siswa SD">Siswa SD</option>
                    <option value="PAUD">PAUD</option>
                    <option value="Balita">Balita</option>
                    <option value="Ibu Hamil">Ibu Hamil</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">TERIMA MBG?</label>
                  <select
                    value={benReceivedMBG ? "YES" : "NO"}
                    onChange={(e) => setBenReceivedMBG(e.target.value === "YES")}
                    className="w-full border border-slate-200 rounded-xl p-2.5 font-bold bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="YES">Ya, Terlayani MBG</option>
                    <option value="NO">Belum Terlayani</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">BB AWAL (KG)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={benInitialWeight}
                    onChange={(e) => setBenInitialWeight(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">TB AWAL (CM)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={benInitialHeight}
                    onChange={(e) => setBenInitialHeight(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">CATATAN KHUSUS / SEKOLAH</label>
                <input
                  type="text"
                  placeholder="Contoh: Siswa SD Katolik Boawae"
                  value={benNotes}
                  onChange={(e) => setBenNotes(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddBenModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black cursor-pointer shadow-md"
                >
                  Simpan Penerima Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
