"use client";

import { AppProvider } from "@/context/AppContext";

export default function ClientProviders({ children }) {
  return <AppProvider>{children}</AppProvider>;
}
