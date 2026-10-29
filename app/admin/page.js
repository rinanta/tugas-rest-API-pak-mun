"use client";

import React from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { useApp } from "@/context/AppContext";
import {
  Building2,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Layers,
  Clock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function DasborAdminPage() {
  const { janjiTemu, users, layanan } = useApp();

  const todayStr = "2026-10-12";
  const currentMonthPrefix = "2026-10";

  // Kunjungan hari ini (Selesai hari ini)
  const kunjunganHariIni = janjiTemu.filter(
    (j) => j.status === "selesai" && j.tanggal === todayStr
  ).length;

  // Kunjungan bulan ini (Selesai bulan ini)
  const kunjunganBulanIni = janjiTemu.filter(
    (j) => j.status === "selesai" && j.tanggal.startsWith(currentMonthPrefix)
  ).length;

  // Menunggu konfirmasi
  const menungguKonfirmasi = janjiTemu.filter((j) => j.status === "menunggu").length;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div>
            <span className="text-xs font-semibold text-[#0E7490] tracking-wider uppercase">
              Modul Super Admin
            </span>
            <h1 className="text-2xl font-bold text-[#1F2937] mt-1">Dasbor Admin Klinik</h1>
            <p className="text-xs text-[#5A6B78] mt-1">
              Ringkasan operasional klinik, metrik kunjungan, dan navigasi manajemen Senyum Rekah.
            </p>
          </div>
          <Link
            href="/admin/laporan"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0E7490] hover:bg-[#0b5e75] text-white text-xs font-semibold rounded-xl shadow-xs transition"
          >
            <BarChart3 className="w-4 h-4" />
            Buka Laporan Lengkap
          </Link>
        </div>

        {/* METRIK UTAMA (PRD Bab 4.12) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* 1. Kunjungan Hari Ini */}
          <div className="p-6 rounded-2xl bg-white border border-gray-200/90 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#5A6B78] uppercase tracking-wider">
                Kunjungan Hari Ini
              </span>
              <span className="p-2 rounded-xl bg-emerald-50 text-[#15A66A]">
                <CheckCircle2 className="w-5 h-5" />
              </span>
            </div>
            <div className="text-3xl font-extrabold text-[#1F2937] tabular-nums">
              {kunjunganHariIni}
            </div>
            <p className="text-[11px] text-[#5A6B78]">
              Janji temu berstatus Selesai hari ini
            </p>
          </div>

          {/* 2. Kunjungan Bulan Ini (Klik membuka /admin/laporan per PRD 4.12) */}
          <Link
            href="/admin/laporan"
            className="group p-6 rounded-2xl bg-cyan-50/60 border-2 border-cyan-200/80 hover:border-[#0E7490] shadow-xs space-y-2 transition block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0E7490] uppercase tracking-wider">
                Kunjungan Bulan Ini
              </span>
              <span className="p-2 rounded-xl bg-cyan-100 text-[#0E7490]">
                <TrendingUp className="w-5 h-5" />
              </span>
            </div>
            <div className="text-3xl font-extrabold text-[#0E7490] tabular-nums">
              {kunjunganBulanIni}
            </div>
            <p className="text-[11px] text-[#0E7490] font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Klik untuk lihat laporan bulan berjalan →
            </p>
          </Link>

          {/* 3. Menunggu Konfirmasi */}
          <Link
            href="/resepsionis/janji?status=menunggu"
            className="group p-6 rounded-2xl bg-amber-50/60 border border-amber-200 shadow-xs space-y-2 block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                Menunggu Konfirmasi
              </span>
              <span className="p-2 rounded-xl bg-amber-100 text-amber-700">
                <AlertCircle className="w-5 h-5" />
              </span>
            </div>
            <div className="text-3xl font-extrabold text-amber-900 tabular-nums">
              {menungguKonfirmasi}
            </div>
            <p className="text-[11px] text-amber-800 font-medium">
              Permintaan janji baru butuh verifikasi
            </p>
          </Link>
        </div>

        {/* MODUL ADMINISTRASI CEPAT */}
        <div>
          <h2 className="text-base font-bold text-[#1F2937] mb-4">
            Kelola Modul Klinik Senyum Rekah
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/pengguna"
              className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-[#0E7490] transition shadow-xs space-y-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-[#0E7490] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#1F2937] group-hover:text-[#0E7490]">
                Kelola Pengguna
              </h3>
              <p className="text-xs text-[#5A6B78]">
                Atur peran ({users.length} akun terdaftar) dan status aktif.
              </p>
            </Link>

            <Link
              href="/admin/layanan"
              className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-[#0E7490] transition shadow-xs space-y-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-[#0E7490] flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#1F2937] group-hover:text-[#0E7490]">
                Katalog Layanan
              </h3>
              <p className="text-xs text-[#5A6B78]">
                Kelola tarif, durasi, dan status {layanan.length} jenis layanan.
              </p>
            </Link>

            <Link
              href="/admin/jadwal-dokter"
              className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-[#0E7490] transition shadow-xs space-y-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-[#0E7490] flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#1F2937] group-hover:text-[#0E7490]">
                Jadwal Dokter
              </h3>
              <p className="text-xs text-[#5A6B78]">
                Atur hari & jam praktik dokter gigi Senin sampai Sabtu.
              </p>
            </Link>

            <Link
              href="/admin/laporan"
              className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-[#0E7490] transition shadow-xs space-y-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-[#0E7490] flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#1F2937] group-hover:text-[#0E7490]">
                Laporan Kunjungan
              </h3>
              <p className="text-xs text-[#5A6B78]">
                Rekap kunjungan bulanan per dokter dan per layanan.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
