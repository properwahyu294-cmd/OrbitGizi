import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: React.ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends (React.Component as new (props: Props) => any) {
  constructor(props: Props) {
    super(props);
    (this as any).state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: any) {
    console.error("Uncaught Error caught by ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    (this as any).setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    const state = (this as any).state as State;
    const props = (this as any).props as Props;

    if (state.hasError) {
      return (
        <div className="min-h-[400px] w-full p-6 flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-3xl text-center space-y-4 shadow-sm my-6">
          <div className="p-3 bg-rose-100 rounded-2xl border border-rose-200">
            <AlertTriangle className="h-8 w-8 text-rose-600" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-base font-bold text-slate-800">
              {props.fallbackMessage || "Terjadi Kendala Tampilan Sementara"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Data Anda telah tersimpan dan tersinkronisasi dengan aman. Tekan tombol di bawah untuk memuat ulang tampilan secara normal.
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-xs cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Muat Ulang Tampilan</span>
          </button>
        </div>
      );
    }

    return props.children;
  }
}
