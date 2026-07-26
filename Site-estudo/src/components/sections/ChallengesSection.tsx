"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import type { Profile, Subject } from "@/lib/types";
import { Button, Card, Input, SectionHeader, Select } from "@/components/ui";
import { useToast } from "@/hooks/useToast";

type Challenge = {
  id: number;
  challengerId: number;
  challengedId: number;
  description: string;
  targetMinutes: number;
  subjectId: number | null;
  deadline: string;
  status: string;
  points: number;
  createdAt: string;
};

export default function ChallengesSection({
  profiles,
  currentProfileId,
  subjects,
}: {
  profiles: Profile[];
  currentProfileId: number;
  subjects: Subject[];
}) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [description, setDescription] = useState("");
  const [targetMinutes, setTargetMinutes] = useState(180);
  const [partnerId, setPartnerId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [points, setPoints] = useState(10);
  const [winner, setWinner] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    loadChallenges();
  }, [currentProfileId]);

  function loadChallenges() {
    api.get<Challenge[]>(`/api/challenges?profileId=${currentProfileId}`).then(setChallenges);
  }

  async function createChallenge(e: FormEvent) {
    e.preventDefault();
    if (!description.trim() || !partnerId || !deadline) return;
    try {
      await api.post("/api/challenges", {
        challengerId: currentProfileId,
        challengedId: Number(partnerId),
        description: description.trim(),
        targetMinutes: Number(targetMinutes),
        subjectId: subjectId ? Number(subjectId) : null,
        deadline,
        points: Number(points ?? 10),
      });
      setDescription("");
      setTargetMinutes(180);
      setPartnerId("");
      setSubjectId("");
      setDeadline("");
      setPoints(10);
      addToast("Desafio criado com sucesso!", "success");
      loadChallenges();
    } catch {
      addToast("Erro ao criar desafio", "error");
    }
  }

  async function acceptChallenge(id: number) {
    try {
      const updated = await api.patch<Challenge>(`/api/challenges/${id}`, { status: "accepted" });
      setChallenges((prev) => prev.map((item) => (item.id === id ? updated : item)));
      addToast("Desafio aceito!", "success");
    } catch {
      addToast("Erro ao aceitar desafio", "error");
    }
  }

  async function checkChallenge(id: number) {
    try {
      const result = await api.patch<{ completed: boolean; totalMinutes: number; description?: string }>(`/api/challenges/${id}`, { status: "check" });
      const label = result.completed ? "cumpriu" : "não cumpriu";
      addToast(`Resultado verificado: ${label}.`, result.completed ? "success" : "error");
      const ch = challenges.find((c) => c.id === id);
      if (result.completed) {
        setWinner("Você");
        if (ch) {
          try {
            await api.post("/api/points", { profileId: ch.challengedId, amount: ch.points });
            addToast(`Você ganhou ${ch.points} pontos! 🎉`, "success");
          } catch {
            addToast("Erro ao creditar pontos", "error");
          }
        }
      } else {
        setWinner("Parceiro");
      }
      loadChallenges();
    } catch {
      addToast("Erro ao verificar desafio", "error");
    }
  }

  const visibleProfiles = profiles.filter((p) => p.id !== currentProfileId);
  const challengeList = useMemo(() => challenges.slice().sort((a, b) => Number(a.id) - Number(b.id)), [challenges]);

  return (
    <div className="space-y-6">
      <SectionHeader title="Desafios" subtitle="Aposte minutos, aceite metas e acompanhe a competição" />
      <Card className="animate-fade-in-up">
        <form onSubmit={createChallenge} className="grid gap-3 md:grid-cols-2">
          <Select value={partnerId} onChange={(e) => setPartnerId(e.target.value)}>
            <option value="">Escolha o parceiro</option>
            {visibleProfiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.emoji} {profile.name}
              </option>
            ))}
          </Select>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Estudar 3h de Biologia" />
          <Input type="number" value={targetMinutes} onChange={(e) => setTargetMinutes(Number(e.target.value))} placeholder="Meta em minutos" />
          <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value="">Sem matéria</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.emoji} {subject.name}
              </option>
            ))}
          </Select>
          <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          <Input type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} placeholder="Pontos" />
          <Button type="submit" className="md:col-span-2">Criar desafio</Button>
        </form>
      </Card>

      {winner && <Card className="animate-fade-in-up border-emerald-500/20 bg-emerald-500/10 text-emerald-300">{winner} levou a melhor nesta rodada.</Card>}

      <div className="space-y-3">
        {challengeList.map((challenge) => {
          const isMine = challenge.challengerId === currentProfileId;
          const statusLabel = challenge.status === "accepted" ? "Aceito" : challenge.status === "completed" ? "Concluído" : challenge.status === "failed" ? "Falhou" : "Pendente";
          return (
            <Card key={challenge.id} className="animate-fade-in-up">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{challenge.description}</p>
                  <p className="text-sm text-slate-400">Meta: {challenge.targetMinutes} min · Pontos: {challenge.points}</p>
                </div>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">{statusLabel}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {challenge.status === "pending" && isMine && (
                  <Button onClick={() => acceptChallenge(challenge.id)}>Aceitar desafio</Button>
                )}
                {(challenge.status === "accepted" || challenge.status === "pending") && !isMine && (
                  <Button onClick={() => checkChallenge(challenge.id)}>Verificar resultado</Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
