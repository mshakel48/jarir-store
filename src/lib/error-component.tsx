import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return "";
}

export function AppErrorComponent({ error }: ErrorComponentProps) {
  const detail = errorMessage(error);
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#f6f3ee] px-6 text-center text-foreground">
      <span className="text-primary" aria-hidden="true">
        <TriangleAlert className="size-10" strokeWidth={2} />
      </span>
      <h1 className="text-lg font-semibold">حدث خطأ أثناء إتمام الطلب</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        حدّث الصفحة وأعد المحاولة. إن استمر الخطأ أكمل الحقول ثم اضغط تأكيد الطلب مرة أخرى.
      </p>
      {detail ? <p className="max-w-md break-words text-xs text-muted-foreground">{detail}</p> : null}
      <Button type="button" onClick={() => window.location.assign("/checkout")}>
        العودة لإتمام الطلب
      </Button>
    </main>
  );
}
