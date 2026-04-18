const express = require("express");
const router = express.Router();
const getOrderModel = require("../models/Order");
const auth = require("../middleware/auth");

router.post("/", auth, async (req, res) => {
  try {
    const { items, total, subtotal, tax } = req.body;

    if (!items || !total) {
      return res.status(400).json({ message: "Items and total are required" });
    }

    const Order = getOrderModel(req.userConnection);
    const order = new Order({
      items,
      total,
      subtotal: subtotal || total,
      tax: tax || 0,
    });

    await order.save();

    res.status(201).json({
      id: order._id.toString(),
      total: order.total,
      items: order.items,
      createdAt: order.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/sales", auth, async (req, res) => {
  try {
    const { range = "weekly" } = req.query;
    const now = new Date();
    let days = 7;
    
    if (range === "daily") {
      days = 1;
    } else if (range === "weekly") {
      days = 7;
    } else if (range === "monthly") {
      days = 30;
    }

    const startDate = new Date(now);
    startDate.setDate(now.getDate() - days);

    const Order = getOrderModel(req.userConnection);
    const orders = await Order.find({
      createdAt: { $gte: startDate },
    }).sort({ createdAt: -1 });

    const buckets = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      
      let label;
      if (range === "daily") {
        label = date.toLocaleDateString("en-US", { weekday: "short" });
      } else if (range === "weekly") {
        label = date.toLocaleDateString("en-US", { weekday: "short" });
      } else {
        label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }

      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayOrders = orders.filter((o) => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= dayStart && orderDate <= dayEnd;
      });

      const total = dayOrders.reduce((sum, o) => sum + o.total, 0);
      buckets.push({ label, total });
    }

    const total = buckets.reduce((sum, b) => sum + b.total, 0);

    res.json({ range, total, buckets });
  } catch (error) {
    console.error("Get sales summary error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;








