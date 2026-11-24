import { serveStdio } from "@modelcontextprotocol/server/stdio";

const { createMcpServer } = await import(process.argv[2]);
const note = {
  id: "93a54bac-0a5d-4ee0-96a2-d4ac9ca54812",
  title: "stdio fixture",
  link: null,
  description: null,
  sourceType: "INTERNAL",
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  tags: [],
  content: "fixture note body",
};
const service = {
  searchNotes: async () => [note],
  getNote: async () => note,
};

serveStdio(() => createMcpServer({ service, userId: 1 }), {
  legacy: "serve",
  onerror: () => process.stderr.write("MCP fixture transport error.\n"),
});
