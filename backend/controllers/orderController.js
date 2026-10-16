const Order = require('../model/Order.model')
const Product = require('../model/Product.model')
const sendEmail = require('../util/sendMail')

// Create a new order with stock validation, decrement, and safety checks
const createOrder = async (req, res) => {
    const { items, totalAmount, address, paymentId } = req.body

    try {
        if (!items || items.length === 0 || !totalAmount || !address) {
            return res.status(400).json({
                message: "Invalid order data"
            })
        }

        // 1. Verify stock availability for all items before placing order
        for (const item of items) {
            const prod = await Product.findById(item.productId)
            if (!prod) {
                return res.status(404).json({
                    message: `Product with ID ${item.productId} was not found`
                })
            }
            if (prod.stock < item.qty) {
                return res.status(400).json({
                    message: `Insufficient stock for ${prod.pname}. Only ${prod.stock} left in stock.`
                })
            }
        }

        // 2. Decrement stock for each item
        for (const item of items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: -item.qty }
            })
        }

        // 3. Create the order
        const order = await Order.create({
            user: req.user._id,
            items,
            totalAmount,
            address,
            paymentId: paymentId || 'COD'
        })

        // 4. Send email confirmation
        try {
            await sendEmail(
                req.user.email,
                "Order Created - Buyez",
                `Hello ${req.user.name || 'Shopper'},\n\nYour order #${order._id} for ₹${totalAmount} has been placed successfully!\n\nDelivery address: ${address.street}, ${address.city}, ${address.postalcode}`
            )
        } catch (mailErr) {
            console.error("Non-fatal email send error:", mailErr)
        }

        return res.status(201).json({
            message: "Order created successfully",
            order
        })

    } catch (error) {
        console.error("Order creation error:", error)
        return res.status(500).json({
            message: "Error creating order",
            error: error.message
        })
    }
}

// Fetch orders for current logged in customer
const getOrderById = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('items.productId', 'pname price images')
            .sort({ createdAt: -1 })

        res.json(orders)
    } catch (error) {
        res.status(500).json({
            message: "Error fetching orders",
            error: error.message
        })
    }
}

// Fetch all store orders (Admin only)
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('user', 'name email')
            .populate('items.productId', 'pname price')
            .sort({ createdAt: -1 })

        res.json(orders)
    } catch (error) {
        res.status(500).json({
            message: "Error fetching orders",
            error: error.message
        })
    }
}

// Update order fulfillment status (Admin only)
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body
        const order = await Order.findById(req.params.id)
        if (order) {
            order.status = status
            await order.save()
            res.json({
                message: "Status updated successfully",
                order
            })
        } else {
            res.status(404).json({ message: "Order not found" })
        }
    } catch (error) {
        res.status(500).json({ message: "Error updating order status", error: error.message })
    }
}

module.exports = {
    createOrder,
    getOrderById,
    getOrders,
    updateOrderStatus
}