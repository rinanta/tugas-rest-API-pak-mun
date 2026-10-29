import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Portal Janji Senyum Rekah | Klinik Gigi Senyum Rekah",
  description: "Aplikasi Janji Temu dan Catatan Perawatan Klinik Gigi Senyum Rekah, Makassar.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F4F7F9] text-[#1F2937]">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
