"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import type { StudySession, Subject } from "@/lib/types";
import { Button, Card, Select, SectionHeader } from "@/components/ui";

const PRESETS = [
  { label: "25 / 5", focus: 25, rest: 5 },
  { label: "50 / 10", focus: 50, rest: 10 },
  { label: "90 / 15", focus: 90, rest: 15 },
];

export default function PomodoroSection({
  profileId,
  subjects,
}: {
  profileId: number;
  subjects: Subject[];
}) {
  const [preset, setPreset] = useState(PRESETS[0]);
  const [mode, setMode] = useState<"focus" | "rest">("focus");
  const [secondsLeft, setSecondsLeft] = useState(PRESETS[0].focus * 60);
  const [running, setRunning] = useState(false);
  const [subjectId, setSubjectId] = useState("");
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [cycles, setCycles] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  function loadSessions() {
    api.get<StudySession[]>(`/api/sessions?profileId=${profileId}`).then(setSessions);
  }

  useEffect(loadSessions, [profileId]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          handleCycleEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, mode, preset]);

  async function handleCycleEnd() {
    setRunning(false);
    if (mode === "focus") {
      await api.post("/api/sessions", {
        profileId,
        subjectId: subjectId || null,
        durationMinutes: preset.focus,
        technique: "pomodoro",
      });
      setCycles((c) => c + 1);
      setFlash(`✅ Sessão de foco registrada (${preset.focus} min). Hora da pausa!`);
      setMode("rest");
      setSecondsLeft(preset.rest * 60);
      loadSessions();
    } else {
      setFlash("⏰ Pausa terminou. Pronto para focar de novo?");
      setMode("focus");
      setSecondsLeft(preset.focus * 60);
    }
    setTimeout(() => setFlash(null), 5000);
  }

  function toggleRunning() {
    setRunning((r) => !r);
  }

  function resetTimer() {
    setRunning(false);
    setMode("focus");
    setSecondsLeft(preset.focus * 60);
  }

  function selectPreset(p: (typeof PRESETS)[number]) {
    setPreset(p);
    setRunning(false);
    setMode("focus");
    setSecondsLeft(p.focus * 60);
  }

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");
  const totalSeconds = (mode === "focus" ? preset.focus : preset.rest) * 60;
  const progress = 1 - secondsLeft / totalSeconds;

  return (
    <div>
      <SectionHeader title="Pomodoro" subtitle="Foque em ciclos e registre seu tempo de estudo automaticamente" />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="flex flex-col items-center justify-center py-10 lg:col-span-2">
          <div className="mb-6 flex gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => selectPreset(p)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  preset.label === p.label ? "bg-indigo-500/20 text-indigo-300" : "text-slate-400 hover:bg-white/5"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="relative flex h-64 w-64 items-center justify-center">
            <svg className="absolute h-full w-full -rotate-90">
              <circle cx="128" cy="128" r="112" stroke="rgba(255,255,255,0.08)" strokeWidth="12" fill="none" />
              <circle
                cx="128"
                cy="128"
                r="112"
                stroke={mode === "focus" ? "url(#grad)" : "#22c55e"}
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 112}
                strokeDashoffset={2 * Math.PI * 112 * (1 - progress)}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
            </svg>
            <div className="text-center">
              <p className="font-[family-name:var(--font-display)] text-5xl font-bold text-white">
                {minutes}:{seconds}
              </p>
              <p className="mt-2 text-sm uppercase tracking-wide text-slate-400">
                {mode === "focus" ? "Foco" : "Pausa"}
              </p>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <Button onClick={toggleRunning}>{running ? "⏸ Pausar" : "▶ Começar"}</Button>
            <Button variant="ghost" onClick={resetTimer}>
              ↺ Reiniciar
            </Button>
          </div>

          <div className="mt-6 w-full max-w-xs">
            <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              <option value="">Sem matéria específica</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.emoji} {s.name}
                </option>
              ))}
            </Select>
          </div>

          {flash && (
            <p className="mt-4 animate-fade-in-up rounded-xl bg-white/5 px-4 py-2 text-sm text-slate-200">{flash}</p>
          )}

          <p className="mt-4 text-xs text-slate-500">{cycles} ciclo(s) de foco concluído(s) nesta sessão</p>
        </Card>

        <Card>
          <p className="mb-4 text-sm font-semibold text-white">Sessões recentes</p>
          <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
            {sessions.length === 0 && <p className="text-sm text-slate-500">Nenhuma sessão registrada ainda.</p>}
            {sessions.map((s) => {
              const subject = s.subjectId ? subjectMap.get(s.subjectId) : undefined;
              return (
                <div key={s.id} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2.5 text-sm">
                  <div>
                    <p className="text-slate-200">
                      {subject ? `${subject.emoji} ${subject.name}` : "Sessão livre"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(s.occurredAt).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className="rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-xs font-medium text-indigo-300">
                    {s.durationMinutes} min
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
