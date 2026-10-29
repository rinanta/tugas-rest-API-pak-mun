"use client";

import React, { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useApp } from "@/context/AppContext";
import { Users, Search, Phone, Mail, UserCheck } from "lucide-react";

export default function DataPasienPage() {
  const { users } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  // Only users with role 'pasien' (or show all patients)
  const patients = users.filter((u) => u.role === "pasien");

  const filteredPatients = patients.filter((p) =>
    (p.nama || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.noHp || "").includes(searchQuery)
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div>
            <span className="text-xs font-semibold text-[#0E7490] tracking-wider uppercase">
              Modul Resepsionis
            </span>
            <h1 className="text-2xl font-bold text-[#1F2937] mt-1">Data Pasien</h1>
            <p className="text-xs text-[#5A6B78] mt-1">
              Daftar kontak telepon dan email pasien terdaftar untuk keperluan administrasi.
            </p>
          </div>
          <div className="text-xs text-[#5A6B78] bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 self-start sm:self-auto">
            Total Pasien: <strong className="text-[#1F2937]">{patients.length}</strong>
          </div>
        </div>

        {/* Pencarian Nama (PRD Bab 4.8) */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#5A6B78]" />
          <input
            type="text"
            placeholder="Cari nama pasien (misal: Andi)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-[#0E7490] bg-white"
          />
        </div>

        {/* Tabel Pasien (Tanpa Catatan Perawatan per PRD 4.8) */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-xs text-[#1F2937]">
            <thead className="bg-[#F4F7F9] text-[#5A6B78] uppercase text-[11px] font-semibold tracking-wider border-b border-gray-200">
              <tr>
                <th scope="col" className="px-5 py-3.5">Nama Pasien</th>
                <th scope="col" className="px-5 py-3.5">Nomor HP (WhatsApp)</th>
                <th scope="col" className="px-5 py-3.5">Email</th>
                <th scope="col" className="px-5 py-3.5">Status Akun</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-xs text-[#5A6B78]">
                    Tidak ditemukan pasien dengan kata kunci "{searchQuery}".
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-cyan-50/20 transition">
                    <td className="px-5 py-3.5 font-bold text-[#1F2937] flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-cyan-100 text-[#0E7490] flex items-center justify-center font-bold text-xs">
                        {p.nama ? p.nama.charAt(0).toUpperCase() : "P"}
                      </div>
                      <span>{p.nama}</span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-[#0E7490] tabular-nums">
                      {p.noHp ? (
                        <a
                          href={`https://wa.me/${p.noHp.replace(/^0/, "62")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {p.noHp}
                        </a>
                      ) : (
                        <span className="text-gray-400 font-normal">Belum diisi</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-[#5A6B78]">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        {p.email}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {p.aktif !== false ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-800">
                          Nonaktif
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
