"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import { useApp } from "@/context/AppContext";
import { formatRupiah, formatTanggalIndonesia } from "@/lib/formatters";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

function BuatJanjiContent() {
  const router = useRouter();
  const { currentUser, layanan, users, jadwalDokter, slotTerisi, createJanji } = useApp();

  const [selectedLayananId, setSelectedLayananId] = useState("");
  const [selectedDokterId, setSelectedDokterId] = useState("");
  const [selectedTanggal, setSelectedTanggal] = useState("");
  const [selectedJam, setSelectedJam] = useState("");
  const [keluhan, setKeluhan] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Only active layanan
  const activeLayanan = useMemo(() => {
    return layanan.filter((l) => l.aktif);
  }, [layanan]);

  // Doctors list (role = dokter)
  const doctors = useMemo(() => {
    return users.filter((u) => u.role === "dokter" && u.aktif);
  }, [users]);

  // Selected Layanan details
  const currentLayanan = useMemo(() => {
    return layanan.find((l) => l.id === selectedLayananId);
  }, [layanan, selectedLayananId]);

  // Doctor's practice schedules
  const doctorSchedules = useMemo(() => {
    if (!selectedDokterId) return [];
    return jadwalDokter.filter((j) => j.dokterId === selectedDokterId);
  }, [jadwalDokter, selectedDokterId]);

  // Check if selected date is on the doctor's practice day
  const practiceDayValidation = useMemo(() => {
    if (!selectedTanggal || !selectedDokterId) return { isValid: true, dayName: "" };

    const daysMap = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];
    const d = new Date(selectedTanggal + "T00:00:00");
    const dayName = daysMap[d.getDay()];

    const matchingSchedule = doctorSchedules.find((s) => s.hari.toLowerCase() === dayName);
    return {
      isValid: !!matchingSchedule,
      schedule: matchingSchedule,
      dayName,
    };
  }, [selectedTanggal, selectedDokterId, doctorSchedules]);

  // Generate available 30-minute time slots for selected doctor and date
  const availableSlots = useMemo(() => {
    if (!selectedDokterId || !selectedTanggal || !practiceDayValidation.isValid) {
      return [];
    }

    const sched = practiceDayValidation.schedule;
    if (!sched) return [];

    const [startH, startM] = sched.jamMulai.split(":").map(Number);
    const [endH, endM] = sched.jamSelesai.split(":").map(Number);

    const slots = [];
    let currentTotalMinutes = startH * 60 + startM;
    const endTotalMinutes = endH * 60 + endM;

    while (currentTotalMinutes + (currentLayanan?.durasiMenit || 30) <= endTotalMinutes) {
      const h = Math.floor(currentTotalMinutes / 60);
      const m = currentTotalMinutes % 60;
      const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

      // Check if slot conflicts with existing booked slot
      const isBooked = slotTerisi.some(
        (s) =>
          s.dokterId === selectedDokterId &&
          s.tanggal === selectedTanggal &&
          s.jam === timeStr
      );

      slots.push({
        time: timeStr,
        available: !isBooked,
      });

      currentTotalMinutes += 30; // 30-minute increments per PRD Bab 4.3.1
    }

    return slots;
  }, [selectedDokterId, selectedTanggal, practiceDayValidation, slotTerisi, currentLayanan]);

  // Minimum date: tomorrow (H+1) per PRD Bab 4.3.1 ("Validasi: tanggal paling cepat besok")
  const [tomorrowStr, setTomorrowStr] = useState("");
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setTomorrowStr(d.toISOString().split("T")[0]);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!selectedLayananId) {
      setError("Pilih layanan terlebih dahulu.");
      return;
    }
    if (!selectedDokterId) {
      setError("Pilih dokter gigi terlebih dahulu.");
      return;
    }
    if (!selectedTanggal) {
      setError("Pilih tanggal janji temu.");
      return;
    }
    if (selectedTanggal < tomorrowStr) {
      setError("Janji temu paling cepat dapat dibuat untuk besok (H+1).");
      return;
    }
    if (!practiceDayValidation.isValid) {
      setError(`Dokter tidak berpraktik pada hari ${practiceDayValidation.dayName}. Silakan pilih hari praktik dokter.`);
      return;
    }
    if (!selectedJam) {
      setError("Pilih slot jam yang masih kosong.");
      return;
    }
    if (!keluhan.trim()) {
      setError("Tuliskan keluhan yang Anda rasakan.");
      return;
    }

    // Check race condition (PRD: "Bila slot keburu diambil pasien lain")
    const isConflict = slotTerisi.some(
      (s) =>
        s.dokterId === selectedDokterId &&
        s.tanggal === selectedTanggal &&
        s.jam === selectedJam
    );
    if (isConflict) {
      setError("Slot ini baru saja terisi. Pilih jam lain.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const newJanji = createJanji({
        pasienId: currentUser.id,
        dokterId: selectedDokterId,
        layananId: selectedLayananId,
        tanggal: selectedTanggal,
        jam: selectedJam,
        keluhan: keluhan.trim(),
      });
      setLoading(false);
      router.push(`/janji/${newJanji.id}`);
    }, 400);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 pb-5 border-b border-gray-100">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 text-[#5A6B78] transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs font-semibold text-[#0E7490] tracking-wider uppercase">
              Janji Saya
            </span>
            <h1 className="text-2xl font-bold text-[#1F2937]">Buat Janji Temu Baru</h1>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#E53935]" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white">
          {/* 1. Pilih Layanan Aktif */}
          <div>
            <label className="block text-xs font-semibold text-[#1F2937] mb-2">
              1. Pilih Layanan <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeLayanan.map((lyn) => {
                const isSelected = selectedLayananId === lyn.id;
                return (
                  <div
                    key={lyn.id}
                    onClick={() => setSelectedLayananId(lyn.id)}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition ${
                      isSelected
                        ? "border-[#0E7490] bg-cyan-50/40 shadow-xs"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-xs text-[#1F2937]">{lyn.nama}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#0E7490]" />}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#5A6B78] mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {lyn.durasiMenit} menit
                      </span>
                      <span className="font-semibold text-[#0E7490] tabular-nums">
                        {formatRupiah(lyn.harga)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Pilih Dokter */}
          <div>
            <label className="block text-xs font-semibold text-[#1F2937] mb-2">
              2. Pilih Dokter Gigi <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {doctors.map((doc) => {
                const isSelected = selectedDokterId === doc.id;
                const docSchedules = jadwalDokter.filter((j) => j.dokterId === doc.id);
                return (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setSelectedDokterId(doc.id);
                      setSelectedJam("");
                    }}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition ${
                      isSelected
                        ? "border-[#0E7490] bg-cyan-50/40 shadow-xs"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-8 h-8 rounded-full bg-cyan-100 text-[#0E7490] flex items-center justify-center font-bold text-xs">
                        <Stethoscope className="w-4 h-4 text-[#0E7490]" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-[#1F2937]">{doc.nama}</div>
                        <div className="text-[10px] text-[#5A6B78]">Dokter Gigi Praktik</div>
                      </div>
                    </div>
                    <div className="text-[10px] text-[#5A6B78] bg-gray-50 p-2 rounded-lg">
                      <span className="font-semibold">Hari Praktik:</span>{" "}
                      {docSchedules.map((s) => s.hari).join(", ") || "Senin-Sabtu"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Pilih Tanggal (H+1 onwards) */}
          <div>
            <label className="block text-xs font-semibold text-[#1F2937] mb-1">
              3. Tanggal Kunjungan (Paling cepat besok) <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              min={tomorrowStr}
              value={selectedTanggal}
              onChange={(e) => {
                setSelectedTanggal(e.target.value);
                setSelectedJam("");
              }}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-none focus:border-[#0E7490] focus:ring-1 focus:ring-[#0E7490] tabular-nums"
              required
            />
            {selectedTanggal && !practiceDayValidation.isValid && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Dokter tidak berpraktik pada hari {practiceDayValidation.dayName}. Silakan pilih hari lain.
              </p>
            )}
          </div>

          {/* 4. Slot Jam Kosong (Interval 30 menit) */}
          <div>
            <label className="block text-xs font-semibold text-[#1F2937] mb-1">
              4. Pilih Slot Jam Praktik <span className="text-red-500">*</span>
            </label>
            <p className="text-[11px] text-[#5A6B78] mb-2.5">
              Hanya slot kosong yang dapat dipilih (slot setiap 30 menit).
            </p>

            {!selectedDokterId || !selectedTanggal ? (
              <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center text-xs text-[#5A6B78]">
                Silakan pilih dokter dan tanggal terlebih dahulu untuk melihat slot kosong.
              </div>
            ) : !practiceDayValidation.isValid ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center text-xs text-amber-700">
                Pilih tanggal saat dokter berpraktik.
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center text-xs text-red-700">
                Semua slot pada tanggal ini sudah penuh. Silakan pilih tanggal lain.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {availableSlots.map((slot) => {
                  const isSelected = selectedJam === slot.time;
                  if (!slot.available) {
                    return (
                      <div
                        key={slot.time}
                        className="p-2.5 rounded-lg border border-gray-200 bg-gray-100 text-gray-400 text-xs text-center cursor-not-allowed tabular-nums line-through"
                        title="Slot ini sudah terisi"
                      >
                        {slot.time}
                      </div>
                    );
                  }

                  return (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => setSelectedJam(slot.time)}
                      className={`p-2.5 rounded-lg border text-xs font-semibold text-center transition tabular-nums ${
                        isSelected
                          ? "bg-[#0E7490] text-white border-[#0E7490] shadow-xs"
                          : "bg-white hover:bg-cyan-50 border-gray-300 text-[#1F2937]"
                      }`}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 5. Keluhan Pasien */}
          <div>
            <label className="block text-xs font-semibold text-[#1F2937] mb-1">
              5. Keluhan Gigi <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Contoh: Gigi geraham kiri ngilu saat makan dan minum dingin..."
              value={keluhan}
              onChange={(e) => setKeluhan(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-none focus:border-[#0E7490] focus:ring-1 focus:ring-[#0E7490]"
              required
            />
          </div>

          {/* Tombol Kirim */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !selectedJam}
              className="w-full py-3 px-4 bg-[#0E7490] hover:bg-[#0b5e75] text-white text-sm font-semibold rounded-xl transition shadow-xs disabled:opacity-50"
            >
              {loading ? "Menyimpan Janji..." : "Kirim & Buat Janji"}
            </button>
            <p className="text-[11px] text-[#5A6B78] text-center mt-2">
              Janji akan berstatus <strong className="text-amber-600">Menunggu</strong> sampai dikonfirmasi oleh resepsionis klinik.
            </p>
          </div>
        </form>
      </div>
  );
}

export default function BuatJanjiPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Memuat formulir buat janji...</div>}>
        <BuatJanjiContent />
      </Suspense>
    </AppLayout>
  );
}
