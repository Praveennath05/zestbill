const jwt = require("jsonwebtoken");
const User = require("../user");
const { connectUserDB, getUserConnection } = require("../db");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const UserModel = await User();
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Connect to user's specific database
    await connectUserDB(user._id.toString(), user.email);
    const userConnection = getUserConnection(user._id.toString());

    if (!userConnection) {
      return res.status(500).json({ message: "Failed to connect to user database" });
    }

    // Attach user and connection to request
    req.user = user;
    req.userConnection = userConnection;
    req.userId = user._id.toString();
    
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = auth;








