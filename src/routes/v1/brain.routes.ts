import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { v4 as uuidv4, validate as isValidUUID } from 'uuid';
import { linkSchema } from "../../schema/note.schema.js";

export const brainRoutes = Router();

brainRoutes.get("/:shareLink",async(req,res)=>{
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

brainRoutes.post("/share",authMiddleware, async (req,res)=>{
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

