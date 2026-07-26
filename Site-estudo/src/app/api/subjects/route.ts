import { NextResponse } from "next/server";
import { db } from "@/db";
import { subjects } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const profileId = Number(searchParams.get("profileId"));
  if (!profileId) return NextResponse.json([]);

  const rows = await db
    .select()
    .from(subjects)
    .where(eq(subjects.profileId, profileId))
    .orderBy(asc(subjects.id));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const profileId = Number(body.profileId);
  const name = String(body.name ?? "").trim();
  if (!profileId || !name) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  const emoji = String(body.emoji ?? "📘");
  const colorHex = String(body.colorHex ?? "#3b82f6");

  const [created] = await db
    .insert(subjects)
    .values({ profileId, name, emoji, colorHex })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
