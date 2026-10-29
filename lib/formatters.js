export function formatRupiah(angka) {
  if (typeof angka !== "number") return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(angka);
}

export function formatTanggalIndonesia(tanggalStr) {
  if (!tanggalStr) return "-";
  try {
    const parts = tanggalStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, monthIndex, day);
      return new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(d);
    }
    const d = new Date(tanggalStr);
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d);
  } catch {
    return tanggalStr;
  }
}

export function formatJam(jamStr) {
  if (!jamStr) return "-";
  return `${jamStr} WITA`;
}
