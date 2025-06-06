const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config();

console.log("Defining admin routes...");

// Middleware to check admin password
const authenticateAdmin = async (req, res, next) => {
  console.log("Authenticating admin...");
  const { password } = req.body;
  if (!password) {
    return res
      .status(400)
      .json({ authenticated: false, message: "Password required" });
  }

  try {
    const hashedPassword = process.env.ADMIN_PASSWORD_HASH;
    if (!hashedPassword) {
      throw new Error("ADMIN_PASSWORD_HASH not set in .env");
    }
    const isMatch = await bcrypt.compare(password, hashedPassword);
    if (isMatch) {
      next();
    } else {
      res
        .status(401)
        .json({ authenticated: false, message: "Invalid password" });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ authenticated: false, message: "Server error" });
  }
};

// Authenticate admin
router.post("/authenticate", async (req, res) => {
  console.log("POST /api/admin/authenticate");
  const { password } = req.body;
  if (!password) {
    return res
      .status(400)
      .json({ authenticated: false, message: "Password required" });
  }

  try {
    const hashedPassword = process.env.ADMIN_PASSWORD_HASH;
    if (!hashedPassword) {
      throw new Error("ADMIN_PASSWORD_HASH not set in .env");
    }
    const isMatch = await bcrypt.compare(password, hashedPassword);
    if (isMatch) {
      res.json({ authenticated: true });
    } else {
      res
        .status(401)
        .json({ authenticated: false, message: "Invalid password" });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ authenticated: false, message: "Server error" });
  }
});

// Get all products (admin)
router.get("/products", authenticateAdmin, async (req, res) => {
  console.log("GET /api/admin/products");
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get product by ID (admin)
router.get("/products/:id", authenticateAdmin, async (req, res) => {
  console.log(`GET /api/admin/products/:id (${req.params.id})`);
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create product
router.post("/products", authenticateAdmin, async (req, res) => {
  console.log("POST /api/admin/products");
  try {
    const {
      id,
      name,
      image,
      description,
      shortDescription,
      keyFeatures,
      specifications,
    } = req.body;
    if (
      !id ||
      !name ||
      !image ||
      !description ||
      !shortDescription ||
      !keyFeatures ||
      !specifications
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingProduct = await Product.findOne({ id });
    if (existingProduct) {
      return res.status(400).json({ error: "Product ID already exists" });
    }

    const product = new Product({
      id,
      name,
      image,
      description,
      shortDescription,
      keyFeatures,
      specifications,
    });

    await product.save();
    res.status(201).json({ message: "Product created", product });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update product
router.put("/products/:id", authenticateAdmin, async (req, res) => {
  console.log(`PUT /api/admin/products/:id (${req.params.id})`);
  try {
    const {
      name,
      image,
      description,
      shortDescription,
      keyFeatures,
      specifications,
    } = req.body;
    const product = await Product.findOneAndUpdate(
      { id: req.params.id },
      {
        name,
        image,
        description,
        shortDescription,
        keyFeatures,
        specifications,
      },
      { new: true }
    );
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product updated", product });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete product
router.delete("/products/:id", authenticateAdmin, async (req, res) => {
  console.log(`DELETE /api/admin/products/:id (${req.params.id})`);
  try {
    const product = await Product.findOneAndDelete({ id: req.params.id });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Contact form submission
router.post("/contact", async (req, res) => {
  console.log("POST /api/admin/contact");
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !phone || !subject || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"PowerSafe Solutions" <${process.env.EMAIL_USER}>`,
    to: "info@powersafesolutions.com",
    replyTo: email,
    subject: `New Contact Form Submission: ${subject}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong> ${message}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

module.exports = router;
