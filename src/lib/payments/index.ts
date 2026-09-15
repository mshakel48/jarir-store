import { DEMO_PAYMENTS } from "@/lib/constants";
import { digitsOnly, luhnOk } from "@/lib/format";
import type { PaymentMethodId, PaymentResult } from "@/lib/types";
import { uid } from "@/lib/utils";

export interface ChargeInput {
  amount: number;
  method: PaymentMethodId;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  holder?: string;
}

export interface PaymentProvider {
  id: PaymentMethodId;
  charge(input: ChargeInput): Promise<PaymentResult>;
}

function delay(ms = 900) {
  return new Promise((r) => setTimeout(r, ms));
}

function demoSuccess(last4?: string): PaymentResult {
  return {
    success: true,
    transactionId: uid("txn"),
    demo: true,
    last4,
  };
}

function demoFail(en: string, ar: string): PaymentResult {
  return { success: false, error: en, errorAr: ar, demo: true };
}

function notConfigured(name: string): PaymentResult {
  return {
    success: false,
    demo: false,
    error: `${name} is not configured. Set the server environment variable and disable demo payments.`,
    errorAr: `${name} غير مهيأ. اضبط متغير البيئة على الخادم وأوقف الوضع التجريبي.`,
  };
}

const TappyProvider: PaymentProvider = {
  id: "tappy",
  async charge() {
    await delay();
    if (!DEMO_PAYMENTS) return notConfigured("Tabby (TABBY_API_KEY)");
    return demoSuccess();
  },
};

const TamaraProvider: PaymentProvider = {
  id: "tamara",
  async charge() {
    await delay();
    if (!DEMO_PAYMENTS) return notConfigured("Tamara (TAMARA_API_KEY)");
    return demoSuccess();
  },
};

const CardProvider: PaymentProvider = {
  id: "card",
  async charge(input) {
    await delay(1100);
    const num = digitsOnly(input.cardNumber ?? "");
    const last4 = num.slice(-4);
    if (num.length < 13 || !luhnOk(num)) {
      return demoFail("Please enter a valid card number.", "يرجى إدخال رقم بطاقة صحيح.");
    }
    if (!input.expiry || !input.cvv || !input.holder) {
      return demoFail("Please complete card details.", "يرجى إكمال بيانات البطاقة.");
    }
    if (last4 === "0000") {
      return demoFail("Payment declined (demo).", "رُفض الدفع (تجريبي).");
    }
    if (!DEMO_PAYMENTS) return notConfigured("Card / Mada (PAYMENT_SECRET)");
    return demoSuccess(last4);
  },
};

const ApplePayProvider: PaymentProvider = {
  id: "applepay",
  async charge() {
    await delay(700);
    if (!DEMO_PAYMENTS) return notConfigured("Apple Pay (PAYMENT_SECRET)");
    return demoSuccess();
  },
};

const CODProvider: PaymentProvider = {
  id: "cod",
  async charge() {
    await delay(400);
    return { success: true, transactionId: uid("cod"), demo: DEMO_PAYMENTS };
  },
};

const registry: Record<PaymentMethodId, PaymentProvider> = {
  tappy: TappyProvider,
  tamara: TamaraProvider,
  mada: CardProvider,
  card: CardProvider,
  applepay: ApplePayProvider,
  cod: CODProvider,
};

export function getProvider(method: PaymentMethodId) {
  return registry[method];
}

export async function processPayment(input: ChargeInput): Promise<PaymentResult> {
  return getProvider(input.method).charge(input);
}

export function installmentAmount(total: number, parts = 4) {
  return Math.round((total / parts) * 100) / 100;
}

export const PROVIDER_META: {
  id: PaymentMethodId;
  env: string;
}[] = [
  { id: "card", env: "PAYMENT_SECRET" },
];
