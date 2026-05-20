import express from 'express';
import cors from 'cors';
import { prisma } from './lib/prisma.js';
import jwt from 'jsonwebtoken';
import { userSchema } from './schema/user.schema.js';
import { authRoutes } from './routes/v1/auth.routes.js';
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/v1", authRoutes);
app.post("/signup", async (req, res) => {
    try {
        const parsedData = userSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(411).json({
                message: "Error in input"
            });
            return;
        }
        const username = parsedData.data.username;
        const password = parsedData.data.password;
        const check_user = await prisma.user.findUnique({
            where: { username: username }
        });
        if (check_user) {
            res.status(403).json({
                message: "User already exist with this username"
            });
            return;
        }
        await prisma.user.create({
            data: {
                username: username,
                password: password
            }
        });
        res.status(200).json({
            message: "Signed Up"
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
});
app.post("/signup", async (req, res) => {
});
app.get("/all", async (req, res) => {
    const notes = await prisma.note.findMany();
});
app.listen(3000);
//# sourceMappingURL=index.js.map