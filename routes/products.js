const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

console.log("Defining product routes...");

// Get all products
router.get("/", async (req, res) => {
  console.log("GET /api/products");
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get product by ID
router.get("/:id", async (req, res) => {
  console.log(`GET /api/products/:id (${req.params.id})`);
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Search products by name
router.get("/search/:query", async (req, res) => {
  console.log(`GET /api/products/search/:query (${req.params.query})`);
  try {
    const query = req.params.query;
    const products = await Product.find({
      name: { $regex: query, $options: "i" },
    }).limit(5);
    res.json(products);
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
