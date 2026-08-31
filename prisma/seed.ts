import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { ACHIEVEMENT_RULES } from "../src/lib/gamification";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  for (const rule of ACHIEVEMENT_RULES) {
    await db.achievement.upsert({
      where: { key: rule.key },
      update: {},
      create: {
        key: rule.key,
        titleKey: `${rule.key}_title`,
        descriptionKey: `${rule.key}_desc`,
        iconKey: rule.key,
      },
    });
  }
}

main()
  .then(() => db.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await db.$disconnect();
    process.exit(1);
  });
