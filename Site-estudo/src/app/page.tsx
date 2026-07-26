import { db } from "@/db";
import { profiles } from "@/db/schema";
import { asc } from "drizzle-orm";
import ProfilePicker from "@/components/ProfilePicker";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const rows = await db.select().from(profiles).orderBy(asc(profiles.id));
  const allProfiles = rows.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() }));

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-14 sm:px-8 sm:py-20">
      <div className="aurora-orb aurora-orb-1" />
      <div className="aurora-orb aurora-orb-2" />
      <div className="aurora-orb aurora-orb-3" />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center text-center">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.25em] text-indigo-300 backdrop-blur">
          Central de estudos do casal
        </span>
        <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.2rem,6vw,3.8rem)] font-extrabold leading-[1.05] tracking-tight text-white">
          O plano perfeito para estudar em dupla
          <span className="mt-3 block text-gradient">mais leve, bonito e consistente</span>
        </h1>
        <p className="mt-5 max-w-3xl text-balance text-base text-slate-400 sm:text-lg">
          Um painel único para organizar matérias, tarefas, sessões de pomodoro, flashcards e o
          plano semanal — tudo com energia visual, animações suaves e motivação em tempo real.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-300">
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">⏱️ Pomodoro</span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">🧠 Flashcards</span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">💛 Modo casal</span>
        </div>
      </div>

      <div className="relative mx-auto mt-12 max-w-6xl">
        <ProfilePicker initialProfiles={allProfiles} />
      </div>

      <div className="relative mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-3">
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
          <div key={f.title} className="glass-card hover-lift panel-glow p-5 text-left">
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
