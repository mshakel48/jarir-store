import { useEffect, useState } from "react";

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

export function useCountdown(endAt: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const diff = Math.max(0, endAt - now);
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { hours, minutes, seconds, done: diff <= 0 };
}

export function getDealEnd() {
  if (typeof window === "undefined") return Date.now() + 8 * 3600_000;
  const key = "jarir-deal-end";
  const stored = Number(localStorage.getItem(key) ?? 0);
  if (stored > Date.now()) return stored;
  const end = Date.now() + 8 * 3600_000;
  localStorage.setItem(key, String(end));
  return end;
}
