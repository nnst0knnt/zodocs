import { PrismaClient, Prisma } from "@prisma/client";

type NodeJsGlobal = {
  prisma?: PrismaClient;
};

const prismaClientSingleton = () => {
  let client: PrismaClient;

  const enableQueryLog = process.env.ENABLE_QUERY_LOG === "true";

  if (process.env.APP_ENV !== "local" || !enableQueryLog) {
    client = new PrismaClient();
  } else {
    const prisma = new PrismaClient({
      log: [
        {
          emit: "event",
          level: "query",
        },
      ],
    });

    prisma.$on("query", async ({ query, params: values }) =>
      console.info(await composeLog(query, values)),
    );

    client = prisma;
  }

  return client;
};

declare const global: NodeJsGlobal;

if (process.env.APP_ENV !== "production") {
  global.prisma = global.prisma ?? prismaClientSingleton();
} else {
  global.prisma = prismaClientSingleton();
}

export const db = global.prisma;

export const SortOrder = Prisma.SortOrder;

const composeLog = async (query: string, values: string) => {
  const { format } = await import("sql-formatter");

  const RESET = "\u001b[0m";
  const FORMAT_CONFIG = {
    SELECT: "🔍 SELECT\n\n\u001b[34mSELECT",
    INSERT: "🐣 INSERT\n\n\u001b[33mINSERT",
    UPDATE: "✅ UPDATE\n\n\u001b[32mUPDATE",
    DELETE: "❌ DELETE\n\n\u001b[38;5;213mDELETE",
  };

  let queryWithValues = query;
  if (values) {
    JSON.parse(values).forEach((value: string, index: number) => {
      const placeholder = `$${index + 1}`;
      queryWithValues = queryWithValues.replace(
        placeholder,
        typeof value === "string" ? `'${value}'` : value,
      );
    });
  }

  const formatted = format(queryWithValues, { language: "postgresql" })
    .replace("SELECT", FORMAT_CONFIG.SELECT)
    .replace("INSERT", FORMAT_CONFIG.INSERT)
    .replace("UPDATE", FORMAT_CONFIG.UPDATE)
    .replace("DELETE", FORMAT_CONFIG.DELETE);

  return "░".repeat(100) + "\n\n" + formatted + RESET + "\n";
};
