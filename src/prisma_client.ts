import { PrismaClient } from "@prisma/client";

const globalForPrisma: { prisma?: PrismaClient } = global as any;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
