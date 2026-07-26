"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import type { Profile, Subject } from "@/lib/types";
import DashboardSection from "@/components/sections/DashboardSection";
import SubjectsSection from "@/components/sections/SubjectsSection";
import TasksSection from "@/components/sections/TasksSection";
import PomodoroSection from "@/components/sections/PomodoroSection";
import FlashcardsSection from "@/components/sections/FlashcardsSection";
import PlanSection from "@/components/sections/PlanSection";
import CompareSection from "@/components/sections/CompareSection";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "🏠" },
  { key: "subjects", label: "Matérias", icon: "📚" },
  { key: "tasks", label: "Tarefas", icon: "✅" },
  { key: "pomodoro", label: "Pomodoro", icon: "⏱️" },
  { key: "flashcards", label: "Flashcards", icon: "🧠" },
  { key: "plan", label: "Plano semanal", icon: "🗓️" },
  { key: "compare", label: "Modo casal", icon: "💛" },
] as const;

type SectionKey = (typeof NAV_ITEMS)[number]["key"];

export default function AppShell() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileParam = searchParams.get("profile");

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profileId, setProfileId] = useState<number | null>(profileParam ? Number(profileParam) : null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [section, setSection] = useState<SectionKey>("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api.get<Profile[]>("/api/profiles").then((rows) => {
      setProfiles(rows);
      setReady(true);
      if (!profileParam) {
        const stored = localStorage.getItem("studyorbit:profileId");
        if (stored) {
          router.replace(`/painel?profile=${stored}`);
        } else if (rows.length > 0) {
          router.replace(`/painel?profile=${rows[0].id}`);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (profileParam) {
      setProfileId(Number(profileParam));
      localStorage.setItem("studyorbit:profileId", profileParam);
    }
  }, [profileParam]);

  function loadSubjects(id: number) {
    api.get<Subject[]>(`/api/subjects?profileId=${id}`).then(setSubjects);
  }

  useEffect(() => {
    if (profileId) loadSubjects(profileId);
  }, [profileId]);

  const profile = useMemo(() => profiles.find((p) => p.id === profileId) ?? null, [profiles, profileId]);

  function switchProfile(id: number) {
    localStorage.setItem("studyorbit:profileId", String(id));
    router.push(`/painel?profile=${id}`);
  }

  if (ready && profiles.length === 0) {
    return (
      <div className="grid min-h-screen place-items-center px-6 text-center">
        <div>
          <p className="text-4xl">📚</p>
          <p className="mt-4 text-slate-300">Nenhum perfil encontrado.</p>
          <a href="/" className="mt-4 inline-block rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white">
            Criar meu primeiro perfil
          </a>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <div className="grid min-h-screen place-items-center text-slate-400">Carregando painel...</div>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-black/20 px-4 py-6 lg:flex">
        <a href="/" className="mb-8 flex items-center gap-2 px-2">
          <span className="text-2xl">🪐</span>
          <span className="font-[family-name:var(--font-display)] text-lg font-bold text-white">StudyOrbit</span>
        </a>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => setSection(item.key)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                section === item.key
                  ? "bg-indigo-500/15 text-indigo-300"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <ProfileSwitcher profiles={profiles} activeId={profile.id} onSwitch={switchProfile} />
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#0a0f1e]/90 px-4 py-3 backdrop-blur lg:hidden">
        <a href="/" className="flex items-center gap-2">
          <span className="text-xl">🪐</span>
          <span className="font-[family-name:var(--font-display)] text-base font-bold text-white">StudyOrbit</span>
        </a>
        <button
          onClick={() => setMobileNavOpen((v) => !v)}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300"
        >
          {mobileNavOpen ? "✕" : "☰"} {NAV_ITEMS.find((n) => n.key === section)?.label}
        </button>
      </div>

      {mobileNavOpen && (
        <div className="fixed inset-x-0 top-[52px] z-20 border-b border-white/10 bg-[#0a0f1e] px-4 py-3 lg:hidden">
          <div className="grid grid-cols-2 gap-2">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  setSection(item.key);
                  setMobileNavOpen(false);
                }}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${
                  section === item.key ? "bg-indigo-500/15 text-indigo-300" : "text-slate-400"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
          <div className="mt-3 border-t border-white/10 pt-3">
            <ProfileSwitcher profiles={profiles} activeId={profile.id} onSwitch={switchProfile} compact />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="min-w-0 flex-1 px-5 pb-16 pt-20 sm:px-8 lg:pt-8">
        {section === "dashboard" && <DashboardSection profile={profile} subjects={subjects} />}
        {section === "subjects" && (
          <SubjectsSection profileId={profile.id} subjects={subjects} onChange={() => loadSubjects(profile.id)} />
        )}
        {section === "tasks" && <TasksSection profileId={profile.id} subjects={subjects} />}
        {section === "pomodoro" && <PomodoroSection profileId={profile.id} subjects={subjects} />}
        {section === "flashcards" && <FlashcardsSection profileId={profile.id} subjects={subjects} />}
        {section === "plan" && <PlanSection profileId={profile.id} subjects={subjects} />}
        {section === "compare" && <CompareSection />}
      </main>
    </div>
  );
}

function ProfileSwitcher({
  profiles,
  activeId,
  onSwitch,
  compact,
}: {
  profiles: Profile[];
  activeId: number;
  onSwitch: (id: number) => void;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "" : "mt-4 border-t border-white/10 pt-4"}>
      <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-slate-500">Trocar perfil</p>
      <div className="space-y-1">
        {profiles.map((p) => (
          <button
            key={p.id}
            onClick={() => onSwitch(p.id)}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition ${
              p.id === activeId ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5"
            }`}
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg text-sm"
              style={{ backgroundColor: `${p.colorHex}30` }}
            >
              {p.emoji}
            </span>
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}
