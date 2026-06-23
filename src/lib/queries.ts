import { prisma } from "@/lib/db";
import { getSessionUsername } from "@/lib/auth";
import { modules as staticModules } from "@/data/modules";

export type ServerUser = {
  id: string;
  username: string;
  progress: {
    completedModules: string;
    currentModuleId: string | null;
    score: number;
    streak: number;
  } | null;
};

export type ServerModule = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  order: number;
  exercises: number;
};

export async function getServerUser(): Promise<ServerUser | null> {
  const username = await getSessionUsername();
  if (!username) return null;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      progress: true,
    },
  });

  return user;
}

export async function getServerModules(): Promise<ServerModule[]> {
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
      },
    });

    if (dbModules.length > 0) {
      return dbModules.map((m) => {
        const parsed = JSON.parse(m.exercises);
        return {
          ...m,
          exercises: Array.isArray(parsed) ? parsed.length : 0,
        };
      });
    }
  } catch {}

  return staticModules.map((m) => ({
    id: m.id,
    slug: m.slug,
    title: m.title,
    description: m.description,
    category: m.category,
    order: m.order,
    exercises: m.exercises.length,
  }));
}
