import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const dbUrl = (process.env.DATABASE_URL ?? "file:./prisma/dev.db").replace(/^"|"$/g, "");
const adapter = new PrismaBetterSqlite3({ url: dbUrl });

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
