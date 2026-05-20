import express from 'express';
import cors from 'cors'
import { prisma } from './lib/prisma.js';
import jwt from 'jsonwebtoken';
import { userSchema } from './schema/user.schema.js';
import { authRoutes } from './routes/v1/auth.routes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1",authRoutes);

app.get("/all", async (req,res)=>{
    const notes = await prisma.note.findMany();
})


app.listen(3000);