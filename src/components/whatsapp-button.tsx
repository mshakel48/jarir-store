import { CONTACT_PHONE, WHATSAPP_URL } from "@/lib/constants";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M19.05 4.91A9.87 9.87 0 0 0 12.04 2C6.53 2 2.04 6.48 2.04 12c0 1.77.46 3.5 1.34 5.02L2 22l5.11-1.34A9.96 9.96 0 0 0 12.04 22c5.51 0 9.99-4.48 9.99-10 0-2.67-1.04-5.18-2.98-7.09ZM12.04 20.15c-1.62 0-3.2-.43-4.58-1.25l-.33-.2-3.03.8.81-2.96-.21-.34a8.15 8.15 0 0 1-1.25-4.4c0-4.5 3.67-8.16 8.18-8.16 2.18 0 4.24.85 5.78 2.39a8.13 8.13 0 0 1 2.39 5.77c0 4.5-3.67 8.15-8.16 8.15Zm4.48-6.11c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.78.95-.14.16-.29.18-.53.06-.24-.12-1.02-.38-1.95-1.2-.72-.64-1.21-1.43-1.35-1.67-.14-.24-.02-.37.11-.49.11-.11.24-.29.36-.43.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.3-.22.24-.86.84-.86 2.05 0 1.21.88 2.38 1 .54 1.13 2.72 2.73 3.61 4.86.54.23.97.37 1.3.47.55.17 1.04.15 1.43.09.44-.06 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

export function WhatsAppLink({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { t } = useT();
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex items-center gap-2 rounded-md font-semibold text-[#128C7E] hover:text-[#075E54]",
        className,
      )}
    >
      <WhatsAppIcon className="size-4" />
      {compact ? t("footer.whatsapp") : `${t("footer.quickWhatsapp")} · ${CONTACT_PHONE}`}
    </a>
  );
}

export function WhatsAppFloat() {
  const { t } = useT();
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-24 start-4 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:bg-[#1ebe5d] md:bottom-6"
      aria-label={`${t("footer.quickWhatsapp")} ${CONTACT_PHONE}`}
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
