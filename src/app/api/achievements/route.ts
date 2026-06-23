import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUsername } from "@/lib/auth";

const achievementLabels: Record<string, { title: string; description: string }> = {
  first_module: { title: "Primer Paso", description: "Completaste tu primer módulo" },
  halfway: { title: "Mitad de Camino", description: "Completaste 6 módulos" },
  all_modules: { title: "Linux Master", description: "Completaste todos los módulos" },
  "100_points": { title: "Centenial", description: "Alcanzaste 100 puntos" },
  "500_points": { title: "Leyenda", description: "Alcanzaste 500 puntos" },
  "7_day_streak": { title: "Racha de 7 Días", description: "Mantuviste una racha de 7 días" },
  "30_day_streak": { title: "Racha de 30 Días", description: "Mantuviste una racha de 30 días" },
};

export async function GET() {
  try {
    const username = await getSessionUsername();
    if (!username) {
      return NextResponse.json({ achievements: [] });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return NextResponse.json({ achievements: [] });
    }

    const achievements = await prisma.achievement.findMany({
      where: { userId: user.id },
      orderBy: { earnedAt: "desc" },
    });

    const enriched = achievements.map((a) => ({
      ...a,
      title: achievementLabels[a.type]?.title || a.type,
      description: achievementLabels[a.type]?.description || "",
    }));

    return NextResponse.json({ achievements: enriched, labels: achievementLabels });
  } catch {
    return NextResponse.json({ achievements: [] });
  }
}
