import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { v4 as uuidv4, validate as isValidUUID } from 'uuid';
import { extractMetadata } from "../../services/ingestion/extractMetadata.js";

export const trashRoutes = Router();

trashRoutes.get("/",authMiddleware,async (req,res)=>{
    if(!req.userId){
        res.status(401).json({
            message: "unauthorized"
        })
        return
    }

    const content = await prisma.note.findMany({
        where: {
            userId: req.userId,
            trashedAt: {
                    not: null
                }
            },
        include:{
            tags: true
        }
        });

    res.status(200).json({
        content
    })
});

trashRoutes.patch("/:id/restore",authMiddleware,async (req,res)=>{
    const noteId = String(req.params.id);
    
    if(!noteId || !isValidUUID(noteId)){
        res.status(400).json({
            message: "Invalid noteId format. Must be a valid UUID."
        })
        return
    }
    
    if(!req.userId){
        res.status(401).json({
            message: "unauthorized"
        })
        return
    }
    await prisma.note.update({
        where: {
            id: noteId,
            userId: req.userId
        },
        data: {
            trashedAt: null
        }
    })
    res.status(200).json({
        message: "content successfully restored"
    })
})

trashRoutes.delete("/:id",authMiddleware, async (req, res)=>{
    try{
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

    await prisma.note.delete({
        where:{
            id: contentIdString,
        }
    })

    res.status(200).json({
        message: "deleted successfully"
    })
    }catch(error){
        return res.status(500).json({
            message: "Internal Error"
        })
    }
})




