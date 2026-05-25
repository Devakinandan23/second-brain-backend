import { Router } from "express";
import { contentSchema } from "../../schema/note.schema.js";
import { prisma } from "../../lib/prisma.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

export const noteRoutes = Router();

noteRoutes.get("/brain/:shareLink",(req,res)=>{

})

noteRoutes.get("/content",authMiddleware,async (req,res)=>{
    if(!req.userId){
        res.status(401).json({
            message: "unauthorized"
        })
        return
    }
    const content = await prisma.note.findMany({
        where: {
            userId: req.userId
        },
        include: {
            tags: true
        }
    });

    res.status(200).json({
        content
    });
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

    const content = await prisma.note.create({
        data: {
            sourceType: parsedData.data.sourceType,
            link: parsedData.data.link ?? null,
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
    res.status(200).json({
        message: "content successfully added"
    })
})

noteRoutes.post("/brain/share",(req,res)=>{

})

noteRoutes.delete("/content",authMiddleware, async (req,res)=>{
    try{
    const contentId = String(req.body.contentId);

    if(!contentId){
        res.status(403).json({
            message: "ID Incorrect"
        })
        return
    }

    if(!req.userId){
        res.status(401).json({
            message: "unauthorized"
        })
        return
    }

    await prisma.note.delete({
        where:{
            userId: req.userId,
            id: contentId
        },
        include:{
            tags: true
        }
    })
    res.status(200).json({
        message: "successfully deleted"
    })
    }catch(error){
        return res.status(500).json({
            message: "Internal Error",
            error: `${error}`
        })
    }
})

