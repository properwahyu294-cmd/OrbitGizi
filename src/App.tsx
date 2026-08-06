import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  AreaChart, 
  Area,
  Legend
} from "recharts";
import { 
  RefreshCw, 
  Database, 
  Settings, 
  Activity, 
  MapPin, 
  Award, 
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
  Search,
  LayoutDashboard,
  Map,
  Brain,
  Handshake,
  Menu,
  X,
  Building2,
  Heart
} from "lucide-react";

// Types
import { OrbitGiziData, Village, Pillar, Indicator, MBGBeneficiary, WeightRecord, UnitType } from "./types";
import {
  getAppData,
  updateWeightsApi,
  addVillageApi,
  deleteVillageApi,
  updateVillageApi,
  resetDataApi,
  clearDataApi,
  isUsingLocalFallback
} from "./lib/dataService";

// Components
import LogoOrbitGizi from "./components/LogoOrbitGizi";
import IndexGauge from "./components/IndexGauge";
import TheoryOfChange from "./components/TheoryOfChange";
import PetaRisiko from "./components/PetaRisiko";
import PilarCard from "./components/PilarCard";
import StakeholderCard from "./components/StakeholderCard";
import RecommendationCard from "./components/RecommendationCard";
import InputWizardModal from "./components/InputWizardModal";
import DataInputCenter from "./components/DataInputCenter";
import { AnalitikGiziView } from "./components/AnalitikGiziView";
import IbuMenyusuiView from "./components/IbuMenyusuiView";
import IbuHamilView from "./components/IbuHamilView";
import BannerCarousel from "./components/BannerCarousel";

const DEFAULT_BENEFICIARIES: MBGBeneficiary[] = [
  {
    id: "ben_ngt_1",
    name: "ADRIAN SA",
    parentName: "MERSIANA ERE",
    nik: "5316013011220001",
    gender: "Laki-laki",
    age: "3 Tahun 2 Bulan",
    birthDate: "2022-11-30",
    category: "Balita",
    location: {
      propinsi: "Nusa Tenggara Timur",
      kabupaten: "Kabupaten Nagekeo",
      puskesmas: "Puskesmas Boawae",
      kelurahan: "Desa Nangateke",
      dusun: "Dusun Nangateke",
      posyandu: "Posyandu Nangateke"
    },
    isReceivedMBG: true,
    isReceivedPMT: true,
    attendanceStatus: "Mengunjungi Posyandu",
    isPetugasDesaHadir: true,
    isPetugasPosyanduHadir: true,
    stakeholdersHadir: ["Petugas Desa", "Kader Posyandu", "Puskesmas Boawae"],
    weightRecords: [
      { period: "Januari 2026", weightKg: 13.5, heightCm: 92, statusGizi: "Normal", measuredAt: "2026-01-15" }
    ],
    notes: "Penerima Manfaat Balita (6-59 Bulan) Posyandu Nangateke"
  },
  {
    id: "ben_ngt_2",
    name: "FEBRIANI OTI",
    parentName: "EMIRENSIANA",
    nik: "5316014102220002",
    gender: "Perempuan",
    age: "4 Tahun",
    birthDate: "2022-02-01",
    category: "Balita",
    location: {
      propinsi: "Nusa Tenggara Timur",
      kabupaten: "Kabupaten Nagekeo",
      puskesmas: "Puskesmas Boawae",
      kelurahan: "Desa Nangateke",
      dusun: "Dusun Nangateke",
      posyandu: "Posyandu Nangateke"
    },
    isReceivedMBG: true,
    isReceivedPMT: true,
    attendanceStatus: "Mengunjungi Posyandu",
    isPetugasDesaHadir: true,
    isPetugasPosyanduHadir: true,
    stakeholdersHadir: ["Petugas Desa", "Kader Posyandu", "Tim PKK"],
    weightRecords: [
      { period: "Januari 2026", weightKg: 14.2, heightCm: 96, statusGizi: "Normal", measuredAt: "2026-01-15" }
    ],
    notes: "Penerima Manfaat Balita (6-59 Bulan) Posyandu Nangateke"
  },
  {
    id: "ben_ngt_3",
    name: "GUBERTA SURIATI",
    parentName: "YOHANES MBOY",
    nik: "5316015207220002",
    gender: "Perempuan",
    age: "3 Tahun 6 Bulan",
    birthDate: "2022-07-15",
    category: "Balita",
    location: {
      propinsi: "Nusa Tenggara Timur",
      kabupaten: "Kabupaten Nagekeo",
      puskesmas: "Puskesmas Boawae",
      kelurahan: "Desa Nangateke",
      dusun: "Dusun Nangateke",
      posyandu: "Posyandu Nangateke"
    },
    isReceivedMBG: true,
    isReceivedPMT: false,
    attendanceStatus: "Tidak Mengunjungi",
    isPetugasDesaHadir: false,
    isPetugasPosyanduHadir: true,
    stakeholdersHadir: ["Kader Posyandu"],
    weightRecords: [
      { period: "Januari 2026", weightKg: 13.8, heightCm: 94, statusGizi: "Normal", measuredAt: "2026-01-15" }
    ],
    notes: "Telah absen 1 kali penimbangan. Harus Dilakukan Kunjungan Rumah!"
  },
  {
    id: "ben_ngt_4",
    name: "HENDRIKUS P. KAKO",
    parentName: "ARKUSLAUS LENA",
    nik: "5316011005190003",
    gender: "Laki-laki",
    age: "5 Tahun",
    birthDate: "2019-05-10",
    category: "Balita",
    location: {
      propinsi: "Nusa Tenggara Timur",
      kabupaten: "Kabupaten Nagekeo",
      puskesmas: "Puskesmas Boawae",
      kelurahan: "Desa Nangateke",
      dusun: "Dusun Nangateke",
      posyandu: "Posyandu Nangateke"
    },
    isReceivedMBG: true,
    isReceivedPMT: true,
    attendanceStatus: "Mengunjungi Posyandu",
    isPetugasDesaHadir: true,
    isPetugasPosyanduHadir: true,
    stakeholdersHadir: ["Petugas Desa", "Kader Posyandu", "BGN"],
    weightRecords: [
      { period: "Januari 2026", weightKg: 16.5, heightCm: 105, statusGizi: "Normal", measuredAt: "2026-01-15" }
    ],
    notes: "Penerima Manfaat Balita (6-59 Bulan) Posyandu Nangateke"
  },
  {
    id: "ben_ngt_5",
    name: "JEFANYA R. R. KATNESI",
    parentName: "HEFER KATNESI",
    nik: "3173053001220003",
    gender: "Perempuan",
    age: "1 Tahun 2 Bulan",
    birthDate: "2024-11-29",
    category: "Balita",
    location: {
      propinsi: "Nusa Tenggara Timur",
      kabupaten: "Kabupaten Nagekeo",
      puskesmas: "Puskesmas Boawae",
      kelurahan: "Desa Nangateke",
      dusun: "Dusun Nangateke",
      posyandu: "Posyandu Nangateke"
    },
    isReceivedMBG: true,
    isReceivedPMT: true,
    attendanceStatus: "Mengunjungi Puskesmas",
    isPetugasDesaHadir: true,
    isPetugasPosyanduHadir: true,
    stakeholdersHadir: ["Puskesmas Boawae", "Petugas Desa"],
    weightRecords: [
      { period: "Januari 2026", weightKg: 9.8, heightCm: 76, statusGizi: "Normal", measuredAt: "2026-01-15" }
    ],
    notes: "Rujukan pemeriksaan gizi rutin ke Puskesmas Boawae"
  },
  {
    id: "ben_ngt_6",
    name: "JONATHAN E. N. HERE",
    parentName: "DANIEL N. HERE",
    nik: "5316011312230002",
    gender: "Laki-laki",
    age: "2 Tahun 1 Bulan",
    birthDate: "2023-12-13",
    category: "Balita",
    location: {
      propinsi: "Nusa Tenggara Timur",
      kabupaten: "Kabupaten Nagekeo",
      puskesmas: "Puskesmas Boawae",
      kelurahan: "Desa Nangateke",
      dusun: "Dusun Nangateke",
      posyandu: "Posyandu Nangateke"
    },
    isReceivedMBG: true,
    isReceivedPMT: true,
    attendanceStatus: "Mengunjungi Posyandu",
    isPetugasDesaHadir: true,
    isPetugasPosyanduHadir: true,
    stakeholdersHadir: ["Kader Posyandu", "Petugas Desa"],
    weightRecords: [
      { period: "Januari 2026", weightKg: 11.5, heightCm: 85, statusGizi: "Normal", measuredAt: "2026-01-15" }
    ],
    notes: "Penerima Manfaat Balita (6-59 Bulan) Posyandu Nangateke"
  },
  {
    id: "ben_ngt_7",
    name: "JUNIOR B. NARO",
    parentName: "DARIUS MAHUR",
    nik: "5316010506200001",
    gender: "Laki-laki",
    age: "5 Tahun",
    birthDate: "2020-06-05",
    category: "Balita",
    location: {
      propinsi: "Nusa Tenggara Timur",
      kabupaten: "Kabupaten Nagekeo",
      puskesmas: "Puskesmas Boawae",
      kelurahan: "Desa Nangateke",
      dusun: "Dusun Nangateke",
      posyandu: "Posyandu Nangateke"
    },
    isReceivedMBG: true,
    isReceivedPMT: true,
    attendanceStatus: "Mengunjungi Posyandu",
    isPetugasDesaHadir: true,
    isPetugasPosyanduHadir: true,
    stakeholdersHadir: ["Kader Posyandu", "Tim PKK"],
    weightRecords: [
      { period: "Januari 2026", weightKg: 17.0, heightCm: 106, statusGizi: "Normal", measuredAt: "2026-01-15" }
    ],
    notes: "Penerima Manfaat Balita (6-59 Bulan) Posyandu Nangateke"
  },
  {
    id: "ben_ngt_8",
    name: "MARIA A. SERA",
    parentName: "RIDWAN KADHA",
    nik: "5316014112240001",
    gender: "Perempuan",
    age: "1 Tahun 2 Bulan",
    birthDate: "2024-12-01",
    category: "Balita",
    location: {
      propinsi: "Nusa Tenggara Timur",
      kabupaten: "Kabupaten Nagekeo",
      puskesmas: "Puskesmas Boawae",
      kelurahan: "Desa Nangateke",
      dusun: "Dusun Nangateke",
      posyandu: "Posyandu Nangateke"
    },
    isReceivedMBG: true,
    isReceivedPMT: false,
    attendanceStatus: "Tidak Mengunjungi",
    isPetugasDesaHadir: false,
    isPetugasPosyanduHadir: true,
    stakeholdersHadir: ["Kader Posyandu"],
    weightRecords: [
      { period: "Januari 2026", weightKg: 9.5, heightCm: 75, statusGizi: "Normal", measuredAt: "2026-01-15" }
    ],
    notes: "Tidak mengunjungi posyandu bulan ini. Perlu Kunjungan Rumah segera oleh Kader!"
  },
  {
    id: "ben_ngt_9",
    name: "MARSELA W. NENU",
    parentName: "WOLWARDUS DHESA",
    nik: "5316014203250001",
    gender: "Perempuan",
    age: "1 Tahun 2 Bulan",
    birthDate: "2025-03-01",
    category: "Balita",
    location: {
      propinsi: "Nusa Tenggara Timur",
      kabupaten: "Kabupaten Nagekeo",
      puskesmas: "Puskesmas Boawae",
      kelurahan: "Desa Nangateke",
      dusun: "Dusun Nangateke",
      posyandu: "Posyandu Nangateke"
    },
    isReceivedMBG: true,
    isReceivedPMT: true,
    attendanceStatus: "Mengunjungi Posyandu",
    isPetugasDesaHadir: true,
    isPetugasPosyanduHadir: true,
    stakeholdersHadir: ["Petugas Desa", "Kader Posyandu"],
    weightRecords: [
      { period: "Januari 2026", weightKg: 9.2, heightCm: 74, statusGizi: "Normal", measuredAt: "2026-01-15" }
    ],
    notes: "Penerima Manfaat Balita (6-59 Bulan) Posyandu Nangateke"
  },
  {
    id: "ben_ngt_10",
    name: "MATIUS R. TULLE",
    parentName: "FRANSISKUS TULLE",
    nik: "5316012805220002",
    gender: "Laki-laki",
    age: "3 Tahun 8 Bulan",
    birthDate: "2022-05-28",
    category: "Balita",
    location: {
      propinsi: "Nusa Tenggara Timur",
      kabupaten: "Kabupaten Nagekeo",
      puskesmas: "Puskesmas Boawae",
      kelurahan: "Desa Nangateke",
      dusun: "Dusun Nangateke",
      posyandu: "Posyandu Nangateke"
    },
    isReceivedMBG: true,
    isReceivedPMT: true,
    attendanceStatus: "Mengunjungi Posyandu",
    isPetugasDesaHadir: true,
    isPetugasPosyanduHadir: true,
    stakeholdersHadir: ["Petugas Desa", "Kader Posyandu", "BGN"],
    weightRecords: [
      { period: "Januari 2026", weightKg: 14.0, heightCm: 95, statusGizi: "Normal", measuredAt: "2026-01-15" }
    ],
    notes: "Penerima Manfaat Balita (6-59 Bulan) Posyandu Nangateke"
  },
  {
    id: "ben_ngt_11",
    name: "MONT MORENCHY MBETE",
    parentName: "MARTINUS MBETE",
    nik: "5316015207220002",
    gender: "Perempuan",
    age: "3 Tahun 8 Bulan",
    birthDate: "2022-05-06",
    category: "Balita",
    location: {
      propinsi: "Nusa Tenggara Timur",
      kabupaten: "Kabupaten Nagekeo",
      puskesmas: "Puskesmas Boawae",
      kelurahan: "Desa Nangateke",
      dusun: "Dusun Nangateke",
      posyandu: "Posyandu Nangateke"
    },
    isReceivedMBG: true,
    isReceivedPMT: true,
    attendanceStatus: "Mengunjungi Posyandu",
    isPetugasDesaHadir: true,
    isPetugasPosyanduHadir: true,
    stakeholdersHadir: ["Kader Posyandu", "Petugas Desa"],
    weightRecords: [
      { period: "Januari 2026", weightKg: 13.9, heightCm: 94.5, statusGizi: "Normal", measuredAt: "2026-01-15" }
    ],
    notes: "Penerima Manfaat Balita (6-59 Bulan) Posyandu Nangateke"
  },
  {
    id: "ben_ngt_12",
    name: "NURIN KAMILAN",
    parentName: "SUDARLIN",
    nik: "5316015802230002",
    gender: "Perempuan",
    age: "2 Tahun 11 Bulan",
    birthDate: "2023-02-18",
    category: "Balita",
    location: {
      propinsi: "Nusa Tenggara Timur",
      kabupaten: "Kabupaten Nagekeo",
      puskesmas: "Puskesmas Boawae",
      kelurahan: "Desa Nangateke",
      dusun: "Dusun Nangateke",
      posyandu: "Posyandu Nangateke"
    },
    isReceivedMBG: true,
    isReceivedPMT: true,
    attendanceStatus: "Mengunjungi Posyandu",
    isPetugasDesaHadir: true,
    isPetugasPosyanduHadir: true,
    stakeholdersHadir: ["Kader Posyandu", "Puskesmas Boawae"],
    weightRecords: [
      { period: "Januari 2026", weightKg: 12.4, heightCm: 88, statusGizi: "Normal", measuredAt: "2026-01-15" }
    ],
    notes: "Penerima Manfaat Balita (6-59 Bulan) Posyandu Nangateke (Kembar)"
  },
  {
    id: "ben_ngt_13",
    name: "NURUN AFIKA",
    parentName: "SUDARLIN",
    nik: "5316015802230003",
    gender: "Perempuan",
    age: "2 Tahun 11 Bulan",
    birthDate: "2023-02-18",
    category: "Balita",
    location: {
      propinsi: "Nusa Tenggara Timur",
      kabupaten: "Kabupaten Nagekeo",
      puskesmas: "Puskesmas Boawae",
      kelurahan: "Desa Nangateke",
      dusun: "Dusun Nangateke",
      posyandu: "Posyandu Nangateke"
    },
    isReceivedMBG: true,
    isReceivedPMT: true,
    attendanceStatus: "Mengunjungi Posyandu",
    isPetugasDesaHadir: true,
    isPetugasPosyanduHadir: true,
    stakeholdersHadir: ["Kader Posyandu", "Puskesmas Boawae"],
    weightRecords: [
      { period: "Januari 2026", weightKg: 12.2, heightCm: 87.5, statusGizi: "Normal", measuredAt: "2026-01-15" }
    ],
    notes: "Penerima Manfaat Balita (6-59 Bulan) Posyandu Nangateke (Kembar)"
  },
  {
    id: "ben_ngt_14",
    name: "OLIVIA AGUSTA FALLO",
    parentName: "YOCEN FALLO",
    nik: "5316015208240002",
    gender: "Perempuan",
    age: "1 Tahun 6 Bulan",
    birthDate: "2024-08-15",
    category: "Balita",
    location: {
      propinsi: "Nusa Tenggara Timur",
      kabupaten: "Kabupaten Nagekeo",
      puskesmas: "Puskesmas Boawae",
      kelurahan: "Desa Nangateke",
      dusun: "Dusun Nangateke",
      posyandu: "Posyandu Nangateke"
    },
    isReceivedMBG: true,
    isReceivedPMT: true,
    attendanceStatus: "Mengunjungi Posyandu",
    isPetugasDesaHadir: true,
    isPetugasPosyanduHadir: true,
    stakeholdersHadir: ["Kader Posyandu", "Petugas Desa"],
    weightRecords: [
      { period: "Januari 2026", weightKg: 10.4, heightCm: 80, statusGizi: "Normal", measuredAt: "2026-01-15" }
    ],
    notes: "Penerima Manfaat Balita (6-59 Bulan) Posyandu Nangateke"
  },
  {
    id: "ben_ngt_15",
    name: "PAULA KRISTIANI NGOLE",
    parentName: "LIBERIUS DOKO",
    nik: "5316016601240001",
    gender: "Perempuan",
    age: "2 Tahun",
    birthDate: "2024-01-26",
    category: "Balita",
    location: {
      propinsi: "Nusa Tenggara Timur",
      kabupaten: "Kabupaten Nagekeo",
      puskesmas: "Puskesmas Boawae",
      kelurahan: "Desa Nangateke",
      dusun: "Dusun Nangateke",
      posyandu: "Posyandu Nangateke"
    },
    isReceivedMBG: true,
    isReceivedPMT: true,
    attendanceStatus: "Mengunjungi Posyandu",
    isPetugasDesaHadir: true,
    isPetugasPosyanduHadir: true,
    stakeholdersHadir: ["Kader Posyandu", "Petugas Desa"],
    weightRecords: [
      { period: "Januari 2026", weightKg: 11.2, heightCm: 84, statusGizi: "Normal", measuredAt: "2026-01-15" }
    ],
    notes: "Penerima Manfaat Balita (6-59 Bulan) Posyandu Nangateke"
  },
  {
    id: "ben_ngt_16",
    name: "SANTUS R. KOTA",
    parentName: "BONEFANSIUS NUSA",
    nik: "5316012003220001",
    gender: "Laki-laki",
    age: "3 Tahun 10 Bulan",
    birthDate: "2022-03-20",
    category: "Balita",
    location: {
      propinsi: "Nusa Tenggara Timur",
      kabupaten: "Kabupaten Nagekeo",
      puskesmas: "Puskesmas Boawae",
      kelurahan: "Desa Nangateke",
      dusun: "Dusun Nangateke",
      posyandu: "Posyandu Nangateke"
    },
    isReceivedMBG: true,
    isReceivedPMT: false,
    attendanceStatus: "Tidak Mengunjungi",
    isPetugasDesaHadir: false,
    isPetugasPosyanduHadir: true,
    stakeholdersHadir: ["Kader Posyandu"],
    weightRecords: [
      { period: "Januari 2026", weightKg: 14.5, heightCm: 97, statusGizi: "Normal", measuredAt: "2026-01-15" }
    ],
    notes: "Absen penimbangan. Wajib Dilakukan Kunjungan Rumah oleh Petugas Posyandu."
  },
  {
    id: "ben_ngt_17",
    name: "VERONIKA PESIVA SUGO",
    parentName: "ABRAHAM LOBI",
    nik: "5307064612210001",
    gender: "Perempuan",
    age: "4 Tahun 1 Bulan",
    birthDate: "2021-12-06",
    category: "Balita",
    location: {
      propinsi: "Nusa Tenggara Timur",
      kabupaten: "Kabupaten Nagekeo",
      puskesmas: "Puskesmas Boawae",
      kelurahan: "Desa Nangateke",
      dusun: "Dusun Nangateke",
      posyandu: "Posyandu Nangateke"
    },
    isReceivedMBG: true,
    isReceivedPMT: true,
    attendanceStatus: "Mengunjungi Posyandu",
    isPetugasDesaHadir: true,
    isPetugasPosyanduHadir: true,
    stakeholdersHadir: ["Kader Posyandu", "Petugas Desa"],
    weightRecords: [
      { period: "Januari 2026", weightKg: 15.0, heightCm: 100, statusGizi: "Normal", measuredAt: "2026-01-15" }
    ],
    notes: "Penerima Manfaat Balita (6-59 Bulan) Posyandu Nangateke"
  },
  {
    id: "ben_ngt_18",
    name: "YOHANES P. KESO",
    parentName: "FIRMILIUS T. PASY",
    nik: "5316011207230001",
    gender: "Laki-laki",
    age: "2 Tahun 7 Bulan",
    birthDate: "2023-07-12",
    category: "Balita",
    location: {
      propinsi: "Nusa Tenggara Timur",
      kabupaten: "Kabupaten Nagekeo",
      puskesmas: "Puskesmas Boawae",
      kelurahan: "Desa Nangateke",
      dusun: "Dusun Nangateke",
      posyandu: "Posyandu Nangateke"
    },
    isReceivedMBG: true,
    isReceivedPMT: true,
    attendanceStatus: "Mengunjungi Posyandu",
    isPetugasDesaHadir: true,
    isPetugasPosyanduHadir: true,
    stakeholdersHadir: ["Kader Posyandu", "Petugas Desa", "Puskesmas Boawae"],
    weightRecords: [
      { period: "Januari 2026", weightKg: 12.8, heightCm: 89, statusGizi: "Normal", measuredAt: "2026-01-15" }
    ],
    notes: "Penerima Manfaat Balita (6-59 Bulan) Posyandu Nangateke"
  }
];

// Firebase & Sheets integration
import { initAuth, googleSignIn, logout } from "./lib/firebase";
import { syncToGoogleSheets } from "./lib/sheetsService";
import { User } from "firebase/auth";
import { FileSpreadsheet, LogOut, CheckCircle, AlertCircle } from "lucide-react";

export default function App() {
  const [data, setData] = useState<OrbitGiziData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [villageSearch, setVillageSearch] = useState<string>("");
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [showInputWizard, setShowInputWizard] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Firebase & Google Sheets integration state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [syncingSheets, setSyncingSheets] = useState<boolean>(false);
  const [sheetsSyncUrl, setSheetsSyncUrl] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);

  // Form states for Weights config
  const [weightP1, setWeightP1] = useState<number>(10);
  const [weightP2, setWeightP2] = useState<number>(30);
  const [weightP3, setWeightP3] = useState<number>(10);
  const [weightP4, setWeightP4] = useState<number>(25);
  const [weightP5, setWeightP5] = useState<number>(25);
  const [weightError, setWeightError] = useState<string | null>(null);

  // Beneficiary Management State
  const [beneficiaries, setBeneficiaries] = useState<MBGBeneficiary[]>(() => {
    const stored = localStorage.getItem("orbit_gizi_local_beneficiaries");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        localStorage.setItem("orbit_gizi_local_beneficiaries", JSON.stringify(DEFAULT_BENEFICIARIES));
        return DEFAULT_BENEFICIARIES;
      }
    }
    localStorage.setItem("orbit_gizi_local_beneficiaries", JSON.stringify(DEFAULT_BENEFICIARIES));
    return DEFAULT_BENEFICIARIES;
  });

  const handleSaveBeneficiary = (ben: MBGBeneficiary) => {
    setBeneficiaries(prev => {
      const exists = prev.some(b => b.id === ben.id);
      let updated: MBGBeneficiary[];
      if (exists) {
        updated = prev.map(b => (b.id === ben.id ? ben : b));
      } else {
        updated = [ben, ...prev];
      }
      localStorage.setItem("orbit_gizi_local_beneficiaries", JSON.stringify(updated));
      return updated;
    });
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDeleteBeneficiary = (id: string) => {
    setBeneficiaries(prev => {
      const updated = prev.filter(b => b.id !== id);
      localStorage.setItem("orbit_gizi_local_beneficiaries", JSON.stringify(updated));
      return updated;
    });
    setRefreshTrigger(prev => prev + 1);
  };

  const handleAddWeightRecord = (beneficiaryId: string, record: WeightRecord) => {
    setBeneficiaries(prev => {
      const updated = prev.map(b => {
        if (b.id === beneficiaryId) {
          const filtered = b.weightRecords.filter(r => r.period !== record.period);
          return {
            ...b,
            weightRecords: [...filtered, record]
          };
        }
        return b;
      });
      localStorage.setItem("orbit_gizi_local_beneficiaries", JSON.stringify(updated));
      return updated;
    });
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDeleteWeightRecord = (beneficiaryId: string, period: string) => {
    setBeneficiaries(prev => {
      const updated = prev.map(b => {
        if (b.id === beneficiaryId) {
          const filtered = b.weightRecords.filter(r => r.period !== period);
          return {
            ...b,
            weightRecords: filtered
          };
        }
        return b;
      });
      localStorage.setItem("orbit_gizi_local_beneficiaries", JSON.stringify(updated));
      return updated;
    });
    setRefreshTrigger(prev => prev + 1);
  };

  const loadData = async () => {
    try {
      const json = await getAppData();
      setData(json);
      setWeightP1(json.weights.pilar1 * 100);
      setWeightP2(json.weights.pilar2 * 100);
      setWeightP3(json.weights.pilar3 * 100);
      setWeightP4(json.weights.pilar4 * 100);
      setWeightP5(json.weights.pilar5 * 100);
      setError(null);
    } catch (e: any) {
      setError(e.message || "Koneksi ke server terputus.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  // Initialize auth state on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setGoogleToken(token);
      },
      () => {
        setCurrentUser(null);
        setGoogleToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Synchronize sheetsSyncUrl state when currentUser changes or logs in/out
  useEffect(() => {
    if (currentUser?.email) {
      const emailSuffix = `_${currentUser.email.toLowerCase().trim()}`;
      const urlKey = `orbit_gizi_spreadsheet_url${emailSuffix}`;
      const savedUrl = localStorage.getItem(urlKey);
      setSheetsSyncUrl(savedUrl || localStorage.getItem("orbit_gizi_spreadsheet_url"));
    } else {
      setSheetsSyncUrl(null);
    }
  }, [currentUser]);

  const handleGoogleLogin = async () => {
    try {
      setSyncError(null);
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setGoogleToken(res.accessToken);
        // After successful login, auto sync to make user experience amazing!
        setTimeout(() => {
          handleSyncSheetsDirect(res.accessToken, res.user);
        }, 800);
      }
    } catch (err: any) {
      setSyncError("Gagal masuk dengan Google: " + err.message);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setGoogleToken(null);
      setSheetsSyncUrl(null);
      localStorage.removeItem("orbit_gizi_spreadsheet_id");
      localStorage.removeItem("orbit_gizi_spreadsheet_url");
    } catch (err: any) {
      setSyncError("Gagal keluar: " + err.message);
    }
  };

  const handleSyncSheetsDirect = async (token: string, userObj?: User | null) => {
    if (!data) return;
    setSyncingSheets(true);
    setSyncError(null);
    setSyncSuccess(false);
    try {
      const activeUser = userObj !== undefined ? userObj : currentUser;
      const result = await syncToGoogleSheets(token, data.kabupatenName, data, activeUser?.email || undefined);
      setSheetsSyncUrl(result.spreadsheetUrl);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 5000);
    } catch (err: any) {
      console.error(err);
      setSyncError("Gagal sinkronisasi data: " + err.message);
    } finally {
      setSyncingSheets(false);
    }
  };

  const handleSyncSheets = async () => {
    if (!googleToken) {
      // Prompt login first
      await handleGoogleLogin();
    } else {
      await handleSyncSheetsDirect(googleToken);
    }
  };

  // Handle indicator scores changes
  const handleIndicatorUpdate = async (pilarId: string, indicatorId: string, newScore: number) => {
    // Indicator score is recalculated automatically on the client side from the village data.
    console.log("Indicator score update triggered locally:", pilarId, indicatorId, newScore);
  };

  // Handle village metrics changes
  const handleVillageUpdate = async (updatedMetrics: Partial<Village>) => {
    try {
      if (!updatedMetrics.id) return;
      const json = await updateVillageApi(updatedMetrics as any);
      setData(json);
      setRefreshTrigger(prev => prev + 1);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  // Handle adding a new village or unit
  const handleVillageAdd = async (name: string, unitType?: UnitType) => {
    try {
      const json = await addVillageApi(name, unitType);
      setData(json);
      setRefreshTrigger(prev => prev + 1);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  // Handle deleting a village
  const handleVillageDelete = async (id: string) => {
    try {
      const json = await deleteVillageApi(id);
      setData(json);
      setRefreshTrigger(prev => prev + 1);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  // Handle resetting database
  const handleResetData = async () => {
    try {
      const json = await resetDataApi();
      setData(json);
      setRefreshTrigger(prev => prev + 1);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  // Handle clearing all database records
  const handleClearData = async () => {
    try {
      const json = await clearDataApi();
      setData(json);
      setRefreshTrigger(prev => prev + 1);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  // Handle saving weights config
  const handleSaveWeights = async () => {
    const sum = weightP1 + weightP2 + weightP3 + weightP4 + weightP5;
    if (sum !== 100) {
      setWeightError(`Total bobot harus bernilai tepat 100%. Sekarang: ${sum}%`);
      return;
    }

    setWeightError(null);
    try {
      const json = await updateWeightsApi({
        pilar1: weightP1 / 100,
        pilar2: weightP2 / 100,
        pilar3: weightP3 / 100,
        pilar4: weightP4 / 100,
        pilar5: weightP5 / 100,
      });

      setData(json);
      setShowConfigModal(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (e: any) {
      setWeightError(e.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="relative h-14 w-14 mb-4">
          <div className="absolute inset-0 rounded-xl border-4 border-slate-200"></div>
          <div className="absolute inset-0 rounded-xl border-4 border-emerald-500 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-sm font-bold text-slate-600 animate-pulse">Memuat Panel Transformasi Orbit Gizi...</p>
        <p className="text-xs text-slate-400 mt-1">Mengsinkronisasikan basis data MBG, PMT, Posyandu & e-PPGBM</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full shadow-lg text-center">
          <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-black text-slate-800">Sistem Luring (Offline)</h3>
          <p className="text-sm text-slate-500 mt-2">{error || "Terjadi kendala saat menyinkronkan data."}</p>
          <button
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            className="mt-5 w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-md transition-all duration-200"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Koneksikan Kembali</span>
          </button>
        </div>
      </div>
    );
  }

  // Filtered villages
  const filteredVillages = data.villages.filter(v => 
    v.name.toLowerCase().includes(villageSearch.toLowerCase())
  );

  // Sorting villages by performance score descending
  const sortedVillages = [...data.villages].sort((a, b) => b.score - a.score);

  // Extract Pilar 2 (Kolaborasi)
  const pillar2 = data.pillars.find(p => p.id === "pilar2")!;
  // Extract Pilar 1 (Sinkronisasi Data)
  const pillar1 = data.pillars.find(p => p.id === "pilar1")!;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* 1. Header & Brand Logo */}
      <LogoOrbitGizi 
        currentUser={currentUser} 
        onLogout={handleGoogleLogout} 
        onLogin={handleGoogleLogin}
        onSync={handleSyncSheets}
        syncingSheets={syncingSheets}
        sheetsSyncUrl={sheetsSyncUrl}
      />

      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Action Header Panel - Permanent at top */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white border border-slate-200 rounded-2xl p-4 shadow-xs gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center space-x-2">
              <Layers className="h-5 w-5 text-indigo-600" />
              <span>Dashboard Transformasi Orbit Gizi</span>
            </h2>
            <div className="flex flex-wrap items-center gap-x-2 mt-1 gap-y-1 text-xs text-slate-500">
              <span>
                Kabupaten aktif: <strong className="text-slate-700 font-bold">{data.kabupatenName}</strong>
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                isUsingLocalFallback() 
                  ? "bg-amber-50 text-amber-700 border border-amber-200" 
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                  isUsingLocalFallback() ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                }`}></span>
                {isUsingLocalFallback() ? "Mode Mandiri (Cloudflare / Offline)" : "Mode Sinkron Server"}
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <button
              onClick={() => setShowConfigModal(true)}
              className="flex items-center justify-center space-x-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <Settings className="h-4 w-4 text-slate-500" />
              <span>Atur Bobot Pilar</span>
            </button>
            
            <button
              onClick={() => setRefreshTrigger(prev => prev + 1)}
              className="p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Sync Feedbacks */}
        {(syncSuccess || syncError) && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            {syncSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl p-3 flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="flex-1">Data berhasil disinkronisasi ke Google Sheets! Seluruh data Orbit Gizi Anda aman dan ter-update di Google Sheets.</span>
                {sheetsSyncUrl && (
                  <a
                    href={sheetsSyncUrl}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] shadow-2xs"
                  >
                    Buka Spreadsheet
                  </a>
                )}
              </div>
            )}
            {syncError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl p-3 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                <span>{syncError}</span>
              </div>
            )}
          </div>
        )}

        {/* Workspace with Left Vertical Navigation Tab Menu */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Sidebar Menu Panel */}
          <div className="lg:w-72 shrink-0 space-y-4">
                     {/* Responsive menu container */}
            {(() => {
              const tabsList = [
                {
                  id: "overview",
                  name: "Ringkasan Indeks",
                  desc: "Nilai Indeks & Bobot Pilar",
                  icon: <LayoutDashboard className="h-4.5 w-4.5" />
                },
                {
                  id: "input_center",
                  name: "Pusat Input Data",
                  desc: "Propinsi s.d. Posyandu & MBG",
                  icon: <Building2 className="h-4.5 w-4.5 text-indigo-600" />
                },
                {
                  id: "ibu_hamil",
                  name: "Ibu Hamil",
                  desc: "Nama Ibu, Umur, NIK, Alamat",
                  icon: <Heart className="h-4.5 w-4.5 text-pink-600" />
                },
                {
                  id: "ibu_menyusui",
                  name: "Ibu Menyusui & Nifas",
                  desc: "Nama Ibu, Umur, NIK, Alamat",
                  icon: <Heart className="h-4.5 w-4.5 text-rose-600" />
                },
                {
                  id: "fondasi",
                  name: "Fondasi Program (ToC)",
                  desc: "Alur Transformasi Gizi",
                  icon: <Layers className="h-4.5 w-4.5" />
                },
                {
                  id: "peta",
                  name: "Peta & Kinerja Desa",
                  desc: "Zona Risiko & Leaderboard",
                  icon: <Map className="h-4.5 w-4.5" />
                },
                {
                  id: "analitik",
                  name: "Analitik Gizi (MBG/PMT)",
                  desc: "Grafik & Sinkronisasi Data",
                  icon: <Activity className="h-4.5 w-4.5" />
                },
                {
                  id: "pilar",
                  name: "Pilar Transformasi",
                  desc: "Detail Nilai Tiap Pilar",
                  icon: <Award className="h-4.5 w-4.5" />
                },
                {
                  id: "rekomendasi",
                  name: "Analisis Data",
                  desc: "Rekomendasi Kebijakan Strategis",
                  icon: <Sparkles className="h-4.5 w-4.5 text-emerald-500" />
                },
                {
                  id: "sinergi",
                  name: "Sinergi Stakeholder",
                  desc: "Kolaborasi OPD Kabupaten",
                  icon: <Handshake className="h-4.5 w-4.5" />
                }
              ];
              const activeTabObj = tabsList.find(t => t.id === activeTab) || tabsList[0];

              return (
                <>
                  {/* MOBILE & TABLET ONLY MENU (Garis Tiga / Hamburger Button Dropdown) */}
                  <div className="lg:hidden relative z-40">
                    <button
                      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                      className="w-full flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs hover:bg-slate-50 transition-colors focus:outline-hidden cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 text-left">
                        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                          {activeTabObj.icon}
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase leading-none block">MENU AKTIF</span>
                          <span className="text-xs font-black text-slate-800 leading-tight block mt-0.5">{activeTabObj.name}</span>
                        </div>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg text-slate-600 border border-slate-200 flex items-center justify-center">
                        {isMobileMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isMobileMenuOpen && (
                        <>
                          {/* Close overlay */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-slate-900 z-40"
                          />

                          {/* Options container */}
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 4, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.98 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1"
                          >
                            {tabsList.map((tab, idx) => {
                              const isActive = activeTab === tab.id;
                              return (
                                <motion.button
                                  key={tab.id}
                                  initial={{ opacity: 0, x: -5 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.02 }}
                                  onClick={() => {
                                    setActiveTab(tab.id);
                                    setIsMobileMenuOpen(false);
                                  }}
                                  className={`w-full flex items-center space-x-3 text-left p-3 rounded-xl transition-all cursor-pointer ${
                                    isActive
                                      ? "bg-indigo-50/70 text-indigo-700 font-bold border border-indigo-100"
                                      : "bg-transparent text-slate-600 hover:bg-slate-50 border border-transparent"
                                  }`}
                                >
                                  <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"}`}>
                                    {tab.icon}
                                  </div>
                                  <div className="truncate">
                                    <span className="text-xs font-black block leading-tight">{tab.name}</span>
                                    <span className="text-[10px] text-slate-400 font-medium block leading-none mt-0.5">{tab.desc}</span>
                                  </div>
                                </motion.button>
                              );
                            })}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* DESKTOP ONLY VERTICAL NAVIGATION SIDEBAR PANEL */}
                  <div className="hidden lg:flex lg:flex-col bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-xs space-y-1">
                    <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1 flex items-center justify-between">
                      <span>MENU DASHBOARD</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    </div>

                    {tabsList.map((tab) => {
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center space-x-3 text-left p-3 rounded-xl transition-all w-full cursor-pointer group ${
                            isActive
                              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold"
                              : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                          }`}
                        >
                          <div className={`p-2 rounded-lg shrink-0 transition-colors ${
                            isActive 
                              ? "bg-white/20 text-white" 
                              : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700"
                          }`}>
                            {tab.icon}
                          </div>
                          <div className="truncate flex-1">
                            <span className="text-xs font-black block leading-tight">{tab.name}</span>
                            <span className={`text-[10px] truncate block mt-0.5 leading-none ${
                              isActive ? "text-indigo-100 font-medium" : "text-slate-400 font-normal"
                            }`}>
                              {tab.desc}
                            </span>
                          </div>
                          {isActive && (
                            <div className="w-1.5 h-4 bg-white/80 rounded-full shrink-0 animate-in fade-in duration-200"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              );
            })()}

            {/* Kabupaten Profile Info widget in Sidebar (Desktop only) */}
            <div className="hidden lg:block bg-slate-900 text-slate-300 rounded-2xl p-4.5 border border-slate-800 shadow-xs space-y-3.5">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-indigo-400 tracking-wider uppercase">SISTEM SINKRONISASI</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 block">Kecamatan Pantauan</span>
                <span className="text-xs font-black text-white">7 Wilayah Terpadu</span>
              </div>
              <div className="pt-2.5 border-t border-slate-800 flex justify-between items-center text-[10px]">
                <span className="text-slate-400 font-semibold">Total Indikator</span>
                <span className="font-mono text-emerald-400 font-bold">14 Parameter Riil</span>
              </div>
            </div>

          </div>

          {/* Active Worksite Area (Content Panel) */}
          <div className="flex-1 min-w-0">
            
            {activeTab === "overview" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* Dynamic Promotional & National Holiday Banners Carousel */}
                <BannerCarousel />

                {/* Score Gauge Widget */}
                <IndexGauge 
                  score={data.indexScore} 
                  category={data.category} 
                  weights={data.weights} 
                  lastUpdated={data.lastUpdated}
                />
                
                {/* Zona Sebaran Unit & Wilayah Cards */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Cakupan Wilayah & Unit Data:</span>
                      <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                        Multi-Level (Desa, Kelurahan, Posyandu, Puskesmas, Kabupaten)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center space-x-3.5 shadow-2xs">
                      <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Zona Hijau (Aman)</span>
                        <span className="text-lg font-black text-slate-800">
                          {data.villages.filter(v => v.riskLevel === "Hijau").length} Unit / Wilayah
                        </span>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center space-x-3.5 shadow-2xs">
                      <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Zona Kuning (Waspada)</span>
                        <span className="text-lg font-black text-slate-800">
                          {data.villages.filter(v => v.riskLevel === "Kuning").length} Unit / Wilayah
                        </span>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center space-x-3.5 shadow-2xs">
                      <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Zona Merah (Rentan)</span>
                        <span className="text-lg font-black text-slate-800">
                          {data.villages.filter(v => v.riskLevel === "Merah").length} Unit / Wilayah
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-100/60 rounded-2xl p-4 border border-slate-200/60 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-slate-800 uppercase">Input Berkala Data Gizi Riil Unit & Wilayah</h4>
                    <p className="text-[11px] text-slate-500">Sinkronisasikan data bulanan MBG, PMT, Posyandu, & e-PPGBM untuk Desa, Kelurahan, Posyandu, Puskesmas, atau Kabupaten.</p>
                  </div>
                  <button
                    onClick={() => setShowInputWizard(true)}
                    className="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 transition-all shadow-xs cursor-pointer"
                  >
                    Buka Wizard Input Data
                  </button>
                </div>

              </div>
            )}

            {activeTab === "input_center" && (
              <div className="animate-in fade-in duration-200">
                <DataInputCenter
                  villages={data.villages}
                  beneficiaries={beneficiaries}
                  onSaveBeneficiary={handleSaveBeneficiary}
                  onDeleteBeneficiary={handleDeleteBeneficiary}
                  onAddWeightRecord={handleAddWeightRecord}
                  onDeleteWeightRecord={handleDeleteWeightRecord}
                  onUpdateVillageMetrics={handleVillageUpdate}
                />
              </div>
            )}

            {activeTab === "ibu_hamil" && (
              <div className="animate-in fade-in duration-200">
                <IbuHamilView />
              </div>
            )}

            {activeTab === "ibu_menyusui" && (
              <div className="animate-in fade-in duration-200">
                <IbuMenyusuiView />
              </div>
            )}

            {activeTab === "fondasi" && (
              <div className="animate-in fade-in duration-200">
                <TheoryOfChange onInputClick={() => setShowInputWizard(true)} />
              </div>
            )}

            {activeTab === "peta" && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-in fade-in duration-200">
                
                {/* 4. Peta Risiko (Map & Village Stats Editor) */}
                <div className="xl:col-span-8">
                  <PetaRisiko 
                    villages={data.villages} 
                    onVillageUpdate={handleVillageUpdate} 
                    onVillageAdd={handleVillageAdd}
                    onVillageDelete={handleVillageDelete}
                    onResetData={handleResetData}
                    onClearData={handleClearData}
                  />
                </div>

                {/* 8. Kinerja Unit & Wilayah (Leaderboard) */}
                <div className="xl:col-span-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs" id="kinerja-desa">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4.5 w-4.5 text-indigo-600" />
                        <h3 className="text-xs font-black tracking-widest text-slate-500 uppercase">
                          PERINGKAT KINERJA UNIT & WILAYAH
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">Total: {data.villages.length}</span>
                    </div>

                    {/* Mini search input */}
                    <div className="relative mb-3.5">
                      <input
                        type="text"
                        placeholder="Cari desa, kelurahan, posyandu..."
                        value={villageSearch}
                        onChange={(e) => setVillageSearch(e.target.value)}
                        className="w-full text-xs font-semibold pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50/50"
                      />
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    </div>

                    <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                      {filteredVillages.length === 0 ? (
                        <p className="text-xs font-bold text-slate-400 text-center py-4">Data unit/wilayah tidak ditemukan.</p>
                      ) : (
                        filteredVillages.map((v) => {
                          let riskColor = "bg-emerald-500";
                          let riskText = "text-emerald-600 bg-emerald-50";
                          if (v.riskLevel === "Merah") {
                            riskColor = "bg-rose-500";
                            riskText = "text-rose-600 bg-rose-50";
                          } else if (v.riskLevel === "Kuning") {
                            riskColor = "bg-amber-500";
                            riskText = "text-amber-600 bg-amber-50";
                          }

                          const uType = v.unitType || "Desa";

                          return (
                            <div 
                              key={v.id} 
                              className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-xl hover:shadow-2xs transition-shadow"
                            >
                              <div className="flex-1 pr-3">
                                <div className="flex items-center justify-between gap-1">
                                  <div className="flex items-center space-x-1.5 truncate">
                                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded">
                                      {uType}
                                    </span>
                                    <span className="text-xs font-bold text-slate-800 truncate">{v.name}</span>
                                  </div>
                                  <span className="text-[9px] font-mono text-slate-400 font-semibold shrink-0">{v.pilar5_stunting_curr} Kasus</span>
                                </div>
                                <div className="h-1 w-full bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                                  <div className={`h-full ${riskColor} rounded-full`} style={{ width: `${v.score}%` }}></div>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ${riskText}`}>
                                  {v.score} pts
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === "analitik" && (
              <div className="animate-in fade-in duration-200">
                <AnalitikGiziView
                  beneficiaries={beneficiaries}
                  villages={data.villages}
                  pillars={data.pillars}
                  mbgMonthlyTrend={data.mbgMonthlyTrend}
                  pmtMonthlyTrend={data.pmtMonthlyTrend}
                  onAddWeightRecord={handleAddWeightRecord}
                />
              </div>
            )}

            {activeTab === "pilar" && (
              <div className="animate-in fade-in duration-200">
                <PilarCard pillars={data.pillars} />
              </div>
            )}

            {activeTab === "rekomendasi" && (
              <div className="animate-in fade-in duration-200">
                <RecommendationCard 
                  lastUpdated={data.lastUpdated} 
                  triggerRefresh={refreshTrigger} 
                />
              </div>
            )}

            {activeTab === "sinergi" && (
              <div className="animate-in fade-in duration-200">
                <StakeholderCard pillar2={pillar2} />
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Footer Branding */}
      <footer className="mt-12 bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-center text-xs font-medium">
        <p>© 2026 Orbit Gizi Kabupaten • Sistem Analisis Gizi Tersinkronisasi Nasional</p>
        <p className="text-[10px] text-slate-600 mt-1">Dinkes • Badan Gizi Nasional • PKK • Pemdes • Puskesmas</p>
      </footer>

      {/* Weights Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Pengaturan Bobot Indeks</h3>
              <button 
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Tutup
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Sesuaikan porsi bobot pengaruh dari setiap pilar indikator gizi. <strong>Total kumulatif pilar wajib bernilai tepat 100%</strong>.
              </p>

              {weightError && (
                <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 text-rose-700 text-xs font-bold">
                  {weightError}
                </div>
              )}

              <div className="space-y-3.5">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>P1. Sinkronisasi Data</span>
                    <span>{weightP1}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" value={weightP1} 
                    onChange={(e) => setWeightP1(parseInt(e.target.value) || 0)}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>P2. Kolaborasi OPD</span>
                    <span>{weightP2}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" value={weightP2} 
                    onChange={(e) => setWeightP2(parseInt(e.target.value) || 0)}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>P3. Digitalisasi</span>
                    <span>{weightP3}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" value={weightP3} 
                    onChange={(e) => setWeightP3(parseInt(e.target.value) || 0)}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>P4. Pelayanan Gizi</span>
                    <span>{weightP4}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" value={weightP4} 
                    onChange={(e) => setWeightP4(parseInt(e.target.value) || 0)}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>P5. Outcome & Dampak</span>
                    <span>{weightP5}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" value={weightP5} 
                    onChange={(e) => setWeightP5(parseInt(e.target.value) || 0)}
                    className="w-full accent-emerald-500"
                  />
                </div>
              </div>

              {/* Total helper */}
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-600">
                <span>Total Akumulatif:</span>
                <span className={weightP1 + weightP2 + weightP3 + weightP4 + weightP5 === 100 ? "text-emerald-600" : "text-rose-500"}>
                  {weightP1 + weightP2 + weightP3 + weightP4 + weightP5}%
                </span>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={handleSaveWeights}
                  className="flex-1 text-center bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl transition-colors shadow-xs"
                >
                  Simpan Konfigurasi
                </button>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 text-center text-slate-500 hover:bg-slate-100 text-xs font-bold rounded-xl transition-colors border border-slate-200"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Gizi Input Wizard Modal */}
      <InputWizardModal
        isOpen={showInputWizard}
        onClose={() => setShowInputWizard(false)}
        villages={data.villages}
        onSave={handleVillageUpdate}
        weights={data.weights}
      />

    </div>
  );
}
