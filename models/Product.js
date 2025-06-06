const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  shortDescription: { type: String, required: true },
  keyFeatures: [{ type: String, required: true }],
  specifications: {
    material: String,
    sizes: String,
    coating: String,
    standards: String,
    temperature: String,
    other: String,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", productSchema);
