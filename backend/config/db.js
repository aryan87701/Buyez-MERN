const mongoose = require("mongoose")

const connectDB = async()=>{
    try {
       await mongoose.connect(process.env.MONGO_URI)
        console.log("Mongo db connected successfully !")
    } catch (error) {
        console.error("Db connection failed :",error.message)
        process.exit(1)
    }
}

module.exports = connectDB