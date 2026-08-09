import React, { useState } from "react";
import { Image as ImageIcon, Plus, Trash2, Sparkles, X, ChevronRight, ChevronLeft } from "lucide-react";

export interface BannerImage {
  id: string;
  title: string;
  subtitle: string;
  url: string;
}

interface NutritionBannerGalleryProps {
  images: BannerImage[];
  onAddImage: (img: { title: string; subtitle: string; url: string }) => void;
  onDeleteImage: (id: string) => void;
  title?: string;
  subtitle?: string;
  readOnly?: boolean;
}

export const DEFAULT_NUTRITION_IMAGES: BannerImage[] = [
  {
    id: "img_1",
    title: "Edukasi Gizi Seimbang",
    subtitle: "Penyuluhan pentingnya 4 Sehat 5 Sempurna di Posyandu Melati.",
    url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1600"
  },
  {
    id: "img_2",
    title: "Distribusi PMT Balita",
    subtitle: "Pembagian makanan tambahan bergizi untuk balita wilayah Nagekeo.",
    url: "https://images.unsplash.com/photo-1490818387583-1b5ba41f9d45?auto=format&fit=crop&q=80&w=1600"
  },
  {
    id: "img_3",
    title: "Pemeriksaan Ibu Hamil",
    subtitle: "Pemantauan berkala kesehatan ibu hamil untuk cegah bayi risiko stunting.",
    url: "https://images.unsplash.com/photo-1555243896-771a80052717?auto=format&fit=crop&q=80&w=1600"
  }
];

export const NutritionBannerGallery: React.FC<NutritionBannerGalleryProps> = ({
  images,
  onAddImage,
  onDeleteImage,
  title = "Galeri Banner & Aktivitas Gizi",
  subtitle = "Dokumentasi visual kegiatan Posyandu, MBG, dan penanganan gizi masyarakat.",
  readOnly = false
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;
    if (images.length >= 10) {
      alert("Maksimal 10 gambar yang dapat disimpan.");
      return;
    }
    onAddImage({
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || "Aktivitas Gizi Orbit Gizi",
      url: newUrl.trim()
    });
    setNewTitle("");
    setNewSubtitle("");
    setNewUrl("");
    setShowAddModal(false);
  };

  const activeImage = images[activeIndex] || images[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">
            DOKUMENTASI & GALERI VISUAL
          </span>
          <h3 className="text-lg font-black text-white">{title}</h3>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-mono font-bold bg-slate-800 text-emerald-300 px-3 py-1.5 rounded-xl border border-slate-700">
            {images.length} / 10 Gambar
          </span>

          {!readOnly && images.length < 10 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl flex items-center space-x-1.5 shadow-lg cursor-pointer transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Gambar</span>
            </button>
          )}
        </div>
      </div>

      {/* FEATURED BANNER CAROUSEL / SPOTLIGHT */}
      {images.length > 0 && (
        <div className="relative rounded-3xl overflow-hidden border border-emerald-500/30 bg-slate-950 shadow-2xl group aspect-[21/9] sm:aspect-[24/9]">
          <img
            src={activeImage?.url}
            alt={activeImage?.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-85"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 flex flex-col justify-end space-y-2">
            <div className="inline-flex items-center space-x-1.5 bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider w-max">
              <Sparkles className="h-3 w-3" />
              <span>Sorotan Gizi Nagekeo ({activeIndex + 1} dari {images.length})</span>
            </div>
            <h4 className="text-lg sm:text-2xl font-black text-white drop-shadow-md">
              {activeImage?.title}
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium line-clamp-2">
              {activeImage?.subtitle}
            </p>
          </div>

          {/* Controls */}
          <div className="absolute top-4 right-4 flex items-center space-x-2 bg-slate-950/80 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
              className="p-1.5 text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-mono font-bold text-emerald-400 px-2">
              {activeIndex + 1}/{images.length}
            </span>
            <button
              onClick={() => setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
              className="p-1.5 text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* THUMBNAILS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {images.map((img, idx) => (
          <div
            key={img.id}
            onClick={() => setActiveIndex(idx)}
            className={`relative rounded-2xl overflow-hidden border cursor-pointer aspect-video group transition-all ${
              activeIndex === idx
                ? "border-emerald-400 ring-2 ring-emerald-400/40 shadow-lg scale-[1.02]"
                : "border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100"
            }`}
          >
            <img
              src={img.url}
              alt={img.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent p-2.5 flex flex-col justify-end">
              <span className="text-[10px] font-black text-white truncate drop-shadow">
                {img.title}
              </span>
            </div>
            {!readOnly && images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Hapus gambar ini dari galeri?")) {
                    onDeleteImage(img.id);
                    if (activeIndex >= images.length - 1) {
                      setActiveIndex(Math.max(0, images.length - 2));
                    }
                  }
                }}
                className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 shadow"
                title="Hapus gambar"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ADD IMAGE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white">Tambah Gambar Galeri</h4>
                  <p className="text-xs text-slate-400">Total tersimpan: {images.length} / 10</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Judul Kegiatan / Banner</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Penyuluhan Gizi Balita Boawae"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl text-white text-xs outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Keterangan / Subtitle</label>
                <input
                  type="text"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  placeholder="Contoh: Kegiatan rutin bulanan Posyandu"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl text-white text-xs outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">URL Gambar (Direct Link / Unsplash)</label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl text-white text-xs outline-none font-mono"
                  required
                />
                <p className="text-[11px] text-slate-400">Anda dapat menyalin URL gambar dari internet atau menggunakan tautan Unsplash.</p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg cursor-pointer"
                >
                  Simpan Gambar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
