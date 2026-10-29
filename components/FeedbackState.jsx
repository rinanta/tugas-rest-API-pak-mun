"use client";

import { Loader2, Inbox, AlertCircle, RefreshCw } from "lucide-react";

export function LoadingState({ message = "Memuat data..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <Loader2 className="w-8 h-8 text-[#0E7490] animate-spin mb-3" />
      <p className="text-sm text-[#5A6B78]">{message}</p>
    </div>
  );
}

export function EmptyState({
  title = "Belum Ada Data",
  description = "Tidak ada informasi yang dapat ditampilkan saat ini.",
  actionText,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-xl border border-dashed border-gray-200 p-8 my-4">
      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3 text-[#5A6B78]">
        <Inbox className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-[#1F2937] mb-1">{title}</h4>
      <p className="text-sm text-[#5A6B78] max-w-sm mb-4">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#0E7490] hover:bg-[#0b5e75] rounded-lg transition shadow-xs"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

export function ErrorState({
  title = "Terjadi Kesalahan",
  message = "Gagal memuat data dari server.",
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-red-50/50 rounded-xl border border-red-200 p-8 my-4">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3 text-[#E53935]">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-[#1F2937] mb-1">{title}</h4>
      <p className="text-sm text-[#5A6B78] max-w-sm mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0E7490] bg-white border border-[#0E7490] hover:bg-sky-50 rounded-lg transition"
        >
          <RefreshCw className="w-4 h-4" />
          Coba lagi
        </button>
      )}
    </div>
  );
}
