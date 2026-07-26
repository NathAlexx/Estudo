"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import type { StudySession, Subject } from "@/lib/types";
import { Button, Card, Select, SectionHeader } from "@/components/ui";
import { useToast } from "@/hooks/useToast";

const PRESETS = [
  { label: "15 / 3", focus: 15, rest: 3, desc: "Foco curto" },
  { label: "25 / 5", focus: 25, rest: 5, desc: "Pomodoro clássico" },
  { label: "50 / 10", focus: 50, rest: 10, desc: "Foco longo" },
  { label: "90 / 15", focus: 90, rest: 15, desc: "Deep work" },
  { label: "Personalizado", focus: 0, rest: 0, desc: "Seu tempo" },
];

export default function PomodoroSection({
  profileId,
  subjects,
}: {
  profileId: number;
  subjects: Subject[];
}) {
  const [preset, setPreset] = useState(PRESETS[1]); // 25/5 como padrão
  const [mode, setMode] = useState<"focus" | "rest">("focus");
  const [secondsLeft, setSecondsLeft] = useState(PRESETS[1].focus * 60);
  const [running, setRunning] = useState(false);
  const [subjectId, setSubjectId] = useState("");
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [cycles, setCycles] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);
  const [customFocus, setCustomFocus] = useState(25);
  const [customRest, setCustomRest] = useState(5);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { addToast } = useToast();

  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  const isCustom = preset.label === "Personalizado";
  const currentFocus = isCustom ? customFocus : preset.focus;
  const currentRest = isCustom ? customRest : preset.rest;

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
  }, [running, mode, preset, customFocus, customRest]);

  async function handleCycleEnd() {
    setRunning(false);
    if (mode === "focus") {
      await api.post("/api/sessions", {
        profileId,
        subjectId: subjectId || null,
        durationMinutes: currentFocus,
        technique: "pomodoro",
      });
      setCycles((c) => c + 1);
      addToast(`Sessão de ${currentFocus} min registrada! Hora da pausa ☕`, "success");
      setFlash(`✅ Sessão de foco registrada (${currentFocus} min). Hora da pausa!`);
      setMode("rest");
      setSecondsLeft(currentRest * 60);
      loadSessions();
    } else {
      addToast("Pausa terminou! Pronto para focar de novo? 🎯", "info");
      setFlash("⏰ Pausa terminou. Pronto para focar de novo?");
      setMode("focus");
      setSecondsLeft(currentFocus * 60);
    }
    setTimeout(() => setFlash(null), 5000);
  }

  function toggleRunning() {
    if (isCustom && currentFocus <= 0) {
      addToast("Defina um tempo de foco válido", "error");
      return;
    }
    setRunning((r) => !r);
  }

  function resetTimer() {
    setRunning(false);
    setMode("focus");
    setSecondsLeft(currentFocus * 60);
  }

  function selectPreset(p: (typeof PRESETS)[number]) {
    setPreset(p);
    setRunning(false);
    setMode("focus");
    if (p.label !== "Personalizado") {
      setSecondsLeft(p.focus * 60);
    } else {
      setSecondsLeft(customFocus * 60);
    }
  }

  function updateCustomFocus(val: number) {
    const min = Math.max(1, Math.min(180, val));
    setCustomFocus(min);
    if (isCustom && mode === "focus" && !running) {
      setSecondsLeft(min * 60);
    }
  }

  function updateCustomRest(val: number) {
    const min = Math.max(1, Math.min(60, val));
    setCustomRest(min);
    if (isCustom && mode === "rest" && !running) {
      setSecondsLeft(min * 60);
    }
  }

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");
  const totalSeconds = (mode === "focus" ? currentFocus : currentRest) * 60;
  const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0;

  return (
    <div>
      <SectionHeader title="Pomodoro" subtitle="Foque em ciclos e registre seu tempo de estudo automaticamente" />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="flex flex-col items-center justify-center py-10 lg:col-span-2">
          {/* Presets */}
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => selectPreset(p)}
                className={`group relative rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  preset.label === p.label
                    ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
                title={p.desc}
              >
                {p.label}
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-slate-500 opacity-0 transition-opacity group-hover:opacity-100">
                  {p.desc}
                </span>
              </button>
            ))}
          </div>

          {/* Custom inputs */}
          {isCustom && (
            <div className="animate-scale-in mb-6 flex gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex flex-col items-center gap-1">
                <label className="text-xs text-slate-500">Foco (min)</label>
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={customFocus}
                  onChange={(e) => updateCustomFocus(Number(e.target.value))}
                  className="w-20 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-lg font-bold text-white focus:border-indigo-400/60 focus:outline-none"
                />
              </div>
              <div className="flex items-center pt-4 text-slate-500">/</div>
              <div className="flex flex-col items-center gap-1">
                <label className="text-xs text-slate-500">Pausa (min)</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={customRest}
                  onChange={(e) => updateCustomRest(Number(e.target.value))}
                  className="w-20 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-lg font-bold text-white focus:border-indigo-400/60 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Timer circular */}
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
              <p className={`mt-2 text-sm uppercase tracking-wide ${mode === "focus" ? "text-indigo-300" : "text-emerald-400"}`}>
                {mode === "focus" ? "🔥 Foco" : "☕ Pausa"}
              </p>
              {isCustom && (
                <p className="mt-1 text-xs text-slate-500">
                  {currentFocus} min / {currentRest} min
                </p>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="mt-8 flex gap-3">
            <Button
              onClick={toggleRunning}
              className={`transition-all hover:scale-105 active:scale-95 ${
                running ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30" : ""
              }`}
            >
              {running ? "⏸ Pausar" : "▶ Começar"}
            </Button>
            <Button variant="ghost" onClick={resetTimer}>
              ↺ Reiniciar
            </Button>
          </div>

          {/* Subject selector */}
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

          {/* Flash message */}
          {flash && (
            <p className="mt-4 animate-fade-in-up rounded-xl bg-white/5 px-4 py-2 text-sm text-slate-200">{flash}</p>
          )}

          <p className="mt-4 text-xs text-slate-500">{cycles} ciclo(s) de foco concluído(s) nesta sessão</p>
        </Card>

        {/* Sessions history */}
        <Card>
          <p className="mb-4 text-sm font-semibold text-white">Sessões recentes</p>
          <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
            {sessions.length === 0 && <p className="text-sm text-slate-500">Nenhuma sessão registrada ainda.</p>}
            {sessions.map((s) => {
              const subject = s.subjectId ? subjectMap.get(s.subjectId) : undefined;
              return (
                <div key={s.id} className="card-glow flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2.5 text-sm transition-all">
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