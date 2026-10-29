"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  Calendar,
  Clock,
  User,
  Users,
  Home,
  FileText,
  Activity,
  Layers,
  BarChart3,
  CalendarCheck,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  ShieldAlert,
  Stethoscope,
  Building2,
  RotateCcw,
  LogOut,
} from "lucide-react";

function AppLayoutInner({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isClient, authLoading, currentUser, logout, resetData } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [janjiDropdownOpen, setJanjiDropdownOpen] = useState(true);

  // If on login/register public page, we can show a simpler wrapper
  const isAuthPage = pathname === "/masuk" || pathname === "/daftar";

  // Redirect to /masuk if not logged in and trying to access protected pages (PRD Bab 6.2)
  useEffect(() => {
    if (isClient && !authLoading && !currentUser && !isAuthPage) {
      router.replace("/masuk");
    }
  }, [isClient, authLoading, currentUser, isAuthPage, router]);

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-[#F4F7F9] flex flex-col justify-between">
        <header className="bg-[#0E7490] text-white px-6 py-4 shadow-md flex items-center justify-between">
          <Link href="/masuk" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-white backdrop-blur-xs border border-white/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Klinik Gigi Senyum Rekah</h1>
              <p className="text-xs text-cyan-100">Portal Janji Temu & Catatan Perawatan</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/masuk"
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
                pathname === "/masuk"
                  ? "bg-white text-[#0E7490] shadow-xs"
                  : "bg-white/15 text-white hover:bg-white/25"
              }`}
            >
              Masuk
            </Link>
            <Link
              href="/daftar"
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
                pathname === "/daftar"
                  ? "bg-white text-[#0E7490] shadow-xs"
                  : "bg-white/15 text-white hover:bg-white/25"
              }`}
            >
              Daftar Pasien
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">{children}</main>
        <footer className="text-center py-4 text-xs text-[#5A6B78] border-t border-gray-200 bg-white">
          © 2026 Klinik Gigi Senyum Rekah Makassar • janji.senyumrekah.id
        </footer>
      </div>
    );
  }

  // Loading indicator while reading session from storage
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F4F7F9] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#0E7490] text-sm font-medium">
          <div className="w-5 h-5 border-2 border-[#0E7490] border-t-transparent rounded-full animate-spin" />
          <span>Memeriksa sesi pengguna...</span>
        </div>
      </div>
    );
  }

  // If user is not logged in on protected page, show gentle login prompt
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F4F7F9] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center max-w-sm shadow-xs">
          <div className="w-12 h-12 bg-cyan-50 text-[#0E7490] rounded-xl flex items-center justify-center mx-auto mb-3 border border-cyan-100">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#1F2937]">Silakan Masuk</h2>
          <p className="text-xs text-[#5A6B78] mt-1 mb-5">
            Anda perlu masuk ke akun terlebih dahulu untuk mengakses Portal Senyum Rekah.
          </p>
          <Link
            href="/masuk"
            className="block w-full py-2.5 px-4 bg-[#0E7490] hover:bg-[#0b5e75] text-white text-xs font-semibold rounded-xl transition shadow-xs"
          >
            Menuju Halaman Masuk →
          </Link>
        </div>
      </div>
    );
  }

  // Define sidebar menu items based on role (PRD Bab 3.1)
  const currentRole = currentUser?.role || "pasien";
  const isInactive = currentUser && currentUser.aktif === false;

  // Route Guard check (PRD Bab 2.3, 2.4, 5.4, 6.2, 8)
  const checkRoutePermission = () => {
    if (pathname.startsWith("/admin")) {
      return {
        allowed: currentRole === "super_admin",
        roleName: "Super Admin",
      };
    }
    if (pathname.startsWith("/resepsionis")) {
      return {
        allowed: currentRole === "resepsionis" || currentRole === "super_admin",
        roleName: "Resepsionis",
      };
    }
    if (pathname.startsWith("/dokter")) {
      return {
        allowed: currentRole === "dokter" || currentRole === "super_admin",
        roleName: "Dokter",
      };
    }
    if (
      pathname === "/beranda" ||
      pathname.startsWith("/janji") ||
      pathname.startsWith("/riwayat")
    ) {
      return {
        allowed: currentRole === "pasien" || currentRole === "super_admin",
        roleName: "Pasien",
      };
    }
    // /profil, /masuk, /daftar or other pages are open to all active users
    return { allowed: true, roleName: "" };
  };

  const routePerm = checkRoutePermission();

  const getDefaultHomeForRole = (role) => {
    if (role === "resepsionis") return "/resepsionis";
    if (role === "dokter") return "/dokter";
    if (role === "super_admin") return "/admin";
    return "/beranda";
  };

  return (
    <div className="min-h-screen bg-[#F4F7F9] flex flex-col font-sans">
      {/* BILAH ATAS (BIRU REKAH #0E7490) */}
      <header className="bg-[#0E7490] text-white sticky top-0 z-40 shadow-sm border-b border-cyan-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link href="/beranda" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center font-bold text-white border border-white/20 shadow-xs">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight block leading-tight">
                  Senyum Rekah
                </span>
                <span className="text-[11px] text-cyan-100 block leading-none">
                  Portal Janji Klinik Gigi
                </span>
              </div>
            </Link>
          </div>

          {/* USER INFO & LOGOUT BUTTON (PRD Bab 2.1 & 2.2) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-bold">
                {currentUser?.nama?.charAt(0) || "U"}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold leading-tight max-w-[120px] truncate">
                  {currentUser?.nama}
                </div>
                <div className="text-[10px] text-cyan-200 uppercase tracking-wider font-semibold">
                  {currentUser?.role?.replace("_", " ")}
                </div>
              </div>
            </div>

            <Link
              href="/profil"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
              title="Profil Pengguna"
            >
              <User className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/masuk");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-white text-xs font-semibold border border-red-300/30 transition shadow-xs"
              title="Keluar dari akun"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* BODY WITH SIDEBAR & CONTENT */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex gap-6 relative">
        {/* Mobile Backdrop */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* SIDEBAR NAVIGATION (PRD Bab 3.1 & Bab 5) */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:static lg:transform-none lg:w-64 lg:rounded-xl lg:border lg:shadow-xs p-4 flex flex-col justify-between overflow-y-auto ${
            mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between lg:hidden pb-3 border-b border-gray-100">
              <span className="font-bold text-sm text-[#0E7490]">Menu Navigasi</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-md hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Menu Sections based on active Role */}
            <div className="space-y-4">
              {/* PASIEN SECTION (Show if pasien or super_admin) */}
              {(currentRole === "pasien" || currentRole === "super_admin") && (
                <div>
                  <div className="text-[11px] font-semibold text-[#5A6B78] uppercase tracking-wider px-3 mb-2">
                    {currentRole === "super_admin" ? "Modul Pasien" : "Menu Utama"}
                  </div>
                  <nav className="space-y-1">
                    <Link
                      href="/beranda"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                        pathname === "/beranda"
                          ? "bg-[#0E7490] text-white shadow-xs"
                          : "text-[#1F2937] hover:bg-gray-100"
                      }`}
                    >
                      <Home className="w-4 h-4" />
                      Beranda
                    </Link>

                    {/* Janji Saya Accordion / Submenu */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setJanjiDropdownOpen(!janjiDropdownOpen)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition ${
                          pathname.startsWith("/janji") && pathname !== "/janji/baru"
                            ? "text-[#0E7490] bg-cyan-50"
                            : "text-[#1F2937] hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4" />
                          <span>Janji Saya</span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            janjiDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {janjiDropdownOpen && (
                        <div className="ml-7 mt-1 space-y-1 pl-2 border-l-2 border-gray-100">
                          <Link
                            href="/janji"
                            onClick={() => setMobileMenuOpen(false)}
                            className={`block px-3 py-1.5 rounded-md text-xs font-medium transition ${
                              pathname === "/janji"
                                ? "text-[#0E7490] font-bold bg-cyan-50"
                                : "text-[#5A6B78] hover:text-[#1F2937] hover:bg-gray-50"
                            }`}
                          >
                            Daftar Janji
                          </Link>
                          <Link
                            href="/janji/baru"
                            onClick={() => setMobileMenuOpen(false)}
                            className={`block px-3 py-1.5 rounded-md text-xs font-medium transition ${
                              pathname === "/janji/baru"
                                ? "text-[#0E7490] font-bold bg-cyan-50"
                                : "text-[#5A6B78] hover:text-[#1F2937] hover:bg-gray-50"
                            }`}
                          >
                            + Buat Janji
                          </Link>
                        </div>
                      )}
                    </div>

                    <Link
                      href="/riwayat"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                        pathname === "/riwayat"
                          ? "bg-[#0E7490] text-white shadow-xs"
                          : "text-[#1F2937] hover:bg-gray-100"
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      Riwayat Perawatan
                    </Link>
                  </nav>
                </div>
              )}

              {/* RESEPSIONIS SECTION (Show if resepsionis or super_admin) */}
              {(currentRole === "resepsionis" || currentRole === "super_admin") && (
                <div>
                  <div className="text-[11px] font-semibold text-[#5A6B78] uppercase tracking-wider px-3 mb-2">
                    {currentRole === "super_admin" ? "Modul Resepsionis" : "Menu Resepsionis"}
                  </div>
                  <nav className="space-y-1">
                    <Link
                      href="/resepsionis"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                        pathname === "/resepsionis"
                          ? "bg-[#0E7490] text-white shadow-xs"
                          : "text-[#1F2937] hover:bg-gray-100"
                      }`}
                    >
                      <Activity className="w-4 h-4" />
                      Dasbor Resepsionis
                    </Link>
                    <Link
                      href="/resepsionis/janji"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                        pathname.startsWith("/resepsionis/janji")
                          ? "bg-[#0E7490] text-white shadow-xs"
                          : "text-[#1F2937] hover:bg-gray-100"
                      }`}
                    >
                      <CalendarCheck className="w-4 h-4" />
                      Kelola Janji
                    </Link>
                    <Link
                      href="/resepsionis/pasien"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                        pathname === "/resepsionis/pasien"
                          ? "bg-[#0E7490] text-white shadow-xs"
                          : "text-[#1F2937] hover:bg-gray-100"
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      Data Pasien
                    </Link>
                  </nav>
                </div>
              )}

              {/* DOKTER SECTION (Show if dokter or super_admin) */}
              {(currentRole === "dokter" || currentRole === "super_admin") && (
                <div>
                  <div className="text-[11px] font-semibold text-[#5A6B78] uppercase tracking-wider px-3 mb-2">
                    {currentRole === "super_admin" ? "Modul Dokter" : "Menu Dokter"}
                  </div>
                  <nav className="space-y-1">
                    <Link
                      href="/dokter"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                        pathname === "/dokter" || pathname.startsWith("/dokter/")
                          ? "bg-[#0E7490] text-white shadow-xs"
                          : "text-[#1F2937] hover:bg-gray-100"
                      }`}
                    >
                      <Stethoscope className="w-4 h-4" />
                      Dasbor Dokter
                    </Link>
                  </nav>
                </div>
              )}

              {/* SUPER ADMIN SECTION */}
              {currentRole === "super_admin" && (
                <div>
                  <div className="text-[11px] font-semibold text-[#5A6B78] uppercase tracking-wider px-3 mb-2">
                    Modul Admin
                  </div>
                  <nav className="space-y-1">
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                        pathname === "/admin"
                          ? "bg-[#0E7490] text-white shadow-xs"
                          : "text-[#1F2937] hover:bg-gray-100"
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      Dasbor Admin
                    </Link>
                    <Link
                      href="/admin/pengguna"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                        pathname.startsWith("/admin/pengguna")
                          ? "bg-[#0E7490] text-white shadow-xs"
                          : "text-[#1F2937] hover:bg-gray-100"
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      Kelola Pengguna
                    </Link>
                    <Link
                      href="/admin/layanan"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                        pathname === "/admin/layanan"
                          ? "bg-[#0E7490] text-white shadow-xs"
                          : "text-[#1F2937] hover:bg-gray-100"
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                      Layanan
                    </Link>
                    <Link
                      href="/admin/jadwal-dokter"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                        pathname === "/admin/jadwal-dokter"
                          ? "bg-[#0E7490] text-white shadow-xs"
                          : "text-[#1F2937] hover:bg-gray-100"
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      Jadwal Dokter
                    </Link>
                    <Link
                      href="/admin/laporan"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                        pathname === "/admin/laporan"
                          ? "bg-[#0E7490] text-white shadow-xs"
                          : "text-[#1F2937] hover:bg-gray-100"
                      }`}
                    >
                      <BarChart3 className="w-4 h-4" />
                      Laporan
                    </Link>
                  </nav>
                </div>
              )}

              {/* PROFIL (ALL ROLES) */}
              <div className="pt-2 border-t border-gray-100">
                <Link
                  href="/profil"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    pathname === "/profil"
                      ? "bg-[#0E7490] text-white shadow-xs"
                      : "text-[#1F2937] hover:bg-gray-100"
                  }`}
                >
                  <User className="w-4 h-4" />
                  Profil
                </Link>
              </div>
            </div>
          </div>

          {/* Tombol Keluar dari Akun di Bawah Sidebar */}
          <div className="pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/masuk");
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-xl border border-red-100 transition shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar dari Akun</span>
            </button>
          </div>
        </aside>

        {/* MAIN PANEL CONTENT (#FFFFFF) */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-5 sm:p-7 min-h-[calc(100vh-140px)]">
            {isInactive ? (
              <div className="min-h-[400px] flex items-center justify-center py-12 px-4">
                <div className="max-w-md w-full text-center">
                  <div className="w-14 h-14 bg-red-50 text-[#E53935] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-xs">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-bold text-[#1F2937]">Akun Dinonaktifkan</h2>
                  <p className="text-sm text-[#5A6B78] mt-2 mb-6 leading-relaxed">
                    Akun Anda dinonaktifkan. Hubungi klinik.
                  </p>
                  <div className="p-3 bg-gray-50 rounded-xl text-xs text-[#5A6B78] mb-6 border border-gray-100">
                    Pengguna: <strong className="text-gray-800">{currentUser?.nama}</strong> ({currentUser?.email})
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Link
                      href="/masuk"
                      className="px-4 py-2 bg-[#0E7490] hover:bg-[#0b5e75] text-white text-xs font-semibold rounded-xl transition shadow-xs"
                    >
                      Ke Halaman Masuk
                    </Link>
                  </div>
                </div>
              </div>
            ) : !routePerm.allowed ? (
              <div className="min-h-[400px] flex items-center justify-center py-12 px-4">
                <div className="max-w-md w-full text-center">
                  <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100 shadow-xs">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-bold text-[#1F2937]">Akses Ditolak</h2>
                  <p className="text-sm text-[#5A6B78] mt-2 mb-6 leading-relaxed">
                    Anda tidak memiliki izin untuk membuka halaman ini. Halaman ini hanya dapat diakses oleh peran <strong className="text-[#0E7490]">{routePerm.roleName}</strong>.
                  </p>
                  <Link
                    href={getDefaultHomeForRole(currentRole)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0E7490] hover:bg-[#0b5e75] text-white text-xs font-semibold rounded-xl transition shadow-xs"
                  >
                    Kembali ke Beranda Saya
                  </Link>
                </div>
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>

      {/* MOBILE OVERLAY */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}

export default function AppLayout({ children }) {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#F4F7F9]" />}>
      <AppLayoutInner>{children}</AppLayoutInner>
    </React.Suspense>
  );
}
