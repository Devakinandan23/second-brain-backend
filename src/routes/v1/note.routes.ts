import { Router } from "express";
import { contentSchema, contentUpdateSchema} from "../../schema/note.schema.js";
import { prisma } from "../../lib/prisma.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { v4 as uuidv4, validate as isValidUUID } from 'uuid';
import { extractMetadata } from "../../services/ingestion/extractMetadata.js";


export const noteRoutes = Router();

noteRoutes.get("/", authMiddleware, async (req,res)=>{
    if(!req.userId){
        res.status(401).json({
            message: "unauthorized"
        })
        return
    }
    const content = await prisma.note.findMany({
        where: {
            userId: req.userId,
            trashedAt: null
        },
        include: {
            tags: true
        }
    });

    res.status(200).json({
        content
    });
})

noteRoutes.post("/", authMiddleware, async (req,res)=>{
    try{
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

    const new_content = JSON.stringify(await extractMetadata(parsedData.data.link),null,2);

    const extractedData = await extractMetadata(parsedData.data.link);
    if(!extractedData){
        res.status(400).json({
            message: "error while extracting data"
        })
        return
    }
    // if(!extractedData.title){
    //     res.status(400).json({
    //         message: "error while extracting title"
    //     })
    //     return
    // }

    console.log("Meta&&&", JSON.stringify(await extractMetadata(parsedData.data.link), null, 2));

    const content = await prisma.note.create({
        data: {
            sourceType:extractedData.sourceType,
            link: parsedData.data.link ?? null,
            title: extractedData.title ?? parsedData.data.title,
            extractedTitle: extractedData.title ?? null,
            content: parsedData.data.content ?? null,
            description: extractedData.description ?? null,
            thumbnail: extractedData.thumbnail ?? null,
            authorName: parsedData.data.authorName ?? null,        
            metadata: extractedData.metadata ? (extractedData.metadata as any) : undefined,
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
        message: "content successfully added",
        content
    })
    }catch(error){
        return res.status(400).json({
            error: `Error is ${error}`
        })
    }
})

noteRoutes.patch("/:id", authMiddleware, async (req,res)=>{
    const parsedData = contentUpdateSchema.safeParse(req.body);
    const noteId = String(req.params.id);

    if(!noteId || !isValidUUID(noteId)){
        res.status(400).json({
            message: "Invalid noteId format. Must be a valid UUID."
        })
        return
    }

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

    const updateData: Record<string, any> = {};

    if (parsedData.data.title !== undefined) {
        updateData.title = parsedData.data.title;
    }

    if (parsedData.data.extractedTitle !== undefined) {
        updateData.extractedTitle = parsedData.data.extractedTitle;
    }

    if (parsedData.data.content !== undefined) {
        updateData.content = parsedData.data.content;
    }

    if (parsedData.data.description !== undefined) {
        updateData.description = parsedData.data.description;
    }

    if (parsedData.data.link !== undefined) {
        updateData.link = parsedData.data.link;
    }

    if (parsedData.data.thumbnail !== undefined) {
        updateData.thumbnail = parsedData.data.thumbnail;
    }

    if (parsedData.data.authorName !== undefined) {
        updateData.authorName = parsedData.data.authorName;
    }


    if (parsedData.data.metadata !== undefined) {
        updateData.metadata = parsedData.data.metadata;
    }

    if (parsedData.data.isPublic !== undefined) {
        updateData.isPublic = parsedData.data.isPublic;
    }

    if (parsedData.data.isFavorite !== undefined) {
        updateData.isFavorite = parsedData.data.isFavorite;
    }

    if (parsedData.data.tags !== undefined && parsedData.data.tags !== null) {
        updateData.tags = {
            set: [],
            connectOrCreate: parsedData.data.tags.map((tag) => ({
                where: { title: tag },
                create: { title: tag },
            })),
        };
    }

    const existingNote = await prisma.note.findFirst({
        where: {
            id: noteId,
            userId: req.userId
        }
    });

    if (!existingNote) {
        res.status(404).json({
            message: "Content not found or unauthorized"
        })
        return
    }

    await prisma.note.update({
        where: { id: noteId },
        data: updateData
    });

    res.status(200).json({
        message: "content successfully updated"
    })
})

noteRoutes.delete("/:id", authMiddleware, async (req,res)=>{
    try{
    // const contentId = req.body.contentId;
    const contentId = req.params.id;

    if(!contentId){
        res.status(404).json({
            message: "ID Incorrect"
        })
        return
    }

    const contentIdString = String(contentId);

    if(!req.userId){
        res.status(401).json({
            message: "unauthorized"
        })
        return
    }

    await prisma.note.update({
        where:{
            id: contentIdString,
            userId: req.userId
        },
        data:{
            trashedAt: new Date()
        }
    })

    res.status(204).json({
        message: "No Content"
    })
    }catch(error){
        return res.status(500).json({
            message: "Internal Error",
            error: `${error}`
        })
    }
})

noteRoutes.get("/export", authMiddleware, async (req, res) => {
    if (!req.userId) {
        res.status(401).json({ message: "unauthorized" });
        return;
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { username: true }
        });

        const notes = await prisma.note.findMany({
            where: {
                userId: req.userId,
                trashedAt: null
            },
            //include title for tags
            include: {
                tags: {
                    select: { title: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        const entries = notes.map((note) => ({
            id: note.id,
            sourceType: note.sourceType,
            title: note.title,
            link: note.link ?? null,
            description: note.description ?? null,
            content: note.content ?? null,
            thumbnail: note.thumbnail ?? null,
            authorName: note.authorName ?? null,
            tags: note.tags.map((t) => t.title),
            isPublic: note.isPublic,
            isFavorite: note.isFavorite,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
        }));

        const payload = {
            exportedAt: new Date().toISOString(),
            version: "1.0",
            username: user?.username ?? "unknown",
            totalEntries: entries.length,
            entries,
        };

        const filename = `second-brain-export-${new Date().toISOString().slice(0, 10)}.json`;

        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.status(200).json(payload);
    } catch (error) {
        res.status(500).json({ message: "Internal Error", error: `${error}` });
    }
});
