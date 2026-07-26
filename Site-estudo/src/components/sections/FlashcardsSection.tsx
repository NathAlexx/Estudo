"use client";

import { useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import type { Deck, Flashcard, Subject } from "@/lib/types";
import { Button, Card, Input, SectionHeader, Select, Textarea } from "@/components/ui";
import EmptyState from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import { useToast } from "@/hooks/useToast";

export default function FlashcardsSection({
  profileId,
  subjects,
}: {
  profileId: number;
  subjects: Subject[];
}) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [showDeckForm, setShowDeckForm] = useState(false);
  const [deckName, setDeckName] = useState("");
  const [deckSubjectId, setDeckSubjectId] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingDeckId, setEditingDeckId] = useState<number | null>(null);
  const [editDeckName, setEditDeckName] = useState("");
  const [editDeckSubjectId, setEditDeckSubjectId] = useState("");
  const [editDeckBusy, setEditDeckBusy] = useState(false);
  const { addToast } = useToast();

  function loadDecks() {
    setLoading(true);
    api
      .get<Deck[]>(`/api/decks?profileId=${profileId}`)
      .then((rows) => {
        setDecks(rows);
        setActiveDeck((prev) => (prev ? rows.find((d) => d.id === prev.id) ?? null : null));
      })
      .finally(() => setLoading(false));
  }

  useEffect(loadDecks, [profileId]);

  async function createDeck(e: FormEvent) {
    e.preventDefault();
    if (!deckName.trim()) return;
    try {
      await api.post("/api/decks", { profileId, name: deckName.trim(), subjectId: deckSubjectId || null });
      setDeckName("");
      setDeckSubjectId("");
      setShowDeckForm(false);
      addToast("Deck criado com sucesso!", "success");
      loadDecks();
    } catch {
      addToast("Erro ao criar deck", "error");
    }
  }

  function startEditDeck(deck: Deck) {
    setEditingDeckId(deck.id);
    setEditDeckName(deck.name);
    setEditDeckSubjectId(deck.subjectId ? String(deck.subjectId) : "");
  }

  async function updateDeck(e: FormEvent, id: number) {
    e.preventDefault();
    if (!editDeckName.trim()) return;
    setEditDeckBusy(true);
    try {
      const updated = await api.patch<Deck>(`/api/decks/${id}`, {
        name: editDeckName.trim(),
        subjectId: editDeckSubjectId || null,
      });
      setDecks((prev) => prev.map((deck) => (deck.id === id ? updated : deck)));
      setEditingDeckId(null);
      addToast("Deck atualizado!", "success");
    } catch {
      addToast("Erro ao atualizar deck", "error");
    } finally {
      setEditDeckBusy(false);
    }
  }

  async function removeDeck(id: number) {
    if (!confirm("Remover este deck e todos os cards dele?")) return;
    try {
      await api.del(`/api/decks/${id}`);
      if (activeDeck?.id === id) setActiveDeck(null);
      addToast("Deck removido!", "success");
      loadDecks();
    } catch {
      addToast("Erro ao remover deck", "error");
    }
  }

  if (activeDeck) {
    return (
      <DeckStudyView
        deck={activeDeck}
        subjects={subjects}
        onBack={() => {
          setActiveDeck(null);
          loadDecks();
        }}
      />
    );
  }

  return (
    <div>
      <SectionHeader
        title="Flashcards"
        subtitle="Crie decks e revise com repetição espaçada (sistema Leitner)"
        action={<Button onClick={() => setShowDeckForm((v) => !v)}>{showDeckForm ? "Fechar" : "+ Novo deck"}</Button>}
      />

      {showDeckForm && (
        <Card className="mb-6 animate-fade-in-up">
          <form onSubmit={createDeck} className="grid gap-4 sm:grid-cols-2">
            <Input
              autoFocus
              placeholder="Nome do deck (ex: Vocabulário de Inglês)"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
            />
            <Select value={deckSubjectId} onChange={(e) => setDeckSubjectId(e.target.value)}>
              <option value="">Sem matéria</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.emoji} {s.name}
                </option>
              ))}
            </Select>
            <Button type="submit" className="sm:col-span-2">
              Criar deck
            </Button>
          </form>
        </Card>
      )}

      {loading ? (
        <SkeletonList count={4} />
      ) : decks.length === 0 ? (
        <EmptyState
          icon="🧠"
          title="Nenhum deck de flashcards"
          description="Crie um deck para começar a revisar com flashcards."
          action={{ label: "Novo deck", onClick: () => setShowDeckForm(true) }}
        />
      ) : (
        <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => (
            <Card key={deck.id} className="hover-lift animate-fade-in-up">
              {editingDeckId === deck.id ? (
                <form onSubmit={(e) => updateDeck(e, deck.id)} className="space-y-3">
                  <Input value={editDeckName} onChange={(e) => setEditDeckName(e.target.value)} />
                  <Select value={editDeckSubjectId} onChange={(e) => setEditDeckSubjectId(e.target.value)}>
                    <option value="">Sem matéria</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.emoji} {s.name}
                      </option>
                    ))}
                  </Select>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={editDeckBusy}>{editDeckBusy ? "Salvando..." : "Salvar"}</Button>
                    <Button type="button" variant="ghost" onClick={() => setEditingDeckId(null)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-slate-200">{deck.name}</p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEditDeck(deck)}
                        className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/10 hover:text-slate-200"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => removeDeck(deck.id)}
                        className="rounded-lg p-1.5 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{deck.totalCards} card(s)</p>
                  <div className="mt-4 flex items-center justify-between">
                    {deck.dueCards > 0 ? (
                      <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-300">
                        {deck.dueCards} para revisar
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                        Em dia
                      </span>
                    )}
                    <Button variant="ghost" onClick={() => setActiveDeck(deck)}>
                      Abrir
                    </Button>
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function DeckStudyView({
  deck,
  subjects,
  onBack,
}: {
  deck: Deck;
  subjects: Subject[];
  onBack: () => void;
}) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const { addToast } = useToast();
  const [studyMode, setStudyMode] = useState(false);
  const [queue, setQueue] = useState<Flashcard[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [editingCardId, setEditingCardId] = useState<number | null>(null);
  const [editFront, setEditFront] = useState("");
  const [editBack, setEditBack] = useState("");
  const [editCardBusy, setEditCardBusy] = useState(false);

  const subject = subjects.find((s) => s.id === deck.subjectId);

  function loadCards() {
    api.get<Flashcard[]>(`/api/flashcards?deckId=${deck.id}`).then(setCards);
  }

  useEffect(loadCards, [deck.id]);

  async function createCard(e: FormEvent) {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    try {
      await api.post("/api/flashcards", { deckId: deck.id, front: front.trim(), back: back.trim() });
      setFront("");
      setBack("");
      setShowForm(false);
      addToast("Card criado com sucesso!", "success");
      loadCards();
    } catch {
      addToast("Erro ao criar card", "error");
    }
  }

  function startEditCard(card: Flashcard) {
    setEditingCardId(card.id);
    setEditFront(card.front);
    setEditBack(card.back);
  }

  async function updateCard(e: FormEvent, id: number) {
    e.preventDefault();
    if (!editFront.trim() || !editBack.trim()) return;
    setEditCardBusy(true);
    try {
      const updated = await api.patch<Flashcard>(`/api/flashcards/${id}`, {
        front: editFront.trim(),
        back: editBack.trim(),
      });
      setCards((prev) => prev.map((card) => (card.id === id ? updated : card)));
      setEditingCardId(null);
      addToast("Card atualizado!", "success");
    } catch {
      addToast("Erro ao atualizar card", "error");
    } finally {
      setEditCardBusy(false);
    }
  }

  async function removeCard(id: number) {
    try {
      await api.del(`/api/flashcards/${id}`);
      addToast("Card removido!", "success");
      loadCards();
    } catch {
      addToast("Erro ao remover card", "error");
    }
  }

  function startStudy() {
    const now = new Date();
    const due = cards.filter((c) => new Date(c.nextReviewAt) <= now);
    setQueue(due.length > 0 ? due : cards);
    setStudyMode(true);
    setFlipped(false);
  }

  async function rate(result: "again" | "good" | "easy") {
    const current = queue[0];
    if (!current) return;
    await api.post(`/api/flashcards/${current.id}/review`, { result });
    setQueue((prev) => prev.slice(1));
    setFlipped(false);
    loadCards();
  }

  if (studyMode) {
    const current = queue[0];
    return (
      <div>
        <button onClick={() => setStudyMode(false)} className="mb-6 text-sm text-slate-400 hover:text-slate-200">
          ← Voltar ao deck
        </button>
        {!current ? (
          <EmptyState icon="🎉" title="Revisão concluída" description="Você terminou todos os cards desta sessão." />
        ) : (
          <div className="mx-auto max-w-xl">
            <p className="mb-4 text-center text-sm text-slate-500">{queue.length} card(s) restante(s)</p>
            <div
              onClick={() => setFlipped((f) => !f)}
              className="flex min-h-[240px] cursor-pointer flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center transition hover:border-white/20"
            >
              <p className="text-xs uppercase tracking-wide text-slate-500">{flipped ? "Resposta" : "Pergunta"}</p>
              <p className="mt-4 text-lg font-medium text-white">{flipped ? current.back : current.front}</p>
              {!flipped && <p className="mt-6 text-xs text-slate-500">Clique para virar</p>}
            </div>
            {flipped && (
              <div className="mt-5 grid grid-cols-3 gap-3">
                <Button variant="danger" onClick={() => rate("again")}>
                  De novo
                </Button>
                <Button variant="ghost" onClick={() => rate("good")}>
                  Bom
                </Button>
                <Button onClick={() => rate("easy")}>Fácil</Button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <button onClick={onBack} className="mb-6 text-sm text-slate-400 hover:text-slate-200">
        ← Todos os decks
      </button>
      <SectionHeader
        title={deck.name}
        subtitle={subject ? `${subject.emoji} ${subject.name}` : "Sem matéria vinculada"}
        action={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setShowForm((v) => !v)}>
              {showForm ? "Fechar" : "+ Card"}
            </Button>
            {cards.length > 0 && <Button onClick={startStudy}>Estudar agora</Button>}
          </div>
        }
      />

      {showForm && (
        <Card className="mb-6 animate-fade-in-up space-y-3">
          <form onSubmit={createCard} className="space-y-3">
            <Textarea autoFocus placeholder="Frente (pergunta)" value={front} onChange={(e) => setFront(e.target.value)} rows={2} />
            <Textarea placeholder="Verso (resposta)" value={back} onChange={(e) => setBack(e.target.value)} rows={2} />
            <Button type="submit">Adicionar card</Button>
          </form>
        </Card>
      )}

      {cards.length === 0 ? (
        <EmptyState icon="🗂️" title="Nenhum card neste deck" description="Adicione o primeiro card para começar a revisão." />
      ) : (
        <div className="stagger-children space-y-3">
          {cards.map((c) => (
            <Card key={c.id} className="hover-lift animate-fade-in-up">
              {editingCardId === c.id ? (
                <form onSubmit={(e) => updateCard(e, c.id)} className="space-y-3">
                  <Textarea value={editFront} onChange={(e) => setEditFront(e.target.value)} rows={2} />
                  <Textarea value={editBack} onChange={(e) => setEditBack(e.target.value)} rows={2} />
                  <div className="flex gap-2">
                    <Button type="submit" disabled={editCardBusy}>{editCardBusy ? "Salvando..." : "Salvar"}</Button>
                    <Button type="button" variant="ghost" onClick={() => setEditingCardId(null)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-200">{c.front}</p>
                    <p className="truncate text-xs text-slate-500">{c.back}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-slate-400">
                    Caixa {c.box}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEditCard(c)}
                      className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-white/10 hover:text-slate-200"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => removeCard(c.id)}
                      className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400"
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
