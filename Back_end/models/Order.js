const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    items: Array,
    total: Number,
    subtotal: Number,
    tax: Number,
  },
  { timestamps: true }
);

// Function to get Order model for a specific connection
const getOrderModel = (connection) => {
  if (!connection) {
    throw new Error("Database connection is required");
  }
  return connection.models.Order || connection.model("Order", orderSchema);
};

module.exports = getOrderModel;



