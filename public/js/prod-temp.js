let currentProductName = ""; // CHANGED: Global variable to store current product name

// Mock Data
const mockProduct = {
  id: "1",
  name: "Poly Plastic Earth Pit Cover",
  price: "750",
  quantity: { value: "1", unit: "item" },
  description: "Our Poly Plastic Earth Pit Cover is a high-strength, weather-resistant enclosure designed to safely cover and protect earthing pits. Made from UV-stabilized, high-density polyethylene (HDPE), it ensures long-term durability, electrical insulation, and ease of inspection in residential, commercial, and industrial earthing systems.",
  keyFeatures: ["Non-corrosiveand ", "Lightweight", "Impact-resistant"],
  specifications: [
    { key: "Size", value: "10 inch" },
    { key: "Length", value: "3m" },
  ],
  category: { name: "Lighting Protection" },
  image: "/images/Poly Plastic Earth Pit Cover.jpg",
};
const mockProducts = [
  {
    id: 1,
    name: "Poly Plastic Earth Pit Cover",
    shortDescription:
      "Poly Plastic Earth Pit Cover – Durable & Weatherproof Earthing Protection",
    category: { name: "Lighting Protection" },
    image: "/images/Poly Plastic Earth Pit Cover.jpg",
  },
  {
    id: 2,
    name: "Gi Strip",
    shortDescription:
      "GI Strip – Galvanized Iron Flat Strip for Electrical & Construction Use",
    category: { name: "Construction Use" },
    image: "/images/Gi Strip.jpg",
  },
  {
    id: 3,
    name: "Copper Plate",
    shortDescription:
      "Copper Plate – High Conductivity Electrolytic Copper Sheet",
    category: { name: "Construction Use" },
    image: "/images/Copper Plate.jpg",
  },
  {
    id: 4,
    name: "Copper Lighting Arrester",
    shortDescription:
      "Copper Lightning Arrester – High-Efficiency Air Terminal for Surge Protection",
    category: { name: "Lighting Protection" },
    image: "/images/Copper Lighting Arrester.jpg",
  },
  {
    id: 5,
    name: "Copper Cable",
    shortDescription:
      "Copper Cable – High Conductivity Electrical Cable for Reliable Power Transmission",
    category: { name: "Lighting Protection" },
    image: "/images/Copper Cable.jpg",
  },
  {
    id: 6,
    name: "Copper Chemical Earthing",
    shortDescription:
      "Copper Chemical Earthing – Maintenance-Free and Long-Lasting Grounding Solution",
    category: { name: "Earthing" },
    image: "/images/Copper Chemical Earthing.jpg",
  },
  {
    id: 7,
    name: "GI Maintenance Free Earthing",
    shortDescription:
      "GI Maintenance-Free Earthing – Reliable & Cost-Effective Grounding Solution",
    category: { name: "Earthing" },
    image: "/images/GI Maintenance Free Earthing.jpg",
  },
];

// Utilities
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

function createFocusTrap(elementId, focusableElements) {
  const modal = document.getElementById(elementId);
  const focusable = modal.querySelectorAll(focusableElements);
  const firstFocusable = focusable[0];
  const lastFocusable = focusable[focusable.length - 1];

  modal.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      if (e.shiftKey && document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      } else if (!e.shiftKey && document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  });

  return firstFocusable;
}

// Admin Prompt
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === "U") {
    e.preventDefault();
    const adminPrompt = document.getElementById("adminPrompt");
    adminPrompt.classList.add("active");
    document.getElementById("adminPassword").focus();
  }
});

async function validateAdmin() {
  const password = document.getElementById("adminPassword").value.trim();
  const adminPrompt = document.getElementById("adminPrompt");
  if (!password) {
    alert("Please enter a password.");
    return;
  }
  try {
    const response = await fetch("/api/admin/authenticate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) throw new Error("Invalid password");
    const data = await response.json();
    localStorage.setItem("adminAuth", "true");
    localStorage.setItem("adminToken", data.token);
    adminPrompt.classList.remove("active");
    window.location.href = "/admin";
  } catch (err) {
    console.error("Admin auth failed:", err);
    alert("Invalid password.");
    document.getElementById("adminPassword").value = "";
  }
}

// Mobile Menu
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const navLinks = document.getElementById("navLinks");

function toggleMobileMenu() {
  const isActive = navLinks.classList.contains("active");
  navLinks.classList.toggle("active");
  mobileMenuBtn.classList.toggle("active");
  mobileMenuBtn.setAttribute("aria-expanded", !isActive);
  document.body.style.overflow = isActive ? "auto" : "hidden";
  if (!isActive) {
    const firstLink = navLinks.querySelector("a");
    if (firstLink) firstLink.focus();
  }
}

mobileMenuBtn.addEventListener("click", toggleMobileMenu);

document.addEventListener("click", (e) => {
  if (
    !e.target.closest(".nav-links") &&
    !e.target.closest(".mobile-menu-btn") &&
    navLinks.classList.contains("active")
  ) {
    toggleMobileMenu();
  }
});

// Header Scroll
const header = document.getElementById("header");
window.addEventListener("scroll", () => {
  header.classList.toggle("header-scrolled", window.scrollY > 80);
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    e.preventDefault();
    const targetId = anchor.getAttribute("href");
    const target = document.querySelector(targetId);
    if (target) {
      const headerHeight = header.offsetHeight;
      window.scrollTo({
        top: target.offsetTop - headerHeight,
        behavior: "smooth",
      });
      if (navLinks.classList.contains("active")) {
        toggleMobileMenu();
      }
    }
  });
});

// Scroll Animations
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animation = "fadeInUp 0.6s ease forwards";
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

function initFadeIn() {
  document.querySelectorAll(".fade-in").forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    observer.observe(el);
  });
}

// Scroll to Top
const scrollTop = document.getElementById("scrollTop");
window.addEventListener("scroll", () => {
  scrollTop.classList.toggle("visible", window.scrollY > 200);
});
scrollTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Load Product
async function loadProduct() {
  const pageLoading = document.getElementById("pageLoading");
  const productContainer = document.getElementById("productContainer");
  const technicalDescription = document.getElementById("technicalDescription");
  const benefitsGrid = document.getElementById("benefitsGrid");
  const whatsappFloat = document.getElementById("whatsappFloat");
  const enquiryProduct = document.getElementById("enquiryProduct");

  const pathSegments = window.location.pathname.split("/");
  const productId = pathSegments[pathSegments.length - 1].replace(/\.ejs$/, "");
  if (!productId || productId === "products") {
    productContainer.innerHTML = "<p>Invalid product ID.</p>";
    pageLoading.classList.add("hidden");
    return;
  }

  const timeout = 5000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`/api/products/${productId}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Product not found");
    }
    const product = await response.json();
    currentProductName = product.name; // CHANGED: Store product name
    const imageUrl = `/images/${product.name}.jpg`;
    productContainer.innerHTML = `
      <div class="product-image-container">
        <img id="productImage" class="product-image-large" src="${imageUrl}" alt="${
      product.name
    }" onerror="this.src='/images/Copper Plate.jpg'" loading="lazy" sizes="(max-width: 768px) 100vw, 50vw">
      </div>
      <div class="product-info">
        <h2 id="productName">${product.name}</h2>
        <div class="product-price">
          Price: <span id="productPrice">${
            typeof product.price === "string"
              ? product.price
              : `₹${(product.price || 0).toFixed(2)}`
          }</span>
          <span id="productQuantity" class="unit">${
            product.quantity
              ? `/ ${product.quantity.value} ${
                  product.quantity.unit === "kg"
                    ? "kg"
                    : product.quantity.unit === "meter"
                    ? "meter"
                    : product.quantity.unit === "set"
                    ? "set"
                    : "item"
                }`
              : "/ unit"
          }</span>
        </div>
        <p id="productDescription">${
          product.description || "No description available."
        }</p>
        <h3>Key Features</h3>
        <ul class="features-list" id="productFeatures">
          ${
            product.keyFeatures
              ?.map(
                (feature) =>
                  `<li><i class="fas fa-check-circle"></i> ${feature}</li>`
              )
              .join("") || "<li>No features listed.</li>"
          }
        </ul>
        <h3>Specifications</h3>
        <ul class="specs-list" id="productSpecs">
          ${
            product.specifications
              ?.map(
                (spec) =>
                  `<li><i class="fas fa-cog"></i> <strong>${spec.key}:</strong> ${spec.value}</li>`
              )
              .join("") || "<li>No specifications listed.</li>"
          }
        </ul>
        <div class="action-buttons">
          <button class="enquiry-btn submit-btn" id="enquiryBtn">
            <i class="fas fa-question-circle"></i> Enquiry
          </button>
          <a href="https://wa.me/919873906044?text=Hello%20Vaishno%20Electricals,%20I%20have%20an%20inquiry%20about%20${encodeURIComponent(
            product.name
          )}" target="_blank" class="whatsapp-btn" id="whatsappLink">
            <i class="fab fa-whatsapp"></i> WhatsApp
          </a>
        </div>
      </div>
    `;
    const materialSpec = product.specifications?.find(
      (spec) =>
        spec.key.toLowerCase().includes("material") ||
        spec.key.toLowerCase().includes("coating")
    );
    technicalDescription.textContent = materialSpec
      ? `Crafted with ${materialSpec.value.toLowerCase()} for superior durability and safety, this product meets stringent industry standards.`
      : "Our products use premium materials to ensure longevity and safety.";
    const benefits = generateBenefits(product);
    benefitsGrid.innerHTML = benefits
      .map(
        (benefit) => `
      <div class="benefit-card fade-in">
        <i class="${benefit.icon}"></i>
        <h4>${benefit.title}</h4>
        <p>${benefit.description}</p>
      </div>
    `
      )
      .join("");
    whatsappFloat.href = `https://wa.me/919873906044?text=Hello%20Vaishno%20Electricals,%20I%20have%20an%20inquiry%20about%20${encodeURIComponent(
      product.name
    )}`;
    enquiryProduct.value = product.name; // CHANGED: Retained for initial load
    document.getElementById("enquiryBtn").addEventListener("click", openModal);
    document
      .getElementById("enquiryBtnTech")
      .addEventListener("click", openModal);
    initFadeIn();
  } catch (err) {
    console.error("Product load error:", err);
    // Fallback to mock data
    const product = mockProduct;
    currentProductName = product.name; // CHANGED: Store product name for mock data
    productContainer.innerHTML = `
      <div class="product-image-container">
        <img id="productImage" class="product-image-large" src="/images/${
          product.name
        }.jpg" alt="${
      product.name
    }" onerror="this.src='/images/placeholder.jpg'" loading="lazy" sizes="(max-width: 768px) 100vw, 50vw">
      </div>
      <div class="product-info">
        <h2 id="productName">${product.name}</h2>
        <div class="product-price">
          Price: <span id="productPrice">${product.price}</span>
          <span id="productQuantity" class="unit">/ ${product.quantity.value} ${
      product.quantity.unit
    }</span>
        </div>
        <p id="productDescription">${product.description}</p>
        <h3>Key Features</h3>
        <ul class="features-list" id="productFeatures">
          ${product.keyFeatures
            .map(
              (feature) =>
                `<li><i class="fas fa-check-circle"></i> ${feature}</li>`
            )
            .join("")}
        </ul>
        <h3>Specifications</h3>
        <ul class="specs-list" id="productSpecs">
          ${product.specifications
            .map(
              (spec) =>
                `<li><i class="fas fa-cog"></i> <strong>${spec.key}:</strong> ${spec.value}</li>`
            )
            .join("")}
        </ul>
        <div class="action-buttons">
          <button class="enquiry-btn submit-btn" id="enquiryBtn">
            <i class="fas fa-question-circle"></i> Enquiry
          </button>
          <a href="https://wa.me/919873906044?text=Hello%20Vaishno%20Electricals,%20I%20have%20an%20inquiry%20about%20${encodeURIComponent(
            product.name
          )}" target="_blank" class="whatsapp-btn" id="whatsappLink">
            <i class="fab fa-whatsapp"></i> WhatsApp
          </a>
        </div>
      </div>
    `;
    technicalDescription.textContent =
      "Our products use premium materials to ensure longevity and safety.";
    const benefits = generateBenefits(product);
    benefitsGrid.innerHTML = benefits
      .map(
        (benefit) => `
      <div class="benefit-card fade-in">
        <i class="${benefit.icon}"></i>
        <h4>${benefit.title}</h4>
        <p>${benefit.description}</p>
      </div>
    `
      )
      .join("");
    whatsappFloat.href = `https://wa.me/919873906044?text=Hello%20Vaishno%20Electricals,%20I%20have%20an%20inquiry%20about%20${encodeURIComponent(
      product.name
    )}`;
    enquiryProduct.value = product.name; // CHANGED: Retained for initial load
    document.getElementById("enquiryBtn").addEventListener("click", openModal);
    document
      .getElementById("enquiryBtnTech")
      .addEventListener("click", openModal);
    productContainer.insertAdjacentHTML(
      "beforeend",
      '<p style="color: #ef4444; text-align: center;">Failed to load product data. Showing sample data. <button onclick="loadProduct()" style="background: #3b82f6; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">Retry</button></p>'
    );
    initFadeIn();
  } finally {
    pageLoading.classList.add("hidden");
    setTimeout(() => (pageLoading.style.display = "none"), 500);
  }
}

// Generate Benefits
function generateBenefits(product) {
  const category = product.category?.name?.toLowerCase() || "";
  const defaultBenefits = [
    {
      icon: "fas fa-shield-alt",
      title: "Enhanced Safety",
      description: "Protects against electrical hazards.",
    },
    {
      icon: "fas fa-tools",
      title: "Easy Installation",
      description: "Quick and simple setup.",
    },
    {
      icon: "fas fa-leaf",
      title: "Eco-Friendly",
      description: "Sustainable materials used.",
    },
  ];
  if (category.includes("earthing")) {
    return [
      {
        icon: "fas fa-bolt",
        title: "Superior Grounding",
        description: "Reliable earthing for safety.",
      },
      ...defaultBenefits.slice(1),
    ];
  } else if (category.includes("lightning")) {
    return [
      {
        icon: "fas fa-cloud-bolt",
        title: "Lightning Protection",
        description: "Shields from lightning strikes.",
      },
      ...defaultBenefits.slice(1),
    ];
  }
  return defaultBenefits;
}

// Load Related Products
async function loadRelatedProducts() {
  const productsGrid = document.getElementById("productsGrid");
  try {
    const response = await fetch("/api/products");
    if (!response.ok) throw new Error("Failed to fetch products");
    const products = await response.json();
    renderProducts(products);
  } catch (err) {
    console.error("Related products error:", err);
    renderProducts(mockProducts);
  }
}

function renderProducts(products) {
  const productsGrid = document.getElementById("productsGrid");
  productsGrid.innerHTML = "";
  if (!products?.length) {
    productsGrid.innerHTML = "<p>No products available.</p>";
    return;
  }
  products.forEach((product) => {
    const card = `
            <div class="product-card fade-in">
              <img src="/images/${product.name}.jpg" alt="${
      product.name
    }" class="product-image" onerror="this.src='/images/placeholder.jpg'" loading="lazy" sizes="(max-width: 768px) 100vw, 33vw">
              <h3>${product.name}</h3>
              <p>${product.shortDescription || "No description available."}</p>
              <div class="product-overlay">
                <a href="/products/${product.id}" class="product-btn">
                  <i class="fas fa-eye"></i> View
                </a>
                <button class="product-btn enquiry-btn" data-product="${
                  product.name
                }">
                  <i class="fas fa-question-circle"></i> Enquiry
                </button>
              </div>
            </div>
          `;
    productsGrid.insertAdjacentHTML("beforeend", card);
  });
  document.querySelectorAll(".enquiry-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById("enquiryProduct").value =
        btn.getAttribute("data-product");
      openModal();
    });
  });
  initFadeIn();
}

// Load Dropdown and Footer
async function loadDropdownAndFooter() {
  const dropdown = document.getElementById("productsDropdown");
  const footerProducts = document.getElementById("footerProducts");
  try {
    const response = await fetch("/api/products");
    if (!response.ok) throw new Error("Failed to fetch products");
    const products = await response.json();
    dropdown.innerHTML = "";
    footerProducts.innerHTML = "";
    if (!products?.length) {
      dropdown.innerHTML = '<li><a href="#">No products available</a></li>';
      return;
    }
    products.forEach((product, index) => {
      const item = `<li><a href="/products/${product.id}">${product.name}</a></li>`;
      dropdown.insertAdjacentHTML("beforeend", item);
      if (index < 5) footerProducts.insertAdjacentHTML("beforeend", item);
    });
  } catch (err) {
    console.error("Dropdown/footer error:", err);
  }
}

// Enquiry Modal
const enquiryModal = document.getElementById("enquiryModal");
const closeModalBtn = enquiryModal.querySelector(".close");
const enquiryProductInput = document.getElementById("enquiryProduct");

function openModal() {
  enquiryModal.style.display = "flex";
  enquiryProductInput.value = currentProductName; // CHANGED: Set product name when modal opens
  const firstFocusable = createFocusTrap(
    "enquiryModal",
    "input, textarea, button, .close"
  );
  firstFocusable.focus();
}

function closeModal() {
  enquiryModal.style.display = "none";
  document.getElementById("enquiryForm").reset();
  document.getElementById("enquirySuccess").classList.remove("active");
  document.getElementById("enquiryLoading").classList.remove("active");
  document.querySelectorAll("#enquiryForm .error-message").forEach((el) => {
    el.style.display = "none";
  });
}

closeModalBtn.addEventListener("click", closeModal);
window.addEventListener("click", (e) => {
  if (e.target === enquiryModal) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && enquiryModal.style.display === "flex") closeModal();
});

// Form Validation and Submission
function validateForm(formId) {
  const form = document.getElementById(formId);
  const inputs = form.querySelectorAll(
    "input[required], textarea[required], select[required]"
  );
  let isValid = true;

  inputs.forEach((input) => {
    const error = input.nextElementSibling.nextElementSibling;
    if (!input.checkValidity()) {
      error.style.display = "block";
      isValid = false;
    } else {
      error.style.display = "none";
    }
  });

  return isValid;
}

async function submitForm(formId, url, successMessageId, loadingId) {
  const form = document.getElementById(formId);
  const successMessage = document.getElementById(successMessageId);
  const loading = document.getElementById(loadingId);

  if (!validateForm(formId)) return;

  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  loading.classList.add("active");
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Submission failed");
    form.reset();
    successMessage.classList.add("active");
    setTimeout(() => successMessage.classList.remove("active"), 3000);
  } catch (err) {
    console.error("Form submission error:", err);
    alert("Failed to submit form. Please try again.");
  } finally {
    loading.classList.remove("active");
  }
}

document.getElementById("enquiryForm").addEventListener("submit", (e) => {
  e.preventDefault();
  submitForm("enquiryForm", "/api/enquiry", "enquirySuccess", "enquiryLoading");
});

document.getElementById("contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  submitForm("contactForm", "/api/contact", "contactSuccess", "contactLoading");
});

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadProduct();
  loadRelatedProducts();
  loadDropdownAndFooter();
  initFadeIn();
});
