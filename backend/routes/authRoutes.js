const express = require("express")
const {registerUser,loginUser,getUser,verifyOtp,resendOtp} = require("../controllers/authControllers.js")
const router = express.Router()
const protect = require('../middlewares/authMiddleware.js')
const admin = require('../middlewares/adminMiddleware.js')


router.post('/register',registerUser)
router.post('/login',loginUser)
router.get('/users',protect,admin,getUser)   //protect and admin are middlewares
router.post('/verify-otp',protect,verifyOtp)   //protect and admin are middlewares
router.post('/resend-otp',protect,resendOtp)   //protect and admin are middlewares

module.exports = router