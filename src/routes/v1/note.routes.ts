import { Router } from "express";
import { contentSchema, contentUpdateSchema, linkSchema} from "../../schema/note.schema.js";
import { prisma } from "../../lib/prisma.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { v4 as uuidv4, validate as isValidUUID } from 'uuid';
import { extractMetadata } from "../../services/ingestion/extractMetadata.js";


export const noteRoutes = Router();

noteRoutes.get("/brain/:shareLink",async(req,res)=>{
    try{
    const {shareLink} = req.params;
    if(!shareLink){
        res.status(400).json({
            message: "share link not recived"
        })
        return
    }

    const shareLinkData = await prisma.shareLink.findUnique({
        where:{
            hash: shareLink,
            isActive: true
        },
        select: {
            user:{
                select:{
                        id: true,
                        username: true,
                        notes:{
                            where:{
                                isPublic: true
                            },
                            select:{
                                title: true,
                                link: true,
                                content: true,
                                description: true,
                                thumbnail: true
                            }
                        }
                    },
                },
        }
    })
    console.log("shareLinkData",JSON.stringify(shareLinkData,null,2));

    if(!shareLinkData || !shareLinkData?.user){
        return res.status(400).json({
            message: "ShareLink not Found"
        })
    }

    res.status(200).json({
        username: shareLinkData.user.username,
        content: shareLinkData.user.notes
    })
    }catch(error){
        return res.status(500).json({
            message: "internal server error"
        })
    }
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
    console.log("Meta&&",new_content);
    const extractedData = await extractMetadata(parsedData.data.link);
    if(!extractedData){
        res.status(400).json({
            message: "error while extracting data"
        })
        return
    }
    if(!extractedData.title){
        res.status(400).json({
            message: "error while extracting title"
        })
        return
    }
    console.log("Meta&&&",new_content);
    // console.log("Meta&&&", JSON.stringify(extractMetadata(parsedData.data.link), null, 2));

    const content = await prisma.note.create({
        data: {
            sourceType:extractedData.sourceType,
            link: parsedData.data.link ?? null,
            title: parsedData.data.title ?? extractedData.title,
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
    console.log("&^&%&^%&^",content);
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

noteRoutes.patch("/content/:id", authMiddleware,async (req,res)=>{
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

    const result = await prisma.note.updateMany({
        where:{
            id: noteId,
            userId: req.userId
        },
        data: updateData
    })

    if (result.count === 0) {
        res.status(404).json({
            message: "Content not found or unauthorized"
        })
        return
    }

    res.status(200).json({
        message: "content successfully updated"
    })
})

noteRoutes.post("/brain/share",authMiddleware, async (req,res)=>{
    try{
    const parsedData = linkSchema.safeParse(req.body);

    if(!parsedData.success){
        res.status(400).json({
            message: "error in input"
        })
        return
    }
    if(!req.userId){
        res.status(403).json({
            message: "not authorized"
        })
        return
    }

    const share = parsedData.data.share;

    let share_link = await prisma.shareLink.findUnique({
            where:{
                userId: req.userId
            },
            select:{
                isActive: true,
                hash: true
            }
        })
    
    if(!share_link && !share){
        res.status(400).json({
            message: "shareable link is not created yet"
        })
        return
    }
    
    if(share == false){
        if(share_link?.isActive == true){
            await prisma.shareLink.update({
                where:{
                    userId: req.userId
                },
                data:{
                    isActive: false,
                }
            })
        }

        res.status(200).json({
            isActive: false,
            link: null
        })
        return
    }else if(share == true){
        
        if(!share_link){
            const new_link: string = uuidv4();
            share_link = await prisma.shareLink.create({
                data:{
                    hash: new_link,
                    isActive : true,
                    userId : req.userId
                }
            })

            res.status(200).json({
                isActive: true,
                link: new_link
            })
            return
        }

        if(share_link.isActive == false){
            await prisma.shareLink.update({
                where:{
                    userId: req.userId
                },
                data:{
                    isActive: true
                }
            })
        }

        res.status(200).json({
            isActive: true,
            link: share_link.hash
        })
        return
    }
    return
    }catch(error){
        return res.status(500).json({
            message: "internal server error"
        })
    }
})

noteRoutes.delete("/content",authMiddleware, async (req,res)=>{
    try{
    const contentId = req.body.contentId;

    if(!contentId){
        res.status(403).json({
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

    await prisma.note.delete({
        where:{
            userId: req.userId,
            id: contentIdString
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

