import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUsername } from "@/lib/auth";
import { checkAndAwardAchievements } from "@/lib/achievements";

export async function PATCH(req: Request) {
  try {
    const username = await getSessionUsername();
    if (!username) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const body = await req.json();
    const { moduleId, action, score } = body;

    if (!action || !["complete", "start"].includes(action)) {
      return NextResponse.json(
        { error: "Acción inválida" },
        { status: 400 }
      );
    }

    if (action === "complete" && !moduleId) {
      return NextResponse.json(
        { error: "moduleId requerido" },
        { status: 400 }
      );
    }

    const progress = await prisma.progress.findUnique({
      where: { userId: user.id },
    });

    if (!progress) {
      return NextResponse.json(
        { error: "Progreso no encontrado" },
        { status: 404 }
      );
    }

    const completedModules: string[] = JSON.parse(
      progress.completedModules ?? "[]"
    );

    if (action === "complete" && !completedModules.includes(moduleId)) {
      completedModules.push(moduleId);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActive = new Date(progress.lastActive);
    lastActive.setHours(0, 0, 0, 0);
    const diffDays = Math.round(
      (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
    );

    let newStreak = progress.streak;
    if (progress.streak === 0) {
      newStreak = 1;
    } else if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }

    const updated = await prisma.progress.update({
      where: { userId: user.id },
      data: {
        completedModules: JSON.stringify(completedModules),
        score:
          score !== undefined && typeof score === "number"
            ? progress.score + score
            : progress.score,
        streak: newStreak,
        lastActive: new Date(),
        currentModuleId:
          action === "start" && moduleId ? moduleId : progress.currentModuleId,
      },
    });

    if (action === "complete") {
      await checkAndAwardAchievements(user.id);
    }

    return NextResponse.json({ progress: updated });
  } catch {
    return NextResponse.json(
      { error: "Error al actualizar progreso" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const username = await getSessionUsername();
    if (!username) {
      return NextResponse.json({ progress: null });
    }

    const user = await prisma.user.findUnique({
      where: { username },
      select: { progress: true },
    });

    return NextResponse.json({ progress: user?.progress || null });
  } catch {
    return NextResponse.json(
      { error: "Error al obtener progreso" },
      { status: 500 }
    );
  }
}
