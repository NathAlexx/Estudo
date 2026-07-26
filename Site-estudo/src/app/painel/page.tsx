import { Suspense } from "react";
import AppShell from "@/components/AppShell";

export const dynamic = "force-dynamic";

export default function PainelPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center text-slate-400">Carregando...</div>}>
      <AppShell />
    </Suspense>
  );
}
