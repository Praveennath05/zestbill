const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../user");
const { connectUserDB } = require("../db");
const fs = require("fs");
const path = require("path");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Test route to verify auth routes are working
router.get("/test", (req, res) => {
  res.json({ message: "Auth routes are working!", routes: ["/login", "/register", "/forgot-password", "/verify-otp", "/reset-password"] });
});

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Helper to save Base64 image
function saveBase64Image(base64Data) {
  if (!base64Data) throw new Error("No image data provided");

  const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) throw new Error("Invalid image format");

  const ext = matches[1];
  const data = matches[2];

  const filename = `${Date.now()}.${ext}`;
  const filepath = path.join(uploadsDir, filename);

  fs.writeFileSync(filepath, Buffer.from(data, "base64"));

  return `/uploads/${filename}`;
}

//Login Route
router.post("/login", async (req, res) => {
  console.log("Login route hit:", req.body);
  try {
    const { email, pwd } = req.body;

    if (!email || !pwd) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const UserModel = await User();
    const user = await UserModel.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isValidPassword = await bcrypt.compare(pwd, user.pwd);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Connect to user's specific database
    await connectUserDB(user._id.toString(), user.email);

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    // Return full URL for image so frontend can access it
    const imageUrl = user.image.startsWith('http') 
      ? user.image 
      : `${req.protocol}://${req.get('host')}${user.image}`;

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        image: imageUrl,
        mobile: user.mobile,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//Register Route 
router.post("/register", async (req, res) => {
  console.log("Register route hit:", { email: req.body.email, hasImage: !!req.body.image, hasMobile: !!req.body.mobile });
  try {
    const { email, pwd, image, mobile } = req.body;

    if (!email || !pwd || !image) {
      return res.status(400).json({ message: "Email, password and image are required" });
    }

    const UserModel = await User();
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(pwd, 10);

    // Save image to uploads folder
    const imagePath = saveBase64Image(image);

    const user = new UserModel({
      email,
      pwd: hashedPassword,
      image: imagePath,
      mobile: mobile || "",
    });

    await user.save();

    
    await connectUserDB(user._id.toString(), user.email);

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    const imageUrl = `${req.protocol}://${req.get('host')}${imagePath}`;

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        image: imageUrl,
        mobile: user.mobile,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Forgot Password Route (returns dummy OTP for now)
router.post("/forgot-password", async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) {
      return res.status(400).json({ message: "Mobile number is required" });
    }
    
    // Generate a dummy OTP (send via SMS)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP temporarily (in production, use Redis or similar)
    // For now, just return it (not secure, but functional)
    res.json({ message: "OTP sent to mobile", otp });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//Verify OTP Route (stub)
router.post("/verify-otp", async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    if (!mobile || !otp) {
      return res.status(400).json({ message: "Mobile and OTP are required" });
    }
    
    // In production, verify against stored OTP
    // For now, accept any 6-digit OTP
    if (otp.length === 6) {
      res.json({ message: "OTP verified" });
    } else {
      res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//Reset Password Route
router.post("/reset-password", async (req, res) => {
  try {
    const { mobile, otp, newPassword } = req.body;
    if (!mobile || !otp || !newPassword) {
      return res.status(400).json({ message: "Mobile, OTP, and new password are required" });
    }
    
    const UserModel = await User();
    const user = await UserModel.findOne({ mobile });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // In production, verify OTP first
    // For now, just update password if OTP is 6 digits
    if (otp.length === 6) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.pwd = hashedPassword;
      await user.save();
      
      res.json({ message: "Password reset successfully" });
    } else {
      res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
