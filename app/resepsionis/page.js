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
  Users,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  CalendarCheck,
  Stethoscope,
} from "lucide-react";

export default function DasborResepsionisPage() {
  const { janjiTemu, users, layanan } = useApp();

  // Doctors
  const doctors = users.filter((u) => u.role === "dokter");

  // Today date or fallback to date in mock data
  const todayStr = "2026-10-12"; // matches mock data date for comprehensive demo

  // Appointments today
  const appointmentsToday = janjiTemu.filter((j) => j.tanggal === todayStr);

  // Appointments waiting for confirmation
  const waitingAppointments = janjiTemu.filter((j) => j.status === "menunggu");

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
              Modul Resepsionis
            </span>
            <h1 className="text-2xl font-bold text-[#1F2937] mt-1">Dasbor Resepsionis</h1>
            <p className="text-xs text-[#5A6B78] mt-1">
              Ringkasan janji temu hari ini ({formatTanggalIndonesia(todayStr)}) dan antrean konfirmasi.
            </p>
          </div>
          <Link
            href="/resepsionis/janji"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0E7490] hover:bg-[#0b5e75] text-white text-xs font-semibold rounded-xl shadow-xs transition"
          >
            <CalendarCheck className="w-4 h-4" />
            Buka Kelola Janji
          </Link>
        </div>

        {/* SUMMARY CARDS (PRD Bab 4.6) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card: Menunggu Konfirmasi (Clickable to /resepsionis/janji?status=menunggu) */}
          <Link
            href="/resepsionis/janji?status=menunggu"
            className="group block p-5 rounded-2xl bg-amber-50/70 border-2 border-amber-200/80 hover:border-amber-400 transition shadow-xs"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                Menunggu Konfirmasi
              </span>
              <span className="p-2 rounded-xl bg-amber-100 text-amber-700">
                <AlertCircle className="w-4 h-4" />
              </span>
            </div>
            <div className="text-3xl font-extrabold text-amber-900 tabular-nums">
              {waitingAppointments.length}
            </div>
            <p className="text-[11px] text-amber-700 mt-2 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Klik untuk filter janji menunggu konfirmasi →
            </p>
          </Link>

          {/* Card: Janji Hari Ini */}
          <div className="p-5 rounded-2xl bg-cyan-50/70 border border-cyan-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#0E7490] uppercase tracking-wider">
                Janji Hari Ini
              </span>
              <span className="p-2 rounded-xl bg-cyan-100 text-[#0E7490]">
                <Calendar className="w-4 h-4" />
              </span>
            </div>
            <div className="text-3xl font-extrabold text-[#0E7490] tabular-nums">
              {appointmentsToday.length}
            </div>
            <p className="text-[11px] text-[#5A6B78] mt-2">
              Jadwal konsultasi & tindakan untuk hari ini
            </p>
          </div>

          {/* Card: Pasien Hadir Hari Ini */}
          <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">
                Siap Diperiksa
              </span>
              <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>
            <div className="text-3xl font-extrabold text-purple-900 tabular-nums">
              {appointmentsToday.filter((j) => j.status === "hadir").length}
            </div>
            <p className="text-[11px] text-[#5A6B78] mt-2">
              Pasien berstatus hadir dan menunggu dokter
            </p>
          </div>
        </div>

        {/* JANJI HARI INI PER DOKTER (PRD Bab 4.6: "satu kolom per dokter") */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#1F2937] flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-[#0E7490]" />
              Jadwal Janji Hari Ini Per Dokter
            </h2>
            <span className="text-xs text-[#5A6B78]">
              {formatTanggalIndonesia(todayStr)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {doctors.map((doc) => {
              const docAppointments = appointmentsToday
                .filter((j) => j.dokterId === doc.id)
                .sort((a, b) => a.jam.localeCompare(b.jam));

              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs"
                >
                  <div className="bg-[#0E7490] text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                        <Stethoscope className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm leading-tight">{doc.nama}</h3>
                        <p className="text-[11px] text-cyan-100">Dokter Gigi Praktik</p>
                      </div>
                    </div>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium tabular-nums">
                      {docAppointments.length} janji
                    </span>
                  </div>

                  <div className="p-4 space-y-3">
                    {docAppointments.length === 0 ? (
                      <div className="py-8 text-center text-xs text-[#5A6B78]">
                        Tidak ada janji untuk dokter ini hari ini.
                      </div>
                    ) : (
                      docAppointments.map((j) => (
                        <Link
                          key={j.id}
                          href={`/resepsionis/janji/${j.id}`}
                          className="block p-3 rounded-xl border border-gray-200 hover:border-[#0E7490] hover:bg-cyan-50/20 transition space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#0E7490] tabular-nums flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatJam(j.jam)}
                            </span>
                            <StatusBadge status={j.status} />
                          </div>
                          <div className="font-semibold text-xs text-[#1F2937] flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-[#5A6B78]" />
                            <span>{getPasienName(j.pasienId)}</span>
                          </div>
                          <div className="text-[11px] text-[#5A6B78]">
                            Layanan: {getLayananName(j.layananId)}
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
