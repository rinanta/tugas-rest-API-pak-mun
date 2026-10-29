"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import { useApp } from "@/context/AppContext";
import { Lock, Mail, Phone, User, CheckCircle2, AlertCircle } from "lucide-react";

export default function DaftarPage() {
  const router = useRouter();
  const { register, loginWithGoogle } = useApp();

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [noHp, setNoHp] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!nama.trim()) {
      setError("Nama wajib diisi.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Email wajib diisi dan harus berupa email yang valid.");
      return;
    }
    if (!noHp.startsWith("08") || !/^\d+$/.test(noHp)) {
      setError("Nomor HP harus berupa angka dan diawali dengan 08.");
      return;
    }
    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }

    setLoading(true);
    try {
      const res = await register({ nama, email, noHp, password });
      setLoading(false);
      if (!res.success) {
        setError(res.error);
        return;
      }
      router.push("/beranda");
    } catch (err) {
      setLoading(false);
      setError(err.message || "Gagal mendaftar.");
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await loginWithGoogle();
      setLoading(false);
      if (!res.success) {
        setError(res.error);
        return;
      }
      router.push("/beranda");
    } catch (err) {
      setLoading(false);
      setError(err.message || "Gagal mendaftar dengan Google.");
    }
  };

  return (
    <AppLayout>
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/90 p-5 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-cyan-50 text-[#0E7490] rounded-2xl flex items-center justify-center mx-auto mb-3 border border-cyan-100 shadow-xs">
              <User className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-[#1F2937]">Daftar Akun Baru</h1>
            <p className="text-xs text-[#5A6B78] mt-1">
              Daftar sebagai pasien di Portal Janji Senyum Rekah
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#E53935]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1F2937] mb-1">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-[#5A6B78]" />
                <input
                  type="text"
                  placeholder="Contoh: Andi Saputra"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-none focus:border-[#0E7490] focus:ring-1 focus:ring-[#0E7490]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2937] mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#5A6B78]" />
                <input
                  type="email"
                  placeholder="andi@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-none focus:border-[#0E7490] focus:ring-1 focus:ring-[#0E7490]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2937] mb-1">
                Nomor HP (WhatsApp) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3 text-[#5A6B78]" />
                <input
                  type="tel"
                  placeholder="081234567890"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-none focus:border-[#0E7490] focus:ring-1 focus:ring-[#0E7490] tabular-nums"
                  required
                />
              </div>
              <p className="text-[11px] text-[#5A6B78] mt-1">Harus diawali 08 dan hanya angka</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2937] mb-1">
                Kata Sandi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#5A6B78]" />
                <input
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-none focus:border-[#0E7490] focus:ring-1 focus:ring-[#0E7490]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#0E7490] hover:bg-[#0b5e75] text-white text-sm font-semibold rounded-xl transition shadow-xs mt-2 disabled:opacity-50"
            >
              {loading ? "Mendaftarkan..." : "Daftar"}
            </button>
          </form>

          <div className="my-5 flex items-center">
            <div className="flex-1 border-t border-gray-200" />
            <span className="px-3 text-xs text-[#5A6B78] uppercase">atau</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-sm font-medium text-[#1F2937] rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Masuk dengan Google
          </button>

          <p className="text-center text-xs text-[#5A6B78] mt-6">
            Sudah punya akun?{" "}
            <Link href="/masuk" className="text-[#0E7490] font-semibold hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
