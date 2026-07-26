import { NextResponse } from "next/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db.select().from(profiles).orderBy(asc(profiles.id));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const name = String(body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }
  const emoji = String(body.emoji ?? "📚");
  const colorHex = String(body.colorHex ?? "#6366f1");
  const weeklyGoalMinutes = Number(body.weeklyGoalMinutes ?? 300);

  const [created] = await db
    .insert(profiles)
    .values({ name, emoji, colorHex, weeklyGoalMinutes })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
