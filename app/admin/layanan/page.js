"use client";

import React, { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useApp } from "@/context/AppContext";
import { formatRupiah } from "@/lib/formatters";
import {
  Layers,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit2,
  Check,
} from "lucide-react";

export default function LayananAdminPage() {
  const { layanan, addLayanan, updateLayanan } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLayanan, setEditingLayanan] = useState(null);

  const [nama, setNama] = useState("");
  const [durasiMenit, setDurasiMenit] = useState(30);
  const [harga, setHarga] = useState(250000);
  const [aktif, setAktif] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleOpenAdd = () => {
    setEditingLayanan(null);
    setNama("");
    setDurasiMenit(30);
    setHarga(250000);
    setAktif(true);
    setError("");
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingLayanan(item);
    setNama(item.nama);
    setDurasiMenit(item.durasiMenit);
    setHarga(item.harga);
    setAktif(item.aktif);
    setError("");
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!nama.trim()) {
      setError("Nama layanan wajib diisi.");
      return;
    }
    if (durasiMenit % 30 !== 0 || durasiMenit <= 0) {
      setError("Durasi harus berupa angka kelipatan 30 menit (30, 60, 90, dll).");
      return;
    }
    if (harga < 0) {
      setError("Harga tidak boleh negatif.");
      return;
    }

    if (editingLayanan) {
      updateLayanan(editingLayanan.id, {
        nama: nama.trim(),
        durasiMenit: Number(durasiMenit),
        harga: Number(harga),
        aktif,
      });
      setSuccess("Layanan berhasil diperbarui!");
    } else {
      addLayanan({
        nama: nama.trim(),
        durasiMenit: Number(durasiMenit),
        harga: Number(harga),
        aktif,
      });
      setSuccess("Layanan baru berhasil ditambahkan!");
    }

    setModalOpen(false);
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleToggleAktif = (item) => {
    updateLayanan(item.id, { aktif: !item.aktif });
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
            <h1 className="text-2xl font-bold text-[#1F2937] mt-1">Katalog Layanan Klinik</h1>
            <p className="text-xs text-[#5A6B78] mt-1">
              Atur tarif dan durasi tindakan perawatan gigi yang dapat dipilih pasien pada saat membuat janji.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0E7490] hover:bg-[#0b5e75] text-white text-xs font-semibold rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            Tambah Layanan
          </button>
        </div>

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#15A66A]" />
            <span>{success}</span>
          </div>
        )}

        {/* Tabel Layanan */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-xs text-[#1F2937]">
            <thead className="bg-[#F4F7F9] text-[#5A6B78] uppercase text-[11px] font-semibold tracking-wider border-b border-gray-200">
              <tr>
                <th scope="col" className="px-5 py-3.5">Nama Layanan</th>
                <th scope="col" className="px-5 py-3.5">Durasi</th>
                <th scope="col" className="px-5 py-3.5">Harga</th>
                <th scope="col" className="px-5 py-3.5">Status Aktif</th>
                <th scope="col" className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {layanan.map((l) => (
                <tr key={l.id} className="hover:bg-cyan-50/20 transition">
                  <td className="px-5 py-3.5 font-bold text-[#1F2937]">
                    {l.nama}
                  </td>
                  <td className="px-5 py-3.5 text-[#5A6B78] tabular-nums">
                    <span className="inline-flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#0E7490]" />
                      {l.durasiMenit} Menit
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-[#0E7490] tabular-nums">
                    {formatRupiah(l.harga)}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      type="button"
                      onClick={() => handleToggleAktif(l)}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${
                        l.aktif
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {l.aktif ? "Aktif" : "Nonaktif"}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(l)}
                      className="text-xs text-[#0E7490] font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Ubah
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Tambah/Ubah Layanan */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-100">
              <h3 className="text-base font-bold text-[#1F2937] mb-1">
                {editingLayanan ? "Ubah Layanan" : "Tambah Layanan Baru"}
              </h3>
              <p className="text-xs text-[#5A6B78] mb-4">
                Durasi harus berupa kelipatan 30 menit sesuai aturan operasional klinik.
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
                    Nama Layanan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nama}
                    placeholder="Contoh: Cabut Gigi"
                    onChange={(e) => setNama(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-[#0E7490]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2937] mb-1">
                    Durasi (Menit, kelipatan 30) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step={30}
                    min={30}
                    value={durasiMenit}
                    onChange={(e) => setDurasiMenit(Number(e.target.value))}
                    className="w-full p-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-[#0E7490] tabular-nums"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2937] mb-1">
                    Harga (Rupiah) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step={10000}
                    min={0}
                    value={harga}
                    onChange={(e) => setHarga(Number(e.target.value))}
                    className="w-full p-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-[#0E7490] tabular-nums"
                    required
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="aktifCheckbox"
                    checked={aktif}
                    onChange={(e) => setAktif(e.target.checked)}
                    className="w-4 h-4 text-[#0E7490] rounded-sm focus:ring-[#0E7490]"
                  />
                  <label htmlFor="aktifCheckbox" className="text-xs text-[#1F2937] font-medium cursor-pointer">
                    Layanan Aktif (Dapat dipilih pasien saat Buat Janji)
                  </label>
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
                    Simpan Layanan
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
