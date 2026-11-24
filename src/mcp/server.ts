import { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod/v4";
import { NotesServiceError, type NoteDetail, type NoteSummary, type NotesService } from "../services/notes.service.js";

const summarySchema = z.object({
  id: z.string(),
  title: z.string(),
  link: z.string().nullable(),
  description: z.string().nullable(),
  sourceType: z.string(),
  updatedAt: z.string(),
  tags: z.array(z.object({ title: z.string() })),
});
const searchOutputSchema = z.object({ notes: z.array(summarySchema) });
const detailOutputSchema = summarySchema.extend({ content: z.string().nullable(), truncated: z.boolean() });

const SEARCH_DESCRIPTION = "Search your own active Second Brain notes by title, content, description, link, or tag. Returns short summaries.";
const GET_DESCRIPTION = "Read the full content of one of your own active Second Brain notes by UUID.";
const TEXT_LIMIT = 20_000;

function bounded(value: string | null, max: number): string | null {
  return value === null ? null : value.slice(0, max);
}

function summary(note: NoteSummary) {
  return {
    id: note.id,
    title: bounded(note.title, 300) ?? "",
    link: bounded(note.link, 2_000),
    description: bounded(note.description, 1_000),
    sourceType: note.sourceType.slice(0, 40),
    updatedAt: note.updatedAt.toISOString(),
    tags: note.tags.slice(0, 30).map((tag) => ({ title: tag.title.slice(0, 100) })),
  };
}

function toolError(error: NotesServiceError) {
  return {
    isError: true,
    content: [{ type: "text" as const, text: error.message }],
  };
}

function unexpectedToolError() {
  // Do not put exception details on the MCP channel: adapter errors may contain SQL or credentials.
  process.stderr.write("Second Brain MCP tool failed.\n");
  return {
    isError: true,
    content: [{ type: "text" as const, text: "Notes service failed. Please try again." }],
  };
}

export function createMcpServer({ service, userId }: { service: NotesService; userId: number }): McpServer {
  const server = new McpServer({ name: "second-brain", version: "1.0.0" }, { capabilities: { tools: {} } });

  server.registerTool("search_notes", {
    title: "Search notes",
    description: SEARCH_DESCRIPTION,
    inputSchema: z.object({
      query: z.string().trim().min(1).max(200),
      limit: z.number().int().min(1).max(20).default(5),
    }).strict(),
    outputSchema: searchOutputSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  }, async ({ query, limit }) => {
    try {
      const notes = await service.searchNotes(userId, { query, limit });
      const result = { notes: notes.map(summary) };
      return { structuredContent: result, content: [{ type: "text", text: JSON.stringify(result) }] };
    } catch (error) {
      if (error instanceof NotesServiceError) return toolError(error);
      return unexpectedToolError();
    }
  });

  server.registerTool("get_note", {
    title: "Get note",
    description: GET_DESCRIPTION,
    inputSchema: z.object({ id: z.string().uuid() }).strict(),
    outputSchema: detailOutputSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  }, async ({ id }) => {
    try {
      const note: NoteDetail = await service.getNote(userId, id);
      const content = bounded(note.content, TEXT_LIMIT);
      const result = { ...summary(note), content, truncated: (note.content?.length ?? 0) > TEXT_LIMIT };
      return { structuredContent: result, content: [{ type: "text", text: JSON.stringify(result) }] };
    } catch (error) {
      if (error instanceof NotesServiceError) return toolError(error);
      return unexpectedToolError();
    }
  });

  return server;
}
