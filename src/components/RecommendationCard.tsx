import { useState, useEffect } from "react";
import { Sparkles, RefreshCw, AlertCircle, FileText, Send, Download } from "lucide-react";
import { getRecommendationsApi } from "../lib/dataService";

interface RecommendationCardProps {
  lastUpdated: string;
  triggerRefresh: number;
}

export default function RecommendationCard({ lastUpdated, triggerRefresh }: RecommendationCardProps) {
  const [recommendation, setRecommendation] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string>("local");

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRecommendationsApi();
      setRecommendation(data.text);
      setSource(data.source);
    } catch (e: any) {
      setError(e.message || "Gagal memproses analisis risiko dan rekomendasi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [triggerRefresh]);

  // A pristine custom formatter to parse markdown blocks and style them beautifully according to Geometric Balance.
  const formatMarkdownToJSX = (text: string) => {
    if (!text) return null;

    const lines = text.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Horizontal rule
      if (trimmed === "---") {
        return <hr key={idx} className="border-t border-slate-200 my-4" />;
      }

      // H3 Title
      if (trimmed.startsWith("###")) {
        const title = trimmed.replace("###", "").trim();
        return (
          <h4 key={idx} className="text-sm font-black text-slate-800 tracking-wider uppercase mt-5 mb-3 border-b pb-1.5 flex items-center space-x-2">
            <span className="w-1.5 h-3.5 bg-emerald-500 inline-block rounded-sm"></span>
            <span>{title}</span>
          </h4>
        );
      }

      // H4 Title
      if (trimmed.startsWith("####")) {
        const title = trimmed.replace("####", "").trim();
        return (
          <h5 key={idx} className="text-xs font-black text-emerald-800 tracking-wide uppercase mt-4 mb-2">
            {title}
          </h5>
        );
      }

      // Bullet points
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        let content = trimmed.substring(1).trim();
        
        // Parse bold text **text**
        const boldRegex = /\*\*(.*?)\*\*/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = boldRegex.exec(content)) !== null) {
          if (match.index > lastIndex) {
            parts.push(content.substring(lastIndex, match.index));
          }
          parts.push(<strong key={match.index} className="font-extrabold text-slate-900">{match[1]}</strong>);
          lastIndex = boldRegex.lastIndex;
        }
        if (lastIndex < content.length) {
          parts.push(content.substring(lastIndex));
        }

        return (
          <li key={idx} className="text-xs font-medium text-slate-600 ml-4 mb-2 list-none relative pl-5">
            <span className="absolute left-0 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            <span>{parts.length > 0 ? parts : content}</span>
          </li>
        );
      }

      // Empty line
      if (trimmed === "") {
        return <div key={idx} className="h-2" />;
      }

      // Standard text with inline bold parsing
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(trimmed)) !== null) {
        if (match.index > lastIndex) {
          parts.push(trimmed.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-extrabold text-slate-900">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < trimmed.length) {
        parts.push(trimmed.substring(lastIndex));
      }

      return (
        <p key={idx} className="text-xs font-medium text-slate-600 leading-relaxed mb-2.5">
          {parts.length > 0 ? parts : trimmed}
        </p>
      );
    });
  };

  const handleExport = () => {
    const element = document.createElement("a");
    const file = new Blob([recommendation], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "Rekomendasi_Kebijakan_Orbit_Gizi.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-full" id="recommendation-card">
      {/* Header */}
      <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4.5 w-4.5 text-emerald-500 animate-pulse" />
          <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase">
            ANALISIS REKOMENDASI KEBIJAKAN STRATEGIS
          </h3>
        </div>
        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="text-slate-400 hover:text-emerald-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          title="Generasi Ulang Rekomendasi"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-emerald-600" : ""}`} />
        </button>
      </div>

      {/* Body content */}
      <div className="p-5 flex-1 overflow-y-auto max-h-[380px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center h-full">
            {/* Geometric loading spinner */}
            <div className="relative h-12 w-12 mb-4">
              <div className="absolute inset-0 rounded-lg border-4 border-slate-100"></div>
              <div className="absolute inset-0 rounded-lg border-4 border-emerald-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-xs font-bold text-slate-500">Menganalisis indikator dan risiko spasial desa...</p>
            <p className="text-[10px] text-slate-400 mt-1">Mengintegrasikan data indikator untuk merumuskan kebijakan secara dinamis</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10 text-center h-full">
            <AlertCircle className="h-10 w-10 text-rose-500 mb-2" />
            <p className="text-xs font-bold text-slate-700">{error}</p>
            <button
              onClick={fetchRecommendations}
              className="mt-3 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 px-3 py-1.5 rounded-lg transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <div className="prose prose-slate max-w-none">
            {formatMarkdownToJSX(recommendation)}
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="border-t border-slate-100 px-5 py-3.5 bg-slate-50/50 flex items-center justify-between mt-auto">
        <div className="text-[10px] text-slate-400 font-mono">
          Sistem Orbit Gizi Terintegrasi
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleExport}
            disabled={loading || !recommendation}
            className="flex items-center space-x-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Unduh Laporan</span>
          </button>
          <button
            onClick={() => alert("Notifikasi koordinasi intervensi gizi telah berhasil dikirimkan ke OPD: Dinkes, PKK, Pemdes, BGN, & Puskesmas secara real-time.")}
            className="flex items-center space-x-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Kirim Notifikasi OPD</span>
          </button>
        </div>
      </div>
    </div>
  );
}
