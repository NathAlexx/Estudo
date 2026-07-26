"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const FEATURES = [
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
];

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="aurora-orb aurora-orb-1" />
        <div className="aurora-orb aurora-orb-2" />
        <div className="aurora-orb aurora-orb-3" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <div
          className={`mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300 backdrop-blur-sm transition-all duration-700 ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-400"></span>
          </span>
          Feito para casais que estudam juntos
        </div>

        <h1
          className={`mb-6 max-w-3xl font-[family-name:var(--font-sora)] text-5xl font-extrabold leading-tight tracking-tight text-white transition-all duration-700 delay-150 sm:text-6xl lg:text-7xl ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          Estudar em dupla fica <span className="text-gradient">mais fácil</span> e divertido
        </h1>

        <p
          className={`mb-10 max-w-xl text-lg leading-relaxed text-slate-400 transition-all duration-700 delay-300 ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          Central de estudos do casal. Organize matérias, tarefas, flashcards e ciclos de foco em um só lugar.
        </p>

        <div className={`flex flex-wrap items-center justify-center gap-3 transition-all duration-700 delay-500 ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
          <button
            onClick={() => router.push("/painel")}
            className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:scale-105"
          >
            Entrar no painel
          </button>
          <a href="#features" className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10">
            Ver recursos
          </a>
        </div>

        <div id="features" className="mt-16 grid w-full max-w-5xl gap-4 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="glass-card rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
              <div className="text-3xl">{feature.icon}</div>
              <h2 className="mt-4 text-lg font-semibold text-white">{feature.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
