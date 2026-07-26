CREATE TABLE "challenges" (
	"id" serial PRIMARY KEY NOT NULL,
	"challenger_id" integer NOT NULL,
	"challenged_id" integer NOT NULL,
	"description" varchar(200) NOT NULL,
	"target_minutes" integer NOT NULL,
	"subject_id" integer,
	"deadline" date NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"points" integer DEFAULT 10 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "couple_streaks" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id_1" integer NOT NULL,
	"profile_id_2" integer NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"last_studied_together" date,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flashcard_errors" (
	"id" serial PRIMARY KEY NOT NULL,
	"flashcard_id" integer NOT NULL,
	"profile_id" integer NOT NULL,
	"partner_tip" text,
	"tip_author_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_presence" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"is_online" boolean DEFAULT false NOT NULL,
	"is_focusing" boolean DEFAULT false NOT NULL,
	"focus_started_at" timestamp,
	"focus_duration" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_challenger_id_profiles_id_fk" FOREIGN KEY ("challenger_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_challenged_id_profiles_id_fk" FOREIGN KEY ("challenged_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "couple_streaks" ADD CONSTRAINT "couple_streaks_profile_id_1_profiles_id_fk" FOREIGN KEY ("profile_id_1") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "couple_streaks" ADD CONSTRAINT "couple_streaks_profile_id_2_profiles_id_fk" FOREIGN KEY ("profile_id_2") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcard_errors" ADD CONSTRAINT "flashcard_errors_flashcard_id_flashcards_id_fk" FOREIGN KEY ("flashcard_id") REFERENCES "public"."flashcards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcard_errors" ADD CONSTRAINT "flashcard_errors_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcard_errors" ADD CONSTRAINT "flashcard_errors_tip_author_id_profiles_id_fk" FOREIGN KEY ("tip_author_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_presence" ADD CONSTRAINT "study_presence_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;