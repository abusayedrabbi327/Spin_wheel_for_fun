import { PrismaClient } from "@prisma/client";
import { neon } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";

declare global {
  var prisma: PrismaClient | undefined;
}

const createPrismaClient = () => {
  const sql = neon(process.env.DATABASE_URL!);
  const adapter = new PrismaNeon(sql);
  return new PrismaClient({ adapter });
};

// Prevent multiple instances of Prisma Client in development
export const prisma = globalThis.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export default prisma;
