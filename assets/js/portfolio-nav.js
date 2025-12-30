// assets/js/portfolio-nav.js
// Clean navigation system for the main portfolio page

function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll("#mainContent > section").forEach((sec) => {
    sec.style.display = "none";
  });

  // Show the requested section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.style.display = "block";
  }

  // Update active state on nav buttons
  document.querySelectorAll(".nav-btn[data-section]").forEach((btn) => {
    btn.classList.remove("active");
  });
  const activeBtn = document.querySelector(
    `.nav-btn[data-section="${sectionId}"]`
  );
  if (activeBtn) {
    activeBtn.classList.add("active");
  }

  // Smooth scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setView(section) {
  history.pushState({ section }, "", `#${section}`);
  showSection(section);
}

// Handle browser back/forward
window.addEventListener("popstate", (event) => {
  const section =
    event.state?.section || location.hash.replace("#", "") || "about";
  showSection(section);
});

// On page load
document.addEventListener("DOMContentLoaded", () => {
  const hash = location.hash.replace("#", "") || "about";
  showSection(hash);
});
