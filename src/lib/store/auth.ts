import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEMO_ADMIN, DEMO_USER } from "@/lib/constants";
import type { Address, SavedPaymentMethod, User } from "@/lib/types";
import { uid } from "@/lib/utils";

interface AuthState {
  users: User[];
  currentId: string | null;
  addresses: Address[];
  paymentMethods: SavedPaymentMethod[];
  notificationsEnabled: boolean;
  register: (input: { name: string; email: string; phone: string; password: string }) => { ok: true } | { ok: false; error: string };
  login: (emailOrPhone: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (patch: Partial<Pick<User, "name" | "email" | "phone">>) => void;
  saveAddress: (address: Omit<Address, "id"> & { id?: string }) => string;
  removeAddress: (id: string) => void;
  addPaymentMethod: (method: Omit<SavedPaymentMethod, "id">) => void;
  removePaymentMethod: (id: string) => void;
  setNotifications: (on: boolean) => void;
}

const extraCustomers: User[] = [
  { id: "user-fahad", name: "فهد القحطاني", email: "fahad.q@gmail.com", phone: "+966 54 812 3301", password: "demo123", role: "customer", createdAt: "2026-03-02T08:12:00.000Z" },
  { id: "user-noura", name: "نورة الشمري", email: "noura.s@outlook.com", phone: "+966 55 441 2290", password: "demo123", role: "customer", createdAt: "2026-04-18T14:40:00.000Z" },
  { id: "user-abdullah", name: "عبدالله الغامدي", email: "a.ghamdi@gmail.com", phone: "+966 56 102 8844", password: "demo123", role: "customer", createdAt: "2026-05-09T11:05:00.000Z" },
  { id: "user-layan", name: "ليان الحربي", email: "layan.h@gmail.com", phone: "+966 53 778 1204", password: "demo123", role: "customer", createdAt: "2026-06-21T16:22:00.000Z" },
  { id: "user-mohammed", name: "محمد العتيبي", email: "m.otaibi@gmail.com", phone: "+966 50 933 6612", password: "demo123", role: "customer", createdAt: "2026-07-04T09:50:00.000Z" },
  { id: "user-hind", name: "هند السبيعي", email: "hind.s@icloud.com", phone: "+966 58 204 7719", password: "demo123", role: "customer", createdAt: "2026-07-28T19:18:00.000Z" },
  { id: "user-yousef", name: "يوسف الدوسري", email: "y.dosari@gmail.com", phone: "+966 54 667 3088", password: "demo123", role: "customer", createdAt: "2026-08-11T07:33:00.000Z" },
  { id: "user-reem", name: "ريم المطيري", email: "reem.m@gmail.com", phone: "+966 55 019 4473", password: "demo123", role: "customer", createdAt: "2026-08-30T13:09:00.000Z" },
];

const seedUsers: User[] = [
  {
    id: "user-demo",
    name: DEMO_USER.name,
    email: DEMO_USER.email,
    phone: DEMO_USER.phone,
    password: DEMO_USER.password,
    role: "customer",
    createdAt: "2026-01-12T10:00:00.000Z",
  },
  {
    id: "user-admin",
    name: DEMO_ADMIN.name,
    email: DEMO_ADMIN.email,
    phone: DEMO_ADMIN.phone,
    password: DEMO_ADMIN.password,
    role: "admin",
    createdAt: "2025-11-01T10:00:00.000Z",
  },
  ...extraCustomers,
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: seedUsers,
      currentId: null,
      addresses: [],
      paymentMethods: [],
      notificationsEnabled: true,
      register: (input) => {
        const email = input.email.trim().toLowerCase();
        if (get().users.some((u) => u.email === email)) {
          return { ok: false, error: "exists" };
        }
        const user: User = {
          id: uid("user"),
          name: input.name.trim(),
          email,
          phone: input.phone,
          password: input.password,
          role: "customer",
          createdAt: new Date().toISOString(),
        };
        set({ users: [...get().users, user], currentId: user.id });
        return { ok: true };
      },
      login: (emailOrPhone, password) => {
        const key = emailOrPhone.trim().toLowerCase();
        const user = get().users.find(
          (u) =>
            u.password === password &&
            (u.email === key || u.phone.replace(/\s/g, "") === key.replace(/\s/g, "")),
        );
        if (!user) return false;
        set({ currentId: user.id });
        return true;
      },
      logout: () => set({ currentId: null }),
      updateProfile: (patch) => {
        const id = get().currentId;
        if (!id) return;
        set({
          users: get().users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
        });
      },
      saveAddress: (address) => {
        const id = address.id ?? uid("addr");
        const next: Address = { ...address, id };
        let list = get().addresses.slice();
        if (next.isDefault) list = list.map((a) => ({ ...a, isDefault: false }));
        const idx = list.findIndex((a) => a.id === id);
        if (idx >= 0) list[idx] = next;
        else list.push(next);
        if (list.length === 1) list[0]!.isDefault = true;
        set({ addresses: list });
        return id;
      },
      removeAddress: (id) => set({ addresses: get().addresses.filter((a) => a.id !== id) }),
      addPaymentMethod: (method) =>
        set({
          paymentMethods: [...get().paymentMethods, { ...method, id: uid("pm") }],
        }),
      removePaymentMethod: (id) =>
        set({ paymentMethods: get().paymentMethods.filter((m) => m.id !== id) }),
      setNotifications: (on) => set({ notificationsEnabled: on }),
    }),
    {
      name: "jarir-auth",
      version: 3,
      migrate: (persisted) => {
        const s = persisted as AuthState;
        const emails = new Set((s.users ?? []).map((u) => u.email));
        const missing = extraCustomers.filter((u) => !emails.has(u.email));
        const users = [...(s.users ?? []), ...missing].map((u) =>
          u.id === "user-admin" || u.email === "admin@jarir.sa"
            ? { ...u, email: DEMO_ADMIN.email, phone: DEMO_ADMIN.phone, name: DEMO_ADMIN.name }
            : u,
        );
        return { ...s, users };
      },
    },
  ),
);

export function useCurrentShopUser() {
  return useAuthStore((s) => s.users.find((u) => u.id === s.currentId) ?? null);
}
