const express = require("express")
const getAnalytics  = require("../controllers/analyticsController.js")
const admin = require("../middlewares/adminMiddleware.js")
const protect = require("../middlewares/authMiddleware.js")
const router = express.Router()

router.get("/",protect,admin,getAnalytics)

module.exports =  router

