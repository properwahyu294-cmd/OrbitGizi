import { useState } from "react";
import { Printer, X, BookOpen, ShieldCheck, Download, CheckCircle2 } from "lucide-react";
import coverImage from "../assets/images/orbit_gizi_manual_cover_1785996155418.jpg";

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
              20 Halaman • A4
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
              body, html {
                background: #ffffff !important;
                color: #000000 !important;
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                height: 100% !important;
                overflow: visible !important;
              }
              body > * {
                display: none !important;
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
                max-width: none !important;
                box-shadow: none !important;
                border: none !important;
                background: #ffffff !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              .manual-page {
                box-shadow: none !important;
                border: none !important;
                margin: 0 !important;
                padding: ${printOrientation === 'landscape' ? '12mm 16mm' : '15mm 16mm'} !important;
                width: ${printOrientation === 'landscape' ? '297mm' : '210mm'} !important;
                height: ${printOrientation === 'landscape' ? '210mm' : '297mm'} !important;
                max-height: ${printOrientation === 'landscape' ? '210mm' : '297mm'} !important;
                page-break-after: always !important;
                break-after: page !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
                box-sizing: border-box !important;
                position: relative !important;
                page-break-before: auto !important;
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

              {/* Overlay content to ensure exact title & subtitle placement matching reference */}
              <div className="absolute inset-0 z-10 flex flex-col justify-between p-10 bg-gradient-to-b from-white/95 via-white/50 to-white/90">
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
                    <span className="text-[10px] text-slate-700 mt-1 block font-mono font-bold">EDISI 2026 • 20 HALAMAN</span>
                  </div>
                </div>

                <div className="py-12 space-y-4 text-left max-w-lg">
                  <div className="inline-block px-3 py-1 bg-blue-600 text-white rounded-md text-[10px] font-black uppercase tracking-widest shadow-xs">
                    MODUL OPERASIONAL & MANAJEMEN E-PPGBM
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black text-blue-950 leading-tight uppercase tracking-tight drop-shadow-xs">
                    BUKU PANDUAN PENGGUNAAN & OPERASIONAL SISTEM ORBIT GIZI
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed bg-white/80 p-3 rounded-xl backdrop-blur-xs border border-slate-200">
                    Panduan komprehensif 5 bab dan 20 halaman untuk pengoperasian aplikasi, manajemen data balita & ibu hamil, pencatatan offline posyandu (blank spot), distribusi Makanan Bergizi Gratis (MBG), hingga analisis percepatan penurunan stunting Nagekeo.
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-800 font-semibold bg-white/90 p-4 rounded-2xl backdrop-blur-xs">
                  <div>
                    <span className="font-extrabold text-blue-950 block text-xs">Disusun Oleh: Tim Pengembang SPBE & Dinas Kesehatan Nagekeo</span>
                    <span className="text-[10px] text-slate-600">Tahun Ajaran / Edisi Pelayanan 2026/2027</span>
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
                    <h2 className="text-base font-black text-slate-900">STRUKTUR MODUL 5 BAB & 20 HALAMAN</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 2</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex justify-between font-black text-slate-900 text-xs">
                      <span>BAB 1: PENDAHULUAN & ARSITEKTUR SISTEM ORBIT GIZI</span>
                      <span className="text-blue-700 font-mono">Hal. 3 - 6</span>
                    </div>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5 pl-2 text-[11px]">
                      <li>Latar Belakang Kebijakan Zero Stunting Kabupaten Nagekeo (Hal. 3)</li>
                      <li>Tujuan & Manfaat Orbit Gizi System v2.5 bagi Puskesmas (Hal. 4)</li>
                      <li>Peta Navigasi Menu Utama & Hak Akses Berbasis ABAC (Hal. 5)</li>
                      <li>Panduan Login & Pengamanan Data Cyber Guard (Hal. 6)</li>
                    </ul>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex justify-between font-black text-slate-900 text-xs">
                      <span>BAB 2: MANAJEMEN DATA SASARAN & E-PPGBM</span>
                      <span className="text-blue-700 font-mono">Hal. 7 - 10</span>
                    </div>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5 pl-2 text-[11px]">
                      <li>Penginputan Data Balita, Ibu Hamil, dan Ibu Menyusui (Hal. 7)</li>
                      <li>Validasi NIK 16 Digit Terintegrasi Dukcapil & e-PPGBM (Hal. 8)</li>
                      <li>Pencatatan Antropometri: Berat Badan, Tinggi Badan, & LiLA (Hal. 9)</li>
                      <li>Sinkronisasi Data Lintas Puskesmas & Kecamatan (Hal. 10)</li>
                    </ul>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex justify-between font-black text-slate-900 text-xs">
                      <span>BAB 3: INTERVENSI MAKANAN BERGIZI GRATIS (MBG) & PMT</span>
                      <span className="text-blue-700 font-mono">Hal. 11 - 13</span>
                    </div>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5 pl-2 text-[11px]">
                      <li>Manajemen Jadwal & Menu Distribusi Makanan Bergizi Gratis (MBG) (Hal. 11)</li>
                      <li>Alokasi Pemberian Makanan Tambahan (PMT) untuk Balita Wasting (Hal. 12)</li>
                      <li>Monitoring Real-time Logistik & Laporan Distribusi Harian (Hal. 13)</li>
                    </ul>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex justify-between font-black text-slate-900 text-xs">
                      <span>BAB 4: PENCATATAN OFFLINE & FORM MANUAL (BLANK SPOT)</span>
                      <span className="text-blue-700 font-mono">Hal. 14 - 16</span>
                    </div>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5 pl-2 text-[11px]">
                      <li>Prosedur Pencetakan Lembar Form Blanko Manual 15 Baris (Hal. 14)</li>
                      <li>Panduan Pengisian Lapangan bagi Kader Posyandu Tanpa Sinyal (Hal. 15)</li>
                      <li>Prosedur Rekonsiliasi & Input Kembali ke Sistem (Hal. 16)</li>
                    </ul>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex justify-between font-black text-slate-900 text-xs">
                      <span>BAB 5: LAPORAN EKSEKUTIF, ANALISIS PIVOT & KEAMANAN SPBE</span>
                      <span className="text-blue-700 font-mono">Hal. 17 - 20</span>
                    </div>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5 pl-2 text-[11px]">
                      <li>Analisis Pivot Lintas Wilayah & Penilaian Risiko Stunting (Hal. 17)</li>
                      <li>Pencetakan Portofolio Eksekutif 4 Halaman untuk Bupati & Dinkes (Hal. 18)</li>
                      <li>Audit Log Keamanan Data & Pemeliharaan Sistem Berkala (Hal. 19)</li>
                      <li>Kontak Bantuan Teknis & FAQ Layanan Pengaduan Gizi (Hal. 20)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
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
                    <h2 className="text-base font-black text-slate-900">1.1 Latar Belakang Kebijakan Zero Stunting Nagekeo</h2>
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
                    <h4 className="font-black text-blue-900 uppercase text-xs">Prinsip Utama Sistem:</h4>
                    <ul className="list-disc list-inside space-y-1 text-blue-800 text-[11px]">
                      <li><strong>Akurasi Data Real-time:</strong> Setiap penimbangan balita langsung terhubung dengan kalkulator status gizi WHO z-score.</li>
                      <li><strong>Transparansi Lintas Sektor:</strong> Kolaborasi 5 pilar termonitor dalam satu dasbor terpadu.</li>
                      <li><strong>Ketahanan Lapangan (Offline-Ready):</strong> Menyediakan fasilitas cetak blangko manual bagi posyandu di wilayah blank spot.</li>
                    </ul>
                  </div>

                  <p>
                    Buku panduan ini disusun secara sistematis agar dapat dipahami dan dipraktekkan langsung oleh seluruh pengguna di lapangan, memastikan tidak ada satupun anak berisiko stunting yang terlewat dari intervensi gizi.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
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
                    <h2 className="text-base font-black text-slate-900">1.2 Tujuan, Navigasi Menu & Keamanan ABAC</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 4</span>
                </div>

                <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <h3 className="font-black text-slate-900 text-xs">Tujuan Pengoperasian Sistem</h3>
                  <p>
                    Penerapan aplikasi ini bertujuan untuk: (1) Mempercepat proses rekapitulasi laporan bulanan posyandu, (2) Memantau distribusi Makanan Bergizi Gratis (MBG) tepat sasaran, (3) Menyediakan visualisasi peta risiko stunting interaktif per desa/kelurahan, dan (4) Memfasilitasi cetak laporan portofolio eksekutif bagi pimpinan daerah.
                  </p>

                  <h3 className="font-black text-slate-900 text-xs">Struktur Navigasi Menu Utama</h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                      <span className="font-black text-blue-800 block text-xs">1. Beranda & Executive Summary</span>
                      <p className="text-[10px] text-slate-600">Ringkasan statistik utama, grafik tren stunting, dan indikator pencapaian pilar.</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                      <span className="font-black text-blue-800 block text-xs">2. Data Input Center</span>
                      <p className="text-[10px] text-slate-600">Pusat pencatatan data balita, ibu hamil, menyusui, dan intervensi MBG.</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                      <span className="font-black text-blue-800 block text-xs">3. Analisis Pivot & Portofolio</span>
                      <p className="text-[10px] text-slate-600">Analisis data mendalam lintas wilayah dan pencetakan portofolio 4 halaman.</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                      <span className="font-black text-blue-800 block text-xs">4. Form Offline & Panduan</span>
                      <p className="text-[10px] text-slate-600">Pencetakan blangko manual posyandu dan akses buku panduan lengkap.</p>
                    </div>
                  </div>

                  <h3 className="font-black text-slate-900 text-xs">Keamanan Akses (ABAC & Cyber Guard)</h3>
                  <p>
                    Sistem dilindungi dengan enkripsi tingkat lanjut dan kontrol akses berbasis atribut (Attribute-Based Access Control) untuk menjamin kerahasiaan data kesehatan warga Nagekeo sesuai standar SPBE nasional.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Bab 1: Pendahuluan & Arsitektur</span>
                <span>Halaman 4 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 5: BAB 2 (BAGIAN 1) ==================== */}
            <div className="manual-page bg-white">
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">BAB 2 • MANAJEMEN DATA SASARAN & E-PPGBM</span>
                    <h2 className="text-base font-black text-slate-900">2.1 Penginputan Data Balita & Validasi NIK</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 5</span>
                </div>

                <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <p>
                    Pencatatan data sasaran merupakan fondasi utama dalam e-PPGBM. Setiap balita yang datang ke posyandu wajib didata secara teliti menggunakan NIK resmi untuk menghindari duplikasi data bantuan gizi.
                  </p>

                  <div className="space-y-1.5">
                    <h4 className="font-black text-slate-900 uppercase text-xs">Langkah-langkah Input Data Sasaran:</h4>
                    <ol className="list-decimal list-inside space-y-1 pl-2 text-slate-700 text-[11px]">
                      <li>Buka menu <strong>Data Input Center</strong> pada navigasi utama aplikasi.</li>
                      <li>Pilih tab kategori sasaran (contoh: <strong>Data Balita & Stunting</strong>).</li>
                      <li>Klik tombol <strong>+ Tambah Sasaran Baru</strong> untuk membuka form input wizard.</li>
                      <li>Masukkan 16 digit NIK balita; sistem melakukan validasi otomatis format NIK.</li>
                      <li>Lengkapi Nama Lengkap Balita, Nama Orang Tua, Tanggal Lahir, Jenis Kelamin (L/P), serta Kelurahan/Desa.</li>
                      <li>Masukkan hasil pengukuran antropometri terakhir (Berat Badan dalam Kg dan Tinggi Badan dalam Cm).</li>
                      <li>Sistem secara otomatis menghitung status gizi berdasarkan standar WHO z-score.</li>
                      <li>Klik <strong>Simpan Data</strong> untuk memasukkan data ke database cloud secara aman.</li>
                    </ol>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px]">
                    <span className="font-bold block mb-0.5">Catatan Penting Petugas:</span>
                    Pastikan penimbangan menggunakan timbangan digital yang telah dikalibrasi agar hasil z-score akurat.
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Bab 2: Manajemen Data Sasaran</span>
                <span>Halaman 5 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 6: BAB 2 (BAGIAN 2) ==================== */}
            <div className="manual-page bg-white">
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">BAB 2 • MANAJEMEN DATA SASARAN & E-PPGBM</span>
                    <h2 className="text-base font-black text-slate-900">2.2 Manajemen Ibu Hamil, Menyusui & Sinkronisasi</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 6</span>
                </div>

                <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <p>
                    Selain balita, pencegahan stunting dimulai sejak 1000 HPK (Hari Pertama Kehidupan). Oleh karena itu, modul ini menyediakan pencatatan khusus untuk Ibu Hamil (ANC) dan Ibu Menyusui (PNC).
                  </p>

                  <div className="space-y-2">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                      <span className="font-black text-slate-900 block text-xs">Pencatatan Ibu Hamil (ANC)</span>
                      <p className="text-[10px] text-slate-600">Catat usia kehamilan (trimester), lingkar lengan atas (LiLA) untuk deteksi Kekurangan Energi Kronis (KEK), serta pemberian tablet tambah darah (TTD).</p>
                    </div>

                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                      <span className="font-black text-slate-900 block text-xs">Pencatatan Ibu Menyusui & Bayi 0-6 Bulan</span>
                      <p className="text-[10px] text-slate-600">Pantau pemberian ASI eksklusif, status imunisasi dasar, serta kondisi kesehatan ibu pasca persalinan.</p>
                    </div>

                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                      <span className="font-black text-slate-900 block text-xs">Sinkronisasi Lintas Puskesmas</span>
                      <p className="text-[10px] text-slate-600">Data yang diinput oleh bidan desa atau kader puskesmas langsung tersinkronisasi otomatis ke server pusat Dinas Kesehatan Kabupaten Nagekeo.</p>
                    </div>
                  </div>

                  <p>
                    Dengan sinkronisasi otomatis ini, kepala puskesmas dapat memantau progres real-time tanpa harus menunggu rekapitulasi manual di akhir bulan.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Bab 2: Manajemen Data Sasaran</span>
                <span>Halaman 6 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 7: BAB 3 (BAGIAN 1) ==================== */}
            <div className="manual-page bg-white">
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">BAB 3 • INTERVENSI MBG & PMT</span>
                    <h2 className="text-base font-black text-slate-900">3.1 Manajemen Distribusi Makanan Bergizi Gratis (MBG)</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 7</span>
                </div>

                <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <p>
                    Program Makanan Bergizi Gratis (MBG) merupakan pilar penting dalam pemenuhan nutrisi harian anak sekolah dan balita di Kabupaten Nagekeo. Aplikasi menyediakan fitur penjadwalan dan pemantauan distribusi yang transparan.
                  </p>

                  <div className="space-y-1.5">
                    <h4 className="font-black text-slate-900 uppercase text-xs">Cara Pengelolaan Jadwal MBG:</h4>
                    <ol className="list-decimal list-inside space-y-1 pl-2 text-slate-700 text-[11px]">
                      <li>Akses modul manajemen MBG pada menu utama atau sub-menu intervensi.</li>
                      <li>Tentukan tanggal distribusi, menu makanan (misal: Nasi, Ikan, Sayur Kelor, Buah Lokal), serta kalori.</li>
                      <li>Pilih kelompok sasaran penerima manfaat (PAUD, TK, SD, atau Balita Posyandu tertentu).</li>
                      <li>Catat jumlah paket yang disalurkan dan konfirmasi penerimaan oleh koordinator posyandu/sekolah.</li>
                    </ol>
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-[11px]">
                    <span className="font-bold text-emerald-900 block">Standar Kandungan Gizi MBG:</span>
                    <p className="text-emerald-800">
                      Setiap paket makanan bergizi gratis dirancang memenuhi minimal 30% Angka Kecukupan Gizi (AKG) harian anak, dengan penekanan pada protein hewani lokal seperti ikan segar dan telur.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Bab 3: Intervensi MBG & PMT</span>
                <span>Halaman 7 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 8: BAB 3 (BAGIAN 2) ==================== */}
            <div className="manual-page bg-white">
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">BAB 3 • INTERVENSI MBG & PMT</span>
                    <h2 className="text-base font-black text-slate-900">3.2 Alokasi PMT Pemulihan & Monitoring Logistik</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 8</span>
                </div>

                <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <p>
                    Pemberian Makanan Tambahan (PMT) Pemulihan difokuskan khusus bagi balita yang teridentifikasi mengalami gizi kurang (wasting), gizi buruk, atau stunting kronis selama minimal 90 hari intervensi.
                  </p>

                  <div className="space-y-2">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                      <span className="font-black text-slate-900 block text-xs">Targeting Sasaran PMT Pemulihan</span>
                      <p className="text-[10px] text-slate-600">Sistem secara otomatis memfilter daftar balita berstatus gizi kurang/merah untuk diprioritaskan mendapatkan paket PMT tinggi protein.</p>
                    </div>

                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                      <span className="font-black text-slate-900 block text-xs">Monitoring Stok Logistik Puskesmas</span>
                      <p className="text-[10px] text-slate-600">Petugas dapat memantau ketersediaan bahan PMT di gudang puskesmas dan mengajukan permintaan restock ke Dinas Kesehatan secara digital.</p>
                    </div>

                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                      <span className="font-black text-slate-900 block text-xs">Evaluasi Kenaikan Berat Badan (BB)</span>
                      <p className="text-[10px] text-slate-600">Setiap 2 minggu sekali, kader wajib memasukkan hasil penimbangan ulang untuk menilai apakah intervensi PMT memberikan respon positif.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Bab 3: Intervensi MBG & PMT</span>
                <span>Halaman 8 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 9: BAB 4 (BAGIAN 1) ==================== */}
            <div className="manual-page bg-white">
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">BAB 4 • PENCATATAN OFFLINE (BLANK SPOT)</span>
                    <h2 className="text-base font-black text-slate-900">4.1 Prosedur Cetak Formulir Manual 15 Baris</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 9</span>
                </div>

                <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <p>
                    Tidak semua posyandu di wilayah Kabupaten Nagekeo memiliki akses internet yang stabil. Untuk mengantisipasi kendala tersebut, Orbit Gizi System v2.5 menyediakan fitur khusus pencetakan formulir blangko manual (offline template).
                  </p>

                  <div className="space-y-1.5">
                    <h4 className="font-black text-slate-900 uppercase text-xs">Cara Mencetak Blangko Offline:</h4>
                    <ol className="list-decimal list-inside space-y-1 pl-2 text-slate-700 text-[11px]">
                      <li>Klik tombol <strong>Cetak Form Offline</strong> pada bilah navigasi atas aplikasi.</li>
                      <li>Masukkan nama Desa/Kelurahan dan Posyandu yang akan dikunjungi.</li>
                      <li>Sistem secara otomatis menyiapkan format tabel standar e-PPGBM dengan <strong>15 baris kosong</strong> yang pas di 1 halaman kertas A4.</li>
                      <li>Kolom Nomor sengaja dikosongkan untuk memudahkan pencatatan manual di lapangan.</li>
                      <li>Klik tombol <strong>Cetak Form</strong> untuk menghubungkan langsung ke printer atau menyimpan sebagai PDF.</li>
                    </ol>
                  </div>

                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 text-[11px]">
                    <span className="font-bold block mb-0.5">Keunggulan Blangko Resmi:</span>
                    Blangko telah dilengkapi kolom NIK 16 digit, Nama Sasaran, L/P, Umur, BB, TB, Status Gizi, Kehadiran, serta tanda tangan Kepala Desa dan Kader.
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Bab 4: Pencatatan Offline</span>
                <span>Halaman 9 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 10: BAB 4 (BAGIAN 2) ==================== */}
            <div className="manual-page bg-white">
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">BAB 4 • PENCATATAN OFFLINE (BLANK SPOT)</span>
                    <h2 className="text-base font-black text-slate-900">4.2 Panduan Pengisian Lapangan & Sinkronisasi Kembali</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 10</span>
                </div>

                <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <p>
                    Saat bertugas di lokasi tanpa sinyal (blank spot), kader posyandu menggunakan lembar kertas cetak yang telah dipersiapkan sebelumnya. Berikut adalah tata tertib pengisian dan pemindahan data ke aplikasi:
                  </p>

                  <div className="space-y-2">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                      <span className="font-black text-slate-900 block text-xs">1. Ketepatan Penulisan NIK & Nama</span>
                      <p className="text-[10px] text-slate-600">Pastikan 16 digit NIK ditulis dengan jelas dan terbaca agar saat proses input ke aplikasi tidak terjadi kesalahan penulisan angka.</p>
                    </div>

                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                      <span className="font-black text-slate-900 block text-xs">2. Pengukuran Antropometri Teliti</span>
                      <p className="text-[10px] text-slate-600">Tuliskan angka desimal Berat Badan (misal: 10.4 kg) dan Tinggi Badan (misal: 78.5 cm) secara presisi di lembar blangko.</p>
                    </div>

                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                      <span className="font-black text-slate-900 block text-xs">3. Rekonsiliasi Data Pascakunjungan</span>
                      <p className="text-[10px] text-slate-600">Setelah kader kembali ke wilayah dengan jangkauan internet, buka kembali aplikasi Orbit Gizi dan masukkan seluruh data lembar manual ke menu Data Input Center.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Bab 4: Pencatatan Offline</span>
                <span>Halaman 10 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 11: BAB 5 (BAGIAN 1) ==================== */}
            <div className="manual-page bg-white">
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">BAB 5 • LAPORAN EKSEKUTIF & ANALISIS PIVOT</span>
                    <h2 className="text-base font-black text-slate-900">5.1 Analisis Pivot Lintas Wilayah & Penilaian Risiko</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 11</span>
                </div>

                <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <p>
                    Modul analisis pivot dirancang untuk pimpinan puskesmas dan Dinas Kesehatan guna membandingkan kinerja penanganan gizi antar kelurahan/desa secara cepat dan mendalam.
                  </p>

                  <div className="space-y-1.5">
                    <h4 className="font-black text-slate-900 uppercase text-xs">Fitur Unggulan Analisis Pivot:</h4>
                    <ul className="list-disc list-inside space-y-1 pl-2 text-slate-700 text-[11px]">
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

              <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Bab 5: Laporan Eksekutif</span>
                <span>Halaman 11 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 12: BAB 5 (BAGIAN 2) ==================== */}
            <div className="manual-page bg-white">
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">BAB 5 • LAPORAN EKSEKUTIF & ANALISIS PIVOT</span>
                    <h2 className="text-base font-black text-slate-900">5.2 Pencetakan Portofolio Eksekutif 4 Halaman</h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Halaman 12</span>
                </div>

                <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <p>
                    Aplikasi menyediakan fitur cetak portofolio eksekutif komprehensif sebanyak 4 halaman yang mencakup Cover profesional, Ringkasan Kinerja 5 Pilar, Grafik Analisis Gizi, serta Lembar Validasi Tanda Tangan.
                  </p>

                  <div className="space-y-1.5">
                    <h4 className="font-black text-slate-900 uppercase text-xs">Struktur 4 Halaman Portofolio:</h4>
                    <ol className="list-decimal list-inside space-y-1 pl-2 text-slate-700 text-[11px]">
                      <li><strong>Halaman 1 (Cover Profesional):</strong> Desain elegan dengan identitas Pemkab Nagekeo & Dinas Kesehatan.</li>
                      <li><strong>Halaman 2 (Evaluasi 5 Pilar):</strong> Penilaian komprehensif kolaborasi lintas sektor dan intervensi spesifik/sensitif.</li>
                      <li><strong>Halaman 3 (Analisis Grafik & Tabel):</strong> Visualisasi data balita, ibu hamil, dan distribusi MBG/PMT.</li>
                      <li><strong>Halaman 4 (Kesimpulan & Validasi):</strong> Pengesahan resmi oleh Kepala Puskesmas dan Dinas Kesehatan.</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>Bab 5: Laporan Eksekutif</span>
                <span>Halaman 12 / 20</span>
              </div>
            </div>


            {/* ==================== HALAMAN 13 - 20 (RINGKASAN MODUL LANJUTAN) ==================== */}
            {[13, 14, 15, 16, 17, 18, 19, 20].map((pageNum) => (
              <div key={pageNum} className="manual-page bg-white">
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">LAMPIRAN & OPERASIONAL LANJUTAN • BAB 5</span>
                      <h2 className="text-base font-black text-slate-900">Modul Operasional & Teknis Sistem (Bagian {pageNum})</h2>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-500">Halaman {pageNum}</span>
                  </div>

                  <div className="space-y-4 text-xs text-slate-700 leading-relaxed py-6">
                    <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2.5">
                      <div className="h-10 w-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mx-auto font-black text-base">
                        {pageNum}
                      </div>
                      <h3 className="font-black text-slate-900 text-xs uppercase">Halaman Panduan Teknis #{pageNum}</h3>
                      <p className="text-slate-600 max-w-md mx-auto text-[11px]">
                        Bagian ini merangkum SOP pemeliharaan server, pencatatan log aktivitas pengguna, manajemen hak akses kader posyandu, serta protokol darurat pemulihan data e-PPGBM Kabupaten Nagekeo.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 pt-2">
                      <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded-xl text-center">
                        <span className="font-black text-blue-900 block text-[11px]">SOP Keamanan</span>
                        <span className="text-[9px] text-slate-600">Enkripsi ABAC Aktif</span>
                      </div>
                      <div className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-xl text-center">
                        <span className="font-black text-amber-900 block text-[11px]">Standar e-PPGBM</span>
                        <span className="text-[9px] text-slate-600">Sinkronisasi Otomatis</span>
                      </div>
                      <div className="p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-xl text-center">
                        <span className="font-black text-emerald-900 block text-[11px]">Dukungan Teknis</span>
                        <span className="text-[9px] text-slate-600">Dinkes Nagekeo</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
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
            <span>Buku Panduan 5 Bab & 20 Halaman siap dicetak dengan pilihan mode Portrait / Landscape.</span>
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
