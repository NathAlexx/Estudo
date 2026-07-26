import { db } from "@/db";
import { profiles } from "@/db/schema";
import { asc } from "drizzle-orm";
import ProfilePicker from "@/components/ProfilePicker";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const rows = await db.select().from(profiles).orderBy(asc(profiles.id));
  const allProfiles = rows.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() }));

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-14 sm:py-20">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-indigo-300">
          Central de estudos do casal
        </span>
        <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.2rem,6vw,3.8rem)] font-extrabold leading-[1.05] tracking-tight text-white">
          Estudar em dupla fica{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-300 bg-clip-text text-transparent">
            mais fácil e divertido
          </span>
        </h1>
        <p className="mt-5 max-w-2xl text-balance text-base text-slate-400 sm:text-lg">
          Um painel só seu (e da sua noiva) para organizar matérias, tarefas, sessões de
          pomodoro, flashcards com repetição espaçada e o plano semanal — com direito a um
          placar de motivação entre vocês dois.
        </p>
      </div>

      <div className="relative mx-auto mt-14 max-w-5xl">
        <ProfilePicker initialProfiles={allProfiles} />
      </div>

      <div className="relative mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            icon: "⏱️",
            title: "Pomodoro inteligente",
            desc: "Ciclos de foco que registram automaticamente seu tempo de estudo por matéria.",
          },
          {
            icon: "🧠",
            title: "Flashcards com repetição espaçada",
            desc: "Sistema Leitner para revisar só o que precisa, na hora certa.",
          },
          {
            icon: "🏆",
            title: "Modo casal",
            desc: "Compare o progresso semanal de vocês dois e se motivem juntos.",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left backdrop-blur-sm"
          >
            <div className="text-2xl">{f.icon}</div>
            <h3 className="mt-3 font-[family-name:var(--font-display)] text-sm font-semibold text-white">
              {f.title}
            </h3>
            <p className="mt-1.5 text-sm text-slate-400">{f.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
