const express = require("express")
const protect = require('../middlewares/authMiddleware.js')
const admin = require('../middlewares/adminMiddleware.js')
const {createOrder,getOrderById,getOrders,updateOrderStatus} = require("../controllers/orderController.js")
const router = express.Router()

router.route('/').post(protect,createOrder).get(protect,admin,getOrders)
router.route('/:id/status').put(protect,admin,updateOrderStatus)
router.route('/myOrders').get(protect,getOrderById)

module.exports = router
