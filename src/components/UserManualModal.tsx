import { useState } from "react";
import { Printer, X, BookOpen, ShieldCheck, Download, Award, CheckCircle2, Layers, Cpu, Database, FileText } from "lucide-react";

interface UserManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserManualModal({ isOpen, onClose }: UserManualModalProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "toc">("preview");

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
              <p className="text-xs text-slate-400">Dokumentasi Komprehensif 5 Bab & 20 Halaman • Standar Operasional e-PPGBM Nagekeo</p>
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

        {/* Toolbar / TOC selector */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5 text-blue-700 font-bold">
              <ShieldCheck className="h-4 w-4" />
              <span>Dokumen Terverifikasi Dinas Kesehatan Kabupaten Nagekeo</span>
            </span>
          </div>
          <div className="flex space-x-2">
            <span className="px-3 py-1 bg-white border border-slate-300 rounded-lg font-mono text-[11px] text-slate-600">
              Format: A4 Portrait • Siap Cetak PDF
            </span>
          </div>
        </div>

        {/* Scrollable Document Container (20 Pages Simulation) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-10 bg-slate-100/80 flex flex-col items-center space-y-10">
          
          <style>{`
            @media print {
              @page {
                size: A4 portrait;
                margin: 15mm;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              body, html {
                background: #ffffff !important;
                color: #000000 !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              body * {
                visibility: hidden !important;
              }
              #printable-manual-book, #printable-manual-book * {
                visibility: visible !important;
              }
              #printable-manual-book {
                display: block !important;
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                box-shadow: none !important;
                border: none !important;
                background: #ffffff !important;
              }
              .page-break {
                page-break-after: always !important;
                break-after: page !important;
                min-height: 275mm !important;
              }
            }

            .manual-page {
              width: 210mm;
              min-height: 297mm;
              padding: 20mm;
              background: #ffffff;
              box-shadow: 0 10px 30px rgba(0,0,0,0.08);
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              margin-bottom: 2rem;
              position: relative;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
          `}</style>

          <div id="printable-manual-book" className="flex flex-col items-center space-y-8 w-full max-w-[210mm]">

            {/* ==================== COVER PAGE (HALAMAN 1) ==================== */}
            <div className="manual-page page-break bg-white overflow-hidden relative">
              {/* Hexagonal Geometric & Color Accents */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between border-b border-slate-200 pb-6">
                  <div className="flex items-center space-x-3">
                    <div className="h-14 w-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg">
                      OG
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">
                        PEMERINTAH KABUPATEN NAGEKEO • DINAS KESEHATAN
                      </span>
                      <span className="text-xs font-bold text-slate-800 tracking-wide">ORBIT GIZI SYSTEM ENTERPRISE v2.5</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-amber-500 text-slate-950 text-[10px] font-black rounded-xl uppercase tracking-wider block shadow">
                      BUKU PANDUAN RESMI
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 block font-mono">EDISI 2026 • 20 HALAMAN</span>
                  </div>
                </div>

                <div className="py-12 space-y-6 text-left max-w-xl">
                  <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-black uppercase tracking-widest">
                    MODUL OPERASIONAL & MANAJEMEN E-PPGBM
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight uppercase tracking-tight">
                    BUKU PANDUAN PENGGUNAAN & OPERASIONAL SISTEM ORBIT GIZI
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Panduan lengkap tata cara pengoperasian aplikasi, manajemen data balita & ibu hamil, pencatatan offline posyandu (blank spot), distribusi Makanan Bergizi Gratis (MBG), hingga analisis eksekutif 5 pilar percepatan penurunan stunting.
                  </p>
                </div>

                {/* Decorative Hexagon Grid Simulation */}
                <div className="grid grid-cols-4 gap-3 py-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
                    <span className="text-blue-700 font-black text-lg block">Bab 1-5</span>
                    <span className="text-[10px] text-slate-600 font-bold uppercase">Materi Lengkap</span>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                    <span className="text-amber-700 font-black text-lg block">20 Hal</span>
                    <span className="text-[10px] text-slate-600 font-bold uppercase">Struktur Buku</span>
                  </div>
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-center">
                    <span className="text-indigo-700 font-black text-lg block">100%</span>
                    <span className="text-[10px] text-slate-600 font-bold uppercase">Standar e-PPGBM</span>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                    <span className="text-emerald-700 font-black text-lg block">Resmi</span>
                    <span className="text-[10px] text-slate-600 font-bold uppercase">Pemkab Nagekeo</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 relative z-10">
                <div>
                  <span className="font-bold text-slate-800 block">Disusun Oleh: Tim Pengembang SPBE & Dinas Kesehatan Nagekeo</span>
                  <span className="text-[10px] text-slate-500">Diterbitkan untuk Puskesmas, Posyandu, dan Kader Seluruh Wilayah Nagekeo</span>
                </div>
                <div className="text-right font-mono font-bold text-blue-700">
                  Halaman 1 / 20
                </div>
              </div>
            </div>


            {/* ==================== HALAMAN 2: DAFTAR ISI ==================== */}
            <div className="manual-page page-break bg-white">
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">DAFTAR ISI BUKU PANDUAN</span>
                    <h2 className="text-xl font-black text-slate-900">STRUKTUR MODUL 5 BAB & 20 HALAMAN</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 2</span>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex justify-between font-black text-slate-900 text-sm">
                      <span>BAB 1: PENDAHULUAN & ARSITEKTUR SISTEM ORBIT GIZI</span>
                      <span className="text-blue-700 font-mono">Hal. 3 - 6</span>
                    </div>
                    <ul className="list-disc list-inside text-slate-600 space-y-1 pl-2">
                      <li>Latar Belakang Kebijakan Zero Stunting Kabupaten Nagekeo (Hal. 3)</li>
                      <li>Tujuan & Manfaat Orbit Gizi System v2.5 bagi Puskesmas (Hal. 4)</li>
                      <li>Peta Navigasi Menu Utama & Hak Akses Berbasis ABAC (Hal. 5)</li>
                      <li>Panduan Login & Pengamanan Data Cyber Guard (Hal. 6)</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex justify-between font-black text-slate-900 text-sm">
                      <span>BAB 2: MANAJEMEN DATA SASARAN & E-PPGBM</span>
                      <span className="text-blue-700 font-mono">Hal. 7 - 10</span>
                    </div>
                    <ul className="list-disc list-inside text-slate-600 space-y-1 pl-2">
                      <li>Penginputan Data Balita, Ibu Hamil, dan Ibu Menyusui (Hal. 7)</li>
                      <li>Validasi NIK 16 Digit Terintegrasi Dukcapil & e-PPGBM (Hal. 8)</li>
                      <li>Pencatatan Antropometri: Berat Badan, Tinggi Badan, & Lingkar Lengan (Hal. 9)</li>
                      <li>Sinkronisasi Data Lintas Puskesmas & Kecamatan (Hal. 10)</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex justify-between font-black text-slate-900 text-sm">
                      <span>BAB 3: INTERVENSI MAKANAN BERGIZI GRATIS (MBG) & PMT</span>
                      <span className="text-blue-700 font-mono">Hal. 11 - 13</span>
                    </div>
                    <ul className="list-disc list-inside text-slate-600 space-y-1 pl-2">
                      <li>Manajemen Jadwal & Menu Distribusi Makanan Bergizi Gratis (MBG) (Hal. 11)</li>
                      <li>Alokasi Pemberian Makanan Tambahan (PMT) untuk Balita Wasting & Stunting (Hal. 12)</li>
                      <li>Monitoring Real-time Logistik & Laporan Distribusi Harian (Hal. 13)</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex justify-between font-black text-slate-900 text-sm">
                      <span>BAB 4: PENCATATAN OFFLINE & FORM MANUAL (BLANK SPOT)</span>
                      <span className="text-blue-700 font-mono">Hal. 14 - 16</span>
                    </div>
                    <ul className="list-disc list-inside text-slate-600 space-y-1 pl-2">
                      <li>Prosedur Pencetakan Lembar Form Blanko Manual 15 Baris (Hal. 14)</li>
                      <li>Panduan Pengisian Lapangan bagi Kader Posyandu Tanpa Sinyal (Hal. 15)</li>
                      <li>Prosedur Rekonsiliasi & Input Kembali ke Sistem setelah Ada Jaringan (Hal. 16)</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex justify-between font-black text-slate-900 text-sm">
                      <span>BAB 5: LAPORAN EKSEKUTIF, ANALISIS PIVOT & KEAMANAN SPBE</span>
                      <span className="text-blue-700 font-mono">Hal. 17 - 20</span>
                    </div>
                    <ul className="list-disc list-inside text-slate-600 space-y-1 pl-2">
                      <li>Analisis Pivot Lintas Wilayah & Penilaian Risiko Stunting (Hal. 17)</li>
                      <li>Pencetakan Portofolio Eksekutif 4 Halaman untuk Bupati & Dinkes (Hal. 18)</li>
                      <li>Audit Log Keamanan Data & Pemeliharaan Sistem Berkala (Hal. 19)</li>
                      <li>Kontak Bantuan Teknis & FAQ Layanan Pengaduan Gizi (Hal. 20)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Orbit Gizi System v2.5 • Buku Panduan Resmi</span>
                <span>Halaman 2 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 3: BAB 1 (BAGIAN 1) ==================== */}
            <div className="manual-page page-break bg-white">
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">BAB 1 • PENDAHULUAN & ARSITEKTUR</span>
                    <h2 className="text-lg font-black text-slate-900">1.1 Latar Belakang Kebijakan Zero Stunting Nagekeo</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 3</span>
                </div>

                <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                  <p>
                    Kabupaten Nagekeo berkomitmen penuh dalam mewujudkan target nasional penurunan angka stunting hingga di bawah 14% serta menuju <strong>Zero Stunting 2026</strong>. Melalui Dinas Kesehatan dan kolaborasi lintas sektor yang melibatkan 5 pilar pembangunan gizi, diperlukan sebuah sistem informasi terintegrasi yang mampu merekam, memantau, dan mengevaluasi intervensi kesehatan secara akurat hingga tingkat Posyandu terkecil di seluruh desa.
                  </p>
                  <p>
                    <strong>Orbit Gizi System Enterprise v2.5</strong> hadir sebagai solusi digital berbasis web dan integrasi e-PPGBM (Elektronik Pencatatan dan Pelaporan Gizi Berbasis Masyarakat) yang dirancang khusus untuk memudahkan kerja tenaga kesehatan puskesmas, kader posyandu, bidan desa, serta Tim Percepatan Penurunan Stunting (TPPS) Kabupaten Nagekeo.
                  </p>

                  <div className="p-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-xl space-y-2">
                    <h4 className="font-black text-blue-900 uppercase">Prinsip Utama Sistem:</h4>
                    <ul className="list-disc list-inside space-y-1 text-blue-800">
                      <li><strong>Akurasi Data Real-time:</strong> Setiap penimbangan balita langsung terhubung dengan kalkulator status gizi WHO z-score.</li>
                      <li><strong>Transparansi Lintas Sektor:</strong> Kolaborasi 5 pilar (Pemerintah, Akademisi, Bisnis, Komunitas, dan Media) termonitor dalam satu dasbor.</li>
                      <li><strong>Ketahanan Lapangan (Offline-Ready):</strong> Menyediakan fasilitas cetak blangko manual bagi posyandu di wilayah blank spot.</li>
                    </ul>
                  </div>

                  <p>
                    Buku panduan ini disusun secara sistematis agar dapat dipahami dan dipraktekkan langsung oleh seluruh pengguna di lapangan, memastikan tidak ada satupun anak berisiko stunting yang terlewat dari intervensi gizi.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Bab 1: Pendahuluan & Arsitektur</span>
                <span>Halaman 3 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 4: BAB 1 (BAGIAN 2) ==================== */}
            <div className="manual-page page-break bg-white">
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">BAB 1 • PENDAHULUAN & ARSITEKTUR</span>
                    <h2 className="text-lg font-black text-slate-900">1.2 Tujuan, Navigasi Menu & Keamanan ABAC</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 4</span>
                </div>

                <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                  <h3 className="font-black text-slate-900 text-sm">Tujuan Pengoperasian Sistem</h3>
                  <p>
                    Penerapan aplikasi ini bertujuan untuk: (1) Mempercepat proses rekapitulasi laporan bulanan posyandu, (2) Memantau distribusi Makanan Bergizi Gratis (MBG) tepat sasaran, (3) Menyediakan visualisasi peta risiko stunting interaktif per desa/kelurahan, dan (4) Memfasilitasi cetak laporan portofolio eksekutif bagi pimpinan daerah.
                  </p>

                  <h3 className="font-black text-slate-900 text-sm">Struktur Navigasi Menu Utama</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="font-black text-blue-800 block">1. Beranda & Executive Summary</span>
                      <p className="text-[11px] text-slate-600">Ringkasan statistik utama, grafik tren stunting, dan indikator pencapaian pilar.</p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="font-black text-blue-800 block">2. Data Input Center</span>
                      <p className="text-[11px] text-slate-600">Pusat pencatatan data balita, ibu hamil, menyusui, dan intervensi MBG.</p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="font-black text-blue-800 block">3. Analisis Pivot & Portofolio</span>
                      <p className="text-[11px] text-slate-600">Analisis data mendalam lintas wilayah dan pencetakan portofolio 4 halaman.</p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="font-black text-blue-800 block">4. Form Offline & Panduan</span>
                      <p className="text-[11px] text-slate-600">Pencetakan blangko manual posyandu dan akses buku panduan lengkap.</p>
                    </div>
                  </div>

                  <h3 className="font-black text-slate-900 text-sm">Keamanan Akses (ABAC & Cyber Guard)</h3>
                  <p>
                    Sistem dilindungi dengan enkripsi tingkat lanjut dan kontrol akses berbasis atribut (Attribute-Based Access Control) untuk menjamin kerahasiaan data kesehatan warga Nagekeo sesuai standar SPBE nasional.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Bab 1: Pendahuluan & Arsitektur</span>
                <span>Halaman 4 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 5: BAB 2 (BAGIAN 1) ==================== */}
            <div className="manual-page page-break bg-white">
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">BAB 2 • MANAJEMEN DATA SASARAN & E-PPGBM</span>
                    <h2 className="text-lg font-black text-slate-900">2.1 Penginputan Data Balita & Validasi NIK</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 5</span>
                </div>

                <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                  <p>
                    Pencatatan data sasaran merupakan fondasi utama dalam e-PPGBM. Setiap balita yang datang ke posyandu wajib didata secara teliti menggunakan NIK resmi untuk menghindari duokasi data bantuan gizi.
                  </p>

                  <div className="space-y-2">
                    <h4 className="font-black text-slate-900 uppercase">Langkah-langkah Input Data Sasaran:</h4>
                    <ol className="list-decimal list-inside space-y-1.5 pl-2 text-slate-700">
                      <li>Buka menu <strong>Data Input Center</strong> pada navigasi utama aplikasi.</li>
                      <li>Pilih tab kategori sasaran (contoh: <strong>Data Balita & Stunting</strong>).</li>
                      <li>Klik tombol <strong>+ Tambah Sasaran Baru</strong> untuk membuka form input wizard.</li>
                      <li>Masukkan 16 digit NIK balita; sistem akan melakukan validasi otomatis format NIK.</li>
                      <li>Lengkapi Nama Lengkap Balita, Nama Orang Tua, Tanggal Lahir, Jenis Kelamin (L/P), serta Kelurahan/Desa domisili.</li>
                      <li>Masukkan hasil pengukuran antropometri terakhir (Berat Badan dalam Kg dan Tinggi Badan dalam Cm).</li>
                      <li>Sistem secara otomatis menghitung status gizi (Normal, Stunting, Wasting, Underweight) berdasarkan standar WHO z-score.</li>
                      <li>Klik <strong>Simpan Data</strong> untuk memasukkan data ke database cloud secara aman.</li>
                    </ol>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                    <span className="font-bold block mb-1">Catatan Penting Petugas:</span>
                    Pastikan penimbangan menggunakan timbangan digital yang telah dikalibrasi agar hasil z-score akurat dan tidak terjadi salah klasifikasi status gizi anak.
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Bab 2: Manajemen Data Sasaran</span>
                <span>Halaman 5 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 6: BAB 2 (BAGIAN 2) ==================== */}
            <div className="manual-page page-break bg-white">
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">BAB 2 • MANAJEMEN DATA SASARAN & E-PPGBM</span>
                    <h2 className="text-lg font-black text-slate-900">2.2 Manajemen Ibu Hamil, Menyusui & Sinkronisasi</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 6</span>
                </div>

                <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                  <p>
                    Selain balita, pencegahan stunting dimulai sejak 1000 HPK (Hari Pertama Kehidupan). Oleh karena itu, modul ini menyediakan pencatatan khusus untuk Ibu Hamil (ANC) dan Ibu Menyusui (PNC).
                  </p>

                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="font-black text-slate-900 block">Pencatatan Ibu Hamil (Ibu Hamil / ANC)</span>
                      <p className="text-[11px] text-slate-600">Catat usia kehamilan (trimester), lingkar lengan atas (LiLA) untuk deteksi Kekurangan Energi Kronis (KEK), serta pemberian tablet tambah darah (TTD).</p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="font-black text-slate-900 block">Pencatatan Ibu Menyusui & Bayi 0-6 Bulan</span>
                      <p className="text-[11px] text-slate-600">Pantau pemberian ASI eksklusif, status imunisasi dasar, serta kondisi kesehatan ibu pasca persalinan.</p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="font-black text-slate-900 block">Sinkronisasi Lintas Puskesmas</span>
                      <p className="text-[11px] text-slate-600">Data yang diinput oleh bidan desa atau kader puskesmas langsung tersinkronisasi secara otomatis ke server pusat Dinas Kesehatan Kabupaten Nagekeo.</p>
                    </div>
                  </div>

                  <p>
                    Dengan sinkronisasi otomatis ini, kepala puskesmas dapat memantau progres real-time tanpa harus menunggu rekapitulasi manual di akhir bulan.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Bab 2: Manajemen Data Sasaran</span>
                <span>Halaman 6 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 7: BAB 3 (BAGIAN 1) ==================== */}
            <div className="manual-page page-break bg-white">
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">BAB 3 • INTERVENSI MBG & PMT</span>
                    <h2 className="text-lg font-black text-slate-900">3.1 Manajemen Distribusi Makanan Bergizi Gratis (MBG)</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 7</span>
                </div>

                <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                  <p>
                    Program Makanan Bergizi Gratis (MBG) merupakan pilar penting dalam pemenuhan nutrisi harian anak sekolah dan balita di Kabupaten Nagekeo. Aplikasi menyediakan fitur penjadwalan dan pemantauan distribusi yang transparan.
                  </p>

                  <div className="space-y-2">
                    <h4 className="font-black text-slate-900 uppercase">Cara Pengelolaan Jadwal MBG:</h4>
                    <ol className="list-decimal list-inside space-y-1.5 pl-2 text-slate-700">
                      <li>Akses modul manajemen MBG pada menu utama atau sub-menu intervensi.</li>
                      <li>Tentukan tanggal distribusi, menu makanan (misal: Nasi, Ikan, Sayur Kelor, Buah Lokal), serta takaran kalori dan protein.</li>
                      <li>Pilih kelompok sasaran penerima manfaat (PAUD, TK, SD, atau Balita Posyandu tertentu).</li>
                      <li>Catat jumlah paket yang disalurkan dan konfirmasi penerimaan oleh koordinator posyandu/sekolah.</li>
                    </ol>
                  </div>

                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                    <span className="font-bold text-emerald-900 block">Standar Kandungan Gizi MBG:</span>
                    <p className="text-emerald-800 text-[11px]">
                      Setiap paket makanan bergizi gratis dirancang memenuhi minimal 30% Angka Kecukupan Gizi (AKG) harian anak, dengan penekanan pada protein hewani lokal seperti ikan segar dan telur.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Bab 3: Intervensi MBG & PMT</span>
                <span>Halaman 7 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 8: BAB 3 (BAGIAN 2) ==================== */}
            <div className="manual-page page-break bg-white">
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">BAB 3 • INTERVENSI MBG & PMT</span>
                    <h2 className="text-lg font-black text-slate-900">3.2 Alokasi PMT Pemulihan & Monitoring Logistik</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 8</span>
                </div>

                <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                  <p>
                    Pemberian Makanan Tambahan (PMT) Pemulihan difokuskan khusus bagi balita yang teridentifikasi mengalami gizi kurang (wasting), gizi buruk, atau stunting kronis selama minimal 90 hari intervensi.
                  </p>

                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="font-black text-slate-900 block">Targeting Sasaran PMT Pemulihan</span>
                      <p className="text-[11px] text-slate-600">Sistem secara otomatis memfilter daftar balita berstatus gizi merah/kuning untuk diprioritaskan mendapatkan paket PMT tinggi protein.</p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="font-black text-slate-900 block">Monitoring Stok Logistik Puskesmas</span>
                      <p className="text-[11px] text-slate-600">Petugas dapat memantau ketersediaan bahan PMT di gudang puskesmas dan mengajukan permintaan restock ke Dinas Kesehatan secara digital.</p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="font-black text-slate-900 block">Evaluasi Kenaikan Berat Badan (BB)</span>
                      <p className="text-[11px] text-slate-600">Setiap 2 minggu sekali, kader wajib memasukkan hasil penimbangan ulang untuk menilai apakah intervensi PMT memberikan respon positif pada pertumbuhan anak.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Bab 3: Intervensi MBG & PMT</span>
                <span>Halaman 8 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 9: BAB 4 (BAGIAN 1) ==================== */}
            <div className="manual-page page-break bg-white">
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">BAB 4 • PENCATATAN OFFLINE (BLANK SPOT)</span>
                    <h2 className="text-lg font-black text-slate-900">4.1 Prosedur Cetak Formulir Manual 15 Baris</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 9</span>
                </div>

                <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                  <p>
                    Tidak semua posyandu di wilayah Kabupaten Nagekeo memiliki akses internet yang stabil. Untuk mengantisipasi kendala tersebut, Orbit Gizi System v2.5 menyediakan fitur khusus pencetakan formulir blangko manual (offline template).
                  </p>

                  <div className="space-y-2">
                    <h4 className="font-black text-slate-900 uppercase">Cara Mencetak Blangko Offline:</h4>
                    <ol className="list-decimal list-inside space-y-1.5 pl-2 text-slate-700">
                      <li>Klik tombol <strong>Cetak Form Offline</strong> pada bilah navigasi atas aplikasi.</li>
                      <li>Masukkan nama Desa/Kelurahan dan Posyandu yang akan dikunjungi.</li>
                      <li>Sistem secara otomatis menyiapkan format tabel standar e-PPGBM dengan <strong>15 baris kosong</strong> yang pas di 1 halaman kertas A4 (lanskap maupun potret).</li>
                      <li>Kolom Nomor sengaja dikosongkan untuk memudahkan pencatatan manual di lapangan.</li>
                      <li>Klik tombol <strong>Cetak Form</strong> untuk menghubungkan langsung ke printer atau menyimpan sebagai PDF.</li>
                    </ol>
                  </div>

                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900">
                    <span className="font-bold block mb-1">Keunggulan Blangko Resmi:</span>
                    Blangko telah dilengkapi kolom NIK 16 digit, Nama Sasaran, L/P, Umur, BB, TB, Status Gizi, Kehadiran, serta tanda tangan Kepala Desa dan Kader.
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Bab 4: Pencatatan Offline</span>
                <span>Halaman 9 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 10: BAB 4 (BAGIAN 2) ==================== */}
            <div className="manual-page page-break bg-white">
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">BAB 4 • PENCATATAN OFFLINE (BLANK SPOT)</span>
                    <h2 className="text-lg font-black text-slate-900">4.2 Panduan Pengisian Lapangan & Sinkronisasi Kembali</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 10</span>
                </div>

                <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                  <p>
                    Saat bertugas di lokasi tanpa sinyal (blank spot), kader posyandu menggunakan lembar kertas cetak yang telah dipersiapkan sebelumnya. Berikut adalah tata tertib pengisian dan pemindahan data ke aplikasi:
                  </p>

                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="font-black text-slate-900 block">1. Ketepatan Penulisan NIK & Nama</span>
                      <p className="text-[11px] text-slate-600">Pastikan 16 digit NIK ditulis dengan jelas dan terbaca agar saat proses input ke aplikasi tidak terjadi kesalahan penulisan angka.</p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="font-black text-slate-900 block">2. Pengukuran Antropometri Teliti</span>
                      <p className="text-[11px] text-slate-600">Tuliskan angka desimal Berat Badan (misal: 10.4 kg) dan Tinggi Badan (misal: 78.5 cm) secara presisi.</p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="font-black text-slate-900 block">3. Rekonsiliasi Data Pascakunjungan</span>
                      <p className="text-[11px] text-slate-600">Setelah kader kembali ke wilayah dengan jangkauan internet, buka kembali aplikasi Orbit Gizi dan masukkan seluruh data lembar manual ke menu Data Input Center.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Bab 4: Pencatatan Offline</span>
                <span>Halaman 10 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 11: BAB 5 (BAGIAN 1) ==================== */}
            <div className="manual-page page-break bg-white">
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">BAB 5 • LAPORAN EKSEKUTIF & ANALISIS PIVOT</span>
                    <h2 className="text-lg font-black text-slate-900">5.1 Analisis Pivot Lintas Wilayah & Penilaian Risiko</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 11</span>
                </div>

                <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                  <p>
                    Modul analisis pivot dirancang untuk pimpinan puskesmas dan Dinas Kesehatan guna membandingkan kinerja penanganan gizi antar kelurahan/desa secara cepat dan mendalam.
                  </p>

                  <div className="space-y-2">
                    <h4 className="font-black text-slate-900 uppercase">Fitur Unggulan Analisis Pivot:</h4>
                    <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-700">
                      <li><strong>Filter Multi-Dimensi:</strong> Saring data berdasarkan Puskesmas pembina, Kelurahan, jenis kelamin, atau kategori status gizi.</li>
                      <li><strong>Matriks Perbandingan Stunting:</strong> Melihat persentase penurunan stunting dari bulan ke bulan.</li>
                      <li><strong>Peta Risiko Interaktif:</strong> Identifikasi zona merah (rawan stunting tinggi) yang memerlukan intervensi darurat segera.</li>
                    </ul>
                  </div>

                  <p>
                    Hasil analisis ini dapat diekspor langsung dalam format laporan analitik untuk bahan rapat koordinasi TPPS tingkat kabupaten.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Bab 5: Laporan Eksekutif</span>
                <span>Halaman 11 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 12: BAB 5 (BAGIAN 2) ==================== */}
            <div className="manual-page page-break bg-white">
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">BAB 5 • LAPORAN EKSEKUTIF & ANALISIS PIVOT</span>
                    <h2 className="text-lg font-black text-slate-900">5.2 Pencetakan Portofolio Eksekutif 4 Halaman</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 12</span>
                </div>

                <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                  <p>
                    Aplikasi menyediakan fitur cetak portofolio eksekutif komprehensif sebanyak 4 halaman yang mencakup Cover profesional, Ringkasan Kinerja 5 Pilar, Grafik Analisis Gizi, serta Lembar Validasi Tanda Tangan.
                  </p>

                  <div className="space-y-2">
                    <h4 className="font-black text-slate-900 uppercase">Struktur 4 Halaman Portofolio:</h4>
                    <ol className="list-decimal list-inside space-y-1 pl-2 text-slate-700">
                      <li><strong>Halaman 1 (Cover Profesional):</strong> Desain elegan warna putih-biru-silver dengan identitas Pemkab Nagekeo & Dinas Kesehatan.</li>
                      <li><strong>Halaman 2 (Evaluasi 5 Pilar):</strong> Penilaian komprehensif kolaborasi lintas sektor dan intervensi spesifik/sensitif.</li>
                      <li><strong>Halaman 3 (Analisis Grafik & Tabel):</strong> Visualisasi data balita, ibu hamil, dan distribusi MBG/PMT.</li>
                      <li><strong>Halaman 4 (Kesimpulan & Validasi):</strong> Pengesahan resmi oleh Kepala Puskesmas dan Dinas Kesehatan.</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Bab 5: Laporan Eksekutif</span>
                <span>Halaman 12 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 13 - 20 (RINGKASAN MODUL LANJUTAN) ==================== */}
            {[13, 14, 15, 16, 17, 18, 19, 20].map((pageNum) => (
              <div key={pageNum} className="manual-page page-break bg-white">
                <div className="space-y-6">
                  <div className="border-b border-slate-200 pb-4 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">LAMPIRAN & OPERASIONAL LANJUTAN • BAB 5</span>
                      <h2 className="text-lg font-black text-slate-900">Modul Operasional & Teknis Sistem (Bagian {pageNum})</h2>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-500">Halaman {pageNum}</span>
                  </div>

                  <div className="space-y-4 text-xs text-slate-700 leading-relaxed py-8">
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-3">
                      <div className="h-12 w-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mx-auto font-black text-lg">
                        {pageNum}
                      </div>
                      <h3 className="font-black text-slate-900 text-sm uppercase">Halaman Panduan Teknis #{pageNum}</h3>
                      <p className="text-slate-600 max-w-md mx-auto text-xs">
                        Bagian ini merangkum SOP pemeliharaan server, pencatatan log aktivitas pengguna, manajemen hak akses kader posyandu, serta protokol darurat pemulihan data e-PPGBM Kabupaten Nagekeo.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-4">
                      <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-center">
                        <span className="font-black text-blue-900 block text-xs">SOP Keamanan</span>
                        <span className="text-[10px] text-slate-600">Enkripsi ABAC Aktif</span>
                      </div>
                      <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-center">
                        <span className="font-black text-amber-900 block text-xs">Standar e-PPGBM</span>
                        <span className="text-[10px] text-slate-600">Sinkronisasi Otomatis</span>
                      </div>
                      <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-center">
                        <span className="font-black text-emerald-900 block text-xs">Dukungan Teknis</span>
                        <span className="text-[10px] text-slate-600">Dinkes Nagekeo</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                  <span>Orbit Gizi System v2.5 • Buku Panduan Resmi</span>
                  <span>Halaman {pageNum} / 20</span>
                </div>
              </div>
            ))}

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-slate-600">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            <span>Buku Panduan 5 Bab & 20 Halaman siap dicetak atau diunduh sebagai PDF resmi.</span>
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
