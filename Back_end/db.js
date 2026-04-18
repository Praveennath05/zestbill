const mongoose = require("mongoose");

const masterDBName = "person_master";
let masterConnection = null;
const userConnections = new Map();

// Base Atlas URL without database name
// e.g. mongodb+srv://praveen:pass@cluster0.auuqvvg.mongodb.net
const getBaseURL = () => {
  const url = process.env.MONGO_URL;
  if (!url) throw new Error("MONGO_URL is not defined in environment variables");
  // Strip any existing db name and query params, keep just the base
  return url.replace(/\/[^/?]+(\?.*)?$/, "");
};

const connectMasterDB = async () => {
  try {
    if (!masterConnection) {
      const baseURL = getBaseURL();
      const fullURL = `${baseURL}/${masterDBName}?retryWrites=true&w=majority`;
      console.log("Connecting to master DB...");
      masterConnection = await mongoose.createConnection(fullURL, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log("✓ Master MongoDB connected:", masterDBName);
    }
    return masterConnection;
  } catch (error) {
    console.error("Failed to connect to master DB:", error.message);
    throw error;
  }
};

const connectUserDB = async (userId, email) => {
  try {
    const dbName = `person_${email.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}`;

    if (!userConnections.has(userId)) {
      const baseURL = getBaseURL();
      const fullURL = `${baseURL}/${dbName}?retryWrites=true&w=majority`;
      const userConnection = await mongoose.createConnection(fullURL, {
        serverSelectionTimeoutMS: 10000,
      });
      userConnections.set(userId, { connection: userConnection, dbName });
      console.log(`✓ User DB connected: ${dbName}`);
    }
    return userConnections.get(userId);
  } catch (error) {
    console.error("Failed to connect to user DB:", error.message);
    throw error;
  }
};

const getUserConnection = (userId) => {
  return userConnections.get(userId)?.connection || null;
};

const getUserDBName = (userId) => {
  return userConnections.get(userId)?.dbName || null;
};

const connectDB = async () => {
  try {
    await connectMasterDB();
    console.log("✓ Database system initialized");
  } catch (error) {
    console.error("Failed to initialize database:", error.message);
    throw error;
  }
};

module.exports = {
  connectDB,
  connectMasterDB,
  connectUserDB,
  getUserConnection,
  getUserDBName,
  masterConnection: () => masterConnection,
};