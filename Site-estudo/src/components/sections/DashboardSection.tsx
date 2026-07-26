"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { CompareEntry, Profile, Stats, Subject } from "@/lib/types";
import { Card, SectionHeader } from "@/components/ui";
import StudyRoom from "@/components/StudyRoom";

const DAY_SHORT = ["D", "S", "T", "Q", "Q", "S", "S"];

export default function DashboardSection({
  profile,
  subjects,
}: {
  profile: Profile;
  subjects: Subject[];
}) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [compare, setCompare] = useState<CompareEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState<{ currentStreak: number; longestStreak: number; bothStudiedToday: boolean } | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      api.get<Stats>(`/api/stats?profileId=${profile.id}`),
      api.get<CompareEntry[]>("/api/stats/compare"),
      api.get<{ currentStreak: number; longestStreak: number; bothStudiedToday: boolean }>(`/api/couple-streak?profileId1=${profile.id}&profileId2=${profile.id}`),
    ])
      .then(([s, c, streakData]) => {
        if (!active) return;
        setStats(s);
        setCompare(c);
        setStreak(streakData);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [profile.id]);

  const goalProgress = stats
    ? Math.min(100, Math.round((stats.weeklyMinutes / Math.max(profile.weeklyGoalMinutes, 1)) * 100))
    : 0;

  const maxDayMinutes = stats ? Math.max(...stats.last7Days.map((d) => d.minutes), 30) : 30;

  return (
    <div>
      <SectionHeader
        title={`Olá, ${profile.name} ${profile.emoji}`}
        subtitle="Aqui está o resumo dos seus estudos"
      />

      <StudyRoom profiles={[profile]} currentProfileId={profile.id} />

      {loading || !stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <p className="text-xs uppercase tracking-wide text-slate-400">Esta semana</p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-white">
                {stats.weeklyMinutes}
                <span className="text-base font-medium text-slate-400"> min</span>
              </p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-cyan-300"
                  style={{ width: `${goalProgress}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-500">
                {goalProgress}% da meta de {profile.weeklyGoalMinutes} min
              </p>
            </Card>

            <Card>
              <p className="text-xs uppercase tracking-wide text-slate-400">Sequência</p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-white">
                {stats.streak}
                <span className="text-base font-medium text-slate-400"> dias</span>
              </p>
              <p className="mt-3 text-2xl">{stats.streak > 0 ? "🔥".repeat(Math.min(stats.streak, 5)) : "💤"}</p>
            </Card>

            <Card>
              <p className="text-xs uppercase tracking-wide text-slate-400">Tarefas</p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-white">
                {stats.tasksPending}
                <span className="text-base font-medium text-slate-400"> pendentes</span>
              </p>
              <p className="mt-3 text-xs text-slate-500">
                {stats.tasksCompleted} concluídas
                {stats.tasksOverdue > 0 && (
                  <span className="ml-2 text-rose-400">· {stats.tasksOverdue} atrasadas</span>
                )}
              </p>
            </Card>

            <Card>
              <p className="text-xs uppercase tracking-wide text-slate-400">Flashcards</p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-white">
                {stats.dueFlashcards}
                <span className="text-base font-medium text-slate-400"> para revisar</span>
              </p>
              <p className="mt-3 text-xs text-slate-500">Total estudado: {stats.totalMinutes} min</p>
            </Card>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Streak de casal</p>
                  <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-white">
                    🔥 {streak?.currentStreak ?? 0} dias juntos
                  </p>
                </div>
                <div className="text-sm text-slate-400">
                  {streak?.bothStudiedToday ? (
                    <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-300">Hoje vocês estudaram juntos!</span>
                  ) : (
                    <span className="rounded-full bg-white/5 px-3 py-1">Nenhum de vocês estudou hoje ainda 😴</span>
                  )}
                  <p className="mt-2">Recorde: {streak?.longestStreak ?? 0} dias</p>
                </div>
              </div>
            </Card>
            <Card className="lg:col-span-2">
              <p className="mb-4 text-sm font-semibold text-white">Últimos 7 dias</p>
              <div className="flex h-40 items-end justify-between gap-2">
                {stats.last7Days.map((d) => {
                  const date = new Date(d.day + "T00:00:00");
                  const height = Math.max(6, Math.round((d.minutes / maxDayMinutes) * 130));
                  return (
                    <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                      <div className="flex h-[130px] w-full items-end justify-center">
                        <div
                          className="w-6 rounded-t-md bg-gradient-to-t from-indigo-500 to-cyan-400 transition-all sm:w-8"
                          style={{ height: `${height}px` }}
                          title={`${d.minutes} min`}
                        />
                      </div>
                      <span className="text-[11px] text-slate-500">{DAY_SHORT[date.getDay()]}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card>
              <p className="mb-4 text-sm font-semibold text-white">Placar do casal 💛</p>
              <div className="space-y-4">
                {compare.length === 0 && (
                  <p className="text-sm text-slate-500">Sem dados ainda.</p>
                )}
                {compare
                  .sort((a, b) => b.weeklyMinutes - a.weeklyMinutes)
                  .map((entry, idx) => (
                    <div key={entry.profile.id}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 font-medium text-slate-200">
                          {idx === 0 && entry.weeklyMinutes > 0 ? "👑" : entry.profile.emoji}
                          {entry.profile.name}
                        </span>
                        <span className="text-slate-400">{entry.weeklyMinutes} min</span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, (entry.weeklyMinutes / Math.max(1, Math.max(...compare.map((c) => c.weeklyMinutes), 1))) * 100)}%`,
                            backgroundColor: entry.profile.colorHex,
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          </div>

          <div className="mt-4">
            <Card>
              <p className="mb-3 text-sm font-semibold text-white">Suas matérias</p>
              {subjects.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Você ainda não cadastrou matérias. Vá até &quot;Matérias&quot; para começar.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {subjects.map((s) => (
                    <span
                      key={s.id}
                      className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium"
                      style={{ borderColor: `${s.colorHex}55`, backgroundColor: `${s.colorHex}18`, color: s.colorHex }}
                    >
                      {s.emoji} {s.name}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
