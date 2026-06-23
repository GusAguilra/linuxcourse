"use server";

import { prisma } from "@/lib/db";
import { getSessionUsername } from "@/lib/auth";
import { checkAndAwardAchievements } from "@/lib/achievements";
import { revalidatePath } from "next/cache";

export async function completeModule(moduleId: string, score: number) {
  const username = await getSessionUsername();
  if (!username) throw new Error("No autorizado");

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) throw new Error("Usuario no encontrado");

  const progress = await prisma.progress.findUnique({ where: { userId: user.id } });
  if (!progress) throw new Error("Progreso no encontrado");

  const completedModules: string[] = JSON.parse(progress.completedModules ?? "[]");

  if (!completedModules.includes(moduleId)) {
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

  await prisma.progress.update({
    where: { userId: user.id },
    data: {
      completedModules: JSON.stringify(completedModules),
      score: progress.score + score,
      streak: newStreak,
      lastActive: new Date(),
    },
  });

  await checkAndAwardAchievements(user.id);

  revalidatePath("/dashboard");
  revalidatePath(`/modules`);
}

export async function resetProgress() {
  const username = await getSessionUsername();
  if (!username) throw new Error("No autorizado");

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) throw new Error("Usuario no encontrado");

  await prisma.progress.update({
    where: { userId: user.id },
    data: {
      completedModules: "[]",
      currentModuleId: null,
      score: 0,
      streak: 0,
      lastActive: new Date(),
    },
  });

  await prisma.achievement.deleteMany({ where: { userId: user.id } });

  revalidatePath("/dashboard");
  revalidatePath("/modules");
  revalidatePath("/profile");
}


