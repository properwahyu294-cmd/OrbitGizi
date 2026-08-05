import React, { useState, useEffect } from "react";
import { Sparkles, Megaphone, Heart, Award, Flag, ChevronLeft, ChevronRight, Bell, Calendar, Star, ArrowRight, Gift } from "lucide-react";

// Import generated images
import bannerKemerdekaan from "../assets/images/banner_kemerdekaan_1785817073638.jpg";
import bannerPmt from "../assets/images/banner_pmt_1785817096291.jpg";
import bannerGizi from "../assets/images/banner_gizi_1785817117043.jpg";
import bannerBalita from "../assets/images/banner_balita_1785817135449.jpg";
import bannerKader from "../assets/images/banner_kader_1785817152158.jpg";
import bannerIbuHamil from "../assets/images/banner_ibu_hamil_1785817168878.jpg";
import bannerIdulFitri from "../assets/images/banner_idul_fitri_1785817190834.jpg";
import bannerPancasila from "../assets/images/banner_pancasila_1785817221226.jpg";
import bannerPahlawan from "../assets/images/banner_pahlawan_1785817242388.jpg";

interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
  icon: React.ReactNode;
  actionText: string;
  isSpecialEvent?: boolean;
  image?: string;
}

export default function BannerCarousel() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<BannerItem | null>(null);

  // Determine current date/month for automated national holidays & August Independence Day
  const today = new Date();
  const currentMonth = today.getMonth(); // 0 = Jan, 7 = August

  // Check if August (Bulan Kemerdekaan)
  const isAugust = currentMonth === 7;

  // 5 Attractive Banners + Special Holiday Banners (MyTelkomsel Promo Card Style)
  const banners: BannerItem[] = [
    ...(isAugust ? [{
      id: "august_special",
      title: "DIRGAHAYU REPUBLIK INDONESIA KE-81",
      subtitle: "17 Agustus 1946 - 17 Agustus 2026",
      description: "Nusantara Baru, Indonesia Maju! Mari gelorakan semangat gizi seimbang dan zero stunting untuk generasi emas Indonesia.",
      badge: "Khas Bulan Agustus",
      bgGradient: "from-red-600/90 via-rose-600/80 to-red-900/90",
      borderColor: "border-red-400",
      textColor: "text-white",
      badgeBg: "bg-white text-red-700 font-black",
      icon: <Flag className="h-6 w-6 text-white animate-pulse" />,
      actionText: "Lihat Info Kemerdekaan",
      isSpecialEvent: true,
      image: bannerKemerdekaan
    }] : []),
    {
      id: "banner_1",
      title: "PEMBERIAN MAKANAN TAMBAHAN (PMT) SERENTAK",
      subtitle: "Posyandu & Puskesmas Boawae",
      description: "Pastikan balita gizi kurang dan ibu hamil KEK mendapatkan paket PMT pemulihan tepat waktu demi tumbuh kembang optimal.",
      badge: "Promo Utama",
      bgGradient: "from-emerald-900/90 via-teal-800/80 to-emerald-900/90",
      borderColor: "border-emerald-400",
      textColor: "text-white",
      badgeBg: "bg-white text-emerald-800 font-black",
      icon: <Sparkles className="h-6 w-6 text-emerald-200" />,
      actionText: "Cek Jadwal PMT",
      image: bannerPmt
    },
    {
      id: "banner_2",
      title: "GERAKAN KELUARGA SADAR GIZI (GARKADGIZI)",
      subtitle: "Edukasi & Konsultasi Gizi Terpadu",
      description: "Cegah stunting sejak dalam kandungan melalui pemenuhan protein hewani dan ASI eksklusif 6 bulan pertama.",
      badge: "Kampanye Sehat",
      bgGradient: "from-indigo-900/90 via-blue-900/80 to-indigo-950/90",
      borderColor: "border-indigo-400",
      textColor: "text-white",
      badgeBg: "bg-white text-indigo-900 font-black",
      icon: <Heart className="h-6 w-6 text-pink-300" />,
      actionText: "Pelajari Gizi",
      image: bannerGizi
    },
    {
      id: "banner_3",
      title: "BULAN PENIMBANGAN BALITA & VITAMIN A",
      subtitle: "Pencatatan Real-Time di Posyandu",
      description: "Gunakan aplikasi Orbit Gizi untuk rekapitulasi berat badan, tinggi badan, status z-score WHO, dan intervensi cepat.",
      badge: "Pembaruan Data",
      bgGradient: "from-amber-900/90 via-orange-800/80 to-amber-950/90",
      borderColor: "border-amber-400",
      textColor: "text-white",
      badgeBg: "bg-white text-amber-900 font-black",
      icon: <Megaphone className="h-6 w-6 text-amber-200" />,
      actionText: "Entri Penimbangan",
      image: bannerBalita
    },
    {
      id: "banner_4",
      title: "PENINGKATAN KAPASITAS KADER POSYANDU",
      subtitle: "Pelatihan Antropometri & Konseling",
      description: "Pelatihan berkala untuk memastikan akurasi pengukuran berat badan digital dan pencatatan e-PPGBM posyandu.",
      badge: "Pelatihan",
      bgGradient: "from-purple-900/90 via-indigo-900/80 to-purple-950/90",
      borderColor: "border-purple-400",
      textColor: "text-white",
      badgeBg: "bg-white text-purple-900 font-black",
      icon: <Award className="h-6 w-6 text-purple-200" />,
      actionText: "Lihat Modul",
      image: bannerKader
    },
    {
      id: "banner_5",
      title: "PEMANTAUAN KESEHATAN IBU HAMIL & MENYUSUI",
      subtitle: "Layanan ANC Terpadu & TTD",
      description: "Dukungan penuh untuk ibu hamil bebas anemia dan pencegahan bayi lahir stunting di wilayah kerja Puskesmas.",
      badge: "Kesehatan Ibu",
      bgGradient: "from-pink-900/90 via-rose-800/80 to-pink-950/90",
      borderColor: "border-pink-400",
      textColor: "text-white",
      badgeBg: "bg-white text-pink-900 font-black",
      icon: <Star className="h-6 w-6 text-pink-200" />,
      actionText: "Data Ibu",
      image: bannerIbuHamil
    },
    // National Calendar Holiday Greeting Banners
    ...(currentMonth === 3 || currentMonth === 4 ? [{
      id: "holiday_eid",
      title: "SELAMAT HARI RAYA IDUL FITRI 1447 H",
      subtitle: "Mohon Maaf Lahir dan Batin",
      description: "Selamat merayakan Idul Fitri bersama keluarga tercinta. Tetap jaga pola gizi seimbang selama hari raya.",
      badge: "Hari Besar Nasional",
      bgGradient: "from-emerald-900/90 via-green-800/80 to-teal-950/90",
      borderColor: "border-emerald-300",
      textColor: "text-white",
      badgeBg: "bg-amber-300 text-emerald-950 font-black",
      icon: <Calendar className="h-6 w-6 text-amber-300" />,
      actionText: "Ucapan Idul Fitri",
      isSpecialEvent: true,
      image: bannerIdulFitri
    }] : []),
    ...(currentMonth === 5 ? [{
      id: "holiday_pancasila",
      title: "SELAMAT HARI KELAHIRAN PANCASILA",
      subtitle: "1 Juni",
      description: "Membumikan nilai-nilai Pancasila dalam gotong royong menurunkan angka stunting dan mewujudkan masyarakat sehat.",
      badge: "Hari Nasional",
      bgGradient: "from-red-900/90 via-amber-800/80 to-red-950/90",
      borderColor: "border-amber-300",
      textColor: "text-white",
      badgeBg: "bg-amber-300 text-red-950 font-black",
      icon: <Flag className="h-6 w-6 text-amber-300" />,
      actionText: "Lihat Detail",
      isSpecialEvent: true,
      image: bannerPancasila
    }] : []),
    ...(currentMonth === 10 ? [{
      id: "holiday_pahlawan",
      title: "SELAMAT HARI PAHLAWAN (10 NOVEMBER)",
      subtitle: "Pahlawanku Teladanku",
      description: "Teladani semangat perjuangan para pahlawan dengan berjuang bersama mengentaskan gizi buruk dan stunting.",
      badge: "Hari Nasional",
      bgGradient: "from-slate-900/90 via-stone-800/80 to-zinc-950/90",
      borderColor: "border-amber-400",
      textColor: "text-white",
      badgeBg: "bg-amber-400 text-slate-950 font-black",
      icon: <Award className="h-6 w-6 text-amber-300" />,
      actionText: "Semangat Pahlawan",
      isSpecialEvent: true,
      image: bannerPahlawan
    }] : [])
  ];

  // Auto-play carousel
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, banners.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const activeBanner = banners[currentIndex];

  return (
    <div className="space-y-3">
      {/* MYTELKOMSEL STYLE BANNER CARD */}
      <div 
        className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-white/20 transition-all duration-500 group cursor-pointer"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onClick={() => setShowDetailModal(activeBanner)}
      >
        {/* Background Image */}
        {activeBanner.image && (
          <img 
            src={activeBanner.image} 
            alt={activeBanner.title} 
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        )}
        {/* Background Gradient Container (Overlay) */}
        <div className={`absolute inset-0 bg-gradient-to-r ${activeBanner.bgGradient} transition-all duration-700 ease-in-out opacity-90`}></div>
        
        {/* MyTelkomsel Style Glossy Circular Floating Shapes */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-black/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 min-h-[180px]">
          
          {/* Left Content */}
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${activeBanner.badgeBg}`}>
                {activeBanner.badge}
              </span>
              <span className="text-white/90 text-xs font-bold flex items-center space-x-1 bg-black/20 px-3 py-1 rounded-full backdrop-blur-xs">
                <Bell className="h-3.5 w-3.5 text-amber-300" />
                <span>{activeBanner.subtitle}</span>
              </span>
            </div>

            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-tight flex items-center space-x-3 drop-shadow-sm">
              <span className="p-2 bg-white/15 rounded-2xl backdrop-blur-md shadow-inner">
                {activeBanner.icon}
              </span>
              <span>{activeBanner.title}</span>
            </h2>

            <p className="text-xs sm:text-sm text-white/95 font-medium leading-relaxed max-w-xl">
              {activeBanner.description}
            </p>
          </div>

          {/* Right Action Button & Controls */}
          <div className="flex flex-col md:items-end justify-between w-full md:w-auto gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-white/15">
            
            {/* MyTelkomsel Style Action Pill */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDetailModal(activeBanner);
              }}
              className="bg-white hover:bg-slate-100 text-slate-900 font-black px-5 py-2.5 rounded-2xl text-xs flex items-center space-x-2 shadow-xl shadow-black/10 transition-all transform hover:scale-105 cursor-pointer whitespace-nowrap"
            >
              <Gift className="h-4 w-4 text-red-600" />
              <span>{activeBanner.actionText}</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
            </button>

            {/* Pagination Dots & Arrow Controls */}
            <div className="flex items-center justify-between md:justify-end w-full gap-3">
              <div className="flex items-center space-x-1.5">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(idx);
                    }}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      currentIndex === idx ? "w-6 bg-white shadow-sm" : "w-2 bg-white/40 hover:bg-white/70"
                    }`}
                    title={`Banner ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="p-1.5 rounded-xl bg-white/15 hover:bg-white/30 text-white transition-colors cursor-pointer backdrop-blur-xs"
                  title="Sebelumnya"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="p-1.5 rounded-xl bg-white/15 hover:bg-white/30 text-white transition-colors cursor-pointer backdrop-blur-xs"
                  title="Berikutnya"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* DETAIL POPUP MODAL */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="relative p-4 rounded-2xl overflow-hidden text-white space-y-2">
              {showDetailModal.image && (
                <img 
                  src={showDetailModal.image} 
                  alt={showDetailModal.title} 
                  className="absolute inset-0 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className={`absolute inset-0 bg-gradient-to-r ${showDetailModal.bgGradient} opacity-90`}></div>
              <div className="relative z-10">
                <span className="px-3 py-0.5 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-wider inline-block mb-2">
                  {showDetailModal.badge}
                </span>
                <h3 className="text-base font-black leading-tight">
                  {showDetailModal.title}
                </h3>
                <p className="text-xs text-white/95 font-semibold mt-1">
                  {showDetailModal.subtitle}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed font-medium">
              <p className="text-sm font-bold text-slate-900">Informasi Resmi Program:</p>
              <p>{showDetailModal.description}</p>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <p className="font-bold text-slate-800">Catatan Pelaksanaan:</p>
                <p className="text-slate-600">
                  Seluruh kegiatan penimbangan posyandu dan pemantauan gizi tersinkronisasi otomatis dengan sistem e-PPGBM Puskesmas Boawae. Pastikan data terekam dengan akurat setiap bulan.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowDetailModal(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-black px-6 py-2.5 rounded-2xl text-xs shadow-md cursor-pointer"
              >
                Tutup Informasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
