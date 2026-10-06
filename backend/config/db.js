const mongoose = require("mongoose")

const connectDB = async()=>{
    try {
       await mongoose.connect("mongodb://Aryan123:Aryan123@ac-wfh8ewk-shard-00-00.zxgoler.mongodb.net:27017,ac-wfh8ewk-shard-00-01.zxgoler.mongodb.net:27017,ac-wfh8ewk-shard-00-02.zxgoler.mongodb.net:27017/?ssl=true&replicaSet=atlas-4esddc-shard-0&authSource=admin&appName=Cluster0")
        console.log("Mongo db connected successfully !")
    } catch (error) {
        console.error("Db connection failed :",error.message)
        process.exit(1)
    }
}

module.exports = connectDB