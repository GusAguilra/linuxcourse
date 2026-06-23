import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { modules as staticModules } from "@/data/modules";
import { getModuleContent } from "@/lib/content-loader";
import { marked } from "marked";

function renderContent(md: string): string {
  return marked.parse(md, { async: false }) as string;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const dbMod = await prisma.module.findUnique({ where: { slug } });
    if (dbMod) {
      return NextResponse.json({
        module: {
          ...dbMod,
          content: renderContent(dbMod.content),
          exercises: JSON.parse(dbMod.exercises),
          quiz: JSON.parse(dbMod.quiz),
        },
      });
    }

    const staticMod = staticModules.find((m) => m.slug === slug);
    if (!staticMod) {
      return NextResponse.json(
        { error: "Módulo no encontrado" },
        { status: 404 }
      );
    }

    const content = renderContent(getModuleContent(slug));

    return NextResponse.json({ module: { ...staticMod, content } });
  } catch {
    return NextResponse.json(
      { error: "Error al cargar el módulo" },
      { status: 500 }
    );
  }
}
