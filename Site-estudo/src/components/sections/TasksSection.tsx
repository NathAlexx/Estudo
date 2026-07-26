"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Subject, Task } from "@/lib/types";
import { Button, Card, EmptyState, Input, PriorityBadge, SectionHeader, Select } from "@/components/ui";

type Filter = "pending" | "completed" | "all";

export default function TasksSection({
  profileId,
  subjects,
}: {
  profileId: number;
  subjects: Subject[];
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("pending");
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("media");
  const [busy, setBusy] = useState(false);

  function load() {
    setLoading(true);
    api
      .get<Task[]>(`/api/tasks?profileId=${profileId}`)
      .then(setTasks)
      .finally(() => setLoading(false));
  }

  useEffect(load, [profileId]);

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      await api.post("/api/tasks", {
        profileId,
        title: title.trim(),
        subjectId: subjectId || null,
        dueDate: dueDate || null,
        priority,
      });
      setTitle("");
      setDueDate("");
      setSubjectId("");
      setPriority("media");
      setShowForm(false);
      load();
    } finally {
      setBusy(false);
    }
  }

  async function toggleComplete(task: Task) {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t)));
    await api.patch(`/api/tasks/${task.id}`, { completed: !task.completed });
  }

  async function removeTask(id: number) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await api.del(`/api/tasks/${id}`);
  }

  const filtered = tasks.filter((t) => {
    if (filter === "pending") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <SectionHeader
        title="Tarefas"
        subtitle="Suas atividades e prazos de estudo"
        action={<Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Fechar" : "+ Nova tarefa"}</Button>}
      />

      {showForm && (
        <Card className="mb-6 animate-fade-in-up">
          <form onSubmit={createTask} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                autoFocus
                placeholder="O que você precisa fazer?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              <option value="">Sem matéria</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.emoji} {s.name}
                </option>
              ))}
            </Select>
            <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="baixa">Prioridade baixa</option>
              <option value="media">Prioridade média</option>
              <option value="alta">Prioridade alta</option>
            </Select>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            <Button type="submit" disabled={busy} className="sm:col-start-2">
              {busy ? "Salvando..." : "Adicionar tarefa"}
            </Button>
          </form>
        </Card>
      )}

      <div className="mb-4 flex gap-2">
        {(["pending", "completed", "all"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              filter === f ? "bg-indigo-500/20 text-indigo-300" : "text-slate-400 hover:bg-white/5"
            }`}
          >
            {f === "pending" ? "Pendentes" : f === "completed" ? "Concluídas" : "Todas"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="✅" text="Nenhuma tarefa por aqui. Aproveite para descansar ou adicione algo novo!" />
      ) : (
        <div className="space-y-3">
          {filtered.map((task) => {
            const subject = task.subjectId ? subjectMap.get(task.subjectId) : undefined;
            const overdue = task.dueDate && task.dueDate < today && !task.completed;
            return (
              <Card key={task.id} className="flex items-center gap-4">
                <button
                  onClick={() => toggleComplete(task)}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                    task.completed ? "border-emerald-400 bg-emerald-400/20 text-emerald-300" : "border-slate-500"
                  }`}
                >
                  {task.completed && "✓"}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-medium ${task.completed ? "text-slate-500 line-through" : "text-slate-200"}`}>
                    {task.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    {subject && (
                      <span style={{ color: subject.colorHex }}>
                        {subject.emoji} {subject.name}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className={overdue ? "text-rose-400" : ""}>
                        📅 {new Date(task.dueDate + "T00:00:00").toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                </div>
                <PriorityBadge priority={task.priority} />
                <button
                  onClick={() => removeTask(task.id)}
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400"
                >
                  🗑️
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
