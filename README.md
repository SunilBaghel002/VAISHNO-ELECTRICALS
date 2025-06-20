# Vaishno Electricals ⚡

[![oaicite:1](https://img.shields.io/badge/Live-Online-brightgreen)](https://www.vaishnoelectricals.in/)

This repository contains the codebase for the Vaishno Electricals corporate website, a freelancing project delivered for an electrical goods wholesaler based in Gurugram. It showcases product listings, enquiry form, admin dashboard integration, and follows best practices in modern web development.

---

## 📂 Table of Contents

1. [Project Overview](#project-overview)
2. [Features & User Experience](#features--user-experience)
3. [Tech Stack & Tools](#tech-stack--tools)
4. [Repository Structure](#repository-structure)
5. [Getting Started](#getting-started)
6. [Deployment Details](#deployment-details)
7. [Live Demo](#live-demo)
8. [Author & Contact](#author--contact)

---

## 📌 Project Overview

* **Client**: Vaishno Electricals, a NCR-based electrical goods wholesaler and distributor.
* **Objective**: Create a visually appealing, responsive online presence aligning with their existing branding. Include key sections like product catalog, enquiry form, and admin features.
* **Scope**: Front-end delivered with dynamic capabilities, integrated contact/enquiry form, CMS-like product management powered by a lightweight admin backend.

---

## 🌟 Features & User Experience

* 📱 **Responsive Design**: Ensures seamless browsing on desktops, tablets, and phones.
* 🧩 **Dynamic Rendering**: Server-side rendering using EJS templates for flexible page composition.
* ✉️ **Enquiry Form**: Users can submit contact details; submissions are emailed and stored.
* 📦 **Product Catalog**: Admin-managed product listing with images, descriptions, and contact links.
* 🔒 **Admin Dashboard**: Secure login for managing inquiries and products.
* 💡 **SEO-Friendly**: Metadata tags optimized for search engines.

---

## 🛠 Tech Stack & Tools

* **Runtime & Frameworks**:

  * Node.js with **Express** — server-side logic (`server.js`)
  * **EJS** — templating engine for generating HTML views
* **Routing**: Handled via Express in `/routes`
* **Data Models**: Mongoose schemas in `/models` (e.g., `Product.js`, `Inquiry.js`)
* **Static Assets**: Organized under `/public` (CSS, JS, images)
* **Dependencies**: Managed via `package.json`; includes packages like `express`, `mongoose`, `nodemailer`
* **Env Configuration**: `.env` file stores secrets (DB URIs, SMTP credentials)
* **Deployment & Hosting**:

  * Hosted on Vercel (see `vercel.json`) for seamless CI/CD
  * Connected to MongoDB Atlas for database hosting
* **Version Control**: Git, with a clean branch structure (`main`, staging, etc.)

---

## 🗂 Repository Structure

```text
Vaishno-Electricals/
├── models/            # Mongoose schemas (Product, Inquiry, User)
├── public/            # Static files (CSS, JS, images)
├── routes/            # Express route definitions
├── views/             # EJS templates (pages & partials)
├── .env.example       # Sample environment variables setup
├── .gitignore         # Ignored files and directories
├── package.json       # NPM scripts & dependencies
├── server.js          # Main server entry point
└── vercel.json        # Deployment configuration
```

---

## 🚀 Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/SunilBaghel002/Vaishno-Electricals.git
   cd Vaishno-Electricals
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**
   Duplicate `.env.example` to `.env`, then populate with:

   ```
   PORT=3000
   MONGO_URI=<your MongoDB connection string>
   EMAIL_USER=<email user>
   ADMIN_PASSWORD_HASH=<email password>
   EMAIL_PASS=<secure password>
   ```

4. **Run the app locally**

   ```bash
   npm start
   ```

   The app will be accessible at `http://localhost:3000`

---

## 🛫 Deployment Details

* Hosted on **Vercel** with automatic deploys on push to `main`; configuration via `vercel.json`.
* Uses **MongoDB Atlas** as the production database.
* **SMTP / Email Service** configured via env vars, enabling form submissions to be emailed to the client and stored in the database.

---

## 🔗 Live Demo

Explore the fully functional live site:
➡️ [https://www.vaishnoelectricals.in/](https://www.vaishnoelectricals.in/)

---

## 👤 Author & Contact

**Sunil Baghel** — Freelance Full‑Stack Developer

* GitHub: [SunilBaghel002](https://github.com/SunilBaghel002)
* Email: [sunilbaghel93100@gmail.com](mailto:sunilbaghel93100@gmail.com)

---

Thank you for reviewing this project README! Feel free to suggest any edits or ask questions — I'm happy to adapt it to your freelance portfolio or client presentation needs.


