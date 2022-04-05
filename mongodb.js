'use strict'

//CRUD create read update delete

// const mongoDB = require("mongodb");
// const MongoClient = mongoDB.MongoClient;
// const ObjectID = mongoDB.ObjectId;
const {MongoClient, ObjectID} = require("mongodb")

const connectionURL = "mongodb://127.0.0.1:27017"; 
const databaseName = "task-manager";

// const id = new ObjectID();
// console.log(id.id.length);
// console.log(id.toHexString().length);
// console.log(id.getTimestamp());

const showError = function(error)
{
    console.log("Something went wrong...");
    console.log(error);
}

MongoClient.connect(connectionURL,{ useNewUrlParser: true},(error,client) => {
    if(error)
    {
        console.log("Unable to connent to database...");
        console.log(error);
        return;
    }
    console.log("Connected correctly");
    const db = client.db(databaseName);//it gives us database reference(when it can't find it by name it creates one)
    //CREATE DATA -> insertOne(item,callback), insertMany([items],callback)
    //READING DATA -> find(),findOne() -> returns pointer, we can use for example toArray()
    //UPDATING DATA -> updateOne(), updateMany()
    //DELETING DATA -> deleteONe(), deleteMany()

    // db.collection("users").updateOne({
    //     _id: new ObjectID("6226769bcf5e43446a33fca1")
    // },{
    //     $set: {
    //         name: "Mike"
    //     }
    // }).then((result)=>{
    //     console.log(result);
    // }).catch((error)=>{
    //     console.log(error);
    // })
    // db.collection("users").updateOne({
    //     name: "Ewelina"
    // },{
    //     $inc:{
    //         age: 1
    //     }
    // }).then((result)=>{
    //     console.log(result);
    // }).catch((error)=>{
    //     console.log(error);
    // })

    // db.collection("tasks").updateMany({},{
    //     $set:{
    //         completed: true
    //     }
    // }).then((result)=>{
    //     console.log(result);
    // }).catch((error)=>{
    //     console.log(error);
    // })

    db.collection("users").deleteMany({name: "Jakub"}).then((result)=>{
        console.log(result);
    }).catch((error)=>{
        console.log(error);
    })

    db.collection("tasks").deleteOne({_id: new ObjectID("62277b5bdcb5bc2eb7f07861")}).then((result)=>{
        console.log(result);
    }).catch((error)=>{
        console.log(error);
    })
})