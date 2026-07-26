"use client";

import { useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { DAY_LABELS, type PlanEntry, type Subject } from "@/lib/types";
import { Button, Card, Input, SectionHeader, Select } from "@/components/ui";
import EmptyState from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import { useToast } from "@/hooks/useToast";

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
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDayOfWeek, setEditDayOfWeek] = useState("1");
  const [editStartTime, setEditStartTime] = useState("19:00");
  const [editDurationMinutes, setEditDurationMinutes] = useState("60");
  const [editSubjectId, setEditSubjectId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editBusy, setEditBusy] = useState(false);
  const { addToast } = useToast();

  function load() {
    setLoading(true);
    api.get<PlanEntry[]>(`/api/plan?profileId=${profileId}`).then(setEntries).finally(() => setLoading(false));
  }

  useEffect(load, [profileId]);

  async function createEntry(e: FormEvent) {
    e.preventDefault();
    try {
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
      addToast("Bloco de estudo salvo!", "success");
      load();
    } catch {
      addToast("Erro ao salvar plano", "error");
    }
  }

  function startEdit(entry: PlanEntry) {
    setEditingId(entry.id);
    setEditDayOfWeek(String(entry.dayOfWeek));
    setEditStartTime(entry.startTime);
    setEditDurationMinutes(String(entry.durationMinutes));
    setEditSubjectId(entry.subjectId ? String(entry.subjectId) : "");
    setEditTitle(entry.title ?? "");
  }

  async function updateEntry(e: FormEvent, id: number) {
    e.preventDefault();
    setEditBusy(true);
    try {
      const updated = await api.patch<PlanEntry>(`/api/plan/${id}`, {
        dayOfWeek: Number(editDayOfWeek),
        startTime: editStartTime,
        durationMinutes: Number(editDurationMinutes),
        subjectId: editSubjectId || null,
        title: editTitle.trim() || null,
      });
      setEntries((prev) => prev.map((entry) => (entry.id === id ? updated : entry)));
      setEditingId(null);
      addToast("Bloco atualizado!", "success");
    } catch {
      addToast("Erro ao atualizar bloco", "error");
    } finally {
      setEditBusy(false);
    }
  }

  async function removeEntry(id: number) {
    try {
      await api.del(`/api/plan/${id}`);
      addToast("Bloco removido!", "success");
      load();
    } catch {
      addToast("Erro ao remover bloco", "error");
    }
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

      {loading ? (
        <SkeletonList count={4} />
      ) : entries.length === 0 ? (
        <EmptyState
          icon="📅"
          title="Nenhum plano semanal"
          description="Adicione blocos de estudo para montar sua rotina da semana."
          action={{ label: "Novo bloco", onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className="stagger-children grid gap-3 lg:grid-cols-7">
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
                      <Card key={entry.id} className="hover-lift !p-3 animate-fade-in-up">
                        {editingId === entry.id ? (
                          <form onSubmit={(e) => updateEntry(e, entry.id)} className="space-y-2">
                            <Select value={editDayOfWeek} onChange={(e) => setEditDayOfWeek(e.target.value)}>
                              {DAY_LABELS.map((d, i) => (
                                <option key={d} value={i}>
                                  {d}
                                </option>
                              ))}
                            </Select>
                            <Input type="time" value={editStartTime} onChange={(e) => setEditStartTime(e.target.value)} />
                            <Input type="number" min={15} step={15} value={editDurationMinutes} onChange={(e) => setEditDurationMinutes(e.target.value)} />
                            <Select value={editSubjectId} onChange={(e) => setEditSubjectId(e.target.value)}>
                              <option value="">Sem matéria</option>
                              {subjects.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.emoji} {s.name}
                                </option>
                              ))}
                            </Select>
                            <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Título (opcional)" />
                            <div className="flex gap-2">
                              <Button type="submit" disabled={editBusy}>{editBusy ? "Salvando..." : "Salvar"}</Button>
                              <Button type="button" variant="ghost" onClick={() => setEditingId(null)}>
                                Cancelar
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <p className="text-xs font-semibold text-white">{entry.startTime}</p>
                            <p className="mt-1 truncate text-xs text-slate-300">
                              {subject ? `${subject.emoji} ${subject.name}` : entry.title || "Estudo"}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-500">{entry.durationMinutes} min</p>
                            <div className="mt-2 flex items-center gap-2">
                              <button onClick={() => startEdit(entry)} className="text-[11px] text-slate-500 hover:text-slate-200">
                                editar
                              </button>
                              <button onClick={() => removeEntry(entry.id)} className="text-[11px] text-slate-500 hover:text-rose-400">
                                remover
                              </button>
                            </div>
                          </>
                        )}
                      </Card>
                    );
                  })
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
