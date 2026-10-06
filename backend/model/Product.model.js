const mongoose  = require("mongoose")
const { applyTimestamps } = require("./User.model")

const productSchema = new mongoose.Schema({
    pname:{
        type:String,
        required:true
    },
    pdesc:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true   
    },
    category:{
        type: String,
        required:true
    },
    stock:{
        type:Number,
        required:true
    },
    images:[{
        type:String
    }],
    createdAt:{
        type:Date,
        default:Date.now
    },
    ratings:{
        type:Number,
        default:0
    },
    numreviews:{
        type:Number,
        default:0
    }

})

module.exports = mongoose.model("product",productSchema)