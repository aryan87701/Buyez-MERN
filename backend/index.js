const express = require("express")
const cors = require("cors")
const dotenv= require("dotenv")
const connectDB = require('./config/db.js')

dotenv.config()

connectDB()
const app = express();
app.use(cors())

app.get('/',(req,res)=>{
    res.send("Backend working")
})

const PORT = process.env.PORT

app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`)
})
