const mongoose = require("mongoose");
const { masterConnection, connectMasterDB } = require("./db");

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email"]},
    pwd: { type: String, required: true },
    image: { type: String, required: true },
    mobile: { type: String, required: false }
});

// Get User model from master connection
const getUserModel = async () => {
  let conn = masterConnection();
  if (!conn) {
    // If connection doesn't exist, try to establish it
    conn = await connectMasterDB();
  }
  return conn.models.User || conn.model("User", userSchema);
};

module.exports = getUserModel;
