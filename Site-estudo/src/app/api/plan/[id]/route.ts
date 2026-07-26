import { NextResponse } from "next/server";
import { db } from "@/db";
import { planEntries } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(planEntries).where(eq(planEntries.id, Number(id)));
  return NextResponse.json({ ok: true });
}
