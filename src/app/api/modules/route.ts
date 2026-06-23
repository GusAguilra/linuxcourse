import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { modules as staticModules } from "@/data/modules";

export async function GET() {
  try {
    const dbModules = await prisma.module.findMany({
      orderBy: { order: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        category: true,
        order: true,
        exercises: true,
        quiz: true,
      },
    });

    if (dbModules.length > 0) {
      const modules = dbModules.map((m) => ({
        ...m,
        id: m.id,
        exercises: JSON.parse(m.exercises),
        quiz: JSON.parse(m.quiz),
      }));
      return NextResponse.json({ modules });
    }

    return NextResponse.json({ modules: staticModules });
  } catch {
    return NextResponse.json({ modules: staticModules });
  }
}

export const dynamic = "force-dynamic";
