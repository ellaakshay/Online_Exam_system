const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "No token. Please login.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        message: "User not found.",
      });
    }

    // Set BOTH so controllers can use either
    req.user = user;
    req.user.id = user._id.toString();

    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    // Return 401 but do NOT cause frontend logout for submit
    return res.status(401).json({
      message: "Token invalid or expired.",
    });
  }
};