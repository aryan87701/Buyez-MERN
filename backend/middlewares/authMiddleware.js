//this file checks, that the person fetching user details is already login or not, we will check this through token we have generated
const jwt = require("jsonwebtoken")
const User = require("../model/User.model.js")

const protect = async(req,res,next)=>{

    let token

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){         
        try {
            token = req.headers.authorization.split(' ')[1]

            const decoded = jwt.verify(token,process.env.JWT_SECRET)

            req.user= await User.findById(decoded.id).select('-password')

            next()

        } catch (error) {
            res.status(401).json({
                message:"Not authorized,token failed"
            })
        }
    }
    if(!token){
          res.status(401).json({
                message:"Not authorized,No token"
            })
    }
}

module.exports = protect