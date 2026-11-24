import "dotenv/config";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { prisma } from "../lib/prisma.js";
import { createNotesService } from "../services/notes.service.js";
import { createMcpServer } from "./server.js";

async function main(): Promise<void> {
  const userId = Number(process.env.MCP_OWNER_USER_ID);
  if (!Number.isSafeInteger(userId) || userId < 1) {
    throw new Error("MCP_OWNER_USER_ID must be a positive safe integer.");
  }
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) throw new Error("Configured MCP owner account was not found.");

  const service = createNotesService(prisma);
  const handle = serveStdio(() => createMcpServer({ service, userId }), {
    legacy: "serve",
    onerror: () => process.stderr.write("MCP stdio transport error.\n"),
  });

  let closing: Promise<void> | undefined;
  const close = () => {
    closing ??= handle.close().catch(() => undefined).then(() => prisma.$disconnect()).catch(() => undefined);
  };
  process.stdin.once("end", close);
  process.once("SIGINT", close);
  process.once("SIGTERM", close);
}

void main().catch(async () => {
  process.stderr.write("MCP stdio server could not start. Check MCP_OWNER_USER_ID and DATABASE_URL configuration.\n");
  await prisma.$disconnect().catch(() => undefined);
  process.exitCode = 1;
});
