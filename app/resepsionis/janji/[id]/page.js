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
  Calendar,
  Clock,
  User,
  Stethoscope,
  FileText,
  ArrowLeft,
  CheckCircle,
  XCircle,
  CalendarCheck,
  UserCheck,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

function RincianJanjiResepsionisContent() {
  const routeParams = useParams();
  const id = routeParams?.id;
  const router = useRouter();

  const {
    janjiTemu,
    users,
    layanan,
    updateJanjiStatus,
    rescheduleJanji,
    slotTerisi,
  } = useApp();

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: null,
    title: "",
    message: "",
    variant: "primary",
  });

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [alasanBatal, setAlasanBatal] = useState("");
  const [cancelError, setCancelError] = useState("");

  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [newTanggal, setNewTanggal] = useState("");
  const [newJam, setNewJam] = useState("");
  const [rescheduleError, setRescheduleError] = useState("");

  const janji = janjiTemu.find((j) => j.id === id);

  if (!janji) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <EmptyState
          title="Janji tidak ditemukan"
          description="Janji temu yang Anda cari tidak tersedia."
          actionText="Kembali ke Kelola Janji"
          onAction={() => router.push("/resepsionis/janji")}
        />
      </div>
    );
  }

  const dokter = users.find((u) => u.id === janji.dokterId);
  const pasien = users.find((u) => u.id === janji.pasienId);
  const lyn = layanan.find((l) => l.id === janji.layananId);

  const isLocked = janji.status === "selesai" || janji.status === "dibatalkan";
  const canKonfirmasi = janji.status === "menunggu";
  const canTandaiHadir = janji.status === "dikonfirmasi";
  const canJadwalUlang = !isLocked;
  const canBatalkan = !isLocked;

  const handleKonfirmasiClick = () => {
    setConfirmModal({
      isOpen: true,
      action: () => updateJanjiStatus(janji.id, "dikonfirmasi"),
      title: "Konfirmasi Janji Temu",
      message: `Konfirmasi janji untuk pasien ${pasien?.nama} pada ${formatTanggalIndonesia(janji.tanggal)} jam ${janji.jam}?`,
      variant: "primary",
    });
  };

  const handleTandaiHadirClick = () => {
    setConfirmModal({
      isOpen: true,
      action: () => updateJanjiStatus(janji.id, "hadir"),
      title: "Tandai Pasien Hadir",
      message: `Tandai ${pasien?.nama} telah tiba di klinik? Pasien akan langsung muncul sebagai 'Siap Diperiksa' di dasbor dokter.`,
      variant: "success",
    });
  };

  const handleBatalSubmit = (e) => {
    e.preventDefault();
    if (!alasanBatal.trim()) {
      setCancelError("Alasan pembatalan wajib diisi.");
      return;
    }
    updateJanjiStatus(janji.id, "dibatalkan", alasanBatal.trim());
    setCancelModalOpen(false);
  };

  const handleRescheduleSubmit = (e) => {
    e.preventDefault();
    if (!newTanggal || !newJam) {
      setRescheduleError("Tanggal dan jam baru wajib diisi.");
      return;
    }

    const isBooked = slotTerisi.some(
      (s) =>
        s.dokterId === janji.dokterId &&
        s.tanggal === newTanggal &&
        s.jam === newJam &&
        s.id !== janji.id
    );
    if (isBooked) {
      setRescheduleError("Slot pada jam tersebut sudah terisi. Pilih jam lain.");
      return;
    }

    rescheduleJanji(janji.id, newTanggal, newJam);
    setRescheduleModalOpen(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Link
            href="/resepsionis/janji"
            className="p-2 rounded-lg hover:bg-gray-100 text-[#5A6B78] transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-xs font-semibold text-[#0E7490] tracking-wider uppercase">
              Kelola Janji Resepsionis
            </span>
            <h1 className="text-2xl font-bold text-[#1F2937]">Janji #{janji.id}</h1>
          </div>
        </div>
        <StatusBadge status={janji.status} />
      </div>

      {janji.status === "dibatalkan" && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
          <strong className="block mb-1 font-semibold">Janji Dibatalkan:</strong>
          <span>{janji.alasanBatal || "Tidak ada keterangan pembatalan."}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-100 text-[#0E7490] flex items-center justify-center font-bold text-sm">
              <User className="w-5 h-5 text-[#0E7490]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1F2937]">
                {pasien ? pasien.nama : janji.pasienId}
              </h3>
              <p className="text-xs text-[#5A6B78]">
                Kontak: {pasien?.noHp || "-"} • {pasien?.email}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#F4F7F9]">
            <span className="text-[#5A6B78] block mb-1">Tanggal Kunjungan</span>
            <span className="font-bold text-[#1F2937] text-sm tabular-nums">
              {formatTanggalIndonesia(janji.tanggal)}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F4F7F9]">
            <span className="text-[#5A6B78] block mb-1">Jam Praktik</span>
            <span className="font-bold text-[#0E7490] text-sm tabular-nums">
              {formatJam(janji.jam)}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F4F7F9]">
            <span className="text-[#5A6B78] block mb-1">Dokter Gigi</span>
            <span className="font-bold text-[#1F2937] text-sm">
              {dokter ? dokter.nama : janji.dokterId}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F4F7F9]">
            <span className="text-[#5A6B78] block mb-1">Layanan Perawatan</span>
            <span className="font-bold text-[#1F2937] text-sm">
              {lyn ? lyn.nama : janji.layananId}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-xs">
          <span className="font-semibold text-[#5A6B78] block mb-1">Keluhan Pasien:</span>
          <p className="text-[#1F2937] italic">
            “{janji.keluhan || "Tidak ada keluhan spesifik"}”
          </p>
        </div>
      </div>

      {!isLocked && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#5A6B78] mb-2">
            Tindakan Resepsionis
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {canKonfirmasi && (
              <button
                type="button"
                onClick={handleKonfirmasiClick}
                className="p-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs"
              >
                <CheckCircle className="w-4 h-4" />
                Konfirmasi Janji
              </button>
            )}

            {canTandaiHadir && (
              <button
                type="button"
                onClick={handleTandaiHadirClick}
                className="p-3 rounded-xl bg-[#7C3AED] hover:bg-purple-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs"
              >
                <UserCheck className="w-4 h-4" />
                Tandai Pasien Hadir
              </button>
            )}

            {canJadwalUlang && (
              <button
                type="button"
                onClick={() => {
                  setNewTanggal(janji.tanggal);
                  setNewJam(janji.jam);
                  setRescheduleModalOpen(true);
                }}
                className="p-3 rounded-xl bg-white border border-[#0E7490] text-[#0E7490] hover:bg-cyan-50 text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Jadwal Ulang
              </button>
            )}

            {canBatalkan && (
              <button
                type="button"
                onClick={() => {
                  setAlasanBatal("");
                  setCancelModalOpen(true);
                }}
                className="p-3 rounded-xl bg-white border border-[#E53935] text-[#E53935] hover:bg-red-50 text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <XCircle className="w-4 h-4" />
                Batalkan Janji
              </button>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmVariant={confirmModal.variant}
        onConfirm={() => {
          if (confirmModal.action) confirmModal.action();
        }}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />

      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-100">
            <h3 className="text-base font-bold text-[#1F2937] mb-2">Batalkan Janji Temu</h3>
            <p className="text-xs text-[#5A6B78] mb-4">
              Masukkan alasan pembatalan janji temu ini (wajib diisi):
            </p>

            {cancelError && (
              <div className="p-2.5 rounded-lg bg-red-50 text-xs text-red-700 mb-3">
                {cancelError}
              </div>
            )}

            <form onSubmit={handleBatalSubmit} className="space-y-4">
              <textarea
                rows={3}
                value={alasanBatal}
                onChange={(e) => setAlasanBatal(e.target.value)}
                placeholder="Contoh: Pasien berhalangan hadir karena dinas luar kota..."
                className="w-full p-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-[#0E7490]"
                required
              />
              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-[#E53935] hover:bg-red-700 rounded-lg"
                >
                  Batalkan Janji
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {rescheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-100">
            <h3 className="text-base font-bold text-[#1F2937] mb-2">Jadwal Ulang Janji</h3>
            <p className="text-xs text-[#5A6B78] mb-4">
              Pilih tanggal dan slot jam praktik baru untuk janji ini:
            </p>

            {rescheduleError && (
              <div className="p-2.5 rounded-lg bg-red-50 text-xs text-red-700 mb-3">
                {rescheduleError}
              </div>
            )}

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F2937] mb-1">
                  Tanggal Baru
                </label>
                <input
                  type="date"
                  value={newTanggal}
                  onChange={(e) => setNewTanggal(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-[#0E7490]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2937] mb-1">
                  Jam Baru (Format 10:00)
                </label>
                <input
                  type="text"
                  value={newJam}
                  placeholder="Contoh: 14:00"
                  onChange={(e) => setNewJam(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-[#0E7490] tabular-nums"
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-[#0E7490] hover:bg-[#0b5e75] rounded-lg"
                >
                  Simpan Jadwal Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RincianJanjiResepsionisPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Memuat rincian janji...</div>}>
        <RincianJanjiResepsionisContent />
      </Suspense>
    </AppLayout>
  );
}
