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

// Dropdown Toggle for Mobile with Event Delegation
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

// Close dropdowns and menu when clicking outside
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

// Close mobile menu when clicking nav links
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
