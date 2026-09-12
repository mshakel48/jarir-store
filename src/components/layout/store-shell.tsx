import { Outlet } from "@tanstack/react-router";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { LiveTracker } from "@/components/live-tracker";
import { MobileNav } from "@/components/layout/mobile-nav";
import { WhatsAppFloat } from "@/components/whatsapp-button";

export function StoreShell() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <LiveTracker />
      <Header />
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloat />
      <MobileNav />
    </div>
  );
}
