import { Router } from "express";
import { contentSchema } from "../../schema/note.schema.js";
import { prisma } from "../../lib/prisma.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

export const noteRoutes = Router();

noteRoutes.get("/brain/:shareLink",(req,res)=>{

})

noteRoutes.get("/content",(req,res)=>{
    
})

noteRoutes.post("/content", authMiddleware,async (req,res)=>{
    const parsedData = contentSchema.safeParse(req.body);

    if(!parsedData.success){
        res.status(403).json({
            message: "validation error"
        })
        return
    }

    if(!req.userId){
        res.status(401).json({
            message: "unauthorized"
        })
        return
    }

    await prisma.note.create({
        data: {
            sourceType: parsedData.data.sourceType,
            link: parsedData.data.link,
            title: parsedData.data.title,
            content: parsedData.data.content ?? null,
            description: parsedData.data.description ?? null,
            thumbnail: parsedData.data.thumbnail ?? null,
            authorName: parsedData.data.authorName ?? null,        
            metadata: parsedData.data.metadata ? (parsedData.data.metadata as any) : undefined,
            userId: req.userId,
            tags: {
                connectOrCreate: parsedData.data.tags.map((tag) => ({
                    where: {
                        title: tag,
                    },
                    create: {
                        title: tag,
                    },
                })),
            }
        }
    })
})

noteRoutes.post("/brain/share",(req,res)=>{

})

noteRoutes.delete("/content",(req,res)=>{

})

