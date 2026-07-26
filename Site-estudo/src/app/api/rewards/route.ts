import { NextResponse } from "next/server";
import { db } from "@/db";
import { rewards } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db.select().from(rewards).orderBy(desc(rewards.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const [created] = await db
    .insert(rewards)
    .values({
      creatorId: Number(body.creatorId),
      title: String(body.title).trim(),
      description: body.description ? String(body.description) : null,
      icon: String(body.icon ?? "🎁"),
      pointsCost: Number(body.pointsCost ?? 10),
    })
    .returning();
  return NextResponse.json(created, { status: 201 });
}
