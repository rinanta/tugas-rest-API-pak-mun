"use client";

export default function StatusBadge({ status, className = "" }) {
  const norm = (status || "").toLowerCase();

  let label = status || "-";
  let styleClass = "bg-gray-100 text-gray-700 border-gray-300";

  if (norm === "menunggu") {
    label = "Menunggu";
    styleClass = "badge-menunggu";
  } else if (norm === "dikonfirmasi") {
    label = "Dikonfirmasi";
    styleClass = "badge-dikonfirmasi";
  } else if (norm === "hadir") {
    label = "Hadir";
    styleClass = "badge-hadir";
  } else if (norm === "selesai") {
    label = "Selesai";
    styleClass = "badge-selesai";
  } else if (norm === "dibatalkan") {
    label = "Dibatalkan";
    styleClass = "badge-dibatalkan";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tabular-nums border ${styleClass} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {label}
    </span>
  );
}
