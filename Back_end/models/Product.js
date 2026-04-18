const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
}, {
  timestamps: true,
});

// Function to get Product model for a specific connection
const getProductModel = (connection) => {
  if (!connection) {
    throw new Error("Database connection is required");
  }
  return connection.models.Product || connection.model("Product", productSchema);
};

module.exports = getProductModel;








