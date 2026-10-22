const Order = require('../model/Order.model');
const Product = require('../model/Product.model');
const sendEmail = require('../util/sendMail');

const FREE_SHIPPING_THRESHOLD = 999;
const STANDARD_SHIPPING_FEE = 99;
const ALLOWED_STATUSES = ['pending', 'shipped', 'delivered'];

// Create a new order with authoritative server-side price & stock validation, atomic decrements, and inventory rollback
const createOrder = async (req, res) => {
    const { items, address, paymentId } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            message: "Order items list must be a non-empty array"
        });
    }

    if (!address || typeof address !== 'object') {
        return res.status(400).json({
            message: "Delivery address is required"
        });
    }

    // Validate required address fields (allowing street/address and postalcode/postalCode)
    const street = address.street || address.address;
    const city = address.city;
    const postalcode = address.postalcode || address.postalCode;
    const country = address.country || "India";
    const fullName = address.fullName || req.user.name || "Customer";

    if (!street || !city || !postalcode) {
        return res.status(400).json({
            message: "Address, city, and postal code are required"
        });
    }

    const validatedItems = [];
    const decrementedProducts = [];
    let subtotal = 0;

    try {
        // 1. Fetch authoritative product details and validate stock
        for (const item of items) {
            const targetId = item.productId || item.product || item._id;
            const targetQty = Number(item.qty || item.quantity);

            if (!targetId) {
                return res.status(400).json({
                    message: "Each order item must specify a valid product ID"
                });
            }

            if (!targetQty || targetQty <= 0 || !Number.isInteger(targetQty)) {
                return res.status(400).json({
                    message: `Invalid quantity for product ${targetId}`
                });
            }

            const dbProduct = await Product.findById(targetId);
            if (!dbProduct) {
                return res.status(404).json({
                    message: `Product ${targetId} was not found`
                });
            }

            if (dbProduct.stock < targetQty) {
                return res.status(400).json({
                    message: `Insufficient stock for ${dbProduct.pname || 'product'}. Available: ${dbProduct.stock}, requested: ${targetQty}`
                });
            }

            // Authoritative server-side price from MongoDB
            const unitPrice = Number(dbProduct.price);
            subtotal += unitPrice * targetQty;

            validatedItems.push({
                productId: dbProduct._id,
                qty: targetQty,
                price: unitPrice
            });
        }

        // 2. Decrement stock conditionally
        for (const vItem of validatedItems) {
            const updated = await Product.findOneAndUpdate(
                { _id: vItem.productId, stock: { $gte: vItem.qty } },
                { $inc: { stock: -vItem.qty } },
                { new: true }
            );

            if (!updated) {
                throw new Error(`Stock race condition: insufficient inventory for product ${vItem.productId}`);
            }

            decrementedProducts.push({
                productId: vItem.productId,
                qty: vItem.qty
            });
        }

        // 3. Authoritative server-side shipping calculation
        const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
        const totalAmount = subtotal + shippingFee;

        // 4. Create the order record
        const order = await Order.create({
            user: req.user._id,
            items: validatedItems,
            totalAmount,
            address: {
                fullName,
                street,
                city,
                postalcode,
                country
            },
            paymentId: paymentId || 'COD',
            status: 'pending'
        });

        // 5. Send email confirmation (non-fatal)
        try {
            await sendEmail(
                req.user.email,
                "Order Created - Buyez",
                `Hello ${req.user.name || 'Shopper'},\n\nYour order #${order._id} for ₹${totalAmount} has been placed successfully!\n\nDelivery address: ${street}, ${city}, ${postalcode}`
            );
        } catch (mailErr) {
            console.error("Non-fatal email confirmation error:", mailErr.message);
        }

        return res.status(201).json({
            message: "Order created successfully",
            order
        });

    } catch (error) {
        // Compensating Rollback: restore any previously decremented stock
        for (const item of decrementedProducts) {
            try {
                await Product.findByIdAndUpdate(item.productId, {
                    $inc: { stock: item.qty }
                });
            } catch (rollbackErr) {
                console.error(`Rollback failure for product ${item.productId}:`, rollbackErr.message);
            }
        }

        console.error("Order creation error:", error.message);
        return res.status(500).json({
            message: "Error creating order",
            error: error.message
        });
    }
};

// Fetch orders for current logged-in customer
const getOrderById = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('items.productId', 'pname price images')
            .sort({ createdAt: -1 });

        return res.json(orders);
    } catch (error) {
        return res.status(500).json({
            message: "Error fetching customer orders",
            error: error.message
        });
    }
};

// Fetch all store orders (Admin only)
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('user', 'name email')
            .populate('items.productId', 'pname price')
            .sort({ createdAt: -1 });

        return res.json(orders);
    } catch (error) {
        return res.status(500).json({
            message: "Error fetching store orders",
            error: error.message
        });
    }
};

// Update order fulfillment status (Admin only)
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !ALLOWED_STATUSES.includes(status.toLowerCase())) {
            return res.status(400).json({
                message: `Invalid order status. Allowed: ${ALLOWED_STATUSES.join(', ')}`
            });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        order.status = status.toLowerCase();
        await order.save();

        return res.json({
            message: "Status updated successfully",
            order
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error updating order status",
            error: error.message
        });
    }
};

module.exports = {
    createOrder,
    getOrderById,
    getOrders,
    updateOrderStatus
};
