import { Router } from "express";
import jwt from 'jsonwebtoken';
import { prisma } from "../../lib/prisma.js";
import { userSchema } from "../../schema/user.schema.js";
import bcrypt from 'bcrypt';


export const authRoutes = Router();
const JWT_SECRET = process.env.JWT_SECRET!;

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

    const hashPassword = await bcrypt.hash(password,11);

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
            password: hashPassword  
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

authRoutes.post("/signin",async (req,res)=>{
    try{
    const parsedData = userSchema.safeParse(req.body);

    if(!parsedData.success){
        res.status(403).json({
            message: "wrong email/password please check"
        })
        return
    }

    const user = await prisma.user.findUnique({
        where:{
            username: parsedData.data.username
        }
    })

    if(!user){
        res.status(403).json({
            message: "username not found"
        })
        return
    }
    
    const checkPassword = await bcrypt.compare(parsedData.data.password,user.password);

    if(!checkPassword){
        res.status(403).json({
            message: "Wrong email password"
        })
        return
    }

    const token = jwt.sign({userId: user.id},JWT_SECRET,{expiresIn: '4hr'})

    res.json({
        token: token,
        username: parsedData.data.username
    })


    }catch(error){
        res.status(500).json({
            message: "Fail to generate token"
        })
    }
})








