"use client";

import { useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import type { Subject, Task } from "@/lib/types";
import { Button, Card, Input, PriorityBadge, SectionHeader, Select } from "@/components/ui";
import EmptyState from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import { useToast } from "@/hooks/useToast";

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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSubjectId, setEditSubjectId] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editPriority, setEditPriority] = useState("media");
  const [editBusy, setEditBusy] = useState(false);
  const { addToast } = useToast();

  function load() {
    setLoading(true);
    api
      .get<Task[]>(`/api/tasks?profileId=${profileId}`)
      .then(setTasks)
      .finally(() => setLoading(false));
  }

  useEffect(load, [profileId]);

  async function createTask(e: FormEvent) {
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
      addToast("Tarefa salva!", "success");
      load();
    } catch {
      addToast("Erro ao salvar tarefa", "error");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditSubjectId(task.subjectId ? String(task.subjectId) : "");
    setEditDueDate(task.dueDate ?? "");
    setEditPriority(task.priority);
  }

  async function updateTask(e: FormEvent, id: number) {
    e.preventDefault();
    if (!editTitle.trim()) return;
    setEditBusy(true);
    try {
      const updated = await api.patch<Task>(`/api/tasks/${id}`, {
        title: editTitle.trim(),
        subjectId: editSubjectId || null,
        dueDate: editDueDate || null,
        priority: editPriority,
      });
      setTasks((prev) => prev.map((task) => (task.id === id ? updated : task)));
      setEditingId(null);
      addToast("Tarefa atualizada!", "success");
    } catch {
      addToast("Erro ao atualizar tarefa", "error");
    } finally {
      setEditBusy(false);
    }
  }

  async function toggleComplete(task: Task) {
    const nextCompleted = !task.completed;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: nextCompleted } : t)));
    try {
      await api.patch(`/api/tasks/${task.id}`, { completed: nextCompleted });
      addToast(nextCompleted ? "Tarefa concluída!" : "Tarefa reaberta!", "success");
    } catch {
      addToast("Erro ao atualizar tarefa", "error");
    }
  }

  async function removeTask(id: number) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await api.del(`/api/tasks/${id}`);
      addToast("Tarefa removida!", "success");
    } catch {
      addToast("Erro ao remover tarefa", "error");
    }
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
        <SkeletonList count={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📝"
          title="Nenhuma tarefa ainda"
          description="Adicione sua primeira tarefa para começar a organizar os estudos."
          action={{ label: "Nova tarefa", onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className="stagger-children space-y-3">
          {filtered.map((task) => {
            const subject = task.subjectId ? subjectMap.get(task.subjectId) : undefined;
            const overdue = task.dueDate && task.dueDate < today && !task.completed;
            return (
              <Card key={task.id} className="hover-lift animate-fade-in-up">
                {editingId === task.id ? (
                  <form onSubmit={(e) => updateTask(e, task.id)} className="grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                    </div>
                    <Select value={editSubjectId} onChange={(e) => setEditSubjectId(e.target.value)}>
                      <option value="">Sem matéria</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.emoji} {s.name}
                        </option>
                      ))}
                    </Select>
                    <Select value={editPriority} onChange={(e) => setEditPriority(e.target.value)}>
                      <option value="baixa">Prioridade baixa</option>
                      <option value="media">Prioridade média</option>
                      <option value="alta">Prioridade alta</option>
                    </Select>
                    <Input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} />
                    <div className="flex gap-2 sm:col-span-2">
                      <Button type="submit" disabled={editBusy}>{editBusy ? "Salvando..." : "Salvar"}</Button>
                      <Button type="button" variant="ghost" onClick={() => setEditingId(null)}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center gap-4">
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
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(task)}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-white/10 hover:text-slate-200"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => removeTask(task.id)}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
