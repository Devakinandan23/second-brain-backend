import { Router } from "express";
import { contentSchema, linkSchema } from "../../schema/note.schema.js";
import { prisma } from "../../lib/prisma.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { v4 as uuidv4 } from 'uuid';

export const noteRoutes = Router();

noteRoutes.get("/brain/:shareLink",async(req,res)=>{
    const {shareLink} = req.params;
    if(!shareLink){
        res.status(400).json({
            message: "share link not recived"
        })
        return
    }
    const posts = await prisma.note.findMany({
        where:{
            user: {
                shareLink:{
                    hash: shareLink
                }
            }
        }
    });
    console.log("posts",posts);
    res.status(200).json({
        posts: posts
    })
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

