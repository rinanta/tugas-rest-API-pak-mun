"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import ConfirmModal from "@/components/ConfirmModal";
import { EmptyState } from "@/components/FeedbackState";
import { useApp } from "@/context/AppContext";
import { formatTanggalIndonesia, formatJam } from "@/lib/formatters";
import {
  Stethoscope,
  Calendar,
  Clock,
  User,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  History,
  HeartPulse,
} from "lucide-react";

function PemeriksaanDokterContent() {
  const routeParams = useParams();
  const id = routeParams?.id;
  const router = useRouter();

  const { currentUser, janjiTemu, users, layanan, catatanPerawatan, submitPemeriksaan } = useApp();

  const [tindakan, setTindakan] = useState("");
  const [catatan, setCatatan] = useState("");
  const [error, setError] = useState("");
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const janji = janjiTemu.find((j) => j.id === id);

  // Dokter hanya boleh membuka janji miliknya sendiri (PRD Bab 4.10 & Bab 8)
  const isDifferentDoctor = currentUser?.role === "dokter" && janji?.dokterId !== currentUser?.id;

  if (!janji || isDifferentDoctor) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <EmptyState
          title="Janji tidak ditemukan"
          description="Janji pemeriksaan yang Anda cari tidak tersedia atau bukan jadwal pasien Anda."
          actionText="Kembali ke Dasbor Dokter"
          onAction={() => router.push("/dokter")}
        />
      </div>
    );
  }

  const dokter = users.find((u) => u.id === janji.dokterId);
  const pasien = users.find((u) => u.id === janji.pasienId);
  const lyn = layanan.find((l) => l.id === janji.layananId);
  const existingCatatan = catatanPerawatan.find((c) => c.janjiId === janji.id);

  const isCompleted = janji.status === "selesai";
  const canSubmit = janji.status === "hadir";

  const handleFinishSubmit = () => {
    if (!tindakan.trim()) {
      setError("Tindakan dokter wajib diisi.");
      return;
    }
    if (!catatan.trim()) {
      setError("Catatan dokter wajib diisi.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      submitPemeriksaan(janji.id, tindakan.trim(), catatan.trim());
      setLoading(false);
      router.push("/dokter");
    }, 400);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Link
            href="/dokter"
            className="p-2 rounded-lg hover:bg-gray-100 text-[#5A6B78] transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-xs font-semibold text-[#0E7490] tracking-wider uppercase">
              Pemeriksaan Klinis
            </span>
            <h1 className="text-2xl font-bold text-[#1F2937]">Pemeriksaan Pasien</h1>
          </div>
        </div>
        <StatusBadge status={janji.status} />
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#E53935]" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-100 text-[#0E7490] flex items-center justify-center font-bold text-sm">
              <User className="w-5 h-5 text-[#0E7490]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1F2937]">
                {pasien?.nama || janji.pasienId}
              </h3>
              <p className="text-xs text-[#5A6B78]">
                {pasien?.noHp ? `HP: ${pasien.noHp}` : "Pasien Terdaftar"}
              </p>
            </div>
          </div>

          <Link
            href={`/dokter/pasien/${janji.pasienId}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-[#0E7490] rounded-lg text-xs font-semibold transition border border-cyan-100 self-start sm:self-auto"
          >
            <History className="w-3.5 h-3.5" />
            Lihat Riwayat Pasien
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-[#F4F7F9] rounded-xl">
            <span className="text-[#5A6B78] block mb-0.5">Layanan yang Dipesan</span>
            <span className="font-bold text-[#1F2937] text-sm">
              {lyn?.nama || janji.layananId}
            </span>
          </div>
          <div className="p-3 bg-[#F4F7F9] rounded-xl">
            <span className="text-[#5A6B78] block mb-0.5">Waktu Kunjungan</span>
            <span className="font-bold text-[#0E7490] text-sm tabular-nums">
              {formatTanggalIndonesia(janji.tanggal)} • {formatJam(janji.jam)}
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl text-xs">
          <span className="font-semibold text-amber-900 block mb-1">Keluhan Pasien:</span>
          <p className="text-[#1F2937] italic">
            “{janji.keluhan || "Pemeriksaan rutin"}”
          </p>
        </div>
      </div>

      {canSubmit && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <h3 className="font-bold text-sm text-[#1F2937] flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-[#0E7490]" />
            Form Catatan Perawatan & Tindakan
          </h3>

          <div>
            <label className="block text-xs font-semibold text-[#1F2937] mb-1">
              Tindakan Medis <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Contoh: Tambal gigi dengan komposit pada molar 2 kiri bawah..."
              value={tindakan}
              onChange={(e) => setTindakan(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-[#0E7490]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F2937] mb-1">
              Catatan & Saran untuk Pasien <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Contoh: Hindari makanan keras dan minuman dingin selama 24 jam..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-[#0E7490]"
              required
            />
          </div>

          <button
            type="button"
            onClick={() => {
              if (!tindakan.trim() || !catatan.trim()) {
                setError("Tindakan dan Catatan dokter wajib diisi.");
                return;
              }
              setError("");
              setConfirmModalOpen(true);
            }}
            className="w-full py-3 bg-[#15A66A] hover:bg-[#0f8553] text-white text-xs font-semibold rounded-xl transition shadow-xs flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Tandai Selesai
          </button>
        </div>
      )}

      {isCompleted && existingCatatan && (
        <div className="bg-white rounded-2xl border border-emerald-200 p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#15A66A] uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            Pemeriksaan Telah Diselesaikan
          </div>

          <div className="p-4 bg-emerald-50/50 rounded-xl text-xs space-y-2 border border-emerald-100">
            <div>
              <span className="font-semibold text-emerald-900 block">Tindakan Dokter:</span>
              <p className="text-[#1F2937] mt-0.5">{existingCatatan.tindakan}</p>
            </div>
            <div className="pt-2 border-t border-emerald-100">
              <span className="font-semibold text-emerald-900 block">Catatan & Anjuran:</span>
              <p className="text-[#1F2937] mt-0.5 whitespace-pre-line">{existingCatatan.catatan}</p>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModalOpen}
        title="Konfirmasi Selesai Pemeriksaan"
        message={`Tandai pemeriksaan ${pasien?.nama} selesai? Catatan perawatan akan otomatis disimpan dan langsung dapat dibaca oleh pasien di menu Riwayat Perawatan.`}
        confirmLabel="Ya, Tandai Selesai"
        confirmVariant="success"
        onConfirm={handleFinishSubmit}
        onClose={() => setConfirmModalOpen(false)}
      />
    </div>
  );
}

export default function PemeriksaanDokterPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Memuat data pemeriksaan...</div>}>
        <PemeriksaanDokterContent />
      </Suspense>
    </AppLayout>
  );
}
