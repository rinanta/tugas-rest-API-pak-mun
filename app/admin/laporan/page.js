"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import { useApp } from "@/context/AppContext";
import { formatRupiah } from "@/lib/formatters";
import {
  BarChart3,
  Calendar,
  Users,
  Layers,
  FileSpreadsheet,
  Stethoscope,
  TrendingUp,
} from "lucide-react";

function LaporanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { janjiTemu, users, layanan } = useApp();

  const urlBulan = searchParams.get("bulan") || "2026-10";
  const [selectedBulan, setSelectedBulan] = useState(urlBulan);

  useEffect(() => {
    setSelectedBulan(urlBulan);
  }, [urlBulan]);

  const handleBulanChange = (val) => {
    setSelectedBulan(val);
    router.push(`/admin/laporan?bulan=${val}`);
  };

  // Selesai only (PRD Bab 4.16: "kunjungan dihitung dari janji berstatus Selesai")
  const completedJanjiInMonth = janjiTemu.filter(
    (j) => j.status === "selesai" && (j.tanggal || "").startsWith(selectedBulan)
  );

  const doctors = users.filter((u) => u.role === "dokter");

  // Recap per Doctor
  const recapPerDokter = doctors.map((doc) => {
    const count = completedJanjiInMonth.filter((j) => j.dokterId === doc.id).length;
    return {
      dokter: doc,
      count,
    };
  });

  // Recap per Layanan
  const recapPerLayanan = layanan.map((lyn) => {
    const count = completedJanjiInMonth.filter((j) => j.layananId === lyn.id).length;
    return {
      layanan: lyn,
      count,
    };
  });

  const monthNames = {
    "2026-08": "Agustus 2026",
    "2026-09": "September 2026",
    "2026-10": "Oktober 2026",
    "2026-11": "November 2026",
    "2026-12": "Desember 2026",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
        <div>
          <span className="text-xs font-semibold text-[#0E7490] tracking-wider uppercase">
            Modul Super Admin
          </span>
          <h1 className="text-2xl font-bold text-[#1F2937] mt-1">Laporan Kunjungan Pasien</h1>
          <p className="text-xs text-[#5A6B78] mt-1">
            Rekapitulasi jumlah janji temu yang telah berstatus Selesai per dokter dan per layanan.
          </p>
        </div>

        {/* Filter Bulan (Tersimpan di URL per PRD Bab 4.16) */}
        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
          <Calendar className="w-4 h-4 text-[#0E7490] ml-2" />
          <span className="text-xs font-semibold text-[#5A6B78]">Pilih Periode:</span>
          <select
            value={selectedBulan}
            onChange={(e) => handleBulanChange(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-white font-medium focus:outline-none focus:border-[#0E7490]"
          >
            <option value="2026-08">Agustus 2026</option>
            <option value="2026-09">September 2026</option>
            <option value="2026-10">Oktober 2026</option>
            <option value="2026-11">November 2026</option>
            <option value="2026-12">Desember 2026</option>
          </select>
        </div>
      </div>

      {/* Summary Stat */}
      <div className="p-5 rounded-2xl bg-cyan-50/70 border border-cyan-200 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-[#0E7490] uppercase tracking-wider">
            Total Kunjungan Selesai Periode {monthNames[selectedBulan] || selectedBulan}
          </span>
          <div className="text-3xl font-extrabold text-[#0E7490] tabular-nums mt-1">
            {completedJanjiInMonth.length} Pasien
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white text-[#0E7490] flex items-center justify-center shadow-xs">
          <TrendingUp className="w-6 h-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TABEL 1: Kunjungan Per Dokter (PRD Bab 4.16) */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-[#F4F7F9] border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-xs text-[#1F2937] flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-[#0E7490]" />
              Tabel 1: Jumlah Kunjungan Per Dokter
            </h3>
            <span className="text-[11px] text-[#5A6B78]">Bulan Berjalan</span>
          </div>
          <table className="w-full text-left text-xs text-[#1F2937]">
            <thead className="bg-gray-50 text-[#5A6B78] uppercase text-[10px] font-semibold tracking-wider border-b border-gray-200">
              <tr>
                <th scope="col" className="px-4 py-3">Nama Dokter</th>
                <th scope="col" className="px-4 py-3 text-right">Jumlah Kunjungan Selesai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recapPerDokter.map((item) => (
                <tr key={item.dokter.id} className="hover:bg-cyan-50/20">
                  <td className="px-4 py-3.5 font-bold text-[#1F2937]">
                    {item.dokter.nama}
                  </td>
                  <td className="px-4 py-3.5 text-right font-extrabold text-[#0E7490] tabular-nums">
                    {item.count} kunjungan
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TABEL 2: Kunjungan Per Layanan (PRD Bab 4.16) */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-[#F4F7F9] border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-xs text-[#1F2937] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0E7490]" />
              Tabel 2: Jumlah Kunjungan Per Layanan
            </h3>
            <span className="text-[11px] text-[#5A6B78]">Bulan Berjalan</span>
          </div>
          <table className="w-full text-left text-xs text-[#1F2937]">
            <thead className="bg-gray-50 text-[#5A6B78] uppercase text-[10px] font-semibold tracking-wider border-b border-gray-200">
              <tr>
                <th scope="col" className="px-4 py-3">Nama Layanan Perawatan</th>
                <th scope="col" className="px-4 py-3 text-right">Jumlah Kunjungan Selesai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recapPerLayanan.map((item) => (
                <tr key={item.layanan.id} className="hover:bg-cyan-50/20">
                  <td className="px-4 py-3.5 font-bold text-[#1F2937]">
                    {item.layanan.nama}
                  </td>
                  <td className="px-4 py-3.5 text-right font-extrabold text-[#0E7490] tabular-nums">
                    {item.count} kunjungan
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function LaporanAdminPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Memuat laporan...</div>}>
        <LaporanContent />
      </Suspense>
    </AppLayout>
  );
}
