"use client";

import React, { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useApp } from "@/context/AppContext";
import {
  Clock,
  Plus,
  Stethoscope,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export default function JadwalDokterAdminPage() {
  const { users, jadwalDokter, addJadwalDokter, deleteJadwalDokter } = useApp();

  const doctors = users.filter((u) => u.role === "dokter");
  const [selectedDokterId, setSelectedDokterId] = useState(
    doctors[0]?.id || "usr_drg_bima"
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [hari, setHari] = useState("senin");
  const [jamMulai, setJamMulai] = useState("09:00");
  const [jamSelesai, setJamSelesai] = useState("15:00");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currentDoctor = users.find((u) => u.id === selectedDokterId);
  const currentSchedules = jadwalDokter.filter(
    (j) => j.dokterId === selectedDokterId
  );

  const daysOrder = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];
  const sortedSchedules = [...currentSchedules].sort(
    (a, b) => daysOrder.indexOf(a.hari.toLowerCase()) - daysOrder.indexOf(b.hari.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validasi: Hari Senin sampai Sabtu (PRD 4.15)
    if (!daysOrder.includes(hari.toLowerCase())) {
      setError("Hari praktik hanya dapat dipilih antara Senin sampai Sabtu.");
      return;
    }

    // Validasi: Jam selesai setelah jam mulai (PRD 4.15)
    if (jamSelesai <= jamMulai) {
      setError("Jam selesai praktik harus setelah jam mulai.");
      return;
    }

    // Validasi: Satu dokter satu jadwal per hari (PRD 4.15)
    const exists = currentSchedules.some(
      (j) => j.hari.toLowerCase() === hari.toLowerCase()
    );
    if (exists) {
      setError(`Dokter sudah memiliki jadwal praktik pada hari ${hari}. Hapus jadwal lama jika ingin mengubah.`);
      return;
    }

    addJadwalDokter({
      dokterId: selectedDokterId,
      hari: hari.toLowerCase(),
      jamMulai,
      jamSelesai,
    });

    setSuccess(`Jadwal hari ${hari} berhasil ditambahkan untuk ${currentDoctor?.nama}!`);
    setModalOpen(false);
    setTimeout(() => setSuccess(""), 3000);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div>
            <span className="text-xs font-semibold text-[#0E7490] tracking-wider uppercase">
              Modul Super Admin
            </span>
            <h1 className="text-2xl font-bold text-[#1F2937] mt-1">Jadwal Praktik Dokter</h1>
            <p className="text-xs text-[#5A6B78] mt-1">
              Atur hari dan rentang jam operasional praktik dokter gigi (Senin–Sabtu).
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setError("");
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0E7490] hover:bg-[#0b5e75] text-white text-xs font-semibold rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            Tambah Hari Praktik
          </button>
        </div>

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#15A66A]" />
            <span>{success}</span>
          </div>
        )}

        {/* Doctor Selector Tabs */}
        <div className="flex gap-2 border-b border-gray-200 pb-2">
          {doctors.map((doc) => {
            const isSelected = selectedDokterId === doc.id;
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => setSelectedDokterId(doc.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  isSelected
                    ? "bg-[#0E7490] text-white shadow-xs"
                    : "bg-gray-100 hover:bg-gray-200 text-[#5A6B78]"
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                {doc.nama}
              </button>
            );
          })}
        </div>

        {/* Schedules Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-4 bg-[#F4F7F9] border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-bold text-xs text-[#1F2937]">
              Jadwal Praktik: {currentDoctor?.nama}
            </h3>
            <span className="text-xs text-[#5A6B78]">
              {sortedSchedules.length} Hari Aktif
            </span>
          </div>

          {sortedSchedules.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#5A6B78]">
              Belum ada hari praktik yang didaftarkan untuk dokter ini.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {sortedSchedules.map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-24 font-bold text-xs text-[#1F2937] uppercase">
                      {item.hari}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-cyan-50 text-[#0E7490] font-semibold text-xs tabular-nums border border-cyan-100 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {item.jamMulai} - {item.jamSelesai} WITA
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteJadwalDokter(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition"
                    title="Hapus jadwal hari ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Tambah Jadwal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-100">
              <h3 className="text-base font-bold text-[#1F2937] mb-1">
                Tambah Hari Praktik
              </h3>
              <p className="text-xs text-[#5A6B78] mb-4">
                Dokter: <strong>{currentDoctor?.nama}</strong> (Hari hanya Senin sampai Sabtu).
              </p>

              {error && (
                <div className="p-2.5 rounded-lg bg-red-50 text-xs text-red-700 mb-3 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-[#E53935]" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2937] mb-1">
                    Hari Praktik <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={hari}
                    onChange={(e) => setHari(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-[#0E7490] bg-white font-medium"
                  >
                    <option value="senin">Senin</option>
                    <option value="selasa">Selasa</option>
                    <option value="rabu">Rabu</option>
                    <option value="kamis">Kamis</option>
                    <option value="jumat">Jumat</option>
                    <option value="sabtu">Sabtu</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1F2937] mb-1">
                      Jam Mulai <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={jamMulai}
                      placeholder="09:00"
                      onChange={(e) => setJamMulai(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-[#0E7490] tabular-nums"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1F2937] mb-1">
                      Jam Selesai <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={jamSelesai}
                      placeholder="15:00"
                      onChange={(e) => setJamSelesai(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-[#0E7490] tabular-nums"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-medium text-white bg-[#0E7490] hover:bg-[#0b5e75] rounded-lg shadow-xs"
                  >
                    Simpan Jadwal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
