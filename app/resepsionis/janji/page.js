"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { EmptyState } from "@/components/FeedbackState";
import { useApp } from "@/context/AppContext";
import { formatTanggalIndonesia, formatJam } from "@/lib/formatters";
import {
  Calendar,
  Clock,
  Filter,
  User,
  Search,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

function KelolaJanjiContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { janjiTemu, users, layanan } = useApp();

  const urlStatus = searchParams.get("status") || "semua";
  const urlTanggal = searchParams.get("tanggal") || "";

  const [statusFilter, setStatusFilter] = useState(urlStatus);
  const [tanggalFilter, setTanggalFilter] = useState(urlTanggal);

  useEffect(() => {
    setStatusFilter(urlStatus);
    setTanggalFilter(urlTanggal);
  }, [urlStatus, urlTanggal]);

  const updateFilters = (newStatus, newTanggal) => {
    setStatusFilter(newStatus);
    setTanggalFilter(newTanggal);

    const params = new URLSearchParams();
    if (newStatus && newStatus !== "semua") params.set("status", newStatus);
    if (newTanggal) params.set("tanggal", newTanggal);

    const query = params.toString() ? `?${params.toString()}` : "";
    router.push(`/resepsionis/janji${query}`);
  };

  const filteredAppointments = janjiTemu.filter((j) => {
    if (statusFilter !== "semua" && j.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (tanggalFilter && j.tanggal !== tanggalFilter) {
      return false;
    }
    return true;
  }).sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

  const getPasienName = (pasienId) => {
    const p = users.find((u) => u.id === pasienId);
    return p ? p.nama : pasienId;
  };

  const getDokterName = (dokterId) => {
    const d = users.find((u) => u.id === dokterId);
    return d ? d.nama : dokterId;
  };

  const getLayananName = (layananId) => {
    const l = layanan.find((item) => item.id === layananId);
    return l ? l.nama : layananId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-5 border-b border-gray-100">
        <span className="text-xs font-semibold text-[#0E7490] tracking-wider uppercase">
          Modul Resepsionis
        </span>
        <h1 className="text-2xl font-bold text-[#1F2937] mt-1">Kelola Janji Temu</h1>
        <p className="text-xs text-[#5A6B78] mt-1">
          Konfirmasi, jadwal ulang, batalkan, atau tandai hadir untuk seluruh pasien klinik.
        </p>
      </div>

      {/* FILTER BAR (Tersimpan di URL) */}
      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5A6B78]">
            <Filter className="w-3.5 h-3.5 text-[#0E7490]" />
            Status:
          </div>
          <select
            value={statusFilter}
            onChange={(e) => updateFilters(e.target.value, tanggalFilter)}
            className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-white font-medium focus:outline-none focus:border-[#0E7490]"
          >
            <option value="semua">Semua Status</option>
            <option value="menunggu">Menunggu</option>
            <option value="dikonfirmasi">Dikonfirmasi</option>
            <option value="hadir">Hadir</option>
            <option value="selesai">Selesai</option>
            <option value="dibatalkan">Dibatalkan</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5A6B78] ml-2">
            <Calendar className="w-3.5 h-3.5 text-[#0E7490]" />
            Tanggal:
          </div>
          <input
            type="date"
            value={tanggalFilter}
            onChange={(e) => updateFilters(statusFilter, e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-white tabular-nums focus:outline-none focus:border-[#0E7490]"
          />
        </div>

        {(statusFilter !== "semua" || tanggalFilter) && (
          <button
            onClick={() => updateFilters("semua", "")}
            className="text-xs text-[#0E7490] hover:underline font-medium flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Saringan
          </button>
        )}
      </div>

      {/* Table */}
      {filteredAppointments.length === 0 ? (
        <EmptyState
          title="Tidak Ada Janji Sesuai Saringan"
          description="Coba ganti filter status atau tanggal untuk melihat daftar janji temu lainnya."
          actionText="Tampilkan Semua Janji"
          onAction={() => updateFilters("semua", "")}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-xs text-[#1F2937]">
            <thead className="bg-[#F4F7F9] text-[#5A6B78] uppercase text-[11px] font-semibold tracking-wider border-b border-gray-200">
              <tr>
                <th scope="col" className="px-4 py-3.5">Tanggal</th>
                <th scope="col" className="px-4 py-3.5">Jam</th>
                <th scope="col" className="px-4 py-3.5">Pasien</th>
                <th scope="col" className="px-4 py-3.5">Dokter</th>
                <th scope="col" className="px-4 py-3.5">Layanan</th>
                <th scope="col" className="px-4 py-3.5">Status</th>
                <th scope="col" className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredAppointments.map((j) => (
                <tr
                  key={j.id}
                  className="hover:bg-cyan-50/30 transition cursor-pointer"
                  onClick={() => router.push(`/resepsionis/janji/${j.id}`)}
                >
                  <td className="px-4 py-3.5 font-medium tabular-nums">
                    {formatTanggalIndonesia(j.tanggal)}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-[#0E7490] tabular-nums">
                    {formatJam(j.jam)}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-[#1F2937]">
                    {getPasienName(j.pasienId)}
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
                      Kelola <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function KelolaJanjiPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Memuat data...</div>}>
        <KelolaJanjiContent />
      </Suspense>
    </AppLayout>
  );
}
