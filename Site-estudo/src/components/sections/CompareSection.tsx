"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { CompareEntry } from "@/lib/types";
import { Card, EmptyState, SectionHeader } from "@/components/ui";

export default function CompareSection() {
  const [data, setData] = useState<CompareEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<CompareEntry[]>("/api/stats/compare")
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...data].sort((a, b) => b.weeklyMinutes - a.weeklyMinutes);
  const max = Math.max(1, ...data.map((d) => d.weeklyMinutes));

  return (
    <div>
      <SectionHeader title="Modo casal 💛" subtitle="Comparem o progresso da semana e se motivem juntos" />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : data.length < 2 ? (
        <EmptyState icon="👫" text="Crie os dois perfis (você e sua noiva) na tela inicial para habilitar a comparação." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {sorted.map((entry, idx) => (
              <Card key={entry.profile.id} className="relative overflow-hidden">
                {idx === 0 && entry.weeklyMinutes > 0 && (
                  <span className="absolute right-4 top-4 text-2xl">👑</span>
                )}
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
                    style={{ backgroundColor: `${entry.profile.colorHex}22` }}
                  >
                    {entry.profile.emoji}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{entry.profile.name}</p>
                    <p className="text-xs text-slate-500">Meta semanal: {entry.profile.weeklyGoalMinutes} min</p>
                  </div>
                </div>

                <p className="mt-5 font-[family-name:var(--font-display)] text-3xl font-bold text-white">
                  {entry.weeklyMinutes} <span className="text-base font-medium text-slate-400">min esta semana</span>
                </p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(entry.weeklyMinutes / max) * 100}%`, backgroundColor: entry.profile.colorHex }}
                  />
                </div>

                <div className="mt-4 flex gap-4 text-sm text-slate-400">
                  <span>✅ {entry.tasksCompleted} concluídas</span>
                  <span>📋 {entry.tasksPending} pendentes</span>
                </div>
              </Card>
            ))}
          </div>

          <Card className="mt-4 text-center">
            <p className="text-sm text-slate-300">
              {sorted[0].weeklyMinutes === 0
                ? "Ninguém estudou esta semana ainda — bora começar juntos? 💪"
                : sorted[0].weeklyMinutes === (sorted[1]?.weeklyMinutes ?? -1)
                  ? "Vocês estão empatados essa semana! Continuem se apoiando 🤝"
                  : `${sorted[0].profile.name} está na frente essa semana. Vamos lá, ${sorted[1]?.profile.name}! 🚀`}
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
