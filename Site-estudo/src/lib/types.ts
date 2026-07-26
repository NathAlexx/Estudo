export type Profile = {
  id: number;
  name: string;
  emoji: string;
  colorHex: string;
  weeklyGoalMinutes: number;
  createdAt: string;
};

export type Subject = {
  id: number;
  profileId: number;
  name: string;
  emoji: string;
  colorHex: string;
  createdAt: string;
};

export type Task = {
  id: number;
  profileId: number;
  subjectId: number | null;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: "baixa" | "media" | "alta";
  completed: boolean;
  createdAt: string;
};

export type StudySession = {
  id: number;
  profileId: number;
  subjectId: number | null;
  durationMinutes: number;
  technique: string;
  notes: string | null;
  occurredAt: string;
};

export type Deck = {
  id: number;
  profileId: number;
  subjectId: number | null;
  name: string;
  createdAt: string;
  totalCards: number;
  dueCards: number;
};

export type Flashcard = {
  id: number;
  deckId: number;
  front: string;
  back: string;
  box: number;
  timesReviewed: number;
  nextReviewAt: string;
  lastReviewedAt: string | null;
  createdAt: string;
};

export type PlanEntry = {
  id: number;
  profileId: number;
  subjectId: number | null;
  dayOfWeek: number;
  startTime: string;
  durationMinutes: number;
  title: string | null;
  createdAt: string;
};

export type Stats = {
  weeklyMinutes: number;
  totalMinutes: number;
  streak: number;
  last7Days: { day: string; minutes: number }[];
  tasksPending: number;
  tasksCompleted: number;
  tasksOverdue: number;
  dueFlashcards: number;
};

export type CompareEntry = {
  profile: Profile;
  weeklyMinutes: number;
  tasksCompleted: number;
  tasksPending: number;
};

export const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export const SUBJECT_COLORS = [
  "#6366f1",
  "#3b82f6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#8b5cf6",
];

export const EMOJI_CHOICES = [
  "📘",
  "📗",
  "📙",
  "📕",
  "🧮",
  "🧪",
  "🧬",
  "⚖️",
  "💻",
  "🌍",
  "🎨",
  "🎵",
  "🏛️",
  "📐",
  "🔬",
  "✍️",
];
