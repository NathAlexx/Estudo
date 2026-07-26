import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  date,
} from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 60 }).notNull(),
  emoji: varchar("emoji", { length: 8 }).notNull().default("📚"),
  colorHex: varchar("color_hex", { length: 16 }).notNull().default("#6366f1"),
  weeklyGoalMinutes: integer("weekly_goal_minutes").notNull().default(300),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 80 }).notNull(),
  emoji: varchar("emoji", { length: 8 }).notNull().default("📘"),
  colorHex: varchar("color_hex", { length: 16 }).notNull().default("#3b82f6"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  subjectId: integer("subject_id").references(() => subjects.id, {
    onDelete: "set null",
  }),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  dueDate: date("due_date"),
  priority: varchar("priority", { length: 10 }).notNull().default("media"),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  subjectId: integer("subject_id").references(() => subjects.id, {
    onDelete: "set null",
  }),
  durationMinutes: integer("duration_minutes").notNull(),
  technique: varchar("technique", { length: 30 }).notNull().default("pomodoro"),
  notes: text("notes"),
  occurredAt: timestamp("occurred_at").notNull().defaultNow(),
});

export const flashcardDecks = pgTable("flashcard_decks", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  subjectId: integer("subject_id").references(() => subjects.id, {
    onDelete: "set null",
  }),
  name: varchar("name", { length: 120 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const flashcards = pgTable("flashcards", {
  id: serial("id").primaryKey(),
  deckId: integer("deck_id")
    .notNull()
    .references(() => flashcardDecks.id, { onDelete: "cascade" }),
  front: text("front").notNull(),
  back: text("back").notNull(),
  box: integer("box").notNull().default(1),
  timesReviewed: integer("times_reviewed").notNull().default(0),
  nextReviewAt: timestamp("next_review_at").notNull().defaultNow(),
  lastReviewedAt: timestamp("last_reviewed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const planEntries = pgTable("plan_entries", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  subjectId: integer("subject_id").references(() => subjects.id, {
    onDelete: "set null",
  }),
  dayOfWeek: integer("day_of_week").notNull(),
  startTime: varchar("start_time", { length: 5 }).notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(60),
  title: varchar("title", { length: 120 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const coupleStreaks = pgTable("couple_streaks", {
  id: serial("id").primaryKey(),
  profileId1: integer("profile_id_1")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  profileId2: integer("profile_id_2")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastStudiedTogether: date("last_studied_together"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const flashcardErrors = pgTable("flashcard_errors", {
  id: serial("id").primaryKey(),
  flashcardId: integer("flashcard_id")
    .notNull()
    .references(() => flashcards.id, { onDelete: "cascade" }),
  profileId: integer("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  partnerTip: text("partner_tip"),
  tipAuthorId: integer("tip_author_id").references(() => profiles.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  challengerId: integer("challenger_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  challengedId: integer("challenged_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  description: varchar("description", { length: 200 }).notNull(),
  targetMinutes: integer("target_minutes").notNull(),
  subjectId: integer("subject_id").references(() => subjects.id, {
    onDelete: "set null",
  }),
  deadline: date("deadline").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  points: integer("points").notNull().default(10),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const studyPresence = pgTable("study_presence", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  isOnline: boolean("is_online").notNull().default(false),
  isFocusing: boolean("is_focusing").notNull().default(false),
  focusStartedAt: timestamp("focus_started_at"),
  focusDuration: integer("focus_duration"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
