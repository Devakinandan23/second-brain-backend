import { createHash, timingSafeEqual } from "node:crypto";
import express, { type Router } from "express";
import rateLimit from "express-rate-limit";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { toNodeHandler } from "@modelcontextprotocol/node";
import type { NotesService } from "../services/notes.service.js";
import { createMcpServer } from "./server.js";

export interface McpHttpConfig {
  userId: number;
  apiKey: string;
  allowedOrigins: string[];
  allowedHosts: string[];
}

export function readMcpHttpConfig(env: NodeJS.ProcessEnv = process.env): McpHttpConfig | undefined {
  if (env.MCP_ENABLED !== "true") return undefined;

  const userId = Number(env.MCP_OWNER_USER_ID);
  if (!Number.isSafeInteger(userId) || userId < 1) {
    throw new Error("MCP_OWNER_USER_ID must be a positive safe integer when MCP_ENABLED=true.");
  }
  const apiKey = env.MCP_API_KEY;
  if (!apiKey || !/^[\x21-\x7e]{32,}$/.test(apiKey)) {
    throw new Error("MCP_API_KEY must contain at least 32 printable non-whitespace ASCII characters when MCP_ENABLED=true.");
  }

  const allowedOrigins = (env.MCP_ALLOWED_ORIGINS ?? "").split(",").map((origin) => origin.trim()).filter(Boolean);
  for (const origin of allowedOrigins) {
    try {
      const parsed = new URL(origin);
      if ((parsed.protocol !== "http:" && parsed.protocol !== "https:") || parsed.origin !== origin) throw new Error();
    } catch {
      throw new Error("MCP_ALLOWED_ORIGINS must contain exact HTTP or HTTPS origins.");
    }
  }

  const configuredHosts = (env.MCP_ALLOWED_HOSTS ?? "").split(",").map((host) => host.trim().toLowerCase()).filter(Boolean);
  const allowedHosts = configuredHosts.length ? configuredHosts : ["localhost", "127.0.0.1", "[::1]"];
  if (allowedHosts.some((host) => !/^(?:\[[0-9a-f:]+\]|[a-z0-9.-]+)$/i.test(host))) {
    throw new Error("MCP_ALLOWED_HOSTS must contain hostnames without ports.");
  }

  return { userId, apiKey, allowedOrigins, allowedHosts };
}

function tokenMatches(header: string | undefined, expected: string): boolean {
  if (!header) return false;
  const match = /^Bearer ([^\s]+)$/i.exec(header);
  if (!match?.[1]) return false;
  const actualDigest = createHash("sha256").update(match[1]).digest();
  const expectedDigest = createHash("sha256").update(expected).digest();
  return timingSafeEqual(actualDigest, expectedDigest);
}

function requestHostname(hostHeader: string | undefined): string | null {
  if (!hostHeader) return null;
  try {
    return new URL(`http://${hostHeader}`).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function createMcpHttpRouter({ config, service }: { config: McpHttpConfig; service: NotesService }): Router {
  const router = express.Router();
  const handler = createMcpHandler(() => createMcpServer({ service, userId: config.userId }));
  const nodeHandler = toNodeHandler(handler);

  router.use((req, res, next) => {
    const host = requestHostname(req.get("host"));
    if (!host || !config.allowedHosts.includes(host)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const origin = req.get("origin");
    if (origin !== undefined && !config.allowedOrigins.includes(origin)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (origin !== undefined) {
      res.vary("Origin");
      res.set("Access-Control-Allow-Origin", origin);
      res.set("Access-Control-Expose-Headers", "MCP-Protocol-Version, Mcp-Session-Id");
    }
    if (req.method === "OPTIONS") {
      if (origin === undefined) {
        res.set("Allow", "POST").status(405).json({ error: "Method not allowed" });
        return;
      }
      res.set("Access-Control-Allow-Methods", "POST");
      res.set("Access-Control-Allow-Headers", "Authorization, Content-Type, Accept, MCP-Protocol-Version, Last-Event-ID, Mcp-Method, Mcp-Name");
      res.status(204).end();
      return;
    }
    if (!tokenMatches(req.get("authorization"), config.apiKey)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (req.method !== "POST") {
      res.set("Allow", "POST").status(405).json({ error: "Method not allowed" });
      return;
    }
    next();
  });

  router.use(rateLimit({
    windowMs: 60_000,
    limit: 60,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many requests" },
  }));
  router.use(express.json({ limit: "256kb", type: "application/json" }));
  router.use((req, res, next) => {
    if (!req.is("application/json")) {
      res.status(415).json({ error: "Unsupported media type" });
      return;
    }
    next();
  });
  router.use((req, res) => {
    void nodeHandler(req, res, req.body).catch(() => {
      if (!res.headersSent) res.status(500).json({ error: "MCP request failed" });
    });
  });
  router.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = typeof error === "object" && error !== null && "status" in error && error.status === 413 ? 413 : 400;
    res.status(status).json({ error: status === 413 ? "Request too large" : "Invalid JSON request" });
  });
  return router;
}
