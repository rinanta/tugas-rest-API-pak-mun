"use client";

import React from "react";
import AppLayout from "@/components/AppLayout";
import { EmptyState } from "@/components/FeedbackState";
import { useApp } from "@/context/AppContext";
import { formatTanggalIndonesia } from "@/lib/formatters";
import { FileText, Calendar, Stethoscope, Clock, ShieldCheck, HeartPulse } from "lucide-react";

export default function RiwayatPerawatanPage() {
  const { currentUser, janjiTemu, catatanPerawatan, users, layanan } = useApp();

  // Find all completed appointments for this patient
  const completedAppointments = janjiTemu
    .filter(
      (j) =>
        j.status === "selesai" &&
        (j.pasienId === currentUser?.id || currentUser?.role === "super_admin")
    )
    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

  const getDokter = (dokterId) => users.find((u) => u.id === dokterId);
  const getLayanan = (layananId) => layanan.find((l) => l.id === layananId);
  const getCatatan = (janjiId) => catatanPerawatan.find((c) => c.janjiId === janjiId);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="pb-5 border-b border-gray-100">
          <span className="text-xs font-semibold text-[#0E7490] tracking-wider uppercase">
            Catatan Medis Pasien
          </span>
          <h1 className="text-2xl font-bold text-[#1F2937] mt-1">Riwayat Perawatan</h1>
          <p className="text-xs text-[#5A6B78] mt-1">
            Daftar riwayat pemeriksaan gigi dan instruksi perawatan dari dokter untuk kunjungan yang telah selesai.
          </p>
        </div>

        {/* Content list or empty state */}
        {completedAppointments.length === 0 ? (
          <EmptyState
            title="Belum Ada Riwayat Perawatan"
            description="Riwayat perawatan akan otomatis muncul di sini setelah dokter menandai kunjungan Anda 'Selesai' dan mengisi tindakan serta catatan."
          />
        ) : (
          <div className="space-y-4">
            {completedAppointments.map((j) => {
              const doc = getDokter(j.dokterId);
              const lyn = getLayanan(j.layananId);
              const cat = getCatatan(j.id);

              return (
                <div
                  key={j.id}
                  className="bg-white rounded-2xl border border-gray-200/90 p-6 shadow-xs hover:border-[#0E7490]/40 transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-emerald-50 text-[#15A66A]">
                        <ShieldCheck className="w-4 h-4" />
                      </span>
                      <div>
                        <h3 className="font-bold text-sm text-[#1F2937]">
                          {lyn ? lyn.nama : j.layananId}
                        </h3>
                        <p className="text-xs text-[#5A6B78] flex items-center gap-1">
                          <Stethoscope className="w-3.5 h-3.5 text-[#0E7490]" />
                          {doc ? doc.nama : j.dokterId}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-[#1F2937] tabular-nums bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 self-start sm:self-auto flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#0E7490]" />
                      {formatTanggalIndonesia(j.tanggal)}
                    </div>
                  </div>

                  {/* Keluhan & Tindakan */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-[#F4F7F9] p-3.5 rounded-xl">
                      <span className="font-semibold text-[#5A6B78] block mb-1">
                        Keluhan Saat Datang:
                      </span>
                      <p className="text-[#1F2937] italic">
                        “{j.keluhan || "Pemeriksaan berkala"}”
                      </p>
                    </div>

                    <div className="bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-xl">
                      <span className="font-semibold text-emerald-800 block mb-1 flex items-center gap-1">
                        <HeartPulse className="w-3.5 h-3.5 text-[#15A66A]" />
                        Tindakan Dokter:
                      </span>
                      <p className="text-[#1F2937] font-medium">
                        {cat?.tindakan || "Pemeriksaan dan tindakan klinis"}
                      </p>
                    </div>
                  </div>

                  {/* Catatan Dokter */}
                  {cat?.catatan && (
                    <div className="p-4 rounded-xl bg-cyan-50/40 border border-cyan-100 text-xs">
                      <span className="font-semibold text-[#0E7490] block mb-1">
                        Catatan & Saran Pasca Perawatan:
                      </span>
                      <p className="text-[#1F2937] leading-relaxed whitespace-pre-line">
                        {cat.catatan}
                      </p>
                    </div>
                  )}

                  <div className="text-[10px] text-[#5A6B78] text-right">
                    ID Kunjungan: {j.id}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
