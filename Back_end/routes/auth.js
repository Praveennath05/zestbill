const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../user");
const { connectUserDB } = require("../db");
const fs = require("fs");
const path = require("path");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// In-memory OTP store: { email: { otp, expiresAt } }
const otpStore = {};

// Nodemailer transporter using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "praveennath052004@gmail.com"  ,    // your Gmail address in .env
    pass: "drhn gboz wkeh mexa "// Gmail App Password in .env
  },
});

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Auth routes are working!", routes: ["/login", "/register", "/forgot-password", "/verify-otp", "/reset-password"] });
});

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Helper: save Base64 image
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

// Password strength validator
function validatePassword(pwd) {
  if (!pwd || pwd.length < 6) return "Password must be at least 6 characters.";
  if (!/[A-Z]/.test(pwd)) return "Password must contain at least 1 uppercase letter.";
  return null; // valid
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  console.log("Login route hit:", req.body);
  try {
    const { email, pwd } = req.body;
    if (!email || !pwd) return res.status(400).json({ message: "Email and password are required" });

    const UserModel = await User();
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isValidPassword = await bcrypt.compare(pwd, user.pwd);
    if (!isValidPassword) return res.status(401).json({ message: "Invalid email or password" });

    await connectUserDB(user._id.toString(), user.email);

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    const imageUrl = user.image.startsWith("http")
      ? user.image
      : `${req.protocol}://${req.get("host")}${user.image}`;

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, email: user.email, image: imageUrl, mobile: user.mobile },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─── REGISTER ─────────────────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  console.log("Register route hit:", { email: req.body.email, hasImage: !!req.body.image });
  try {
    const { email, pwd, image, mobile } = req.body;
    if (!email || !pwd || !image) return res.status(400).json({ message: "Email, password and image are required" });

    // Validate password strength
    const pwdError = validatePassword(pwd);
    if (pwdError) return res.status(400).json({ message: pwdError });

    const UserModel = await User();
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(pwd, 10);
    const imagePath = saveBase64Image(image);

    const user = new UserModel({ email, pwd: hashedPassword, image: imagePath, mobile: mobile || "" });
    await user.save();

    await connectUserDB(user._id.toString(), user.email);

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
    const imageUrl = `${req.protocol}://${req.get("host")}${imagePath}`;

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: user._id, email: user.email, image: imageUrl, mobile: user.mobile },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─── FORGOT PASSWORD — send OTP to email ──────────────────────────────────────
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Check if user exists
    const UserModel = await User();
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "No account found with this email" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with 10-minute expiry
    otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };

    // Send OTP email
    await transporter.sendMail({
      from: `"ZestBill Support" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your ZestBill Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #1e40af;">ZestBill Password Reset</h2>
          <p>Your One-Time Password (OTP) is:</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #3b82f6; padding: 16px 0;">${otp}</div>
          <p>This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
          <p style="color: #9ca3af; font-size: 12px;">If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    res.json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Failed to send OTP. Check Gmail credentials in .env", error: error.message });
  }
});

// ─── VERIFY OTP ───────────────────────────────────────────────────────────────
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const record = otpStore[email];
    if (!record) return res.status(400).json({ message: "No OTP sent for this email. Please request again." });
    if (Date.now() > record.expiresAt) {
      delete otpStore[email];
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }
    if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP. Please try again." });

    res.json({ message: "OTP verified" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ message: "Email, OTP, and new password are required" });

    // Validate new password strength
    const pwdError = validatePassword(newPassword);
    if (pwdError) return res.status(400).json({ message: pwdError });

    // Verify OTP again before reset
    const record = otpStore[email];
    if (!record) return res.status(400).json({ message: "OTP session expired. Please start again." });
    if (Date.now() > record.expiresAt) {
      delete otpStore[email];
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }
    if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP." });

    const UserModel = await User();
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.pwd = hashedPassword;
    await user.save();

    // Clear OTP after successful reset
    delete otpStore[email];

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;