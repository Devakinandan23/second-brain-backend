import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createServer } from "node:http";
import { jest } from "@jest/globals";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { InMemoryTransport } from "@modelcontextprotocol/server";
import request from "supertest";
import express from "express";
import { createMcpHttpRouter, readMcpHttpConfig } from "../http.js";
import { createMcpServer } from "../server.js";
import { createNotesService, type NoteDetail, type NoteSummary } from "../../services/notes.service.js";

const OWNER = 41;
const ID = "93a54bac-0a5d-4ee0-96a2-d4ac9ca54812";
const summary: NoteSummary = {
  id: ID,
  title: "A note",
  link: "https://example.test/note",
  description: "A description",
  sourceType: "WEBSITE",
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  tags: [{ title: "work" }],
};
const detail: NoteDetail = { ...summary, content: "Full note content" };

function responseResult(response: { body: unknown; text: string }, id: number): Record<string, unknown> {
  const body = response.body as { result?: Record<string, unknown> };
  if (body.result) return body.result;
  const messages = [...response.text.matchAll(/^data:\s*(\{.*\})\s*$/gm)]
    .map((match) => JSON.parse(match[1] ?? "{}") as { id?: number; result?: Record<string, unknown> });
  const message = messages.find((entry) => entry.id === id);
  if (!message?.result) throw new Error(`JSON-RPC response ${id} was not found in the HTTP response.`);
  return message.result;
}

function makeService() {
  const calls: Array<{ method: string; args: unknown }> = [];
  const prisma = {
    note: {
      findMany: async (args: unknown) => { calls.push({ method: "findMany", args }); return [summary]; },
      findFirst: async (args: unknown) => { calls.push({ method: "findFirst", args }); return detail; },
    },
  };
  return { service: createNotesService(prisma as never), calls };
}

describe("read-only note service", () => {
  test("search always scopes owner and active notes, filters supported fields, and bounds/order results", async () => {
    const { service, calls } = makeService();
    await service.searchNotes(OWNER, { query: "  hello ", limit: 4 });
    const call = calls[0]?.args as { where: Record<string, unknown>; take: number; orderBy: unknown; select: Record<string, unknown> };
    expect(call.where.userId).toBe(OWNER);
    expect(call.where.trashedAt).toBeNull();
    expect(call.where.OR).toHaveLength(5);
    expect(call.take).toBe(4);
    expect(call.orderBy).toEqual([{ updatedAt: "desc" }, { id: "desc" }]);
    expect(call.select).not.toHaveProperty("content");
  });

  test("rejects invalid query, limit, owner and UUID; returns same not-found for absent notes", async () => {
    const { service } = makeService();
    await expect(service.searchNotes(OWNER, { query: "  " })).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await expect(service.searchNotes(OWNER, { query: "x", limit: 21 })).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await expect(service.searchNotes(0, { query: "x" })).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await expect(service.getNote(OWNER, "nope")).rejects.toMatchObject({ code: "INVALID_INPUT" });

    const missing = createNotesService({ note: { findFirst: async () => null } } as never);
    await expect(missing.getNote(OWNER, ID)).rejects.toMatchObject({ code: "NOT_FOUND", message: "Note not found." });
  });

  test("tool schemas reject extra owner arguments and invalid IDs/limits before the service runs", async () => {
    const searchNotes = jest.fn(async () => [summary]);
    const getNote = jest.fn(async () => detail);
    const server = createMcpServer({ service: { searchNotes, getNote }, userId: OWNER });
    const client = new Client({ name: "mcp-test", version: "1.0.0" });
    const [a, b] = InMemoryTransport.createLinkedPair();
    await server.connect(a);
    await client.connect(b);
    const invalidCalls = [
      { name: "search_notes", arguments: { query: "x", limit: 21 } },
      { name: "search_notes", arguments: { query: "x", userId: 99 } },
      { name: "get_note", arguments: { id: "not-a-uuid" } },
      { name: "get_note", arguments: { id: ID, userId: 99 } },
    ];
    for (const call of invalidCalls) {
      let failed = false;
      try {
        failed = (await client.callTool(call)).isError === true;
      } catch {
        failed = true;
      }
      expect(failed).toBe(true);
    }
    expect(searchNotes).not.toHaveBeenCalled();
    expect(getNote).not.toHaveBeenCalled();
    await client.close();
    await server.close();
  });

  test("truncates long note content at 20,000 characters and flags it", async () => {
    const server = createMcpServer({
      service: { searchNotes: async () => [], getNote: async () => ({ ...detail, content: "n".repeat(20_500) }) },
      userId: OWNER,
    });
    const client = new Client({ name: "mcp-test", version: "1.0.0" });
    const [a, b] = InMemoryTransport.createLinkedPair();
    await server.connect(a);
    await client.connect(b);
    const result = await client.callTool({ name: "get_note", arguments: { id: ID } });
    const structured = result.structuredContent as { content: string; truncated: boolean };
    expect(structured.content).toHaveLength(20_000);
    expect(structured.truncated).toBe(true);
    await client.close();
    await server.close();
  });

  test("gets only an active note for the requested owner and selects no private metadata", async () => {
    const calls: unknown[] = [];
    const service = createNotesService({ note: {
      findFirst: async (args: unknown) => { calls.push(args); return detail; },
    } } as never);
    await service.getNote(OWNER, ID);
    const query = calls[0] as { where: Record<string, unknown>; select: Record<string, unknown> };
    expect(query.where).toEqual({ id: ID, userId: OWNER, trashedAt: null });
    expect(query.select).toHaveProperty("content", true);
    expect(query.select).not.toHaveProperty("metadata");
    expect(query.select).not.toHaveProperty("isPublic");
  });

  test("replaces database errors with a sanitized service error", async () => {
    const databaseError = Object.assign(new Error("postgres://secret"), { code: "ECONNREFUSED" });
    const broken = createNotesService({ note: { findMany: async () => { throw databaseError; } } } as never);
    await expect(broken.searchNotes(OWNER, { query: "x" })).rejects.toMatchObject({
      code: "UNAVAILABLE",
      message: "Notes could not be searched right now.",
    });
  });

  test("does not convert programming errors into an indistinguishable database failure", async () => {
    const bug = new TypeError("bad application state");
    const broken = createNotesService({ note: { findMany: async () => { throw bug; } } } as never);
    await expect(broken.searchNotes(OWNER, { query: "x" })).rejects.toBe(bug);
  });
});

describe("MCP tools", () => {
  test("discovers exactly two read-only tools and calls a note tool over the SDK transport", async () => {
    const { service } = makeService();
    const server = createMcpServer({ service, userId: OWNER });
    const client = new Client({ name: "mcp-test", version: "1.0.0" });
    const [serverTransport, clientTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    await client.connect(clientTransport);
    const listed = await client.listTools();
    expect(listed.tools.map((tool) => tool.name).sort()).toEqual(["get_note", "search_notes"]);
    expect(listed.tools.every((tool) => tool.annotations?.readOnlyHint === true && tool.annotations?.destructiveHint === false)).toBe(true);
    const called = await client.callTool({ name: "get_note", arguments: { id: ID } });
    expect(called.structuredContent).toMatchObject({ id: ID, content: "Full note content", truncated: false });
    await client.close();
    await server.close();
  });

  test("returns sanitized errors for service and unexpected errors", async () => {
    const badService = {
      searchNotes: async () => { throw new Error("postgres://secret"); },
      getNote: async () => detail,
    };
    const server = createMcpServer({ service: badService, userId: OWNER });
    const client = new Client({ name: "mcp-test", version: "1.0.0" });
    const [a, b] = InMemoryTransport.createLinkedPair();
    await server.connect(a);
    await client.connect(b);
    const writeSpy = jest.spyOn(process.stderr, "write").mockImplementation(() => true);
    const result = await client.callTool({ name: "search_notes", arguments: { query: "x" } });
    expect(result.isError).toBe(true);
    expect(JSON.stringify(result)).not.toContain("postgres://secret");
    expect(result.content).toEqual([{ type: "text", text: "Notes service failed. Please try again." }]);
    expect(writeSpy.mock.calls.map(([message]) => String(message)).join("")).toBe("Second Brain MCP tool failed.\n");
    writeSpy.mockRestore();
    await client.close();
    await server.close();
  });
});

describe("physical MCP stdio transport", () => {
  test("spawns a fixture process and exchanges MCP tool messages over its pipes", async () => {
    const fixture = fileURLToPath(new URL("../test-fixtures/stdio-fake-server.mjs", import.meta.url));
    const serverModule = pathToFileURL(resolve(process.cwd(), "dist/src/mcp/server.js")).href;
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [fixture, serverModule],
      cwd: process.cwd(),
      stderr: "pipe",
    });
    let stderr = "";
    transport.stderr?.on("data", (data: Buffer) => { stderr += data.toString("utf8"); });
    const client = new Client({ name: "stdio-process-test", version: "1.0.0" }, {
      versionNegotiation: { mode: { pin: "2026-07-28" } },
    });
    try {
      await client.connect(transport);
      expect(client.getProtocolEra()).toBe("modern");
      const tools = await client.listTools();
      expect(tools.tools.map((tool) => tool.name).sort()).toEqual(["get_note", "search_notes"]);
      const result = await client.callTool({ name: "get_note", arguments: { id: ID } });
      expect(result.structuredContent).toMatchObject({ title: "stdio fixture", content: "fixture note body" });
    } finally {
      await client.close();
    }
    expect(stderr).toBe("");
  });

  test("the real stdio entry reports missing owner configuration only on stderr", async () => {
    const child = spawn(process.execPath, ["dist/src/mcp/stdio.js"], {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: "", MCP_OWNER_USER_ID: "", DOTENV_CONFIG_PATH: "/dev/null" },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8").on("data", (data: string) => { stdout += data; });
    child.stderr.setEncoding("utf8").on("data", (data: string) => { stderr += data; });
    const exitCode = await new Promise<number | null>((resolveExit, reject) => {
      child.once("error", reject);
      child.once("close", resolveExit);
    });
    expect(exitCode).toBe(1);
    expect(stdout).toBe("");
    expect(stderr).toContain("MCP stdio server could not start");
    expect(stderr).not.toContain("DATABASE_URL=");
  });
});

describe("private stateless HTTP endpoint", () => {
  const apiKey = "a".repeat(40);
  const config = { userId: OWNER, apiKey, allowedOrigins: ["https://client.example"], allowedHosts: ["127.0.0.1"] };

  test("validates enabled configuration without exposing credentials", () => {
    expect(readMcpHttpConfig({ MCP_ENABLED: "false" })).toBeUndefined();
    expect(() => readMcpHttpConfig({ MCP_ENABLED: "true", MCP_OWNER_USER_ID: "1", MCP_API_KEY: "short" })).toThrow(/MCP_API_KEY/);
    expect(() => readMcpHttpConfig({ MCP_ENABLED: "true", MCP_OWNER_USER_ID: "1", MCP_API_KEY: "has space and" + "a".repeat(32) })).toThrow(/MCP_API_KEY/);
    expect(readMcpHttpConfig({ MCP_ENABLED: "true", MCP_OWNER_USER_ID: "2", MCP_API_KEY: apiKey })).toMatchObject({
      userId: 2,
      allowedHosts: ["localhost", "127.0.0.1", "[::1]"],
    });
  });

  function appFor(configArg = config) {
    const { service } = makeService();
    const app = express();
    app.use("/mcp", createMcpHttpRouter({ config: configArg, service }));
    return app;
  }

  test("requires bearer credentials, rejects disallowed origins and methods", async () => {
    const app = appFor();
    await request(app).post("/mcp").set("Host", "127.0.0.1").send({}).expect(401);
    await request(app).post("/mcp").set("Host", "127.0.0.1").set("Authorization", `Bearer ${"b".repeat(40)}`).send({}).expect(401);
    await request(app).post("/mcp").set("Host", "127.0.0.1").set("Authorization", `Bearer ${apiKey}`).set("Origin", "https://evil.example").send({}).expect(403);
    await request(app).get("/mcp").set("Host", "127.0.0.1").set("Authorization", `Bearer ${apiKey}`).expect(405);
  });

  test("answers allowed browser preflights without a token and rejects untrusted preflights", async () => {
    const app = appFor();
    const allowed = await request(app).options("/mcp").set("Host", "127.0.0.1")
      .set("Origin", "https://client.example").set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "authorization,content-type").expect(204);
    expect(allowed.headers["access-control-allow-origin"]).toBe("https://client.example");
    expect(allowed.headers["access-control-allow-methods"]).toBe("POST");
    expect(allowed.headers["access-control-allow-headers"]).toContain("Mcp-Method");
    expect(allowed.headers["access-control-allow-headers"]).toContain("Mcp-Name");
    await request(app).options("/mcp").set("Host", "127.0.0.1").set("Origin", "https://evil.example")
      .set("Access-Control-Request-Method", "POST").expect(403);
  });

  test("serves initialize and tools/list over authenticated JSON-RPC", async () => {
    const app = appFor();
    const headers = {
      Host: "127.0.0.1", Authorization: `Bearer ${apiKey}`, Origin: "https://client.example",
      Accept: "application/json, text/event-stream",
    };
    const initialized = await request(app).post("/mcp").set(headers).send({
      jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "test", version: "1" } },
    }).expect(200);
    expect((responseResult(initialized, 1).serverInfo as { name: string }).name).toBe("second-brain");
    const listed = await request(app).post("/mcp").set(headers).send({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }).expect(200);
    expect((responseResult(listed, 2).tools as Array<{ name: string }>).map((tool) => tool.name).sort()).toEqual(["get_note", "search_notes"]);
    const called = await request(app).post("/mcp").set(headers).send({
      jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "get_note", arguments: { id: ID } },
    }).expect(200);
    expect(responseResult(called, 3).structuredContent).toMatchObject({ id: ID, content: "Full note content", truncated: false });
  });

  test("returns generic errors for malformed or oversized JSON", async () => {
    const app = appFor();
    const headers = { Host: "127.0.0.1", Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };
    const malformed = await request(app).post("/mcp").set(headers).send("{broken").expect(400);
    expect(malformed.body).toEqual({ error: "Invalid JSON request" });
    const oversized = await request(app).post("/mcp").set(headers).send(Buffer.alloc(256 * 1024 + 1, 32)).expect(413);
    expect(oversized.body).toEqual({ error: "Request too large" });
  });

  test("applies the per-IP rate limit", async () => {
    const app = appFor();
    const headers = {
      Host: "127.0.0.1", Authorization: `Bearer ${apiKey}`, Accept: "application/json, text/event-stream",
    };
    for (let index = 0; index < 60; index += 1) {
      await request(app).post("/mcp").set(headers).send({ jsonrpc: "2.0", id: index + 1, method: "ping" }).expect(200);
    }
    const limited = await request(app).post("/mcp").set(headers).send({ jsonrpc: "2.0", id: 61, method: "ping" }).expect(429);
    expect(limited.body).toEqual({ error: "Too many requests" });
  });

  test("works with an SDK Streamable HTTP client over a loopback server", async () => {
    const server = createServer(appFor());
    await new Promise<void>((resolveListen, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolveListen);
    });
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Test HTTP listener did not bind.");
    const transport = new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${address.port}/mcp`), {
      requestInit: { headers: { Authorization: `Bearer ${apiKey}`, Origin: "https://client.example" } },
    });
    const client = new Client({ name: "http-sdk-test", version: "1.0.0" }, {
      versionNegotiation: { mode: { pin: "2026-07-28" } },
    });
    try {
      await client.connect(transport);
      expect(client.getProtocolEra()).toBe("modern");
      const listed = await client.listTools();
      expect(listed.tools.map((tool) => tool.name).sort()).toEqual(["get_note", "search_notes"]);
      const result = await client.callTool({ name: "get_note", arguments: { id: ID } });
      expect(result.structuredContent).toMatchObject({ id: ID, content: "Full note content" });
    } finally {
      await client.close();
      await new Promise<void>((resolveClose) => server.close(() => resolveClose()));
    }
  });
});
