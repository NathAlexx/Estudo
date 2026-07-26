"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DAY_LABELS, type PlanEntry, type Subject } from "@/lib/types";
import { Button, Card, Input, SectionHeader, Select } from "@/components/ui";

export default function PlanSection({
  profileId,
  subjects,
}: {
  profileId: number;
  subjects: Subject[];
}) {
  const [entries, setEntries] = useState<PlanEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [startTime, setStartTime] = useState("19:00");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");

  function load() {
    api.get<PlanEntry[]>(`/api/plan?profileId=${profileId}`).then(setEntries);
  }

  useEffect(load, [profileId]);

  async function createEntry(e: React.FormEvent) {
    e.preventDefault();
    await api.post("/api/plan", {
      profileId,
      dayOfWeek: Number(dayOfWeek),
      startTime,
      durationMinutes: Number(durationMinutes),
      subjectId: subjectId || null,
      title: title.trim() || null,
    });
    setTitle("");
    setShowForm(false);
    load();
  }

  async function removeEntry(id: number) {
    await api.del(`/api/plan/${id}`);
    load();
  }

  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  return (
    <div>
      <SectionHeader
        title="Plano semanal"
        subtitle="Monte sua rotina de estudos fixa"
        action={<Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Fechar" : "+ Adicionar bloco"}</Button>}
      />

      {showForm && (
        <Card className="mb-6 animate-fade-in-up">
          <form onSubmit={createEntry} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)}>
              {DAY_LABELS.map((d, i) => (
                <option key={d} value={i}>
                  {d}
                </option>
              ))}
            </Select>
            <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            <Input
              type="number"
              min={15}
              step={15}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              placeholder="Duração (min)"
            />
            <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              <option value="">Sem matéria</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.emoji} {s.name}
                </option>
              ))}
            </Select>
            <Input
              className="sm:col-span-2 lg:col-span-3"
              placeholder="Título (opcional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Button type="submit">Salvar</Button>
          </form>
        </Card>
      )}

      <div className="grid gap-3 lg:grid-cols-7">
        {DAY_LABELS.map((label, dayIdx) => {
          const dayEntries = entries
            .filter((e) => e.dayOfWeek === dayIdx)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
          return (
            <div key={label} className="space-y-2">
              <p className="px-1 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                {label}
              </p>
              {dayEntries.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 py-6 text-center text-xs text-slate-600">
                  —
                </div>
              ) : (
                dayEntries.map((entry) => {
                  const subject = entry.subjectId ? subjectMap.get(entry.subjectId) : undefined;
                  return (
                    <Card key={entry.id} className="!p-3">
                      <p className="text-xs font-semibold text-white">{entry.startTime}</p>
                      <p className="mt-1 truncate text-xs text-slate-300">
                        {subject ? `${subject.emoji} ${subject.name}` : entry.title || "Estudo"}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">{entry.durationMinutes} min</p>
                      <button
                        onClick={() => removeEntry(entry.id)}
                        className="mt-1 text-[11px] text-slate-500 hover:text-rose-400"
                      >
                        remover
                      </button>
                    </Card>
                  );
                })
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
