'use strict'

const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const authMiddleware = require("../middleware/authentication")
const auth = require("../middleware/authentication");
// const { application } = require("express");
const multer = require("multer");
const sharp = require("sharp");

router.post("/users", async (req,res)=>{
    const user = new User(req.body);
    try{
        const resultUser = await user.save();
        const token = await resultUser.generateAuthToken();

        res.status(201).send({
            user: resultUser,
            token
        })
    }catch(e){
        console.log("Something went wrong...");
        console.log(e);
        res.status(400).send(e)
    }
    // user.save().then((result)=>{
    //     res.send(result)
    // }).catch((error)=>{
    //     console.log("Something went wrong..");
    //     res.status(400).send(error)
    // })
})

router.post("/users/login",async (req,res)=>{
    try{
        const resultUser = await User.findByCredentials(req.body.email,req.body.password);
        const token = await resultUser.generateAuthToken();
        res.send({
            user: resultUser.getPublicProfile(),
            token
        })
    }catch(e){

        res.status(400).send(e)
    }
})

router.post("/users/logout",auth,async (req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !==  req.token
        })
        await req.user.save();

        res.send()
    }catch(e){
        res.status(500).send();
    }
})

router.post("/users/logoutAll",auth,async (req,res)=>{
    try{
        req.user.tokens = [];
        await req.user.save();
        res.send();
    }catch(e){
        res.status(500).send(e)
    }
})

router.get("/users/me",authMiddleware,async (req,res)=>{
    res.send(req.user)
})

router.patch("/users/me",auth,async (req,res)=>{
    const updates = Object.keys(req.body);
    const allowedUpdates = ["email","password","age","name"];
    const isValidOperation = updates.every((el)=>{
        return allowedUpdates.includes(el);
    })
    if(!isValidOperation){
        return res.status(400).send({
            error: "Invalid updates"
        })
    }
    try{
        // const user = await User.findByIdAndUpdate(req.params.id,req.body,{ //it bypasses middleware functions
        //     new: true,
        //     runValidators: true
        // });

        const user = req.user;
        
        updates.forEach((update)=>{
            user[update] = req.body[update];
        })
        await user.save();

        res.send(user)
    }catch(e){
        res.status(400).send(e);
    }
})

router.delete("/users/me",auth,async (req,res)=>{
    try{
        // const user = await User.findByIdAndDelete(req.params.id);
        // if(!user)
        // {
        //     return res.status(404).send({error:"Couldn't find user"});
        // }    
        await req.user.remove();
        res.send(req.user)
    }catch(e){
        res.status(500).send(e);
    }
})

//avatar uploads 

const upload = multer({
    // dest: "avatars",
    limits: {
        fileSize: 1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            cb(new Error("Please upload an image, only jpg, jpeg and png files are supported"))
        }
        cb(undefined,true)
    }
})

router.post("/users/me/avatar", auth, upload.single("avatar"), async (req,res)=>{
    const modifiedBuffer = await sharp(req.file.buffer).resize({
        width: 250,
        height: 250
    }).png().toBuffer()
    req.user.avatar = modifiedBuffer
    await req.user.save();
    res.send()
},(e,req,res,next)=>{
    res.status(400).send({
        error: e.message
    })
})

router.delete("/users/me/avatar",auth , async (req,res)=>{
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
},(e,req,res,next)=>{
    res.status(400).send({
        error: e.message
    })
})

router.get("/users/:id/avatar", async (req,res)=>{
    try{
        const user = await User.findById(req.params.id);
        if(!user || !user.avatar){
            throw new Error("Can't find user's profile picture")
        }

        res.set("Content-Type", "image/png");
        res.send(user.avatar)
    }catch(e){
        res.status(404).send({
            error: e.message
        })
    }
})
module.exports = router;