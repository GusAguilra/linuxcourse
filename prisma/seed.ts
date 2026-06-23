import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { modules } from "../src/data/modules";
import { getModuleContent } from "../src/lib/content-loader";
import path from "path";

const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding modules...");

  for (const mod of modules) {
    const content = getModuleContent(mod.slug);
    await prisma.module.upsert({
      where: { slug: mod.slug },
      update: {
        title: mod.title,
        description: mod.description,
        category: mod.category,
        order: mod.order,
        content,
        exercises: JSON.stringify(mod.exercises),
        quiz: JSON.stringify(mod.quiz),
      },
      create: {
        slug: mod.slug,
        title: mod.title,
        description: mod.description,
        category: mod.category,
        order: mod.order,
        content,
        exercises: JSON.stringify(mod.exercises),
        quiz: JSON.stringify(mod.quiz),
      },
    });
    console.log(`  ${mod.slug} updated`);
  }

  console.log("Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
