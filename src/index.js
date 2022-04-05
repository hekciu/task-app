'use strict'

const express = require("express");
require("./db/mongoose.js");//we use it to make mongoose connect to the database
const app = express();
const port = process.env.PORT;
console.log(port);
const userRouter = require("./routers/user_router");
const taskRouter = require("./routers/task_router");


app.use(express.json());
app.use(userRouter);
app.use(taskRouter)

app.listen(port,function()
{
    console.log(`Server is up on port ${port}`);
})

//encryption => we can get original values back
//hash => it's algorithm is not reversable


