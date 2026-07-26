"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { Button, Card, SectionHeader } from "@/components/ui";
import { useToast } from "@/hooks/useToast";

type QuizCard = {
  id: number;
  front: string;
  back: string;
  deckName: string;
};

export default function QuizSection({
  partnerProfileId,
  currentProfileId,
}: {
  partnerProfileId?: number;
  currentProfileId: number;
}) {
  const [cards, setCards] = useState<QuizCard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const current = cards[index];

  useEffect(() => {
    if (!partnerProfileId) return;
    setLoading(true);
    api
      .get<QuizCard[]>(`/api/flashcards/quiz?partnerProfileId=${partnerProfileId}&limit=5`)
      .then(setCards)
      .finally(() => setLoading(false));
  }, [partnerProfileId]);

  function resetQuiz() {
    setIndex(0);
    setFlipped(false);
    setScore(0);
    if (partnerProfileId) {
      setLoading(true);
      api
        .get<QuizCard[]>(`/api/flashcards/quiz?partnerProfileId=${partnerProfileId}&limit=5`)
        .then(setCards)
        .finally(() => setLoading(false));
    }
  }

  function handleAnswer(result: "right" | "wrong") {
    if (!current) return;
    if (result === "right") {
      setScore((prev) => prev + 1);
      addToast("Acertei! Sintonia aumentada ✨", "success");
    } else {
      addToast("Quase lá — pode revisar com a dica do parceiro", "error");
    }
    setFlipped(false);
    if (index < cards.length - 1) {
      setIndex((prev) => prev + 1);
    }
  }

  const progressText = useMemo(() => (cards.length ? `${Math.min(index + 1, cards.length)} de ${cards.length}` : "0 de 0"), [cards.length, index]);

  if (!partnerProfileId) {
    return (
      <Card className="animate-fade-in-up">
        <p className="text-sm text-slate-400">Escolha um perfil para começar o quiz cruzado.</p>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="animate-fade-in-up">
        <p className="text-sm text-slate-400">Carregando flashcards do parceiro...</p>
      </Card>
    );
  }

  if (!current) {
    return (
      <Card className="animate-fade-in-up space-y-4">
        <SectionHeader title="Quiz cruzado" subtitle="Você respondeu todos os cards desta rodada" />
        <p className="text-sm text-slate-400">Pontuação final: {score} de {cards.length}</p>
        <Button onClick={resetQuiz}>Jogar novamente</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <SectionHeader title="Quiz cruzado" subtitle="Responda os flashcards do parceiro e teste a sintonia" />
      <Card className="animate-fade-in-up">
        <div className="mb-4 flex items-center justify-between text-sm text-slate-400">
          <span>Card {progressText}</span>
          <span>Pontuação: {score}</span>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{current.deckName}</p>
          <p className="mt-4 text-lg font-semibold text-white">{flipped ? current.back : current.front}</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {!flipped ? (
            <Button onClick={() => setFlipped(true)}>Virar</Button>
          ) : (
            <>
              <Button onClick={() => handleAnswer("right")}>Acertei</Button>
              <Button variant="danger" onClick={() => handleAnswer("wrong")}>Errei</Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
