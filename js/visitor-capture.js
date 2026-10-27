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

// Toast Notifications - Permanently Disabled
function showToast() {
  // All toast notification boxes disabled per user request
  return;
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
    }
  }

  // Close the modal popup
  closeVisitorModal();

  // Launch the Redoyanul Haque opening animation (Fast 0-100% -> WELCOME -> Portfolio Open)
  triggerRedoyanulStyleOpening();
}

// Redoyanul Haque Style Fast Opening Animation (0% -> 100% -> WELCOME -> Reveal)
function triggerRedoyanulStyleOpening(onFinished) {
  const loaderScreen = document.getElementById("opening-loader-screen");
  const loadingWrap = document.getElementById("loading-wrap");
  const loadingBtn = document.getElementById("loading-button");
  const percentNum = document.getElementById("loading-percent-num");
  const loadingHover = document.getElementById("loading-hover");

  if (!loaderScreen) {
    if (onFinished) onFinished();
    return;
  }

  // Reset initial clean state
  loaderScreen.style.display = "flex";
  loaderScreen.classList.remove("hidden");
  if (loadingWrap) loadingWrap.classList.remove("loading-clicked");
  if (loadingBtn) loadingBtn.classList.remove("loading-complete");
  if (percentNum) percentNum.textContent = "0%";

  // Mouse hover glow movement
  if (loadingWrap && loadingHover) {
    loadingWrap.onmousemove = (e) => {
      const rect = loadingWrap.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      loadingHover.style.left = `${x}px`;
      loadingHover.style.top = `${y}px`;
    };
  }

  // Fast smooth counter: 0% -> 100% in ~1100ms
  let currentPercent = 0;
  const duration = 1100;
  const startTime = performance.now();

  function updateCounter(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Smooth fast curve
    const eased = 1 - Math.pow(1 - progress, 2.5);
    currentPercent = Math.min(Math.floor(eased * 100), 100);
    if (percentNum) percentNum.textContent = `${currentPercent}%`;

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      // 100% reached
      if (percentNum) percentNum.textContent = "100%";
      setTimeout(() => {
        // Step 1: Slide in WELCOME
        if (loadingBtn) loadingBtn.classList.add("loading-complete");

        setTimeout(() => {
          // Step 2: Smooth and fast departure (scale + fade together)
          if (loadingWrap) loadingWrap.classList.add("loading-clicked");
          loaderScreen.classList.add("hidden");

          setTimeout(() => {
            loaderScreen.style.display = "none";
            if (onFinished) onFinished();
          }, 360);
        }, 320);
      }, 70);
    }
  }

  requestAnimationFrame(updateCounter);
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
