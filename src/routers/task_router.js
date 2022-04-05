'use strict'

const express = require("express");
const router = new express.Router();
const Task = require("../models/task");
const auth = require("../middleware/authentication")

router.post("/tasks",auth,async (req,res)=>{
    // const task = new Task(req.body);
    const task = new Task({
        ...req.body,
        author: req.user._id
    })
    try{
        const result = await task.save();
        res.status(201).send(result)
    }catch(e){
        res.status(400).send(e)
    }
    

    // task.save().then((result)=>{
    //     res.status(201).send(result);
    // }).catch((error)=>{
    //     res.status(400).send(error);
    // })
})

//GET /tasks?completed=false
//GET /tasks?limit=10&skip=0
//GET /tasks?sortBy=createdAt_asc
router.get("/tasks",auth,async (req,res)=>{
    const match = {};
    if(req.query.completed){
        match.completed = req.query.completed === "true"
    }

    const sort = {};

    if(req.query.sortBy){
        const parts = req.query.sortBy.split("_");
        sort[parts[0]] = parts[1] === "asc" ? 1 : -1;
    }
    try{
        ////one way
        // const tasks = await Task.find({
        //     author: req.user._id
        // })

        //another one
        await req.user.populate({
            path: "tasks",
            match,
            options: {
                limit: parseInt(req.query.limit),//mongoose automatically ignores NaN variables
                skip: parseInt(req.query.skip),
                sort
            }
        });
        const tasks = req.user.tasks;
        if(!tasks){
            return res.status(404).send("No tasks created or you are not authenticated to get them")
        }
        res.send(tasks)
    }catch(e){
        res.status(400).send(e)
    }
    // Task.find({}).then((tasks)=>{
    //     res.send(tasks)
    // }).catch((error)=>{
    //     re.status(400).send(error)
    // })
})

router.get("/tasks/:id",auth,async (req,res)=>{
    try{
        const task = await Task.findOne({
            _id: req.params.id,
            author: req.user._id
        })
        if(!task){
            return res.status(404).send("Couldn't find task or you're not autorized to get this one")
        } 
        res.send(task)
    }catch(e){
        res.status(400).send(e)
    }
    // Task.findById(req.params.id).then((task)=>{
    //     res.send(task)
    // }).catch((error)=>{
    //     res.status(400).send(error)
    // })
})

router.patch("/tasks/:id",auth,async (req,res)=>{
    const updates = Object.keys(req.body);
    const allowedUpdates = ["description","completed"];
    const isValidOperation = updates.every((el)=>{
        return allowedUpdates.includes(el)
    })
    if(!isValidOperation) return res.status(400).send({
        error: "Invalid updates"
    });
    try{
        // const task = await Task.findByIdAndUpdate(req.params.id,req.body,{
        //     new: true,
        //     runValidators: true
        // })

        const task = await Task.findOne({
            _id: req.params.id,
            author: req.user._id
        })

        if(!task){
            return res.status(404).send("Couldn't find task or you're not authorized to get this one")
        }

        updates.forEach((update)=>{
            task[update] = req.body[update]; 
        })
        await task.save();
        
        res.send(task)
    }catch(e){
        res.status(400).send(e)
    }
})

router.delete("/tasks/:id",auth,async (req,res)=>{
    try{
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            author: req.user._id
        });
        if(!task){
            return res.status(404).send({
                error: "Couldn't find task"
            })
        } 
        res.send(task);
    }catch(e){
        res.status(500).send(e);
    }
})

module.exports = router;