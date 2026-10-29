"use client";

import React from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { EmptyState } from "@/components/FeedbackState";
import { useApp } from "@/context/AppContext";
import { formatTanggalIndonesia, formatJam } from "@/lib/formatters";
import {
  Stethoscope,
  Calendar,
  Clock,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function DasborDokterPage() {
  const { currentUser, janjiTemu, users, layanan } = useApp();

  // If role is super_admin, default to drg. Bima for view, or match current user id
  const doctorId = currentUser?.role === "dokter" ? currentUser?.id : "usr_drg_bima";
  const doctor = users.find((u) => u.id === doctorId) || currentUser;

  const todayStr = "2026-10-12"; // Match mock date for today's demonstrations

  // Appointments today for this doctor
  const myAppointmentsToday = janjiTemu.filter(
    (j) => j.dokterId === doctorId && j.tanggal === todayStr
  ).sort((a, b) => a.jam.localeCompare(b.jam));

  const getPasienName = (pasienId) => {
    const p = users.find((u) => u.id === pasienId);
    return p ? p.nama : pasienId;
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
              Modul Dokter Gigi
            </span>
            <h1 className="text-2xl font-bold text-[#1F2937] mt-1">Dasbor Dokter</h1>
            <p className="text-xs text-[#5A6B78] mt-1">
              Jadwal pasien hari ini untuk <strong>{doctor?.nama}</strong> ({formatTanggalIndonesia(todayStr)}).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#5A6B78]">Total Jadwal Hari Ini:</span>
            <span className="px-2.5 py-1 rounded-full bg-cyan-100 text-[#0E7490] font-bold text-xs tabular-nums">
              {myAppointmentsToday.length} Pasien
            </span>
          </div>
        </div>

        {/* Tabel Janji Hari Ini Milik Dokter (PRD Bab 4.9) */}
        {myAppointmentsToday.length === 0 ? (
          <EmptyState
            title="Tidak Ada Pasien Hari Ini"
            description="Tidak ada jadwal janji temu untuk Anda pada hari ini."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs text-[#1F2937]">
              <thead className="bg-[#F4F7F9] text-[#5A6B78] uppercase text-[11px] font-semibold tracking-wider border-b border-gray-200">
                <tr>
                  <th scope="col" className="px-4 py-3.5">Jam</th>
                  <th scope="col" className="px-4 py-3.5">Pasien</th>
                  <th scope="col" className="px-4 py-3.5">Layanan</th>
                  <th scope="col" className="px-4 py-3.5">Keluhan</th>
                  <th scope="col" className="px-4 py-3.5">Status</th>
                  <th scope="col" className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {myAppointmentsToday.map((j) => {
                  const isHadir = j.status === "hadir";
                  return (
                    <tr
                      key={j.id}
                      className={`transition ${
                        isHadir ? "bg-purple-50/30 hover:bg-purple-50/50" : "hover:bg-gray-50/60"
                      }`}
                    >
                      <td className="px-4 py-3.5 font-bold text-[#0E7490] tabular-nums whitespace-nowrap">
                        {formatJam(j.jam)}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-[#1F2937]">
                        {getPasienName(j.pasienId)}
                      </td>
                      <td className="px-4 py-3.5 text-[#5A6B78]">
                        {getLayananName(j.layananId)}
                      </td>
                      <td className="px-4 py-3.5 max-w-xs truncate text-[#5A6B78] italic">
                        “{j.keluhan || "-"}”
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <StatusBadge status={j.status} />
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        {isHadir ? (
                          <Link
                            href={`/dokter/janji/${j.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#7C3AED] hover:bg-purple-700 text-white rounded-lg font-semibold text-xs shadow-xs transition animate-pulse"
                          >
                            Siap Diperiksa →
                          </Link>
                        ) : j.status === "selesai" ? (
                          <Link
                            href={`/dokter/janji/${j.id}`}
                            className="text-xs text-[#15A66A] font-semibold hover:underline"
                          >
                            Lihat Catatan
                          </Link>
                        ) : (
                          <span className="text-[11px] text-[#5A6B78]">Menunggu Hadir</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
