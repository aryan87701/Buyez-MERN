const User = require("../model/User.model.js")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const sendEmail = require("../util/sendMail.js")

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || "default_jwt_secret", { expiresIn: '7d' })
}

// Register function
const registerUser = async (req, res) => {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "Please provide all required fields (name, email, password)"
        })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
            message: "Please provide a valid email address"
        })
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {
        const existingUser = await User.findOne({ email: normalizedEmail })
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const OTP = Math.floor(100000 + Math.random() * 900000).toString()

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            otp: OTP
        })

        const message = `Hello ${name}, Welcome to buyez - Your OTP for registration is : ${OTP}`
        try {
            await sendEmail(normalizedEmail, "Buyez registration successfull", message)
        } catch (mailErr) {
            console.error("Email notification error:", mailErr.message);
        }

        return res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            verified: user.verified,
            token: generateToken(user._id),
        })

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

// User login
const loginUser = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({
            message: "Please provide email and password"
        })
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {
        const user = await User.findOne({ email: normalizedEmail })

        if (user && (await bcrypt.compare(password, user.password))) {
            return res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                verified: user.verified,
                token: generateToken(user._id)
            })
        } else {
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Server error',
            error: error.message || error
        })
    }
}

// Verify-otp
const verifyOtp = async (req, res) => {
    const { otp } = req.body;

    if (!otp || typeof otp !== "string" || !/^\d{6}$/.test(otp.trim())) {
        return res.status(400).json({
            message: "OTP must be a 6-digit numeric string"
        });
    }

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

        if (otp.trim() !== String(user.otp).trim()) {
            return res.status(400).json({
                message: "Wrong OTP, retry!"
            });
        }

        user.verified = true;
        user.otp = undefined;

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

// Resend-otp
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
        await user.save();

        const message = `The new OTP for verification is ${otp}`;
        try {
            await sendEmail(user.email, "New OTP for Verification", message);
        } catch (mailErr) {
            console.error("Email notification error:", mailErr.message);
        }

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

// Get user details (Admin)
const getUser = async (req, res) => {
    try {
        const users = await User.find({}).select('-password')
        res.json(users)
    } catch (error) {
        res.status(500).json({
            message: "Server error"
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
