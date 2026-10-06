const Order = require('../model/Order.model')
const sendEmail = require('../util/sendMail')

//create a new order

const createOrder = async(req,res)=>{
    const{items,totalAmount,address} = req.body

    try {
        if(!items || items.length ===0 ||!totalAmount || !address){
            return res.status(400).json({
                message:"Invalid order data"
            })
        }else{
            const order= await Order.create({
                user:req.user._id,
                items,
                totalAmount,
                address,
                paymentId
            })
            await sendEmail(req.user.email,"Order created","Your order has been created successfully !")

            res.status(201).json({
                message:"order created successfully",
                order
            })
        }
    } catch (error) {
        res.status(500).json({
            message:"Error creating order"
        })
    }   
}


const getOrderById = async(req,res)=>{
   try {
    const orders = await Order.find({user:req.user._id}).populate('items.productId','name price')

    res.json(orders)
   } catch (error) {
    res.status(500).json({
        message:"Error fetching orders",
        error
    })
   }
}

const getOrders = async(req,res)=>{
    try {
        const orders = await Order.find({}).populate('userId','id name')
        res.json(orders)
    } catch (error) {
        res.status(500).json({
            message:"Error fetching orders",
            error
        })
    }
}

const updateOrderStatus = async(req,res)=>{
    try {
        const {status} = req.body
        const order = await Order.findById(req.params.id)
        if(order){
            order.status = status
            await order.save()
            res.json({
                message:"Status updated"
            })
        }else{
            res.status(404).json({message:"order not found"})
        }
    } catch (error) {
        res.status(500).json({message:"Error uodating order status",error})
    }
}

module.exports = {
    createOrder,
    getOrderById,
    getOrders,
    updateOrderStatus
}