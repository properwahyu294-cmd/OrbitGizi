import React, { useState, useRef } from "react";
import { Image as ImageIcon, Plus, Trash2, Sparkles, X, ChevronRight, ChevronLeft, UploadCloud, Link as LinkIcon, Laptop, CheckCircle2, RefreshCw } from "lucide-react";

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

export const DEFAULT_NUTRITION_IMAGES: BannerImage[] = [];

// Helper function to compress and read image file into Base64 Data URL
const compressAndReadImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("File yang dipilih bukan gambar (JPG, PNG, WEBP, GIF)."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca file dari perangkat."));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Format gambar tidak didukung atau file rusak."));
      img.onload = () => {
        const MAX_DIMENSION = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const NutritionBannerGallery: React.FC<NutritionBannerGalleryProps> = ({
  images,
  onAddImage,
  onDeleteImage,
  title = "Galeri Banner & Aktivitas Gizi",
  subtitle = "Dokumentasi visual kegiatan Posyandu, MBG, dan penanganan gizi masyarakat.",
  readOnly = false
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = async (file: File) => {
    try {
      setIsCompressing(true);
      const compressedDataUrl = await compressAndReadImage(file);
      setPreviewImage(compressedDataUrl);
      setNewUrl(compressedDataUrl);
      if (!newTitle) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setNewTitle(nameWithoutExt);
      }
    } catch (err: any) {
      alert(err?.message || "Gagal memproses file gambar.");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = uploadMode === "file" ? previewImage : newUrl.trim();
    if (!newTitle.trim() || !finalUrl) {
      alert("Harap unggah file foto dari laptop/perangkat atau masukkan URL terlebih dahulu.");
      return;
    }
    if (images.length >= 10) {
      alert("Maksimal 10 gambar yang dapat disimpan.");
      return;
    }
    onAddImage({
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || "Aktivitas Gizi Orbit Gizi Nagekeo",
      url: finalUrl
    });
    setNewTitle("");
    setNewSubtitle("");
    setNewUrl("");
    setPreviewImage(null);
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
              onClick={() => {
                setShowAddModal(true);
                setPreviewImage(null);
                setUploadMode("file");
              }}
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

      {/* ADD IMAGE MODAL WITH DIRECT FILE UPLOAD */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white">Tambah Gambar Galeri</h4>
                  <p className="text-xs text-slate-400">Unggah foto dari Laptop / Browser (Tersimpan: {images.length}/10)</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Upload Method Switcher */}
            <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setUploadMode("file")}
                className={`flex-1 py-2 px-3 rounded-xl font-black flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  uploadMode === "file"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Laptop className="h-3.5 w-3.5" />
                <span>Upload dari Laptop / Perangkat</span>
              </button>

              <button
                type="button"
                onClick={() => setUploadMode("url")}
                className={`flex-1 py-2 px-3 rounded-xl font-black flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  uploadMode === "url"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <LinkIcon className="h-3.5 w-3.5" />
                <span>Tautan URL</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* FILE UPLOAD ZONE */}
              {uploadMode === "file" ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Pilih File Gambar
                  </label>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelected(e.target.files[0]);
                      }
                    }}
                  />

                  {previewImage ? (
                    <div className="relative rounded-2xl border border-emerald-500/50 bg-slate-950 overflow-hidden group aspect-video flex items-center justify-center">
                      <img
                        src={previewImage}
                        alt="Pratinjau Foto"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4 text-center">
                        <span className="text-xs font-bold text-white flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Gambar Berhasil Dimuat
                        </span>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center space-x-1.5"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span>Ganti Gambar Lain</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 ${
                        dragActive
                          ? "border-emerald-400 bg-emerald-500/10 scale-[1.01]"
                          : "border-slate-700 bg-slate-950/60 hover:border-emerald-500/60 hover:bg-slate-950"
                      }`}
                    >
                      {isCompressing ? (
                        <div className="flex flex-col items-center space-y-2 py-4">
                          <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin" />
                          <span className="text-xs text-slate-300 font-bold">Mengompres & Memproses Foto...</span>
                        </div>
                      ) : (
                        <>
                          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
                            <UploadCloud className="h-8 w-8" />
                          </div>
                          <div>
                            <span className="text-xs font-black text-white block">
                              Klik atau Seret & Lepas Foto di Sini
                            </span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              Mendukung format JPG, PNG, WEBP, GIF dari Laptop / Komputer / HP
                            </span>
                          </div>
                          <button
                            type="button"
                            className="mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-colors"
                          >
                            Pilih File dari Laptop
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* URL INPUT FALLBACK */
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    URL Gambar (Tautan Langsung)
                  </label>
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => {
                      setNewUrl(e.target.value);
                      setPreviewImage(e.target.value);
                    }}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl text-white text-xs outline-none font-mono"
                  />
                  <p className="text-[11px] text-slate-400">Salin URL gambar publik dari internet jika ada.</p>
                </div>
              )}

              {/* TITLE & SUBTITLE INPUTS */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Judul Kegiatan / Foto <span className="text-rose-400">*</span>
                </label>
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
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Keterangan Singkat / Subtitle
                </label>
                <input
                  type="text"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  placeholder="Contoh: Pendampingan pemberian MBG dan PMT bulanan"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl text-white text-xs outline-none"
                />
              </div>

              {/* ACTION BUTTONS */}
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
                  disabled={isCompressing || (!previewImage && !newUrl)}
                  className={`px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg cursor-pointer flex items-center space-x-1.5 ${
                    isCompressing || (!previewImage && !newUrl) ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Simpan Gambar Ke Galeri</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

