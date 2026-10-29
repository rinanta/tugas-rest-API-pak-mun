"use client";

import React from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { useApp } from "@/context/AppContext";
import { formatTanggalIndonesia, formatJam } from "@/lib/formatters";
import {
  Calendar,
  Clock,
  User,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Sparkles,
} from "lucide-react";

export default function BerandaPage() {
  const { currentUser, janjiTemu, users, layanan } = useApp();

  // Find appointments belonging to this patient, active/upcoming first
  const myAppointments = janjiTemu.filter(
    (j) => j.pasienId === currentUser?.id || currentUser?.role === "super_admin"
  );

  // Active upcoming janji (menunggu, dikonfirmasi, hadir)
  const upcomingJanji = myAppointments.find(
    (j) => j.status === "menunggu" || j.status === "dikonfirmasi" || j.status === "hadir"
  ) || myAppointments[0];

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
      <div className="space-y-8">
        {/* Header Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <span className="text-xs font-semibold text-[#0E7490] tracking-wider uppercase">
              Beranda Pasien
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937] mt-1">
              Selamat datang, {currentUser?.nama}
            </h1>
            <p className="text-sm text-[#5A6B78] mt-1">
              Pantau jadwal janji temu dan catatan perawatan gigi Anda di Klinik Gigi Senyum Rekah.
            </p>
          </div>
          <Link
            href="/janji/baru"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0E7490] hover:bg-[#0b5e75] text-white text-sm font-semibold rounded-xl shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            Buat Janji Temu
          </Link>
        </div>

        {/* KARTU JANJI TERDEKAT (PRD Bab 4.2) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-[#1F2937] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0E7490]" />
              Janji Terdekat Anda
            </h2>
            <Link
              href="/janji"
              className="text-xs text-[#0E7490] hover:underline font-semibold flex items-center gap-1"
            >
              Lihat Semua Janji <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingJanji ? (
            <Link
              href={`/janji/${upcomingJanji.id}`}
              className="block group bg-white hover:bg-slate-50/70 border-2 border-cyan-700/20 hover:border-[#0E7490] rounded-2xl p-6 transition-all shadow-xs hover:shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#5A6B78]">
                    Status Janji:
                  </span>
                  <StatusBadge status={upcomingJanji.status} />
                </div>
                <span className="text-xs text-[#0E7490] font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Klik untuk rincian janji →
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="bg-[#F4F7F9] p-3.5 rounded-xl">
                  <span className="text-xs text-[#5A6B78] block mb-1">Tanggal Kunjungan</span>
                  <span className="text-sm font-bold text-[#1F2937] tabular-nums">
                    {formatTanggalIndonesia(upcomingJanji.tanggal)}
                  </span>
                </div>

                <div className="bg-[#F4F7F9] p-3.5 rounded-xl">
                  <span className="text-xs text-[#5A6B78] block mb-1">Jam Praktik</span>
                  <span className="text-sm font-bold text-[#1F2937] tabular-nums">
                    {formatJam(upcomingJanji.jam)}
                  </span>
                </div>

                <div className="bg-[#F4F7F9] p-3.5 rounded-xl">
                  <span className="text-xs text-[#5A6B78] block mb-1">Dokter Gigi</span>
                  <span className="text-sm font-bold text-[#1F2937]">
                    {getDokterName(upcomingJanji.dokterId)}
                  </span>
                </div>

                <div className="bg-[#F4F7F9] p-3.5 rounded-xl">
                  <span className="text-xs text-[#5A6B78] block mb-1">Layanan Perawatan</span>
                  <span className="text-sm font-bold text-[#0E7490]">
                    {getLayananName(upcomingJanji.layananId)}
                  </span>
                </div>
              </div>

              {upcomingJanji.keluhan && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-start gap-2 text-xs text-[#5A6B78]">
                  <span className="font-semibold text-[#1F2937]">Keluhan:</span>
                  <span className="italic">“{upcomingJanji.keluhan}”</span>
                </div>
              )}
            </Link>
          ) : (
            <div className="bg-[#F4F7F9] border border-gray-200 rounded-2xl p-8 text-center">
              <Calendar className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-base font-semibold text-[#1F2937]">Belum ada janji</p>
              <p className="text-xs text-[#5A6B78] mt-1 mb-4">
                Anda belum memiliki jadwal janji temu dengan dokter gigi kami.
              </p>
              <Link
                href="/janji/baru"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0E7490] hover:bg-[#0b5e75] text-white text-xs font-semibold rounded-xl transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Buat Janji Sekarang
              </Link>
            </div>
          )}
        </div>

        {/* Informasi Layanan & Fasilitas Klinik */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
          <div className="p-5 rounded-2xl border border-gray-100 bg-linear-to-br from-cyan-50/50 to-white">
            <div className="w-9 h-9 rounded-xl bg-cyan-100 text-[#0E7490] flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#1F2937] mb-1">Slot Waktu Akurat</h3>
            <p className="text-xs text-[#5A6B78] leading-relaxed">
              Jadwal tersinkronisasi per 30 menit. Tidak ada jadwal bentrok lagi antar pasien.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-gray-100 bg-linear-to-br from-emerald-50/50 to-white">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#1F2937] mb-1">Dokter Berpengalaman</h3>
            <p className="text-xs text-[#5A6B78] leading-relaxed">
              Ditangani oleh drg. Bima Pratama dan drg. Sinta Maharani dengan peralatan modern.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-gray-100 bg-linear-to-br from-blue-50/50 to-white">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#1F2937] mb-1">Catatan Perawatan Aman</h3>
            <p className="text-xs text-[#5A6B78] leading-relaxed">
              Catatan instruksi pasca-perawatan langsung dapat dibaca di Riwayat Perawatan Anda.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
