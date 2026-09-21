import type { Locale } from "@/lib/types";

const numberFmt = new Intl.NumberFormat("en-US", {
  numberingSystem: "latn",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

export function formatMoney(amount: number, locale: Locale = "ar") {
  const n = numberFmt.format(roundMoney(amount));
  return locale === "ar" ? `${n} ر.س` : `SAR ${n}`;
}

export function roundMoney(n: number) {
  return Math.round(n * 100) / 100;
}

export function formatDate(iso: string, locale: Locale) {
  try {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : locale === "ka" ? "ka-GE" : "en-GB", {
      numberingSystem: "latn",
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function formatDateTime(iso: string, locale: Locale) {
  try {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : locale === "ka" ? "ka-GE" : "en-GB", {
      numberingSystem: "latn",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function formatAgo(ts: number, locale: Locale) {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 4) return locale === "ar" ? "الآن" : "now";
  if (s < 60) return locale === "ar" ? `منذ ${s} ث` : `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return locale === "ar" ? `منذ ${m} د` : `${m}m ago`;
  const h = Math.floor(m / 60);
  return locale === "ar" ? `منذ ${h} س` : `${h}h ago`;
}

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function formatSaudiPhone(value: string) {
  let d = digitsOnly(value);
  if (d.startsWith("00966")) d = d.slice(5);
  if (d.startsWith("966")) d = d.slice(3);
  if (d.startsWith("05")) d = d.slice(1);
  d = d.slice(0, 9);
  if (!d) return "+966 ";
  const a = d.slice(0, 2);
  const b = d.slice(2, 5);
  const c = d.slice(5, 9);
  return `+966 ${a}${b ? ` ${b}` : ""}${c ? ` ${c}` : ""}`.trim();
}

export function isValidSaudiPhone(value: string) {
  let d = digitsOnly(value);
  if (d.startsWith("00966")) d = d.slice(5);
  if (d.startsWith("966")) d = d.slice(3);
  if (d.startsWith("0")) d = d.slice(1);
  return /^5\d{8}$/.test(d);
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function luhnOk(num: string) {
  const d = digitsOnly(num);
  if (d.length < 13 || d.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = Number(d[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function detectCardBrand(num: string): "mada" | "visa" | "mastercard" | "unknown" {
  const d = digitsOnly(num);
  if (/^5[1-5]/.test(d) || /^2[2-7]/.test(d)) return "mastercard";
  if (/^4/.test(d)) return "visa";
  if (d.length >= 6) return "mada";
  return "unknown";
}
