import { PrismaClient } from "@prisma/client";

// Prisma singleton: `next dev` hot-reloads route modules, and without the
// global cache each reload would open a new SQLite connection pool until the
// process exhausts file descriptors (the documented Next.js pattern).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
