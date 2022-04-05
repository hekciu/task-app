'use strict'

const validator = require("validator");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const Task = require("./task")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        default: 19,
        validate(value)
        {
            if(value > 18) return true;
            throw new Error("Users must be at least eighteen years old!")
        },
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,//nice
        validate(value)
        {
            if(validator.isEmail(value)) return true;
            throw new Error("It's not an email!");
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate(value)
        {
            if(value.length < 6)
            {
                throw new Error("Password length must be greater than 6")
            }
            if(validator.contains(value.toLowerCase(),"password"))
            {
                throw new Error('Password cannot contain "password"')
            }
            return true;
        }
    },
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }],
    avatar:{
        type: Buffer
    }
},{
    timestamps: true
})

userSchema.methods.generateAuthToken = async function(){
    const token = jwt.sign({
        _id: this._id.toString()
    },process.env.JWT_SECRET);

    this.tokens = this.tokens.concat({
        token: token
    })

    await this.save();

    return token
}

userSchema.methods.getPublicProfile = function(){
    const userObject = this.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar
    console.log(userObject);

    return userObject;
}

userSchema.methods.toJSON = function(){
    const userObject = this.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    // console.log(userObject);

    return userObject;
}

userSchema.statics.findByCredentials = async function(email,password){
    const user = await User.findOne({
        email: email
    })

    if(!user) throw new Error("Unable to login");

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch) throw new Error("Unable to login");

    return user;
}

//hash password before saving
userSchema.pre("save",async function(next){
    //this -> user before it's saved
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,8);
    }
    next();
})

//delete user tasks when user is deleted
userSchema.pre("remove",async function(next){
    await Task.deleteMany({
        author: this._id
    })
    next();
})

//virtual relationship between user and his/her tasks

userSchema.virtual("tasks",{
    ref: "Task",
    localField: "_id",
    foreignField: "author"
})

const User = mongoose.model("User",userSchema)


module.exports = User;