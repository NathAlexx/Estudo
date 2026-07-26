import { NextResponse } from "next/server";
import { db } from "@/db";
import { studySessions, tasks, flashcards, flashcardDecks } from "@/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const profileId = Number(searchParams.get("profileId"));
  if (!profileId) {
    return NextResponse.json({ error: "profileId é obrigatório" }, { status: 400 });
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const dailyRows = await db
    .select({
      day: sql<string>`to_char(${studySessions.occurredAt}, 'YYYY-MM-DD')`,
      minutes: sql<number>`sum(${studySessions.durationMinutes})::int`,
    })
    .from(studySessions)
    .where(
      and(eq(studySessions.profileId, profileId), gte(studySessions.occurredAt, sevenDaysAgo))
    )
    .groupBy(sql`to_char(${studySessions.occurredAt}, 'YYYY-MM-DD')`);

  const dailyMap = new Map(dailyRows.map((r) => [r.day, r.minutes]));
  const last7Days: { day: string; minutes: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    last7Days.push({ day: key, minutes: dailyMap.get(key) ?? 0 });
  }

  const weeklyMinutes = last7Days.reduce((sum, d) => sum + d.minutes, 0);

  const [totalRow] = await db
    .select({ minutes: sql<number>`coalesce(sum(${studySessions.durationMinutes}), 0)::int` })
    .from(studySessions)
    .where(eq(studySessions.profileId, profileId));

  const allDaysRows = await db
    .select({
      day: sql<string>`to_char(${studySessions.occurredAt}, 'YYYY-MM-DD')`,
    })
    .from(studySessions)
    .where(eq(studySessions.profileId, profileId))
    .groupBy(sql`to_char(${studySessions.occurredAt}, 'YYYY-MM-DD')`);

  const studiedDaySet = new Set(allDaysRows.map((r) => r.day));
  let streak = 0;
  const cursor = new Date();
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (studiedDaySet.has(key)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  const [taskCounts] = await db
    .select({
      pending: sql<number>`count(*) filter (where not ${tasks.completed})::int`,
      completed: sql<number>`count(*) filter (where ${tasks.completed})::int`,
      overdue: sql<number>`count(*) filter (where not ${tasks.completed} and ${tasks.dueDate} is not null and ${tasks.dueDate} < current_date)::int`,
    })
    .from(tasks)
    .where(eq(tasks.profileId, profileId));

  const [dueFlashRow] = await db
    .select({ due: sql<number>`count(*)::int` })
    .from(flashcards)
    .innerJoin(flashcardDecks, eq(flashcards.deckId, flashcardDecks.id))
    .where(
      and(eq(flashcardDecks.profileId, profileId), sql`${flashcards.nextReviewAt} <= now()`)
    );

  return NextResponse.json({
    weeklyMinutes,
    totalMinutes: totalRow?.minutes ?? 0,
    streak,
    last7Days,
    tasksPending: taskCounts?.pending ?? 0,
    tasksCompleted: taskCounts?.completed ?? 0,
    tasksOverdue: taskCounts?.overdue ?? 0,
    dueFlashcards: dueFlashRow?.due ?? 0,
  });
}
