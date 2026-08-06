import { useState } from "react";
import { Printer, X, FileText, CheckSquare, ShieldCheck, MapPin } from "lucide-react";

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
  const [rowCount, setRowCount] = useState<number>(15);
  const [printOrientation, setPrintOrientation] = useState<"portrait" | "landscape">("landscape");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl text-slate-900">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
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
            <select
              value={rowCount}
              onChange={(e) => setRowCount(Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800"
            >
              <option value={5}>5 Baris</option>
              <option value={10}>10 Baris</option>
              <option value={15}>15 Baris</option>
              <option value={20}>20 Baris</option>
            </select>
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
            className="bg-white text-slate-900 font-sans p-8 shadow-xl rounded-2xl w-full max-w-[1000px] border border-slate-300 space-y-6 text-xs print:shadow-none print:border-none print:p-0 print:m-0"
          >
            <style>{`
              @media print {
                @page {
                  size: A4 ${printOrientation};
                  margin: 8mm 8mm;
                }
                * {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                body {
                  background: #ffffff !important;
                  color: #000000 !important;
                }
                body * {
                  visibility: hidden !important;
                }
                #printable-offline-form, #printable-offline-form * {
                  visibility: visible !important;
                }
                #printable-offline-form {
                  display: block !important;
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  box-shadow: none !important;
                  border: none !important;
                }
              }
            `}
            </style>

            {/* Header Surat */}
            <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-slate-900 text-amber-300 rounded-xl flex items-center justify-center font-black text-xl shadow">
                  OG
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 block">
                    PEMERINTAH KABUPATEN NAGEKEO • DINAS KESEHATAN
                  </span>
                  <span className="text-xs font-bold text-slate-900">FORMULIR PENGISIAN MANUAL DATA GIZI & POSYANDU OFFLINE (E-PPGBM)</span>
                </div>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg uppercase tracking-wider block">
                  BLANGKO PENCATATAN LAPANGAN
                </span>
                <span className="text-[9px] text-slate-500 mt-1 block font-mono">EDISI KHUSUS BLANK SPOT / TANPA SINYAL</span>
              </div>
            </div>

            {/* Metadata Info Box */}
            <div className="grid grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-300 text-[11px]">
              <div>
                <span className="font-bold text-slate-500 block">Kecamatan / Puskesmas:</span>
                <span className="font-black text-slate-900">{puskesmasName}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 block">Desa / Kelurahan:</span>
                <span className="font-black text-slate-900">{kelurahanInput}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 block">Posyandu / Dusun:</span>
                <span className="font-black text-slate-900">{posyanduName}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 block">Bulan / Tahun Pelaporan:</span>
                <span className="font-black text-slate-900">___________________ 2026</span>
              </div>
            </div>

            {/* Instructions */}
            <div className="text-[10px] text-slate-600 space-y-1 bg-amber-50/70 border border-amber-200 p-2.5 rounded-lg">
              <p className="font-bold text-amber-900">PETUNJUK PENGISIAN OLEH KADER / PETUGAS POSYANDU:</p>
              <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                <li>Gunakan formulir ini apabila posyandu berada di lokasi tanpa jaringan internet (blank spot).</li>
                <li>Catat NIK (16 digit), Nama Balita/Ibu, Jenis Kelamin (L/P), Umur, Hasil Timbang (BB kg, TB cm), serta Status Gizi (Normal/Stunting/Wasting/Risiko).</li>
                <li>Setelah jaringan tersedia, admin atau kader dapat menginput data ini kembali ke <strong>Orbit Gizi System v2.5</strong>.</li>
              </ul>
            </div>

            {/* Manual Input Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-400 text-[10px]">
                <thead>
                  <tr className="bg-slate-200 text-slate-800 font-bold text-center">
                    <th className="border border-slate-400 p-2 w-8">No</th>
                    <th className="border border-slate-400 p-2">Nama Sasaran (Balita / Ibu) & Nama Orang Tua</th>
                    <th className="border border-slate-400 p-2 w-28">NIK (16 Digit)</th>
                    <th className="border border-slate-400 p-2 w-14">L / P</th>
                    <th className="border border-slate-400 p-2 w-16">Umur</th>
                    <th className="border border-slate-400 p-2 w-16">BB (Kg)</th>
                    <th className="border border-slate-400 p-2 w-16">TB (cm)</th>
                    <th className="border border-slate-400 p-2 w-24">Status Gizi (Normal/Stunting)</th>
                    <th className="border border-slate-400 p-2 w-20">MBG & PMT (Ya/Tidak)</th>
                    <th className="border border-slate-400 p-2 w-20">Kehadiran Posyandu</th>
                    <th className="border border-slate-400 p-2 w-28">Paraf / Ket.</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: rowCount }).map((_, idx) => (
                    <tr key={idx} className="h-7">
                      <td className="border border-slate-400 text-center font-bold text-slate-500"></td>
                      <td className="border border-slate-400 px-2 text-slate-400 italic"></td>
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
            <div className="grid grid-cols-3 gap-6 pt-6 text-center text-xs">
              <div className="space-y-12">
                <div>
                  <span className="font-bold text-slate-700 block">Mengetahui,</span>
                  <span className="font-bold text-slate-700 block">Kepala Desa / Lurah {kelurahanInput}</span>
                </div>
                <div className="border-b border-slate-400 w-40 mx-auto"></div>
                <span className="text-[10px] text-slate-500 block">NIP. ___________________________</span>
              </div>

              <div className="space-y-12">
                <div>
                  <span className="font-bold text-slate-700 block">Petugas Puskesmas Pembina</span>
                  <span className="font-bold text-slate-700 block">Wilayah {puskesmasName}</span>
                </div>
                <div className="border-b border-slate-400 w-40 mx-auto"></div>
                <span className="text-[10px] text-slate-500 block">NIP. ___________________________</span>
              </div>

              <div className="space-y-12">
                <div>
                  <span className="font-bold text-slate-700 block">Kader Posyandu Pelapor</span>
                  <span className="font-bold text-slate-700 block">{posyanduName}</span>
                </div>
                <div className="border-b border-slate-400 w-40 mx-auto"></div>
                <span className="text-[10px] text-slate-500 block">Nama & Tanda Tangan</span>
              </div>
            </div>

          </div>

        </div>

        {/* Footer actions */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
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
