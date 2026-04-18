const express = require("express");
const router = express.Router();
const getProductModel = require("../models/Product");
const auth = require("../middleware/auth");

//Read
router.get("/", auth, async (req, res) => {
  try {
    const Product = getProductModel(req.userConnection);
    const products = await Product.find().sort({ createdAt: -1 });
    const formattedProducts = products.map(p => ({
      id: p._id.toString(),
      name: p.name,
      price: p.price,
      image: p.image,
      category: p.category,
    }));
    res.json(formattedProducts);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//Create
router.post("/", auth, async (req, res) => {
  try {
    const { name, price, image, category } = req.body;

    if (!name || !price || !image || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const Product = getProductModel(req.userConnection);
    const product = new Product({ name, price, image, category });
    await product.save();

    res.status(201).json({
      id: product._id.toString(),
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//Update
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, price, image, category } = req.body;
    const Product = getProductModel(req.userConnection);
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, image, category },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      id: product._id.toString(),
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//Delete
router.delete("/:id", auth, async (req, res) => {
  try {
    const Product = getProductModel(req.userConnection);
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;








