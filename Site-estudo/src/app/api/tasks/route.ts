import { NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const profileId = Number(searchParams.get("profileId"));
  if (!profileId) return NextResponse.json([]);

  const rows = await db
    .select()
    .from(tasks)
    .where(eq(tasks.profileId, profileId))
    .orderBy(asc(tasks.dueDate), asc(tasks.id));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const profileId = Number(body.profileId);
  const title = String(body.title ?? "").trim();
  if (!profileId || !title) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const [created] = await db
    .insert(tasks)
    .values({
      profileId,
      title,
      description: body.description ? String(body.description) : null,
      subjectId: body.subjectId ? Number(body.subjectId) : null,
      dueDate: body.dueDate ? String(body.dueDate) : null,
      priority: body.priority ? String(body.priority) : "media",
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
