import { useState } from "react";
import { Printer, X, FileText, ShieldCheck } from "lucide-react";

interface PosyanduOfflineFormTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultKelurahan?: string;
}

export function PosyanduOfflineFormTemplateModal({
  isOpen,
  onClose,
  defaultKelurahan = "Desa Nangateke"
}: PosyanduOfflineFormTemplateModalProps) {
  const [kelurahanInput, setKelurahanInput] = useState<string>(defaultKelurahan);
  const [posyanduName, setPosyanduName] = useState<string>("Posyandu Nangateke");
  const [puskesmasName, setPuskesmasName] = useState<string>("Puskesmas Boawae");
  const [rowCount] = useState<number>(15);
  const [printOrientation, setPrintOrientation] = useState<"portrait" | "landscape">("landscape");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl text-slate-900">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider">Template Form Manual Input (Offline) Posyandu</h3>
              <p className="text-[11px] text-slate-400">Cetak lembar formulir manual untuk area tanpa sinyal internet / blank spot</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Configuration Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Wilayah Kelurahan / Desa</label>
            <input
              type="text"
              value={kelurahanInput}
              onChange={(e) => setKelurahanInput(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Nama Posyandu</label>
            <input
              type="text"
              value={posyanduName}
              onChange={(e) => setPosyanduName(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Jumlah Baris Kosong</label>
            <div className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-700">
              15 Baris (Pas 1 Halaman A4)
            </div>
          </div>
          <div className="flex flex-col justify-end">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPrintOrientation(printOrientation === 'portrait' ? 'landscape' : 'portrait')}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-all cursor-pointer text-xs"
              >
                Format: {printOrientation === 'portrait' ? 'Portrait' : 'Landscape'}
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-md cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak Form</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Preview Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/70 flex justify-center">
          
          {/* PRINTABLE FORM CONTAINER */}
          <div 
            id="printable-offline-form" 
            className="bg-white text-slate-900 font-sans p-6 shadow-xl rounded-2xl w-full max-w-[1100px] border border-slate-300 space-y-4 text-xs"
          >
            <style>{`
              @media print {
                @page {
                  size: A4 ${printOrientation};
                  margin: 6mm;
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
                body * {
                  visibility: hidden !important;
                }
                #printable-offline-form, #printable-offline-form *,
                #printable-portfolio-report, #printable-portfolio-report *,
                #printable-manual-book, #printable-manual-book *,
                #printable-audit-report, #printable-audit-report * {
                  visibility: visible !important;
                }
                #printable-offline-form {
                  display: block !important;
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  max-width: none !important;
                  margin: 0 !important;
                  padding: 4mm !important;
                  box-shadow: none !important;
                  border: none !important;
                  background: #ffffff !important;
                  page-break-after: avoid !important;
                  break-after: avoid !important;
                }
              }
            `}</style>

            {/* Header Surat */}
            <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-slate-900 text-amber-300 rounded-xl flex items-center justify-center font-black text-lg shadow">
                  OG
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 block">
                    PEMERINTAH KABUPATEN NAGEKEO • DINAS KESEHATAN
                  </span>
                  <span className="text-xs font-bold text-slate-900">FORMULIR PENGISIAN MANUAL DATA GIZI & POSYANDU OFFLINE (E-PPGBM)</span>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 bg-slate-900 text-white text-[9px] font-black rounded-lg uppercase tracking-wider block">
                  BLANGKO PENCATATAN LAPANGAN
                </span>
                <span className="text-[8px] text-slate-500 mt-0.5 block font-mono">EDISI KHUSUS BLANK SPOT / TANPA SINYAL</span>
              </div>
            </div>

            {/* Metadata Info Box */}
            <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-300 text-[10px]">
              <div>
                <span className="font-bold text-slate-500 block text-[9px]">Kecamatan / Puskesmas:</span>
                <span className="font-black text-slate-900">{puskesmasName}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 block text-[9px]">Desa / Kelurahan:</span>
                <span className="font-black text-slate-900">{kelurahanInput}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 block text-[9px]">Posyandu / Dusun:</span>
                <span className="font-black text-slate-900">{posyanduName}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 block text-[9px]">Bulan / Tahun Pelaporan:</span>
                <span className="font-black text-slate-900">___________________ 2026</span>
              </div>
            </div>

            {/* Instructions */}
            <div className="text-[9px] text-slate-600 space-y-0.5 bg-amber-50/70 border border-amber-200 p-2 rounded-md">
              <p className="font-bold text-amber-900">PETUNJUK PENGISIAN OLEH KADER / PETUGAS POSYANDU:</p>
              <ul className="list-disc list-inside space-y-0 text-amber-800">
                <li>Gunakan formulir ini apabila posyandu berada di lokasi tanpa jaringan internet (blank spot).</li>
                <li>Catat NIK (16 digit), Nama Balita/Ibu, Jenis Kelamin (L/P), Umur, Hasil Timbang (BB kg, TB cm), serta Status Gizi.</li>
                <li>Setelah jaringan tersedia, admin atau kader dapat menginput data ini kembali ke <strong>Orbit Gizi System v2.5</strong>.</li>
              </ul>
            </div>

            {/* Manual Input Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-400 text-[10px]">
                <thead>
                  <tr className="bg-slate-200 text-slate-800 font-bold text-center h-8">
                    <th className="border border-slate-400 p-1 w-8">No</th>
                    <th className="border border-slate-400 p-1">Nama Sasaran (Balita / Ibu) & Nama Orang Tua</th>
                    <th className="border border-slate-400 p-1 w-28">NIK (16 Digit)</th>
                    <th className="border border-slate-400 p-1 w-12">L / P</th>
                    <th className="border border-slate-400 p-1 w-14">Umur</th>
                    <th className="border border-slate-400 p-1 w-14">BB (Kg)</th>
                    <th className="border border-slate-400 p-1 w-14">TB (cm)</th>
                    <th className="border border-slate-400 p-1 w-24">Status Gizi</th>
                    <th className="border border-slate-400 p-1 w-20">MBG & PMT</th>
                    <th className="border border-slate-400 p-1 w-20">Kehadiran</th>
                    <th className="border border-slate-400 p-1 w-28">Paraf / Ket.</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: rowCount }).map((_, idx) => (
                    <tr key={idx} className="h-6">
                      <td className="border border-slate-400 text-center font-bold text-slate-500"></td>
                      <td className="border border-slate-400 px-2"></td>
                      <td className="border border-slate-400 px-2 font-mono text-center"></td>
                      <td className="border border-slate-400 text-center"></td>
                      <td className="border border-slate-400 text-center"></td>
                      <td className="border border-slate-400 text-center"></td>
                      <td className="border border-slate-400 text-center"></td>
                      <td className="border border-slate-400 text-center"></td>
                      <td className="border border-slate-400 text-center"></td>
                      <td className="border border-slate-400 text-center"></td>
                      <td className="border border-slate-400 text-center"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signatures / Tanda Tangan */}
            <div className="grid grid-cols-3 gap-4 pt-2 text-center text-[10px]">
              <div className="space-y-8">
                <div>
                  <span className="font-bold text-slate-700 block">Mengetahui,</span>
                  <span className="font-bold text-slate-700 block">Kepala Desa / Lurah {kelurahanInput}</span>
                </div>
                <div className="border-b border-slate-400 w-32 mx-auto"></div>
                <span className="text-[9px] text-slate-500 block">NIP. ___________________________</span>
              </div>

              <div className="space-y-8">
                <div>
                  <span className="font-bold text-slate-700 block">Petugas Puskesmas Pembina</span>
                  <span className="font-bold text-slate-700 block">Wilayah {puskesmasName}</span>
                </div>
                <div className="border-b border-slate-400 w-32 mx-auto"></div>
                <span className="text-[9px] text-slate-500 block">NIP. ___________________________</span>
              </div>

              <div className="space-y-8">
                <div>
                  <span className="font-bold text-slate-700 block">Kader Posyandu Pelapor</span>
                  <span className="font-bold text-slate-700 block">{posyanduName}</span>
                </div>
                <div className="border-b border-slate-400 w-32 mx-auto"></div>
                <span className="text-[9px] text-slate-500 block">Nama & Tanda Tangan</span>
              </div>
            </div>

          </div>

        </div>

        {/* Footer actions */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-slate-500">
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
            <span>Format Resmi Sesuai Standar e-PPGBM & Integrasi SPBE Nagekeo</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl cursor-pointer"
            >
              Tutup Jendela
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-md"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak Form Blanko</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
