import { prisma } from "./db";

export async function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 60000
): Promise<boolean> {
  try {
    const now = Date.now();
    const record = await prisma.rateLimit.findUnique({ where: { key } });

    if (!record || now > record.resetAt.getTime()) {
      await prisma.rateLimit.upsert({
        where: { key },
        update: { count: 1, resetAt: new Date(now + windowMs) },
        create: { key, count: 1, resetAt: new Date(now + windowMs) },
      });
      return true;
    }

    if (record.count >= maxAttempts) {
      return false;
    }

    await prisma.rateLimit.update({
      where: { key },
      data: { count: record.count + 1 },
    });
    return true;
  } catch {
    return false;
  }
}
