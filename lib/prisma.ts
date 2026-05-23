import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// In Prisma 7, the adapter handles internal initialization of better-sqlite3 automatically
const dbUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";

const adapter = new PrismaBetterSqlite3({
  url: dbUrl.startsWith("file:") ? dbUrl.replace("file:", "") : dbUrl,
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
