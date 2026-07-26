"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import type { Profile } from "@/lib/types";
import { EMOJI_CHOICES, SUBJECT_COLORS } from "@/lib/types";
import { useToast } from "@/hooks/useToast";

export default function ProfilePicker({ initialProfiles }: { initialProfiles: Profile[] }) {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(EMOJI_CHOICES[0]);
  const [color, setColor] = useState(SUBJECT_COLORS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  function selectProfile(id: number) {
    localStorage.setItem("studyorbit:profileId", String(id));
    router.push(`/painel?profile=${id}`);
  }

  async function createProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const created = await api.post<Profile>("/api/profiles", {
        name: name.trim(),
        emoji,
        colorHex: color,
      });
      setProfiles((prev) => [...prev, created]);
      setName("");
      setCreating(false);
      addToast("Perfil criado com sucesso!", "success");
      selectProfile(created.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao criar perfil";
      setError(message);
      addToast(message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md sm:p-8">
      <div className="flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
          Quem vai estudar agora?
        </h2>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="rounded-full bg-indigo-500/15 px-4 py-1.5 text-sm font-medium text-indigo-300 transition hover:bg-indigo-500/25"
          >
            + Novo perfil
          </button>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {profiles.map((p) => (
          <button
            key={p.id}
            onClick={() => selectProfile(p.id)}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.06]"
          >
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow-lg transition group-hover:scale-105"
              style={{ background: `${p.colorHex}26`, boxShadow: `0 8px 24px ${p.colorHex}33` }}
            >
              {p.emoji}
            </div>
            <span className="text-sm font-medium text-slate-200">{p.name}</span>
          </button>
        ))}

        {profiles.length === 0 && !creating && (
          <div className="col-span-full rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-slate-500">
            Nenhum perfil ainda. Crie o primeiro para você ou para sua noiva 💛
          </div>
        )}
      </div>

      {creating && (
        <form
          onSubmit={createProfile}
          className="mt-6 animate-fade-in-up space-y-4 rounded-2xl border border-white/10 bg-black/20 p-5"
        >
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">
              Nome
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Você ou Nome da noiva"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400/60 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">
              Emoji
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_CHOICES.map((em) => (
                <button
                  type="button"
                  key={em}
                  onClick={() => setEmoji(em)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition ${
                    emoji === em
                      ? "border-indigo-400 bg-indigo-500/20"
                      : "border-white/10 bg-white/5 hover:border-white/25"
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">
              Cor
            </label>
            <div className="flex flex-wrap gap-2">
              {SUBJECT_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full border-2 transition ${
                    color === c ? "border-white scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-110 disabled:opacity-50"
            >
              {busy ? "Criando..." : "Criar perfil"}
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-slate-300 hover:bg-white/5"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
