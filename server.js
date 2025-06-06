const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Ensure public and uploads directories exist
const publicDir = path.join(__dirname, "public");
const uploadsDir = path.join(publicDir, "Uploads");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: false });
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: false });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "-");
    cb(null, uniqueSuffix);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only images (jpeg, jpg, png) are allowed"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5500",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDir));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Product Schema
const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  price: {
    type: mongoose.Schema.Types.Mixed, // Allows Number or String
    required: true,
    validate: {
      validator: function (v) {
        return (typeof v === "number" && v >= 0) || v === "As per requirement";
      },
      message: "Price must be a positive number or 'As per requirement'",
    },
  },
  quantity: {
    value: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, enum: ["kg", "item", "meter"] },
  },
  image: { type: String, required: true },
  description: { type: String, required: true },
  shortDescription: { type: String, required: true },
  keyFeatures: [{ type: String, required: true }],
  specifications: [
    {
      key: { type: String, required: true },
      value: { type: String, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});
const Product = mongoose.model("Product", productSchema);

// Simple token for admin authentication (in-memory)
let adminToken = null;

// Admin Authentication Middleware
const authenticateAdmin = async (req, res, next) => {
  console.log("Authenticating admin...");
  const authHeader = req.headers.authorization;

  if (!authHeader || authHeader !== `Bearer ${adminToken}`) {
    return res
      .status(401)
      .json({ error: "Unauthorized: Invalid or missing token" });
  }

  try {
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ error: "Server error during authentication" });
  }
};

// Email Validation Function
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Nodemailer Transport Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify Nodemailer transport on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("Email transport verification failed:", error);
  } else {
    console.log("Email transport is ready to send messages");
  }
});

// Email Template Function
const generateEmailTemplate = (type, data) => {
  const { name, email, phone, inquiry, product, message, refId, timestamp } =
    data;
  const isAdminEmail = type === "contact-admin" || type === "enquiry-admin";
  const isContactForm = type === "contact-admin" || type === "contact-user";

  const subject = isAdminEmail
    ? type === "contact-admin"
      ? `New Contact Inquiry: ${inquiry} [Ref: ${refId}]`
      : `New Product Enquiry: ${product} [Ref: ${refId}]`
    : type === "contact-user"
    ? `Thank You for Your Inquiry [Ref: ${refId}]`
    : `Thank You for Your Enquiry About ${product} [Ref: ${refId}]`;

  const greeting = isAdminEmail
    ? "Dear Vaishno Electricals Team,"
    : `Dear ${name},`;

  const mainContent = isAdminEmail
    ? isContactForm
      ? `
        <p>A new contact form submission has been received. Please review the details below and respond promptly.</p>
        <table border="0" cellpadding="10" cellspacing="0" style="width: 100%; background-color: #f8fafc; border-radius: 8px;">
          <tr><td style="font-weight: bold;">Reference ID:</td><td>${refId}</td></tr>
          <tr><td style="font-weight: bold;">Name:</td><td>${name}</td></tr>
          <tr><td style="font-weight: bold;">Email:</td><td>${email}</td></tr>
          <tr><td style="font-weight: bold;">Phone:</td><td>${phone}</td></tr>
          <tr><td style="font-weight: bold;">Inquiry Type:</td><td>${inquiry}</td></tr>
          <tr><td style="font-weight: bold;">Message:</td><td>${message}</td></tr>
          <tr><td style="font-weight: bold;">Submitted At:</td><td>${timestamp}</td></tr>
        </table>
        <p style="margin-top: 20px;">
          <a href="mailto:${email}" style="background-color: #3b82f6; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block;">
            Reply to Customer
          </a>
        </p>
      `
      : `
        <p>A new enquiry has been received for a product. Please review the details below and follow up accordingly.</p>
        <table border="0" cellpadding="10" cellspacing="0" style="width: 100%; background-color: #f8fafc; border-radius: 8px;">
          <tr><td style="font-weight: bold;">Reference ID:</td><td>${refId}</td></tr>
          <tr><td style="font-weight: bold;">Name:</td><td>${name}</td></tr>
          <tr><td style="font-weight: bold;">Email:</td><td>${email}</td></tr>
          <tr><td style="font-weight: bold;">Phone:</td><td>${phone}</td></tr>
          <tr><td style="font-weight: bold;">Product:</td><td>${product}</td></tr>
          <tr><td style="font-weight: bold;">Message:</td><td>${message}</td></tr>
          <tr><td style="font-weight: bold;">Submitted At:</td><td>${timestamp}</td></tr>
        </table>
        <p style="margin-top: 20px;">
          <a href="mailto:${email}" style="background-color: #3b82f6; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block;">
            Reply to Customer
          </a>
        </p>
      `
    : isContactForm
    ? `
        <p>Thank you for reaching out to Vaishno Electricals. We have received your inquiry and will respond within 24-48 hours.</p>
        <p><strong>Your Inquiry Details:</strong></p>
        <table border="0" cellpadding="10" cellspacing="0" style="width: 100%; background-color: #f8fafc; border-radius: 8px;">
          <tr><td style="font-weight: bold;">Name:</td><td>${name}</td></tr>
          <tr><td style="font-weight: bold;">Email:</td><td>${email}</td></tr>
          <tr><td style="font-weight: bold;">Phone:</td><td>${phone}</td></tr>
          <tr><td style="font-weight: bold;">Reference ID:</td><td>${refId}</td></tr>
          <tr><td style="font-weight: bold;">Inquiry Type:</td><td>${inquiry}</td></tr>
          <tr><td style="font-weight: bold;">Message:</td><td>${message}</td></tr>
          <tr><td style="font-weight: bold;">Submitted At:</td><td>${timestamp}</td></tr>
        </table>
        <p style="margin-top: 20px;">If you have further questions, feel free to contact us at <a href="mailto:info@vaishnoelectricals.com" style="color: #3b82f6;">info@vaishnoelectricals.com</a>.</p>
      `
    : `
        <p>Thank you for your interest in our products at Vaishno Electricals. We have received your enquiry about <strong>${product}</strong> and will get back to you within 24-48 hours.</p>
        <p><strong>Your Enquiry Details:</strong></p>
        <table border="0" cellpadding="10" cellspacing="0" style="width: 100%; background-color: #f8fafc; border-radius: 8px;">
          <tr><td style="font-weight: bold;">Name:</td><td>${name}</td></tr>
          <tr><td style="font-weight: bold;">Email:</td><td>${email}</td></tr>
          <tr><td style="font-weight: bold;">Phone:</td><td>${phone}</td></tr>
          <tr><td style="font-weight: bold;">Reference ID:</td><td>${refId}</td></tr>
          <tr><td style="font-weight: bold;">Product:</td><td>${product}</td></tr>
          <tr><td style="font-weight: bold;">Message:</td><td>${message}</td></tr>
          <tr><td style="font-weight: bold;">Submitted At:</td><td>${timestamp}</td></tr>
        </table>
        <p style="margin-top: 20px;">If you have further questions, feel free to contact us at <a href="mailto:vaishnoelectricals2@gmail.com" style="color: #3b82f6;">info@vaishnoelectricals.com</a>.</p>
      `;

  return {
    subject,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6, #1e40af); padding: 20px; text-align: center; border-top-left-radius: 10px; border-top-right-radius: 10px;">
              <img src="http://localhost:3000/images/logo.svg" alt="Vaishno Electricals Logo" style="max-width: 150px;">
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="color: #1e40af; margin-bottom: 20px;">
                ${
                  isAdminEmail
                    ? isContactForm
                      ? "New Contact Submission"
                      : "New Product Enquiry"
                    : "Thank You for Contacting Us"
                }
              </h2>
              <p style="margin-bottom: 20px;">${greeting}</p>
              ${mainContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">
              <p style="margin: 0; font-size: 14px; color: #666;">
                Vaishno Electricals<br>
                NEAR SHIV MANDIR, GROUND
            FLOOR, 1-C-9A,B.P,<br/> BATA HARDWARE ROAD, Faridabad, Faridabad,
            Haryana, 121001<br>
                Phone: +91-9873906044, +91-9810110903 | Email: <a href="mailto:vaishnoelectricals2@gmail.com" style="color: #3b82f6;">info@vaishnoelectricals.com</a><br>
                GSTIN: 06CROPS7313B1ZQ
              </p>
              <p style="margin-top: 10px; font-size: 12px; color: #999;">
                &copy; ${new Date().getFullYear()} Vaishno Electricals. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };
};

// HTML Routes
console.log("Registering HTML routes...");
app.get("/", (req, res) => {
  console.log("GET /");
  res.sendFile(path.join(__dirname, "views", "index.html"));
});
app.get("/products", (req, res) => {
  console.log("GET /products");
  res.sendFile(path.join(__dirname, "views", "products.html"));
});
app.get("/products/:id", (req, res) => {
  console.log(`GET /products/:id (${req.params.id})`);
  res.sendFile(path.join(__dirname, "views", "product-template.html"));
});
app.get("/admin", (req, res) => {
  console.log("GET /admin");
  res.sendFile(path.join(__dirname, "views", "admin.html"));
});

// API Routes - Products
console.log("Registering product API routes...");
app.get("/api/products", async (req, res) => {
  console.log("GET /api/products");
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/products/:id", async (req, res) => {
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

app.get("/api/products/search/:query", async (req, res) => {
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

// API Routes - Admin
console.log("Registering admin API routes...");
app.post("/api/admin/authenticate", async (req, res) => {
  console.log("POST /api/admin/authenticate");
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: "Password required" });
  }

  try {
    const hashedPassword = process.env.ADMIN_PASSWORD_HASH;
    if (!hashedPassword) {
      throw new Error("ADMIN_PASSWORD_HASH not set in .env");
    }
    const isMatch = await bcrypt.compare(password, hashedPassword);
    if (isMatch) {
      adminToken = Math.random().toString(36).substring(2);
      res.json({ authenticated: true, token: adminToken });
    } else {
      res.status(401).json({ error: "Invalid password" });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ error: "Server error: " + error.message });
  }
});

app.get("/api/admin/products", authenticateAdmin, async (req, res) => {
  console.log("GET /api/admin/products");
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/admin/products/:id", authenticateAdmin, async (req, res) => {
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

app.post("/api/admin/products", authenticateAdmin, async (req, res) => {
  console.log("POST /api/admin/products");
  try {
    const {
      id,
      name,
      price,
      quantity,
      image,
      description,
      shortDescription,
      keyFeatures,
      specifications,
    } = req.body;
    if (
      !id ||
      !name ||
      !quantity ||
      !quantity.value ||
      !quantity.unit ||
      !image ||
      !description ||
      !shortDescription ||
      !keyFeatures ||
      !Array.isArray(keyFeatures) ||
      !specifications ||
      !Array.isArray(specifications)
    ) {
      return res
        .status(400)
        .json({ error: "All fields are required and must be valid" });
    }
    if (
      !(
        (typeof price === "number" && price >= 0) ||
        price === "As per requirement"
      )
    ) {
      return res.status(400).json({
        error: "Price must be a positive number or 'As per requirement'",
      });
    }
    if (quantity.value <= 0) {
      return res.status(400).json({ error: "Quantity value must be positive" });
    }
    if (!["kg", "item", "meter"].includes(quantity.unit)) {
      return res
        .status(400)
        .json({ error: "Quantity unit must be 'kg', 'item', or 'meter'" });
    }
    if (specifications.some((spec) => !spec.key || !spec.value)) {
      return res
        .status(400)
        .json({ error: "Specifications must have valid key-value pairs" });
    }

    const existingProduct = await Product.findOne({ id });
    if (existingProduct) {
      return res.status(400).json({ error: "Product ID already exists" });
    }

    const product = new Product({
      id,
      name,
      price: price === "As per requirement" ? price : parseFloat(price),
      quantity: {
        value: parseFloat(quantity.value),
        unit: quantity.unit,
      },
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

app.put("/api/admin/products/:id", authenticateAdmin, async (req, res) => {
  console.log(`PUT /api/admin/products/:id (${req.params.id})`);
  try {
    const {
      name,
      price,
      quantity,
      image,
      description,
      shortDescription,
      keyFeatures,
      specifications,
    } = req.body;
    if (
      !name ||
      !quantity ||
      !quantity.value ||
      !quantity.unit ||
      !image ||
      !description ||
      !shortDescription ||
      !keyFeatures ||
      !Array.isArray(keyFeatures) ||
      !specifications ||
      !Array.isArray(specifications)
    ) {
      return res
        .status(400)
        .json({ error: "All fields are required and must be valid" });
    }
    if (
      !(
        (typeof price === "number" && price >= 0) ||
        price === "As per requirement"
      )
    ) {
      return res.status(400).json({
        error: "Price must be a positive number or 'As per requirement'",
      });
    }
    if (quantity.value <= 0) {
      return res.status(400).json({ error: "Quantity value must be positive" });
    }
    if (!["kg", "item", "meter"].includes(quantity.unit)) {
      return res
        .status(400)
        .json({ error: "Quantity unit must be 'kg', 'item', or 'meter'" });
    }
    if (specifications.some((spec) => !spec.key || !spec.value)) {
      return res
        .status(400)
        .json({ error: "Specifications must have valid key-value pairs" });
    }
    const product = await Product.findOneAndUpdate(
      { id: req.params.id },
      {
        name,
        price: price === "As per requirement" ? price : parseFloat(price),
        quantity: {
          value: parseFloat(quantity.value),
          unit: quantity.unit,
        },
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

app.delete("/api/admin/products/:id", authenticateAdmin, async (req, res) => {
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

app.post(
  "/api/admin/upload-image",
  authenticateAdmin,
  upload.single("image"),
  (req, res) => {
    console.log("POST /api/admin/upload-image");
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const imageUrl = `/Uploads/${req.file.filename}`;
    res.json({ imageUrl });
  }
);

// API Routes - Contact Form
app.post("/api/contact", async (req, res) => {
  console.log("POST /api/contact");
  const { name, email, phone, inquiry, message } = req.body;

  // Validate inputs
  if (!name || !email || !phone || !inquiry || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  if (!/^[0-9]{10}$/.test(phone)) {
    return res
      .status(400)
      .json({ error: "Invalid phone number (must be 10 digits)" });
  }

  const refId = `CNT-${Date.now()}`;
  const timestamp = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

  try {
    // Admin Notification Email
    const adminEmail = generateEmailTemplate("contact-admin", {
      name,
      email,
      phone,
      inquiry,
      message,
      refId,
      timestamp,
    });
    await transporter.sendMail({
      from: `"Vaishno Electricals" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: adminEmail.subject,
      html: adminEmail.html,
    });

    // User Confirmation Email
    const userEmail = generateEmailTemplate("contact-user", {
      name,
      email,
      phone,
      inquiry,
      message,
      refId,
      timestamp,
    });
    await transporter.sendMail({
      from: `"Vaishno Electricals" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: userEmail.subject,
      html: userEmail.html,
    });

    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending contact email:", error);
    res.status(500).json({ error: `Failed to send message: ${error.message}` });
  }
});

// API Routes - Enquiry Form
app.post("/api/enquiry", async (req, res) => {
  console.log("POST /api/enquiry");
  const { name, email, phone, product, message } = req.body;

  // Validate inputs
  if (!name || !email || !phone || !product || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  if (!/^[0-9]{10}$/.test(phone)) {
    return res
      .status(400)
      .json({ error: "Invalid phone number (must be 10 digits)" });
  }

  const refId = `ENQ-${Date.now()}`;
  const timestamp = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

  try {
    // Admin Notification Email
    const adminEmail = generateEmailTemplate("enquiry-admin", {
      name,
      email,
      phone,
      product,
      message,
      refId,
      timestamp,
    });
    await transporter.sendMail({
      from: `"Vaishno Electricals" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: adminEmail.subject,
      html: adminEmail.html,
    });

    // User Confirmation Email
    const userEmail = generateEmailTemplate("enquiry-user", {
      name,
      email,
      phone,
      product,
      message,
      refId,
      timestamp,
    });
    await transporter.sendMail({
      from: `"Vaishno Electricals" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: userEmail.subject,
      html: userEmail.html,
    });

    res.status(200).json({ message: "Enquiry sent successfully" });
  } catch (error) {
    console.error("Error sending enquiry:", error);
    res.status(500).json({ error: `Failed to send enquiry: ${error.message}` });
  }
});

// Handle unmatched API routes
app.use("/api/*", (req, res) => {
  console.log(`Unmatched API route: ${req.path}`);
  res.status(404).json({ error: "API endpoint not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  if (err.message === "Only images (jpeg, jpg, png) are allowed") {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: "Internal server error: " + err.message });
});

// Log all registered routes
console.log("All registered routes:");
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(
      `Route: ${middleware.route.path}, Methods: ${Object.keys(
        middleware.route.methods
      )}`
    );
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
