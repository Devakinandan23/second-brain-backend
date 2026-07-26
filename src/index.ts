import express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import { authRoutes } from './routes/v1/auth.routes.js';
import { noteRoutes } from './routes/v1/note.routes.js';
import { trashRoutes } from './routes/v1/trash.routes.js';
import { brainRoutes } from './routes/v1/brain.routes.js';

const app = express();
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";

app.use(cors({
    origin: frontendUrl,
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Second Brain Backend is running!");
});

app.use("/api/v1",authRoutes);
app.use("/api/v1/content",noteRoutes);
app.use("/api/v1/brain",brainRoutes);
app.use("/api/v1/trash",trashRoutes);


const port = Number(process.env.PORT ?? 3001);
app.listen(port, "0.0.0.0");
