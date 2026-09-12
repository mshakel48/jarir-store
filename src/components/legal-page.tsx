import { PageActions } from "@/components/page-actions";
import { BRAND_NAME } from "@/lib/constants";

export function LegalPage({
  title,
  children,
  actions,
}: {
  title: string;
  children: React.ReactNode;
  actions?: { to: string; label: string; params?: { slug?: string }; search?: { q?: string } }[];
}) {
  return (
    <article className="container-page max-w-3xl py-10">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{BRAND_NAME}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">{children}</div>
      {actions?.length ? <PageActions items={actions} /> : null}
    </article>
  );
}
