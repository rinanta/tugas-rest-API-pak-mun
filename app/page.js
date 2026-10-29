"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function RootPage() {
  const router = useRouter();
  const { currentUser, authLoading } = useApp();

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser) {
        router.replace("/masuk");
      } else {
        if (currentUser.role === "pasien") router.replace("/beranda");
        else if (currentUser.role === "resepsionis") router.replace("/resepsionis");
        else if (currentUser.role === "dokter") router.replace("/dokter");
        else if (currentUser.role === "super_admin") router.replace("/admin");
        else router.replace("/beranda");
      }
    }
  }, [authLoading, currentUser, router]);

  return (
    <div className="min-h-screen bg-[#F4F7F9] flex items-center justify-center">
      <div className="flex items-center gap-3 text-[#0E7490] text-sm font-medium">
        <div className="w-5 h-5 border-2 border-[#0E7490] border-t-transparent rounded-full animate-spin" />
        <span>Memuat Portal Senyum Rekah...</span>
      </div>
    </div>
  );
}
