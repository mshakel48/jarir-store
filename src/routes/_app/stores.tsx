import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CITY_IDS, STORES } from "@/lib/data/stores";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_app/stores")({
  component: StoresPage,
});

function StoresPage() {
  const { t, locale } = useT();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("all");
  const list = useMemo(
    () =>
      STORES.filter((s) => (city === "all" ? true : s.city === city)).filter((s) => {
        const hay = `${s.name} ${s.arabicName} ${s.address} ${s.arabicAddress}`.toLowerCase();
        return hay.includes(q.trim().toLowerCase());
      }),
    [q, city],
  );

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-semibold md:text-3xl">{t("stores.title")}</h1>
      <div className="mt-6 flex flex-col gap-3 md:flex-row">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("stores.search")} className="md:max-w-sm" />
        <select className="h-11 rounded-md border border-input bg-card px-3" value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="all">{t("stores.all")}</option>
          {CITY_IDS.filter((c) => c !== "other").map((id) => (
            <option key={id} value={id}>
              {t(`cities.${id}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-muted">
        <div className="relative h-56 bg-secondary">
          <svg viewBox="0 0 400 220" className="size-full text-border" aria-hidden>
            <rect width="400" height="220" fill="currentColor" opacity="0.25" />
            {STORES.map((s, i) => (
              <circle key={s.id} cx={40 + ((s.lng - 36) / 16) * 320} cy={180 - ((s.lat - 16) / 14) * 150} r={city === "all" || city === s.city ? 6 : 3} fill="var(--color-primary)" opacity={city === "all" || city === s.city ? 1 : 0.3} />
            ))}
          </svg>
          <p className="absolute start-4 top-4 rounded-md bg-card/90 px-2 py-1 text-xs font-medium">{t("stores.map")}</p>
        </div>
      </div>

      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {list.map((s) => (
          <li key={s.id} className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <h2 className="font-semibold">{locale === "ar" ? s.arabicName : s.name}</h2>
            <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              {locale === "ar" ? s.arabicAddress : s.address}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{locale === "ar" ? s.arabicHours : s.hours}</p>
            <p className="mt-1 flex items-center gap-2 text-sm">
              <Phone className="size-4" />
              <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="hover:underline">
                {s.phone}
              </a>
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(locale === "ar" ? s.arabicServices : s.services).map((svc) => (
                <span key={svc} className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium">
                  {svc}
                </span>
              ))}
            </div>
            <Button asChild variant="outline" className="mt-4">
              <a href={`https://maps.google.com/?q=${s.lat},${s.lng}`} target="_blank" rel="noreferrer">
                {t("stores.directions")}
              </a>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
