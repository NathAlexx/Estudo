CREATE TABLE "flashcard_decks" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"subject_id" integer,
	"name" varchar(120) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flashcards" (
	"id" serial PRIMARY KEY NOT NULL,
	"deck_id" integer NOT NULL,
	"front" text NOT NULL,
	"back" text NOT NULL,
	"box" integer DEFAULT 1 NOT NULL,
	"times_reviewed" integer DEFAULT 0 NOT NULL,
	"next_review_at" timestamp DEFAULT now() NOT NULL,
	"last_reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plan_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"subject_id" integer,
	"day_of_week" integer NOT NULL,
	"start_time" varchar(5) NOT NULL,
	"duration_minutes" integer DEFAULT 60 NOT NULL,
	"title" varchar(120),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(60) NOT NULL,
	"emoji" varchar(8) DEFAULT '📚' NOT NULL,
	"color_hex" varchar(16) DEFAULT '#6366f1' NOT NULL,
	"weekly_goal_minutes" integer DEFAULT 300 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"subject_id" integer,
	"duration_minutes" integer NOT NULL,
	"technique" varchar(30) DEFAULT 'pomodoro' NOT NULL,
	"notes" text,
	"occurred_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"name" varchar(80) NOT NULL,
	"emoji" varchar(8) DEFAULT '📘' NOT NULL,
	"color_hex" varchar(16) DEFAULT '#3b82f6' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"subject_id" integer,
	"title" varchar(200) NOT NULL,
	"description" text,
	"due_date" date,
	"priority" varchar(10) DEFAULT 'media' NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "flashcard_decks" ADD CONSTRAINT "flashcard_decks_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcard_decks" ADD CONSTRAINT "flashcard_decks_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_deck_id_flashcard_decks_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."flashcard_decks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_entries" ADD CONSTRAINT "plan_entries_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_entries" ADD CONSTRAINT "plan_entries_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE set null ON UPDATE no action;