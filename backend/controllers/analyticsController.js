const User = require("../model/User.model.js")
const Order = require("../model/Order.model.js")
const Product = require("../model/Product.model.js")



const getAnalytics = async(req,res)=>{
    try {
        const userCount = await User.countDocuments({role:"user"})
        const productCount = await Product.countDocuments({})
        const orderCount = await Order.countDocuments({})

        const orders = await Order.find({})
        const totalRevenue = orders.reduce((acc,order)=>acc+order.totalAmount,0)

        res.json({
            userCount,
            productCount,
            orderCount,
            totalRevenue
        })
    } catch (error) {
        res.status(400).json({
            message:error.message
        })
    }
}

module.exports = getAnalytics