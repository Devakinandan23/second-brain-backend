import express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import { authRoutes } from './routes/v1/auth.routes.js';
import { noteRoutes } from './routes/v1/note.routes.js';
import { trashRoutes } from './routes/v1/trash.routes.js';
import { brainRoutes } from './routes/v1/brain.routes.js';
import { prisma } from './lib/prisma.js';
import { createNotesService } from './services/notes.service.js';
import { createMcpHttpRouter, readMcpHttpConfig } from './mcp/http.js';

const app = express();
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";

// MCP has its own bearer authorization, origin policy, and bounded JSON parser.
// Mount it before the browser API middleware so those boundaries stay separate.
const mcpConfig = readMcpHttpConfig();
if (mcpConfig) {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is required when MCP_ENABLED=true.");
    }
    const owner = await prisma.user.findUnique({
        where: { id: mcpConfig.userId },
        select: { id: true },
    }).catch(() => {
        throw new Error("MCP owner could not be verified. Check database configuration.");
    });
    if (!owner) throw new Error("Configured MCP owner account was not found.");
    app.use("/mcp", createMcpHttpRouter({ config: mcpConfig, service: createNotesService(prisma) }));
}

app.use(cors({
    origin: frontendUrl,
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Second Brain Backend is running!");
});

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

app.get("/ready", async (_req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ status: "ready" });
    } catch {
        res.status(503).json({ status: "not ready" });
    }
});

app.use("/api/v1",authRoutes);
app.use("/api/v1/content",noteRoutes);
app.use("/api/v1/brain",brainRoutes);
app.use("/api/v1/trash",trashRoutes);


const port = Number(process.env.PORT ?? 3001);
const server = app.listen(port, "0.0.0.0");

let shuttingDown = false;
function shutdown(): void {
    if (shuttingDown) return;
    shuttingDown = true;
    const deadline = setTimeout(() => process.exit(1), 10_000);
    deadline.unref();
    server.close(() => {
        void prisma.$disconnect().finally(() => {
            clearTimeout(deadline);
        }).catch(() => {
            process.stderr.write("Database shutdown failed.\n");
            process.exitCode = 1;
        });
    });
    server.closeIdleConnections();
}
process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);
