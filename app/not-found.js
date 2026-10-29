import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F4F7F9] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-14 h-14 bg-red-50 text-[#E53935] rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[#1F2937] mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-sm text-[#5A6B78] mb-6">
          Maaf, alamat yang Anda tuju tidak tersedia atau telah dipindahkan.
        </p>
        <Link
          href="/beranda"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0E7490] hover:bg-[#0b5e75] text-white text-sm font-semibold rounded-xl transition shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
