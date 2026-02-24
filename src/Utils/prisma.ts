import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import { env } from "./env.js";

const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
