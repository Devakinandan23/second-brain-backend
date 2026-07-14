import express from 'express';
import cors from 'cors'
import { prisma } from './lib/prisma.js';
import jwt from 'jsonwebtoken';
import { userSchema } from './schema/user.schema.js';
import { authRoutes } from './routes/v1/auth.routes.js';
import { noteRoutes } from './routes/v1/note.routes.js';
import { trashRoutes } from './routes/v1/trash.routes.js';
import { brainRoutes } from './routes/v1/brain.routes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Second Brain Backend is running!");
});

app.use("/api/v1",authRoutes);
app.use("/api/v1/content",noteRoutes);
app.use("/api/v1/brain",brainRoutes);
app.use("/api/v1/trash",trashRoutes);


app.listen(3001, "0.0.0.0", () => {
    console.log("Backend server is running on port 3001");
});