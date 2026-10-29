"use client";

import React from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { EmptyState } from "@/components/FeedbackState";
import { useApp } from "@/context/AppContext";
import { formatTanggalIndonesia, formatJam } from "@/lib/formatters";
import { Calendar, Plus, Clock, ChevronRight } from "lucide-react";

export default function DaftarJanjiPage() {
  const { currentUser, janjiTemu, users, layanan } = useApp();

  // Filter only current patient's appointments (or all if admin)
  const myAppointments = janjiTemu
    .filter((j) => j.pasienId === currentUser?.id || currentUser?.role === "super_admin")
    .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

  const getDokterName = (dokterId) => {
    const d = users.find((u) => u.id === dokterId);
    return d ? d.nama : dokterId;
  };

  const getLayananName = (layananId) => {
    const l = layanan.find((item) => item.id === layananId);
    return l ? l.nama : layananId;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div>
            <span className="text-xs font-semibold text-[#0E7490] tracking-wider uppercase">
              Janji Saya
            </span>
            <h1 className="text-2xl font-bold text-[#1F2937] mt-1">Daftar Janji Temu</h1>
            <p className="text-xs text-[#5A6B78] mt-1">
              Semua jadwal pemeriksaan gigi Anda di Klinik Gigi Senyum Rekah.
            </p>
          </div>
          <Link
            href="/janji/baru"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0E7490] hover:bg-[#0b5e75] text-white text-xs font-semibold rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            Buat Janji Baru
          </Link>
        </div>

        {/* Table or Empty State */}
        {myAppointments.length === 0 ? (
          <EmptyState
            title="Belum Ada Janji Temu"
            description="Anda belum memiliki daftar janji temu. Buat janji sekarang untuk memilih slot waktu dokter gigi."
            actionText="Buat Janji Pertama"
            onAction={() => window.location.assign("/janji/baru")}
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs text-[#1F2937]">
              <thead className="bg-[#F4F7F9] text-[#5A6B78] uppercase text-[11px] font-semibold tracking-wider border-b border-gray-200">
                <tr>
                  <th scope="col" className="px-4 py-3.5">Tanggal</th>
                  <th scope="col" className="px-4 py-3.5">Jam</th>
                  <th scope="col" className="px-4 py-3.5">Dokter</th>
                  <th scope="col" className="px-4 py-3.5">Layanan</th>
                  <th scope="col" className="px-4 py-3.5">Status</th>
                  <th scope="col" className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {myAppointments.map((j) => (
                  <tr
                    key={j.id}
                    className="hover:bg-cyan-50/30 transition cursor-pointer"
                    onClick={() => window.location.assign(`/janji/${j.id}`)}
                  >
                    <td className="px-4 py-3.5 font-medium tabular-nums">
                      {formatTanggalIndonesia(j.tanggal)}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-[#0E7490] tabular-nums">
                      {formatJam(j.jam)}
                    </td>
                    <td className="px-4 py-3.5 font-medium">
                      {getDokterName(j.dokterId)}
                    </td>
                    <td className="px-4 py-3.5 text-[#5A6B78]">
                      {getLayananName(j.layananId)}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={j.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="inline-flex items-center text-xs text-[#0E7490] font-semibold hover:underline">
                        Rincian <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
