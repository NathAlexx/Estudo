"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Profile } from "@/lib/types";
import { Button, Card } from "@/components/ui";
import { useToast } from "@/hooks/useToast";

type Presence = {
  id?: number;
  profileId: number;
  isOnline: boolean;
  isFocusing: boolean;
  focusStartedAt?: string | null;
  focusDuration?: number | null;
  updatedAt?: string;
};

export default function StudyRoom({ profiles, currentProfileId }: { profiles: Profile[]; currentProfileId: number }) {
  const [partner, setPartner] = useState<Profile | null>(null);
  const [presence, setPresence] = useState<Presence | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const p = profiles.find((item) => item.id !== currentProfileId) ?? null;
    setPartner(p);
  }, [profiles, currentProfileId]);

  useEffect(() => {
    if (!partner) return;
    const load = () => {
      api.get<Presence>(`/api/presence?profileId=${partner.id}`).then(setPresence);
    };
    load();
    const interval = window.setInterval(load, 5000);
    return () => window.clearInterval(interval);
  }, [partner]);

  function handleInvite() {
    addToast("Convite enviado!", "success");
  }

  if (!partner) return null;

  const isOffline = !presence?.isOnline || (presence.updatedAt && Date.now() - new Date(presence.updatedAt).getTime() > 120000);
  const badge = isOffline ? "🔴 Offline" : presence?.isFocusing ? "🟢 Focando" : "🟡 Online, pausando";
  const focusMinutes = presence?.focusStartedAt ? Math.max(1, Math.round((Date.now() - new Date(presence.focusStartedAt).getTime()) / 60000)) : 0;

  return (
    <Card className="mb-4 animate-fade-in-up">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">Sala de estudo virtual</p>
          <p className="text-sm text-slate-400">Veja se o seu parceiro está online e focando agora</p>
        </div>
        <Button onClick={handleInvite}>Bora junto?</Button>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-lg font-semibold text-white">{currentProfileId ? "Você" : partner.name}</p>
          <p className="mt-2 text-sm text-slate-400">Status: 🟢 Disponível para estudar</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-lg font-semibold text-white">{partner.name}</p>
          <p className="mt-2 text-sm text-slate-400">{badge}</p>
          {presence?.isFocusing && <p className="mt-2 text-sm text-emerald-300">{partner.name} está focando há {focusMinutes} min</p>}
        </div>
      </div>
    </Card>
  );
}
