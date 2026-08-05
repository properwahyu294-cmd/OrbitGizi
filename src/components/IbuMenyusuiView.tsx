import React, { useState, useMemo } from "react";
import { IbuMenyusuiBeneficiary } from "../types";
import { Users, Plus, Edit3, Trash2, Search, Heart, MapPin, CheckCircle2, X, Save, Calendar, Filter } from "lucide-react";

const DEFAULT_IBU_MENYUSUI: IbuMenyusuiBeneficiary[] = [
  {
    id: "ibu_1",
    namaIbu: "Mersiana Ere",
    umur: "27 Tahun",
    nik: "5316014502990001",
    alamat: "Nangateke",
    puskesmas: "Puskesmas Boawae",
    kelurahan: "Desa Nangateke",
    dusun: "Dusun Nangateke",
    posyandu: "Posyandu Nangateke",
    bayiNama: "Adrian Sa",
    catatan: "Menyusui aktif, pemberian ASI Eksklusif & PMT Ibu Menyusui"
  },
  {
    id: "ibu_2",
    namaIbu: "Emirensiana",
    umur: "31 Tahun",
    nik: "5316015003950002",
    alamat: "Nangateke",
    puskesmas: "Puskesmas Boawae",
    kelurahan: "Desa Nangateke",
    dusun: "Dusun Nangateke",
    posyandu: "Posyandu Nangateke",
    bayiNama: "Febriani Oti",
    catatan: "Pemantauan gizi rutin posyandu"
  },
  {
    id: "ibu_3",
    namaIbu: "Yohana Mboy",
    umur: "29 Tahun",
    nik: "5316016208970003",
    alamat: "Nangateke",
    puskesmas: "Puskesmas Boawae",
    kelurahan: "Desa Nangateke",
    dusun: "Dusun Nangateke",
    posyandu: "Posyandu Nangateke",
    bayiNama: "Guberta Suriati",
    catatan: "Pendampingan kader posyandu & edukasi gizi seimbang"
  },
  {
    id: "ibu_4",
    namaIbu: "Arkuslaus Lena",
    umur: "34 Tahun",
    nik: "5316014811920004",
    alamat: "Nangateke",
    puskesmas: "Puskesmas Boawae",
    kelurahan: "Desa Nangateke",
    dusun: "Dusun Nangateke",
    posyandu: "Posyandu Nangateke",
    bayiNama: "Hendrikus P. Kako",
    catatan: "Menerima paket tambahan gizi ibu menyusui"
  },
  {
    id: "ibu_5",
    namaIbu: "Hefer Katnesi",
    umur: "26 Tahun",
    nik: "3173055504000005",
    alamat: "Nangateke",
    puskesmas: "Puskesmas Boawae",
    kelurahan: "Desa Nangateke",
    dusun: "Dusun Nangateke",
    posyandu: "Posyandu Nangateke",
    bayiNama: "Jefanya R. R. Katnesi",
    catatan: "ASI Eksklusif lancar"
  }
];

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

export default function IbuMenyusuiView() {
  const [beneficiaries, setBeneficiaries] = useState<IbuMenyusuiBeneficiary[]>(() => {
    const stored = localStorage.getItem("orbit_gizi_ibu_menyusui");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        localStorage.setItem("orbit_gizi_ibu_menyusui", JSON.stringify(DEFAULT_IBU_MENYUSUI));
        return DEFAULT_IBU_MENYUSUI;
      }
    }
    localStorage.setItem("orbit_gizi_ibu_menyusui", JSON.stringify(DEFAULT_IBU_MENYUSUI));
    return DEFAULT_IBU_MENYUSUI;
  });

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
  const [bayiNama, setBayiNama] = useState<string>("");
  const [catatan, setCatatan] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const saveToStorage = (updated: IbuMenyusuiBeneficiary[]) => {
    setBeneficiaries(updated);
    localStorage.setItem("orbit_gizi_ibu_menyusui", JSON.stringify(updated));
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
    setBayiNama("");
    setCatatan("");
    setShowModal(true);
  };

  const handleOpenEdit = (item: IbuMenyusuiBeneficiary) => {
    setEditingId(item.id);
    setNamaIbu(item.namaIbu);
    setUmur(item.umur);
    setNik(item.nik);
    setAlamat(item.alamat);
    setPuskesmas(item.puskesmas || "Puskesmas Boawae");
    setKelurahan(item.kelurahan || "Desa Nangateke");
    setDusun(item.dusun || "Dusun Nangateke");
    setPosyandu(item.posyandu || "Posyandu Nangateke");
    setBayiNama(item.bayiNama || "");
    setCatatan(item.catatan || "");
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data Ibu Menyusui ini?")) {
      const updated = beneficiaries.filter(b => b.id !== id);
      saveToStorage(updated);
      setSuccessMessage("Data Ibu Menyusui berhasil dihapus.");
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaIbu.trim()) {
      alert("Nama Ibu wajib diisi!");
      return;
    }

    const newItem: IbuMenyusuiBeneficiary = {
      id: editingId || ("ibu_" + Date.now()),
      namaIbu: namaIbu.trim(),
      umur: umur.trim() || "28 Tahun",
      nik: nik.trim() || `5316${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      alamat: alamat.trim() || "Nangateke",
      puskesmas,
      kelurahan,
      dusun,
      posyandu,
      bayiNama: bayiNama.trim(),
      catatan: catatan.trim()
    };

    let updated: IbuMenyusuiBeneficiary[];
    if (editingId) {
      updated = beneficiaries.map(b => (b.id === editingId ? newItem : b));
      setSuccessMessage("Data Ibu Menyusui berhasil diperbarui.");
    } else {
      updated = [newItem, ...beneficiaries];
      setSuccessMessage("Data Ibu Menyusui baru berhasil ditambahkan.");
    }

    saveToStorage(updated);
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
        (b.bayiNama && b.bayiNama.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesSearch;
    });
  }, [beneficiaries, selectedIndividualId, searchTerm]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-rose-600">
            <Heart className="h-6 w-6" />
            <h2 className="text-lg font-black tracking-tight text-slate-900">
              Manajemen Data Ibu Menyusui & Nifas
            </h2>
          </div>
          <p className="text-xs font-medium text-slate-500">
            Pendataan terpusat Ibu Menyusui, NIK, Umur, Alamat, serta pemantauan ASI Eksklusif & PMT.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-rose-600 hover:bg-rose-700 text-white font-black px-5 py-2.5 rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Ibu Menyusui</span>
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
              placeholder="Cari nama ibu, NIK, alamat, atau bayi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          {/* Individual Mother Filter Dropdown */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-rose-600 shrink-0" />
            <select
              value={selectedIndividualId}
              onChange={(e) => setSelectedIndividualId(e.target.value)}
              className="w-full sm:w-60 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 cursor-pointer"
            >
              <option value="ALL">-- Semua Ibu Menyusui (Semua) --</option>
              {beneficiaries.map(b => (
                <option key={b.id} value={b.id}>
                  {b.namaIbu} (NIK: {b.nik.slice(-4)})
                </option>
              ))}
            </select>
          </div>

          {/* Manual Period / Measurement Period Filter */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Calendar className="h-4 w-4 text-rose-600 shrink-0" />
            {isManualPeriod ? (
              <div className="flex items-center space-x-1 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Ketik Periode Manual (Cth: Periode Khusus Mei)"
                  value={customPeriod}
                  onChange={(e) => setCustomPeriod(e.target.value)}
                  className="w-full sm:w-48 bg-slate-50 border border-rose-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
                <button
                  type="button"
                  onClick={() => setIsManualPeriod(false)}
                  className="text-[10px] font-bold text-rose-600 underline cursor-pointer px-1 whitespace-nowrap"
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
                  className="w-full sm:w-48 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 cursor-pointer"
                >
                  <option value="ALL">Semua Periode</option>
                  {PERIOD_OPTIONS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                  <option value="MANUAL_INPUT" className="font-bold text-rose-600">+ Tambah Periode Manual...</option>
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-bold text-slate-600 shrink-0">
          <span className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-xl border border-rose-100">
            Total Ditampilkan: <strong className="font-black text-rose-900">{filteredList.length} Orang</strong>
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
                <th className="p-4">Umur & Bayi</th>
                <th className="p-4">Alamat & Posyandu</th>
                <th className="p-4">Catatan / Status</th>
                <th className="p-4 text-center">Aksi (Edit / Hapus)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 font-bold">
                    Tidak ada data Ibu Menyusui yang ditemukan dengan filter tersebut.
                  </td>
                </tr>
              ) : (
                filteredList.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono text-slate-400 font-bold">{idx + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-slate-900 text-sm">{item.namaIbu}</span>
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-md text-[9px] font-black">
                          Ibu Menyusui
                        </span>
                      </div>
                      <p className="font-mono text-slate-400 text-[11px] mt-0.5">NIK: {item.nik}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{item.umur}</p>
                      {item.bayiNama && (
                        <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">
                          Anak/Bayi: {item.bayiNama}
                        </p>
                      )}
                    </td>
                    <td className="p-4 text-slate-600 leading-tight">
                      <div className="flex items-center space-x-1 font-bold text-slate-800">
                        <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                        <span>{item.alamat} — {item.kelurahan}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.puskesmas} ({item.posyandu})</p>
                    </td>
                    <td className="p-4">
                      <p className="text-slate-600 font-normal max-w-xs">{item.catatan || "ASI Eksklusif"}</p>
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
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl transition-colors flex items-center space-x-1 cursor-pointer"
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
              <div className="flex items-center space-x-2 text-rose-600">
                <Heart className="h-5 w-5" />
                <h3 className="text-sm font-black uppercase text-slate-900">
                  {editingId ? "Edit Data Ibu Menyusui" : "Tambah Data Ibu Menyusui Baru"}
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
                  placeholder="Contoh: Siti Nurhaliza"
                  value={namaIbu}
                  onChange={(e) => setNamaIbu(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
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
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-xs">NIK (16 DIGIT)</label>
                  <input
                    type="text"
                    placeholder="5316..."
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
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
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-xs">KELURAHAN / DESA</label>
                  <input
                    type="text"
                    placeholder="Desa Nangateke"
                    value={kelurahan}
                    onChange={(e) => setKelurahan(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
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
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-xs">NAMA BAYI / ANAK</label>
                  <input
                    type="text"
                    placeholder="Contoh: Adrian Sa"
                    value={bayiNama}
                    onChange={(e) => setBayiNama(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 text-xs">CATATAN / STATUS GIZI</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Menyusui aktif, ASI eksklusif, PMT diterima"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:outline-none resize-none"
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
                  className="bg-rose-600 hover:bg-rose-700 text-white font-black px-5 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-rose-600/20 cursor-pointer"
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
