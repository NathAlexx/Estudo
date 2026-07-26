"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Profile } from "@/lib/types";
import { Button, Card, EmptyState, Input, SectionHeader, Select } from "@/components/ui";
import { useToast } from "@/hooks/useToast";

type Reward = {
  id: number;
  creatorId: number;
  title: string;
  description?: string | null;
  icon: string;
  pointsCost: number;
  createdAt: string;
};

export default function RewardsSection({
  profileId,
  partnerProfileId,
  profiles,
}: {
  profileId: number;
  partnerProfileId?: number | null;
  profiles: Profile[];
}) {
  const [points, setPoints] = useState<{ totalPoints: number; spentPoints: number; availablePoints: number } | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const { addToast } = useToast();

  const [icon, setIcon] = useState("🍕");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pointsCost, setPointsCost] = useState(10);
  const [creatorId, setCreatorId] = useState<number>(profileId);

  const icons = ["🍕", "🍔", "🍣", "🎬", "🛍️", "🍷", "🎮", "💆", "✈️", "🎁"];

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  async function loadAll() {
    try {
      const p = await api.get<{ totalPoints: number; spentPoints: number; availablePoints: number }>(`/api/points?profileId=${profileId}`);
      setPoints(p);
    } catch {
      setPoints(null);
    }
    try {
      const r = await api.get<Reward[]>("/api/rewards");
      setRewards(r);
    } catch {
      setRewards([]);
    }
    try {
      const rr = await api.get<any[]>(`/api/reward-redemptions?profileId=${profileId}`);
      setRedemptions(rr);
    } catch {
      setRedemptions([]);
    }
  }

  async function handleRedeem(reward: Reward) {
    if (!points || points.availablePoints < reward.pointsCost) {
      addToast("Pontos insuficientes", "error");
      return;
    }

    try {
      const created = await api.post<{ id: number }>("/api/reward-redemptions", { rewardId: reward.id, profileId });
      try {
        await api.post("/api/points/spend", { profileId, amount: reward.pointsCost });
        addToast(`Recompensa resgatada: ${reward.title}`, "success");
      } catch (err) {
        // cancel redemption if spend failed
        await api.patch(`/api/reward-redemptions/${created.id}`, { status: "cancelled" });
        addToast("Erro ao gastar pontos, resgate cancelado", "error");
      }
      loadAll();
    } catch {
      addToast("Erro ao criar resgate", "error");
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return addToast("Título é obrigatório", "error");
    try {
      await api.post("/api/rewards", {
        creatorId: creatorId,
        title: title.trim(),
        description: description ? description.trim() : null,
        icon,
        pointsCost: Number(pointsCost ?? 10),
      });
      setTitle("");
      setDescription("");
      setPointsCost(10);
      addToast("Recompensa adicionada ao catálogo", "success");
      loadAll();
    } catch {
      addToast("Erro ao criar recompensa", "error");
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="🎁 Loja de Recompensas"
        subtitle={`Você tem ${points ? points.availablePoints : 0} pontos disponíveis`}
      />

      <Card className="animate-fade-in-up">
        <h3 className="mb-3 text-sm font-semibold text-white">Catálogo de Prêmios</h3>
        {rewards.length === 0 ? (
          <EmptyState
            icon="🎁"
            title="Nenhuma recompensa encontrada"
            description="Ainda não existem recompensas no catálogo. Peça para seu parceiro ou crie uma nova abaixo."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rewards.map((r) => (
              <div key={r.id} className="card-glow glass-card hover-lift rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl">{r.icon}</div>
                    <p className="mt-2 font-semibold text-white">{r.title}</p>
                    {r.description && <p className="mt-1 text-sm text-slate-400">{r.description}</p>}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-300">Custo</div>
                    <div className="mt-1 text-lg font-bold text-white">{r.pointsCost} pts</div>
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    onClick={() => handleRedeem(r)}
                    disabled={!points || points.availablePoints < r.pointsCost}
                  >
                    Resgatar ({r.pointsCost} pts)
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="animate-fade-in-up">
        <h3 className="mb-3 text-sm font-semibold text-white">Meus Resgates</h3>
        {redemptions.length === 0 ? (
          <p className="text-sm text-slate-400">Você não tem resgates ainda.</p>
        ) : (
          <div className="space-y-2">
            {redemptions.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl border border-white/5 p-3">
                <div>
                  <div className="text-sm font-medium text-white">{r.reward.title}</div>
                  <div className="text-xs text-slate-400">{r.reward.icon} · {r.reward.pointsCost} pts</div>
                </div>
                <div>
                  {r.status === "pending" && <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs text-amber-300">Pendente</span>}
                  {r.status === "fulfilled" && <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300">Cumprido</span>}
                  {r.status === "cancelled" && <span className="rounded-full bg-rose-500/15 px-3 py-1 text-xs text-rose-300">Cancelado</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="animate-fade-in-up">
        <h3 className="mb-3 text-sm font-semibold text-white">Criar Nova Recompensa</h3>
        <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-2">
          <Select value={icon} onChange={(e) => setIcon(e.target.value)}>
            {icons.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </Select>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título (ex: Vale 1 pizza)" />
          <Input value={pointsCost} onChange={(e) => setPointsCost(Number(e.target.value))} type="number" placeholder="Custo em pontos" />
          <Select value={creatorId} onChange={(e) => setCreatorId(Number(e.target.value))}>
            <option value={profileId}>Você</option>
            {partnerProfileId && <option value={partnerProfileId}>Parceiro</option>}
          </Select>
          <Input className="sm:col-span-2" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição (opcional)" />
          <div className="sm:col-span-2">
            <Button type="submit">Adicionar ao catálogo</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
