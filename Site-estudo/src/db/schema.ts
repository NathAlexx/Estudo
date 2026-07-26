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
