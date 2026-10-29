"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import ConfirmModal from "@/components/ConfirmModal";
import { EmptyState } from "@/components/FeedbackState";
import { useApp } from "@/context/AppContext";
import {
  User,
  Mail,
  Phone,
  Shield,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Save,
  Ban,
  Check,
} from "lucide-react";

function RincianPenggunaContent() {
  const routeParams = useParams();
  const id = routeParams?.id;
  const router = useRouter();

  const { users, updateUser, currentUser } = useApp();

  const targetUser = users.find((u) => u.id === id);

  const [role, setRole] = useState(targetUser?.role || "pasien");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  useEffect(() => {
    if (targetUser) {
      setRole(targetUser.role);
    }
  }, [targetUser]);

  if (!targetUser) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <EmptyState
          title="Pengguna tidak ditemukan"
          description="Pengguna dengan ID ini tidak terdaftar di sistem."
          actionText="Kembali ke Kelola Pengguna"
          onAction={() => router.push("/admin/pengguna")}
        />
      </div>
    );
  }

  const isSelf = currentUser?.id === targetUser.id;

  const handleSaveRole = (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (isSelf && role !== "super_admin") {
      setErrorMsg("Anda tidak bisa menurunkan peran akun Anda sendiri.");
      return;
    }

    updateUser(targetUser.id, { role });
    setSuccessMsg("Peran pengguna berhasil diperbarui!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleToggleAktif = () => {
    if (isSelf) {
      setErrorMsg("Anda tidak bisa menonaktifkan akun Anda sendiri.");
      return;
    }

    const newAktifStatus = targetUser.aktif === false ? true : false;
    updateUser(targetUser.id, { aktif: newAktifStatus });
    setConfirmModalOpen(false);
    setSuccessMsg(
      `Akun pengguna berhasil ${newAktifStatus ? "diaktifkan kembali" : "dinonaktifkan"}!`
    );
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pengguna"
            className="p-2 rounded-lg hover:bg-gray-100 text-[#5A6B78] transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-xs font-semibold text-[#0E7490] tracking-wider uppercase">
              Rincian Akun Pengguna
            </span>
            <h1 className="text-2xl font-bold text-[#1F2937]">{targetUser.nama}</h1>
          </div>
        </div>
        {targetUser.aktif !== false ? (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            Aktif
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            Nonaktif
          </span>
        )}
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

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#F4F7F9]">
            <span className="text-[#5A6B78] block mb-1">Email Pengguna</span>
            <span className="font-semibold text-[#1F2937]">{targetUser.email}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F4F7F9]">
            <span className="text-[#5A6B78] block mb-1">Nomor HP</span>
            <span className="font-semibold text-[#1F2937] tabular-nums">
              {targetUser.noHp || "-"}
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveRole} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-[#1F2937] mb-1">
              Ubah Peran Akun <span className="text-red-500">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isSelf}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-[#0E7490] bg-white font-medium disabled:bg-gray-100"
            >
              <option value="pasien">Pasien</option>
              <option value="resepsionis">Resepsionis</option>
              <option value="dokter">Dokter</option>
              <option value="super_admin">Super Admin</option>
            </select>
            <p className="text-[11px] text-[#5A6B78] mt-1">
              Peran menentukan hak akses halaman dan modul yang dapat dibuka pengguna.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSelf}
            className="w-full py-2.5 px-4 bg-[#0E7490] hover:bg-[#0b5e75] text-white text-xs font-semibold rounded-xl transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Simpan Peran Baru
          </button>
        </form>

        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-[#1F2937]">Status Akun</h4>
              <p className="text-[11px] text-[#5A6B78]">
                Akun nonaktif tidak dapat masuk atau membuka halaman apa pun.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setConfirmModalOpen(true)}
              disabled={isSelf}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
                targetUser.aktif !== false
                  ? "border-[#E53935] text-[#E53935] hover:bg-red-50"
                  : "border-[#15A66A] text-[#15A66A] hover:bg-emerald-50"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {targetUser.aktif !== false ? "Nonaktifkan Akun" : "Aktifkan Akun"}
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModalOpen}
        title={targetUser.aktif !== false ? "Nonaktifkan Akun" : "Aktifkan Akun"}
        message={`Apakah Anda yakin ingin ${
          targetUser.aktif !== false ? "menonaktifkan" : "mengaktifkan kembali"
        } akun ${targetUser.nama}?`}
        confirmLabel={targetUser.aktif !== false ? "Ya, Nonaktifkan" : "Ya, Aktifkan"}
        confirmVariant={targetUser.aktif !== false ? "danger" : "success"}
        onConfirm={handleToggleAktif}
        onClose={() => setConfirmModalOpen(false)}
      />
    </div>
  );
}

export default function RincianPenggunaAdminPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Memuat data...</div>}>
        <RincianPenggunaContent />
      </Suspense>
    </AppLayout>
  );
}
