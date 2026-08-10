import React, { useState, useMemo, useEffect } from "react";
import { IbuHamilBeneficiary } from "../types";
import { Users, Plus, Edit3, Trash2, Search, Heart, MapPin, CheckCircle2, X, Save, Calendar, Filter } from "lucide-react";
import { getIbuHamilApi, saveIbuHamilApi, deleteIbuHamilApi } from "../lib/dataService";

const DEFAULT_IBU_HAMIL: IbuHamilBeneficiary[] = [];

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

export default function IbuHamilView() {
  const [beneficiaries, setBeneficiaries] = useState<IbuHamilBeneficiary[]>(() => {
    const stored = localStorage.getItem("orbit_gizi_ibu_hamil");
    if (stored) {
      try {
        const parsed: IbuHamilBeneficiary[] = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    getIbuHamilApi().then(data => {
      if (Array.isArray(data)) {
        setBeneficiaries(data);
      }
    });
  }, []);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedIndividualId, setSelectedIndividualId] = useState<string>("ALL");
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState<string>("ALL");
  
  // Custom manual period input toggle/state
  const [customPeriod, setCustomPeriod] = useState<string>("");
  const [isManualPeriod, setIsManualPeriod] = useState<boolean>(false);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [namaIbu, setNamaIbu] = useState<string>("");
  const [umur, setUmur] = useState<string>("28 Tahun");
  const [nik, setNik] = useState<string>("");
  const [alamat, setAlamat] = useState<string>("Nangateke");
  const [puskesmas, setPuskesmas] = useState<string>("Puskesmas Boawae");
  const [kelurahan, setKelurahan] = useState<string>("Desa Nangateke");
  const [dusun, setDusun] = useState<string>("Dusun Nangateke");
  const [posyandu, setPosyandu] = useState<string>("Posyandu Nangateke");
  const [usiaKehamilan, setUsiaKehamilan] = useState<string>("Trimester 2 (20 Minggu)");
  const [catatan, setCatatan] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const saveToStorage = async (updated: IbuHamilBeneficiary[]) => {
    setBeneficiaries(updated);
    localStorage.setItem("orbit_gizi_ibu_hamil", JSON.stringify(updated));
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setNamaIbu("");
    setUmur("28 Tahun");
    setNik("");
    setAlamat("Nangateke");
    setPuskesmas("Puskesmas Boawae");
    setKelurahan("Desa Nangateke");
    setDusun("Dusun Nangateke");
    setPosyandu("Posyandu Nangateke");
    setUsiaKehamilan("Trimester 2 (20 Minggu)");
    setCatatan("");
    setShowModal(true);
  };

  const handleOpenEdit = (item: IbuHamilBeneficiary) => {
    setEditingId(item.id);
    setNamaIbu(item.namaIbu);
    setUmur(item.umur);
    setNik(item.nik);
    setAlamat(item.alamat);
    setPuskesmas(item.puskesmas || "Puskesmas Boawae");
    setKelurahan(item.kelurahan || "Desa Nangateke");
    setDusun(item.dusun || "Dusun Nangateke");
    setPosyandu(item.posyandu || "Posyandu Nangateke");
    setUsiaKehamilan(item.usiaKehamilan || "Trimester 2 (20 Minggu)");
    setCatatan(item.catatan || "");
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data Ibu Hamil ini?")) {
      const newList = await deleteIbuHamilApi(id);
      setBeneficiaries(newList);
      setSuccessMessage("Data Ibu Hamil berhasil dihapus.");
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaIbu.trim()) {
      alert("Nama Ibu wajib diisi!");
      return;
    }

    const newItem: IbuHamilBeneficiary = {
      id: editingId || ("hamil_" + Date.now()),
      namaIbu: namaIbu.trim(),
      umur: umur.trim() || "28 Tahun",
      nik: nik.trim() || `5316${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      alamat: alamat.trim() || "Nangateke",
      puskesmas,
      kelurahan,
      dusun,
      posyandu,
      usiaKehamilan: usiaKehamilan.trim(),
      catatan: catatan.trim()
    };

    const newList = await saveIbuHamilApi(newItem);
    setBeneficiaries(newList);
    if (editingId) {
      setSuccessMessage("Data Ibu Hamil berhasil diperbarui.");
    } else {
      setSuccessMessage("Data Ibu Hamil baru berhasil ditambahkan.");
    }

    setShowModal(false);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const filteredList = useMemo(() => {
    return beneficiaries.filter(b => {
      // Individual filter
      if (selectedIndividualId !== "ALL" && b.id !== selectedIndividualId) {
        return false;
      }
      // Search term filter
      const matchesSearch = 
        b.namaIbu.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.nik.includes(searchTerm) ||
        b.alamat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.usiaKehamilan && b.usiaKehamilan.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesSearch;
    });
  }, [beneficiaries, selectedIndividualId, searchTerm]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-pink-600">
            <Heart className="h-6 w-6" />
            <h2 className="text-lg font-black tracking-tight text-slate-900">
              Manajemen Data Ibu Hamil
            </h2>
          </div>
          <p className="text-xs font-medium text-slate-500">
            Pendataan terpusat Ibu Hamil, NIK, Umur, Alamat, Usia Kehamilan, serta pemantauan gizi & PMT.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-pink-600 hover:bg-pink-700 text-white font-black px-5 py-2.5 rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-pink-600/20 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Ibu Hamil</span>
        </button>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* SEARCH, INDIVIDUAL FILTER & PERIOD CONTROLS BAR */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama ibu, NIK, alamat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-500/20"
            />
          </div>

          {/* Individual Mother Filter Dropdown */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-pink-600 shrink-0" />
            <select
              value={selectedIndividualId}
              onChange={(e) => setSelectedIndividualId(e.target.value)}
              className="w-full sm:w-60 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20 cursor-pointer"
            >
              <option value="ALL">-- Semua Ibu Hamil (Semua) --</option>
              {beneficiaries.map(b => (
                <option key={b.id} value={b.id}>
                  {b.namaIbu} (NIK: {b.nik.slice(-4)})
                </option>
              ))}
            </select>
          </div>

          {/* Manual Period / Measurement Period Filter */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Calendar className="h-4 w-4 text-pink-600 shrink-0" />
            {isManualPeriod ? (
              <div className="flex items-center space-x-1 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Ketik Periode Manual (Cth: Periode Khusus Mei)"
                  value={customPeriod}
                  onChange={(e) => setCustomPeriod(e.target.value)}
                  className="w-full sm:w-48 bg-slate-50 border border-pink-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                />
                <button
                  type="button"
                  onClick={() => setIsManualPeriod(false)}
                  className="text-[10px] font-bold text-pink-600 underline cursor-pointer px-1 whitespace-nowrap"
                >
                  Pilih List
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1 w-full sm:w-auto">
                <select
                  value={selectedPeriodFilter}
                  onChange={(e) => {
                    if (e.target.value === "MANUAL_INPUT") {
                      setIsManualPeriod(true);
                    } else {
                      setSelectedPeriodFilter(e.target.value);
                    }
                  }}
                  className="w-full sm:w-48 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20 cursor-pointer"
                >
                  <option value="ALL">Semua Periode</option>
                  {PERIOD_OPTIONS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                  <option value="MANUAL_INPUT" className="font-bold text-pink-600">+ Tambah Periode Manual...</option>
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-bold text-slate-600 shrink-0">
          <span className="px-3 py-1.5 bg-pink-50 text-pink-700 rounded-xl border border-pink-100">
            Total Ditampilkan: <strong className="font-black text-pink-900">{filteredList.length} Orang</strong>
          </span>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="p-4">No</th>
                <th className="p-4">Nama Ibu & NIK</th>
                <th className="p-4">Umur & Kehamilan</th>
                <th className="p-4">Alamat & Posyandu</th>
                <th className="p-4">Catatan / Status</th>
                <th className="p-4 text-center">Aksi (Edit / Hapus)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 font-bold">
                    Tidak ada data Ibu Hamil yang ditemukan dengan filter tersebut.
                  </td>
                </tr>
              ) : (
                filteredList.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono text-slate-400 font-bold">{idx + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-slate-900 text-sm">{item.namaIbu}</span>
                        <span className="px-2 py-0.5 bg-pink-50 text-pink-700 border border-pink-200 rounded-md text-[9px] font-black">
                          Ibu Hamil
                        </span>
                      </div>
                      <p className="font-mono text-slate-400 text-[11px] mt-0.5">NIK: {item.nik}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{item.umur}</p>
                      {item.usiaKehamilan && (
                        <p className="text-[11px] text-pink-600 font-semibold mt-0.5">
                          {item.usiaKehamilan}
                        </p>
                      )}
                    </td>
                    <td className="p-4 text-slate-600 leading-tight">
                      <div className="flex items-center space-x-1 font-bold text-slate-800">
                        <MapPin className="h-3.5 w-3.5 text-pink-500 shrink-0" />
                        <span>{item.alamat} — {item.kelurahan}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.puskesmas} ({item.posyandu})</p>
                    </td>
                    <td className="p-4">
                      <p className="text-slate-600 font-normal max-w-xs">{item.catatan || "Rutin Posyandu"}</p>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl transition-colors flex items-center space-x-1 cursor-pointer"
                          title="Edit Data"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold rounded-xl transition-colors flex items-center space-x-1 cursor-pointer"
                          title="Hapus Data"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Hapus</span>
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

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 sticky top-0 bg-white z-10">
              <div className="flex items-center space-x-2 text-pink-600">
                <Heart className="h-5 w-5" />
                <h3 className="text-sm font-black uppercase text-slate-900">
                  {editingId ? "Edit Data Ibu Hamil" : "Tambah Data Ibu Hamil Baru"}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1 text-xs">NAMA LENGKAP IBU *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Fransiska Boli"
                  value={namaIbu}
                  onChange={(e) => setNamaIbu(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-pink-500/20 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-xs">UMUR (TAHUN) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 28 Tahun"
                    value={umur}
                    onChange={(e) => setUmur(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-pink-500/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-xs">NIK (16 DIGIT)</label>
                  <input
                    type="text"
                    placeholder="5316..."
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-pink-500/20 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-xs">ALAMAT / DUSUN</label>
                  <input
                    type="text"
                    placeholder="Contoh: Nangateke"
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-pink-500/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-xs">KELURAHAN / DESA</label>
                  <input
                    type="text"
                    placeholder="Desa Nangateke"
                    value={kelurahan}
                    onChange={(e) => setKelurahan(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-pink-500/20 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-xs">POSYANDU</label>
                  <input
                    type="text"
                    placeholder="Posyandu Nangateke"
                    value={posyandu}
                    onChange={(e) => setPosyandu(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-pink-500/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-xs">USIA KEHAMILAN</label>
                  <input
                    type="text"
                    placeholder="Trimester 2 (20 Minggu)"
                    value={usiaKehamilan}
                    onChange={(e) => setUsiaKehamilan(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-pink-500/20 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 text-xs">CATATAN / STATUS GIZI</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: PMT Ibu Hamil KEK, TTD rutin"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-pink-500/20 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-pink-600 hover:bg-pink-700 text-white font-black px-5 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-pink-600/20 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>Simpan Data</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
