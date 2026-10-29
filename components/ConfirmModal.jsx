"use client";

import { AlertTriangle } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  title = "Konfirmasi Tindakan",
  message = "Apakah Anda yakin ingin melanjutkan tindakan ini?",
  confirmLabel = "Ya, Lanjutkan",
  cancelLabel = "Batal",
  confirmVariant = "primary", // primary, danger, success
  onConfirm,
  onClose,
}) {
  if (!isOpen) return null;

  let btnColor = "bg-[#0E7490] hover:bg-[#0b5e75] text-white";
  if (confirmVariant === "danger") {
    btnColor = "bg-[#E53935] hover:bg-[#c92f2b] text-white";
  } else if (confirmVariant === "success") {
    btnColor = "bg-[#15A66A] hover:bg-[#0f8553] text-white";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-full bg-amber-50 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-[#1F2937]">{title}</h3>
        </div>
        <p className="text-sm text-[#5A6B78] mb-6 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${btnColor}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
