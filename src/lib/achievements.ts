import { prisma } from "@/lib/db";

export async function checkAndAwardAchievements(userId: string) {
  const progress = await prisma.progress.findUnique({ where: { userId } });
  if (!progress) return;

  const completedModules: string[] = JSON.parse(progress.completedModules ?? "[]");
  const existingAchievements = await prisma.achievement.findMany({ where: { userId } });
  const existingTypes = new Set(existingAchievements.map((a) => a.type));

  const newAchievements: { userId: string; type: string }[] = [];

  if (completedModules.length >= 1 && !existingTypes.has("first_module")) {
    newAchievements.push({ userId, type: "first_module" });
  }
  if (completedModules.length >= 6 && !existingTypes.has("halfway")) {
    newAchievements.push({ userId, type: "halfway" });
  }
  if (completedModules.length >= 12 && !existingTypes.has("all_modules")) {
    newAchievements.push({ userId, type: "all_modules" });
  }
  if ((progress.score || 0) >= 100 && !existingTypes.has("100_points")) {
    newAchievements.push({ userId, type: "100_points" });
  }
  if ((progress.score || 0) >= 500 && !existingTypes.has("500_points")) {
    newAchievements.push({ userId, type: "500_points" });
  }
  if ((progress.streak || 0) >= 7 && !existingTypes.has("7_day_streak")) {
    newAchievements.push({ userId, type: "7_day_streak" });
  }
  if ((progress.streak || 0) >= 30 && !existingTypes.has("30_day_streak")) {
    newAchievements.push({ userId, type: "30_day_streak" });
  }

  if (newAchievements.length > 0) {
    await prisma.achievement.createMany({ data: newAchievements });
  }
}
