document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === "U") {
    e.preventDefault();
    document.getElementById("adminPrompt").classList.add("active");
    document.getElementById("adminPassword").focus();
  }
});

async function authenticateAdmin() {
  const password = document.getElementById("adminPassword").value.trim();
  const adminPrompt = document.getElementById("adminPrompt");

  if (!password) {
    alert("Please enter a password");
    return;
  }

  try {
    const response = await fetch("/api/admin/authenticate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server response:", errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.authenticated) {
      localStorage.setItem("adminAuth", "true");
      localStorage.setItem("adminToken", data.token);
      adminPrompt.classList.remove("active");
      window.location.href = "/admin";
    } else {
      alert("Authentication failed.");
      document.getElementById("adminPassword").value = "";
    }
  } catch (error) {
    console.error("Authentication error:", error);
    alert(
      `Authentication failed: ${error.message}. Please check if the server is running or contact support.`
    );
    document.getElementById("adminPassword").value = "";
  }
}

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const navLinks = document.getElementById("navLinks");
const navItems = document.querySelectorAll(".nav-item");

mobileMenuBtn.addEventListener("click", () => {
  navLinks.classList.toggle("active");
  const icon = mobileMenuBtn.querySelector("i");
  icon.classList.toggle("fa-bars");
  icon.classList.toggle("fa-times");
  navItems.forEach((item) => item.classList.remove("active"));
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

// Close dropdowns when clicking outside
document.addEventListener("click", (e) => {
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

// Close mobile menu when clicking nav links
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("active");
    const icon = mobileMenuBtn.querySelector("i");
    icon.classList.add("fa-bars");
    icon.classList.remove("fa-times");
    navItems.forEach((item) => item.classList.remove("active"));
  });
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
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.animation = "fadeInUp 0.8s ease forwards";
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll(".fade-in").forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(20px)";
  observer.observe(el);
});

// Scroll to Top
const scrollTopBtn = document.getElementById("scrollTop");
window.addEventListener("scroll", () => {
  scrollTopBtn.classList.toggle("visible", window.scrollY > 300);
});

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Load Products
async function loadProducts() {
  try {
    const response = await fetch("/api/products");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    const products = await response.json();
    const productsGrid = document.getElementById("productsGrid");
    const productsDropdown = document.getElementById("productsDropdown");
    const footerProducts = document.getElementById("footerProducts");

    productsGrid.innerHTML = "";
    productsDropdown.innerHTML = "";
    footerProducts.innerHTML = "";

    if (!Array.isArray(products)) {
      throw new Error("Response is not an array");
    }
    if (products.length === 0) {
      productsGrid.innerHTML = "<p>No products found.</p>";
      return;
    }

    products.forEach((product) => {
      const card = `
        <div class="product-card fade-in">
          <img src="${product.image}" alt="${product.name}" class="product-image" />
          <h3>${product.name}</h3>
          <p>${product.shortDescription}</p>
          <div class="product-overlay">
            <a href="/products/${product.id}" class="product-btn">
              <i class="fas fa-eye"></i> View Product
            </a>
            <button class="enquiry-btn" data-product="${product.name}">
              <i class="fas fa-question-circle"></i> Enquiry
            </button>
          </div>
        </div>
      `;
      productsGrid.insertAdjacentHTML("beforeend", card);

      const dropdownItem = `<li><a href="/products/${product.id}">${product.name}</a></li>`;
      productsDropdown.insertAdjacentHTML("beforeend", dropdownItem);

      const footerItem = `<li><a href="/products/${product.id}">${product.name}</a></li>`;
      footerProducts.insertAdjacentHTML("beforeend", footerItem);
    });

    // Re-observe new elements for animations
    document.querySelectorAll(".fade-in").forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      observer.observe(el);
    });
  } catch (error) {
    console.error("Error loading products:", error);
    document.getElementById("productsGrid").innerHTML =
      "<p>Error loading products. Please try again later.</p>";
  }
}

// Form Submission Handler
async function handleFormSubmit(e, formType) {
  e.preventDefault();
  const form = e.target;
  const loading = document.getElementById(`${formType}Loading`);
  const success = document.getElementById(`${formType}Success`);
  const formData = new FormData(form);
  let data, url;

  // Reset error messages
  document.querySelectorAll(`#${formType}Form .error-message`).forEach((el) => {
    el.style.display = "none";
  });

  if (formType === "contact") {
    data = {
      name: formData.get("name").trim(),
      email: formData.get("email").trim(),
      phone: formData.get("phone").trim(),
      inquiry: formData.get("inquiry"),
      message: formData.get("message").trim(),
    };

    // Validation
    let isValid = true;
    if (!data.name) {
      document.querySelector("#name ~ .error-message").style.display = "block";
      isValid = false;
    }
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      document.querySelector("#email ~ .error-message").style.display = "block";
      isValid = false;
    }
    if (!data.phone || !/^[0-9]{10}$/.test(data.phone)) {
      document.querySelector("#phone ~ .error-message").style.display = "block";
      isValid = false;
    }
    if (!data.inquiry) {
      document.querySelector("#inquiry ~ .error-message").style.display =
        "block";
      isValid = false;
    }
    if (!data.message) {
      document.querySelector("#message ~ .error-message").style.display =
        "block";
      isValid = false;
    }
    if (!isValid) return;

    url = "/api/admin/contact";
  } else {
    data = {
      name: formData.get("name").trim(),
      email: formData.get("email").trim(),
      phone: formData.get("phone").trim(),
      product: formData.get("product").trim(),
      message: formData.get("message").trim(),
    };

    // Validation
    let isValid = true;
    if (!data.name) {
      document.querySelector("#enquiryName ~ .error-message").style.display =
        "block";
      isValid = false;
    }
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      document.querySelector("#enquiryEmail ~ .error-message").style.display =
        "block";
      isValid = false;
    }
    if (!data.phone || !/^[0-9]{10}$/.test(data.phone)) {
      document.querySelector("#enquiryPhone ~ .error-message").style.display =
        "block";
      isValid = false;
    }
    if (!data.message) {
      document.querySelector("#enquiryMessage ~ .error-message").style.display =
        "block";
      isValid = false;
    }
    if (!isValid) return;

    url = "/api/enquiry";
  }

  // Show loading state
  loading.classList.add("active");
  form.querySelectorAll("input, select, textarea, button").forEach((el) => {
    el.disabled = true;
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      // Show success message
      success.classList.add("active");
      form.reset();
      setTimeout(() => {
        success.classList.remove("active");
        if (formType === "enquiry") {
          document.getElementById("enquiryModal").style.display = "none";
        }
      }, 3000);
    } else {
      throw new Error("Failed to submit form");
    }
  } catch (error) {
    console.error(`Error submitting ${formType} form:`, error);
    const errorMessage = document.createElement("div");
    errorMessage.className = "error-message";
    errorMessage.textContent = "An error occurred. Please try again later.";
    errorMessage.style.display = "block";
    form.appendChild(errorMessage);
    setTimeout(() => errorMessage.remove(), 3000);
  } finally {
    // Hide loading state
    loading.classList.remove("active");
    form.querySelectorAll("input, select, textarea, button").forEach((el) => {
      el.disabled = false;
    });
  }
}

// Contact and Enquiry Form Submission
const contactForm = document.getElementById("contactForm");
const enquiryForm = document.getElementById("enquiryForm");

if (contactForm) {
  contactForm.addEventListener("submit", (e) => handleFormSubmit(e, "contact"));
}

if (enquiryForm) {
  enquiryForm.addEventListener("submit", (e) => handleFormSubmit(e, "enquiry"));
}

// Enquiry Modal
const enquiryModal = document.getElementById("enquiryModal");
const enquiryProductInput = document.getElementById("enquiryProduct");
const closeModal = document.querySelector(".modal .close");

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("enquiry-btn")) {
    const productName = e.target.getAttribute("data-product");
    enquiryProductInput.value = productName;
    enquiryModal.style.display = "block";
  }
});

closeModal.addEventListener("click", () => {
  enquiryModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target == enquiryModal) {
    enquiryModal.style.display = "none";
  }
});

// Search Functionality
const searchInput = document.getElementById("searchInput");
const searchSuggestions = document.getElementById("searchSuggestions");

searchInput.addEventListener("input", async () => {
  const query = searchInput.value.trim();
  if (query.length < 2) {
    searchSuggestions.classList.remove("active");
    searchSuggestions.innerHTML = "";
    return;
  }

  try {
    const response = await fetch(
      `/api/products/search/${encodeURIComponent(query)}`
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const products = await response.json();
    searchSuggestions.innerHTML = "";
    if (Array.isArray(products) && products.length > 0) {
      products.forEach((product) => {
        const li = document.createElement("li");
        li.textContent = product.name;
        li.addEventListener("click", () => {
          window.location.href = `/products/${product.id}`;
        });
        searchSuggestions.appendChild(li);
      });
      searchSuggestions.classList.add("active");
    } else {
      searchSuggestions.classList.remove("active");
    }
  } catch (error) {
    console.error("Search error:", error);
  }
});

document.addEventListener("click", (e) => {
  if (
    !searchInput.contains(e.target) &&
    !searchSuggestions.contains(e.target)
  ) {
    searchSuggestions.classList.remove("active");
  }
});

// Active Navigation
const sections = document.querySelectorAll("section");
const navLinksAll = document.querySelectorAll(".nav-links a");
const footerNavLinks = document.querySelectorAll(".footer-nav a");

const setActiveLink = () => {
  let current = "";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    if (window.scrollY >= sectionTop - 100) {
      current = section.getAttribute("id");
    }
  });

  navLinksAll.forEach((link) => {
    const href = link.getAttribute("href");
    const isActive =
      href.includes(current) ||
      (current === "products" && href.includes("/products"));
    link.classList.toggle("active", isActive);
  });

  footerNavLinks.forEach((link) => {
    link.classList.toggle(
      "active",
      link.getAttribute("href").includes(current)
    );
  });

  if (window.scrollY < 100) {
    navLinksAll.forEach((link) => link.classList.remove("active"));
    footerNavLinks.forEach((link) => link.classList.remove("active"));
  }
};

window.addEventListener("scroll", setActiveLink);

// Page Load
window.addEventListener("load", () => {
  document.body.style.opacity = "1";
  setActiveLink();
  loadProducts();
});

document.body.style.opacity = "0";
document.body.style.transition = "opacity 0.5s ease";
