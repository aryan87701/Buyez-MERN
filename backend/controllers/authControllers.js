const User = require("../model/User.model.js")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const sendEmail = require("../util/sendMail.js")                                     
//we generate token to store in local browser of user ..so that they dont have to sign up again and again
const generateToken = (id) =>{
    return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:'7d'})
}


//Register function

const registerUser = async(req,res)=>{

    //taking data from website
    const{name,email,password}=req.body

    try {

        //checking for existing user
        const existingUser = await User.findOne({email})
        if(existingUser){
            return res.status(400).json({
                message:"User already exists"
            })
        }

        //bcrypt password hashing
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        //otp is stored in user model so that every user has unique otp
        const OTP = Math.floor(100000 + Math.random() * 900000).toString()


        //DB user creation
        const user =  await User.create({name,email,password:hashedPassword,otp:OTP})


         //agar user ban gya hai toh apn
         //OTP generate krenge 
         //mail mein bhjenge
            const message = `Hello ${name}, Welcome to buyez - Your OTP for registration is : ${OTP}`

            await sendEmail(email,"Buyez registration successfull",message)

            return res.status(201).json({
                _id:user._id,
                name:user.name,
                email:user.email,
                role:user.role,
                token:generateToken(user._id),
            })  

     
    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}



//user login

const loginUser = async(req,res)=>{
    const {email,password} = req.body
    try {
        const user = await User.findOne({email})

        if(user && (await bcrypt.compare(password,user.password))){
           return res.json({
                _id:user._id,
                name:user.name,
                email:user.email,
                role:user.role,
                token:generateToken(user._id)
            })
        }else{
            res.status(400).json({
                message:"Invalid email or password"
            })
        }
    } catch (error) {
        return res.status(500).json({
            message:'server error',
            error : error
        })
    }
}

//verify-otp
const verifyOtp = async (req, res) => {
    const { otp } = req.body;

    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.verified) {
            return res.status(400).json({
                message: "User already verified"
            });
        }

        if (otp != user.otp) {
            return res.status(400).json({
                message: "Wrong OTP, retry!"
            });
        }

    

        user.verified = true;
        user.otp = undefined; // or null to clear otp after verification

        await user.save();

        return res.status(200).json({
            message: "User successfully verified"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

//resend-otp
const resendOtp = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User doesn't exist"
            });
        }

        if (user.verified) {
            return res.status(400).json({
                message: "User is already verified"
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.otp = otp;
        // user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // Optional

        await user.save();

        const message = `The new OTP for verification is ${otp}`;

        await sendEmail(
            user.email,
            "New OTP for Verification",
            message
        );

        return res.status(200).json({
            message: "OTP sent successfully"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


//get user details

const getUser = async(req,res)=>{
    try {
        const users = await User.find({}).select('-password')
        res.json(users)
    } catch (error) {
        res.status(500).json({
            message:"Server error"
        })
    }
}

module.exports = {
    registerUser,
    loginUser,
    getUser,
    verifyOtp,
    resendOtp
}