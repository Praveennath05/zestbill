const mongoose = require("mongoose");


const masterDBName = "person_master";
let masterConnection = null;


const userConnections = new Map();

const connectMasterDB = async () => {
  try {
    if (!masterConnection) {
      console.log("Attempting to connect to MongoDB...");
      masterConnection = await mongoose.createConnection(`mongodb://localhost:27017/${masterDBName}`, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log("Master MongoDB Connected to:", masterDBName);
    }
    return masterConnection;
  } catch (error) {
    console.error("Failed to connect to master DB:", error.message);
    console.error("Make sure MongoDB is running on localhost:27017");
    throw error;
  }
};

const connectUserDB = async (userId, email) => {
  try {
   
    const dbName = `person_${email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
    
    if (!userConnections.has(userId)) {
      const userConnection = await mongoose.createConnection(`mongodb://localhost:27017/${dbName}`, {
        serverSelectionTimeoutMS: 5000,
      });
      userConnections.set(userId, { connection: userConnection, dbName });
      console.log(`User DB Connected: ${dbName}`);
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
    console.log("Database system initialized");
  } catch (error) {
    console.error("Failed to connect to database:", error.message);
    console.warn("Server will continue without database connection. Some features may not work.");
    
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