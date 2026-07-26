import { NextResponse } from "next/server";
import { db } from "@/db";
import { profiles, studySessions, tasks } from "@/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const allProfiles = await db.select().from(profiles);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const result = await Promise.all(
    allProfiles.map(async (profile) => {
      const [weekRow] = await db
        .select({ minutes: sql<number>`coalesce(sum(${studySessions.durationMinutes}), 0)::int` })
        .from(studySessions)
        .where(
          and(
            eq(studySessions.profileId, profile.id),
            gte(studySessions.occurredAt, sevenDaysAgo)
          )
        );

      const [taskRow] = await db
        .select({
          completed: sql<number>`count(*) filter (where ${tasks.completed})::int`,
          pending: sql<number>`count(*) filter (where not ${tasks.completed})::int`,
        })
        .from(tasks)
        .where(eq(tasks.profileId, profile.id));

      return {
        profile,
        weeklyMinutes: weekRow?.minutes ?? 0,
        tasksCompleted: taskRow?.completed ?? 0,
        tasksPending: taskRow?.pending ?? 0,
      };
    })
  );

  return NextResponse.json(result);
}
