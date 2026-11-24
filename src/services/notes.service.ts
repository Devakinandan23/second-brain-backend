import { Prisma, type PrismaClient } from "../../generated/prisma/client.js";

export class NotesServiceError extends Error {
  constructor(
    public readonly code: "INVALID_INPUT" | "NOT_FOUND" | "UNAVAILABLE",
    message: string,
  ) {
    super(message);
    this.name = "NotesServiceError";
  }
}

export interface SearchNotesInput {
  query: string;
  limit?: number;
}

export type NoteSummary = {
  id: string;
  title: string;
  link: string | null;
  description: string | null;
  sourceType: string;
  updatedAt: Date;
  tags: Array<{ title: string }>;
};

export type NoteDetail = NoteSummary & { content: string | null };

export interface NotesService {
  searchNotes(userId: number, input: SearchNotesInput): Promise<NoteSummary[]>;
  getNote(userId: number, id: string): Promise<NoteDetail>;
}

type NotesPrisma = Pick<PrismaClient, "note">;

const summarySelect = {
  id: true,
  title: true,
  link: true,
  description: true,
  sourceType: true,
  updatedAt: true,
  tags: { select: { title: true } },
} satisfies Prisma.NoteSelect;

const detailSelect = {
  ...summarySelect,
  content: true,
} satisfies Prisma.NoteSelect;

function validateOwner(userId: number): void {
  if (!Number.isSafeInteger(userId) || userId < 1) {
    throw new NotesServiceError("INVALID_INPUT", "A valid owner is required.");
  }
}

function activeNotesWhere(userId: number): Prisma.NoteWhereInput {
  return { userId, trashedAt: null };
}

export async function listActiveNotes(prisma: NotesPrisma, userId: number) {
  validateOwner(userId);
  return prisma.note.findMany({
    where: activeNotesWhere(userId),
    include: { tags: true },
  });
}

function validateSearch(input: SearchNotesInput): { query: string; limit: number } {
  const query = input.query.trim();
  const limit = input.limit ?? 5;
  if (query.length < 1 || query.length > 200) {
    throw new NotesServiceError("INVALID_INPUT", "Query must contain 1 to 200 characters.");
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 20) {
    throw new NotesServiceError("INVALID_INPUT", "Limit must be an integer from 1 to 20.");
  }
  return { query, limit };
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isDatabaseFailure(error: unknown): boolean {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientUnknownRequestError ||
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientRustPanicError
  ) return true;
  if (typeof error !== "object" || error === null || !("code" in error) || typeof error.code !== "string") return false;
  return /^[0-9A-Z]{5}$/.test(error.code) || /^(?:ECONN|ETIMEDOUT|EHOSTUNREACH|ENETUNREACH)/.test(error.code);
}

function sanitizeDatabaseFailure(error: unknown, message: string): never {
  if (!isDatabaseFailure(error)) throw error;
  throw new NotesServiceError("UNAVAILABLE", message);
}

export function createNotesService(prisma: NotesPrisma): NotesService {
  return {
    async searchNotes(userId, input) {
      validateOwner(userId);
      const { query, limit } = validateSearch(input);
      const where = {
        ...activeNotesWhere(userId),
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { link: { contains: query, mode: "insensitive" } },
          { tags: { some: { title: { contains: query, mode: "insensitive" } } } },
        ],
      } satisfies Prisma.NoteWhereInput;

      try {
        return await prisma.note.findMany({
          where,
          take: limit,
          orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
          select: summarySelect,
        }) as NoteSummary[];
      } catch (error) {
        sanitizeDatabaseFailure(error, "Notes could not be searched right now.");
      }
    },

    async getNote(userId, id) {
      validateOwner(userId);
      if (!isUuid(id)) {
        throw new NotesServiceError("INVALID_INPUT", "A valid note ID is required.");
      }

      let note: NoteDetail | null;
      try {
        note = await prisma.note.findFirst({
          where: { id, userId, trashedAt: null },
          select: detailSelect,
        }) as NoteDetail | null;
      } catch (error) {
        sanitizeDatabaseFailure(error, "The note could not be loaded right now.");
      }
      if (!note) throw new NotesServiceError("NOT_FOUND", "Note not found.");
      return note;
    },
  };
}
