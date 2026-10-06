const express = require("express")
const protect = require('../middlewares/authMiddleware.js')
const admin = require('../middlewares/adminMiddleware.js')
const {getProducts,getProductbyId,createProduct,updateProduct,deleteProduct} = require("../controllers/productControllers.js")
const router = express.Router()

//to take file input we need multer

const multer = require("multer")
const upload = multer({dest:'uploads/'})


router.route('/').get(getProducts).post(protect,admin,upload.single('image'),createProduct)
router.route('/:id').get(getProductbyId).put(protect,admin,upload.single('image'),updateProduct).delete(protect,admin,deleteProduct)

module.exports = router