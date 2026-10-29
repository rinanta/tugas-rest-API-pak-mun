"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { useApp } from "@/context/AppContext";
import { User, Mail, Phone, Shield, CheckCircle2, AlertCircle, Save } from "lucide-react";

export default function ProfilPage() {
  const { currentUser, updateProfile } = useApp();

  const [nama, setNama] = useState("");
  const [noHp, setNoHp] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (currentUser) {
      setNama(currentUser.nama || "");
      setNoHp(currentUser.noHp || "");
    }
  }, [currentUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!nama.trim()) {
      setErrorMsg("Nama tidak boleh kosong.");
      return;
    }
    if (noHp && (!noHp.startsWith("08") || !/^\d+$/.test(noHp))) {
      setErrorMsg("Nomor HP harus berupa angka dan diawali dengan 08.");
      return;
    }

    updateProfile({ nama: nama.trim(), noHp: noHp.trim() });
    setSuccessMsg("Profil berhasil diperbarui!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div className="pb-5 border-b border-gray-100">
          <span className="text-xs font-semibold text-[#0E7490] tracking-wider uppercase">
            Pengaturan Akun
          </span>
          <h1 className="text-2xl font-bold text-[#1F2937] mt-1">Profil Pengguna</h1>
          <p className="text-xs text-[#5A6B78] mt-1">
            Perbarui informasi nama lengkap dan nomor HP aktif Anda di sini.
          </p>
        </div>

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#15A66A]" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#E53935]" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          {/* Peran (Read Only per PRD Bab 4.5) */}
          <div>
            <label className="block text-xs font-semibold text-[#5A6B78] mb-1">
              Peran Akun (Tidak dapat diubah)
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs font-semibold text-[#1F2937] uppercase">
              <Shield className="w-4 h-4 text-[#0E7490]" />
              <span>{currentUser?.role?.replace("_", " ")}</span>
            </div>
            <p className="text-[11px] text-[#5A6B78] mt-1">
              Peran hanya dapat diubah oleh Super Admin melalui menu Kelola Pengguna.
            </p>
          </div>

          {/* Email (Read Only per PRD Bab 4.5) */}
          <div>
            <label className="block text-xs font-semibold text-[#5A6B78] mb-1">
              Email Akun (Tidak dapat diubah)
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-[#5A6B78]">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>{currentUser?.email}</span>
            </div>
          </div>

          {/* Nama Lengkap (Editable) */}
          <div>
            <label className="block text-xs font-semibold text-[#1F2937] mb-1">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3 text-[#5A6B78]" />
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-none focus:border-[#0E7490] focus:ring-1 focus:ring-[#0E7490]"
                required
              />
            </div>
          </div>

          {/* Nomor HP (Editable) */}
          <div>
            <label className="block text-xs font-semibold text-[#1F2937] mb-1">
              Nomor HP (WhatsApp)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-3 text-[#5A6B78]" />
              <input
                type="tel"
                value={noHp}
                placeholder="081234567890"
                onChange={(e) => setNoHp(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-none focus:border-[#0E7490] focus:ring-1 focus:ring-[#0E7490] tabular-nums"
              />
            </div>
            <p className="text-[11px] text-[#5A6B78] mt-1">Format: diawali 08 (misal: 081234567890)</p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#0E7490] hover:bg-[#0b5e75] text-white text-sm font-semibold rounded-xl transition shadow-xs flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Simpan Perubahan Profil
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
