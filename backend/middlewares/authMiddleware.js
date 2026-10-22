const jwt = require("jsonwebtoken");
const User = require("../model/User.model.js");

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            const parts = req.headers.authorization.split(" ");
            token = parts[1];

            if (!token || token.trim() === "") {
                return res.status(401).json({
                    message: "Not authorized, token missing"
                });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_jwt_secret");

            const user = await User.findById(decoded.id).select("-password");
            if (!user) {
                return res.status(401).json({
                    message: "Not authorized, user not found"
                });
            }

            req.user = user;
            return next();

        } catch (error) {
            return res.status(401).json({
                message: "Not authorized, token failed"
            });
        }
    }

    return res.status(401).json({
        message: "Not authorized, no token"
    });
};

module.exports = protect;
