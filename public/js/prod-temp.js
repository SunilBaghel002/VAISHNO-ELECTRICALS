// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const navLinks = document.getElementById("navLinks");
const navItems = document.querySelectorAll(".nav-item");

mobileMenuBtn.addEventListener("click", () => {
  navLinks.classList.toggle("active");
  const icon = mobileMenuBtn.querySelector("i");
  icon.classList.toggle("fa-bars");
  icon.classList.toggle("fa-times");
});

navItems.forEach((item) => {
  item.addEventListener("click", (e) => {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      const isActive = item.classList.contains("active");
      navItems.forEach((i) => i.classList.remove("active"));
      if (!isActive) {
        item.classList.add("active");
      }
    }
  });
});

document.addEventListener("mousedown", (e) => {
  if (!e.target.closest(".nav-item") && !e.target.closest(".mobile-menu-btn")) {
    navItems.forEach((item) => item.classList.remove("active"));
    if (window.innerWidth <= 768 && navLinks.classList.contains("active")) {
      navLinks.classList.remove("active");
      const icon = mobileMenuBtn.querySelector("i");
      icon.classList.add("fa-bars");
      icon.classList.remove("fa-times");
    }
  }
});

// Header Scroll Effect
const header = document.getElementById("header");
window.addEventListener("scroll", () => {
  header.classList.toggle("header-scrolled", window.scrollY > 100);
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      const headerHeight = header.offsetHeight;
      window.scrollTo({
        top: target.offsetTop - headerHeight,
        behavior: "smooth",
      });
    }
  });
});

// Scroll Animations
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animation = "fadeInUp 0.8s ease forwards";
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
);

document.querySelectorAll(".fade-in").forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(20px)";
  observer.observe(el);
});

// Scroll to Top
const scrollBtn = document.getElementById("scrollBtn");
window.addEventListener("scroll", () => {
  scrollBtn.classList.toggle("visible", window.scrollY > 300);
});
scrollBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Load Products for Dropdown and Footer
async function loadDropdownAndFooter() {
  try {
    const response = await fetch("/api/products");
    if (!response.ok) throw new Error("Failed to fetch products");
    const products = await response.json();
    const dropdown = document.getElementById("productsDropdown");
    const footerProducts = document.getElementById("footerProducts");
    dropdown.innerHTML = "";
    footerProducts.innerHTML = "";
    if (!Array.isArray(products) || products.length === 0) {
      dropdown.innerHTML = '<li><a href="#">No products available</a></li>';
      return;
    }
    products.forEach((product, index) => {
      const dropdownItem = `<li><a href="/products/${product.id}">${product.name}</a></li>`;
      dropdown.insertAdjacentHTML("beforeend", dropdownItem);
      if (index < 5) {
        const footerItem = `<li><a href="/products/${product.id}">${product.name}</a></li>`;
        footerProducts.insertAdjacentHTML("beforeend", footerItem);
      }
    });
  } catch (error) {
    console.error("Error loading products:", error);
  }
}

// Load Product Details
// Load Product Details
async function loadProduct() {
  const pathSegments = window.location.pathname.split("/");
  const productId = pathSegments[pathSegments.length - 1].replace(
    /\.html$/,
    ""
  );
  if (!productId || productId === "products") {
    document.querySelector(".product-details .container").innerHTML =
      "<p>Product ID is missing.</p>";
    return;
  }
  try {
    const response = await fetch(`/api/products/${productId}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Product not found");
    }
    const product = await response.json();
    document.getElementById("productName").textContent = product.name;
    document.getElementById("productPrice").textContent =
      typeof product.price === "string"
        ? product.price
        : `₹${(product.price || 0).toFixed(2)}`;
    document.getElementById("productQuantity").textContent = product.quantity
      ? `/ ${product.quantity.value} ${
          product.quantity.unit === "kg"
            ? "kg"
            : product.quantity.unit === "meter"
            ? "meter"
            : "item"
        }`
      : "/ unit";
    document.getElementById("productImage").src =`
      product.image || "/images/${product.name}.jpg";
    document.getElementById("productImage").alt = product.name;`
    document.getElementById("productDescription").textContent =
      product.description;
    const featuresList = document.getElementById("productFeatures");
    featuresList.innerHTML = "";
    (product.keyFeatures || []).forEach((feature) => {
      featuresList.insertAdjacentHTML(
        "beforeend",
        `<li><i class="fas fa-check-circle"></i> ${feature}</li>`
      );
    });
    const specsList = document.getElementById("productSpecs");
    specsList.innerHTML = "";
    (product.specifications || []).forEach((spec) => {
      specsList.insertAdjacentHTML(
        "beforeend",
        `<li><i class="fas fa-cog"></i> <strong>${spec.key}:</strong> ${spec.value}</li>`
      );
    });
    const materialSpec = product.specifications.find(
      (spec) =>
        spec.key.toLowerCase().includes("material") ||
        spec.key.toLowerCase().includes("coating")
    );
    document.getElementById("materialDescription").textContent = materialSpec
      ? `This product is crafted with ${materialSpec.value.toLowerCase()} to ensure durability and safety. Our materials are selected to meet stringent industry standards, providing reliable performance.`
      : "Our products are crafted with premium materials to ensure durability and safety. Specific details are tailored to meet industry requirements, providing reliable performance in various environments.";
    const whatsappLink = document.getElementById("whatsappLink");
    whatsappLink.href = `https://wa.me/919873906044?text=Hello%20VAISHNO%20ELECTRICALS,%20I%20have%20an%20inquiry%20about%20${encodeURIComponent(
      product.name
    )}`;
    document.getElementById("enquiryProduct").value = product.name;
  } catch (error) {
    console.error("Error loading product:", error);
    document.querySelector(".product-details .container").innerHTML = `<p>${
      error.message || "Failed to load product details."
    }</p>`;
  }
}

// Enquiry Modal
const enquiryModal = document.getElementById("enquiryModal");
const enquiryBtn = document.getElementById("enquiryBtn");
const enquiryBtn2 = document.getElementById("enquiryBtn2");
const enquiryBtn3 = document.getElementById("enquiryBtn3");
const closeModal = document.querySelector(".close");

function openModal() {
  enquiryModal.style.display = "flex";
}

function closeModalFunc() {
  enquiryModal.style.display = "none";
  document.getElementById("enquiryForm").reset();
  document.getElementById("enquirySuccess").classList.remove("active");
  document.getElementById("enquiryLoading").classList.remove("active");
  document.querySelectorAll("#enquiryForm .error-message").forEach((el) => {
    el.style.display = "none";
  });
}

enquiryBtn.addEventListener("click", openModal);
enquiryBtn2.addEventListener("click", openModal);
enquiryBtn3.addEventListener("click", openModal);
closeModal.addEventListener("click", closeModalFunc);
window.addEventListener("click", (e) => {
  if (e.target === enquiryModal) closeModalFunc();
});

// Enquiry Form Submission
const enquiryForm = document.getElementById("enquiryForm");
enquiryForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const loading = document.getElementById("enquiryLoading");
  const success = document.getElementById("enquirySuccess");
  const errorMessages = enquiryForm.querySelectorAll(".error-message");
  errorMessages.forEach((el) => (el.style.display = "none"));
  let hasError = false;

  const name = document.getElementById("enquiryName").value.trim();
  const email = document.getElementById("enquiryEmail").value.trim();
  const phone = document.getElementById("enquiryPhone").value.trim();
  const product = document.getElementById("enquiryProduct").value.trim();
  const message = document.getElementById("enquiryMessage").value.trim();

  if (!name) {
    enquiryForm.querySelector(
      "#enquiryName + label + .error-message"
    ).style.display = "block";
    hasError = true;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    enquiryForm.querySelector(
      "#enquiryEmail + label + .error-message"
    ).style.display = "block";
    hasError = true;
  }
  if (!phone || !/^[0-9]{10}$/.test(phone)) {
    enquiryForm.querySelector(
      "#enquiryPhone + label + .error-message"
    ).style.display = "block";
    hasError = true;
  }
  if (!message) {
    enquiryForm.querySelector(
      "#enquiryMessage + label + .error-message"
    ).style.display = "block";
    hasError = true;
  }

  if (hasError) return;

  loading.classList.add("active");
  success.classList.remove("active");

  try {
    const response = await fetch("/api/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, product, message }),
    });
    if (response.ok) {
      success.classList.add("active");
      enquiryForm.reset();
      setTimeout(closeModalFunc, 2000);
    } else {
      throw new Error("Failed to send enquiry");
    }
  } catch (error) {
    console.error("Error sending enquiry:", error);
    errorMessages[0].textContent = "An error occurred. Please try again.";
    errorMessages[0].style.display = "block";
  } finally {
    loading.classList.remove("active");
  }
});

// Contact Form Submission
const contactForm = document.getElementById("contactForm");
contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const loading = document.getElementById("contactLoading");
  const success = document.getElementById("contactSuccess");
  const errorMessages = contactForm.querySelectorAll(".error-message");
  errorMessages.forEach((el) => (el.style.display = "none"));
  let hasError = false;

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const inquiry = document.getElementById("inquiry").value;
  const message = document.getElementById("message").value.trim();

  if (!name) {
    contactForm.querySelector("#name + label + .error-message").style.display =
      "block";
    hasError = true;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    contactForm.querySelector("#email + label + .error-message").style.display =
      "block";
    hasError = true;
  }
  if (!phone || !/^[0-9]{10}$/.test(phone)) {
    contactForm.querySelector("#phone + label + .error-message").style.display =
      "block";
    hasError = true;
  }
  if (!inquiry) {
    contactForm.querySelector(
      "#inquiry + label + .error-message"
    ).style.display = "block";
    hasError = true;
  }
  if (!message) {
    contactForm.querySelector(
      "#message + label + .error-message"
    ).style.display = "block";
    hasError = true;
  }

  if (hasError) return;

  loading.classList.add("active");
  success.classList.remove("active");

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, inquiry, message }),
    });
    if (response.ok) {
      success.classList.add("active");
      contactForm.reset();
      setTimeout(() => success.classList.remove("active"), 3000);
    } else {
      throw new Error("Failed to send message");
    }
  } catch (error) {
    console.error("Error sending message:", error);
    errorMessages[0].textContent = "An error occurred. Please try again.";
    errorMessages[0].style.display = "block";
  } finally {
    loading.classList.remove("active");
  }
});

// Admin Authentication
function authenticateAdmin() {
  const password = document.getElementById("adminPassword").value;
  fetch("/api/admin/authenticate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Invalid password");
      }
    })
    .then((data) => {
      localStorage.setItem("adminAuth", "true");
      localStorage.setItem("adminToken", data.token);
      window.location.href = "/admin";
    })
    .catch((error) => {
      console.error("Authentication error:", error);
      document.getElementById("adminPassword").value = "";
      alert("Invalid password. Please try again.");
    });
}

// Initialize
window.addEventListener("load", () => {
  document.body.style.opacity = "1";
  loadProduct();
  loadDropdownAndFooter();
});

document.body.style.opacity = "0";
document.body.style.transition = "opacity 0.5s ease";
