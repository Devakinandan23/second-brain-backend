import { Router } from "express";
import jwt from 'jsonwebtoken';
import { prisma } from "../../lib/prisma.js";
import { userSchema } from "../../schema/user.schema.js";

export const authRoutes = Router();

authRoutes.post("/signup",async (req,res)=>{
    try{
    const parsedData = userSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(411).json({
            message: "Error in input"
        })
        return
    }

    const username = parsedData.data.username;
    const password = parsedData.data.password;

    const check_user = await prisma.user.findUnique({
        where: {username: username}
    });
    if(check_user){
        res.status(403).json({
            message: "User already exist with this username"
        })
        return
    }

    await prisma.user.create({
        data:{
            username: username,
            password: password  
        }
    })
    res.status(200).json({
        message: "Signed Up"
    })

    }catch(error){
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
})

authRoutes.post("/signup",async (req,res)=>{

})






