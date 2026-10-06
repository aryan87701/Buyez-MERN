const express = require("express")
const cors = require("cors")
const dotenv= require("dotenv")
const connectDB = require('./config/db.js')

dotenv.config()

connectDB()
const app = express();
app.use(cors())
app.use(express.json())

app.use('/api/auth',require('./routes/authRoutes'))
app.use('/api/products',require('./routes/productRoutes'))
app.use('/api/orders',require('./routes/orderRoutes'))
// app.use('/api/payments',require('./routes/paymentRoutes'))
app.use('/api/analytics',require('./routes/analyticRoutes'))

app.get('/',(req,res)=>{
    res.send("Backend working")
})

const PORT = process.env.PORT

app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`)
})
