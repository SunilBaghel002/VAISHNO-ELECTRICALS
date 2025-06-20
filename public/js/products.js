// Mock data with categories
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

// Category metadata
const categoryMeta = {
  Earthing: {
    icon: "fas fa-bolt",
    description:
      "Reliable earthing solutions for electrical safety and grounding.",
  },
  "Lightning Protection": {
    icon: "fas fa-cloud-bolt",
    description: "Advanced systems to protect against lightning strikes.",
  },
  "Construction Use": {
    icon: "fas fa-tools",
    description: "Durable products designed for construction applications.",
  },
  Other: {
    icon: "fas fa-box",
    description: "Miscellaneous electrical safety products.",
  },
};

// Debounce utility
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Admin Prompt
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

if (mobileMenuBtn && navLinks) {
  mobileMenuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    const icon = mobileMenuBtn.querySelector("i");
    icon.classList.toggle("fa-bars");
    icon.classList.toggle("fa-times");
    navItems.forEach((item) => item.classList.remove("active"));
  });
}

if (navLinks) {
  navLinks.addEventListener("click", (e) => {
    const navItem = e.target.closest(".nav-item");
    if (navItem && window.innerWidth <= 768) {
      e.preventDefault();
      const isActive = navItem.classList.contains("active");
      navItems.forEach((item) => item.classList.remove("active"));
      if (!isActive) {
        navItem.classList.add("active");
      }
    }
  });
}

document.addEventListener("click", (e) => {
  if (
    !e.target.closest(".nav-item") &&
    !e.target.closest(".mobile-menu-btn") &&
    window.innerWidth <= 768
  ) {
    navItems.forEach((item) => item.classList.remove("active"));
    if (navLinks) {
      navLinks.classList.remove("active");
      const icon = mobileMenuBtn?.querySelector("i");
      if (icon) {
        icon.classList.add("fa-bars");
        icon.classList.remove("fa-times");
      }
    }
  }
});

navLinks?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    if (window.innerWidth <= 768) {
      navLinks.classList.remove("active");
      const icon = mobileMenuBtn?.querySelector("i");
      if (icon) {
        icon.classList.add("fa-bars");
        icon.classList.remove("fa-times");
      }
      navItems.forEach((item) => item.classList.remove("active"));
    }
  });
});

// Header Scroll Effect
const header = document.getElementById("header");
window.addEventListener("scroll", () => {
  if (header) {
    header.classList.toggle("header-scrolled", window.scrollY > 100);
  }
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

// Product Filters and Sorting
let allProducts = [];
const filterGroup = document.getElementById("filterGroup");
const sortSelect = document.getElementById("sortSelect");
const compareBtn = document.getElementById("compareBtn");

function populateFilters(categories) {
  filterGroup.innerHTML = "<h4>Filter by Category:</h4>";
  categories.forEach((category) => {
    const container = document.createElement("div");
    container.className = "filter-checkbox-container";
    container.innerHTML = `
            <input
              type="checkbox"
              class="filter-checkbox"
              id="filter-${category}"
              value="${category}"
              checked
              aria-label="Filter by ${category}"
            />
            <label class="filter-checkbox-label" for="filter-${category}">${category}</label>
          `;
    filterGroup.appendChild(container);
  });
  const clearBtn = document.createElement("button");
  clearBtn.className = "clear-filters";
  clearBtn.textContent = "Clear Filters";
  clearBtn.setAttribute("aria-label", "Clear all category filters");
  filterGroup.appendChild(clearBtn);

  // Add clear filters listener
  clearBtn.addEventListener("click", () => {
    document.querySelectorAll(".filter-checkbox").forEach((cb) => {
      cb.checked = true;
    });
    document.querySelectorAll(".category-card").forEach((card) => {
      card.classList.remove("active");
    });
    displayProducts(allProducts);
  });
}

function populateCategories(categories) {
  const categoriesGrid = document.getElementById("categoriesGrid");
  categoriesGrid.innerHTML = "";
  categories.forEach((category) => {
    const meta = categoryMeta[category] || {
      icon: "fas fa-box",
      description: "Miscellaneous products.",
    };
    const card = `
            <div
              class="category-card fade-in"
              data-category="${category}"
              role="button"
              tabindex="0"
              aria-label="Filter by ${category}"
            >
              <i class="${meta.icon}"></i>
              <h3>${category}</h3>
              <p>${meta.description}</p>
            </div>`;
    categoriesGrid.insertAdjacentHTML("beforeend", card);
  });

  // Add click and keypress listeners for category cards
  document.querySelectorAll(".category-card").forEach((card) => {
    const handleInteraction = () => {
      const category = card.getAttribute("data-category");
      const checkbox = document.getElementById(`filter-${category}`);
      if (checkbox) {
        document
          .querySelectorAll(".filter-checkbox")
          .forEach((cb) => (cb.checked = false));
        checkbox.checked = true;
        document
          .querySelectorAll(".category-card")
          .forEach((c) => c.classList.remove("active"));
        card.classList.add("active");
        displayProducts(allProducts);
        window.scrollTo({
          top:
            document.getElementById("products").offsetTop - header.offsetHeight,
          behavior: "smooth",
        });
      }
    };
    card.addEventListener("click", handleInteraction);
    card.addEventListener("keypress", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleInteraction();
      }
    });
  });

  initFadeInElements();
}

function applyFiltersAndSort(products) {
  let filteredProducts = [...products];

  // Apply category filters
  const checkboxes = document.querySelectorAll(".filter-checkbox:checked");
  const selectedCategories = Array.from(checkboxes).map((cb) => cb.value);
  if (selectedCategories.length > 0) {
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.category && selectedCategories.includes(product.category)
    );
  }

  // Apply sorting
  const sortValue = sortSelect.value;
  if (sortValue === "name-asc") {
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortValue === "name-desc") {
    filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
  }

  return filteredProducts;
}

function displayProducts(products) {
  const productsGrid = document.getElementById("productsGrid");
  const productsDropdown = document.getElementById("productsDropdown");
  const footerProducts = document.getElementById("footerProducts");

  if (!productsGrid || !productsDropdown || !footerProducts) return;

  productsGrid.innerHTML = "";
  productsDropdown.innerHTML = "";
  footerProducts.innerHTML = "";

  const filteredProducts = applyFiltersAndSort(products);

  if (filteredProducts.length === 0) {
    productsGrid.innerHTML = "<p>No products found.</p>";
    return;
  }

  filteredProducts.forEach((product) => {
    if (!product || !product.id) return;
    const card = `
            <div class="product-card fade-in">
              
              <img src="/images/${product.name}.jpg" alt="${product.name}" class="product-image" loading="lazy" onerror="this.src='/images/placeholder.jpg'" />
              <h3>${product.name}</h3>
              <p>${product.shortDescription}</p>
              <div class="product-overlay">
                <input type="checkbox" class="compare-checkbox" value="${product.id}" aria-label="Select ${product.name} for comparison" />
                <a href="/products/${product.id}" class="product-btn">
                  <i class="fas fa-eye"></i> View Product
                </a>
                <button class="product-btn enquiry-btn" data-product="${product.name}">
                  <i class="fas fa-question-circle"></i> Enquiry
                </button>
                <button class="product-btn specs-btn" data-id="${product.id}">
                  <i class="fas fa-info-circle"></i> View Specs
                </button>
              </div>
            </div>`;
    productsGrid.insertAdjacentHTML("beforeend", card);

    const dropdownItem = `<li><a href="/products/${product.id}">${product.name}</a></li>`;
    productsDropdown.insertAdjacentHTML("beforeend", dropdownItem);

    const footerItem = `<li><a href="/products/${product.id}">${product.name}</a></li>`;
    footerProducts.insertAdjacentHTML("beforeend", footerItem);
  });

  // Add comparison checkbox listeners
  document.querySelectorAll(".compare-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const selected = document.querySelectorAll(".compare-checkbox:checked");
      if (selected.length > 3) {
        checkbox.checked = false;
        alert("You can compare up to 3 products.");
      }
      updateCompareButton();
    });
  });

  // Add specs button listeners
  const specsModal = document.getElementById("specsModal");
  const specsModalTitle = document.getElementById("specsModalTitle");
  const specsModalContent = document.getElementById("specsModalContent");
  document.querySelectorAll(".specs-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const product = allProducts.find((p) => p.id === id);
      if (product && specsModal && specsModalTitle && specsModalContent) {
        specsModalTitle.textContent = product.name;
        const specsTable =
          product.specifications
            ?.map(
              (spec) => `<tr><td>${spec.key}</td><td>${spec.value}</td></tr>`
            )
            .join("") ||
          "<tr><td colspan='2'>No specifications available</td></tr>";
        const keyFeaturesList =
          product.keyFeatures
            ?.map((feature) => `<li>${feature}</li>`)
            .join("") || "<li>No key features available</li>";
        specsModalContent.innerHTML = `
                <h4>Specifications</h4>
                <table class="specs-table">
                  ${specsTable}
                </table>
                <h4>Key Features</h4>
                <ul class="key-features">
                  ${keyFeaturesList}
                </ul>`;
        specsModal.style.display = "flex";
        specsModal.focus();
      }
    });
  });

  // Add filter listeners
  document.querySelectorAll(".filter-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const selectedCategories = Array.from(
        document.querySelectorAll(".filter-checkbox:checked")
      ).map((cb) => cb.value);
      document.querySelectorAll(".category-card").forEach((card) => {
        const category = card.getAttribute("data-category");
        card.classList.toggle("active", selectedCategories.includes(category));
      });
      displayProducts(allProducts);
    });
  });

  initFadeInElements();
}

// Specs Modal Listeners
const specsModal = document.getElementById("specsModal");
const specsClose = specsModal?.querySelector(".close");
if (specsModal && specsClose) {
  specsClose.addEventListener("click", () => {
    specsModal.style.display = "none";
  });
  window.addEventListener("click", (e) => {
    if (e.target === specsModal) {
      specsModal.style.display = "none";
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && specsModal.style.display === "flex") {
      specsModal.style.display = "none";
    }
  });
}

// Product Comparison
const compareModal = document.getElementById("compareModal");
const compareContent = document.getElementById("compareContent");
const compareClose = compareModal?.querySelector(".close");

function updateCompareButton() {
  const selected = document.querySelectorAll(".compare-checkbox:checked");
  compareBtn.classList.toggle("active", selected.length >= 2);
}

function renderComparison() {
  const selectedIds = Array.from(
    document.querySelectorAll(".compare-checkbox:checked")
  ).map((cb) => cb.value);
  const selectedProducts = allProducts.filter(
    (p) => p && selectedIds.includes(p.id)
  );

  if (selectedProducts.length === 0) {
    compareContent.innerHTML = `<p class="no-products">No valid products selected for comparison.</p>`;
    return;
  }

  const table = `
          <table class="compare-table">
            <thead>
              <tr>
                <th>Feature</th>
                ${selectedProducts
                  .map(
                    (p) =>
                      `<th>${p.name} <button class="remove-btn" data-id="${p.id}">Remove</button></th>`
                  )
                  .join("")}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Image</td>
                ${selectedProducts
                  .map(
                    (p) =>
                      `<td><img src="${p.image}" alt="${p.name}" onerror="this.src='/images/placeholder.jpg'" /></td>`
                  )
                  .join("")}
              </tr>
              <tr>
                <td>Description</td>
                ${selectedProducts
                  .map((p) => `<td>${p.shortDescription}</td>`)
                  .join("")}
              </tr>
              <tr>
                <td>Category</td>
                ${selectedProducts
                  .map((p) => `<td>${p.category || "N/A"}</td>`)
                  .join("")}
              </tr>
            </tbody>
          </table>
        `;
  compareContent.innerHTML = table;

  compareContent.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const checkbox = document.querySelector(
        `.compare-checkbox[value="${id}"]`
      );
      if (checkbox) checkbox.checked = false;
      updateCompareButton();
      renderComparison();
    });
  });
}

// Load Products with Minimum 2-Second Delay
async function loadProducts() {
  const productsGrid = document.getElementById("productsGrid");
  const productsDropdown = document.getElementById("productsDropdown");
  const footerProducts = document.getElementById("footerProducts");
  const pageLoading = document.getElementById("pageLoading");

  if (!productsGrid || !productsDropdown || !footerProducts) return;

  const minDelay = new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    const response = await Promise.race([
      fetch("/api/products"),
      minDelay.then(() => Promise.reject(new Error("Timeout"))),
    ]);

    await minDelay;

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    allProducts = await response.json();
    if (!Array.isArray(allProducts))
      throw new Error("Response is not an array");

    const categories = [
      ...new Set(
        allProducts
          .map((p) => p.category)
          .filter((c) => c && typeof c === "string")
      ),
    ].sort();
    if (categories.length > 0) {
      populateFilters(categories);
      populateCategories(categories);
    } else {
      filterGroup.innerHTML =
        "<h4>Filter by Category:</h4><p>No categories available</p>";
      document.getElementById("categoriesGrid").innerHTML =
        "<p>No categories available</p>";
    }

    sortSelect.addEventListener("change", () => displayProducts(allProducts));
  } catch (error) {
    console.error("Error loading products:", error);
    productsGrid.innerHTML =
      "<p>Error loading products. Please try again later.</p>";
    allProducts = mockProducts;
    const mockCategories = [
      ...new Set(mockProducts.map((p) => p.category)),
    ].sort();
    populateFilters(mockCategories);
    populateCategories(mockCategories);
  } finally {
    pageLoading.classList.add("hidden");
    setTimeout(() => {
      pageLoading.style.display = "none";
    }, 500);
  }

  displayProducts(allProducts);
}

// Comparison Modal Listeners
if (compareModal && compareBtn) {
  compareBtn.addEventListener("click", () => {
    renderComparison();
    compareModal.style.display = "flex";
  });

  compareClose?.addEventListener("click", () => {
    compareModal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === compareModal) {
      compareModal.style.display = "none";
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && compareModal.style.display === "flex") {
      compareModal.style.display = "none";
    }
  });
}

// Form Submission
async function handleFormSubmit(e, formType) {
  e.preventDefault();
  const form = e.target;
  const loading = document.getElementById(`${formType}Loading`);
  const success = document.getElementById(`${formType}Success`);
  const formData = new FormData(form);
  let data, url;

  if (!loading) return;

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
    if (!data.name) {
      form.querySelector("#enquiryName ~ .error-message").style.display =
        "block";
      isValid = false;
    }
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      form.querySelector("#enquiryEmail ~ .error-message").style.display =
        "block";
      isValid = false;
    }
    if (!data.phone || !/^[0-9]{10}$/.test(data.phone)) {
      form.querySelector("#enquiryPhone ~ .error-message").style.display =
        "block";
      isValid = false;
    }
    if (!data.message) {
      form.querySelector("#enquiryMessage ~ .error-message").style.display =
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
const enquiryClose = enquiryModal?.querySelector(".close");

if (enquiryModal && enquiryProductInput) {
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("enquiry-btn")) {
      const productName = e.target.getAttribute("data-product");
      enquiryProductInput.value = productName;
      enquiryModal.style.display = "flex";
    }
  });

  enquiryClose?.addEventListener("click", () => {
    enquiryModal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === enquiryModal) {
      enquiryModal.style.display = "none";
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && enquiryModal.style.display === "flex") {
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
  initFadeInElements();
});

document.body.style.opacity = "0";
document.body.style.transition = "opacity 0.5s ease";
