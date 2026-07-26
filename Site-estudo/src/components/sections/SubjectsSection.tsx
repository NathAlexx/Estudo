"use client";

import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { EMOJI_CHOICES, SUBJECT_COLORS, type Subject } from "@/lib/types";
import { Button, Card, Input, SectionHeader } from "@/components/ui";
import EmptyState from "@/components/EmptyState";
import { useToast } from "@/hooks/useToast";

export default function SubjectsSection({
  profileId,
  subjects,
  onChange,
}: {
  profileId: number;
  subjects: Subject[];
  onChange: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(EMOJI_CHOICES[0]);
  const [color, setColor] = useState(SUBJECT_COLORS[0]);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmoji, setEditEmoji] = useState(EMOJI_CHOICES[0]);
  const [editColor, setEditColor] = useState(SUBJECT_COLORS[0]);
  const [editBusy, setEditBusy] = useState(false);
  const { addToast } = useToast();

  async function createSubject(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      await api.post("/api/subjects", { profileId, name: name.trim(), emoji, colorHex: color });
      setName("");
      setShowForm(false);
      addToast("Matéria criada com sucesso!", "success");
      onChange();
    } catch {
      addToast("Erro ao salvar matéria", "error");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(subject: Subject) {
    setEditingId(subject.id);
    setEditName(subject.name);
    setEditEmoji(subject.emoji);
    setEditColor(subject.colorHex);
  }

  async function updateSubject(e: FormEvent, id: number) {
    e.preventDefault();
    if (!editName.trim()) return;
    setEditBusy(true);
    try {
      await api.patch(`/api/subjects/${id}`, {
        name: editName.trim(),
        emoji: editEmoji,
        colorHex: editColor,
      });
      setEditingId(null);
      addToast("Matéria atualizada!", "success");
      onChange();
    } catch {
      addToast("Erro ao atualizar matéria", "error");
    } finally {
      setEditBusy(false);
    }
  }

  async function removeSubject(id: number) {
    if (!confirm("Remover esta matéria? Tarefas e decks vinculados perderão a referência.")) return;
    try {
      await api.del(`/api/subjects/${id}`);
      addToast("Matéria removida!", "success");
      onChange();
    } catch {
      addToast("Erro ao remover matéria", "error");
    }
  }

  return (
    <div>
      <SectionHeader
        title="Matérias"
        subtitle="Organize os assuntos que você está estudando"
        action={<Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Fechar" : "+ Nova matéria"}</Button>}
      />

      {showForm && (
        <Card className="mb-6 animate-fade-in-up">
          <form onSubmit={createSubject} className="space-y-4">
            <Input
              autoFocus
              placeholder="Nome da matéria (ex: Anatomia, Direito Civil...)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">Emoji</p>
              <div className="flex flex-wrap gap-2">
                {EMOJI_CHOICES.map((em) => (
                  <button
                    type="button"
                    key={em}
                    onClick={() => setEmoji(em)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition ${
                      emoji === em ? "border-indigo-400 bg-indigo-500/20" : "border-white/10 bg-white/5"
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">Cor</p>
              <div className="flex flex-wrap gap-2">
                {SUBJECT_COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setColor(c)}
                    className={`h-8 w-8 rounded-full border-2 transition ${
                      color === c ? "scale-110 border-white" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <Button type="submit" disabled={busy}>
              {busy ? "Salvando..." : "Salvar matéria"}
            </Button>
          </form>
        </Card>
      )}

      {subjects.length === 0 ? (
        <EmptyState
          icon="📚"
          title="Nenhuma matéria"
          description="Crie a primeira matéria para começar a organizar seus estudos."
          action={{ label: "Nova matéria", onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => (
            <Card key={s.id} className="hover-lift animate-fade-in-up">
              {editingId === s.id ? (
                <form onSubmit={(e) => updateSubject(e, s.id)} className="space-y-3">
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nome da matéria" />
                  <div className="flex flex-wrap gap-2">
                    {EMOJI_CHOICES.map((em) => (
                      <button
                        type="button"
                        key={em}
                        onClick={() => setEditEmoji(em)}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition ${
                          editEmoji === em ? "border-indigo-400 bg-indigo-500/20" : "border-white/10 bg-white/5"
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SUBJECT_COLORS.map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setEditColor(c)}
                        className={`h-8 w-8 rounded-full border-2 transition ${
                          editColor === c ? "scale-110 border-white" : "border-transparent"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={editBusy}>{editBusy ? "Salvando..." : "Salvar"}</Button>
                    <Button type="button" variant="ghost" onClick={() => setEditingId(null)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl text-xl"
                      style={{ backgroundColor: `${s.colorHex}22` }}
                    >
                      {s.emoji}
                    </div>
                    <span className="font-medium text-slate-200">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(s)}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-white/10 hover:text-slate-200"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => removeSubject(s.id)}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400"
                      title="Remover"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
