const adminToken = localStorage.getItem("adminToken");

// Authentication Check
if (!localStorage.getItem("adminAuth")) {
  window.location.href = "/";
}

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const navLinks = document.getElementById("navLinks");

mobileMenuBtn.addEventListener("click", () => {
  navLinks.classList.toggle("active");
  const icon = mobileMenuBtn.querySelector("i");
  icon.classList.toggle("fa-bars");
  icon.classList.toggle("fa-times");
});

// Header Scroll Effect
const header = document.getElementById("header");
window.addEventListener("scroll", () => {
  header.classList.toggle("header-scrolled", window.scrollY > 100);
});

// Scroll Animations
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animation = "fadeInUp 0.8s ease forwards";
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll(".fade-in").forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(20px)";
  observer.observe(el);
});

// Image Preview
const imageInput = document.getElementById("image");
const imagePreview = document.getElementById("imagePreview");

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.src = e.target.result;
      imagePreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    imagePreview.style.display = "none";
  }
});

// Price Toggle
const customPriceCheckbox = document.getElementById("customPrice");
const priceInput = document.getElementById("price");

customPriceCheckbox.addEventListener("change", () => {
  if (customPriceCheckbox.checked) {
    priceInput.disabled = true;
    priceInput.value = "";
  } else {
    priceInput.disabled = false;
  }
});

// Dynamic Specifications
const specFields = document.getElementById("specFields");
const addSpecBtn = document.getElementById("addSpecBtn");

function addSpecField(key = "", value = "") {
  const id = `spec_${Date.now()}`;
  const field = document.createElement("div");
  field.className = "spec-field";
  field.innerHTML = `
          <div class="form-group">
            <input type="text" id="${id}_key" value="${key}" placeholder=" " required aria-label="Specification Key" />
            <label for="${id}_key"><i class="fas fa-tag"></i> Key</label>
          </div>
          <div class="form-group">
            <input type="text" id="${id}_value" value="${value}" placeholder=" " required aria-label="Specification Value" />
            <label for="${id}_value"><i class="fas fa-info-circle"></i> Value</label>
          </div>
          <button type="button" class="remove-spec"><i class="fas fa-times"></i></button>
        `;
  specFields.appendChild(field);

  field.querySelector(".remove-spec").addEventListener("click", () => {
    field.remove();
  });
}

addSpecBtn.addEventListener("click", () => addSpecField());

// Load Products
async function loadProducts() {
  const errorMessage = document.getElementById("formError");
  errorMessage.style.display = "none";
  try {
    const response = await fetch("/api/admin/products", {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    const products = await response.json();
    const productTable = document.getElementById("productTable");
    productTable.innerHTML = "";
    if (!Array.isArray(products) || products.length === 0) {
      productTable.innerHTML =
        '<tr><td colspan="4">No products found.</td></tr>';
      return;
    }
    products.forEach((product) => {
      const price =
        typeof product.price === "string"
          ? product.price
          : `₹${product.price.toFixed(2)}`;
      const quantity = product.quantity
        ? `${product.quantity.value} ${product.quantity.unit}`
        : "N/A";
      const tr = `
              <tr>
                <td>${product.name}</td>
                <td>${price}</td>
                <td>${quantity}</td>
                <td>
                  <button class="action-btn edit-btn" onclick="editProduct('${product.id}')"><i class="fas fa-edit"></i> Edit</button>
                  <button class="action-btn delete-btn" onclick="deleteProduct('${product.id}')"><i class="fas fa-trash"></i> Delete</button>
                </td>
              </tr>
            `;
      productTable.insertAdjacentHTML("beforeend", tr);
    });
  } catch (error) {
    console.error("Error loading products:", error);
    errorMessage.textContent =
      "Failed to load products. Please try logging in again.";
    errorMessage.classList.add("active");
    if (error.message.includes("401")) {
      localStorage.removeItem("adminAuth");
      localStorage.removeItem("adminToken");
      window.location.href = "/";
    }
  }
}

// Product Form Submission
const productForm = document.getElementById("productForm");
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const loading = document.getElementById("formLoading");
  const success = document.getElementById("formSuccess");
  const errorMessage = document.getElementById("formError");
  loading.classList.add("active");
  success.classList.remove("active");
  errorMessage.classList.remove("active");

  const name = document.getElementById("name").value.trim();
  const category = document.getElementById("category").value; // CHANGED: Renamed from categoryId
  const customPrice = document.getElementById("customPrice").checked;
  const price = customPrice
    ? "As per requirement"
    : parseFloat(document.getElementById("price").value) || 0;
  const quantityValue =
    parseFloat(document.getElementById("quantityValue").value) || 0;
  const quantityUnit = document.getElementById("quantityUnit").value;
  const shortDescription = document
    .getElementById("shortDescription")
    .value.trim();
  const description = document.getElementById("description").value.trim();
  const keyFeatures = document
    .getElementById("keyFeatures")
    .value.split(",")
    .map((f) => f.trim())
    .filter((f) => f);
  const specifications = [];
  specFields.querySelectorAll(".spec-field").forEach((field) => {
    const key = field.querySelector("input[id$='_key']").value.trim();
    const value = field.querySelector("input[id$='_value']").value.trim();
    if (key && value) {
      specifications.push({ key, value });
    }
  });

  // Validation
  if (
    !name ||
    !category ||
    (!customPrice && (isNaN(price) || price < 0)) ||
    quantityValue <= 0 ||
    !quantityUnit ||
    !shortDescription ||
    !description ||
    keyFeatures.length === 0 ||
    specifications.length === 0
  ) {
    loading.classList.remove("active");
    errorMessage.textContent =
      "Please fill in all required fields, including a valid price (if not custom), quantity (>0) with unit, and category.";
    errorMessage.classList.add("active");
    return;
  }

  try {
    let imageUrl = document.getElementById("existingImage").value;
    if (imageInput.files[0]) {
      const imageFormData = new FormData();
      imageFormData.append("image", imageInput.files[0]);
      const imageResponse = await fetch("/api/admin/upload-image", {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
        body: imageFormData,
      });
      if (!imageResponse.ok) {
        throw new Error(`Image upload failed: ${await imageResponse.text()}`);
      }
      const imageData = await imageResponse.json();
      imageUrl = imageData.imageUrl;
    }

    if (!imageUrl && !document.getElementById("productId").value) {
      throw new Error("An image is required for new products.");
    }

    const productData = {
      id: document.getElementById("productId").value || `prod_${Date.now()}`,
      name,
      price,
      quantity: {
        value: quantityValue,
        unit: quantityUnit,
      },
      image: imageUrl,
      shortDescription,
      description,
      keyFeatures,
      specifications,
      category, // CHANGED: Send category as string instead of { id: categoryId }
    };

    const method = productData.id.startsWith("prod_") ? "POST" : "PUT";
    const url =
      method === "PUT"
        ? `/api/admin/products/${productData.id}`
        : "/api/admin/products";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(productData),
    });

    if (response.ok) {
      success.classList.add("active");
      productForm.reset();
      imagePreview.style.display = "none";
      document.getElementById("existingImage").value = "";
      specFields.innerHTML = "";
      document.getElementById("productId").value = "";
      document.getElementById("quantityUnit").value = "";
      document.getElementById("category").value = "";
      customPriceCheckbox.checked = false;
      priceInput.disabled = false;
      loadProducts();
      setTimeout(() => success.classList.remove("active"), 3000);
    } else {
      throw new Error(`Failed to save product: ${await response.text()}`);
    }
  } catch (error) {
    console.error("Error saving product:", error);
    errorMessage.textContent = error.message.includes("401")
      ? "Session expired. Please log in again."
      : "An error occurred while saving the product.";
    errorMessage.classList.add("active");
    if (error.message.includes("401")) {
      localStorage.removeItem("adminAuth");
      localStorage.removeItem("adminToken");
      window.location.href = "/";
    }
  } finally {
    loading.classList.remove("active");
  }
});

// Edit Product
window.editProduct = async (id) => {
  try {
    const response = await fetch(`/api/admin/products/${id}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    const product = await response.json();
    document.getElementById("productId").value = product.id;
    document.getElementById("name").value = product.name;
    document.getElementById("category").value = product.category || ""; // CHANGED: Use category string directly
    if (product.price === "As per requirement") {
      document.getElementById("customPrice").checked = true;
      document.getElementById("price").disabled = true;
      document.getElementById("price").value = "";
    } else {
      document.getElementById("customPrice").checked = false;
      document.getElementById("price").disabled = false;
      document.getElementById("price").value = product.price || 0;
    }
    document.getElementById("quantityValue").value = product.quantity
      ? product.quantity.value
      : 0;
    document.getElementById("quantityUnit").value = product.quantity
      ? product.quantity.unit
      : "";
    document.getElementById("existingImage").value = product.image;
    imagePreview.src = product.image;
    imagePreview.style.display = "block";
    document.getElementById("shortDescription").value =
      product.shortDescription;
    document.getElementById("description").value = product.description;
    document.getElementById("keyFeatures").value =
      product.keyFeatures.join(", ");
    specFields.innerHTML = "";
    product.specifications.forEach((spec) => {
      addSpecField(spec.key, spec.value);
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    document.getElementById("formError").textContent = error.message.includes(
      "401"
    )
      ? "Session expired. Please log in again."
      : "Failed to load product details.";
    document.getElementById("formError").classList.add("active");
    if (error.message.includes("401")) {
      localStorage.removeItem("adminAuth");
      localStorage.removeItem("adminToken");
      window.location.href = "/";
    }
  }
};

// Delete Product
window.deleteProduct = async (id) => {
  if (confirm("Are you sure you want to delete this product?")) {
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      if (response.ok) {
        document.getElementById("formSuccess").textContent =
          "Product deleted successfully!";
        document.getElementById("formSuccess").classList.add("active");
        loadProducts();
        setTimeout(
          () =>
            document.getElementById("formSuccess").classList.remove("active"),
          3000
        );
      } else {
        throw new Error(`Failed to delete product: ${await response.text()}`);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      document.getElementById("formError").textContent = error.message.includes(
        "401"
      )
        ? "Session expired. Please log in again."
        : "An error occurred while deleting the product.";
      document.getElementById("formError").classList.add("active");
      if (error.message.includes("401")) {
        localStorage.removeItem("adminAuth");
        localStorage.removeItem("adminToken");
        window.location.href = "/";
      }
    }
  }
};

// Initialize
window.addEventListener("load", () => {
  document.body.style.opacity = "1";
  addSpecField();
  loadProducts();
  // CHANGED: Removed loadCategories call since categories are hardcoded
});

document.body.style.opacity = "0";
document.body.style.transition = "opacity 0.5s ease";
