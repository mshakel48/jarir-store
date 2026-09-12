import { createRootRoute, HeadContent, Link, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { LocaleSync } from "@/components/locale-sync";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { BRAND_NAME, SITE_URL } from "@/lib/constants";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: BRAND_NAME },
      { name: "description", content: "متجر جرير — كتب، إلكترونيات، ومستلزمات مدرسية في السعودية" },
      { name: "theme-color", content: "#C8102E" },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/` },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  notFoundComponent: NotFound,
  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className="antialiased">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-dvh bg-background text-foreground">
        <PreviewHostBridge />
        <LocaleSync />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Toaster
          closeButton
          position="bottom-center"
          toastOptions={{
            className: "font-sans",
          }}
        />
        <Scripts />
      </body>
    </html>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
      <Logo />
      <h1 className="text-2xl font-semibold">الصفحة غير موجودة</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        عذراً، لم نجد هذه الصفحة في متجر جرير.
      </p>
      <Button asChild>
        <Link to="/">العودة للرئيسية</Link>
      </Button>
    </div>
  );
}
