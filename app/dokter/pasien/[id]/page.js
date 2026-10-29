"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import { EmptyState } from "@/components/FeedbackState";
import { useApp } from "@/context/AppContext";
import { formatTanggalIndonesia } from "@/lib/formatters";
import {
  History,
  Calendar,
  Stethoscope,
  ArrowLeft,
  User,
  HeartPulse,
  ShieldAlert,
} from "lucide-react";

function RiwayatPasienDokterContent() {
  const routeParams = useParams();
  const id = routeParams?.id;
  const router = useRouter();

  const { currentUser, users, catatanPerawatan, janjiTemu, layanan } = useApp();

  const pasien = users.find((u) => u.id === id);

  // Dokter hanya bisa membaca catatan pasien yang pernah ia tangani sendiri (PRD Bab 2.3, 4.11)
  const patientRecords = catatanPerawatan.filter(
    (c) =>
      c.pasienId === id &&
      (currentUser?.role === "super_admin" || c.dokterId === currentUser?.id)
  );

  if (!pasien || patientRecords.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <EmptyState
          title="Pasien tidak ditemukan"
          description="Pasien ini belum pernah Anda tangani atau riwayat perawatannya tidak tersedia."
          actionText="Kembali ke Dasbor Dokter"
          onAction={() => router.push("/dokter")}
        />
      </div>
    );
  }

  const getLayananName = (janjiId) => {
    const j = janjiTemu.find((item) => item.id === janjiId);
    if (!j) return "Pemeriksaan Gigi";
    const l = layanan.find((item) => item.id === j.layananId);
    return l ? l.nama : j.layananId;
  };

  const getJanjiDate = (janjiId) => {
    const j = janjiTemu.find((item) => item.id === janjiId);
    return j ? j.tanggal : "";
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 text-[#5A6B78] transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs font-semibold text-[#0E7490] tracking-wider uppercase">
              Riwayat Pasien
            </span>
            <h1 className="text-2xl font-bold text-[#1F2937]">{pasien.nama}</h1>
          </div>
        </div>
        <span className="text-xs bg-cyan-100 text-[#0E7490] px-3 py-1 rounded-full font-semibold">
          {patientRecords.length} Kunjungan
        </span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 text-xs text-[#5A6B78] flex flex-wrap gap-4 items-center justify-between">
        <span>Email: <strong className="text-[#1F2937]">{pasien.email}</strong></span>
        <span>No HP: <strong className="text-[#1F2937]">{pasien.noHp || "-"}</strong></span>
        <span>Status: <strong className="text-emerald-700">Aktif</strong></span>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold text-[#1F2937] flex items-center gap-2">
          <History className="w-4 h-4 text-[#0E7490]" />
          Catatan Perawatan Sebelumnya
        </h2>

        {patientRecords.map((rec) => {
          const tanggal = getJanjiDate(rec.janjiId);
          const layananName = getLayananName(rec.janjiId);

          return (
            <div
              key={rec.id}
              className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="font-bold text-xs text-[#1F2937] flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-[#0E7490]" />
                  {layananName}
                </span>
                <span className="text-xs text-[#5A6B78] tabular-nums font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#5A6B78]" />
                  {tanggal ? formatTanggalIndonesia(tanggal) : "-"}
                </span>
              </div>

              <div className="text-xs space-y-2">
                <div className="bg-[#F4F7F9] p-3 rounded-xl">
                  <span className="font-semibold text-[#5A6B78] block mb-0.5">
                    Tindakan:
                  </span>
                  <p className="text-[#1F2937] font-medium">{rec.tindakan}</p>
                </div>

                <div className="bg-cyan-50/40 border border-cyan-100 p-3 rounded-xl">
                  <span className="font-semibold text-[#0E7490] block mb-0.5">
                    Catatan Dokter:
                  </span>
                  <p className="text-[#1F2937] whitespace-pre-line">{rec.catatan}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function RiwayatPasienDokterPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Memuat riwayat pasien...</div>}>
        <RiwayatPasienDokterContent />
      </Suspense>
    </AppLayout>
  );
}
