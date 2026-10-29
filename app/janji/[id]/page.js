"use client";

import React, { useState, useEffect, Suspense } from "react";
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
  XCircle,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

function RincianJanjiContent() {
  const routeParams = useParams();
  const id = routeParams?.id;
  const router = useRouter();

  const { currentUser, janjiTemu, users, layanan, updateJanjiStatus } = useApp();
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const janji = janjiTemu.find((j) => j.id === id);

  // Pasien hanya boleh melihat janji miliknya (PRD Bab 4.3.2 & Bab 8)
  const isUnauthorized = currentUser?.role === "pasien" && janji?.pasienId !== currentUser?.id;

  if (!janji || isUnauthorized) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <EmptyState
          title="Janji tidak ditemukan"
          description="Janji temu yang Anda cari tidak tersedia atau ID janji salah."
          actionText="Kembali ke Daftar Janji"
          onAction={() => router.push("/janji")}
        />
      </div>
    );
  }

  const dokter = users.find((u) => u.id === janji.dokterId);
  const pasien = users.find((u) => u.id === janji.pasienId);
  const lyn = layanan.find((l) => l.id === janji.layananId);

  const [todayStr, setTodayStr] = useState("");
  useEffect(() => {
    setTodayStr(new Date().toISOString().split("T")[0]);
  }, []);

  const isAtLeastHMinusOne = todayStr ? janji.tanggal > todayStr : true;
  const canCancel =
    (janji.status === "menunggu" || janji.status === "dikonfirmasi") && isAtLeastHMinusOne;

  const handleCancel = () => {
    updateJanjiStatus(janji.id, "dibatalkan", "Dibatalkan oleh pasien.");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Link
            href="/janji"
            className="p-2 rounded-lg hover:bg-gray-100 text-[#5A6B78] transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-xs font-semibold text-[#0E7490] tracking-wider uppercase">
              Rincian Janji Temu
            </span>
            <h1 className="text-2xl font-bold text-[#1F2937]">Kode: {janji.id}</h1>
          </div>
        </div>
        <StatusBadge status={janji.status} />
      </div>

      {janji.status === "dibatalkan" && janji.alasanBatal && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
          <strong className="font-semibold block mb-1 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-[#E53935]" />
            Alasan Pembatalan:
          </strong>
          <span>{janji.alasanBatal}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="p-4 rounded-xl bg-[#F4F7F9]">
            <span className="text-xs text-[#5A6B78] flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-[#0E7490]" /> Tanggal
            </span>
            <span className="text-sm font-bold text-[#1F2937] tabular-nums">
              {formatTanggalIndonesia(janji.tanggal)}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#F4F7F9]">
            <span className="text-xs text-[#5A6B78] flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-[#0E7490]" /> Jam Praktik
            </span>
            <span className="text-sm font-bold text-[#0E7490] tabular-nums">
              {formatJam(janji.jam)}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#F4F7F9]">
            <span className="text-xs text-[#5A6B78] flex items-center gap-1.5 mb-1">
              <Stethoscope className="w-3.5 h-3.5 text-[#0E7490]" /> Dokter Gigi
            </span>
            <span className="text-sm font-bold text-[#1F2937]">
              {dokter ? dokter.nama : janji.dokterId}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#F4F7F9]">
            <span className="text-xs text-[#5A6B78] flex items-center gap-1.5 mb-1">
              <FileText className="w-3.5 h-3.5 text-[#0E7490]" /> Layanan
            </span>
            <span className="text-sm font-bold text-[#1F2937]">
              {lyn ? lyn.nama : janji.layananId}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
          <span className="text-xs font-semibold text-[#5A6B78] block mb-1">
            Keluhan Pasien:
          </span>
          <p className="text-sm text-[#1F2937] italic">
            “{janji.keluhan || "Tidak ada catatan keluhan"}”
          </p>
        </div>

        <div className="text-[11px] text-[#5A6B78] flex justify-between items-center pt-2 border-t border-gray-100">
          <span>Dibuat pada: {new Date(janji.dibuatPada).toLocaleString("id-ID")}</span>
          <span>Pasien: {pasien ? pasien.nama : janji.pasienId}</span>
        </div>
      </div>

      {canCancel && (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setConfirmCancelOpen(true)}
            className="w-full py-2.5 px-4 bg-white border border-[#E53935] text-[#E53935] hover:bg-red-50 text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Batalkan Janji Ini
          </button>
          <p className="text-[11px] text-[#5A6B78] text-center mt-2">
            Pembatalan oleh pasien hanya dapat dilakukan paling lambat H-1 tanggal janji.
          </p>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmCancelOpen}
        title="Konfirmasi Batalkan Janji"
        message="Apakah Anda yakin ingin membatalkan janji temu ini? Slot jam dokter akan dilepaskan dan kembali kosong."
        confirmLabel="Ya, Batalkan Janji"
        confirmVariant="danger"
        onConfirm={handleCancel}
        onClose={() => setConfirmCancelOpen(false)}
      />
    </div>
  );
}

export default function RincianJanjiPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Memuat rincian janji...</div>}>
        <RincianJanjiContent />
      </Suspense>
    </AppLayout>
  );
}
