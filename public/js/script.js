// Mock data for fallback if API fails
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

// Debounce utility function
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Sticky Search Bar
const searchContainer = document.querySelector(".search-container");
const heroSection = document.getElementById("home");
let lastScrollY = window.scrollY;

window.addEventListener("scroll", () => {
  if (!searchContainer || !heroSection) return;

  const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
  const currentScrollY = window.scrollY;
  const isScrollingUp = currentScrollY < lastScrollY;

  if (currentScrollY > heroBottom) {
    searchContainer.classList.add("sticky");
  } else {
    searchContainer.classList.remove("sticky");
  }

  // Ensure search bar is always visible when scrolling up
  if (isScrollingUp && currentScrollY > heroSection.offsetTop) {
    searchContainer.classList.add("sticky");
  }

  lastScrollY = currentScrollY;
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    e.preventDefault();
    const targetId = anchor.getAttribute("href");
    const target = document.querySelector(targetId);
    if (target && header) {
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

// Initialize fade-in elements
const initFadeInElements = () => {
  document.querySelectorAll(".fade-in").forEach((el) => {
    if (!el.style.opacity) {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      observer.observe(el);
    }
  });
};

// Scroll to Top
const scrollTopBtn = document.getElementById("scrollTop");
if (scrollTopBtn) {
  window.addEventListener("scroll", () => {
    scrollTopBtn.classList.toggle("visible", window.scrollY > 300);
  });

  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Load Products with Minimum 2-Second Delay
async function loadProducts() {
  const productsGrid = document.getElementById("productsGrid");
  const productsLoading = document.getElementById("productsLoading");
  const productsError = document.getElementById("productsError");
  const productsDropdown = document.getElementById("productsDropdown");
  const footerProducts = document.getElementById("footerProducts");

  if (!productsGrid || !productsLoading || !productsError) return;

  productsLoading.style.display = "flex";
  productsError.style.display = "none";
  productsGrid.style.display = "none";

  const minDelay = new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    const response = await Promise.race([
      fetch("/api/products"),
      minDelay.then(() => Promise.reject(new Error("Timeout"))),
    ]);

    await minDelay; // Ensure minimum 2-second delay

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const products = await response.json();
    displayProducts(products);
  } catch (error) {
    console.error("Error loading products:", error);
    productsError.style.display = "block";
    displayProducts(mockProducts);
  } finally {
    productsLoading.style.display = "none";
    productsGrid.style.display = "grid";
  }

  function displayProducts(products) {
    if (!productsGrid || !productsDropdown || !footerProducts) return;

    productsGrid.innerHTML = "";
    products.forEach((product) => {
      const card = `
          <div class="product-card fade-in">
            <img src="/images/${product.name}.jpg" alt="${product.name}" class="product-image" loading="lazy" />
            <h3>${product.name}</h3>
            <p>${product.shortDescription}</p>
            <div class="product-overlay">
              <a href="/products/${product.id}" class="product-btn">
                <i class="fas fa-eye"></i> View Product
              </a>
              <button class="product-btn enquiry-btn" data-product="${product.name}">
                <i class="fas fa-question-circle"></i> Enquiry
              </button>
            </div>
          </div>
        `;
      productsGrid.insertAdjacentHTML("beforeend", card);
    });

    productsDropdown.innerHTML = "";
    products.forEach((product) => {
      const li = `<li><a href="/products/${product.id}">${product.name}</a></li>`;
      productsDropdown.insertAdjacentHTML("beforeend", li);
    });

    footerProducts.innerHTML = "";
    products.forEach((product) => {
      const li = `<li><a href="/products/${product.id}">${product.name}</a></li>`;
      footerProducts.insertAdjacentHTML("beforeend", li);
    });

    initFadeInElements();
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

  if (!loading || !success) return;

  form.querySelectorAll(".error-message").forEach((el) => {
    el.style.display = "none";
  });

  if (formType === "contact") {
    data = {
      name: formData.get("name")?.trim() || "",
      email: formData.get("email")?.trim() || "",
      phone: formData.get("phone")?.trim() || "",
      inquiry: formData.get("inquiry") || "",
      message: formData.get("message")?.trim() || "",
    };

    let isValid = true;
    if (!data.name) {
      form.querySelector("#name ~ .error-message").style.display = "block";
      isValid = false;
    }
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      form.querySelector("#email ~ .error-message").style.display = "block";
      isValid = false;
    }
    if (!data.phone || !/^[0-9]{10}$/.test(data.phone)) {
      form.querySelector("#phone ~ .error-message").style.display = "block";
      isValid = false;
    }
    if (!data.inquiry) {
      form.querySelector("#inquiry ~ .error-message").style.display = "block";
      isValid = false;
    }
    if (!data.message) {
      form.querySelector("#message ~ .error-message").style.display = "block";
      isValid = false;
    }
    if (!isValid) return;

    url = "/api/contact";
  } else {
    data = {
      name: formData.get("name")?.trim() || "",
      email: formData.get("email")?.trim() || "",
      phone: formData.get("phone")?.trim() || "",
      product: formData.get("product")?.trim() || "",
      message: formData.get("message")?.trim() || "",
    };

    let isValid = true;
    const fields = ["name", "email", "phone", "product", "message"];
    fields.forEach((field) => {
      if (!data[field]) {
        form.querySelector(
          `#enquiry${
            field.charAt(0).toUpperCase() + field.slice(1)
          } ~ .error-message`
        ).style.display = "block";
        isValid = false;
      }
    });
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      form.querySelector("#enquiryEmail ~ .error-message").style.display =
        "block";
      isValid = false;
    }
    if (data.phone && !/^[0-9]{10}$/.test(data.phone)) {
      form.querySelector("#enquiryPhone ~ .error-message").style.display =
        "block";
      isValid = false;
    }
    if (!isValid) return;

    url = "/api/enquiry";
  }

  loading.classList.add("active");
  form
    .querySelectorAll("input, select, textarea, button")
    .forEach((el) => (el.disabled = true));

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    success.classList.add("active");
    form.reset();
    setTimeout(() => {
      success.classList.remove("active");
      if (formType === "enquiry") {
        document.getElementById("enquiryModal").style.display = "none";
      }
    }, 3000);
  } catch (error) {
    console.error(`Error submitting ${formType} form:`, error);
    const errorMessage = document.createElement("div");
    errorMessage.className = "error-message";
    errorMessage.textContent = "An error occurred. Please try again later.";
    errorMessage.style.display = "block";
    form.appendChild(errorMessage);
    setTimeout(() => errorMessage.remove(), 3000);
  } finally {
    loading.classList.remove("active");
    form
      .querySelectorAll("input, select, textarea, button")
      .forEach((el) => (el.disabled = false));
  }
}

// Form Event Listeners
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

if (enquiryModal && enquiryProductInput) {
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("enquiry-btn")) {
      const productName = e.target.getAttribute("data-product");
      enquiryProductInput.value = productName;
      enquiryModal.style.display = "block";
    }
  });

  closeModal?.addEventListener("click", () => {
    enquiryModal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === enquiryModal) {
      enquiryModal.style.display = "none";
    }
  });
}

// Search Functionality
const searchInput = document.getElementById("searchInput");
const searchSuggestions = document.getElementById("searchSuggestions");

if (searchInput && searchSuggestions) {
  const handleSearch = debounce(async () => {
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
      if (products.length > 0) {
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
      console.error("Error fetching search results:", error);
    }
  }, 300);

  searchInput.addEventListener("input", handleSearch);

  document.addEventListener("click", (e) => {
    if (
      !searchInput.contains(e.target) &&
      !searchSuggestions.contains(e.target)
    ) {
      searchSuggestions.classList.remove("active");
    }
  });
}

// Admin Prompt
const adminPrompt = document.getElementById("adminPrompt");
const adminPassword = document.getElementById("adminPassword");

if (adminPrompt && adminPassword) {
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === "U") {
      e.preventDefault();
      adminPrompt.classList.add("active");
      adminPassword.focus();
    }
  });
}

async function authenticateAdmin() {
  if (!adminPassword || !adminPrompt) return;

  const password = adminPassword.value.trim();

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
      adminPassword.value = "";
    }
  } catch (error) {
    console.error("Authentication error:", error);
    alert(
      `Authentication failed: ${error.message}. Please check if the server is running or contact support.`
    );
    adminPassword.value = "";
  }
}

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
    const href = link.getAttribute("href");
    link.classList.toggle("active", href.includes(current));
  });

  if (window.scrollY < 100) {
    navLinksAll[0]?.classList.add("active");
    footerNavLinks[0]?.classList.add("active");
  }
};

window.addEventListener("scroll", setActiveLink);

// Initial Load
window.addEventListener("load", () => {
  document.body.style.opacity = "1";
  setActiveLink();
  loadProducts();
  initFadeInElements();
});

document.body.style.opacity = "0";
document.body.style.transition = "opacity 0.5s ease";
