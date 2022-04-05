'use strict'

const mongoose = require("mongoose")

const connectionURL = process.env.MONGODB_URL;
// console.log(connectionURL);
mongoose.connect(connectionURL,{
    useNewUrlParser: true
}).then((result)=>{
    console.log("Connected well");
}).catch((error)=>{
    console.log(error);
})


