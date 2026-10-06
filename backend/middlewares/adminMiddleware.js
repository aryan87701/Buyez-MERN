const admin  = (req,res,next) =>{
    if(req.user && req.user.role == 'admin'){
        next()
    }else{
        res.status(403).json({
            message:"User is not an admin"
        })
    }
}

module.exports = admin