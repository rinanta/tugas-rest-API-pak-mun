"use client";

import React, { useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { useApp } from "@/context/AppContext";
import { Users, Search, ChevronRight, ShieldCheck, ShieldAlert } from "lucide-react";

export default function KelolaPenggunaPage() {
  const { users } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter((u) =>
    (u.nama || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div>
            <span className="text-xs font-semibold text-[#0E7490] tracking-wider uppercase">
              Modul Super Admin
            </span>
            <h1 className="text-2xl font-bold text-[#1F2937] mt-1">Kelola Pengguna</h1>
            <p className="text-xs text-[#5A6B78] mt-1">
              Daftar pengguna aplikasi, penetapan peran (pasien, resepsionis, dokter, super admin), dan status akun.
            </p>
          </div>
          <div className="text-xs bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
            Total Akun: <strong className="text-[#1F2937]">{users.length}</strong>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#5A6B78]" />
          <input
            type="text"
            placeholder="Cari nama atau email pengguna..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-[#0E7490] bg-white"
          />
        </div>

        {/* Tabel Pengguna (PRD Bab 4.13) */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-xs text-[#1F2937]">
            <thead className="bg-[#F4F7F9] text-[#5A6B78] uppercase text-[11px] font-semibold tracking-wider border-b border-gray-200">
              <tr>
                <th scope="col" className="px-5 py-3.5">Nama</th>
                <th scope="col" className="px-5 py-3.5">Email</th>
                <th scope="col" className="px-5 py-3.5">Peran</th>
                <th scope="col" className="px-5 py-3.5">Status</th>
                <th scope="col" className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-xs text-[#5A6B78]">
                    Pengguna tidak ditemukan.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  let roleBadge = "bg-gray-100 text-gray-800";
                  if (u.role === "super_admin") roleBadge = "bg-emerald-100 text-emerald-800";
                  else if (u.role === "dokter") roleBadge = "bg-purple-100 text-purple-800";
                  else if (u.role === "resepsionis") roleBadge = "bg-blue-100 text-blue-800";
                  else if (u.role === "pasien") roleBadge = "bg-cyan-100 text-cyan-800";

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-cyan-50/20 transition cursor-pointer"
                      onClick={() => window.location.assign(`/admin/pengguna/${u.id}`)}
                    >
                      <td className="px-5 py-3.5 font-bold text-[#1F2937]">
                        {u.nama}
                      </td>
                      <td className="px-5 py-3.5 text-[#5A6B78]">
                        {u.email}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase ${roleBadge}`}>
                          {u.role.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {u.aktif !== false ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                            Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="inline-flex items-center text-xs text-[#0E7490] font-semibold hover:underline">
                          Ubah <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
