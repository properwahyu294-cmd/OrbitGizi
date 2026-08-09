import { useState } from "react";
import { Printer, X, BookOpen, ShieldCheck, Download, CheckCircle2, Globe, Users, FileSpreadsheet, Lock, Activity, Eye, BarChart3, Database, FileText, PhoneCall, HelpCircle, Building2, Utensils } from "lucide-react";
import coverImage from "../assets/images/orbit_gizi_manual_cover_clean_1785996851476.jpg";

interface UserManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserManualModal({ isOpen, onClose }: UserManualModalProps) {
  const [printOrientation, setPrintOrientation] = useState<"portrait" | "landscape">("portrait");

  if (!isOpen) return null;

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-6xl w-full max-h-[96vh] overflow-hidden flex flex-col shadow-2xl text-slate-900">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/30 text-blue-400 rounded-xl">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-wider">Buku Panduan Resmi • Orbit Gizi System v2.5</h3>
              <p className="text-xs text-slate-400">Dokumentasi Komprehensif 5 Bab & 20 Halaman • Terintegrasi Menu Publik & Standar e-PPGBM Nagekeo</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center space-x-2 transition-all shadow-md cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Unduh / Cetak PDF (20 Halaman)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Toolbar / Options */}
        <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-700">
          <div className="flex items-center space-x-2 text-blue-700 font-bold">
            <ShieldCheck className="h-4 w-4" />
            <span>Dokumen Terverifikasi Dinas Kesehatan Kabupaten Nagekeo</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setPrintOrientation(printOrientation === 'portrait' ? 'landscape' : 'portrait')}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold rounded-xl shadow-2xs transition-all cursor-pointer text-xs"
            >
              Mode Cetak: <span className="text-blue-600 uppercase">{printOrientation}</span> (Klik untuk Ubah)
            </button>
            <span className="px-3 py-1.5 bg-blue-600 text-white rounded-xl font-mono text-[11px] font-bold shadow-2xs">
              20 Halaman Presisi • A4
            </span>
          </div>
        </div>

        {/* Scrollable Document Container (20 Pages Simulation) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-10 bg-slate-100/90 flex flex-col items-center space-y-10">
          
          <style>{`
            @media print {
              @page {
                size: A4 ${printOrientation};
                margin: 0mm;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              html, body {
                background: #ffffff !important;
                color: #000000 !important;
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                height: auto !important;
                overflow: visible !important;
              }
              body * {
                visibility: hidden !important;
              }
              #printable-manual-book, #printable-manual-book *,
              #printable-portfolio-report, #printable-portfolio-report *,
              #printable-offline-form, #printable-offline-form *,
              #printable-audit-report, #printable-audit-report * {
                visibility: visible !important;
              }
              #printable-manual-book {
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              .manual-page {
                box-shadow: none !important;
                border: none !important;
                border-radius: 0 !important;
                margin: 0 !important;
                padding: ${printOrientation === 'landscape' ? '12mm 16mm' : '14mm 16mm'} !important;
                width: ${printOrientation === 'landscape' ? '297mm' : '210mm'} !important;
                min-height: ${printOrientation === 'landscape' ? '210mm' : '297mm'} !important;
                height: auto !important;
                max-height: none !important;
                page-break-after: always !important;
                break-after: page !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
                box-sizing: border-box !important;
                position: relative !important;
                overflow: visible !important;
              }
            }

            .manual-page {
              width: ${printOrientation === 'landscape' ? '297mm' : '210mm'};
              max-width: 100%;
              min-height: ${printOrientation === 'landscape' ? '210mm' : '297mm'};
              height: ${printOrientation === 'landscape' ? '210mm' : '297mm'};
              padding: 16mm;
              background: #ffffff;
              box-shadow: 0 12px 35px rgba(0,0,0,0.1);
              border: 1px solid #cbd5e1;
              border-radius: 16px;
              margin-bottom: 2rem;
              position: relative;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              transition: width 0.3s ease, height 0.3s ease;
            }
          `}</style>

          <div id="printable-manual-book" className="flex flex-col items-center space-y-8 w-full max-w-[210mm]">

            {/* ==================== COVER PAGE (HALAMAN 1) ==================== */}
            <div className="manual-page bg-white overflow-hidden relative p-0 flex flex-col justify-between">
              <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
                <img 
                  src={coverImage} 
                  alt="Buku Panduan Cover" 
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="absolute inset-0 z-10 flex flex-col justify-between p-10 bg-gradient-to-b from-white/95 via-white/60 to-white/95">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-6">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-lg">
                      OG
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-800 block">
                        PEMERINTAH KABUPATEN NAGEKEO • DINAS KESEHATAN
                      </span>
                      <span className="text-xs font-bold text-slate-900 tracking-wide">ORBIT GIZI SYSTEM ENTERPRISE v2.5</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-amber-500 text-slate-950 text-[10px] font-black rounded-lg uppercase tracking-wider block shadow-xs">
                      BUKU PANDUAN RESMI
                    </span>
                    <span className="text-[10px] text-slate-700 mt-1 block font-mono font-bold">EDISI 2026 • 20 HALAMAN PRESISI</span>
                  </div>
                </div>

                <div className="py-10 space-y-4 text-left max-w-lg">
                  <div className="inline-block px-3 py-1 bg-blue-600 text-white rounded-md text-[10px] font-black uppercase tracking-widest shadow-xs">
                    MODUL OPERASIONAL, DASHBOARD PUBLIK & E-PPGBM
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black text-blue-950 leading-tight uppercase tracking-tight drop-shadow-xs">
                    BUKU PANDUAN PENGGUNAAN & OPERASIONAL SISTEM ORBIT GIZI
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed bg-white/80 p-3.5 rounded-xl backdrop-blur-xs border border-slate-200 shadow-xs">
                    Panduan resmi komprehensif 5 bab dan 20 halaman mencakup pengoperasian sistem, Portal Launcher Publik, Dashboard Publik Interaktif, manajemen data balita & ibu hamil, pencatatan offline posyandu (blank spot), distribusi MBG/PMT, sinkronisasi Google Sheets, analitik pengunjung, serta laporan eksekutif Nagekeo.
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-800 font-semibold bg-white/90 p-4 rounded-2xl backdrop-blur-xs">
                  <div>
                    <span className="font-extrabold text-blue-950 block text-xs">Disusun Oleh: Tim Pengembang SPBE & Dinas Kesehatan Nagekeo</span>
                    <span className="text-[10px] text-slate-600">Tahun 2026 • Terverifikasi Resmi</span>
                  </div>
                  <div className="text-right font-mono font-black text-blue-700 text-xs px-3 py-1 bg-blue-50 rounded-lg border border-blue-200">
                    Halaman 1 / 20
                  </div>
                </div>
              </div>
            </div>


            {/* ==================== HALAMAN 2: DAFTAR ISI ==================== */}
            <div className="manual-page bg-white">
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">DAFTAR ISI BUKU PANDUAN</span>
                    <h2 className="text-base font-black text-slate-900">STRUKTUR MODUL 5 BAB & 20 HALAMAN PRESISI</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 2</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex justify-between font-black text-slate-900 text-xs">
                      <span>BAB 1: PENDAHULUAN, PORTAL PUBLIK & ARSITEKTUR KEAMANAN</span>
                      <span className="text-blue-700 font-mono">Hal. 3 - 5</span>
                    </div>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5 pl-2 text-[11px]">
                      <li>Visi Zero Stunting Nagekeo 2026 & Arsitektur Sistem (Hal. 3)</li>
                      <li>Portal Launcher App, Akses Publik vs. Admin & ABAC (Hal. 4)</li>
                      <li>Sistem Analitik Pengunjung & Audit Log Operator (Hal. 5)</li>
                    </ul>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex justify-between font-black text-slate-900 text-xs">
                      <span>BAB 2: MANAJEMEN DATA SASARAN & e-PPGBM</span>
                      <span className="text-blue-700 font-mono">Hal. 6 - 8</span>
                    </div>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5 pl-2 text-[11px]">
                      <li>Pendataan Balita, Validasi NIK 16 Digit & Z-Score WHO (Hal. 6)</li>
                      <li>Pendataan Ibu Hamil (ANC), Ibu Menyusui & Risikokesehatan (Hal. 7)</li>
                      <li>Pusat Input & Sinkronisasi MBG (Mode Fullscreen/Modal) (Hal. 8)</li>
                    </ul>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex justify-between font-black text-slate-900 text-xs">
                      <span>BAB 3: DASHBOARD PUBLIK INTERAKSI MASYARAKAT</span>
                      <span className="text-blue-700 font-mono">Hal. 9 - 10</span>
                    </div>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5 pl-2 text-[11px]">
                      <li>Portal Publik Interaktif untuk Masyarakat & Stakeholder (Hal. 9)</li>
                      <li>Rekapitulasi Wilayah & Transparansi Zona Risiko Desa (Hal. 10)</li>
                    </ul>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex justify-between font-black text-slate-900 text-xs">
                      <span>BAB 4: INTERVENSI MBG, PMT & FORM OFFLINE (BLANK SPOT)</span>
                      <span className="text-blue-700 font-mono">Hal. 11 - 14</span>
                    </div>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5 pl-2 text-[11px]">
                      <li>Program Makanan Bergizi Gratis (MBG) & AKG Nutrisi (Hal. 11)</li>
                      <li>Alokasi PMT Pemulihan Balita Wasting (Hal. 12)</li>
                      <li>Form Offline Posyandu 15 Baris & Pengisian Lapangan (Hal. 13)</li>
                      <li>SOP Rekonsiliasi Data Lapangan ke Database Cloud (Hal. 14)</li>
                    </ul>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex justify-between font-black text-slate-900 text-xs">
                      <span>BAB 5: GOOGLE SHEETS, ANALISIS PIVOT, PORTOFOLIO & LAMPIRAN</span>
                      <span className="text-blue-700 font-mono">Hal. 15 - 20</span>
                    </div>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5 pl-2 text-[11px]">
                      <li>Integrasi Otomatis Google Sheets (8 Tab Data Complete) (Hal. 15)</li>
                      <li>Analisis Pivot Lintas Wilayah & Evaluasi 5 Pilar Intervensi (Hal. 16)</li>
                      <li>Pencetakan Portofolio Eksekutif 4 Halaman untuk Pimpinan (Hal. 17)</li>
                      <li>Fitur Ekspor Laporan, Audit Log & Keamanan SPBE (Hal. 18)</li>
                      <li>LAMPIRAN A: Standar Operasional Prosedur (SOP) Posyandu (Hal. 19)</li>
                      <li>LAMPIRAN B: FAQ, Troubleshooting & Contact Helpdesk (Hal. 20)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Orbit Gizi System v2.5 • Buku Panduan Resmi</span>
                <span>Halaman 2 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 3: BAB 1 (BAGIAN 1) ==================== */}
            <div className="manual-page bg-white">
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">BAB 1 • PENDAHULUAN & ARSITEKTUR</span>
                    <h2 className="text-base font-black text-slate-900">1.1 Latar Belakang & Visi Zero Stunting Nagekeo 2026</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 3</span>
                </div>

                <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <p>
                    Kabupaten Nagekeo berkomitmen penuh dalam mewujudkan target nasional penurunan angka stunting hingga di bawah 14% serta menuju <strong>Zero Stunting 2026</strong>. Melalui Dinas Kesehatan dan kolaborasi lintas sektor yang melibatkan 5 pilar pembangunan gizi, diperlukan sebuah sistem informasi terintegrasi yang mampu merekam, memantau, dan mengevaluasi intervensi kesehatan secara akurat hingga tingkat Posyandu terkecil di seluruh desa.
                  </p>
                  <p>
                    <strong>Orbit Gizi System Enterprise v2.5</strong> hadir sebagai solusi digital berbasis web dan integrasi e-PPGBM (Elektronik Pencatatan dan Pelaporan Gizi Berbasis Masyarakat) yang dirancang khusus untuk memudahkan kerja tenaga kesehatan puskesmas, kader posyandu, bidan desa, serta Tim Percepatan Penurunan Stunting (TPPS) Kabupaten Nagekeo.
                  </p>

                  <div className="p-3 bg-blue-50 border-l-4 border-blue-600 rounded-r-xl space-y-1.5">
                    <h4 className="font-black text-blue-900 uppercase text-xs">Prinsip Utama Arsitektur Sistem:</h4>
                    <ul className="list-disc list-inside space-y-1 text-blue-800 text-[11px]">
                      <li><strong>Akurasi Data Real-time:</strong> Setiap penimbangan balita langsung terhubung dengan kalkulator status gizi WHO z-score.</li>
                      <li><strong>Transparansi Publik & Akses Terbuka:</strong> Menyediakan Dashboard Publik khusus agar warga dapat memantau progres gizi daerah.</li>
                      <li><strong>Ketahanan Lapangan (Offline-Ready):</strong> Menyediakan fasilitas cetak blangko manual bagi posyandu di wilayah blank spot.</li>
                      <li><strong>Integrasi Cloud Database & Sheets:</strong> Menyinkronkan data secara otomatis ke 8 Tab Google Sheets resmi.</li>
                    </ul>
                  </div>

                  <p>
                    Buku panduan ini disusun secara sistematis agar dapat dipahami dan dipraktekkan langsung oleh seluruh pengguna di lapangan, memastikan tidak ada satupun anak berisiko stunting yang terlewat dari intervensi gizi.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Bab 1: Pendahuluan & Arsitektur</span>
                <span>Halaman 3 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 4: BAB 1 (BAGIAN 2) ==================== */}
            <div className="manual-page bg-white">
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">BAB 1 • PENDAHULUAN & ARSITEKTUR</span>
                    <h2 className="text-base font-black text-slate-900">1.2 Portal Launcher App, Menu Publik & Akses ABAC</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 4</span>
                </div>

                <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <h3 className="font-black text-slate-900 text-xs">Portal Launcher Utama</h3>
                  <p>
                    Saat pertama kali membuka aplikasi, pengguna disambut oleh <strong>Portal Launcher Utama</strong> yang memberikan dua pilihan akses sesuai dengan peran pengguna:
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                      <div className="flex items-center space-x-2 text-emerald-900 font-black text-xs">
                        <Globe className="h-4 w-4 text-emerald-600" />
                        <span>1. Dashboard Publik Interaktif</span>
                      </div>
                      <p className="text-[10px] text-emerald-800">
                        Dapat diakses langsung oleh masyarakat umum, insan pers, LSM, dan stakeholder tanpa perlu kredensial login.
                      </p>
                    </div>

                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1">
                      <div className="flex items-center space-x-2 text-indigo-900 font-black text-xs">
                        <Lock className="h-4 w-4 text-indigo-600" />
                        <span>2. Dashboard Utama Admin / Nakes</span>
                      </div>
                      <p className="text-[10px] text-indigo-800">
                        Dikhususkan untuk Petugas Nakes, Operator Dinkes, Bidan Desa, dan Kader Posyandu untuk menginput dan mengelola data sasaran.
                      </p>
                    </div>
                  </div>

                  <h3 className="font-black text-slate-900 text-xs">Keamanan Berbasis Atribut (ABAC Security)</h3>
                  <p>
                    Sistem mengimplementasikan pengamanan Attribute-Based Access Control (ABAC). Fitur sensitif seperti edit/hapus data balita, pengesahan laporan, dan konfigurasi Google Sheets hanya terbuka bagi akun terautentikasi resmi.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Bab 1: Pendahuluan & Arsitektur</span>
                <span>Halaman 4 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 5: BAB 1 (BAGIAN 3) ==================== */}
            <div className="manual-page bg-white">
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">BAB 1 • PENDAHULUAN & ARSITEKTUR</span>
                    <h2 className="text-base font-black text-slate-900">1.3 Sistem Analitik Pengunjung & Audit Log Operator</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 5</span>
                </div>

                <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <p>
                    Untuk menjaga transparansi dan memantau pemanfaatan sistem secara akuntabel, Orbit Gizi System dilengkapi dengan dua modul monitoring otomatis:
                  </p>

                  <div className="space-y-2">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                          <Eye className="h-4 w-4 text-blue-600" /> Analitik Akses Pengunjung (Visitor Analytics)
                        </span>
                        <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-bold">Otomatis Track</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Setiap kali ada pengguna yang membuka Dashboard Utama, Portal Publik, atau menu tertentu, sistem merekam Waktu Akses (WITA), Email, Peran (ADMIN / PENGUNJUNG), Nama Halaman, serta Jenis Perangkat.
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                          <Activity className="h-4 w-4 text-purple-600" /> Audit Log Activity Operator
                        </span>
                        <span className="text-[10px] font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md font-bold">SPBE Audit</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Merekam seluruh aktivitas penambahan sasaran, pengeditan data balita, penghapusan record, pencetakan form offline, dan sinkronisasi Google Sheets secara detail guna kepatuhan audit keamanan data kesehatan.
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 italic">
                    * Seluruh catatan pengunjung dan audit log ini juga ikut disinkronkan ke dalam Sheet "Analitik Pengunjung" dan "Audit Log Operator" pada Google Spreadsheet resmi.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Bab 1: Pendahuluan & Arsitektur</span>
                <span>Halaman 5 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 6: BAB 2 (BAGIAN 1) ==================== */}
            <div className="manual-page bg-white">
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">BAB 2 • MANAJEMEN DATA SASARAN & e-PPGBM</span>
                    <h2 className="text-base font-black text-slate-900">2.1 Pendataan Balita & Validasi NIK 16 Digit</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 6</span>
                </div>

                <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <p>
                    Pencatatan data sasaran balita merupakan fondasi utama e-PPGBM. Setiap balita yang ditimbang di Posyandu wajib terdaftar menggunakan NIK 16 digit yang sah.
                  </p>

                  <div className="space-y-1.5">
                    <h4 className="font-black text-slate-900 uppercase text-xs">Tahapan Input Data Balita Baru:</h4>
                    <ol className="list-decimal list-inside space-y-1 pl-2 text-slate-700 text-[11px]">
                      <li>Masuk ke menu <strong>Data Input Center</strong> atau tab <strong>Penerima MBG</strong>.</li>
                      <li>Klik tombol <strong>+ Tambah Sasaran Baru</strong> untuk memunculkan formulir pendaftaran.</li>
                      <li>Masukkan 16 digit NIK Balita (Sistem otomatis memverifikasi jumlah digit NIK).</li>
                      <li>Isi Nama Lengkap, Tanggal Lahir, Jenis Kelamin (L/P), Nama Orang Tua, serta Wilayah Desa/Puskesmas.</li>
                      <li>Masukkan data antropometri awal: Berat Badan (Kg) dan Tinggi Badan (Cm).</li>
                      <li>Sistem secara otomatis menghitung kalkulasi z-score WHO (Normal, Risiko Stunting, Stunting, Wasting, Underweight).</li>
                      <li>Klik <strong>Simpan Data</strong> untuk memasukkan data ke database.</li>
                    </ol>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px]">
                    <span className="font-bold block mb-0.5">Aturan Validasi e-PPGBM:</span>
                    Pastikan tanggal lahir diisi akurat agar perhitungan umur bulan (0-59 bulan) dan penentuan ambang batas z-score antropometri tepat.
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Bab 2: Manajemen Data Sasaran</span>
                <span>Halaman 6 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 7: BAB 2 (BAGIAN 2) ==================== */}
            <div className="manual-page bg-white">
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">BAB 2 • MANAJEMEN DATA SASARAN & e-PPGBM</span>
                    <h2 className="text-base font-black text-slate-900">2.2 Pendataan Ibu Hamil (ANC) & Ibu Menyusui (PNC)</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 7</span>
                </div>

                <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <p>
                    Pencegahan stunting di Kabupaten Nagekeo berfokus pada periode 1.000 Hari Pertama Kehidupan (HPK). Oleh karena itu, pendataan Ibu Hamil dan Ibu Menyusui dikelola dalam modul khusus.
                  </p>

                  <div className="space-y-2">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                      <span className="font-black text-slate-900 block text-xs">1. Pencatatan Ibu Hamil (ANC)</span>
                      <p className="text-[10px] text-slate-600">
                        Isi data NIK, Usia Kehamilan (Trimester 1/2/3), Lingkar Lengan Atas (LiLA dalam cm), Kadar Hemoglobin (Hb), dan riwayat penerimaan Tablet Tambah Darah (TTD). Ibu Hamil dengan LiLA &lt; 23.5 cm otomatis ditandai sebagai Risiko KEK (Kekurangan Energi Kronis).
                      </p>
                    </div>

                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                      <span className="font-black text-slate-900 block text-xs">2. Pencatatan Ibu Menyusui (PNC)</span>
                      <p className="text-[10px] text-slate-600">
                        Catat tanggal persalinan, pemberian ASI Eksklusif 0-6 bulan, kondisi kesehatan ibu pasca persalinan, serta konseling gizi dari Bidan Desa / Kader Posyandu.
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px]">
                    Data Ibu Hamil KEK dan Ibu Menyusui berisiko ini menjadi rujukan utama dalam menentukan penerima Paket Makanan Bergizi Gratis (MBG) dan PMT Pemulihan.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Bab 2: Manajemen Data Sasaran</span>
                <span>Halaman 7 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 8: BAB 2 (BAGIAN 3) ==================== */}
            <div className="manual-page bg-white">
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">BAB 2 • MANAJEMEN DATA SASARAN & e-PPGBM</span>
                    <h2 className="text-base font-black text-slate-900">2.3 Pusat Input & Sinkronisasi MBG (Layar Fullscreen)</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 8</span>
                </div>

                <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <p>
                    Untuk mempercepat pekerjaan petugas di lapangan, sistem menyediakan modul <strong>Pusat Input & Sinkronisasi MBG</strong> yang dapat dibuka baik melalui menu tab maupun dalam tampilan <em>Modal / Fullscreen Canvas</em>.
                  </p>

                  <div className="space-y-1.5">
                    <h4 className="font-black text-slate-900 uppercase text-xs">Fitur Utama Pusat Input Data:</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                      <li><strong>Input Cepat Multi-kategori:</strong> Pilihan tab langsung antara Balita, Ibu Hamil, dan Ibu Menyusui.</li>
                      <li><strong>Pencarian & Filter Instan:</strong> Saring data berdasarkan nama, NIK, atau kelurahan tempat tinggal.</li>
                      <li><strong>Aksi Massal (Bulk Action):</strong> Memudahkan penandaan kehadiran posyandu dan penerimaan paket MBG sekaligus.</li>
                      <li><strong>Tombol Sinkronisasi Google Sheets:</strong> Sekali klik untuk mengirimkan pembaharuan data langsung ke cloud spreadsheet resmi.</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px]">
                    <span className="font-bold block mb-0.5">Efisiensi Kerja Nakes:</span>
                    Dengan tampilan terpusat ini, waktu input laporan posyandu bulanan dapat dipangkas hingga 70% dibandingkan sistem konvensional.
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Bab 2: Manajemen Data Sasaran</span>
                <span>Halaman 8 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 9: BAB 3 (BAGIAN 1) ==================== */}
            <div className="manual-page bg-white">
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">BAB 3 • DASHBOARD PUBLIK INTERAKTIF</span>
                    <h2 className="text-base font-black text-slate-900">3.1 Portal Publik untuk Masyarakat & Stakeholder</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 9</span>
                </div>

                <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <p>
                    Dalam rangka keterbukaan informasi publik dan akuntabilitas pemerintah daerah, Orbit Gizi System menyediakan <strong>Dashboard Publik Interaktif</strong> yang bebas diakses oleh masyarakat umum.
                  </p>

                  <div className="space-y-2">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                      <span className="font-black text-slate-900 block text-xs">Cara Mengakses Dashboard Publik</span>
                      <p className="text-[10px] text-slate-600">
                        Buka aplikasi, lalu pilih tombol <strong>"Dashboard Publik (Masyarakat & Stakeholder)"</strong> pada Portal Launcher Utama atau klik tombol "Lihat Dashboard Publik" di pojok kanan atas layar admin.
                      </p>
                    </div>

                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                      <span className="font-black text-slate-900 block text-xs">Fitur-fitur Utama Dashboard Publik</span>
                      <ul className="list-disc list-inside text-[10px] text-slate-600 space-y-0.5 pl-1">
                        <li><strong>Ringkasan Statistik Daerah:</strong> Menampilkan total sasaran balita, angka stunting, dan progres distribusi MBG.</li>
                        <li><strong>Galeri Edukasi Nutrisi & MBG:</strong> Koleksi spanduk dan foto kegiatan posyandu Nagekeo.</li>
                        <li><strong>Peta Risiko & Rekapitulasi Desa:</strong> Informasi tingkat risiko stunting per desa (Zona Hijau, Kuning, Merah).</li>
                        <li><strong>Pencarian Penerima Manfaat Transparans:</strong> Cek status penerimaan bantuan MBG berbasis wilayah secara aman.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Bab 3: Dashboard Publik Interaktif</span>
                <span>Halaman 9 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 10: BAB 3 (BAGIAN 2) ==================== */}
            <div className="manual-page bg-white">
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">BAB 3 • DASHBOARD PUBLIK INTERAKTIF</span>
                    <h2 className="text-base font-black text-slate-900">3.2 Rekapitulasi Wilayah & Transparansi Zona Risiko</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 10</span>
                </div>

                <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <p>
                    Pada Dashboard Publik, masyarakat dapat melihat klasifikasi wilayah berdasarkan status capaian gizi dan jumlah sasaran yang terdaftar.
                  </p>

                  <div className="grid grid-cols-3 gap-2.5 my-2">
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-0.5">
                      <span className="font-black text-emerald-900 block text-xs">Zona Hijau</span>
                      <p className="text-[9px] text-emerald-800">Prevalensi stunting sangat rendah (&lt; 5%), penanganan gizi optimal.</p>
                    </div>
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-0.5">
                      <span className="font-black text-amber-900 block text-xs">Zona Kuning</span>
                      <p className="text-[9px] text-amber-800">Prevalensi stunting sedang (5 - 15%), memerlukan pendampingan posyandu.</p>
                    </div>
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-center space-y-0.5">
                      <span className="font-black text-rose-900 block text-xs">Zona Merah</span>
                      <p className="text-[9px] text-rose-800">Prevalensi stunting tinggi (&gt; 15%), memerlukan intervensi darurat MBG & PMT.</p>
                    </div>
                  </div>

                  <p>
                    Setiap kartu desa pada Dashboard Publik menyajikan informasi posyandu aktif, total sasaran balita terdaftar, serta jumlah kasus stunting yang sedang ditangani secara riil.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Bab 3: Dashboard Publik Interaktif</span>
                <span>Halaman 10 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 11: BAB 4 (BAGIAN 1) ==================== */}
            <div className="manual-page bg-white">
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">BAB 4 • INTERVENSI MBG, PMT & FORM OFFLINE</span>
                    <h2 className="text-base font-black text-slate-900">4.1 Program Makanan Bergizi Gratis (MBG) & AKG Nutrisi</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 11</span>
                </div>

                <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <p>
                    Program Makanan Bergizi Gratis (MBG) merupakan komitmen strategis Pemkab Nagekeo bekerjasama dengan BGN (Badan Gizi Nasional) dan Dinas Kesehatan dalam menyalurkan asupan protein hewani tinggi.
                  </p>

                  <div className="space-y-1.5">
                    <h4 className="font-black text-slate-900 uppercase text-xs">SOP Penjadwalan & Distribusi MBG:</h4>
                    <ol className="list-decimal list-inside space-y-1 pl-2 text-slate-700 text-[11px]">
                      <li>Masuk ke menu <strong>Input MBG & Intervensi</strong>.</li>
                      <li>Tentukan tanggal distribusi, jenis menu makanan lokal (ikan segar, telur, sayur kelor, nasi), serta kalori harian.</li>
                      <li>Pilih kelompok sasaran penerima (PAUD/TK/SD, Balita Posyandu, Ibu Hamil KEK).</li>
                      <li>Catat jumlah porsi disalurkan dan lakukan konfirmasi penerimaan oleh kader posyandu.</li>
                    </ol>
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-[11px]">
                    <span className="font-bold text-emerald-900 block">Standar AKG Nutrisi MBG:</span>
                    <p className="text-emerald-800">
                      Setiap paket makanan bergizi gratis wajib memenuhi minimal 30% Angka Kecukupan Gizi (AKG) harian anak, kaya akan protein hewani lokal dan mikronutrien penting.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Bab 4: Intervensi MBG, PMT & Form Offline</span>
                <span>Halaman 11 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 12: BAB 4 (BAGIAN 2) ==================== */}
            <div className="manual-page bg-white">
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">BAB 4 • INTERVENSI MBG, PMT & FORM OFFLINE</span>
                    <h2 className="text-base font-black text-slate-900">4.2 Alokasi PMT Pemulihan Balita Wasting</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 12</span>
                </div>

                <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <p>
                    Pemberian Makanan Tambahan (PMT) Pemulihan ditujukan secara intensif kepada balita berstatus gizi kurang (wasting) atau gizi buruk selama siklus 90 hari intervensi.
                  </p>

                  <div className="space-y-2">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                      <span className="font-black text-slate-900 block text-xs">1. Identifikasi Otomatis Target PMT</span>
                      <p className="text-[10px] text-slate-600">Sistem secara otomatis memfilter balita yang memiliki indikator BB/TB di bawah -2 SD (wasting) untuk langsung masuk dalam daftar penerima PMT Pemulihan.</p>
                    </div>

                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                      <span className="font-black text-slate-900 block text-xs">2. Evaluasi Berkala Kenaikan Berat Badan</span>
                      <p className="text-[10px] text-slate-600">Setiap 2 minggu sekali, kader posyandu melakukan penimbangan ulang untuk menilai efektivitas pakan PMT pemulihan.</p>
                    </div>

                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                      <span className="font-black text-slate-900 block text-xs">3. Rujukan Ke Puskesmas</span>
                      <p className="text-[10px] text-slate-600">Apabila dalam 4 minggu tidak terjadi kenaikan BB, balita segera dirujuk ke Puskesmas pembina untuk pemeriksaan dokter spesialis anak.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Bab 4: Intervensi MBG, PMT & Form Offline</span>
                <span>Halaman 12 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 13: BAB 4 (BAGIAN 3) ==================== */}
            <div className="manual-page bg-white">
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">BAB 4 • INTERVENSI MBG, PMT & FORM OFFLINE</span>
                    <h2 className="text-base font-black text-slate-900">4.3 Form Offline Posyandu 15 Baris (Blank Spot)</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 13</span>
                </div>

                <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <p>
                    Bagi posyandu yang berada di wilayah terpencil tanpa koneksi internet (blank spot), sistem menyediakan modul cetak <strong>Form Blangko Manual Standar 15 Baris</strong>.
                  </p>

                  <div className="space-y-1.5">
                    <h4 className="font-black text-slate-900 uppercase text-xs">Langkah Cetak Form Offline:</h4>
                    <ol className="list-decimal list-inside space-y-1 pl-2 text-slate-700 text-[11px]">
                      <li>Klik tombol <strong>Cetak Form Offline</strong> pada bilah navigasi atas.</li>
                      <li>Isi Nama Desa/Kelurahan, Nama Posyandu, serta Nama Petugas Kader.</li>
                      <li>Pilih orientasi cetak (Portrait / Landscape).</li>
                      <li>Sistem menyiapkan lembar tabel A4 persisi berisi 15 baris kosong dengan kolom: No, NIK, Nama Sasaran, L/P, Tanggal Lahir, BB (Kg), TB (Cm), LiLA (Cm), Status Gizi, dan Keterangan.</li>
                      <li>Klik tombol <strong>Cetak Form</strong> untuk mencetak lembar fisik kertas.</li>
                    </ol>
                  </div>

                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 text-[11px]">
                    <span className="font-bold block mb-0.5">Keunggulan Form Blangko Manual:</span>
                    Formulir dirancang pas di 1 lembar kertas A4 tanpa terpotong, siap dipakai kader mencatat langsung di lapangan.
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Bab 4: Intervensi MBG, PMT & Form Offline</span>
                <span>Halaman 13 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 14: BAB 4 (BAGIAN 4) ==================== */}
            <div className="manual-page bg-white">
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">BAB 4 • INTERVENSI MBG, PMT & FORM OFFLINE</span>
                    <h2 className="text-base font-black text-slate-900">4.4 SOP Rekonsiliasi & Pemindahan Data Lapangan</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 14</span>
                </div>

                <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <p>
                    Setelah selesai pencatatan manual di posyandu blank spot, berikut adalah SOP wajib pemindahan data kertas ke database cloud aplikasi:
                  </p>

                  <div className="space-y-2">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                      <span className="font-black text-slate-900 block text-xs">1. Verifikasi Lembar Fisik</span>
                      <p className="text-[10px] text-slate-600">Pastikan lembar blangko telah ditandatangani oleh Kader Posyandu dan Kepala Desa/Kelurahan setempat.</p>
                    </div>

                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                      <span className="font-black text-slate-900 block text-xs">2. Input Ke Aplikasi Orbit Gizi</span>
                      <p className="text-[10px] text-slate-600">Saat berada di lokasi yang memiliki jaringan internet, Bidan Desa / Nakes membuka menu <strong>Pusat Input Center</strong> dan memasukkan data sesuai lembar fisik.</p>
                    </div>

                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                      <span className="font-black text-slate-900 block text-xs">3. Sinkronisasi Google Sheets</span>
                      <p className="text-[10px] text-slate-600">Tekan tombol "Sinkronkan Google Sheets" untuk memperbarui database terpusat Dinas Kesehatan Nagekeo.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Bab 4: Intervensi MBG, PMT & Form Offline</span>
                <span>Halaman 14 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 15: BAB 5 (BAGIAN 1) ==================== */}
            <div className="manual-page bg-white">
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">BAB 5 • GOOGLE SHEETS, ANALISIS PIVOT & PORTOFOLIO</span>
                    <h2 className="text-base font-black text-slate-900">5.1 Integrasi Google Sheets (8 Tab Data Lengkap)</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 15</span>
                </div>

                <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <p>
                    Orbit Gizi System v2.5 terhubung langsung secara real-time dengan Google Sheets API untuk menyediakan salinan cadangan otomatis dan kemudahan pengolahan data spreadsheet bagi Dinas Kesehatan.
                  </p>

                  <div className="space-y-1 font-mono text-[10px]">
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex justify-between font-bold text-slate-900">
                      <span>1. Tab 'Ringkasan Indeks'</span>
                      <span className="text-blue-700">Skor total 5 Pilar & Indikator Kinerja</span>
                    </div>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex justify-between font-bold text-slate-900">
                      <span>2. Tab 'Data Desa'</span>
                      <span className="text-blue-700">Data Risiko Wilayah & Posyandu Aktif</span>
                    </div>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex justify-between font-bold text-slate-900">
                      <span>3. Tab 'Penerima MBG'</span>
                      <span className="text-blue-700">Database Balita & Status Gizi WHO</span>
                    </div>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex justify-between font-bold text-slate-900">
                      <span>4. Tab 'Ibu Hamil'</span>
                      <span className="text-blue-700">Data ANC, LiLA & Risiko KEK</span>
                    </div>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex justify-between font-bold text-slate-900">
                      <span>5. Tab 'Ibu Menyusui'</span>
                      <span className="text-blue-700">Data PNC & ASI Eksklusif</span>
                    </div>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex justify-between font-bold text-slate-900">
                      <span>6. Tab 'Catatan Timbang'</span>
                      <span className="text-blue-700">Riwayat Antropometri Bulanan</span>
                    </div>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex justify-between font-bold text-slate-900">
                      <span>7. Tab 'Analitik Pengunjung'</span>
                      <span className="text-blue-700">Log Akses Real-Time & Perangkat</span>
                    </div>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex justify-between font-bold text-slate-900">
                      <span>8. Tab 'Audit Log Operator'</span>
                      <span className="text-blue-700">Catatan Tindakan & Perubahan Data</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Bab 5: Google Sheets & Pivot Analysis</span>
                <span>Halaman 15 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 16: BAB 5 (BAGIAN 2) ==================== */}
            <div className="manual-page bg-white">
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">BAB 5 • GOOGLE SHEETS, ANALISIS PIVOT & PORTOFOLIO</span>
                    <h2 className="text-base font-black text-slate-900">5.2 Analisis Pivot Lintas Wilayah & Matriks 5 Pilar</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 16</span>
                </div>

                <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <p>
                    Modul <strong>Analisis Pivot & Matriks 5 Pilar</strong> dirancang khusus untuk pimpinan Dinas Kesehatan dan Bappeda guna mengevaluasi kinerja intervensi gizi terpadu.
                  </p>

                  <div className="space-y-1.5">
                    <h4 className="font-black text-slate-900 uppercase text-xs">Ringkasan 5 Pilar Intervensi Stunting:</h4>
                    <div className="grid grid-cols-1 gap-1.5 text-[11px]">
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg font-semibold">
                        <strong>Pilar 1 (e-PPGBM Sync):</strong> Komitmen kepemimpinan & validitas sinkronisasi data gizi.
                      </div>
                      <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-lg font-semibold">
                        <strong>Pilar 2 (Kolaborasi Lembaga):</strong> Sinergi Dinkes, BGN, PKK, Pemdes, & Puskesmas.
                      </div>
                      <div className="p-2 bg-purple-50 border border-purple-200 rounded-lg font-semibold">
                        <strong>Pilar 3 (Ketahanan Data):</strong> Keberadaan dashboard online & pembaruan data real-time.
                      </div>
                      <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg font-semibold">
                        <strong>Pilar 4 (Cakupan Intervensi):</strong> Realisasi distribusi MBG, PMT Pemulihan, & kunjungan rumah.
                      </div>
                      <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg font-semibold">
                        <strong>Pilar 5 (Dampak Penurunan):</strong> Tren penurunan stunting/wasting & akurasi sasaran.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Bab 5: Google Sheets & Pivot Analysis</span>
                <span>Halaman 16 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 17: BAB 5 (BAGIAN 3) ==================== */}
            <div className="manual-page bg-white">
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">BAB 5 • GOOGLE SHEETS, ANALISIS PIVOT & PORTOFOLIO</span>
                    <h2 className="text-base font-black text-slate-900">5.3 Portofolio Eksekutif 4 Halaman untuk Pimpinan</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 17</span>
                </div>

                <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <p>
                    Aplikasi menyediakan fitur unggulan pencetakan <strong>Portofolio Eksekutif Resmi 4 Halaman</strong> yang siap diserahkan kepada Bupati Nagekeo, Kepala Dinas Kesehatan, dan DPRD.
                  </p>

                  <div className="space-y-1.5">
                    <h4 className="font-black text-slate-900 uppercase text-xs">Struktur 4 Halaman Portofolio Eksekutif:</h4>
                    <ol className="list-decimal list-inside space-y-1 pl-2 text-slate-700 text-[11px]">
                      <li><strong>Halaman 1 (Sampul & Executive Summary):</strong> Judul laporan resmi, periode data, dan skor indeks kesehatan daerah.</li>
                      <li><strong>Halaman 2 (Evaluasi 5 Pilar Intervensi):</strong> Tabel perincian skor pilar 1 s/d 5 serta grafik Radar Chart.</li>
                      <li><strong>Halaman 3 (Grafik Analisis & Rekap Wilayah):</strong> Peta sebaran stunting, grafik distribusi MBG, dan tabel per kecamatan.</li>
                      <li><strong>Halaman 4 (Rekomendasi Kebijakan & Pengesahan):</strong> Lembar kesimpulan dan tanda tangan resmi Kepala Dinas Kesehatan Nagekeo.</li>
                    </ol>
                  </div>

                  <p className="text-[11px] text-slate-500 italic">
                    * Untuk mencetak Portofolio Eksekutif, klik menu 'Portofolio' di sidebar admin lalu tekan tombol 'Cetak PDF Portofolio (4 Hal)'.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Bab 5: Google Sheets & Pivot Analysis</span>
                <span>Halaman 17 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 18: BAB 5 (BAGIAN 4) ==================== */}
            <div className="manual-page bg-white">
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">BAB 5 • GOOGLE SHEETS, ANALISIS PIVOT & PORTOFOLIO</span>
                    <h2 className="text-base font-black text-slate-900">5.4 Fitur Ekspor Laporan, Audit Log & Keamanan SPBE</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 18</span>
                </div>

                <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <p>
                    Sebagai bagian dari penerapan Sistem Pemerintahan Berbasis Elektronik (SPBE), Orbit Gizi System dilengkapi dengan proteksi data kesehatan warga sesuai standar regulasi nasional.
                  </p>

                  <div className="space-y-2">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                      <span className="font-black text-slate-900 block text-xs">1. Ekspor Data Format Excel & PDF</span>
                      <p className="text-[10px] text-slate-600">Seluruh tabel data balita, ibu hamil, dan penerima MBG dapat diunduh kapan saja dalam format CSV/Excel atau PDF siap cetak.</p>
                    </div>

                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                      <span className="font-black text-slate-900 block text-xs">2. Proteksi Privasi NIK & Identitas</span>
                      <p className="text-[10px] text-slate-600">Pada Tampilan Dashboard Publik, NIK warga disamarkan secara otomatis untuk menjaga privasi data kesehatan individu.</p>
                    </div>

                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                      <span className="font-black text-slate-900 block text-xs">3. Pemeliharaan Server & Backup Cloud</span>
                      <p className="text-[10px] text-slate-600">Database disimpan secara terenkripsi di Cloud Container dan direplikasi berkala ke Google Drive resmi Dinas Kesehatan.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Bab 5: Google Sheets & Pivot Analysis</span>
                <span>Halaman 18 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 19: LAMPIRAN A ==================== */}
            <div className="manual-page bg-white">
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">LAMPIRAN A • STANDAR OPERASIONAL PROSEDUR</span>
                    <h2 className="text-base font-black text-slate-900">SOP Pelaksanaan Posyandu & Pelaporan Bulanan</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 19</span>
                </div>

                <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="font-black text-slate-900 block text-xs">Checklist H-1 Sebelum Hari H Posyandu:</span>
                    <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5 pl-1">
                      <li>Pastikan timbangan digital terkalibrasi nol (0.00 kg) dan stadiometer/infantometer terpasang lurus.</li>
                      <li>Cetak lembar Form Blangko Manual 15 Baris jika posyandu berada di wilayah blank spot.</li>
                      <li>Siapkan paket Makanan Bergizi Gratis (MBG) / PMT Pemulihan yang akan disalurkan.</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="font-black text-slate-900 block text-xs">Checklist Pelaksanaan Hari H Posyandu:</span>
                    <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5 pl-1">
                      <li>Pendaftaran balita/ibu hamil menggunakan NIK 16 digit.</li>
                      <li>Pengukuran antropometri BB, TB, dan LiLA dengan ketelitian 1 angka desimal.</li>
                      <li>Pencatatan langsung pada aplikasi Orbit Gizi atau lembar blangko kertas.</li>
                      <li>Penyaluran paket makanan bergizi dan pencatatan konfirmasi penerimaan.</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="font-black text-slate-900 block text-xs">Jadwal Pelaporan Bulanan:</span>
                    <p className="text-[11px] text-slate-600">
                      Seluruh data hasil penimbangan paling lambat dimasukkan dan disinkronkan ke Google Sheets pada tanggal 25 setiap bulannya.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Lampiran A: Standar Operasional Prosedur</span>
                <span>Halaman 19 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 20: LAMPIRAN B ==================== */}
            <div className="manual-page bg-white">
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">LAMPIRAN B • FAQ, TROUBLESHOOTING & HELPDESK</span>
                    <h2 className="text-base font-black text-slate-900">FAQ, Bantuan Teknis & Lembar Pengesahan Resmi</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 20</span>
                </div>

                <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <div className="space-y-2">
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="font-bold text-slate-900 block text-[11px]">Q1: Apa yang dilakukan jika NIK Balita tidak ditemukan di e-PPGBM?</span>
                      <p className="text-[10px] text-slate-600">Tetap daftarkan balita menggunakan NIK sementara yang tertera pada Kartu Keluarga (KK) orang tua, lalu lakukan koordinasi perbaikan ke Dukcapil Nagekeo.</p>
                    </div>

                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="font-bold text-slate-900 block text-[11px]">Q2: Bagaimana jika terjadi kesalahan input angka Berat Badan?</span>
                      <p className="text-[10px] text-slate-600">Masuk ke menu Data Input Center, cari nama sasaran, tekan tombol 'Edit', lalu perbarui angka antropometri dan simpan kembali.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                    <span className="font-black text-blue-900 block text-xs">Kontak Layanan Helpdesk & Pengaduan Gizi:</span>
                    <p className="text-[11px] text-blue-800">
                      Seksi Kesehatan Keluarga & Gizi Masyarakat — Dinas Kesehatan Kabupaten Nagekeo<br />
                      Jl. Mawar No. 12, Mbay, Kabupaten Nagekeo • WhatsApp Hotline: 0812-3456-7890 • Email: dinkes@nagekeokab.go.id
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-4 text-center text-[10px] font-bold text-slate-900">
                    <div>
                      <span>Mengetahui,<br />Kepala Dinas Kesehatan Nagekeo</span>
                      <div className="h-10"></div>
                      <span className="underline">dr. Paulina M. Nage, M.Kes</span><br />
                      <span className="text-slate-500 font-normal">NIP. 19780412 200501 2 004</span>
                    </div>
                    <div>
                      <span>Disusun Oleh,<br />Tim Pengembang SPBE & IT Gizi</span>
                      <div className="h-10"></div>
                      <span className="underline">Tim Orbit Gizi System v2.5</span><br />
                      <span className="text-slate-500 font-normal">Tahun Anggaran 2026</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Orbit Gizi System v2.5 • Buku Panduan Resmi</span>
                <span>Halaman 20 / 20</span>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-slate-600">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            <span>Buku Panduan 5 Bab & 20 Halaman Presisi siap dicetak dengan pilihan mode Portrait / Landscape.</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl cursor-pointer"
            >
              Tutup Jendela
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center space-x-2 cursor-pointer shadow-md"
            >
              <Download className="h-4 w-4" />
              <span>Unduh / Cetak PDF (20 Halaman)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
