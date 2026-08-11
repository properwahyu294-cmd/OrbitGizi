import { useState, useMemo, FormEvent, useEffect } from "react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
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
  Sparkles, 
  Trash2, 
  ShieldCheck,
  ShieldAlert,
  Check,
  X,
  Edit3,
  AlertTriangle,
  Home,
  HeartPulse,
  UserCheck,
  FileText,
  Activity,
  CheckSquare,
  Info,
  Eye,
  Filter,
  SlidersHorizontal,
  Stethoscope,
  HeartHandshake,
  TrendingUp,
  BadgeCheck
} from "lucide-react";
import { Village, MBGBeneficiary, WeightRecord } from "../types";
import { LocationSelectorField } from "./LocationSelectorField";
import { AnalyticDataPivotModal } from "./AnalyticDataPivotModal";
import { sanitizeInput, validateBeneficiaryPayload } from "../lib/cyberSecurity";

interface DataInputCenterProps {
  villages: Village[];
  beneficiaries: MBGBeneficiary[];
  onSaveBeneficiary: (beneficiary: MBGBeneficiary) => void;
  onDeleteBeneficiary: (id: string) => void;
  onAddWeightRecord: (beneficiaryId: string, record: WeightRecord) => void;
  onDeleteWeightRecord: (beneficiaryId: string, period: string) => void;
  onUpdateVillageMetrics: (updatedVillage: Partial<Village>) => Promise<void>;
  isModal?: boolean;
  onCloseModal?: () => void;
}

const PERIOD_OPTIONS = [
  "Maret 2026",
  "April 2026",
  "Mei 2026",
  "Juni 2026",
  "Juli 2026",
  "Agustus 2026",
  "September 2026",
  "Oktober 2026",
  "November 2026",
  "Desember 2026",
  "Periode TW1 2026",
  "Periode TW2 2026",
  "Periode TW3 2026",
  "Periode TW4 2026"
];

const STAKEHOLDER_OPTIONS = [
  "Petugas Desa / Pemdes",
  "Kader Posyandu",
  "Petugas Puskesmas",
  "Petugas Dinkes / Dinas Kesehatan",
  "Ahli Gizi Puskesmas/Desa",
  "Dokter Anak / Spesialis",
  "Badan Gizi Nasional (BGN)",
  "Tim Mobilisasi PKK",
  "Babinsa / Koramil",
  "Bhabinkamtibmas / Polri",
  "Tokoh Masyarakat / Agama"
];

export default function DataInputCenter({
  villages,
  beneficiaries,
  onSaveBeneficiary,
  onDeleteBeneficiary,
  onAddWeightRecord,
  onDeleteWeightRecord,
  onUpdateVillageMetrics,
  isModal = false,
  onCloseModal
}: DataInputCenterProps) {
  // Navigation Sub-Tabs
  const [activeSubTab, setActiveSubTab] = useState<"location_sync" | "beneficiaries" | "weight_records" | "collaboration">("beneficiaries");

  // Global Location Selection Hierarchy Filter
  const [selectedPropinsi] = useState<string>("Nusa Tenggara Timur");
  const [selectedKabupaten] = useState<string>("Kabupaten Nagekeo");
  const [selectedPuskesmas, setSelectedPuskesmas] = useState<string>("Puskesmas Boawae");
  const [selectedKelurahan, setSelectedKelurahan] = useState<string>("Desa Nangateke");
  const [selectedDusun, setSelectedDusun] = useState<string>("Dusun Nangateke");
  const [selectedPosyandu, setSelectedPosyandu] = useState<string>("Posyandu Nangateke");

  // Custom persistent location master data
  const [customPuskesmasList, setCustomPuskesmasList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("orbit_custom_puskesmas");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [customKelurahanList, setCustomKelurahanList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("orbit_custom_kelurahan");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [customDusunList, setCustomDusunList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("orbit_custom_dusun");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [customPosyanduList, setCustomPosyanduList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("orbit_custom_posyandu");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const handleSaveCustomPuskesmas = (val: string) => {
    if (!val) return;
    setCustomPuskesmasList(prev => {
      if (prev.includes(val)) return prev;
      const updated = [...prev, val];
      localStorage.setItem("orbit_custom_puskesmas", JSON.stringify(updated));
      return updated;
    });
    setSelectedPuskesmas(val);
  };

  const handleSaveCustomKelurahan = (val: string) => {
    if (!val) return;
    setCustomKelurahanList(prev => {
      if (prev.includes(val)) return prev;
      const updated = [...prev, val];
      localStorage.setItem("orbit_custom_kelurahan", JSON.stringify(updated));
      return updated;
    });
    setSelectedKelurahan(val);
  };

  const handleSaveCustomDusun = (val: string) => {
    if (!val) return;
    setCustomDusunList(prev => {
      if (prev.includes(val)) return prev;
      const updated = [...prev, val];
      localStorage.setItem("orbit_custom_dusun", JSON.stringify(updated));
      return updated;
    });
    setSelectedDusun(val);
  };

  const handleSaveCustomPosyandu = (val: string) => {
    if (!val) return;
    setCustomPosyanduList(prev => {
      if (prev.includes(val)) return prev;
      const updated = [...prev, val];
      localStorage.setItem("orbit_custom_posyandu", JSON.stringify(updated));
      return updated;
    });
    setSelectedPosyandu(val);
  };

  // Dynamic Options derived from data & saved master data
  const puskesmasOptions = useMemo(() => {
    const set = new Set<string>();
    if (selectedPuskesmas) set.add(selectedPuskesmas);
    customPuskesmasList.forEach(p => set.add(p));
    villages.forEach(v => v.locationHierarchy?.puskesmas && set.add(v.locationHierarchy.puskesmas));
    beneficiaries.forEach(b => b.location?.puskesmas && set.add(b.location.puskesmas));
    return Array.from(set).filter(Boolean);
  }, [villages, beneficiaries, selectedPuskesmas, customPuskesmasList]);

  const villageOptions = useMemo(() => {
    const set = new Set<string>();
    if (selectedKelurahan) set.add(selectedKelurahan);
    customKelurahanList.forEach(k => set.add(k));
    villages.forEach(v => v.name && set.add(v.name));
    beneficiaries.forEach(b => b.location?.kelurahan && set.add(b.location.kelurahan));
    return Array.from(set).filter(Boolean);
  }, [villages, beneficiaries, selectedKelurahan, customKelurahanList]);

  const dusunOptions = useMemo(() => {
    const set = new Set<string>();
    if (selectedDusun) set.add(selectedDusun);
    customDusunList.forEach(d => set.add(d));
    villages.forEach(v => v.locationHierarchy?.dusun && set.add(v.locationHierarchy.dusun));
    beneficiaries.forEach(b => b.location?.dusun && set.add(b.location.dusun));
    return Array.from(set).filter(Boolean);
  }, [villages, beneficiaries, selectedDusun, customDusunList]);

  const posyanduOptions = useMemo(() => {
    const set = new Set<string>();
    if (selectedPosyandu) set.add(selectedPosyandu);
    customPosyanduList.forEach(p => set.add(p));
    villages.forEach(v => v.locationHierarchy?.posyandu && set.add(v.locationHierarchy.posyandu));
    beneficiaries.forEach(b => b.location?.posyandu && set.add(b.location.posyandu));
    return Array.from(set).filter(Boolean);
  }, [villages, beneficiaries, selectedPosyandu, customPosyanduList]);

  // Beneficiary Search & Filters
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [attendanceFilter, setAttendanceFilter] = useState<string>("ALL");
  const [posyanduFilter, setPosyanduFilter] = useState<string>("ALL");
  const [programFilter, setProgramFilter] = useState<string>("ALL");
  const [genderFilter, setGenderFilter] = useState<string>("ALL");

  // Detail Modal State
  const [selectedDetailBen, setSelectedDetailBen] = useState<MBGBeneficiary | null>(null);

  // Available unique Posyandus for filtering
  const availablePosyandus = useMemo(() => {
    const set = new Set<string>();
    beneficiaries.forEach(b => {
      if (b.location?.posyandu) set.add(b.location.posyandu);
    });
    return Array.from(set).sort();
  }, [beneficiaries]);

  // New / Edit Beneficiary Form State
  const [showAddBenModal, setShowAddBenModal] = useState<boolean>(false);
  const [editingBenId, setEditingBenId] = useState<string | null>(null);
  const [benName, setBenName] = useState<string>("");
  const [benParentName, setBenParentName] = useState<string>("");
  const [benNik, setBenNik] = useState<string>("");
  const [benGender, setBenGender] = useState<"Laki-laki" | "Perempuan">("Laki-laki");
  const [benAge, setBenAge] = useState<string>("3 Tahun");
  const [benBirthDate, setBenBirthDate] = useState<string>("");
  const [benCategory, setBenCategory] = useState<"Balita" | "Ibu Hamil" | "Ibu Menyusui">("Balita");
  const [benReceivedMBG, setBenReceivedMBG] = useState<boolean>(true);
  const [benReceivedPMT, setBenReceivedPMT] = useState<boolean>(true);
  const [benAttendanceStatus, setBenAttendanceStatus] = useState<"Mengunjungi Posyandu" | "Mengunjungi Puskesmas" | "Tidak Mengunjungi">("Mengunjungi Posyandu");
  const [benPetugasDesaHadir, setBenPetugasDesaHadir] = useState<boolean>(true);
  const [benPetugasPosyanduHadir, setBenPetugasPosyanduHadir] = useState<boolean>(true);
  const [benPetugasDinkesHadir, setBenPetugasDinkesHadir] = useState<boolean>(true);
  const [benAhliGiziHadir, setBenAhliGiziHadir] = useState<boolean>(true);
  const [benDokterAnakHadir, setBenDokterAnakHadir] = useState<boolean>(false);
  const [benStakeholdersHadir, setBenStakeholdersHadir] = useState<string[]>(["Petugas Desa / Pemdes", "Kader Posyandu", "Petugas Puskesmas", "Petugas Dinkes / Dinas Kesehatan", "Ahli Gizi Puskesmas/Desa"]);
  const [benInitialWeight, setBenInitialWeight] = useState<string>("14");
  const [benInitialHeight, setBenInitialHeight] = useState<string>("95");
  const [benNotes, setBenNotes] = useState<string>("");

  // Beneficiary Location State
  const [benKelurahan, setBenKelurahan] = useState<string>(selectedKelurahan);
  const [benDusun, setBenDusun] = useState<string>(selectedDusun);
  const [benPosyandu, setBenPosyandu] = useState<string>(selectedPosyandu);
  const [benPuskesmas, setBenPuskesmas] = useState<string>(selectedPuskesmas);

  // AI Report State
  const [showAIReportModal, setShowAIReportModal] = useState<boolean>(false);
  const [aiReportText, setAiReportText] = useState<string>("");
  const [isLoadingAIReport, setIsLoadingAIReport] = useState<boolean>(false);

  const handleOpenAddBenModal = () => {
    setEditingBenId(null);
    setBenName("");
    setBenParentName("");
    setBenNik("");
    setBenGender("Laki-laki");
    setBenAge("");
    setBenBirthDate("");
    setBenCategory("Balita");
    setBenReceivedMBG(true);
    setBenReceivedPMT(true);
    setBenAttendanceStatus("Mengunjungi Posyandu");
    setBenPetugasDesaHadir(true);
    setBenPetugasPosyanduHadir(true);
    setBenPetugasDinkesHadir(true);
    setBenAhliGiziHadir(true);
    setBenDokterAnakHadir(false);
    setBenOfficerDinkesName("");
    setBenOfficerAhliGiziName("");
    setBenOfficerDokterAnakName("");
    setBenOfficerKaderName("");
    setBenPosyanduSchedule("Setiap Tanggal 15 Bulanan");
    setBenPosyanduAgeLimit("Hingga Usia 5 Tahun (60 Bulan)");
    setBenIsSpecialInterventionNeeded(false);
    setBenSpecialInterventionNote("");
    setBenStakeholdersHadir(["Petugas Desa / Pemdes", "Kader Posyandu", "Petugas Puskesmas", "Petugas Dinkes / Dinas Kesehatan", "Ahli Gizi Puskesmas/Desa"]);
    setBenInitialWeight("");
    setBenInitialHeight("");
    setBenNotes("");
    setBenKelurahan(selectedKelurahan);
    setBenDusun(selectedDusun);
    setBenPosyandu(selectedPosyandu);
    setBenPuskesmas(selectedPuskesmas);
    setShowAddBenModal(true);
  };

  const handleOpenEditBenModal = (b: MBGBeneficiary, record?: WeightRecord) => {
    setEditingBenId(b.id);
    setBenName(b.name);
    setBenParentName(b.parentName || "");
    setBenNik(b.nik || "");
    setBenGender(b.gender || "Laki-laki");
    setBenAge(b.age || "");
    setBenBirthDate(b.birthDate || "");
    setBenCategory(b.category);
    setBenReceivedMBG(b.isReceivedMBG);
    setBenReceivedPMT(b.isReceivedPMT !== false);
    setBenAttendanceStatus(b.attendanceStatus || "Mengunjungi Posyandu");
    setBenPetugasDesaHadir(b.isPetugasDesaHadir !== false);
    setBenPetugasPosyanduHadir(b.isPetugasPosyanduHadir !== false);
    setBenPetugasDinkesHadir(b.isPetugasDinkesHadir !== false);
    setBenAhliGiziHadir(b.isAhliGiziHadir !== false);
    setBenDokterAnakHadir(b.isDokterAnakHadir === true);
    setBenOfficerDinkesName(b.officerDinkesName || "Drs. Ahmad Dahlan, M.Kes (Dinkes Kab. Ende)");
    setBenOfficerAhliGiziName(b.officerAhliGiziName || "Siti Rahma, S.Gz (Nutrisionis Puskesmas)");
    setBenOfficerDokterAnakName(b.officerDokterAnakName || "dr. H. Prasetyo, Sp.A (RSUD / Tim Pakar)");
    setBenOfficerKaderName(b.officerKaderName || "Ibu Maria & Ibu Yuliana (Kader Posyandu)");
    setBenPosyanduSchedule(b.posyanduSchedule || "Setiap Tanggal 15 Bulanan");
    setBenPosyanduAgeLimit(b.posyanduAgeLimit || (b.category === "Balita" ? "Hingga Usia 5 Tahun (60 Bulan)" : "Hingga Masa Menyusui 2 Tahun"));
    setBenIsSpecialInterventionNeeded(b.isSpecialInterventionNeeded === true);
    setBenSpecialInterventionNote(b.specialInterventionNote || "");
    setBenStakeholdersHadir(
      Array.isArray(b.stakeholdersHadir) && b.stakeholdersHadir.length > 0 
        ? b.stakeholdersHadir 
        : ["Petugas Desa / Pemdes", "Kader Posyandu", "Petugas Dinkes / Dinas Kesehatan"]
    );
    setBenKelurahan(b.location.kelurahan || selectedKelurahan);
    setBenDusun(b.location.dusun || selectedDusun);
    setBenPosyandu(b.location.posyandu || selectedPosyandu);
    setBenPuskesmas(b.location.puskesmas || selectedPuskesmas);
    setBenNotes(b.notes || "");
    
    const targetRecord = record || (b.weightRecords && b.weightRecords.length > 0 ? b.weightRecords[b.weightRecords.length - 1] : null);
    setBenInitialWeight(b.initialWeightKg?.toString() || targetRecord?.weightKg?.toString() || "14");
    setBenInitialHeight(b.initialHeightCm?.toString() || targetRecord?.heightCm?.toString() || "95");
    setShowAddBenModal(true);
  };

  // Sync beneficiary location state when header changes or modal opens
  useEffect(() => {
    if (showAddBenModal && !editingBenId) {
      setBenKelurahan(selectedKelurahan);
      setBenDusun(selectedDusun);
      setBenPosyandu(selectedPosyandu);
      setBenPuskesmas(selectedPuskesmas);
    }
  }, [showAddBenModal, editingBenId, selectedKelurahan, selectedDusun, selectedPosyandu, selectedPuskesmas]);

  // Weight Measurement Form State
  const [selectedBenId, setSelectedBenId] = useState<string>("");
  const [measPeriod, setMeasPeriod] = useState<string>("Maret 2026");
  const [customMeasPeriod, setCustomMeasPeriod] = useState<string>("");
  const [isManualMeasPeriod, setIsManualMeasPeriod] = useState<boolean>(false);
  const [measWeight, setMeasWeight] = useState<string>("");
  const [measHeight, setMeasHeight] = useState<string>("");
  const [measSuccess, setMeasSuccess] = useState<boolean>(false);

  // Search & Filter Mode State for Selecting Beneficiary in Weight Entri
  const [benSelectMode, setBenSelectMode] = useState<"autocomplete" | "dropdown" | "manual">("autocomplete");
  const [benSearchQuery, setBenSearchQuery] = useState<string>("");
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState<boolean>(false);

  // Search & Filter State for Weight History Table
  const [histSearchQuery, setHistSearchQuery] = useState<string>("");
  const [histCategoryFilter, setHistCategoryFilter] = useState<string>("ALL");
  const [histPosyanduFilter, setHistPosyanduFilter] = useState<string>("ALL");

  // Officer Identity & Schedule States for Beneficiary Profile
  const [benOfficerDinkesName, setBenOfficerDinkesName] = useState<string>("");
  const [benOfficerAhliGiziName, setBenOfficerAhliGiziName] = useState<string>("");
  const [benOfficerDokterAnakName, setBenOfficerDokterAnakName] = useState<string>("");
  const [benOfficerKaderName, setBenOfficerKaderName] = useState<string>("");
  const [benPosyanduSchedule, setBenPosyanduSchedule] = useState<string>("Setiap Tanggal 15 Bulanan");
  const [benPosyanduAgeLimit, setBenPosyanduAgeLimit] = useState<string>("Hingga Usia 5 Tahun (60 Bulan)");
  const [benIsSpecialInterventionNeeded, setBenIsSpecialInterventionNeeded] = useState<boolean>(false);
  const [benSpecialInterventionNote, setBenSpecialInterventionNote] = useState<string>("");

  const filteredBeneficiariesForWeight = useMemo(() => {
    if (!benSearchQuery.trim()) return beneficiaries;
    const q = benSearchQuery.toLowerCase().trim();
    return beneficiaries.filter(b => 
      b.name.toLowerCase().includes(q) ||
      (b.nik && b.nik.toLowerCase().includes(q)) ||
      (b.parentName && b.parentName.toLowerCase().includes(q)) ||
      (b.location.posyandu && b.location.posyandu.toLowerCase().includes(q)) ||
      (b.location.kelurahan && b.location.kelurahan.toLowerCase().includes(q))
    );
  }, [beneficiaries, benSearchQuery]);

  const selectedBeneficiaryObj = useMemo(() => {
    return beneficiaries.find(b => b.id === selectedBenId) || null;
  }, [beneficiaries, selectedBenId]);

  const filteredWeightHistoryRecords = useMemo(() => {
    const list: { ben: MBGBeneficiary; rec: WeightRecord; idx: number }[] = [];
    const q = histSearchQuery.toLowerCase().trim();

    beneficiaries.forEach((ben) => {
      // Category filter
      if (histCategoryFilter !== "ALL" && ben.category !== histCategoryFilter) return;

      // Posyandu filter
      const benPosyanduStr = ben.location.posyandu || ben.location.kelurahan || "";
      if (histPosyanduFilter !== "ALL" && benPosyanduStr !== histPosyanduFilter) return;

      // General search filter
      if (q) {
        const matchName = ben.name.toLowerCase().includes(q);
        const matchNik = (ben.nik || "").toLowerCase().includes(q);
        const matchParent = (ben.parentName || "").toLowerCase().includes(q);
        const matchPosyandu = benPosyanduStr.toLowerCase().includes(q);
        const matchCategory = ben.category.toLowerCase().includes(q);

        const hasMatchingRec = ben.weightRecords && ben.weightRecords.some(
          r => r.period.toLowerCase().includes(q) || (r.statusGizi || "").toLowerCase().includes(q)
        );

        if (!matchName && !matchNik && !matchParent && !matchPosyandu && !matchCategory && !hasMatchingRec) {
          return;
        }
      }

      // Display 1 row per beneficiary showing their latest measurement record (or matching search record)
      if (ben.weightRecords && ben.weightRecords.length > 0) {
        let chosenIdx = ben.weightRecords.length - 1; // default to latest measurement record
        if (q) {
          const matchIdx = ben.weightRecords.findIndex(
            r => r.period.toLowerCase().includes(q) || (r.statusGizi || "").toLowerCase().includes(q)
          );
          if (matchIdx !== -1) {
            chosenIdx = matchIdx;
          }
        }
        const rec = ben.weightRecords[chosenIdx];
        list.push({ ben, rec, idx: chosenIdx });
      } else {
        list.push({
          ben,
          rec: {
            period: "Belum Timbang",
            weightKg: ben.initialWeightKg !== undefined ? ben.initialWeightKg : 0,
            heightCm: ben.initialHeightCm,
            statusGizi: (ben.initialStatusGizi as any) || "Normal",
            measuredAt: new Date().toISOString().split("T")[0]
          },
          idx: -1
        });
      }
    });

    return list;
  }, [beneficiaries, histSearchQuery, histCategoryFilter, histPosyanduFilter]);

  // Dedicated Modal States for Catat Timbang (Weight Records Manager)
  const [editingWeightBen, setEditingWeightBen] = useState<MBGBeneficiary | null>(null);
  const [deletingWeightItem, setDeletingWeightItem] = useState<{ ben: MBGBeneficiary; record: WeightRecord } | null>(null);

  // Form States for Edit Weight Modal
  const [editWeightPeriod, setEditWeightPeriod] = useState<string>("");
  const [editWeightKg, setEditWeightKg] = useState<string>("");
  const [editHeightCm, setEditHeightCm] = useState<string>("");
  const [editStatusGizi, setEditStatusGizi] = useState<string>("Normal");
  const [editMeasuredAt, setEditMeasuredAt] = useState<string>("");
  const [editWeightSuccess, setEditWeightSuccess] = useState<boolean>(false);
  const [origWeightPeriod, setOrigWeightPeriod] = useState<string>("");

  const handleOpenEditWeightModal = (ben: MBGBeneficiary, preselectedRecord?: WeightRecord) => {
    setEditingWeightBen(ben);
    setEditWeightSuccess(false);

    const liveBen = beneficiaries.find(b => b.id === ben.id) || ben;
    const records = liveBen.weightRecords || [];

    const recToEdit = preselectedRecord || (records.length > 0 ? records[records.length - 1] : null);

    if (recToEdit) {
      setOrigWeightPeriod(recToEdit.period);
      setEditWeightPeriod(recToEdit.period);
      setEditWeightKg(recToEdit.weightKg !== undefined ? recToEdit.weightKg.toString() : "");
      setEditHeightCm(recToEdit.heightCm !== undefined ? recToEdit.heightCm.toString() : "");
      setEditStatusGizi(recToEdit.statusGizi || "Normal");
      setEditMeasuredAt(recToEdit.measuredAt || new Date().toISOString().split("T")[0]);
    } else {
      setOrigWeightPeriod("");
      setEditWeightPeriod("Maret 2026");
      setEditWeightKg("");
      setEditHeightCm("");
      setEditStatusGizi("Normal");
      setEditMeasuredAt(new Date().toISOString().split("T")[0]);
    }
  };

  const handleSelectRecordToEdit = (ben: MBGBeneficiary, record: WeightRecord) => {
    setOrigWeightPeriod(record.period);
    setEditWeightPeriod(record.period);
    setEditWeightKg(record.weightKg !== undefined ? record.weightKg.toString() : "");
    setEditHeightCm(record.heightCm !== undefined ? record.heightCm.toString() : "");
    setEditStatusGizi(record.statusGizi || "Normal");
    setEditMeasuredAt(record.measuredAt || new Date().toISOString().split("T")[0]);
    setEditWeightSuccess(false);
  };

  const handlePrepareAddNewPeriod = () => {
    setOrigWeightPeriod("");
    setEditWeightPeriod("Maret 2026");
    setEditWeightKg("");
    setEditHeightCm("");
    setEditStatusGizi("Normal");
    setEditMeasuredAt(new Date().toISOString().split("T")[0]);
    setEditWeightSuccess(false);
  };

  const handleSaveEditedWeightRecord = (e: FormEvent) => {
    e.preventDefault();
    if (!editingWeightBen) return;

    const newPeriod = editWeightPeriod.trim();
    const weightVal = parseDecimal(editWeightKg, NaN);
    const heightVal = parseOptionalDecimal(editHeightCm);

    if (!newPeriod || isNaN(weightVal)) return;

    // Cross-check against MBG beneficiary list
    const targetBen = beneficiaries.find(b => b.id === editingWeightBen.id) || editingWeightBen;

    const updatedRecord: WeightRecord = {
      period: newPeriod,
      weightKg: weightVal,
      heightCm: heightVal,
      statusGizi: editStatusGizi as any || calculateStatusGizi(weightVal, heightVal),
      measuredAt: editMeasuredAt || new Date().toISOString().split("T")[0]
    };

    // If period string changed, delete old period entry first to avoid duplicate periods
    if (origWeightPeriod && origWeightPeriod !== newPeriod) {
      onDeleteWeightRecord(targetBen.id, origWeightPeriod);
    }

    onAddWeightRecord(targetBen.id, updatedRecord);

    setEditWeightSuccess(true);
    setOrigWeightPeriod("");
    setEditWeightPeriod("");
    setEditWeightKg("");
    setEditHeightCm("");
    setEditStatusGizi("Normal");
    setEditMeasuredAt(new Date().toISOString().split("T")[0]);

    setTimeout(() => {
      setEditWeightSuccess(false);
    }, 1200);
  };

  const handleOpenDeleteWeightModal = (ben: MBGBeneficiary, record: WeightRecord) => {
    setDeletingWeightItem({ ben, record });
  };

  const handleConfirmDeleteWeightRecord = () => {
    if (!deletingWeightItem) return;
    const { ben, record } = deletingWeightItem;
    // Delete only that specific period's weight record
    onDeleteWeightRecord(ben.id, record.period);
    
    // If we are currently editing this same period, reset the form
    if (editingWeightBen?.id === ben.id && origWeightPeriod === record.period) {
      handlePrepareAddNewPeriod();
    }
    
    setDeletingWeightItem(null);
  };

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
      const term = searchTerm.toLowerCase().trim();
      const matchSearch = !term || 
                          b.name.toLowerCase().includes(term) || 
                          (b.parentName && b.parentName.toLowerCase().includes(term)) ||
                          (b.nik && b.nik.toLowerCase().includes(term)) ||
                          (b.location.kelurahan && b.location.kelurahan.toLowerCase().includes(term)) ||
                          (b.location.posyandu && b.location.posyandu.toLowerCase().includes(term)) ||
                          (b.location.dusun && b.location.dusun.toLowerCase().includes(term)) ||
                          (b.notes && b.notes.toLowerCase().includes(term));
                          
      const matchCategory = categoryFilter === "ALL" || b.category === categoryFilter;
      
      const matchAttendance = attendanceFilter === "ALL" || 
                              (attendanceFilter === "HOME_VISIT" && b.attendanceStatus === "Tidak Mengunjungi") ||
                              (attendanceFilter === "ATTENDING" && b.attendanceStatus !== "Tidak Mengunjungi") ||
                              (attendanceFilter === "POSYANDU" && b.attendanceStatus === "Mengunjungi Posyandu") ||
                              (attendanceFilter === "PUSKESMAS" && b.attendanceStatus === "Mengunjungi Puskesmas");

      const matchPosyandu = posyanduFilter === "ALL" || b.location.posyandu === posyanduFilter;

      const matchProgram = programFilter === "ALL" ||
                           (programFilter === "MBG" && b.isReceivedMBG !== false) ||
                           (programFilter === "PMT" && b.isReceivedPMT !== false);

      const matchGender = genderFilter === "ALL" || b.gender === genderFilter;

      return matchSearch && matchCategory && matchAttendance && matchPosyandu && matchProgram && matchGender;
    });
  }, [beneficiaries, searchTerm, categoryFilter, attendanceFilter, posyanduFilter, programFilter, genderFilter]);

  // Calculation of Inter-sectoral Collaboration Rate & Critical Weaknesses
  const collaborationMetrics = useMemo(() => {
    const total = beneficiaries.length;
    if (total === 0) {
      return {
        total: 0,
        notAttendingCount: 0,
        pmtReceivedCount: 0,
        desaHadirCount: 0,
        posyanduHadirCount: 0,
        collabRateScore: 100,
        homeVisitList: [],
        criticalWeaknesses: []
      };
    }

    const homeVisitList = beneficiaries.filter(b => b.attendanceStatus === "Tidak Mengunjungi");
    const notAttendingCount = homeVisitList.length;
    const pmtReceivedCount = beneficiaries.filter(b => b.isReceivedPMT !== false).length;
    const desaHadirCount = beneficiaries.filter(b => b.isPetugasDesaHadir !== false).length;
    const posyanduHadirCount = beneficiaries.filter(b => b.isPetugasPosyanduHadir !== false).length;

    const desaRate = (desaHadirCount / total) * 100;
    const posyanduRate = (posyanduHadirCount / total) * 100;
    const attendanceRate = ((total - notAttendingCount) / total) * 100;
    const pmtRate = (pmtReceivedCount / total) * 100;

    // Weighted Score
    const collabRateScore = Math.round(
      (desaRate * 0.35) + (posyanduRate * 0.35) + (attendanceRate * 0.15) + (pmtRate * 0.15)
    );

    const criticalWeaknesses: string[] = [];

    if (notAttendingCount > 0) {
      criticalWeaknesses.push(
        `🚨 [KRITIS] Ada ${notAttendingCount} sasaran tidak mengunjungi posyandu/puskesmas (${homeVisitList.map(b => b.name).join(", ")}) — Wajib dilakukan Kunjungan Rumah oleh Petugas.`
      );
    }

    if (desaRate < 100) {
      const missingDesaCount = total - desaHadirCount;
      criticalWeaknesses.push(
        `⚠️ [PERHATIAN] Kehadiran Petugas Desa belum 100% (${missingDesaCount} sasaran belum didampingi unsur Pemdes saat penimbangan).`
      );
    }

    if (pmtRate < 100) {
      const missingPmtCount = total - pmtReceivedCount;
      criticalWeaknesses.push(
        `🍼 [TUMPUKAN KEBUTUHAN] Penyaluran PMT belum lengkap (${missingPmtCount} sasaran belum menerima PMT).`
      );
    }

    if (collabRateScore < 75) {
      criticalWeaknesses.push(
        `⚡ [ISU KRITIS SISTEM] Skor Tingkat Kolaborasi Inter-sektoral berada di level ${collabRateScore}%. Hal ini mempengaruhi Indeks Kritis Wilayah Desa.`
      );
    }

    return {
      total,
      notAttendingCount,
      pmtReceivedCount,
      desaHadirCount,
      posyanduHadirCount,
      desaRate: Math.round(desaRate),
      posyanduRate: Math.round(posyanduRate),
      pmtRate: Math.round(pmtRate),
      attendanceRate: Math.round(attendanceRate),
      collabRateScore,
      homeVisitList,
      criticalWeaknesses
    };
  }, [beneficiaries]);

  // Calculate status gizi helper based on weight & height
  const calculateStatusGizi = (weight: number, height?: number): "Normal" | "Gizi Kurang" | "Stunting" | "Risiko Stunting" => {
    if (weight < 10) return "Risiko Stunting";
    if (height && height < 85) return "Stunting";
    if (weight < 12) return "Gizi Kurang";
    return "Normal";
  };

  // Helper functions to safely parse decimal numbers with dots or commas without freezing/clearing inputs
  const parseDecimal = (val: string, fallback = 0): number => {
    if (!val) return fallback;
    const normalized = val.toString().replace(/,/g, '.');
    const num = parseFloat(normalized);
    return isNaN(num) ? fallback : num;
  };

  const parseOptionalDecimal = (val: string): number | undefined => {
    if (!val || val.trim() === "") return undefined;
    const normalized = val.toString().replace(/,/g, '.');
    const num = parseFloat(normalized);
    return isNaN(num) ? undefined : num;
  };

  // Submit Handler for New or Edited Beneficiary
  const handleCreateBeneficiary = (e: FormEvent) => {
    e.preventDefault();
    if (!benName.trim()) return;

    const initialWeightVal = parseDecimal(benInitialWeight, 14);
    const initialHeightVal = parseDecimal(benInitialHeight, 95);

    const existingBen = editingBenId ? beneficiaries.find(b => b.id === editingBenId) : null;

    const updatedBen: MBGBeneficiary = {
      id: existingBen ? existingBen.id : `ben_${Date.now()}`,
      name: benName.trim().toUpperCase(),
      parentName: benParentName.trim(),
      nik: benNik.trim(),
      gender: benGender,
      age: benAge.trim(),
      birthDate: benBirthDate,
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
      isReceivedPMT: benReceivedPMT,
      attendanceStatus: benAttendanceStatus,
      isPetugasDesaHadir: benPetugasDesaHadir,
      isPetugasPosyanduHadir: benPetugasPosyanduHadir,
      isPetugasDinkesHadir: benPetugasDinkesHadir,
      isAhliGiziHadir: benAhliGiziHadir,
      isDokterAnakHadir: benDokterAnakHadir,
      officerDinkesName: benOfficerDinkesName.trim(),
      officerAhliGiziName: benOfficerAhliGiziName.trim(),
      officerDokterAnakName: benOfficerDokterAnakName.trim(),
      officerKaderName: benOfficerKaderName.trim(),
      posyanduSchedule: benPosyanduSchedule.trim() || "Setiap Tanggal 15 Bulanan",
      posyanduAgeLimit: benPosyanduAgeLimit.trim() || "Hingga Usia 5 Tahun (60 Bulan)",
      isSpecialInterventionNeeded: benIsSpecialInterventionNeeded,
      specialInterventionNote: benSpecialInterventionNote.trim(),
      stakeholdersHadir: benStakeholdersHadir,
      initialWeightKg: initialWeightVal,
      initialHeightCm: initialHeightVal,
      initialStatusGizi: calculateStatusGizi(initialWeightVal, initialHeightVal),
      weightRecords: existingBen ? (existingBen.weightRecords || []) : [],
      notes: benNotes.trim()
    };

    onSaveBeneficiary(updatedBen);
    setShowAddBenModal(false);
  };

  // Submit Handler for Adding/Updating Weight Measurement
  const handleAddWeightMeasurement = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedBenId || !measWeight) return;

    const periodStr = isManualMeasPeriod ? customMeasPeriod : measPeriod;
    const weightVal = parseDecimal(measWeight, NaN);
    const heightVal = parseOptionalDecimal(measHeight);

    if (!periodStr || isNaN(weightVal)) return;

    const newRecord: WeightRecord = {
      period: periodStr,
      weightKg: weightVal,
      heightCm: heightVal,
      statusGizi: calculateStatusGizi(weightVal, heightVal),
      measuredAt: new Date().toISOString().split("T")[0]
    };

    onAddWeightRecord(selectedBenId, newRecord);

    setMeasSuccess(true);
    setTimeout(() => setMeasSuccess(false), 2500);

    setMeasWeight("");
    setMeasHeight("");
  };

  // Save Village Sync Metrics Handler
  const handleSaveVillageSync = async () => {
    setIsSavingVillage(true);
    await onUpdateVillageMetrics({
      name: selectedKelurahan,
      pilar1_mbg_sync: mbgSync,
      pilar1_mbg_total: mbgTotal,
      pilar1_pmt_sync: pmtSync,
      pilar1_pmt_total: pmtTotal,
      pilar1_posyandu_sync: posSync,
      pilar1_posyandu_total: posTotal
    });
    setIsSavingVillage(false);
    setSaveVillageSuccess(true);
    setTimeout(() => setSaveVillageSuccess(false), 2500);
  };

  // AI Report Generator
  const handleGenerateAIReport = async () => {
    setIsLoadingAIReport(true);
    setShowAIReportModal(true);
    try {
      const res = await fetch("/api/recommendations", { method: "POST" });
      const data = await res.json();
      if (data && data.recommendations) {
        setAiReportText(data.recommendations);
      } else {
        setAiReportText(generateFallbackAIReport());
      }
    } catch (e) {
      console.error("AI Report fetch failed, generating smart report fallback:", e);
      setAiReportText(generateFallbackAIReport());
    } finally {
      setIsLoadingAIReport(false);
    }
  };

  const generateFallbackAIReport = (): string => {
    const { total, notAttendingCount, pmtReceivedCount, desaRate, posyanduRate, collabRateScore, homeVisitList, criticalWeaknesses } = collaborationMetrics;
    
    return `
# 🤖 LAPORAN EVALUASI & AUDIT AI ORBIT GIZI

**Kabupaten:** Kabupaten Nagekeo | **Wilayah Focus:** ${selectedKelurahan}  
**Tanggal Evaluasi:** ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}  
**Skor Kolaborasi Inter-sektoral:** **${collabRateScore} / 100** (${collabRateScore >= 80 ? "Kategori Baik" : "Kategori Perlu Perhatian / Kritis"})

---

## 📊 1. RINGKASAN DATA & KEHADIRAN PENERIMA MANFAAT
* **Total Penerima MBG Terdaftar:** **${total} Sasaran**
* **Total Terlayani PMT:** **${pmtReceivedCount} sasaran** (${collaborationMetrics.pmtRate}%)
* **Status Kunjungan:**
  * **Mengunjungi Posyandu / Puskesmas:** ${total - notAttendingCount} sasaran
  * **TIDAK MENGUNJUNGI (Absen 1x):** **${notAttendingCount} sasaran**
* **Kehadiran Petugas Desa:** **${desaRate}%**
* **Kehadiran Petugas Posyandu / Kader:** **${posyanduRate}%**

---

## 🚨 2. SASARAN WAJIB KUNJUNGAN RUMAH (HOME VISIT ALERT)
${notAttendingCount > 0 ? `
Petugas posyandu dan kesehatan desa diinstruksikan untuk segera melakukan **Kunjungan Rumah** kepada ${notAttendingCount} sasaran berikut yang tidak hadir pada penimbangan rutin:

${homeVisitList.map((b, i) => `${i + 1}. **${b.name}** (Ortu: ${b.parentName || "-"}, Posyandu: ${b.location.posyandu}) — *Penyebab: Tidak hadir 1x penimbangan*`).join("\n")}
` : `
✅ **Semua sasaran terdaftar hadir dan terlayani di Posyandu/Puskesmas bulan ini!** Tidak ada penunggakan kunjungan rumah.
`}

---

## ⚡ 3. ANALISIS TITIK LEMAH & FAKTOR KRITIS (CRITICAL BOTTLENECK)
${criticalWeaknesses.length > 0 ? criticalWeaknesses.map(w => `- ${w}`).join("\n") : "- Semua pilar kolaborasi dan kehadiran stakeholder berada di level optimal."}

---

## 💡 4. REKOMENDASI TATA KELOLA KANTONG GIZI DESA
1. **Mobilisasi Petugas Desa & Kader:** Pastikan kehadiran Petugas Desa ditingkatkan dari ${desaRate}% menjadi 100% pada setiap hari buka Posyandu untuk memperkuat akuntabilitas alokasi Dana Desa Stunting.
2. **Kunjungan Rumah Terjadwal:** Kader Posyandu bersama Bidan Desa wajib menyelesaikan sweep kunjungan rumah untuk ${notAttendingCount} sasaran di atas maksimal 3 hari kerja setelah hari Posyandu.
3. **Sinkronisasi Data Real-time:** Pastikan seluruh data hasil penimbangan dan distribusi PMT terunggah ke Google Sheets & Dashboard Orbit Gizi secara berkala.
`;
  };

  const mainContent = (
    <div className="space-y-6">
      
      {/* HEADER BAR & REGIONAL LOCATION SELECTOR */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-5 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  PUSAT SINKRONISASI DATA GIZI
                </span>
                <span className="text-xs font-bold text-slate-400">• Orbit Gizi System</span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">
                Sinkronisasi & Input Data Penerima MBG
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* AI Report Button */}
            <button
              onClick={handleGenerateAIReport}
              className="bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 cursor-pointer shadow-md transition-all border border-amber-400/30"
            >
              <Sparkles className="h-4 w-4 text-amber-200 animate-pulse" />
              <span>Analytic Data</span>
            </button>

            <button
              onClick={handleOpenAddBenModal}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer shadow-md transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Penerima</span>
            </button>

            {isModal && onCloseModal && (
              <button
                onClick={onCloseModal}
                className="bg-slate-800 hover:bg-rose-600/20 hover:text-rose-300 text-slate-300 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer shadow-md transition-all border border-slate-700"
              >
                <X className="h-4 w-4 text-rose-400" />
                <span>Tutup Modal</span>
              </button>
            )}
          </div>
        </div>

        {/* Region Cascade Dropdowns */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-indigo-300 uppercase tracking-wider flex items-center space-x-1">
            <MapPin className="h-3 w-3 text-indigo-400" />
            <span>PILIH WILAYAH KERJA TERFOKUS (SINKRONISASI HIUS WILAYAH)</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            
            {/* Propinsi */}
            <LocationSelectorField
              label="1. PROPINSI"
              value={selectedPropinsi}
              onChange={() => {}}
              options={["Nusa Tenggara Timur"]}
              isDark={true}
            />

            {/* Kabupaten */}
            <LocationSelectorField
              label="2. KABUPATEN"
              value={selectedKabupaten}
              onChange={() => {}}
              options={["Kabupaten Nagekeo"]}
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
              onSaveOption={handleSaveCustomPuskesmas}
            />

            {/* Kelurahan */}
            <LocationSelectorField
              label="4. DESA / KELURAHAN"
              value={selectedKelurahan}
              onChange={setSelectedKelurahan}
              options={villageOptions}
              placeholder="Kelurahan..."
              isDark={true}
              onSaveOption={handleSaveCustomKelurahan}
            />

            {/* Dusun */}
            <LocationSelectorField
              label="5. DUSUN"
              value={selectedDusun}
              onChange={setSelectedDusun}
              options={dusunOptions}
              placeholder="Dusun..."
              isDark={true}
              onSaveOption={handleSaveCustomDusun}
            />

            {/* Posyandu */}
            <LocationSelectorField
              label="6. POSYANDU"
              value={selectedPosyandu}
              onChange={setSelectedPosyandu}
              options={posyanduOptions}
              placeholder="Posyandu..."
              isDark={true}
              onSaveOption={handleSaveCustomPosyandu}
            />
          </div>
        </div>
      </div>

      {/* SUB-TABS SELECTOR BAR */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-xs">
        <button
          onClick={() => setActiveSubTab("beneficiaries")}
          className={`flex-1 py-3 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            activeSubTab === "beneficiaries"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>1. Daftar Penerima MBG ({beneficiaries.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("collaboration")}
          className={`flex-1 py-3 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            activeSubTab === "collaboration"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <UserCheck className="h-4 w-4 text-amber-300" />
          <span>2. Kolaborasi & Titik Lemah ({collaborationMetrics.collabRateScore}%)</span>
        </button>

        <button
          onClick={() => setActiveSubTab("weight_records")}
          className={`flex-1 py-3 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            activeSubTab === "weight_records"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Scale className="h-4 w-4" />
          <span>3. Catat BB Bulanan</span>
        </button>

        <button
          onClick={() => setActiveSubTab("location_sync")}
          className={`flex-1 py-3 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            activeSubTab === "location_sync"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>4. Sinkronisasi Desa</span>
        </button>
      </div>

      {/* SUB-TAB 1: DAFTAR PENERIMA MBG */}
      {activeSubTab === "beneficiaries" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          
          {/* Quick Dropdown List & Comprehensive Filters */}
          <div className="space-y-4 bg-indigo-50/40 p-4 rounded-2xl border border-indigo-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Quick Select Dropdown */}
              <div>
                <label className="text-[10px] font-black uppercase text-indigo-900 block mb-1">
                  ⚡ Pilihan Dropdown List Nama (Klik Langsung Buka Detail Data):
                </label>
                <select
                  onChange={(e) => {
                    const found = beneficiaries.find(b => b.id === e.target.value);
                    if (found) setSelectedDetailBen(found);
                  }}
                  className="w-full border border-indigo-200 rounded-xl px-3 py-2 text-xs font-bold bg-white text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="">-- Pilih Nama Penerima untuk Buka Detail Data --</option>
                  {beneficiaries.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.category} - {b.location.posyandu || b.location.kelurahan} | Status: {b.attendanceStatus || "Posyandu"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Fast Search Input */}
              <div>
                <label className="text-[10px] font-black uppercase text-indigo-900 block mb-1">
                  🔍 Pencarian Cepat (Nama, NIK, Ortu, Posyandu, Dusun):
                </label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Ketik nama penerima, NIK, posyandu, ortu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 rounded-xl border border-indigo-200 text-xs font-medium bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Comprehensive Filters Grid */}
            <div className="pt-2 border-t border-indigo-100/60 space-y-2">
              <div className="flex items-center space-x-1 text-[10px] font-black text-indigo-950 uppercase">
                <Filter className="h-3.5 w-3.5 text-indigo-600" />
                <span>Filter Data Penerima:</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {/* Posyandu Filter */}
                <div>
                  <select
                    value={posyanduFilter}
                    onChange={(e) => setPosyanduFilter(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold bg-white text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">Semua Posyandu</option>
                    {availablePosyandus.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold bg-white text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">Semua Kategori</option>
                    <option value="Balita">Balita</option>
                    <option value="Ibu Hamil">Ibu Hamil</option>
                    <option value="Ibu Menyusui">Ibu Menyusui</option>
                  </select>
                </div>

                {/* Attendance Filter */}
                <div>
                  <select
                    value={attendanceFilter}
                    onChange={(e) => setAttendanceFilter(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold bg-white text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">Semua Status Kunjungan</option>
                    <option value="POSYANDU">Mengunjungi Posyandu</option>
                    <option value="PUSKESMAS">Mengunjungi Puskesmas</option>
                    <option value="HOME_VISIT">🚨 Wajib Kunjungan Rumah</option>
                  </select>
                </div>

                {/* Program Filter */}
                <div>
                  <select
                    value={programFilter}
                    onChange={(e) => setProgramFilter(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold bg-white text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">Semua Program</option>
                    <option value="MBG">Penerima MBG</option>
                    <option value="PMT">Penerima PMT</option>
                  </select>
                </div>

                {/* Gender Filter */}
                <div>
                  <select
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold bg-white text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">Semua Kelamin</option>
                    <option value="Laki-laki">👦 Laki-laki</option>
                    <option value="Perempuan">👧 Perempuan</option>
                  </select>
                </div>
              </div>

              {/* Reset Filter & Alert Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                {(searchTerm || categoryFilter !== "ALL" || attendanceFilter !== "ALL" || posyanduFilter !== "ALL" || programFilter !== "ALL" || genderFilter !== "ALL") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setCategoryFilter("ALL");
                      setAttendanceFilter("ALL");
                      setPosyanduFilter("ALL");
                      setProgramFilter("ALL");
                      setGenderFilter("ALL");
                    }}
                    className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                  >
                    🔄 Reset Semua Filter ({filteredBeneficiaries.length} ditemukan)
                  </button>
                )}

                {collaborationMetrics.notAttendingCount > 0 && (
                  <div className="flex items-center space-x-1.5 bg-rose-50 border border-rose-200 text-rose-800 px-3 py-1 rounded-xl text-xs font-bold animate-pulse ml-auto">
                    <AlertTriangle className="h-4 w-4 text-rose-600" />
                    <span>{collaborationMetrics.notAttendingCount} Penerima Perlu Kunjungan Rumah!</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table of Beneficiaries */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="p-3.5">Nama & NIK (Klik Detail)</th>
                  <th className="p-3.5">Kategori</th>
                  <th className="p-3.5">Status Kunjungan & Tindakan</th>
                  <th className="p-3.5">Penerima PMT & MBG</th>
                  <th className="p-3.5">Kehadiran Stakeholder</th>
                  <th className="p-3.5">BB Terakhir</th>
                  <th className="p-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredBeneficiaries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-bold">
                      Belum ada data penerima MBG yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredBeneficiaries.map((b) => {
                    const latestWeight = b.weightRecords[b.weightRecords.length - 1];
                    const isNeedsHomeVisit = b.attendanceStatus === "Tidak Mengunjungi";
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                        
                        {/* Name & NIK */}
                        <td className="p-3.5">
                          <button
                            type="button"
                            onClick={() => setSelectedDetailBen(b)}
                            className="font-black text-indigo-700 hover:text-indigo-900 text-left hover:underline cursor-pointer block text-sm group flex items-center space-x-1"
                            title="Klik untuk membuka Modal Detail Data Penerima"
                          >
                            <span>{b.name}</span>
                            <Eye className="h-3.5 w-3.5 text-indigo-400 group-hover:text-indigo-600 shrink-0" />
                          </button>

                          <div className="flex items-center space-x-1.5 mt-0.5">
                            {b.gender && (
                              <span className={`px-1.5 py-0.2 text-[9px] font-black rounded ${
                                b.gender === "Laki-laki" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-pink-50 text-pink-700 border border-pink-200"
                              }`}>
                                {b.gender === "Laki-laki" ? "👦 L" : "👧 P"}
                              </span>
                            )}
                            {b.age && <span className="text-[10px] font-bold text-slate-600">{b.age}</span>}
                            {b.birthDate && (
                              <span className="text-[9px] font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                📅 {b.birthDate}
                              </span>
                            )}
                          </div>

                          {b.parentName && (
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              Ortu/Wali: <span className="font-semibold text-slate-700">{b.parentName}</span>
                            </p>
                          )}
                          <p className="text-[9px] font-mono text-slate-400">NIK: {b.nik || "-"}</p>
                        </td>

                        {/* Category */}
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {b.category}
                          </span>
                        </td>

                        {/* Attendance Status */}
                        <td className="p-3.5">
                          {isNeedsHomeVisit ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                                <AlertTriangle className="h-3 w-3 text-rose-600" />
                                <span>Tidak Mengunjungi</span>
                              </span>
                              <div className="flex items-center space-x-1 text-[9px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                <Home className="h-3 w-3" />
                                <span>HARUS KUNJUNGAN RUMAH</span>
                              </div>
                            </div>
                          ) : b.attendanceStatus === "Mengunjungi Puskesmas" ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-blue-50 text-blue-800 border border-blue-200">
                              <HeartPulse className="h-3 w-3 text-blue-600" />
                              <span>Mengunjungi Puskesmas</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              <span>Mengunjungi Posyandu</span>
                            </span>
                          )}
                        </td>

                        {/* PMT & MBG */}
                        <td className="p-3.5 space-y-1">
                          <div className="flex items-center space-x-1">
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded ${b.isReceivedMBG ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                              MBG: {b.isReceivedMBG ? "YA" : "TIDAK"}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded ${b.isReceivedPMT !== false ? "bg-purple-100 text-purple-800" : "bg-rose-100 text-rose-800"}`}>
                              PMT: {b.isReceivedPMT !== false ? "YA" : "TIDAK"}
                            </span>
                          </div>
                        </td>

                        {/* Stakeholders Presence */}
                        <td className="p-3.5 text-[10px] text-slate-600">
                          <div className="flex flex-wrap gap-1">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${b.isPetugasDesaHadir !== false ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "bg-slate-100 text-slate-400"}`}>
                              Pemdes: {b.isPetugasDesaHadir !== false ? "Hadir" : "Absen"}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${b.isPetugasPosyanduHadir !== false ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-400"}`}>
                              Posyandu: {b.isPetugasPosyanduHadir !== false ? "Hadir" : "Absen"}
                            </span>
                          </div>
                        </td>

                        {/* Weight */}
                        <td className="p-3.5 font-bold text-slate-800">
                          {latestWeight ? (
                            <div>
                              <span>{latestWeight.weightKg} kg</span>
                              <span className="text-[10px] text-slate-400 block font-normal">
                                {latestWeight.period} ({latestWeight.statusGizi || "Normal"})
                              </span>
                            </div>
                          ) : b.initialWeightKg ? (
                            <div>
                              <span>{b.initialWeightKg} kg</span>
                              <span className="text-[10px] text-slate-400 block font-normal">
                                BB Awal ({b.initialStatusGizi || "Normal"})
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs font-normal">Belum Timbang</span>
                          )}
                        </td>

                        {/* Action buttons */}
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => setSelectedDetailBen(b)}
                              className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors cursor-pointer font-extrabold text-[11px] flex items-center space-x-1 border border-indigo-200"
                              title="Lihat Detail Data Penerima"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="hidden sm:inline">Detail</span>
                            </button>
                            <button
                              onClick={() => handleOpenEditBenModal(b)}
                              className="p-1.5 hover:bg-amber-50 text-amber-700 hover:text-amber-800 rounded-lg transition-colors cursor-pointer font-extrabold text-[11px] flex items-center space-x-1"
                              title="Modal Edit Data Penerima"
                            >
                              <Edit3 className="h-4 w-4" />
                              <span className="hidden sm:inline">Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Yakin ingin menghapus data sasaran ${b.name}?`)) {
                                  onDeleteBeneficiary(b.id);
                                }
                              }}
                              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Penerima"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
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

      {/* SUB-TAB 2: KOLABORASI & TITIK LEMAH */}
      {activeSubTab === "collaboration" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-indigo-600" />
                <span>Papan Skor Kolaborasi Inter-sektoral & Identifikasi Titik Lemah</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Metrik ini secara otomatis mengalkulasi keterlibatan stakeholder dan mempengaruhi status Kritis Desa.
              </p>
            </div>

            <div className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center space-x-2 border shadow-xs ${
              collaborationMetrics.collabRateScore >= 80
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : collaborationMetrics.collabRateScore >= 60
                  ? "bg-amber-50 text-amber-800 border-amber-300"
                  : "bg-rose-50 text-rose-800 border-rose-300"
            }`}>
              <Activity className="h-4 w-4" />
              <span>Skor Kolaborasi: {collaborationMetrics.collabRateScore}% ({collaborationMetrics.collabRateScore >= 80 ? "Kuat" : "Perlu Evaluasi"})</span>
            </div>
          </div>

          {/* Grid Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400">Tingkat Kehadiran Petugas Desa</span>
              <p className="text-2xl font-black text-slate-900">{collaborationMetrics.desaRate}%</p>
              <p className="text-[11px] font-semibold text-slate-500">
                {collaborationMetrics.desaHadirCount} dari {collaborationMetrics.total} sasaran didampingi Pemdes
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400">Kehadiran Kader Posyandu</span>
              <p className="text-2xl font-black text-slate-900">{collaborationMetrics.posyanduRate}%</p>
              <p className="text-[11px] font-semibold text-slate-500">
                {collaborationMetrics.posyanduHadirCount} dari {collaborationMetrics.total} sasaran aktif ditimbang
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400">Kunjungan Rumah Wajib</span>
              <p className="text-2xl font-black text-rose-600">{collaborationMetrics.notAttendingCount} Sasaran</p>
              <p className="text-[11px] font-semibold text-rose-700">
                Absen 1x & Membutuhkan Home Visit
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400">Cakupan PMT Terlayani</span>
              <p className="text-2xl font-black text-purple-700">{collaborationMetrics.pmtRate}%</p>
              <p className="text-[11px] font-semibold text-slate-500">
                {collaborationMetrics.pmtReceivedCount} dari {collaborationMetrics.total} sasaran menerima PMT
              </p>
            </div>

          </div>

          {/* Critical Weakness Analysis Box */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>Daftar Titik Lemah (Bottlenecks) & Catatan Kritis Sektoral</span>
            </h4>

            {collaborationMetrics.criticalWeaknesses.length === 0 ? (
              <p className="text-xs font-bold text-emerald-800 bg-white p-3 rounded-xl border border-emerald-200">
                ✅ Tidak ditemukan titik lemah kritis. Semua koordinasi stakeholder dan kunjungan sasaran berjalan lancar.
              </p>
            ) : (
              <div className="space-y-2">
                {collaborationMetrics.criticalWeaknesses.map((weakness, i) => (
                  <div key={i} className="bg-white p-3 rounded-xl border border-amber-200 text-xs font-bold text-slate-800 shadow-2xs">
                    {weakness}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Home Visit List Panel */}
          {collaborationMetrics.homeVisitList.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-rose-900 flex items-center space-x-2">
                <Home className="h-4 w-4 text-rose-600" />
                <span>Detail Sasaran Wajib Kunjungan Rumah ({collaborationMetrics.homeVisitList.length} Anak / Ibu)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {collaborationMetrics.homeVisitList.map((b) => (
                  <div key={b.id} className="bg-white p-3.5 rounded-2xl border border-rose-200 shadow-2xs flex items-center justify-between">
                    <div>
                      <p className="font-black text-slate-900 text-xs">{b.name}</p>
                      <p className="text-[10px] font-bold text-indigo-700">Ortu: {b.parentName || "-"}</p>
                      <p className="text-[9px] text-slate-400">{b.location.posyandu} • {b.location.kelurahan}</p>
                    </div>

                    <button
                      onClick={() => handleOpenEditBenModal(b)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black cursor-pointer shadow-xs"
                    >
                      Update Status Modal
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* SUB-TAB 3: CATAT BERAT BADAN BULANAN (UPDATE PERKEMBANGAN) */}
      {activeSubTab === "weight_records" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Form */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 lg:col-span-1">
            <div className="flex items-center space-x-2 text-indigo-700">
              <Scale className="h-5 w-5" />
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">Entri Hasil Timbang BB (Update Rutin)</h3>
            </div>

            <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-3 text-xs text-indigo-950 font-medium space-y-1">
              <div className="flex items-center space-x-1.5 font-black text-indigo-900">
                <Sparkles className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>KEGIATAN RUTIN BULANAN</span>
              </div>
              <p className="text-[11px] text-indigo-800 leading-relaxed">
                Pilih penerima dan masukkan hasil penimbangan bulanan. Data ini akan ditambahkan ke <strong>Grafik Pertumbuhan Anak</strong> tanpa menimpa data master profil awal.
              </p>
            </div>

            <form onSubmit={handleAddWeightMeasurement} className="space-y-4">
              {/* PILIH PENERIMA / ANAK (MULTI-MODE SEARCH & SELECTION) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-500 uppercase block">
                    PILIH PENERIMA / ANAK *
                  </label>
                  {/* Mode Selector Buttons */}
                  <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setBenSelectMode("autocomplete")}
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold cursor-pointer transition-colors ${
                        benSelectMode === "autocomplete" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                      title="Mode Autocomplete & Pencarian Live"
                    >
                      🔍 Autocomplete
                    </button>
                    <button
                      type="button"
                      onClick={() => setBenSelectMode("dropdown")}
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold cursor-pointer transition-colors ${
                        benSelectMode === "dropdown" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                      title="Mode Dropdown List Biasa"
                    >
                      📋 Dropdown
                    </button>
                    <button
                      type="button"
                      onClick={() => setBenSelectMode("manual")}
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold cursor-pointer transition-colors ${
                        benSelectMode === "manual" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                      title="Mode Ketik Filter Manual"
                    >
                      ⌨️ Filter List
                    </button>
                  </div>
                </div>

                {/* Selected Beneficiary Active Card Preview */}
                {selectedBeneficiaryObj ? (
                  <div className="bg-indigo-50/90 border-2 border-indigo-400 rounded-2xl p-3 space-y-2 shadow-xs">
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-xs text-indigo-950">{selectedBeneficiaryObj.name}</span>
                          <span className="px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-black rounded-md">
                            {selectedBeneficiaryObj.category}
                          </span>
                        </div>
                        <div className="text-[10px] font-bold text-slate-600">
                          Ortu: {selectedBeneficiaryObj.parentName || "-"} • NIK: {selectedBeneficiaryObj.nik || "-"}
                        </div>
                        <div className="text-[10px] text-indigo-800 font-semibold flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-indigo-600 inline shrink-0" />
                          <span>Posyandu: {selectedBeneficiaryObj.location.posyandu || selectedBeneficiaryObj.location.kelurahan}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBenId("");
                          setBenSearchQuery("");
                          setIsAutocompleteOpen(true);
                        }}
                        className="px-2 py-1 bg-white border border-indigo-300 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-black cursor-pointer shrink-0"
                      >
                        🔄 Ganti
                      </button>
                    </div>

                    {/* Latest Record Summary */}
                    {selectedBeneficiaryObj.weightRecords.length > 0 && (
                      <div className="pt-2 border-t border-indigo-200/80 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 font-bold">BB Terakhir:</span>
                        <span className="font-black text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-200">
                          ⚖️ {selectedBeneficiaryObj.weightRecords[selectedBeneficiaryObj.weightRecords.length - 1].weightKg} kg ({selectedBeneficiaryObj.weightRecords[selectedBeneficiaryObj.weightRecords.length - 1].statusGizi || "Normal"})
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* MODE 1: AUTOCOMPLETE SEARCH */}
                    {benSelectMode === "autocomplete" && (
                      <div className="relative">
                        <div className="relative">
                          <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Cari Nama Anak / NIK / Posyandu (Autocomplete)..."
                            value={benSearchQuery}
                            onFocus={() => setIsAutocompleteOpen(true)}
                            onChange={(e) => {
                              setBenSearchQuery(e.target.value);
                              setIsAutocompleteOpen(true);
                            }}
                            className="w-full border border-indigo-300 rounded-xl pl-9 pr-8 py-2.5 text-xs font-bold bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                          />
                          {benSearchQuery && (
                            <button
                              type="button"
                              onClick={() => {
                                setBenSearchQuery("");
                                setIsAutocompleteOpen(true);
                              }}
                              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        {/* Autocomplete Dropdown List */}
                        {isAutocompleteOpen && (
                          <div className="absolute z-30 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl space-y-1 p-1.5">
                            <div className="px-2 py-1 border-b border-slate-100 text-[9px] font-bold text-slate-400 uppercase flex items-center justify-between">
                              <span>HASIL PENALARAN AUTOCOMPLETE ({filteredBeneficiariesForWeight.length})</span>
                              <button type="button" onClick={() => setIsAutocompleteOpen(false)} className="text-indigo-600 underline">Tutup</button>
                            </div>

                            {filteredBeneficiariesForWeight.length === 0 ? (
                              <div className="p-3 text-center text-slate-400 text-xs font-bold">
                                Tidak ada anak yang cocok dengan kata kunci "{benSearchQuery}".
                              </div>
                            ) : (
                              filteredBeneficiariesForWeight.map((b) => (
                                <button
                                  key={b.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedBenId(b.id);
                                    setIsAutocompleteOpen(false);
                                  }}
                                  className="w-full text-left p-2 rounded-xl hover:bg-indigo-50 transition-colors cursor-pointer border border-transparent hover:border-indigo-100 flex items-center justify-between"
                                >
                                  <div>
                                    <div className="font-extrabold text-xs text-slate-900 flex items-center space-x-1.5">
                                      <span>{b.name}</span>
                                      <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-800 text-[9px] font-bold rounded">
                                        {b.category}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-medium">
                                      Ortu: {b.parentName || "-"} • Posyandu: {b.location.posyandu || b.location.kelurahan}
                                    </div>
                                  </div>
                                  <div className="text-right text-[10px] font-bold text-indigo-700">
                                    {b.weightRecords.length > 0 ? `${b.weightRecords[b.weightRecords.length - 1].weightKg} kg` : "Belum Timbang"}
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* MODE 2: DROPDOWN BIASA WITH QUICK FILTER */}
                    {benSelectMode === "dropdown" && (
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          placeholder="Ketik untuk memfilter isi dropdown..."
                          value={benSearchQuery}
                          onChange={(e) => setBenSearchQuery(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white focus:outline-none"
                        />
                        <select
                          value={selectedBenId}
                          onChange={(e) => setSelectedBenId(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none cursor-pointer"
                          required
                        >
                          <option value="">-- Pilih Penerima MBG ({filteredBeneficiariesForWeight.length} Anak) --</option>
                          {filteredBeneficiariesForWeight.map(b => (
                            <option key={b.id} value={b.id}>
                              {b.name} ({b.category} - {b.location.posyandu || b.location.kelurahan})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* MODE 3: MANUAL FILTER CARDS */}
                    {benSelectMode === "manual" && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Ketik manual nama anak / NIK..."
                          value={benSearchQuery}
                          onChange={(e) => setBenSearchQuery(e.target.value)}
                          className="w-full border border-indigo-200 rounded-xl px-3 py-2 text-xs font-bold bg-white text-slate-900 focus:outline-none"
                        />
                        <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-1.5 space-y-1 bg-slate-50">
                          {filteredBeneficiariesForWeight.map(b => (
                            <div key={b.id} className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                              <div>
                                <span className="font-black text-xs text-slate-800 block">{b.name}</span>
                                <span className="text-[10px] text-slate-500">{b.category} • {b.location.posyandu}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedBenId(b.id)}
                                className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-black cursor-pointer hover:bg-indigo-700"
                              >
                                Pilih
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                  PERIODE PENGUKURAN *
                </label>
                {isManualMeasPeriod ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Ketik Periode Manual (Cth: Periode TW1 2026)"
                      value={customMeasPeriod}
                      onChange={(e) => setCustomMeasPeriod(e.target.value)}
                      className="w-full border border-indigo-300 rounded-xl px-3.5 py-2.5 text-xs font-bold bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setIsManualMeasPeriod(false)}
                      className="text-[10px] font-bold text-indigo-600 underline cursor-pointer"
                    >
                      Pilih List
                    </button>
                  </div>
                ) : (
                  <select
                    value={measPeriod}
                    onChange={(e) => {
                      if (e.target.value === "MANUAL_INPUT") {
                        setIsManualMeasPeriod(true);
                      } else {
                        setMeasPeriod(e.target.value);
                      }
                    }}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none cursor-pointer"
                  >
                    {PERIOD_OPTIONS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                    <option value="MANUAL_INPUT" className="font-bold text-indigo-600">+ Tambah Periode Manual...</option>
                  </select>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                  BERAT BADAN (KG) *
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Contoh: 14.5 (atau 14,5)"
                  value={measWeight}
                  onChange={(e) => setMeasWeight(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                  TINGGI / PANJANG BADAN (CM) - OPSIONAL
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Contoh: 95.5 (atau 95,5)"
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

          {/* Right: History */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-indigo-600" />
                <span>Histori Pengukuran Berat Badan</span>
              </h3>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-xl">
                {filteredWeightHistoryRecords.length} Catatan Ditemukan
              </span>
            </div>

            {/* Filter Bar for History Table */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
              {/* Search input */}
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama, NIK, periode..."
                  value={histSearchQuery}
                  onChange={(e) => setHistSearchQuery(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-bold bg-white text-slate-800 focus:outline-none"
                />
              </div>

              {/* Category Filter */}
              <select
                value={histCategoryFilter}
                onChange={(e) => setHistCategoryFilter(e.target.value)}
                className="border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold bg-white text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Kategori Sasaran</option>
                <option value="Balita">Balita</option>
                <option value="Ibu Hamil">Ibu Hamil</option>
                <option value="Ibu Menyusui">Ibu Menyusui</option>
              </select>

              {/* Posyandu Filter */}
              <select
                value={histPosyanduFilter}
                onChange={(e) => setHistPosyanduFilter(e.target.value)}
                className="border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold bg-white text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Posyandu / Lokasi</option>
                {Array.from(new Set(beneficiaries.map(b => b.location.posyandu || b.location.kelurahan))).map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto max-h-[500px] border border-slate-200 rounded-2xl relative">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10 shadow-xs">
                  <tr className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="p-4">Penerima</th>
                    <th className="p-4">Posyandu</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">Periode</th>
                    <th className="p-4">Berat (kg)</th>
                    <th className="p-4">Tinggi (cm)</th>
                    <th className="p-4">Status Gizi</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredWeightHistoryRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 font-bold text-xs">
                        Tidak ada histori pengukuran yang sesuai dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredWeightHistoryRecords.map(({ ben, rec, idx }) => (
                      <tr key={`${ben.id}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <button
                            type="button"
                            onClick={() => setSelectedDetailBen(ben)}
                            className="font-black text-slate-800 hover:text-indigo-700 hover:underline text-left cursor-pointer flex items-center space-x-1 group"
                            title="Klik untuk membuka Modal Detail Data Penerima"
                          >
                            <span>{ben.name}</span>
                            <Eye className="h-3.5 w-3.5 text-indigo-400 group-hover:text-indigo-600 shrink-0" />
                          </button>
                          {ben.isReceivedMBG && <span className="text-[9px] font-extrabold text-emerald-600 tracking-wider">PENERIMA MBG</span>}
                        </td>
                        <td className="p-4 text-slate-600 text-xs font-medium">{ben.location.posyandu || ben.location.kelurahan}</td>
                        <td className="p-4 text-slate-600 text-xs font-medium">{ben.category}</td>
                        <td className="p-4 font-semibold text-slate-700 text-xs">{rec.period}</td>
                        <td className="p-4 font-black text-slate-900">{rec.weightKg}</td>
                        <td className="p-4 text-slate-600 font-medium">{rec.heightCm || '-'}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            rec.statusGizi === "Normal" 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                              : rec.statusGizi === "Stunting" 
                                ? "bg-rose-50 text-rose-700 border-rose-200" 
                                : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {rec.statusGizi || "Normal"}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => setSelectedDetailBen(ben)}
                              className="p-1.5 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-800 rounded-lg transition-colors cursor-pointer"
                              title="Lihat Detail Data Penerima"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditWeightModal(ben, rec)}
                              className="p-1.5 hover:bg-amber-50 text-amber-600 hover:text-amber-800 rounded-lg transition-colors cursor-pointer"
                              title="Edit Data Hasil Timbang (Modal Sendiri)"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleOpenDeleteWeightModal(ben, rec)}
                              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Data Hasil Timbang (Modal Sendiri)"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 4: SINKRONISASI DESA */}
      {activeSubTab === "location_sync" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Pusat Sinkronisasi Data Desa / Kelurahan: {selectedKelurahan}
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

      {/* BENEFICIARY EDIT / ADD MODAL */}
      {showAddBenModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 sticky top-0 bg-white z-10">
              <div className="flex items-center space-x-2 text-indigo-600">
                <Users className="h-5 w-5" />
                <h3 className="text-sm font-black uppercase text-slate-900">
                  {editingBenId ? `Update Profil Master: ${benName || "Penerima MBG"}` : "Registrasi Profil Master Awal Anak"}
                </h3>
              </div>
              <button
                onClick={() => setShowAddBenModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Explanation Callout for Initial Data vs Routine Updates */}
            <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-3.5 space-y-1 text-xs text-indigo-950 font-medium">
              <div className="flex items-center space-x-2 font-black text-indigo-900">
                <Info className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>PENTING: PETUNJUK DATA MASTER VS ENTRI TIMBANG BULANAN</span>
              </div>
              <p className="text-[11px] leading-relaxed text-indigo-800">
                Form modal ini digunakan khusus untuk <strong>mendaftarkan atau memperbarui Data Master Awal Profil Anak</strong> (NIK, Nama, Orang Tua, Tgl Lahir, Posyandu). Untuk melakukan pencatatan hasil timbang BB/TB rutin bulanan, silakan gunakan tab <strong>"Catat BB Bulanan"</strong> agar histori penimbangan bertambah secara kronologis dan tidak menimpa data master profil awal.
              </p>
            </div>

            <form onSubmit={handleCreateBeneficiary} className="space-y-4 text-xs">
              
              {/* Home Visit Warning Banner if Tidak Mengunjungi */}
              {benAttendanceStatus === "Tidak Mengunjungi" && (
                <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 text-rose-900 space-y-1 animate-pulse">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
                    <h4 className="font-black text-xs uppercase tracking-wider text-rose-800">
                      🚨 WAJIB DILAKUKAN KUNJUNGAN RUMAH (HOME VISIT REQUIRED)
                    </h4>
                  </div>
                  <p className="text-[11px] font-bold leading-relaxed text-rose-700 pl-7">
                    Penerima ini tercatat **Tidak Mengunjungi Posyandu/Puskesmas**. Sesuai standar tata kelola Orbit Gizi, sasaran yang absen 1x penimbangan harus segera dikunjungi oleh Kader Posyandu & Petugas Kesehatan Desa!
                  </p>
                </div>
              )}

              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1 text-xs">NAMA LENGKAP PENERIMA *</label>
                  <input
                    type="text"
                    placeholder="Contoh: ADRIAN SA"
                    value={benName}
                    onChange={(e) => setBenName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1 text-xs">NAMA ORANG TUA / WALI</label>
                  <input
                    type="text"
                    placeholder="Contoh: MERSIANA ERE"
                    value={benParentName}
                    onChange={(e) => setBenParentName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1 text-xs">NIK (NOMOR INDUK KEPENDUDUKAN)</label>
                <input
                  type="text"
                  placeholder="Contoh: 5316013011220001"
                  value={benNik}
                  onChange={(e) => setBenNik(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                />
              </div>

              {/* Gender, Age, Birthdate */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-indigo-50/40 p-3 rounded-2xl border border-indigo-100">
                <div>
                  <label className="font-bold text-indigo-900 block mb-1">JENIS KELAMIN *</label>
                  <select
                    value={benGender}
                    onChange={(e) => setBenGender(e.target.value as "Laki-laki" | "Perempuan")}
                    className="w-full border border-indigo-200 rounded-xl p-2 font-bold bg-white focus:outline-none cursor-pointer text-xs"
                  >
                    <option value="Laki-laki">👦 Laki-laki</option>
                    <option value="Perempuan">👧 Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-indigo-900 block mb-1">UMUR SASARAN *</label>
                  <input
                    type="text"
                    placeholder="Contoh: 3 Tahun 2 Bulan"
                    value={benAge}
                    onChange={(e) => setBenAge(e.target.value)}
                    className="w-full border border-indigo-200 rounded-xl p-2 font-bold bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-indigo-900 block mb-1">TANGGAL LAHIR</label>
                  <input
                    type="date"
                    value={benBirthDate}
                    onChange={(e) => setBenBirthDate(e.target.value)}
                    className="w-full border border-indigo-200 rounded-xl p-2 font-medium bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-xs"
                  />
                </div>
              </div>

              {/* Status Kunjungan & Attendance Logic */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <span className="text-[10px] font-black uppercase text-indigo-700 block">
                  🏥 STATUS KUNJUNGAN SASARAN & PENDAMPINGAN TIM KESEHATAN
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">STATUS KUNJUNGAN SASARAN *</label>
                    <select
                      value={benAttendanceStatus}
                      onChange={(e) => setBenAttendanceStatus(e.target.value as any)}
                      className="w-full border border-slate-300 rounded-xl p-2.5 font-bold bg-white text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="Mengunjungi Posyandu">🏥 Mengunjungi Posyandu</option>
                      <option value="Mengunjungi Puskesmas">🏨 Mengunjungi Puskesmas</option>
                      <option value="Tidak Mengunjungi" className="font-bold text-rose-600">🚨 Tidak Mengunjungi (Wajib Kunjungan Rumah)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">STATUS PENERIMAAN PMT *</label>
                    <select
                      value={benReceivedPMT ? "YES" : "NO"}
                      onChange={(e) => setBenReceivedPMT(e.target.value === "YES")}
                      className="w-full border border-slate-300 rounded-xl p-2.5 font-bold bg-white text-slate-800 focus:outline-none cursor-pointer mb-1"
                    >
                      <option value="YES">🍼 Ya, Mendapatkan PMT</option>
                      <option value="NO">❌ Tidak Mendapatkan PMT</option>
                    </select>
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => setBenReceivedPMT(true)}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black transition-all cursor-pointer border ${
                          benReceivedPMT ? "bg-purple-100 border-purple-300 text-purple-900" : "bg-white border-slate-200 text-slate-500"
                        }`}
                      >
                        🍼 Ya (PMT)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBenReceivedPMT(false)}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black transition-all cursor-pointer border ${
                          !benReceivedPMT ? "bg-rose-100 border-rose-300 text-rose-900" : "bg-white border-slate-200 text-slate-500"
                        }`}
                      >
                        ❌ Tidak
                      </button>
                    </div>
                  </div>
                </div>

                {/* Home Visit Alert Note if 1x absent or "Tidak Mengunjungi" */}
                {benAttendanceStatus === "Tidak Mengunjungi" ? (
                  <div className="bg-rose-100 border border-rose-300 rounded-xl p-3 text-rose-900 text-xs font-bold space-y-0.5">
                    <p className="flex items-center space-x-1.5 text-rose-800 font-black">
                      <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                      <span>PERLU KUNJUNGAN RUMAH (SASARAN 1X TIDAK KE POSYANDU)</span>
                    </p>
                    <p className="text-[10px] font-medium text-rose-700 pl-5">
                      Petugas & Kader Posyandu wajib mendatangi rumah sasaran ini untuk pemeriksaan gizi dan pendampingan.
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-2.5 text-[11px] font-semibold text-amber-900 flex items-center space-x-2">
                    <Info className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>Catatan: Bila sasaran 1 kali tidak mengunjungi Posyandu/Puskesmas, pilih status "Tidak Mengunjungi" agar sistem mencatat kebutuhan Kunjungan Rumah.</span>
                  </div>
                )}

                {/* Kehadiran Petugas Desa & Petugas Posyandu */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">KEHADIRAN PETUGAS DESA / PEMDES</label>
                    <select
                      value={benPetugasDesaHadir ? "YES" : "NO"}
                      onChange={(e) => setBenPetugasDesaHadir(e.target.value === "YES")}
                      className="w-full border border-slate-300 rounded-xl p-2 font-bold bg-white text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="YES">✅ Petugas Desa Hadir</option>
                      <option value="NO">❌ Petugas Desa Tidak Hadir</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">KEHADIRAN PETUGAS POSYANDU / KADER</label>
                    <select
                      value={benPetugasPosyanduHadir ? "YES" : "NO"}
                      onChange={(e) => setBenPetugasPosyanduHadir(e.target.value === "YES")}
                      className="w-full border border-slate-300 rounded-xl p-2 font-bold bg-white text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="YES">✅ Petugas Posyandu / Kader Hadir</option>
                      <option value="NO">❌ Kader / Petugas Tidak Hadir</option>
                    </select>
                  </div>
                </div>

                {/* Dinkes, Ahli Gizi, Dokter Anak Visits */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-200/80">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">🏛️ PETUGAS DINKES (BULANAN)</label>
                    <select
                      value={benPetugasDinkesHadir ? "YES" : "NO"}
                      onChange={(e) => setBenPetugasDinkesHadir(e.target.value === "YES")}
                      className="w-full border border-slate-300 rounded-xl p-2 font-bold bg-white text-slate-800 text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="YES">✅ Dinkes Hadir (1x/Bulan)</option>
                      <option value="NO">❌ Dinkes Tidak Hadir</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">🥗 AHLI GIZI PUSKESMAS/DESA</label>
                    <select
                      value={benAhliGiziHadir ? "YES" : "NO"}
                      onChange={(e) => setBenAhliGiziHadir(e.target.value === "YES")}
                      className="w-full border border-slate-300 rounded-xl p-2 font-bold bg-white text-slate-800 text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="YES">✅ Ahli Gizi Hadir</option>
                      <option value="NO">❌ Ahli Gizi Tidak Hadir</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">🩺 DOKTER ANAK / SPESIALIS</label>
                    <select
                      value={benDokterAnakHadir ? "YES" : "NO"}
                      onChange={(e) => setBenDokterAnakHadir(e.target.value === "YES")}
                      className="w-full border border-slate-300 rounded-xl p-2 font-bold bg-white text-slate-800 text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="YES">✅ Dokter Anak Hadir</option>
                      <option value="NO">⚪ Tidak Memerlukan / Belum</option>
                    </select>
                  </div>
                </div>

                {/* IDENTITAS NAMA PETUGAS YANG MENGUNJUNGI (DATA DIRI & INSTANSI) */}
                <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-3 space-y-2">
                  <span className="text-[10px] font-black uppercase text-indigo-900 block">
                    👨‍⚕️ IDENTITAS NAMA PETUGAS PENDAMPING & INSTANSI MENGUNJUNGI
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Nama Petugas Dinkes & Instansi</label>
                      <input
                        type="text"
                        placeholder="Contoh: Drs. Ahmad Dahlan, M.Kes (Dinkes Ende)"
                        value={benOfficerDinkesName}
                        onChange={(e) => setBenOfficerDinkesName(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-2 font-bold text-xs bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Nama Ahli Gizi & Puskesmas</label>
                      <input
                        type="text"
                        placeholder="Contoh: Siti Rahma, S.Gz (Nutrisionis Puskesmas)"
                        value={benOfficerAhliGiziName}
                        onChange={(e) => setBenOfficerAhliGiziName(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-2 font-bold text-xs bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Nama Dokter Anak / Pakar</label>
                      <input
                        type="text"
                        placeholder="Contoh: dr. H. Prasetyo, Sp.A (RSUD / Tim Pakar)"
                        value={benOfficerDokterAnakName}
                        onChange={(e) => setBenOfficerDokterAnakName(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-2 font-bold text-xs bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Nama Kader Posyandu Pendamping</label>
                      <input
                        type="text"
                        placeholder="Contoh: Ibu Maria & Ibu Yuliana (Kader Posyandu)"
                        value={benOfficerKaderName}
                        onChange={(e) => setBenOfficerKaderName(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-2 font-bold text-xs bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* JADWAL POSYANDU & BATAS USIA PEMANTAUAN */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 space-y-2">
                  <span className="text-[10px] font-black uppercase text-emerald-900 block">
                    🗓️ JADWAL KUNJUNGAN POSYANDU & USIA BATAS PEMANTAUAN
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Jadwal Kunjungan Posyandu Rutin</label>
                      <input
                        type="text"
                        placeholder="Contoh: Setiap Tanggal 15 Bulanan"
                        value={benPosyanduSchedule}
                        onChange={(e) => setBenPosyanduSchedule(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-2 font-bold text-xs bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Perlu Pemantauan S/D Umur Berapa</label>
                      <input
                        type="text"
                        placeholder="Contoh: Hingga Usia 5 Tahun (60 Bulan)"
                        value={benPosyanduAgeLimit}
                        onChange={(e) => setBenPosyanduAgeLimit(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-2 font-bold text-xs bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Special Intervention Toggle */}
                  <div className="pt-1 space-y-1.5">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={benIsSpecialInterventionNeeded}
                        onChange={(e) => setBenIsSpecialInterventionNeeded(e.target.checked)}
                        className="h-4 w-4 text-rose-600 rounded focus:ring-rose-500"
                      />
                      <span className="text-xs font-black text-rose-900">
                        🚨 Jadwalkan Kunjungan / Intervensi Khusus Stunting oleh Petugas
                      </span>
                    </label>

                    {benIsSpecialInterventionNeeded && (
                      <input
                        type="text"
                        placeholder="Catatan Instruksi Kunjungan Khusus (Contoh: Home Visit Minggu Ke-2 & Pemberian PMT Pemulihan Extra)"
                        value={benSpecialInterventionNote}
                        onChange={(e) => setBenSpecialInterventionNote(e.target.value)}
                        className="w-full border border-rose-300 rounded-xl p-2 text-xs font-bold bg-white text-rose-900 focus:outline-none"
                      />
                    )}
                  </div>
                </div>

                {/* Stakeholders Kolaborasi Checkboxes */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">
                    STAKEHOLDER LAIN YANG HADIR TERHUBUNG:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {STAKEHOLDER_OPTIONS.map((stk) => {
                      const isChecked = benStakeholdersHadir.includes(stk);
                      return (
                        <button
                          key={stk}
                          type="button"
                          onClick={() => {
                            if (isChecked) {
                              setBenStakeholdersHadir(benStakeholdersHadir.filter(s => s !== stk));
                            } else {
                              setBenStakeholdersHadir([...benStakeholdersHadir, stk]);
                            }
                          }}
                          className={`p-2 rounded-xl border text-[10px] font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                            isChecked
                              ? "bg-indigo-50 border-indigo-300 text-indigo-900 shadow-2xs"
                              : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          <span className="truncate">{stk}</span>
                          {isChecked && <CheckSquare className="h-3.5 w-3.5 text-indigo-600 shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Location Hierarchy */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
                <span className="text-[10px] font-black uppercase text-indigo-700 block">
                  📍 LOKASI POSYANDU & DESA PENERIMA
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <LocationSelectorField
                    label="KELURAHAN / DESA"
                    value={benKelurahan}
                    onChange={setBenKelurahan}
                    options={villageOptions}
                    placeholder="Nama Desa..."
                    isDark={false}
                    onSaveOption={handleSaveCustomKelurahan}
                  />
                  <LocationSelectorField
                    label="POSYANDU"
                    value={benPosyandu}
                    onChange={setBenPosyandu}
                    options={posyanduOptions}
                    placeholder="Nama Posyandu..."
                    isDark={false}
                    onSaveOption={handleSaveCustomPosyandu}
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
                    onSaveOption={handleSaveCustomDusun}
                  />
                  <LocationSelectorField
                    label="PUSKESMAS"
                    value={benPuskesmas}
                    onChange={setBenPuskesmas}
                    options={puskesmasOptions}
                    placeholder="Puskesmas..."
                    isDark={false}
                    onSaveOption={handleSaveCustomPuskesmas}
                  />
                </div>
              </div>

              {/* Category & Weight Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">KATEGORI *</label>
                  <select
                    value={benCategory}
                    onChange={(e) => setBenCategory(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl p-2 font-bold bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="Balita">Balita</option>
                    <option value="Ibu Hamil">Ibu Hamil</option>
                    <option value="Ibu Menyusui">Ibu Menyusui</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">BB AWAL REGISTRASI (KG)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Contoh: 14.3 (atau 14,3)"
                    value={benInitialWeight}
                    onChange={(e) => setBenInitialWeight(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-xs"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5 font-normal">Hanya acuan awal MBG (tidak masuk riwayat bulanan).</span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">TB AWAL REGISTRASI (CM)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Contoh: 95.2 (atau 95,2)"
                    value={benInitialHeight}
                    onChange={(e) => setBenInitialHeight(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-xs"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5 font-normal">Hanya acuan awal MBG (tidak masuk riwayat bulanan).</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">CATATAN KHUSUS / HASIL KUNJUNGAN</label>
                <input
                  type="text"
                  placeholder="Contoh: Perlu Kunjungan Rumah rutin oleh Kader Posyandu"
                  value={benNotes}
                  onChange={(e) => setBenNotes(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                />
              </div>

              {/* Action buttons inside Modal */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {editingBenId ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Yakin menghapus data ${benName}?`)) {
                        onDeleteBeneficiary(editingBenId);
                        setShowAddBenModal(false);
                      }
                    }}
                    className="px-3.5 py-2 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-black flex items-center space-x-1 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Hapus Penerima Ini</span>
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddBenModal(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black cursor-pointer shadow-md flex items-center space-x-1"
                  >
                    <span>{editingBenId ? "💾 Update Profil Data Master" : "💾 Simpan Profil Master Awal"}</span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* AI REPORT & ANALYTIC DATA PIVOT MODAL */}
      <AnalyticDataPivotModal
        isOpen={showAIReportModal}
        onClose={() => setShowAIReportModal(false)}
        beneficiaries={beneficiaries}
        selectedKelurahan={selectedKelurahan}
        collaborationMetrics={collaborationMetrics}
      />

      {/* MODAL DETAIL DATA PENERIMA MANFAAT */}
      {selectedDetailBen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 sticky top-0 bg-white z-10">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 shrink-0">
                  <UserCheck className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                      DETAIL PENERIMA MANFAAT
                    </span>
                    <span className="text-xs font-bold text-slate-400">• Orbit Gizi System</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    {selectedDetailBen.name}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedDetailBen(null)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                title="Tutup Modal Detail"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* Main Info Badges */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                🏷️ Kategori: {selectedDetailBen.category}
              </span>
              {selectedDetailBen.gender && (
                <span className={`px-2.5 py-1 rounded-lg text-xs font-black border ${
                  selectedDetailBen.gender === "Laki-laki" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-pink-50 text-pink-700 border-pink-200"
                }`}>
                  {selectedDetailBen.gender === "Laki-laki" ? "👦 Laki-laki" : "👧 Perempuan"}
                </span>
              )}
              {selectedDetailBen.age && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-slate-200/70 text-slate-700 border border-slate-300">
                  🎂 Usia: {selectedDetailBen.age}
                </span>
              )}
              <span className={`px-2.5 py-1 rounded-lg text-xs font-black border ${
                selectedDetailBen.isReceivedMBG !== false ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-slate-100 text-slate-600 border-slate-200"
              }`}>
                🍱 MBG: {selectedDetailBen.isReceivedMBG !== false ? "Ya, Penerima MBG" : "Tidak"}
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-black border ${
                selectedDetailBen.isReceivedPMT !== false ? "bg-purple-100 text-purple-800 border-purple-300" : "bg-slate-100 text-slate-600 border-slate-200"
              }`}>
                🍼 PMT: {selectedDetailBen.isReceivedPMT !== false ? "Ya, Mendapatkan PMT" : "Tidak"}
              </span>
            </div>

            {/* Home Visit Alert Banner if "Tidak Mengunjungi" */}
            {selectedDetailBen.attendanceStatus === "Tidak Mengunjungi" && (
              <div className="bg-rose-100 border-2 border-rose-300 rounded-2xl p-4 text-rose-900 space-y-1">
                <div className="flex items-center space-x-2 font-black text-xs text-rose-800">
                  <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 animate-bounce" />
                  <span className="uppercase tracking-wider">🚨 DIWAJIBKAN KUNJUNGAN RUMAH (HOME VISIT ALERT)</span>
                </div>
                <p className="text-xs font-bold text-rose-800 pl-7">
                  Penerima ini tercatat 1 kali tidak mengunjungi Posyandu/Puskesmas. Petugas Desa, Kader Posyandu, dan Tenaga Kesehatan Desa wajib melakukan kunjungan rumah untuk pemantauan gizi dan pengukuran rutin.
                </p>
              </div>
            )}

            {/* Grid Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Card 1: Data Identitas & Orang Tua */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2 text-xs shadow-xs">
                <h4 className="font-black uppercase text-[10px] text-slate-400 tracking-wider flex items-center space-x-1">
                  <FileText className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Identitas & Orang Tua / Wali</span>
                </h4>
                <div className="space-y-1.5 font-medium">
                  <p className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">NIK:</span>
                    <span className="font-mono font-black text-slate-800">{selectedDetailBen.nik || "-"}</span>
                  </p>
                  <p className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">Nama Ortu/Wali:</span>
                    <span className="font-black text-slate-800">{selectedDetailBen.parentName || "-"}</span>
                  </p>
                  <p className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">Tanggal Lahir:</span>
                    <span className="font-bold text-slate-800">{selectedDetailBen.birthDate || "-"}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500">Status Kunjungan:</span>
                    <span className={`font-black ${
                      selectedDetailBen.attendanceStatus === "Tidak Mengunjungi" ? "text-rose-600 font-extrabold" : "text-emerald-700 font-extrabold"
                    }`}>
                      {selectedDetailBen.attendanceStatus || "Mengunjungi Posyandu"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Card 2: Lokasi & Posyandu */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2 text-xs shadow-xs">
                <h4 className="font-black uppercase text-[10px] text-slate-400 tracking-wider flex items-center space-x-1">
                  <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Lokasi Posyandu & Wilayah</span>
                </h4>
                <div className="space-y-1.5 font-medium">
                  <p className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">Posyandu:</span>
                    <span className="font-black text-indigo-700">{selectedDetailBen.location.posyandu || "-"}</span>
                  </p>
                  <p className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">Dusun:</span>
                    <span className="font-bold text-slate-800">{selectedDetailBen.location.dusun || "-"}</span>
                  </p>
                  <p className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">Kelurahan/Desa:</span>
                    <span className="font-bold text-slate-800">{selectedDetailBen.location.kelurahan}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500">Puskesmas:</span>
                    <span className="font-bold text-slate-800">{selectedDetailBen.location.puskesmas || "-"}</span>
                  </p>
                </div>
              </div>

            </div>

            {/* JADWAL POSYANDU & USIA BATAS PEMANTAUAN */}
            <div className="bg-emerald-50/80 border-2 border-emerald-300 rounded-2xl p-4 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-emerald-700 shrink-0" />
                  <span className="font-black text-xs uppercase text-emerald-950 tracking-wider">
                    Jadwal Kunjungan Posyandu & Usia Batas Pemantauan
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-600 text-white font-black text-[9px] rounded-md uppercase">
                  {selectedDetailBen.category}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-500 block">Jadwal Kunjungan Posyandu Rutin:</span>
                  <span className="font-black text-emerald-900 flex items-center space-x-1">
                    <span>🗓️</span>
                    <span>{selectedDetailBen.posyanduSchedule || "Setiap Tanggal 15 Bulanan"}</span>
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-emerald-200 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-500 block">Perlu Kunjungan Posyandu S/D Usia:</span>
                  <span className="font-black text-indigo-950 flex items-center space-x-1">
                    <span>👶</span>
                    <span>{selectedDetailBen.posyanduAgeLimit || (selectedDetailBen.category === "Balita" ? "Hingga Usia 5 Tahun (60 Bulan)" : "Hingga Masa Menyusui 2 Tahun")}</span>
                  </span>
                </div>
              </div>

              {(selectedDetailBen.isSpecialInterventionNeeded || selectedDetailBen.weightRecords?.some(r => r.statusGizi === "Stunting" || r.statusGizi === "Risiko Stunting")) && (
                <div className="bg-rose-50 border border-rose-300 rounded-xl p-2.5 text-xs text-rose-900 flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-black uppercase text-[10px] text-rose-800 block">
                      🚨 STATUS KUNJUNGAN KHUSUS INTERVENSI STUNTING:
                    </span>
                    <p className="font-bold text-rose-950">
                      {selectedDetailBen.specialInterventionNote || "Diatur Petugas: Kunjungan Rumah Khusus Pemantauan Gizi Ketat & Edukasi PMT Tambahan."}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* IDENTITAS NAMA & DATA DIRI PETUGAS PENDAMPING */}
            <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-4 w-4 text-indigo-700" />
                  <span className="font-black text-xs uppercase text-indigo-950 tracking-wider">
                    Identitas & Data Diri Petugas Pendamping yang Mengunjungi
                  </span>
                </div>
                <span className="text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">Terdaftar Official</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-indigo-100 flex items-start space-x-2">
                  <span className="text-lg">🏛️</span>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black uppercase text-indigo-600 block">Petugas Dinkes / Dinas Kesehatan:</span>
                    <p className="font-extrabold text-slate-900">{selectedDetailBen.officerDinkesName || "Drs. Ahmad Dahlan, M.Kes (Dinkes Ende)"}</p>
                    <span className="text-[9px] text-slate-500 font-semibold block">Kunjungan Bulanan: {selectedDetailBen.isPetugasDinkesHadir !== false ? "✅ Hadir Melakukan Monitoring" : "❌ Belum Ada Jadwal"}</span>
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-indigo-100 flex items-start space-x-2">
                  <span className="text-lg">🥗</span>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black uppercase text-teal-600 block">Ahli Gizi Puskesmas / Desa:</span>
                    <p className="font-extrabold text-slate-900">{selectedDetailBen.officerAhliGiziName || "Siti Rahma, S.Gz (Nutrisionis Puskesmas)"}</p>
                    <span className="text-[9px] text-slate-500 font-semibold block">Konsultasi Gizi: {selectedDetailBen.isAhliGiziHadir !== false ? "✅ Hadir Pendampingan" : "❌ Belum Ada Jadwal"}</span>
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-indigo-100 flex items-start space-x-2">
                  <span className="text-lg">🩺</span>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black uppercase text-emerald-600 block">Dokter Anak / Tim Pakar:</span>
                    <p className="font-extrabold text-slate-900">{selectedDetailBen.officerDokterAnakName || "dr. H. Prasetyo, Sp.A (RSUD / Tim Pakar)"}</p>
                    <span className="text-[9px] text-slate-500 font-semibold block">Pemeriksaan Spesialis: {selectedDetailBen.isDokterAnakHadir ? "✅ Hadir Memeriksa" : "⚪ Rujukan Sesuai Kebutuhan"}</span>
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-indigo-100 flex items-start space-x-2">
                  <span className="text-lg">👩‍⚕️</span>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black uppercase text-purple-600 block">Kader Posyandu Pendamping:</span>
                    <p className="font-extrabold text-slate-900">{selectedDetailBen.officerKaderName || "Ibu Maria & Ibu Yuliana (Kader Posyandu)"}</p>
                    <span className="text-[9px] text-slate-500 font-semibold block">Pemantauan Posyandu: {selectedDetailBen.isPetugasPosyanduHadir !== false ? "✅ Hadir Pendampingan" : "❌ Belum Ada Jadwal"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Kehadiran Stakeholder Pendamping & Tim Kesehatan Badges */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2.5 text-xs">
              <h4 className="font-black uppercase text-[10px] text-slate-500 tracking-wider flex items-center space-x-1">
                <Users className="h-3.5 w-3.5 text-indigo-600" />
                <span>Ringkasan Kehadiran Stakeholder Lintas Sektor</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center space-x-1 ${
                  selectedDetailBen.isPetugasDinkesHadir !== false ? "bg-indigo-50 text-indigo-800 border-indigo-200" : "bg-rose-50 text-rose-800 border-rose-200"
                }`}>
                  <span>🏛️</span>
                  <span>{selectedDetailBen.isPetugasDinkesHadir !== false ? "Petugas Dinkes (Hadir 1x/Bulan)" : "Dinkes Belum Kunjungan"}</span>
                </span>

                <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center space-x-1 ${
                  selectedDetailBen.isAhliGiziHadir !== false ? "bg-teal-50 text-teal-800 border-teal-200" : "bg-slate-100 text-slate-600 border-slate-200"
                }`}>
                  <span>🥗</span>
                  <span>{selectedDetailBen.isAhliGiziHadir !== false ? "Ahli Gizi (Hadir Konsultasi)" : "Belum Konsultasi Ahli Gizi"}</span>
                </span>

                <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center space-x-1 ${
                  selectedDetailBen.isDokterAnakHadir ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"
                }`}>
                  <span>🩺</span>
                  <span>{selectedDetailBen.isDokterAnakHadir ? "Dokter Anak (Hadir Memeriksa)" : "Dokter Anak: Belum Rujukan"}</span>
                </span>

                <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                  selectedDetailBen.isPetugasDesaHadir !== false ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-rose-50 text-rose-800 border-rose-200"
                }`}>
                  {selectedDetailBen.isPetugasDesaHadir !== false ? "✅ Petugas Desa Hadir" : "❌ Petugas Desa Tidak Hadir"}
                </span>

                <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                  selectedDetailBen.isPetugasPosyanduHadir !== false ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-rose-50 text-rose-800 border-rose-200"
                }`}>
                  {selectedDetailBen.isPetugasPosyanduHadir !== false ? "✅ Kader Posyandu Hadir" : "❌ Kader Posyandu Tidak Hadir"}
                </span>

                {selectedDetailBen.stakeholdersHadir && selectedDetailBen.stakeholdersHadir.length > 0 && (
                  selectedDetailBen.stakeholdersHadir.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-50/70 text-indigo-800 border border-indigo-100">
                      🤝 {s}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* GRAFIK KUNJUNGAN STAKEHOLDER (BAR CHART RECHARTS) */}
            <div className="bg-slate-50/90 rounded-2xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-indigo-600" />
                  <div>
                    <h4 className="font-black uppercase text-[11px] text-slate-800 tracking-wider">
                      Grafik Kunjungan Stakeholder & Kehadiran Petugas
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium">Persentase tingkat kehadiran tim pendamping untuk anak/sasaran ini</p>
                  </div>
                </div>
              </div>

              <div className="h-44 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: "Petugas Dinkes", status: selectedDetailBen.isPetugasDinkesHadir !== false ? 100 : 20 },
                      { name: "Ahli Gizi", status: selectedDetailBen.isAhliGiziHadir !== false ? 100 : 20 },
                      { name: "Dokter Anak", status: selectedDetailBen.isDokterAnakHadir ? 100 : 30 },
                      { name: "Petugas Pemdes", status: selectedDetailBen.isPetugasDesaHadir !== false ? 100 : 20 },
                      { name: "Kader Posyandu", status: selectedDetailBen.isPetugasPosyanduHadir !== false ? 100 : 20 },
                      { name: "Mitra/BGN", status: (selectedDetailBen.stakeholdersHadir && selectedDetailBen.stakeholdersHadir.length > 0) ? 90 : 25 }
                    ]}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#475569', fontWeight: 700 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#64748b' }} unit="%" />
                    <Tooltip 
                      formatter={(val: any) => [`${val}% Kehadiran`, 'Tingkat Kehadiran']}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }} 
                    />
                    <Bar dataKey="status" radius={[6, 6, 0, 0]}>
                      <Cell fill="#4f46e5" />
                      <Cell fill="#0d9488" />
                      <Cell fill="#10b981" />
                      <Cell fill="#059669" />
                      <Cell fill="#8b5cf6" />
                      <Cell fill="#f59e0b" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* GRAFIK PERTUMBUHAN BB & TB (RECHARTS) */}
            <div className="bg-slate-50/90 rounded-2xl border border-slate-200 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-black uppercase text-[11px] text-slate-800 tracking-wider">
                      Grafik Pertumbuhan BB & TB (Perkembangan Rutin)
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium">Visualisasi perkembangan berat (kg) & tinggi (cm) dari waktu ke waktu</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-[10px] font-extrabold">
                  <span className="flex items-center space-x-1 text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-200">
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 inline-block"></span>
                    <span>Berat Badan (kg)</span>
                  </span>
                  <span className="flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block"></span>
                    <span>Tinggi Badan (cm)</span>
                  </span>
                </div>
              </div>

              {/* Chart Component */}
              <div className="h-52 w-full pt-1">
                {selectedDetailBen.weightRecords && selectedDetailBen.weightRecords.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={selectedDetailBen.weightRecords.map(r => ({
                        period: r.period,
                        weightKg: r.weightKg,
                        heightCm: r.heightCm || null,
                        statusGizi: r.statusGizi || "Normal"
                      }))} 
                      margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#4f46e5', fontWeight: 700 }} domain={['auto', 'auto']} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#10b981', fontWeight: 700 }} domain={['auto', 'auto']} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#cbd5e1', fontSize: '11px', fontWeight: 'bold', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                      />
                      <Line yAxisId="left" type="monotone" dataKey="weightKg" name="Berat (kg)" stroke="#4f46e5" strokeWidth={3} dot={{ r: 5, fill: "#4f46e5", strokeWidth: 2, stroke: "#ffffff" }} />
                      <Line yAxisId="right" type="monotone" dataKey="heightCm" name="Tinggi (cm)" stroke="#10b981" strokeWidth={3} dot={{ r: 5, fill: "#10b981", strokeWidth: 2, stroke: "#ffffff" }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 font-bold text-xs">
                    Belum ada grafik perkembangan rutin. Silakan catat penimbangan bulanan.
                  </div>
                )}
              </div>

              {/* Summary Deltas */}
              {selectedDetailBen.weightRecords && selectedDetailBen.weightRecords.length > 0 && (() => {
                const recs = selectedDetailBen.weightRecords;
                const first = recs[0];
                const latest = recs[recs.length - 1];
                const weightDelta = latest.weightKg - first.weightKg;
                const heightDelta = (latest.heightCm && first.heightCm) ? (latest.heightCm - first.heightCm) : null;

                return (
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-center text-xs">
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Progres Berat (BB)</span>
                      <span className="font-black text-indigo-700">
                        {first.weightKg} kg ➔ {latest.weightKg} kg
                      </span>
                      <span className={`text-[10px] font-bold block ${weightDelta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        ({weightDelta >= 0 ? `+${weightDelta.toFixed(1)}` : weightDelta.toFixed(1)} kg)
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Progres Tinggi (TB)</span>
                      <span className="font-black text-emerald-700">
                        {first.heightCm ? `${first.heightCm} cm` : "-"} ➔ {latest.heightCm ? `${latest.heightCm} cm` : "-"}
                      </span>
                      {heightDelta !== null && (
                        <span className={`text-[10px] font-bold block ${heightDelta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          ({heightDelta >= 0 ? `+${heightDelta.toFixed(1)}` : heightDelta.toFixed(1)} cm)
                        </span>
                      )}
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Status Gizi Terbaru</span>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black mt-0.5 ${
                        latest.statusGizi === "Normal" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {latest.statusGizi || "Normal"}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Histori Pengukuran BB & TB Table */}
            <div className="space-y-2">
              <h4 className="font-black uppercase text-[10px] text-slate-500 tracking-wider flex items-center space-x-1">
                <Scale className="h-3.5 w-3.5 text-indigo-600" />
                <span>Histori Penimbangan BB & TB (Kegiatan Rutin)</span>
              </h4>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500">
                    <tr>
                      <th className="p-2.5">Periode</th>
                      <th className="p-2.5">Berat (kg)</th>
                      <th className="p-2.5">Tinggi (cm)</th>
                      <th className="p-2.5">Status Gizi</th>
                      <th className="p-2.5">Tanggal Ukur</th>
                      <th className="p-2.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {selectedDetailBen.weightRecords.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-slate-400 font-bold">
                          Belum ada riwayat penimbangan.
                        </td>
                      </tr>
                    ) : (
                      selectedDetailBen.weightRecords.map((rec, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-800">{rec.period}</td>
                          <td className="p-2.5 font-black text-slate-900">{rec.weightKg} kg</td>
                          <td className="p-2.5 text-slate-600">{rec.heightCm ? `${rec.heightCm} cm` : "-"}</td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              rec.statusGizi === "Normal" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                              rec.statusGizi === "Stunting" ? "bg-rose-50 text-rose-700 border-rose-200" :
                              "bg-amber-50 text-amber-700 border-amber-200"
                            }`}>
                              {rec.statusGizi || "Normal"}
                            </span>
                          </td>
                          <td className="p-2.5 text-[10px] text-slate-500">{rec.measuredAt || "-"}</td>
                          <td className="p-2.5 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                onClick={() => handleOpenEditWeightModal(selectedDetailBen, rec)}
                                className="p-1 hover:bg-amber-100 text-amber-700 rounded transition-colors cursor-pointer"
                                title="Edit Timbang Periode Ini"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenDeleteWeightModal(selectedDetailBen, rec)}
                                className="p-1 hover:bg-rose-100 text-rose-700 rounded transition-colors cursor-pointer"
                                title="Hapus Timbang Periode Ini"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Catatan Khusus */}
            {selectedDetailBen.notes && (
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 text-xs space-y-0.5 text-amber-900">
                <p className="font-bold text-[10px] uppercase text-amber-800">📌 Catatan Khusus Petugas:</p>
                <p className="font-medium text-amber-900">{selectedDetailBen.notes}</p>
              </div>
            )}

            {/* Footer Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
              
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* Edit Data Button */}
                <button
                  type="button"
                  onClick={() => {
                    const ben = selectedDetailBen;
                    setSelectedDetailBen(null);
                    handleOpenEditBenModal(ben);
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-md transition-all"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Data Penerima</span>
                </button>

                {/* Catat BB Bulanan Button */}
                <button
                  type="button"
                  onClick={() => {
                    const ben = selectedDetailBen;
                    setSelectedBenId(ben.id);
                    setSelectedDetailBen(null);
                    setActiveSubTab("weight_records");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-md transition-all"
                >
                  <Scale className="h-4 w-4" />
                  <span>Catat BB Bulanan</span>
                </button>
              </div>

              {/* Tutup / Kembali Button */}
              <button
                type="button"
                onClick={() => setSelectedDetailBen(null)}
                className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 hover:bg-slate-100 font-bold text-xs text-slate-700 rounded-xl cursor-pointer"
              >
                Tutup / Kembali
              </button>

            </div>

          </div>
        </div>
      )}

      {/* 1. MODAL DEDIKASI KELOLA & EDIT RIWAYAT CATAT TIMBANG */}
      {editingWeightBen && (() => {
        const activeBen = beneficiaries.find(b => b.id === editingWeightBen.id) || editingWeightBen;
        const allWeightRecords = activeBen.weightRecords || [];

        return (
          <div className="fixed inset-0 z-[120] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 shadow-2xl relative text-slate-900 my-auto">
              
              {/* Header */}
              <div className="p-5 bg-slate-900 text-white flex items-start justify-between border-b border-slate-800 shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30 shrink-0">
                    <Scale className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white leading-tight">
                      Kelola Riwayat Hasil Timbang Penerima
                    </h3>
                    <p className="text-xs font-bold text-amber-400">
                      {activeBen.name} ({allWeightRecords.length} Periode Tercatat)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingWeightBen(null)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors cursor-pointer"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-5 text-xs">
                {/* Beneficiary & MBG Info Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                      {activeBen.name}
                    </span>
                    {activeBen.isReceivedMBG ? (
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center space-x-1">
                        <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                        <span>PENERIMA MBG</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full text-[10px] font-bold">
                        NON-MBG
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 font-medium">
                    <div><span className="text-slate-400 font-bold">NIK:</span> {activeBen.nik || '-'}</div>
                    <div><span className="text-slate-400 font-bold">Kategori:</span> {activeBen.category}</div>
                    <div><span className="text-slate-400 font-bold">Posyandu:</span> {activeBen.location.posyandu || activeBen.location.kelurahan}</div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[10px] text-amber-900 font-bold flex items-center space-x-1.5">
                    <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>Transparansi MBG: Mengedit atau menghapus data timbang periode tertentu HANYA memperbarui catatan timbang periode tersebut. Profil anak tetap utuh.</span>
                  </div>
                </div>

                {/* Section 1: All Recorded Periods List */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center space-x-1.5">
                      <Calendar className="h-4 w-4 text-amber-600" />
                      <span>Semua Data Timbang Tercatat ({allWeightRecords.length})</span>
                    </h4>
                    <button
                      type="button"
                      onClick={handlePrepareAddNewPeriod}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-[10px] rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
                    >
                      <span>+ Tambah Periode Baru</span>
                    </button>
                  </div>

                  {allWeightRecords.length === 0 ? (
                    <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 font-bold">
                      Belum ada riwayat timbang tercatat untuk anak ini. Gunakan form di bawah untuk menambah data.
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                      <div className="max-h-48 overflow-y-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead className="bg-slate-100 text-slate-500 font-bold uppercase text-[9px] tracking-wider sticky top-0 z-10 border-b border-slate-200">
                            <tr>
                              <th className="p-2.5">Periode</th>
                              <th className="p-2.5">Berat (kg)</th>
                              <th className="p-2.5">Tinggi (cm)</th>
                              <th className="p-2.5">Status Gizi</th>
                              <th className="p-2.5">Tanggal</th>
                              <th className="p-2.5 text-center">Aksi Pilih</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white font-medium">
                            {allWeightRecords.map((rec, idx) => {
                              const isCurrentlySelected = origWeightPeriod === rec.period;
                              return (
                                <tr 
                                  key={`${rec.period}-${idx}`} 
                                  className={`transition-colors ${isCurrentlySelected ? "bg-amber-50/80 font-bold border-l-4 border-l-amber-500" : "hover:bg-slate-50"}`}
                                >
                                  <td className="p-2.5 font-bold text-slate-800">
                                    {rec.period}
                                    {isCurrentlySelected && <span className="ml-1 text-[9px] text-amber-700 font-black">(Sedang Diedit)</span>}
                                  </td>
                                  <td className="p-2.5 font-black text-slate-900">{rec.weightKg} kg</td>
                                  <td className="p-2.5 text-slate-600">{rec.heightCm || '-'} cm</td>
                                  <td className="p-2.5">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                      rec.statusGizi === "Normal" 
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                        : "bg-amber-50 text-amber-700 border-amber-200"
                                    }`}>
                                      {rec.statusGizi || "Normal"}
                                    </span>
                                  </td>
                                  <td className="p-2.5 text-slate-500 text-[10px]">{rec.measuredAt || '-'}</td>
                                  <td className="p-2.5 text-center">
                                    <div className="flex items-center justify-center space-x-1">
                                      <button
                                        type="button"
                                        onClick={() => handleSelectRecordToEdit(activeBen, rec)}
                                        className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition-colors ${
                                          isCurrentlySelected 
                                            ? "bg-amber-600 text-white shadow-xs" 
                                            : "bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200"
                                        }`}
                                        title="Pilih & Edit Periode Ini"
                                      >
                                        <Edit3 className="h-3 w-3" />
                                        <span>Edit</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenDeleteWeightModal(activeBen, rec)}
                                        className="p-1 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                                        title="Hapus Hanya Periode Ini"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 2: Edit Form for Selected Period */}
                <form onSubmit={handleSaveEditedWeightRecord} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                      {origWeightPeriod ? (
                        <span className="text-amber-800">Edit Data Periode: <strong className="underline">{origWeightPeriod}</strong></span>
                      ) : (
                        <span className="text-emerald-700">+ Form Tambah Periode Timbang Baru</span>
                      )}
                    </h4>
                    {origWeightPeriod && (
                      <button
                        type="button"
                        onClick={handlePrepareAddNewPeriod}
                        className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                      >
                        Beralih ke Form Tambah Baru
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-600 uppercase block mb-1">
                      PERIODE PENIMBANGAN *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Maret 2026, TW1 2026..."
                      value={editWeightPeriod}
                      onChange={(e) => setEditWeightPeriod(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black text-slate-600 uppercase block mb-1">
                        BERAT BADAN (KG) *
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        required
                        placeholder="Contoh: 14.5"
                        value={editWeightKg}
                        onChange={(e) => setEditWeightKg(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-600 uppercase block mb-1">
                        TINGGI BADAN (CM)
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="Contoh: 95.0"
                        value={editHeightCm}
                        onChange={(e) => setEditHeightCm(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-black text-slate-600 uppercase block">
                          STATUS GIZI
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const w = parseDecimal(editWeightKg, 0);
                            const h = parseOptionalDecimal(editHeightCm);
                            setEditStatusGizi(calculateStatusGizi(w, h));
                          }}
                          className="text-[9px] font-black text-amber-700 hover:underline cursor-pointer"
                        >
                          Hitung Otomatis
                        </button>
                      </div>
                      <select
                        value={editStatusGizi}
                        onChange={(e) => setEditStatusGizi(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
                      >
                        <option value="Normal">Normal</option>
                        <option value="Stunting">Stunting</option>
                        <option value="Risiko Stunting">Risiko Stunting</option>
                        <option value="Gizi Kurang">Gizi Kurang</option>
                        <option value="Gizi Buruk / Wasting">Gizi Buruk / Wasting</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-600 uppercase block mb-1">
                        TANGGAL UKUR
                      </label>
                      <input
                        type="date"
                        value={editMeasuredAt}
                        onChange={(e) => setEditMeasuredAt(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                  </div>

                  {/* Form Action Buttons */}
                  <div className="flex items-center space-x-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setEditingWeightBen(null)}
                      className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Selesai / Tutup
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      {editWeightSuccess ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Berhasil Disimpan!</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Simpan Perubahan Periode Ini</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        );
      })()}

      {/* 2. MODAL DEDIKASI HAPUS CATAT TIMBANG */}
      {deletingWeightItem && (
        <div className="fixed inset-0 z-[120] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden border border-rose-200 shadow-2xl relative p-6 space-y-4 text-slate-900">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-rose-100 text-rose-700 rounded-2xl shrink-0">
                  <Trash2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    Hapus Data Hasil Timbang
                  </h3>
                  <p className="text-xs font-bold text-rose-600">
                    Periode {deletingWeightItem.record.period}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeletingWeightItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Details Card */}
            <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 uppercase">
                  {deletingWeightItem.ben.name}
                </span>
                {deletingWeightItem.ben.isReceivedMBG ? (
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-[10px] font-black uppercase tracking-wider">
                    PENERIMA MBG
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full text-[10px] font-bold">
                    NON-MBG
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-slate-700 bg-white p-3 rounded-xl border border-rose-100 font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Periode Dihapus:</span>
                  <span className="font-black text-rose-700">{deletingWeightItem.record.period}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Hasil Timbang:</span>
                  <span className="font-black text-slate-900">{deletingWeightItem.record.weightKg} kg / {deletingWeightItem.record.heightCm || '-'} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Status Gizi:</span>
                  <span className="font-bold text-slate-800">{deletingWeightItem.record.statusGizi || "Normal"}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed font-bold bg-white p-3 rounded-xl border border-slate-200">
                Apakah Anda yakin ingin menghapus 1 data timbang <strong>periode {deletingWeightItem.record.period}</strong> ini?
              </p>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-[10px] text-emerald-900 font-bold flex items-center space-x-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Jaminan Keamanan MBG: HANYA 1 record timbang periode ini yang terhapus. Profil master MBG & data periode lain TETAP AMAN.</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingWeightItem(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteWeightRecord}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>Ya, Hapus Data Periode Ini</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-[90] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
        <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-7xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden relative text-white">
          {/* Top Modal Header */}
          <div className="px-5 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between sticky top-0 z-40 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    MODE MODAL INTERAKTIF
                  </span>
                  <span className="text-xs font-mono text-slate-400">• Orbit Gizi System</span>
                </div>
                <h3 className="text-base font-black text-white mt-0.5">
                  Pusat Sinkronisasi & Input Data Penerima MBG
                </h3>
              </div>
            </div>

            {onCloseModal && (
              <button
                onClick={onCloseModal}
                className="p-2.5 bg-slate-800 hover:bg-rose-600/20 hover:text-rose-400 text-slate-300 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 text-xs font-bold border border-slate-700"
              >
                <X className="h-4.5 w-4.5" />
                <span className="hidden sm:inline">Tutup</span>
              </button>
            )}
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-6">
            {mainContent}
          </div>
        </div>
      </div>
    );
  }

  return mainContent;
}
