/**
 * Subhan DevSphere - Visitor Capture & Notification Engine
 * Passwordless visitor access: any visitor enters their email -> saved & dispatched to subhandevsphers@gmil.com
 */

// Sound FX completely disabled as requested
class AudioEffects {
  constructor() {
    this.muted = true;
  }
  init() {}
  toggleMute() {}
  playBeep() {}
  playSuccess() {}
  playClick() {}
}

const sfx = new AudioEffects();

// Toast Notifications
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  let icon = '<i class="fas fa-check-circle" style="color: #4ade80;"></i>';
  if (type === "warn") icon = '<i class="fas fa-exclamation-triangle" style="color: #fb923c;"></i>';

  toast.innerHTML = `${icon}<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(50px)";
    setTimeout(() => toast.remove(), 300);
  }, 4200);
}

// Visitor State & Lead Handling
const VisitorState = {
  visitorEmail: null,

  init() {
    const keys = (typeof window !== "undefined" && window.STORAGE_KEYS) ? window.STORAGE_KEYS : {
      CURRENT_VISITOR: "devsphere_current_visitor",
      VISITORS: "devsphere_visitors_list",
      ACCESS_ALLOWED: "devsphere_visitor_allowed"
    };

    try {
      const current = localStorage.getItem(keys.CURRENT_VISITOR);
      if (current) {
        this.visitorEmail = current;
        this.updateNavbarBadge();
      }
    } catch (e) {}
    
    this.setupListeners();

    // Check if user has already granted / dismissed access or if section is turned off
    try {
      const alreadyAllowed = localStorage.getItem(keys.ACCESS_ALLOWED) === "true";
      const cfg = typeof getActiveConfig === 'function' ? getActiveConfig() : null;
      const isGateEnabled = !cfg || cfg.sections?.visitorGate !== false;

      // Auto-open welcome modal ONLY on the first visit if visitorGate is enabled and NOT yet allowed
      if (!alreadyAllowed && isGateEnabled) {
        setTimeout(() => {
          openVisitorModal();
        }, 500);
      }
    } catch (e) {}
  },

  handleEmailSubmit(inputEmail) {
    if (!inputEmail || !inputEmail.includes("@")) {
      showToast("Please enter a valid email address.", "warn");
      return false;
    }

    const cleanEmail = inputEmail.trim().toLowerCase();
    this.visitorEmail = cleanEmail;

    // Save locally
    saveVisitorLead(cleanEmail);

    try {
      localStorage.setItem("devsphere_visitor_allowed", "true");
    } catch (e) {}

    // Update UI badge
    this.updateNavbarBadge();

    showToast(`🎉 Thank you sir! Welcome to exploring the career & technical journey of EM.Subhan Ali.`, "success");

    closeVisitorModal();
    return true;
  },

  updateNavbarBadge() {
    const badge = document.getElementById("visitor-badge-btn");
    if (badge) {
      if (this.visitorEmail) {
        badge.innerHTML = `<span class="dot" style="background:#4ade80; box-shadow:0 0 8px #4ade80;"></span>${this.visitorEmail}`;
        badge.style.borderColor = "rgba(74, 222, 128, 0.4)";
        badge.style.color = "#4ade80";
      } else {
        badge.innerHTML = `<span class="dot"></span>Leave Email`;
      }
    }
  },

  setupListeners() {
    const form = document.getElementById("visitor-gate-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        submitVisitorAccess(true);
      });
    }

    // Close when clicking outside on modal backdrop
    const modal = document.getElementById("visitor-gate-modal");
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          submitVisitorAccess(false);
        }
      });
    }
  }
};

// User choice handler: Allow (with or without email) OR Reject (Guest)
function submitVisitorAccess(isAllow) {
  const input = document.getElementById("visitor-email-input");
  const emailVal = input ? input.value.trim() : "";

  // Always remember access choice in localStorage so it NEVER resets on refresh!
  try {
    localStorage.setItem("devsphere_visitor_allowed", "true");
    localStorage.setItem("devsphere_access_choice", isAllow ? "allowed" : "guest");
  } catch (e) {}

  if (isAllow) {
    if (emailVal && emailVal.includes("@")) {
      const cleanEmail = emailVal.toLowerCase();
      VisitorState.visitorEmail = cleanEmail;
      saveVisitorLead(cleanEmail);
      VisitorState.updateNavbarBadge();
      showToast(`🎉 Thank you sir! Welcome to exploring the career & technical journey of EM.Subhan Ali.`, "success");
    } else {
      showToast(`🎉 Thank you sir! Welcome to exploring the career & technical journey of EM.Subhan Ali.`, "success");
    }
  } else {
    // Rejected / Guest access
    showToast(`✨ Thank you sir for visiting! Enjoy exploring the journey & history of EM.Subhan Ali.`, "info");
  }

  closeVisitorModal();
}

// Modal controls
function openVisitorModal() {
  const modal = document.getElementById("visitor-gate-modal");
  const input = document.getElementById("visitor-email-input");
  if (modal) {
    if (input && VisitorState.visitorEmail) {
      input.value = VisitorState.visitorEmail;
    }
    modal.classList.add("active");
    if (input) setTimeout(() => input.focus(), 150);
  }
}

function closeVisitorModal() {
  const modal = document.getElementById("visitor-gate-modal");
  if (modal) modal.classList.remove("active");
  try {
    localStorage.setItem("devsphere_visitor_allowed", "true");
  } catch (e) {}
}
