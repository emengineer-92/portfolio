/**
 * Subhan DevSphere - Admin Control Panel Engine
 * Features:
 * 1. 5-Clicks trigger on the brand code icon (`</>`) with live countdown toast feedback
 * 2. Direct Admin button in navbar 3-dot expandable menu
 * 3. Double-click or shortcut (Ctrl + Shift + A) access
 * 4. Interactive "Visual Map / Kis Jagha Add Hoga" Tab showing exact portfolio location of every option
 * 5. Enable / Disable portfolio sections & elements
 * 6. Edit personal information with exact "Website Location" tags on every input
 * 7. Project Manager: Add new project with section placement selector, image upload/URL, edit, delete, toggle
 * 8. Skills & Experience Timeline Manager
 * 9. Export/Import JSON backup & Factory Reset
 * 10. Live real-time portfolio refresh upon saving (without page reload)
 */

(function() {
  let adminConfig = null;
  let clickCount = 0;
  let clickResetTimer = null;
  let editingProjectId = null;

  // Immediate or DOMContentLoaded initialization
  function bootAdmin() {
    createAdminModalDOM();
    initAdminTrigger();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootAdmin);
  } else {
    bootAdmin();
  }

  // 1. 5-Second Press-and-Hold Detector on Brand Icon
  // Admin panel will ONLY open if user holds the icon continuously for 5 seconds (100% silent, no notification)
  let holdTimer = null;

  function startHold(e) {
    if (e && e.cancelable) {
      e.preventDefault();
    }
    clearTimeout(holdTimer);

    const triggerEl = document.getElementById("brand-icon-trigger") || document.querySelector(".brand-icon-wrap");
    if (triggerEl) triggerEl.classList.add("holding");

    holdTimer = setTimeout(() => {
      if (triggerEl) triggerEl.classList.remove("holding");
      if (navigator.vibrate) navigator.vibrate(200);
      openAdminPanel();
    }, 5000);
  }

  function cancelHold() {
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }
    const triggerEl = document.getElementById("brand-icon-trigger") || document.querySelector(".brand-icon-wrap");
    if (triggerEl) triggerEl.classList.remove("holding");
  }

  window.handleBrandIconClick = function(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  function initAdminTrigger() {
    const triggerEl = document.getElementById("brand-icon-trigger") || document.querySelector(".brand-icon-wrap");

    if (triggerEl) {
      triggerEl.setAttribute("title", "DevSphere");
      triggerEl.style.cursor = "pointer";

      // Mouse events (Desktop)
      triggerEl.addEventListener("mousedown", startHold);
      triggerEl.addEventListener("mouseup", cancelHold);
      triggerEl.addEventListener("mouseleave", cancelHold);

      // Touch events (Mobile)
      triggerEl.addEventListener("touchstart", startHold, { passive: false });
      triggerEl.addEventListener("touchend", cancelHold, { passive: true });
      triggerEl.addEventListener("touchcancel", cancelHold, { passive: true });

      // Prevent mobile long-press context menu
      triggerEl.addEventListener("contextmenu", (e) => e.preventDefault());
    }

    // Keyboard shortcut: Ctrl + Shift + A
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        openAdminPanel();
      }
    });
  }

  // 2. Open Admin Panel
  window.openAdminPanel = function() {
    adminConfig = getActiveConfig();
    populateAdminForm(adminConfig);
    const modal = document.getElementById("admin-control-modal");
    if (modal) {
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  };

  // Close Admin Panel (Auto-saves all current changes)
  window.closeAdminPanel = function() {
    if (typeof saveAllAdminChanges === "function") {
      saveAllAdminChanges(false);
    }
    const modal = document.getElementById("admin-control-modal");
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
    editingProjectId = null;
  };

  // Quick switch to a specific tab
  window.switchAdminTab = function(tabId) {
    const tabs = document.querySelectorAll(".admin-tab-btn");
    const panes = document.querySelectorAll(".admin-tab-pane");
    tabs.forEach(t => {
      const match = t.dataset.tab === tabId;
      t.classList.toggle("active", match);
      if (match) {
        t.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    });
    panes.forEach(p => p.classList.toggle("active", p.id === tabId));
    if (tabId === "tab-inquiries" && typeof loadAndRenderAdminInquiries === "function") {
      loadAndRenderAdminInquiries();
    }
    if (tabId === "tab-reviews" && typeof loadAndRenderAdminReviews === "function") {
      loadAndRenderAdminReviews();
    }
  };

  // 3. Inject Admin Panel Modal DOM into Page
  function createAdminModalDOM() {
    if (document.getElementById("admin-control-modal")) return;

    const modal = document.createElement("div");
    modal.id = "admin-control-modal";
    modal.className = "admin-modal-overlay";
    modal.innerHTML = `
      <div class="admin-modal-box glass-panel">
        <!-- Header -->
        <div class="admin-modal-header">
          <div class="admin-header-title-wrap">
            <div class="admin-badge-icon"><i class="fas fa-crown"></i></div>
            <div>
              <div class="admin-pre-title">DEVSPHERE ARCHITECTURE</div>
              <h2 class="admin-title">Admin Control <span class="gradient-accent">Panel</span></h2>
            </div>
          </div>
          <div class="admin-header-btns">
            <button type="button" class="btn btn-primary btn-sm" id="admin-save-btn-top">
              <i class="fas fa-save"></i> Save
            </button>
            <button type="button" class="admin-close-x" onclick="closeAdminPanel()" title="Close Admin Panel">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Admin Main Dual-Pane Layout: Sidebar Menu + Tab Content Panes -->
        <div class="admin-modal-layout">
          <!-- Left Sidebar Menu -->
          <aside class="admin-sidebar-menu">
            <div class="admin-menu-header">
              <i class="fas fa-th-large"></i> <span>All Modules</span>
            </div>
            <nav class="admin-menu-nav" id="admin-menu-nav">
              <button type="button" class="admin-menu-item active" data-tab="tab-visual-map">
                <span class="admin-menu-icon"><i class="fas fa-map-marked-alt"></i></span>
                <span class="admin-menu-text">Visual Guide</span>
              </button>
              <button type="button" class="admin-menu-item" data-tab="tab-sections">
                <span class="admin-menu-icon"><i class="fas fa-toggle-on"></i></span>
                <span class="admin-menu-text">Sections Toggle</span>
              </button>
              <button type="button" class="admin-menu-item" data-tab="tab-profile">
                <span class="admin-menu-icon"><i class="fas fa-user-edit"></i></span>
                <span class="admin-menu-text">Edit Information</span>
              </button>
              <button type="button" class="admin-menu-item" data-tab="tab-projects">
                <span class="admin-menu-icon"><i class="fas fa-cubes"></i></span>
                <span class="admin-menu-text">Manage Projects</span>
                <span class="admin-menu-badge" id="admin-proj-counter">5</span>
              </button>
              <button type="button" class="admin-menu-item" data-tab="tab-skills-exp">
                <span class="admin-menu-icon"><i class="fas fa-layer-group"></i></span>
                <span class="admin-menu-text">Skills &amp; Timeline</span>
              </button>
              <button type="button" class="admin-menu-item" data-tab="tab-channels">
                <span class="admin-menu-icon"><i class="fas fa-share-alt"></i></span>
                <span class="admin-menu-text">Direct Channels</span>
                <span class="admin-menu-badge" id="admin-channel-counter">2</span>
              </button>
              <button type="button" class="admin-menu-item" data-tab="tab-inquiries">
                <span class="admin-menu-icon"><i class="fas fa-inbox"></i></span>
                <span class="admin-menu-text">Inquiries</span>
                <span class="admin-menu-badge" id="admin-inquiries-counter">0</span>
              </button>
              <button type="button" class="admin-menu-item" data-tab="tab-reviews">
                <span class="admin-menu-icon"><i class="fas fa-star" style="color: #facc15;"></i></span>
                <span class="admin-menu-text">Client Reviews</span>
                <span class="admin-menu-badge" id="admin-reviews-counter">0</span>
              </button>
              <button type="button" class="admin-menu-item" data-tab="tab-backup">
                <span class="admin-menu-icon"><i class="fas fa-database"></i></span>
                <span class="admin-menu-text">Backup &amp; Reset</span>
              </button>
            </nav>
          </aside>

          <!-- Scrollable Tab Content Container -->
          <div class="admin-modal-body">
          
          <!-- TAB 0: VISUAL PLACEMENT MAP (Konsa Option Kis Jagha Add Hoga) -->
          <div class="admin-tab-pane active" id="tab-visual-map">
            <div class="admin-pane-intro">
              <h3 style="color:var(--color-cyan); display:flex; align-items:center; gap:8px;">
                <i class="fas fa-map-pin"></i> Konsa Option Portfolio Me Kis Jagha Add Hoga?
              </h3>
              <p>Har option ka portfolio par exact muqaam aur jagah neeche di gayi hai. Kisi bhi section ko edit karne ke liye samne button par click karein.</p>
            </div>

            <div class="placement-map-grid">
              <!-- Location 1: Navbar Header -->
              <div class="placement-map-card">
                <div class="placement-map-card-header">
                  <span class="placement-num">1</span>
                  <h4>Top Navbar &amp; Header Banner</h4>
                  <span class="placement-tag-badge">Page Top</span>
                </div>
                <div class="placement-map-content">
                  <div class="placement-item-row">
                    <strong>Brand Name &amp; Logo:</strong>
                    <span><code>DevSphere</code> aur <code>&lt;/&gt;</code> icon navbar ke left corner par nazar aata hai.</span>
                  </div>
                  <div class="placement-item-row">
                    <strong>Display Name:</strong>
                    <span><code>EM.Subhan ali</code> navbar logo ke sath display hota hai.</span>
                  </div>
                  <div class="placement-item-row">
                    <strong>Navigation Menu:</strong>
                    <span>3-dot button se khulne wale Home, Projects, Expertise, Terminal, Experience, Contact buttons.</span>
                  </div>
                  <div class="placement-item-row">
                    <strong>Leave Email Button:</strong>
                    <span>Navbar ke right side par visitor capture button.</span>
                  </div>
                </div>
                <button type="button" class="btn btn-secondary btn-sm" onclick="switchAdminTab('tab-profile')" style="margin-top:12px; width:100%;">
                  <i class="fas fa-pen"></i> Edit Navbar Info
                </button>
              </div>

              <!-- Location 2: Hero Section -->
              <div class="placement-map-card">
                <div class="placement-map-card-header">
                  <span class="placement-num">2</span>
                  <h4>Hero Section (Main Banner)</h4>
                  <span class="placement-tag-badge">Section #home</span>
                </div>
                <div class="placement-map-content">
                  <div class="placement-item-row">
                    <strong>Full Name (H1):</strong>
                    <span>Hero banner ka sab se bara gradient text headline.</span>
                  </div>
                  <div class="placement-item-row">
                    <strong>Rotating Taglines:</strong>
                    <span>Hero mein title ke neeche type hone wala animated typewriter text.</span>
                  </div>
                  <div class="placement-item-row">
                    <strong>Hero Bio / Paragraph:</strong>
                    <span>Buttons ke ooper jo tafseeli bio paragraph likha hai.</span>
                  </div>
                  <div class="placement-item-row">
                    <strong>4 Live Metrics Cards:</strong>
                    <span>Years Active (4+), Completed Works (35+), Commits (8.4k), Dedication (100%).</span>
                  </div>
                  <div class="placement-item-row">
                    <strong>Hologram Avatar:</strong>
                    <span>Right side par 3D tilted photo card aur floating tech badges.</span>
                  </div>
                </div>
                <button type="button" class="btn btn-secondary btn-sm" onclick="switchAdminTab('tab-profile')" style="margin-top:12px; width:100%;">
                  <i class="fas fa-pen"></i> Edit Hero &amp; Bio
                </button>
              </div>

              <!-- Location 3: Projects Grid -->
              <div class="placement-map-card">
                <div class="placement-map-card-header">
                  <span class="placement-num">3</span>
                  <h4>Projects Showcase Grid</h4>
                  <span class="placement-tag-badge">Section #projects</span>
                </div>
                <div class="placement-map-content">
                  <div class="placement-item-row">
                    <strong>Project Cover Image:</strong>
                    <span>Card ke top par 16:9 thumbnail image picture.</span>
                  </div>
                  <div class="placement-item-row">
                    <strong>Project Title &amp; Category:</strong>
                    <span>Card ka main naam aur image par glowing category badge.</span>
                  </div>
                  <div class="placement-item-row">
                    <strong>Highlights Pill:</strong>
                    <span>Glowing stats strip (e.g. Modern Responsive UI • End-to-End Stack).</span>
                  </div>
                  <div class="placement-item-row">
                    <strong>Description &amp; Tags:</strong>
                    <span>Project ki tafseel aur neeche tech stack tags (React, Node, etc.).</span>
                  </div>
                  <div class="placement-item-row">
                    <strong>Live Demo &amp; Code Links:</strong>
                    <span>Blue "Live Demo" aur dark "Source Code" buttons.</span>
                  </div>
                </div>
                <button type="button" class="btn btn-primary btn-sm" onclick="switchAdminTab('tab-projects')" style="margin-top:12px; width:100%;">
                  <i class="fas fa-folder-plus"></i> Manage Projects &amp; Add New
                </button>
              </div>

              <!-- Location 4: Technical Skills -->
              <div class="placement-map-card">
                <div class="placement-map-card-header">
                  <span class="placement-num">4</span>
                  <h4>Technical Expertise Matrix</h4>
                  <span class="placement-tag-badge">Section #skills</span>
                </div>
                <div class="placement-map-content">
                  <div class="placement-item-row">
                    <strong>Skill Title &amp; Icon:</strong>
                    <span>Web Development, Robotics, CS Academic, 3D Animation, Media Editing.</span>
                  </div>
                  <div class="placement-item-row">
                    <strong>Percentage Level:</strong>
                    <span>Animated progress bar (e.g. 97%, 94%, 96%).</span>
                  </div>
                </div>
                <button type="button" class="btn btn-secondary btn-sm" onclick="switchAdminTab('tab-skills-exp')" style="margin-top:12px; width:100%;">
                  <i class="fas fa-sliders-h"></i> Edit Skills &amp; Percentages
                </button>
              </div>

              <!-- Location 5: Career Timeline -->
              <div class="placement-map-card">
                <div class="placement-map-card-header">
                  <span class="placement-num">5</span>
                  <h4>Career Timeline &amp; Orb</h4>
                  <span class="placement-tag-badge">Section #experience</span>
                </div>
                <div class="placement-map-content">
                  <div class="placement-item-row">
                    <strong>Year &amp; Role:</strong>
                    <span>Bara saal (e.g. 2026, 2025, 2024, 2023) aur role title.</span>
                  </div>
                  <div class="placement-item-row">
                    <strong>Institution &amp; Bio:</strong>
                    <span>University ya company ka naam aur milestone explanation.</span>
                  </div>
                  <div class="placement-item-row">
                    <strong>Neon Traveling Orb:</strong>
                    <span>Scroll ke sath move hone wala glowing neon ball.</span>
                  </div>
                </div>
                <button type="button" class="btn btn-secondary btn-sm" onclick="switchAdminTab('tab-skills-exp')" style="margin-top:12px; width:100%;">
                  <i class="fas fa-history"></i> Edit Timeline Milestones
                </button>
              </div>

              <!-- Location 6: Direct Contact Channels -->
              <div class="placement-map-card">
                <div class="placement-map-card-header">
                  <span class="placement-num">6</span>
                  <h4>Contact &amp; Instant Channels</h4>
                  <span class="placement-tag-badge">Section #contact</span>
                </div>
                <div class="placement-map-content">
                  <div class="placement-item-row">
                    <strong>Official Email:</strong>
                    <span>Red Gmail button par click karne se direct Gmail compose khulta hai.</span>
                  </div>
                  <div class="placement-item-row">
                    <strong>WhatsApp Number:</strong>
                    <span>Green WhatsApp button se direct WhatsApp chat start hoti hai.</span>
                  </div>
                  <div class="placement-item-row">
                    <strong>Location Text:</strong>
                    <span><code>Pakistan 🇵🇰 (Available for Global &amp; Remote Work)</code>.</span>
                  </div>
                  <div class="placement-item-row">
                    <strong>Inquiry Form:</strong>
                    <span>Clients ka direct message aur project order form.</span>
                  </div>
                </div>
                <button type="button" class="btn btn-secondary btn-sm" onclick="switchAdminTab('tab-profile')" style="margin-top:12px; width:100%;">
                  <i class="fas fa-address-book"></i> Edit Contact &amp; WhatsApp
                </button>
              </div>
            </div>
          </div>

          <!-- TAB 1: SECTIONS VISIBILITY -->
          <div class="admin-tab-pane" id="tab-sections">
            <div class="admin-pane-intro">
              <h3>Enable / Disable Portfolio Sections</h3>
              <p>Turn any section or interactive component on or off. Disabled sections and their menu buttons will be instantly hidden from visitors.</p>
            </div>

            <div class="admin-toggle-grid">
              <div class="admin-toggle-card">
                <div class="toggle-card-info">
                  <div class="toggle-card-title"><i class="fas fa-home"></i> Hero Section &amp; Bio</div>
                  <div class="field-placement-tag"><i class="fas fa-map-pin"></i> Website Par: Top Hero Banner (ID: #home)</div>
                  <div class="toggle-card-desc">Top banner with name, rotating typewriter taglines, metrics, and hologram avatar card.</div>
                </div>
                <label class="admin-switch">
                  <input type="checkbox" id="sec-toggle-hero" checked>
                  <span class="slider"></span>
                </label>
              </div>

              <div class="admin-toggle-card">
                <div class="toggle-card-info">
                  <div class="toggle-card-title"><i class="fas fa-briefcase"></i> Projects Showcase</div>
                  <div class="field-placement-tag"><i class="fas fa-map-pin"></i> Website Par: Showcase Cards Grid (ID: #projects)</div>
                  <div class="toggle-card-desc">Showcase grid displaying full-stack, robotics, 3D and digital media projects.</div>
                </div>
                <label class="admin-switch">
                  <input type="checkbox" id="sec-toggle-projects" checked>
                  <span class="slider"></span>
                </label>
              </div>

              <div class="admin-toggle-card">
                <div class="toggle-card-info">
                  <div class="toggle-card-title"><i class="fas fa-code"></i> Technical Expertise &amp; Skills</div>
                  <div class="field-placement-tag"><i class="fas fa-map-pin"></i> Website Par: Skills Matrix Progress Bars (ID: #skills)</div>
                  <div class="toggle-card-desc">Skills matrix with percentage progress bars across web, robotics, cs, 3d &amp; media.</div>
                </div>
                <label class="admin-switch">
                  <input type="checkbox" id="sec-toggle-skills" checked>
                  <span class="slider"></span>
                </label>
              </div>

              <div class="admin-toggle-card">
                <div class="toggle-card-info">
                  <div class="toggle-card-title"><i class="fas fa-terminal"></i> SubhanOS Cloud Terminal</div>
                  <div class="field-placement-tag"><i class="fas fa-map-pin"></i> Website Par: Interactive Developer CLI (ID: #terminal)</div>
                  <div class="toggle-card-desc">Interactive developer console and quick action badges for tech visitors.</div>
                </div>
                <label class="admin-switch">
                  <input type="checkbox" id="sec-toggle-terminal" checked>
                  <span class="slider"></span>
                </label>
              </div>

              <div class="admin-toggle-card">
                <div class="toggle-card-info">
                  <div class="toggle-card-title"><i class="fas fa-history"></i> Career Timeline &amp; Milestones</div>
                  <div class="field-placement-tag"><i class="fas fa-map-pin"></i> Website Par: Career Milestones &amp; Orb (ID: #experience)</div>
                  <div class="toggle-card-desc">Chronological progression with the scroll-traveling glowing neon orb.</div>
                </div>
                <label class="admin-switch">
                  <input type="checkbox" id="sec-toggle-experience" checked>
                  <span class="slider"></span>
                </label>
              </div>

              <div class="admin-toggle-card">
                <div class="toggle-card-info">
                  <div class="toggle-card-title"><i class="fas fa-star"></i> Client Reviews &amp; Acclaim</div>
                  <div class="field-placement-tag"><i class="fas fa-map-pin"></i> Website Par: Public Reviews List (ID: #testimonials)</div>
                  <div class="toggle-card-desc">Public reviews and the "Leave a Review" modal form.</div>
                </div>
                <label class="admin-switch">
                  <input type="checkbox" id="sec-toggle-testimonials" checked>
                  <span class="slider"></span>
                </label>
              </div>

              <div class="admin-toggle-card">
                <div class="toggle-card-info">
                  <div class="toggle-card-title"><i class="fas fa-envelope"></i> Contact &amp; Inquiry Section</div>
                  <div class="field-placement-tag"><i class="fas fa-map-pin"></i> Website Par: Contact Grid &amp; Form (ID: #contact)</div>
                  <div class="toggle-card-desc">Official Gmail link, WhatsApp direct chat link, and inquiry transmission form.</div>
                </div>
                <label class="admin-switch">
                  <input type="checkbox" id="sec-toggle-contact" checked>
                  <span class="slider"></span>
                </label>
              </div>

              <div class="admin-toggle-card">
                <div class="toggle-card-info">
                  <div class="toggle-card-title"><i class="fas fa-user-lock"></i> Visitor Email Gate Popup</div>
                  <div class="field-placement-tag"><i class="fas fa-map-pin"></i> Website Par: Page Entry Welcome Popup</div>
                  <div class="toggle-card-desc">Automated welcome modal prompting visitors for their email upon entering.</div>
                </div>
                <label class="admin-switch">
                  <input type="checkbox" id="sec-toggle-visitorGate" checked>
                  <span class="slider"></span>
                </label>
              </div>

              <div class="admin-toggle-card">
                <div class="toggle-card-info">
                  <div class="toggle-card-title"><i class="fas fa-water"></i> WebGL GPU Fluid Background</div>
                  <div class="field-placement-tag"><i class="fas fa-map-pin"></i> Website Par: Fixed Liquid Silk Canvas (#particle-canvas)</div>
                  <div class="toggle-card-desc">Liquid silk fluid physics simulation canvas in the background.</div>
                </div>
                <label class="admin-switch">
                  <input type="checkbox" id="sec-toggle-fluidBg" checked>
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>

          <!-- TAB 2: EDIT INFORMATION -->
          <div class="admin-tab-pane" id="tab-profile">
            <div class="admin-pane-intro">
              <h3>Edit Personal Information &amp; Bio</h3>
              <p>Har field ke sath uska exact muqaam likha hai ke yeh portfolio par kis jagha show hoga.</p>
            </div>

            <div class="admin-form-grid">
              <div class="form-group">
                <label class="form-label" for="adm-prof-name">Full Display Name</label>
                <div class="field-placement-tag"><i class="fas fa-map-pin"></i> Website Par: Navbar Brand Logo, Hero Title (H1) &amp; Footer Copyright</div>
                <input type="text" id="adm-prof-name" class="form-control" placeholder="EM.Subhan ali">
              </div>

              <div class="form-group">
                <label class="form-label" for="adm-prof-brand">Brand / Studio Name</label>
                <div class="field-placement-tag"><i class="fas fa-map-pin"></i> Website Par: Gradient Brand Subtitle (DevSphere)</div>
                <input type="text" id="adm-prof-brand" class="form-control" placeholder="DevSphere">
              </div>

              <div class="form-group form-col-full">
                <label class="form-label" for="adm-prof-icon">Brand / Logo Icon (Navbar Icon)</label>
                <div class="field-placement-tag"><i class="fas fa-map-pin"></i> Website Par: Top Navbar Brand Logo Icon (5s hold trigger)</div>
                <div style="display:flex; gap:12px; align-items:center; margin-bottom:8px;">
                  <div id="adm-icon-preview-box" style="width:44px; height:44px; border-radius:10px; background:linear-gradient(135deg, rgba(56,189,248,0.25), rgba(192,132,252,0.25)); border:1px solid #38bdf8; display:flex; align-items:center; justify-content:center; font-size:1.3rem; color:#38bdf8; flex-shrink:0;">
                    <i id="adm-icon-preview-i" class="fas fa-code"></i>
                  </div>
                  <input type="text" id="adm-prof-icon" class="form-control" placeholder="fas fa-code">
                </div>
                <div style="display:flex; flex-wrap:wrap; gap:6px;">
                  <button type="button" class="btn btn-secondary btn-sm adm-icon-preset" data-icon="fas fa-code"><i class="fas fa-code"></i> Code</button>
                  <button type="button" class="btn btn-secondary btn-sm adm-icon-preset" data-icon="fas fa-terminal"><i class="fas fa-terminal"></i> Terminal</button>
                  <button type="button" class="btn btn-secondary btn-sm adm-icon-preset" data-icon="fas fa-robot"><i class="fas fa-robot"></i> Robot</button>
                  <button type="button" class="btn btn-secondary btn-sm adm-icon-preset" data-icon="fas fa-microchip"><i class="fas fa-microchip"></i> Chip</button>
                  <button type="button" class="btn btn-secondary btn-sm adm-icon-preset" data-icon="fas fa-laptop-code"><i class="fas fa-laptop-code"></i> Laptop</button>
                  <button type="button" class="btn btn-secondary btn-sm adm-icon-preset" data-icon="fas fa-user-astronaut"><i class="fas fa-user-astronaut"></i> Astronaut</button>
                  <button type="button" class="btn btn-secondary btn-sm adm-icon-preset" data-icon="fas fa-bolt"><i class="fas fa-bolt"></i> Bolt</button>
                  <button type="button" class="btn btn-secondary btn-sm adm-icon-preset" data-icon="fas fa-rocket"><i class="fas fa-rocket"></i> Rocket</button>
                  <button type="button" class="btn btn-secondary btn-sm adm-icon-preset" data-icon="fas fa-brain"><i class="fas fa-brain"></i> AI Brain</button>
                  <button type="button" class="btn btn-secondary btn-sm adm-icon-preset" data-icon="fas fa-cubes"><i class="fas fa-cubes"></i> 3D Cubes</button>
                </div>
              </div>

              <div class="form-group form-col-full">
                <label class="form-label" for="adm-prof-taglines">Rotating Hero Taglines (One per line)</label>
                <div class="field-placement-tag"><i class="fas fa-map-pin"></i> Website Par: Hero Section mein Title ke neeche Typewriting Animation Line</div>
                <textarea id="adm-prof-taglines" class="form-control" rows="4" placeholder="Full-Stack Web Developer (2025-2026)&#10;Robotics & Embedded Innovator&#10;ICS Graduate • BS CS Candidate"></textarea>
              </div>

              <div class="form-group form-col-full">
                <label class="form-label" for="adm-prof-bio">Hero Bio &amp; About Paragraph</label>
                <div class="field-placement-tag"><i class="fas fa-map-pin"></i> Website Par: Hero Section mein CTA Buttons ke theek ooper Bio Paragraph</div>
                <textarea id="adm-prof-bio" class="form-control" rows="3" placeholder="Describe your background and expertise..."></textarea>
              </div>

              <div class="form-group">
                <label class="form-label" for="adm-prof-badge">Status Badge (Top of Card)</label>
                <div class="field-placement-tag"><i class="fas fa-map-pin"></i> Website Par: 3D Hologram Avatar Card ke ooper Floating Tech Badge</div>
                <input type="text" id="adm-prof-badge" class="form-control" placeholder="⚡ Pakistani Full-Stack Developer">
              </div>

              <div class="form-group">
                <label class="form-label" for="adm-prof-location">Location &amp; Work Model</label>
                <div class="field-placement-tag"><i class="fas fa-map-pin"></i> Website Par: Contact Section mein Location Pin Card</div>
                <input type="text" id="adm-prof-location" class="form-control" placeholder="Pakistan 🇵🇰 (Global & Remote)">
              </div>

              <!-- Metrics -->
              <div class="form-group">
                <label class="form-label" for="adm-stat-exp">Years Active Experience</label>
                <div class="field-placement-tag"><i class="fas fa-map-pin"></i> Website Par: Hero Metric Box #1</div>
                <input type="text" id="adm-stat-exp" class="form-control" placeholder="4+">
              </div>

              <div class="form-group">
                <label class="form-label" for="adm-stat-proj">Completed Works Count</label>
                <div class="field-placement-tag"><i class="fas fa-map-pin"></i> Website Par: Hero Metric Box #2</div>
                <input type="text" id="adm-stat-proj" class="form-control" placeholder="35+">
              </div>

              <div class="form-group">
                <label class="form-label" for="adm-stat-commits">Code Commits / Activity</label>
                <div class="field-placement-tag"><i class="fas fa-map-pin"></i> Website Par: Hero Metric Box #3</div>
                <input type="text" id="adm-stat-commits" class="form-control" placeholder="8.4k">
              </div>

              <div class="form-group">
                <label class="form-label" for="adm-stat-sat">Client Satisfaction %</label>
                <div class="field-placement-tag"><i class="fas fa-map-pin"></i> Website Par: Hero Metric Box #4</div>
                <input type="text" id="adm-stat-sat" class="form-control" placeholder="100%">
              </div>

              <!-- Contact & Socials -->
              <div class="form-group">
                <label class="form-label" for="adm-soc-email">Official Email Address</label>
                <div class="field-placement-tag"><i class="fas fa-map-pin"></i> Website Par: "Send Message via Gmail" Button &amp; Inquiry Dispatcher</div>
                <input type="email" id="adm-soc-email" class="form-control" placeholder="mirzasubhanali449@gmail.com">
              </div>

              <div class="form-group">
                <label class="form-label" for="adm-soc-wa">WhatsApp Phone Number</label>
                <div class="field-placement-tag"><i class="fas fa-map-pin"></i> Website Par: Green "Chat on WhatsApp" Button</div>
                <input type="text" id="adm-soc-wa" class="form-control" placeholder="03446266246">
              </div>

              <div class="form-group">
                <label class="form-label" for="adm-soc-github">GitHub Profile URL</label>
                <div class="field-placement-tag"><i class="fas fa-map-pin"></i> Website Par: Footer GitHub Icon Circle</div>
                <input type="url" id="adm-soc-github" class="form-control" placeholder="https://github.com">
              </div>

              <div class="form-group">
                <label class="form-label" for="adm-soc-linkedin">LinkedIn Profile URL</label>
                <div class="field-placement-tag"><i class="fas fa-map-pin"></i> Website Par: Footer LinkedIn Icon Circle</div>
                <input type="url" id="adm-soc-linkedin" class="form-control" placeholder="https://linkedin.com">
              </div>

              <!-- Avatar Photo Upload -->
              <div class="form-group form-col-full">
                <label class="form-label">Profile Avatar Image</label>
                <div class="field-placement-tag"><i class="fas fa-map-pin"></i> Website Par: Hero Section mein 3D Hologram Avatar Card</div>
                <div class="avatar-upload-row">
                  <div class="avatar-preview-box">
                    <img id="adm-avatar-preview" src="assets/avatar.jpg" alt="Preview">
                  </div>
                  <div style="flex: 1;">
                    <input type="text" id="adm-prof-avatar-url" class="form-control" placeholder="assets/avatar.jpg or image URL" style="margin-bottom: 8px;">
                    <div style="display: flex; gap: 10px; align-items: center;">
                      <label class="btn btn-secondary btn-sm" style="margin: 0; cursor: pointer;">
                        <i class="fas fa-upload"></i> Upload Image from PC
                        <input type="file" id="adm-avatar-file-input" accept="image/*" style="display: none;">
                      </label>
                      <span class="label-hint">PNG, JPG, WebP supported</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 3: PROJECTS MANAGER -->
          <div class="admin-tab-pane" id="tab-projects">
            <div class="admin-pane-intro" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
              <div>
                <h3>Manage Projects &amp; Showcase</h3>
                <p>Naya project add karein, details edit karein, ya decide karein ke konsa project kahan show hoga.</p>
              </div>
              <button type="button" class="btn btn-primary btn-sm" id="btn-toggle-project-form">
                <i class="fas fa-plus-circle"></i> Add New Project
              </button>
            </div>

            <!-- Existing Projects List Cards -->
            <div id="admin-projects-list" class="admin-projects-cards-list">
              <!-- Dynamically populated -->
            </div>
          </div>

          <!-- TAB 4: SKILLS & TIMELINE -->
          <div class="admin-tab-pane" id="tab-skills-exp">
            <div class="admin-pane-intro">
              <h3>Technical Skills &amp; Career Milestones</h3>
              <p>Configure skill levels and chronological timeline progression.</p>
            </div>

            <div style="margin-bottom: 24px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <div>
                  <h4 style="color:#fff; font-size:1.1rem;"><i class="fas fa-sliders-h"></i> Technical Skills Matrix</h4>
                  <div class="field-placement-tag"><i class="fas fa-map-pin"></i> Website Par: Section #skills (Core Technical Arsenal)</div>
                </div>
                <button type="button" class="btn btn-primary btn-sm" id="btn-add-skill-row"><i class="fas fa-plus-circle"></i> Add New Skill</button>
              </div>
              <div id="admin-skills-list" class="admin-sublist-rows">
                <!-- Dynamically populated -->
              </div>
            </div>

            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <div>
                  <h4 style="color:#fff; font-size:1.1rem;"><i class="fas fa-stream"></i> Career &amp; Academic Timeline</h4>
                  <div class="field-placement-tag"><i class="fas fa-map-pin"></i> Website Par: Section #experience (Timeline &amp; Glowing Orb)</div>
                </div>
                <button type="button" class="btn btn-secondary btn-sm" id="btn-add-exp-row"><i class="fas fa-plus"></i> Add Milestone</button>
              </div>
              <div id="admin-experience-list" class="admin-sublist-rows">
                <!-- Dynamically populated -->
              </div>
            </div>
          </div>

          <!-- TAB 5: BACKUP & RESET -->
          <div class="admin-tab-pane" id="tab-backup">
            <div class="admin-pane-intro">
              <h3>Backup, Export &amp; Reset Data</h3>
              <p>Download a complete backup of your portfolio data as a JSON file, or restore factory defaults if you ever want a clean slate.</p>
            </div>

            <div class="admin-backup-grid">
              <div class="backup-card glass-panel">
                <div class="backup-card-icon" style="color: var(--color-cyan);"><i class="fas fa-file-export"></i></div>
                <h4>Export Portfolio Data</h4>
                <p>Download your complete portfolio settings, bio, and all projects into a single portable JSON file.</p>
                <button type="button" class="btn btn-primary btn-sm" onclick="exportPortfolioDataJSON()">
                  <i class="fas fa-download"></i> Export JSON Backup
                </button>
              </div>

              <div class="backup-card glass-panel">
                <div class="backup-card-icon" style="color: var(--color-lilac);"><i class="fas fa-file-import"></i></div>
                <h4>Import Portfolio Data</h4>
                <p>Load a previously exported JSON backup file to instantly restore or synchronize your portfolio.</p>
                <label class="btn btn-secondary btn-sm" style="cursor: pointer; margin: 0;">
                  <i class="fas fa-upload"></i> Choose JSON File
                  <input type="file" id="admin-import-file-input" accept=".json" style="display: none;">
                </label>
              </div>

              <div class="backup-card glass-panel" style="border-color: rgba(239, 68, 68, 0.3);">
                <div class="backup-card-icon" style="color: #ef4444;"><i class="fas fa-undo-alt"></i></div>
                <h4>Reset to Factory Defaults</h4>
                <p>Erase local customizations and revert your portfolio back to original default settings.</p>
                <button type="button" class="btn btn-secondary btn-sm" style="border-color: rgba(239, 68, 68, 0.4); color: #f87171;" id="btn-reset-defaults">
                  <i class="fas fa-trash-alt"></i> Reset All Defaults
                </button>
              </div>
            </div>
          </div>

          <!-- TAB: DIRECT CHANNELS (YouTube, TikTok, Links) -->
          <div class="admin-tab-pane" id="tab-channels">
            <div class="admin-pane-intro">
              <h3 style="color:var(--color-cyan); display:flex; align-items:center; gap:8px;">
                <i class="fas fa-share-alt"></i> Direct Channels &amp; Social Links
              </h3>
              <p>Add your YouTube channel, TikTok profile, Instagram, or custom links. These appear directly in your portfolio's Contact &amp; Direct Channels section.</p>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
              <h4 style="color:#fff; margin:0;"><i class="fas fa-list"></i> Active Channels</h4>
              <button type="button" class="btn btn-primary btn-sm" id="btn-toggle-channel-form">
                <i class="fas fa-plus-circle"></i> Add New Channel
              </button>
            </div>

            <!-- Add / Edit Channel Form Wrapper -->
            <div id="admin-channel-form-wrap" style="display:none; background:rgba(15, 23, 42, 0.7); border:1px solid rgba(56, 189, 248, 0.3); border-radius:16px; padding:20px; margin-bottom:24px;">
              <h4 id="channel-form-title" style="margin-bottom:14px; color:var(--color-cyan);"><i class="fas fa-plus"></i> Add New Channel</h4>
              <div class="admin-form-grid">
                <div class="form-group">
                  <label class="form-label" for="adm-ch-title">Platform / Title *</label>
                  <input type="text" id="adm-ch-title" class="form-control" placeholder="e.g. YouTube Channel, TikTok Profile">
                </div>
                <div class="form-group">
                  <label class="form-label" for="adm-ch-subtitle">Subtitle / Description</label>
                  <input type="text" id="adm-ch-subtitle" class="form-control" placeholder="e.g. Watch Tech &amp; 3D Videos">
                </div>
                <div class="form-group form-col-full">
                  <label class="form-label" for="adm-ch-url">Channel / Profile URL *</label>
                  <input type="url" id="adm-ch-url" class="form-control" placeholder="https://youtube.com/@yourchannel">
                </div>
                <div class="form-group form-col-full">
                  <label class="form-label">Choose Preset Platform &amp; Icon</label>
                  <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:12px;">
                    <button type="button" class="btn btn-secondary btn-sm ch-preset-btn" data-title="YouTube Channel" data-sub="Watch Tech &amp; 3D Videos" data-icon="fab fa-youtube" data-color="#ff0000"><i class="fab fa-youtube" style="color:#ff0000;"></i> YouTube</button>
                    <button type="button" class="btn btn-secondary btn-sm ch-preset-btn" data-title="TikTok Profile" data-sub="Creative Edits &amp; Behind The Scenes" data-icon="fab fa-tiktok" data-color="#fe2c55"><i class="fab fa-tiktok" style="color:#fe2c55;"></i> TikTok</button>
                    <button type="button" class="btn btn-secondary btn-sm ch-preset-btn" data-title="Instagram Profile" data-sub="Photos &amp; Visual Showcase" data-icon="fab fa-instagram" data-color="#e1306c"><i class="fab fa-instagram" style="color:#e1306c;"></i> Instagram</button>
                    <button type="button" class="btn btn-secondary btn-sm ch-preset-btn" data-title="GitHub Profile" data-sub="Open Source Projects &amp; Code" data-icon="fab fa-github" data-color="#a855f7"><i class="fab fa-github" style="color:#a855f7;"></i> GitHub</button>
                    <button type="button" class="btn btn-secondary btn-sm ch-preset-btn" data-title="LinkedIn Network" data-sub="Professional Connect" data-icon="fab fa-linkedin-in" data-color="#0a66c2"><i class="fab fa-linkedin-in" style="color:#0a66c2;"></i> LinkedIn</button>
                    <button type="button" class="btn btn-secondary btn-sm ch-preset-btn" data-title="Facebook Page" data-sub="Official Updates" data-icon="fab fa-facebook" data-color="#1877f2"><i class="fab fa-facebook" style="color:#1877f2;"></i> Facebook</button>
                    <button type="button" class="btn btn-secondary btn-sm ch-preset-btn" data-title="Twitter / X" data-sub="Tech Thoughts &amp; Updates" data-icon="fab fa-x-twitter" data-color="#ffffff"><i class="fab fa-x-twitter"></i> X (Twitter)</button>
                    <button type="button" class="btn btn-secondary btn-sm ch-preset-btn" data-title="Custom Website" data-sub="External Link" data-icon="fas fa-globe" data-color="#38bdf8"><i class="fas fa-globe" style="color:#38bdf8;"></i> Custom Link</button>
                  </div>
                  <div style="display:flex; gap:12px; align-items:center;">
                    <input type="text" id="adm-ch-icon" class="form-control" placeholder="fab fa-youtube" style="flex:2;">
                    <input type="color" id="adm-ch-color" value="#ff0000" style="height:44px; width:54px; border:none; background:transparent; cursor:pointer;" title="Choose Brand Color">
                  </div>
                </div>
              </div>
              <div style="display:flex; gap:10px; margin-top:16px;">
                <button type="button" class="btn btn-primary btn-sm" id="btn-save-channel-item">
                  <i class="fas fa-save"></i> Save Channel
                </button>
                <button type="button" class="btn btn-secondary btn-sm" id="btn-cancel-channel-item">
                  Cancel
                </button>
              </div>
            </div>

            <!-- Channels List -->
            <div id="admin-channels-list-container" style="display:flex; flex-direction:column; gap:12px;"></div>
          </div>

          <!-- TAB: INQUIRIES & LEADS -->
          <div class="admin-tab-pane" id="tab-inquiries">
            <div class="admin-pane-intro">
              <h3 style="color:var(--color-cyan); display:flex; align-items:center; gap:8px;">
                <i class="fas fa-inbox"></i> Project Inquiries &amp; Client Leads
              </h3>
              <p>Visitors ki taraf se aane wali tamam inquiries yahan live save hoti hain aur sath aapke verified email <code>mirzasubhanali449@gmail.com</code> par notification aati hai. Client ke Phone number ke samne <strong>"Chat on WhatsApp"</strong> button daba kar foran direct unse WhatsApp par chat shuru karein.</p>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
              <h4 style="color:#fff; margin:0;"><i class="fas fa-clipboard-list"></i> Received Inquiries (<span id="admin-inquiries-title-count">0</span>)</h4>
              <button type="button" class="btn btn-secondary btn-sm" id="btn-refresh-inquiries" onclick="loadAndRenderAdminInquiries()">
                <i class="fas fa-sync-alt"></i> Refresh Inbox
              </button>
            </div>

            <!-- Inquiries List Container -->
            <div id="admin-inquiries-list-container" style="display:flex; flex-direction:column; gap:12px;"></div>
          </div>

          <!-- TAB: CLIENT REVIEWS MANAGEMENT & DELETE -->
          <div class="admin-tab-pane" id="tab-reviews">
            <div class="admin-pane-intro">
              <h3 style="color:#facc15; display:flex; align-items:center; gap:8px;">
                <i class="fas fa-star"></i> Public Client Reviews &amp; Testimonials
              </h3>
              <p>Yahan se aap kisi bhi galat, fake ya unwanted review ko permanent <strong>Delete</strong> kar sakte hain. Delete karne par ye portfolio aur cloud database dono se foran hat jayega.</p>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
              <h4 style="color:#fff; margin:0;"><i class="fas fa-comments"></i> Published Reviews (<span id="admin-reviews-title-count">0</span>)</h4>
              <button type="button" class="btn btn-secondary btn-sm" id="btn-refresh-reviews" onclick="loadAndRenderAdminReviews()">
                <i class="fas fa-sync-alt"></i> Refresh Reviews
              </button>
            </div>

            <!-- Reviews List Container -->
            <div id="admin-reviews-list-container" style="display:flex; flex-direction:column; gap:12px;"></div>
          </div>

          </div> <!-- /.admin-modal-body -->
        </div> <!-- /.admin-modal-layout -->

        <!-- Sticky Footer -->
        <div class="admin-modal-footer">
          <div style="font-size: 0.85rem; color: var(--text-muted); display:flex; align-items:center; gap:8px;">
            <span class="dot" style="background:#4ade80; box-shadow:0 0 8px #4ade80;"></span>
            Changes saved here update your portfolio live!
          </div>
          <div style="display: flex; gap: 12px;">
            <button type="button" class="btn btn-secondary" onclick="closeAdminPanel()">
              Close
            </button>
            <button type="button" class="btn btn-primary" id="admin-save-btn-bottom">
              <i class="fas fa-save"></i> Save
            </button>
          </div>
        </div>
      </div> <!-- /.admin-modal-box -->

      <!-- ==============================================================
           CENTERED POPUP MODAL: ADD / EDIT PROJECT
           ============================================================== -->
      <div id="admin-project-popup-modal" class="admin-submodal-overlay">
        <div class="admin-submodal-box glass-panel">
          <div class="admin-submodal-header">
            <h3 id="proj-form-title"><i class="fas fa-folder-plus"></i> Add New Project</h3>
            <button type="button" class="admin-close-x" id="btn-cancel-project-form" title="Close"><i class="fas fa-times"></i></button>
          </div>
          <div class="admin-submodal-body">
            <div class="proj-placement-banner" style="margin-bottom:18px;">
              <div class="placement-banner-icon"><i class="fas fa-bullseye"></i></div>
              <div>
                <strong>Kis Jagha Add Hoga (Website Placement):</strong>
                <p>Yeh project portfolio ke <strong>Featured Projects Showcase Grid (#projects)</strong> mein ek interactive glass card ke tor par add hoga.</p>
              </div>
            </div>

            <div class="admin-form-grid">
              <div class="form-group">
                <label class="form-label" for="proj-input-placement">Display Position (Order / Placement)</label>
                <div class="field-placement-tag"><i class="fas fa-sort-amount-up"></i> Grid mein Kahan Show Hoga?</div>
                <select id="proj-input-placement" class="form-control" style="background: var(--bg-input);">
                  <option value="top">Top of Showcase (Sab se pehle show ho)</option>
                  <option value="normal" selected>Normal Order (Chronological)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="proj-input-category">Category / Discipline</label>
                <div class="field-placement-tag"><i class="fas fa-tag"></i> Glowing Badge</div>
                <select id="proj-input-category" class="form-control" style="background: var(--bg-input);">
                  <option value="Full-Stack Web Development (2025–2026)">Full-Stack Web Development (2025–2026)</option>
                  <option value="Robotics & Hardware Engineering">Robotics & Hardware Engineering</option>
                  <option value="Business Ideation & Tech Ventures">Business Ideation & Tech Ventures</option>
                  <option value="3D Animation & CGI Design">3D Animation & CGI Design</option>
                  <option value="Digital Media, Photoshop & Video Editing">Digital Media, Photoshop & Video Editing</option>
                  <option value="Mobile Applications (iOS & Android)">Mobile Applications (iOS & Android)</option>
                  <option value="Electronics & Embedded IoT">Electronics & Embedded IoT</option>
                </select>
              </div>

              <div class="form-group form-col-full">
                <label class="form-label" for="proj-input-title">Project Title *</label>
                <input type="text" id="proj-input-title" class="form-control" placeholder="e.g. Nexora — Full-Stack Cloud Architecture" required>
              </div>

              <div class="form-group form-col-full">
                <label class="form-label" for="proj-input-stats">Highlights / Stats Pill</label>
                <input type="text" id="proj-input-stats" class="form-control" placeholder="e.g. Modern Responsive UI • End-to-End Stack">
              </div>

              <div class="form-group form-col-full">
                <label class="form-label" for="proj-input-desc">Project Description *</label>
                <textarea id="proj-input-desc" class="form-control" rows="3" placeholder="Explain the architecture, objectives, and technology used..." required></textarea>
              </div>

              <div class="form-group form-col-full">
                <label class="form-label" for="proj-input-tags">Tech Stack Tags (Comma-separated)</label>
                <input type="text" id="proj-input-tags" class="form-control" placeholder="React, Node.js, Express, PostgreSQL, REST API">
              </div>

              <div class="form-group">
                <label class="form-label" for="proj-input-live">Live Demo URL</label>
                <input type="text" id="proj-input-live" class="form-control" placeholder="https://example.com or #">
              </div>

              <div class="form-group">
                <label class="form-label" for="proj-input-code">GitHub / Source Code URL</label>
                <input type="text" id="proj-input-code" class="form-control" placeholder="https://github.com/...">
              </div>

              <!-- Image URL or Upload -->
              <div class="form-group form-col-full">
                <label class="form-label">Project Cover Image</label>
                <div class="avatar-upload-row">
                  <div class="avatar-preview-box" style="width: 110px; height: 65px; border-radius: 8px;">
                    <img id="proj-img-preview" src="assets/project1.jpg" alt="Preview" style="object-fit: cover;">
                  </div>
                  <div style="flex: 1;">
                    <input type="text" id="proj-input-image" class="form-control" placeholder="assets/project1.jpg or image URL" style="margin-bottom: 6px;">
                    <label class="btn btn-secondary btn-sm" style="margin: 0; cursor: pointer;">
                      <i class="fas fa-image"></i> Pick Image from PC
                      <input type="file" id="proj-file-input" accept="image/*" style="display: none;">
                    </label>
                  </div>
                </div>
              </div>

              <!-- Toggles -->
              <div class="form-group" style="display: flex; align-items: center; gap: 12px; margin-top: 6px;">
                <label class="admin-switch">
                  <input type="checkbox" id="proj-input-enabled" checked>
                  <span class="slider"></span>
                </label>
                <span style="font-size: 0.9rem; color: #fff;">Visible on Portfolio</span>
              </div>

              <div class="form-group" style="display: flex; align-items: center; gap: 12px; margin-top: 6px;">
                <label class="admin-switch">
                  <input type="checkbox" id="proj-input-featured" checked>
                  <span class="slider"></span>
                </label>
                <span style="font-size: 0.9rem; color: #fff;">Mark as Featured</span>
              </div>
            </div>
          </div>
          <div class="admin-submodal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-project-item">Cancel</button>
            <button type="button" class="btn btn-primary" id="btn-save-project-item">
              <i class="fas fa-check"></i> Save Project
            </button>
          </div>
        </div>
      </div>

      <!-- ==============================================================
           CENTERED POPUP MODAL: ADD NEW SKILL
           ============================================================== -->
      <div id="admin-skill-popup-modal" class="admin-submodal-overlay">
        <div class="admin-submodal-box glass-panel" style="max-width:520px;">
          <div class="admin-submodal-header">
            <h3><i class="fas fa-layer-group" style="color:var(--color-cyan);"></i> Add New Technical Skill</h3>
            <button type="button" class="admin-close-x" id="btn-close-skill-modal" title="Close"><i class="fas fa-times"></i></button>
          </div>
          <div class="admin-submodal-body">
            <div class="field-placement-tag" style="margin-bottom:14px;"><i class="fas fa-map-pin"></i> Website Par: Section #skills (Technical Arsenal)</div>

            <div class="form-group" style="margin-bottom:16px;">
              <label class="form-label" for="skill-modal-name">Skill Name *</label>
              <input type="text" id="skill-modal-name" class="form-control" placeholder="e.g. Next.js, Python, ROS 2, Three.js">
            </div>

            <div class="form-group" style="margin-bottom:16px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <label class="form-label" for="skill-modal-level" style="margin:0;">Proficiency Level</label>
                <span id="skill-modal-level-val" style="font-family:var(--font-mono); color:var(--color-cyan); font-weight:700;">90%</span>
              </div>
              <input type="range" id="skill-modal-level" min="10" max="100" value="90" style="width:100%; accent-color:var(--color-cyan);">
            </div>

            <div class="form-group" style="margin-bottom:16px;">
              <label class="form-label" for="skill-modal-cat">Category / Discipline</label>
              <select id="skill-modal-cat" class="form-control" style="background:var(--bg-input);">
                <option value="web" selected>Web Development &amp; Cloud</option>
                <option value="robotics">Robotics &amp; Hardware</option>
                <option value="cs">Computer Science &amp; DSA</option>
                <option value="3d">3D Animation &amp; CGI</option>
                <option value="media">Media, Photoshop &amp; Video</option>
                <option value="office">Office &amp; Management</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Skill Icon Preset</label>
              <div style="display:flex; flex-wrap:wrap; gap:8px;" id="skill-preset-icons-wrap">
                <button type="button" class="btn btn-secondary btn-sm skill-preset-btn active" data-icon="fas fa-code"><i class="fas fa-code"></i> Code</button>
                <button type="button" class="btn btn-secondary btn-sm skill-preset-btn" data-icon="fab fa-react"><i class="fab fa-react"></i> React</button>
                <button type="button" class="btn btn-secondary btn-sm skill-preset-btn" data-icon="fab fa-js"><i class="fab fa-js"></i> JS</button>
                <button type="button" class="btn btn-secondary btn-sm skill-preset-btn" data-icon="fab fa-python"><i class="fab fa-python"></i> Python</button>
                <button type="button" class="btn btn-secondary btn-sm skill-preset-btn" data-icon="fas fa-robot"><i class="fas fa-robot"></i> Robot</button>
                <button type="button" class="btn btn-secondary btn-sm skill-preset-btn" data-icon="fas fa-microchip"><i class="fas fa-microchip"></i> Chip</button>
                <button type="button" class="btn btn-secondary btn-sm skill-preset-btn" data-icon="fas fa-cubes"><i class="fas fa-cubes"></i> 3D</button>
                <button type="button" class="btn btn-secondary btn-sm skill-preset-btn" data-icon="fas fa-database"><i class="fas fa-database"></i> DB</button>
              </div>
              <input type="hidden" id="skill-modal-icon" value="fas fa-code">
            </div>
          </div>
          <div class="admin-submodal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-skill-modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="btn-save-skill-modal">
              <i class="fas fa-plus-circle"></i> Add Skill
            </button>
          </div>
        </div>
      </div>

      <!-- ==============================================================
           CENTERED CONFIRMATION / PERMISSION DIALOG (Custom, Replaces Browser Confirm)
           ============================================================== -->
      <div id="admin-center-confirm-dialog" class="admin-confirm-overlay">
        <div class="admin-confirm-box glass-panel">
          <div class="admin-confirm-icon-wrap" id="admin-confirm-icon-wrap">
            <i class="fas fa-exclamation-triangle" id="admin-confirm-icon"></i>
          </div>
          <h3 class="admin-confirm-title" id="admin-confirm-title">Are you sure?</h3>
          <div class="admin-confirm-msg" id="admin-confirm-msg">This action cannot be undone.</div>
          <div class="admin-confirm-actions">
            <button type="button" class="btn btn-secondary" id="admin-confirm-cancel-btn">Cancel</button>
            <button type="button" class="btn btn-danger" id="admin-confirm-ok-btn">Confirm</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    setupAdminModalEvents();
  }

  // Centered Confirmation / Permission Modal (Custom, replaces browser confirm dialog)
  window.showAdminCenterConfirm = function({
    title = "Are you sure?",
    message = "This action will apply immediately.",
    icon = "fas fa-exclamation-triangle",
    iconColor = "#ef4444",
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDanger = true,
    onConfirm = null
  } = {}) {
    return new Promise((resolve) => {
      const dialog = document.getElementById("admin-center-confirm-dialog");
      if (!dialog) {
        if (window.confirm(message)) {
          if (typeof onConfirm === "function") onConfirm();
          return resolve(true);
        }
        return resolve(false);
      }

      const titleEl = document.getElementById("admin-confirm-title");
      const msgEl = document.getElementById("admin-confirm-msg");
      const iconEl = document.getElementById("admin-confirm-icon");
      const iconWrap = document.getElementById("admin-confirm-icon-wrap");
      const okBtn = document.getElementById("admin-confirm-ok-btn");
      const cancelBtn = document.getElementById("admin-confirm-cancel-btn");

      if (titleEl) titleEl.textContent = title;
      if (msgEl) msgEl.innerHTML = message;
      if (iconEl) iconEl.className = icon;
      if (iconWrap) {
        iconWrap.style.color = iconColor;
        iconWrap.style.borderColor = iconColor;
        iconWrap.style.boxShadow = `0 0 25px ${iconColor}55`;
      }

      if (okBtn) {
        okBtn.innerHTML = `<i class="fas fa-check"></i> ${confirmText}`;
        okBtn.className = isDanger ? "btn btn-danger" : "btn btn-primary";
      }
      if (cancelBtn) {
        cancelBtn.textContent = cancelText;
      }

      const closeConfirm = () => {
        dialog.classList.remove("active");
      };

      const handleOk = async () => {
        closeConfirm();
        okBtn.removeEventListener("click", handleOk);
        cancelBtn.removeEventListener("click", handleCancel);
        if (typeof onConfirm === "function") {
          try {
            await onConfirm();
          } catch (e) {
            console.error(e);
          }
        }
        resolve(true);
      };

      const handleCancel = () => {
        closeConfirm();
        okBtn.removeEventListener("click", handleOk);
        cancelBtn.removeEventListener("click", handleCancel);
        resolve(false);
      };

      okBtn.addEventListener("click", handleOk);
      cancelBtn.addEventListener("click", handleCancel);

      dialog.classList.add("active");
    });
  };

  // 4. Setup Events inside Admin Modal
  function setupAdminModalEvents() {
    // Menu navigation switching
    const menuItems = document.querySelectorAll(".admin-menu-item, .admin-tab-btn");
    menuItems.forEach(item => {
      item.addEventListener("click", () => {
        menuItems.forEach(m => m.classList.remove("active"));
        document.querySelectorAll(".admin-tab-pane").forEach(p => p.classList.remove("active"));

        item.classList.add("active");

        const targetId = item.dataset.tab;
        const targetPane = document.getElementById(targetId);
        if (targetPane) targetPane.classList.add("active");
        if (targetId === "tab-inquiries" && typeof loadAndRenderAdminInquiries === "function") {
          loadAndRenderAdminInquiries();
        }
        if (targetId === "tab-reviews" && typeof loadAndRenderAdminReviews === "function") {
          loadAndRenderAdminReviews();
        }
      });
    });

    // Save buttons
    const saveTop = document.getElementById("admin-save-btn-top");
    const saveBottom = document.getElementById("admin-save-btn-bottom");
    const handleSave = () => saveAllAdminChanges();
    if (saveTop) saveTop.addEventListener("click", handleSave);
    if (saveBottom) saveBottom.addEventListener("click", handleSave);

    // Live Auto-Save & Instant DOM Refresh for all 9 Section Toggles
    const secToggles = [
      { id: "sec-toggle-hero", key: "hero", name: "Hero Section (#home)" },
      { id: "sec-toggle-projects", key: "projects", name: "Projects Showcase (#projects)" },
      { id: "sec-toggle-skills", key: "skills", name: "Technical Skills (#skills)" },
      { id: "sec-toggle-terminal", key: "terminal", name: "SubhanOS Terminal (#terminal)" },
      { id: "sec-toggle-experience", key: "experience", name: "Career Timeline (#experience)" },
      { id: "sec-toggle-testimonials", key: "testimonials", name: "Client Reviews (#testimonials)" },
      { id: "sec-toggle-contact", key: "contact", name: "Contact Section (#contact)" },
      { id: "sec-toggle-visitorGate", key: "visitorGate", name: "Visitor Email Gate Popup" },
      { id: "sec-toggle-fluidBg", key: "fluidBg", name: "Liquid Fluid Background Canvas" }
    ];

    secToggles.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) {
        el.addEventListener("change", (e) => {
          if (!adminConfig) adminConfig = getActiveConfig();
          if (!adminConfig.sections) adminConfig.sections = {};
          adminConfig.sections[item.key] = e.target.checked;
          
          saveActiveConfig(adminConfig);
          if (window.refreshPortfolioFromConfig) {
            window.refreshPortfolioFromConfig(adminConfig);
          }
          const stateLabel = e.target.checked ? "allowed / enabled" : "hidden / disabled";
          showToast(`⚡ ${item.name} is now ${stateLabel}! Saved permanently.`, "success");
        });
      }
    });

    // Avatar image preview & file upload
    const avatarInput = document.getElementById("adm-prof-avatar-url");
    const avatarPreview = document.getElementById("adm-avatar-preview");
    const avatarFile = document.getElementById("adm-avatar-file-input");

    if (avatarInput && avatarPreview) {
      avatarInput.addEventListener("input", () => {
        if (avatarInput.value.trim()) avatarPreview.src = avatarInput.value.trim();
      });
    }

    if (avatarFile) {
      avatarFile.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            avatarPreview.src = evt.target.result;
            avatarInput.value = evt.target.result;
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Centered Popup Modal: Project Add / Edit Controls
    const projModal = document.getElementById("admin-project-popup-modal");
    const btnToggleForm = document.getElementById("btn-toggle-project-form");
    const btnCancelForm = document.getElementById("btn-cancel-project-form");
    const btnCancelProjItem = document.getElementById("btn-cancel-project-item");
    const btnSaveProjItem = document.getElementById("btn-save-project-item");

    window.openProjectModal = function(projIdx = null) {
      if (projIdx === null) {
        editingProjectId = null;
        resetProjectForm();
        const titleEl = document.getElementById("proj-form-title");
        if (titleEl) titleEl.innerHTML = `<i class="fas fa-folder-plus"></i> Add New Project`;
        if (btnSaveProjItem) btnSaveProjItem.innerHTML = `<i class="fas fa-check"></i> Save Project`;
      } else {
        const proj = adminConfig.projects[projIdx];
        if (!proj) return;
        editingProjectId = proj.id || ("proj-" + projIdx);
        document.getElementById("proj-input-title").value = proj.title || "";
        document.getElementById("proj-input-category").value = proj.category || "Full-Stack Web Development (2025–2026)";
        document.getElementById("proj-input-placement").value = "normal";
        document.getElementById("proj-input-stats").value = proj.stats || "";
        document.getElementById("proj-input-desc").value = proj.description || "";
        document.getElementById("proj-input-tags").value = (proj.tags || []).join(", ");
        document.getElementById("proj-input-live").value = proj.liveUrl || "#";
        document.getElementById("proj-input-code").value = proj.codeUrl || "https://github.com";
        document.getElementById("proj-input-image").value = proj.image || "";
        document.getElementById("proj-img-preview").src = proj.image || "assets/project1.jpg";
        document.getElementById("proj-input-enabled").checked = proj.enabled !== false;
        document.getElementById("proj-input-featured").checked = proj.featured !== false;

        const titleEl = document.getElementById("proj-form-title");
        if (titleEl) titleEl.innerHTML = `<i class="fas fa-pencil-alt"></i> Edit Project: ${proj.title}`;
        if (btnSaveProjItem) btnSaveProjItem.innerHTML = `<i class="fas fa-save"></i> Update Project`;
      }
      if (projModal) projModal.classList.add("active");
    };

    window.closeProjectModal = function() {
      if (projModal) projModal.classList.remove("active");
      editingProjectId = null;
    };

    if (btnToggleForm) {
      btnToggleForm.addEventListener("click", () => window.openProjectModal(null));
    }
    if (btnCancelForm) btnCancelForm.addEventListener("click", window.closeProjectModal);
    if (btnCancelProjItem) btnCancelProjItem.addEventListener("click", window.closeProjectModal);
    if (btnSaveProjItem) {
      btnSaveProjItem.addEventListener("click", () => saveProjectForm());
    }

    // Project image file upload
    const projImgInput = document.getElementById("proj-input-image");
    const projImgPreview = document.getElementById("proj-img-preview");
    const projFileInput = document.getElementById("proj-file-input");

    if (projImgInput && projImgPreview) {
      projImgInput.addEventListener("input", () => {
        if (projImgInput.value.trim()) projImgPreview.src = projImgInput.value.trim();
      });
    }

    if (projFileInput) {
      projFileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            projImgPreview.src = evt.target.result;
            projImgInput.value = evt.target.result;
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Centered Popup Modal: Add New Skill Controls
    const skillModal = document.getElementById("admin-skill-popup-modal");
    const btnAddSkill = document.getElementById("btn-add-skill-row");
    const btnCloseSkill = document.getElementById("btn-close-skill-modal");
    const btnCancelSkill = document.getElementById("btn-cancel-skill-modal");
    const btnSaveSkill = document.getElementById("btn-save-skill-modal");
    const skillLevelRange = document.getElementById("skill-modal-level");
    const skillLevelVal = document.getElementById("skill-modal-level-val");

    if (skillLevelRange && skillLevelVal) {
      skillLevelRange.addEventListener("input", (e) => {
        skillLevelVal.textContent = e.target.value + "%";
      });
    }

    // Preset icon buttons
    const skillPresets = document.querySelectorAll(".skill-preset-btn");
    skillPresets.forEach(btn => {
      btn.addEventListener("click", () => {
        skillPresets.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const iconInput = document.getElementById("skill-modal-icon");
        if (iconInput) iconInput.value = btn.dataset.icon;
      });
    });

    window.openSkillModal = function() {
      const nameInp = document.getElementById("skill-modal-name");
      if (nameInp) { nameInp.value = ""; }
      if (skillLevelRange) skillLevelRange.value = 90;
      if (skillLevelVal) skillLevelVal.textContent = "90%";
      if (skillModal) skillModal.classList.add("active");
    };

    window.closeSkillModal = function() {
      if (skillModal) skillModal.classList.remove("active");
    };

    if (btnAddSkill) btnAddSkill.addEventListener("click", window.openSkillModal);
    if (btnCloseSkill) btnCloseSkill.addEventListener("click", window.closeSkillModal);
    if (btnCancelSkill) btnCancelSkill.addEventListener("click", window.closeSkillModal);

    if (btnSaveSkill) {
      btnSaveSkill.addEventListener("click", () => {
        const nameInp = document.getElementById("skill-modal-name");
        const name = nameInp ? nameInp.value.trim() : "";
        if (!name) {
          showToast("Please enter a Skill Name.", "warn");
          return;
        }
        const level = skillLevelRange ? parseInt(skillLevelRange.value) || 90 : 90;
        const catSel = document.getElementById("skill-modal-cat");
        const category = catSel ? catSel.value : "web";
        const iconInp = document.getElementById("skill-modal-icon");
        const icon = iconInp ? iconInp.value : "fas fa-code";

        if (!adminConfig.skills) adminConfig.skills = [];
        adminConfig.skills.push({ name, level, category, icon });
        renderSkillsAdminList();
        saveActiveConfig(adminConfig);
        if (window.refreshPortfolioFromConfig) window.refreshPortfolioFromConfig(adminConfig);
        window.closeSkillModal();
        showToast(`✅ Added skill "${name}" successfully!`, "success");
      });
    }

    // Close popups on overlay backdrop click
    [projModal, skillModal, document.getElementById("admin-center-confirm-dialog")].forEach(overlay => {
      if (overlay) {
        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) overlay.classList.remove("active");
        });
      }
    });

    // Import JSON file input
    const importInput = document.getElementById("admin-import-file-input");
    if (importInput) {
      importInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            const res = importPortfolioDataJSON(evt.target.result);
            if (res.success) {
              adminConfig = res.config;
              populateAdminForm(adminConfig);
              if (window.refreshPortfolioFromConfig) window.refreshPortfolioFromConfig(adminConfig);
              showToast("✅ Portfolio data imported & applied successfully!", "success");
            } else {
              showToast("❌ Failed to parse JSON: " + res.error, "warn");
            }
          };
          reader.readAsText(file);
        }
      });
    }

    // Reset Defaults button using centered confirmation dialog
    const btnReset = document.getElementById("btn-reset-defaults");
    if (btnReset) {
      btnReset.addEventListener("click", () => {
        showAdminCenterConfirm({
          title: "Restore Factory Defaults?",
          message: "Are you sure you want to restore original factory defaults? Any customized text, added projects, or skills will be reset.",
          confirmText: "Reset Everything",
          icon: "fas fa-undo-alt",
          iconColor: "#ef4444",
          isDanger: true,
          onConfirm: () => {
            adminConfig = resetActiveConfig();
            populateAdminForm(adminConfig);
            if (window.refreshPortfolioFromConfig) window.refreshPortfolioFromConfig(adminConfig);
            showToast("🔄 Portfolio reset to factory defaults.", "info");
          }
        });
      });
    }

    // Add Experience Milestone button
    const btnAddExp = document.getElementById("btn-add-exp-row");
    if (btnAddExp) {
      btnAddExp.addEventListener("click", () => {
        if (!adminConfig.experiences) adminConfig.experiences = [];
        adminConfig.experiences.unshift({
          year: new Date().getFullYear().toString(),
          role: "New Role / Achievement",
          company: "Organization or University",
          period: "Present",
          description: "Milestone description..."
        });
        renderExperienceAdminList();
        saveActiveConfig(adminConfig);
        if (window.refreshPortfolioFromConfig) window.refreshPortfolioFromConfig(adminConfig);
      });
    }

    // Real-time auto-save for profile text inputs on change/blur
    const profileFieldIds = [
      "adm-prof-name", "adm-prof-brand", "adm-prof-icon", "adm-prof-bio", "adm-prof-badge", "adm-prof-location",
      "adm-prof-taglines", "adm-stat-exp", "adm-stat-proj", "adm-stat-commits", "adm-stat-sat",
      "adm-prof-avatar-url", "adm-soc-email", "adm-soc-wa", "adm-soc-github", "adm-soc-linkedin"
    ];
    profileFieldIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("change", () => {
          saveAllAdminChanges(false);
        });
      }
    });

    // Icon presets and live preview
    const iconInput = document.getElementById("adm-prof-icon");
    const iconPreview = document.getElementById("adm-icon-preview-i");
    if (iconInput && iconPreview) {
      iconInput.addEventListener("input", () => {
        iconPreview.className = iconInput.value.trim() || "fas fa-code";
      });
    }

    document.querySelectorAll(".adm-icon-preset").forEach(btn => {
      btn.addEventListener("click", () => {
        const iconClass = btn.dataset.icon;
        if (iconInput) iconInput.value = iconClass;
        if (iconPreview) iconPreview.className = iconClass;
        saveAllAdminChanges(false);
      });
    });

    // Channel Form Controls
    const btnToggleChannelForm = document.getElementById("btn-toggle-channel-form");
    const channelFormWrap = document.getElementById("admin-channel-form-wrap");
    const btnCancelChannel = document.getElementById("btn-cancel-channel-item");
    const btnSaveChannel = document.getElementById("btn-save-channel-item");

    if (btnToggleChannelForm && channelFormWrap) {
      btnToggleChannelForm.addEventListener("click", () => {
        channelFormWrap.style.display = channelFormWrap.style.display === "none" ? "block" : "none";
        if (channelFormWrap.style.display === "block") {
          channelFormWrap.scrollIntoView({ behavior: "smooth" });
        }
      });
    }

    if (btnCancelChannel && channelFormWrap) {
      btnCancelChannel.addEventListener("click", () => {
        channelFormWrap.style.display = "none";
      });
    }

    // Channel Presets Click
    document.querySelectorAll(".ch-preset-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const title = btn.dataset.title || "";
        const sub = btn.dataset.sub || "";
        const icon = btn.dataset.icon || "";
        const color = btn.dataset.color || "#38bdf8";

        const titleInp = document.getElementById("adm-ch-title");
        const subInp = document.getElementById("adm-ch-subtitle");
        const iconInp = document.getElementById("adm-ch-icon");
        const colorInp = document.getElementById("adm-ch-color");

        if (titleInp && !titleInp.value) titleInp.value = title;
        if (subInp && !subInp.value) subInp.value = sub;
        if (iconInp) iconInp.value = icon;
        if (colorInp) colorInp.value = color;
      });
    });

    if (btnSaveChannel) {
      btnSaveChannel.addEventListener("click", () => {
        const title = (document.getElementById("adm-ch-title")?.value || "").trim();
        const subtitle = (document.getElementById("adm-ch-subtitle")?.value || "").trim();
        const url = (document.getElementById("adm-ch-url")?.value || "").trim();
        const icon = (document.getElementById("adm-ch-icon")?.value || "fas fa-link").trim();
        const color = document.getElementById("adm-ch-color")?.value || "#38bdf8";

        if (!title || !url) {
          alert("Please enter both a Channel Title and a Link URL.");
          return;
        }

        if (!adminConfig.channels) adminConfig.channels = [];
        adminConfig.channels.push({
          id: "ch_" + Date.now(),
          title,
          subtitle,
          url,
          icon,
          color,
          enabled: true
        });

        // Reset inputs
        const tInp = document.getElementById("adm-ch-title");
        const sInp = document.getElementById("adm-ch-subtitle");
        const uInp = document.getElementById("adm-ch-url");
        if (tInp) tInp.value = "";
        if (sInp) sInp.value = "";
        if (uInp) uInp.value = "";
        if (channelFormWrap) channelFormWrap.style.display = "none";

        renderChannelsAdminList();
        saveActiveConfig(adminConfig);
        if (window.refreshPortfolioFromConfig) window.refreshPortfolioFromConfig(adminConfig);
      });
    }

    // Click on modal backdrop to close
    const modalEl = document.getElementById("admin-control-modal");
    if (modalEl) {
      modalEl.addEventListener("click", (e) => {
        if (e.target === modalEl) closeAdminPanel();
      });
    }
  }

  // 5. Populate Form Fields from Config
  function populateAdminForm(cfg) {
    if (!cfg) return;

    // Sections
    const secs = cfg.sections || {};
    const secKeys = ["hero", "projects", "skills", "terminal", "experience", "testimonials", "contact", "visitorGate", "fluidBg"];
    secKeys.forEach(k => {
      const toggle = document.getElementById(`sec-toggle-${k}`);
      if (toggle) toggle.checked = secs[k] !== false;
    });

    // Profile
    const prof = cfg.profile || {};
    setVal("adm-prof-name", prof.name || "");
    setVal("adm-prof-brand", prof.brand || "");
    setVal("adm-prof-icon", prof.icon || "fas fa-code");
    const iconPreviewEl = document.getElementById("adm-icon-preview-i");
    if (iconPreviewEl) iconPreviewEl.className = prof.icon || "fas fa-code";
    setVal("adm-prof-bio", prof.heroBio || "");
    setVal("adm-prof-badge", prof.badge || "");
    setVal("adm-prof-location", prof.location || "");

    const taglinesText = (prof.taglines && prof.taglines.length) ? prof.taglines.join("\n") : (prof.tagline || "");
    setVal("adm-prof-taglines", taglinesText);

    setVal("adm-stat-exp", prof.experienceYears || "4+");
    setVal("adm-stat-proj", prof.completedProjects || "35+");
    setVal("adm-stat-commits", prof.codeCommits || "8.4k");
    setVal("adm-stat-sat", prof.clientSatisfaction || "100%");

    // Avatar
    const avatarUrl = prof.avatar || "assets/avatar.jpg";
    setVal("adm-prof-avatar-url", avatarUrl);
    const avatarPreview = document.getElementById("adm-avatar-preview");
    if (avatarPreview) avatarPreview.src = avatarUrl;

    // Socials
    const soc = cfg.socials || {};
    setVal("adm-soc-email", soc.email || cfg.adminEmail || "");
    setVal("adm-soc-wa", soc.whatsappNumber || "");
    setVal("adm-soc-github", soc.github || "");
    setVal("adm-soc-linkedin", soc.linkedin || "");

    // Projects count and list
    renderProjectsAdminList();

    // Skills & Experience sublists
    renderSkillsAdminList();
    renderExperienceAdminList();
    renderChannelsAdminList();
    if (typeof loadAndRenderAdminInquiries === "function") {
      loadAndRenderAdminInquiries();
    }
    if (typeof loadAndRenderAdminReviews === "function") {
      loadAndRenderAdminReviews();
    }
  }

  function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
  }

  function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  // 6. Render Projects in Admin
  function renderProjectsAdminList() {
    const list = document.getElementById("admin-projects-list");
    const counter = document.getElementById("admin-proj-counter");
    if (!list) return;

    const projects = adminConfig.projects || [];
    if (counter) counter.textContent = projects.length;

    list.innerHTML = "";
    if (projects.length === 0) {
      list.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-dim);">No projects yet. Click "+ Add New Project" to create one.</div>`;
      return;
    }

    projects.forEach((proj, idx) => {
      const card = document.createElement("div");
      card.className = "admin-project-card glass-panel";
      const isEnabled = proj.enabled !== false;

      card.innerHTML = `
        <div class="admin-project-row">
          <div class="admin-proj-thumb-wrap">
            <img src="${proj.image || 'assets/project1.jpg'}" alt="${proj.title}" onerror="this.src='assets/project1.jpg'">
          </div>

          <div class="admin-proj-details">
            <div class="admin-proj-title-row">
              <h4 class="admin-proj-name">${proj.title}</h4>
              <span class="badge ${isEnabled ? 'badge-active' : 'badge-disabled'}">
                ${isEnabled ? '<i class="fas fa-eye"></i> Visible' : '<i class="fas fa-eye-slash"></i> Hidden'}
              </span>
            </div>
            <div class="field-placement-tag"><i class="fas fa-map-pin"></i> Website Par: Section #projects (Featured Cards Grid)</div>
            <div class="admin-proj-category">${proj.category || 'Portfolio Project'}</div>
            <p class="admin-proj-desc">${proj.description || ''}</p>
            <div class="admin-proj-tags">
              ${(proj.tags || []).map(t => `<span class="tech-tag">${t}</span>`).join("")}
            </div>
          </div>

          <div class="admin-proj-actions">
            <label class="admin-switch" title="Toggle visibility">
              <input type="checkbox" ${isEnabled ? 'checked' : ''} data-index="${idx}" class="proj-toggle-switch">
              <span class="slider"></span>
            </label>
            <button type="button" class="btn btn-secondary btn-sm proj-edit-btn" data-index="${idx}">
              <i class="fas fa-pencil-alt"></i> Edit
            </button>
            <button type="button" class="btn btn-secondary btn-sm proj-delete-btn" data-index="${idx}" style="color:#f87171; border-color:rgba(239,68,68,0.3);">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      `;

      list.appendChild(card);
    });

    // Project toggle switch listeners
    list.querySelectorAll(".proj-toggle-switch").forEach(sw => {
      sw.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.index);
        if (adminConfig.projects[idx]) {
          adminConfig.projects[idx].enabled = e.target.checked;
          renderProjectsAdminList();
          saveActiveConfig(adminConfig);
          if (window.refreshPortfolioFromConfig) window.refreshPortfolioFromConfig(adminConfig);
          showToast(`Project "${adminConfig.projects[idx].title}" ${e.target.checked ? 'enabled' : 'hidden'}!`);
        }
      });
    });

    // Project edit buttons (Opens centered popup modal)
    list.querySelectorAll(".proj-edit-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.index);
        editProjectItem(idx);
      });
    });

    // Project delete buttons (Uses centered confirmation dialog)
    list.querySelectorAll(".proj-delete-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.index);
        const proj = adminConfig.projects[idx];
        if (proj) {
          showAdminCenterConfirm({
            title: "Delete Project?",
            message: `Are you sure you want to delete <strong>"${proj.title}"</strong>?<br>It will be removed permanently from your portfolio.`,
            confirmText: "Delete Project",
            icon: "fas fa-trash-alt",
            iconColor: "#ef4444",
            isDanger: true,
            onConfirm: () => {
              adminConfig.projects.splice(idx, 1);
              renderProjectsAdminList();
              saveActiveConfig(adminConfig);
              if (window.refreshPortfolioFromConfig) window.refreshPortfolioFromConfig(adminConfig);
              showToast(`Deleted project "${proj.title}".`);
            }
          });
        }
      });
    });
  }

  // 7. Edit Project Item (Opens centered popup modal)
  function editProjectItem(idx) {
    if (typeof window.openProjectModal === "function") {
      window.openProjectModal(idx);
    }
  }

  function resetProjectForm() {
    document.getElementById("proj-input-title").value = "";
    document.getElementById("proj-input-stats").value = "";
    document.getElementById("proj-input-desc").value = "";
    document.getElementById("proj-input-tags").value = "";
    document.getElementById("proj-input-live").value = "#";
    document.getElementById("proj-input-code").value = "https://github.com";
    document.getElementById("proj-input-image").value = "assets/project1.jpg";
    document.getElementById("proj-img-preview").src = "assets/project1.jpg";
    document.getElementById("proj-input-enabled").checked = true;
    document.getElementById("proj-input-featured").checked = true;
  }

  function saveProjectForm() {
    const title = document.getElementById("proj-input-title").value.trim();
    if (!title) {
      showToast("Please enter a Project Title.", "warn");
      return;
    }

    const category = document.getElementById("proj-input-category").value;
    const placement = document.getElementById("proj-input-placement")?.value || "normal";
    const stats = document.getElementById("proj-input-stats").value.trim();
    const desc = document.getElementById("proj-input-desc").value.trim();
    const tagsRaw = document.getElementById("proj-input-tags").value;
    const tags = tagsRaw.split(",").map(t => t.trim()).filter(Boolean);
    const live = document.getElementById("proj-input-live").value.trim() || "#";
    const code = document.getElementById("proj-input-code").value.trim() || "https://github.com";
    const img = document.getElementById("proj-input-image").value.trim() || "assets/project1.jpg";
    const enabled = document.getElementById("proj-input-enabled").checked;
    const featured = document.getElementById("proj-input-featured").checked;

    if (!adminConfig.projects) adminConfig.projects = [];

    if (editingProjectId) {
      // Find and update
      const existingIdx = adminConfig.projects.findIndex(p => (p.id === editingProjectId));
      if (existingIdx !== -1) {
        adminConfig.projects[existingIdx] = {
          ...adminConfig.projects[existingIdx],
          title, category, stats, description: desc, tags, liveUrl: live, codeUrl: code, image: img, enabled, featured
        };
      }
      showToast(`Updated project "${title}"!`, "success");
    } else {
      // Create new
      const newProj = {
        id: "proj-" + Date.now(),
        title,
        category,
        description: desc,
        image: img,
        tags,
        liveUrl: live,
        codeUrl: code,
        featured,
        enabled,
        stats: stats || "Featured Innovation"
      };

      if (placement === "top") {
        adminConfig.projects.unshift(newProj);
      } else {
        adminConfig.projects.push(newProj);
      }
      showToast(`Added new project "${title}" to Projects section!`, "success");
    }

    editingProjectId = null;
    if (typeof window.closeProjectModal === "function") {
      window.closeProjectModal();
    }
    renderProjectsAdminList();
    saveActiveConfig(adminConfig);
    if (window.refreshPortfolioFromConfig) window.refreshPortfolioFromConfig(adminConfig);
  }

  // 8. Render Skills in Admin
  function renderSkillsAdminList() {
    const container = document.getElementById("admin-skills-list");
    if (!container) return;
    const skills = adminConfig.skills || [];

    container.innerHTML = "";
    skills.forEach((sk, idx) => {
      const row = document.createElement("div");
      row.className = "admin-subrow glass-panel";
      row.innerHTML = `
        <div style="flex: 2; min-width: 200px;">
          <input type="text" class="form-control form-control-sm skill-name-input" data-idx="${idx}" value="${sk.name}">
        </div>
        <div style="width: 100px; display: flex; align-items: center; gap: 6px;">
          <input type="number" min="1" max="100" class="form-control form-control-sm skill-level-input" data-idx="${idx}" value="${sk.level}">
          <span style="color: var(--text-dim); font-size: 0.85rem;">%</span>
        </div>
        <div style="width: 140px;">
          <select class="form-control form-control-sm skill-cat-select" data-idx="${idx}" style="background:var(--bg-input);">
            <option value="web" ${sk.category === 'web' ? 'selected' : ''}>Web</option>
            <option value="robotics" ${sk.category === 'robotics' ? 'selected' : ''}>Robotics</option>
            <option value="cs" ${sk.category === 'cs' ? 'selected' : ''}>CS Academic</option>
            <option value="3d" ${sk.category === '3d' ? 'selected' : ''}>3D Animation</option>
            <option value="media" ${sk.category === 'media' ? 'selected' : ''}>Media / Video</option>
            <option value="office" ${sk.category === 'office' ? 'selected' : ''}>Office / Biz</option>
          </select>
        </div>
        <button type="button" class="btn btn-secondary btn-sm skill-del-btn" data-idx="${idx}" style="color:#f87171; border-color:rgba(239,68,68,0.3);">
          <i class="fas fa-trash"></i>
        </button>
      `;
      container.appendChild(row);
    });

    container.querySelectorAll(".skill-name-input").forEach(inp => {
      inp.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.idx);
        if (adminConfig.skills[idx]) {
          adminConfig.skills[idx].name = e.target.value.trim();
          saveActiveConfig(adminConfig);
          if (window.refreshPortfolioFromConfig) window.refreshPortfolioFromConfig(adminConfig);
        }
      });
    });

    container.querySelectorAll(".skill-level-input").forEach(inp => {
      inp.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.idx);
        if (adminConfig.skills[idx]) {
          adminConfig.skills[idx].level = Math.max(1, Math.min(100, parseInt(e.target.value) || 90));
          saveActiveConfig(adminConfig);
          if (window.refreshPortfolioFromConfig) window.refreshPortfolioFromConfig(adminConfig);
        }
      });
    });

    container.querySelectorAll(".skill-cat-select").forEach(sel => {
      sel.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.idx);
        if (adminConfig.skills[idx]) {
          adminConfig.skills[idx].category = e.target.value;
          saveActiveConfig(adminConfig);
          if (window.refreshPortfolioFromConfig) window.refreshPortfolioFromConfig(adminConfig);
        }
      });
    });

    container.querySelectorAll(".skill-del-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.idx);
        const sk = adminConfig.skills[idx];
        showAdminCenterConfirm({
          title: "Delete Technical Skill?",
          message: `Are you sure you want to remove <strong>"${sk ? sk.name : 'this skill'}"</strong> from your arsenal?`,
          confirmText: "Delete Skill",
          icon: "fas fa-trash-alt",
          iconColor: "#ef4444",
          isDanger: true,
          onConfirm: () => {
            adminConfig.skills.splice(idx, 1);
            renderSkillsAdminList();
            saveActiveConfig(adminConfig);
            if (window.refreshPortfolioFromConfig) window.refreshPortfolioFromConfig(adminConfig);
            showToast("Skill deleted successfully.");
          }
        });
      });
    });
  }

  // 9. Render Timeline / Experience in Admin
  function renderExperienceAdminList() {
    const container = document.getElementById("admin-experience-list");
    if (!container) return;
    const experiences = adminConfig.experiences || [];

    container.innerHTML = "";
    experiences.forEach((exp, idx) => {
      const row = document.createElement("div");
      row.className = "admin-subrow glass-panel";
      row.style.flexDirection = "column";
      row.style.alignItems = "stretch";
      row.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
          <input type="text" class="form-control form-control-sm exp-year-input" style="width:90px;" data-idx="${idx}" value="${exp.year || ''}" placeholder="Year">
          <input type="text" class="form-control form-control-sm exp-role-input" style="flex:1;" data-idx="${idx}" value="${exp.role || ''}" placeholder="Role / Degree">
          <input type="text" class="form-control form-control-sm exp-comp-input" style="flex:1;" data-idx="${idx}" value="${exp.company || ''}" placeholder="Institution / Field">
          <button type="button" class="btn btn-secondary btn-sm exp-del-btn" data-idx="${idx}" style="color:#f87171; border-color:rgba(239,68,68,0.3);">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <textarea class="form-control form-control-sm exp-desc-input" rows="2" data-idx="${idx}" placeholder="Description of achievements..." style="margin-top:6px;">${exp.description || ''}</textarea>
      `;
      container.appendChild(row);
    });

    container.querySelectorAll(".exp-year-input").forEach(inp => {
      inp.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.idx);
        if (adminConfig.experiences[idx]) {
          adminConfig.experiences[idx].year = e.target.value.trim();
          saveActiveConfig(adminConfig);
          if (window.refreshPortfolioFromConfig) window.refreshPortfolioFromConfig(adminConfig);
        }
      });
    });

    container.querySelectorAll(".exp-role-input").forEach(inp => {
      inp.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.idx);
        if (adminConfig.experiences[idx]) {
          adminConfig.experiences[idx].role = e.target.value.trim();
          saveActiveConfig(adminConfig);
          if (window.refreshPortfolioFromConfig) window.refreshPortfolioFromConfig(adminConfig);
        }
      });
    });

    container.querySelectorAll(".exp-comp-input").forEach(inp => {
      inp.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.idx);
        if (adminConfig.experiences[idx]) {
          adminConfig.experiences[idx].company = e.target.value.trim();
          saveActiveConfig(adminConfig);
          if (window.refreshPortfolioFromConfig) window.refreshPortfolioFromConfig(adminConfig);
        }
      });
    });

    container.querySelectorAll(".exp-desc-input").forEach(inp => {
      inp.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.idx);
        if (adminConfig.experiences[idx]) {
          adminConfig.experiences[idx].description = e.target.value.trim();
          saveActiveConfig(adminConfig);
          if (window.refreshPortfolioFromConfig) window.refreshPortfolioFromConfig(adminConfig);
        }
      });
    });

    container.querySelectorAll(".exp-del-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.idx);
        const exp = adminConfig.experiences[idx];
        showAdminCenterConfirm({
          title: "Delete Career Milestone?",
          message: `Are you sure you want to remove milestone <strong>"${exp ? (exp.role || exp.year) : 'Item'}"</strong>?`,
          confirmText: "Delete Milestone",
          icon: "fas fa-trash-alt",
          iconColor: "#ef4444",
          isDanger: true,
          onConfirm: () => {
            adminConfig.experiences.splice(idx, 1);
            renderExperienceAdminList();
            saveActiveConfig(adminConfig);
            if (window.refreshPortfolioFromConfig) window.refreshPortfolioFromConfig(adminConfig);
            showToast("Milestone removed successfully.");
          }
        });
      });
    });
  }

  // 9.1 Render Direct Channels in Admin (YouTube, TikTok, Links)
  function renderChannelsAdminList() {
    const container = document.getElementById("admin-channels-list-container");
    const counter = document.getElementById("admin-channel-counter");
    if (!container) return;

    if (!adminConfig.channels) adminConfig.channels = [];
    const channels = adminConfig.channels;
    if (counter) counter.textContent = channels.length;

    if (channels.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:30px; color:var(--text-muted); background:rgba(255,255,255,0.02); border-radius:12px; border:1px dashed rgba(255,255,255,0.1);">
          <i class="fas fa-share-alt" style="font-size:2rem; margin-bottom:10px; display:block; opacity:0.4;"></i>
          No custom channels added yet. Click <strong>"Add New Channel"</strong> above to add your YouTube, TikTok, or other links.
        </div>
      `;
      return;
    }

    container.innerHTML = "";
    channels.forEach((ch, idx) => {
      const card = document.createElement("div");
      card.className = "admin-subrow glass-panel";
      card.style.display = "flex";
      card.style.alignItems = "center";
      card.style.justifyContent = "space-between";
      card.style.gap = "12px";
      card.style.padding = "14px";
      card.style.borderRadius = "12px";
      card.style.background = "rgba(15, 23, 42, 0.6)";
      card.style.border = "1px solid rgba(255,255,255,0.08)";

      const color = ch.color || "#38bdf8";
      const icon = ch.icon || "fas fa-link";

      card.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px; flex:1; min-width:0;">
          <div style="width:42px; height:42px; border-radius:10px; background:${color}22; color:${color}; display:flex; align-items:center; justify-content:center; font-size:1.3rem; flex-shrink:0;">
            <i class="${icon}"></i>
          </div>
          <div style="flex:1; min-width:0;">
            <div style="font-weight:700; color:#fff; font-size:0.95rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${ch.title}</div>
            <div style="font-size:0.8rem; color:var(--text-dim); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${ch.subtitle || ch.url}</div>
            <a href="${ch.url}" target="_blank" style="font-size:0.75rem; color:var(--color-cyan); text-decoration:none; display:inline-flex; align-items:center; gap:4px; margin-top:2px;">
              ${ch.url} <i class="fas fa-external-link-alt" style="font-size:0.65rem;"></i>
            </a>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:10px; flex-shrink:0;">
          <label class="admin-switch" title="Toggle Channel Visibility">
            <input type="checkbox" class="ch-toggle-input" data-idx="${idx}" ${ch.enabled !== false ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
          <button type="button" class="btn btn-secondary btn-sm ch-del-btn" data-idx="${idx}" style="color:#f87171; border-color:rgba(239,68,68,0.3); padding:8px 12px;" title="Delete Channel">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
      container.appendChild(card);
    });

    container.querySelectorAll(".ch-toggle-input").forEach(toggle => {
      toggle.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.idx);
        if (adminConfig.channels[idx]) {
          adminConfig.channels[idx].enabled = e.target.checked;
          saveActiveConfig(adminConfig);
          if (window.refreshPortfolioFromConfig) window.refreshPortfolioFromConfig(adminConfig);
        }
      });
    });

    container.querySelectorAll(".ch-del-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.idx);
        const ch = adminConfig.channels[idx];
        showAdminCenterConfirm({
          title: "Delete Direct Channel?",
          message: `Are you sure you want to remove channel <strong>"${ch ? ch.title : 'Link'}"</strong>?`,
          confirmText: "Delete Channel",
          icon: "fas fa-trash-alt",
          iconColor: "#ef4444",
          isDanger: true,
          onConfirm: () => {
            adminConfig.channels.splice(idx, 1);
            renderChannelsAdminList();
            saveActiveConfig(adminConfig);
            if (window.refreshPortfolioFromConfig) window.refreshPortfolioFromConfig(adminConfig);
            showToast("Channel removed.");
          }
        });
      });
    });
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // 9.2 Render Inquiries / Leads in Admin Panel
  window.loadAndRenderAdminInquiries = async function() {
    const container = document.getElementById("admin-inquiries-list-container");
    const counter = document.getElementById("admin-inquiries-counter");
    const titleCount = document.getElementById("admin-inquiries-title-count");
    if (!container) return;

    container.innerHTML = `
      <div style="text-align:center; padding:24px; color:var(--text-muted);">
        <i class="fas fa-spinner fa-spin"></i> Loading inquiries from cloud...
      </div>
    `;

    let inquiries = [];
    if (typeof fetchInquiries === "function") {
      inquiries = await fetchInquiries();
    } else {
      try {
        const raw = localStorage.getItem("devsphere_inquiries");
        if (raw) inquiries = JSON.parse(raw);
      } catch (e) {}
    }

    if (!Array.isArray(inquiries)) inquiries = [];
    if (counter) counter.textContent = inquiries.length;
    if (titleCount) titleCount.textContent = inquiries.length;

    if (inquiries.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:36px 20px; background:rgba(255,255,255,0.02); border-radius:14px; border:1px dashed rgba(255,255,255,0.12);">
          <i class="fas fa-inbox" style="font-size:2.5rem; color:var(--text-muted); opacity:0.5; margin-bottom:12px; display:block;"></i>
          <h4 style="color:#fff; margin-bottom:6px;">No Inquiries Yet</h4>
          <p style="color:var(--text-muted); font-size:0.9rem; margin:0; max-width:480px; margin:0 auto;">
            Jab bhi koi visitor website par <strong>#contact</strong> section mein form submit karega, uski inquiry foran yahan show hogi aur aapko email par bhi notification aayegi.
          </p>
        </div>
      `;
      return;
    }

    container.innerHTML = "";
    inquiries.forEach((inq, idx) => {
      const card = document.createElement("div");
      card.className = "inquiry-card glass-panel";
      card.style.cssText = "background:rgba(15, 23, 42, 0.75); border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:18px;";

      const rawPhone = (inq.phone || inq.email || "").toString();
      const cleanPhone = rawPhone.replace(/[^0-9]/g, "");
      const formattedWaPhone = cleanPhone.startsWith("0") ? ("92" + cleanPhone.substring(1)) : (cleanPhone.startsWith("92") ? cleanPhone : ("92" + cleanPhone));
      const waMsg = encodeURIComponent(`Hi ${inq.name || 'there'}! Thank you for contacting me regarding "${inq.projectType || 'Project Inquiry'}". I would love to discuss this with you.`);
      const waUrl = `https://wa.me/${formattedWaPhone}?text=${waMsg}`;

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
          <div>
            <h4 style="color:#fff; margin:0 0 4px 0; font-size:1.1rem; display:flex; align-items:center; gap:8px;">
              <i class="fas fa-user-circle" style="color:var(--color-cyan);"></i> ${escapeHtml(inq.name || 'Anonymous Client')}
            </h4>
            <div style="font-size:0.85rem; color:var(--text-muted);">
              <i class="far fa-clock"></i> ${escapeHtml(inq.formattedTime || inq.timestamp || 'Recent')}
            </div>
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            ${cleanPhone ? `
              <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm" style="background:#25d366; color:#fff; border:none; display:inline-flex; align-items:center; gap:6px; text-decoration:none; font-weight:600;">
                <i class="fab fa-whatsapp" style="font-size:1.1rem;"></i> Chat on WhatsApp
              </a>
            ` : ''}
            <button type="button" class="btn btn-secondary btn-sm inq-del-btn" data-id="${inq.id || idx}" title="Delete Inquiry" style="color:#f87171;">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:10px; margin-bottom:12px; font-size:0.9rem;">
          <div style="background:rgba(255,255,255,0.03); padding:8px 12px; border-radius:8px;">
            <strong style="color:var(--text-muted); display:block; font-size:0.75rem; text-transform:uppercase;">Phone / Contact:</strong>
            <span style="color:var(--color-mint); font-family:var(--font-mono); font-size:0.95rem;">${escapeHtml(inq.phone || inq.email || 'N/A')}</span>
          </div>
          <div style="background:rgba(255,255,255,0.03); padding:8px 12px; border-radius:8px;">
            <strong style="color:var(--text-muted); display:block; font-size:0.75rem; text-transform:uppercase;">Category:</strong>
            <span style="color:var(--color-lilac);">${escapeHtml(inq.projectType || 'General Inquiry')}</span>
          </div>
        </div>

        <div style="background:rgba(0,0,0,0.3); border-left:3px solid var(--color-cyan); padding:12px 14px; border-radius:0 8px 8px 0; font-size:0.9rem; color:#e2e8f0; line-height:1.5;">
          ${(escapeHtml(inq.message || '')).replace(/\n/g, '<br>') || '<em style="color:var(--text-muted);">No message details provided.</em>'}
        </div>
      `;

      const delBtn = card.querySelector(".inq-del-btn");
      if (delBtn) {
        delBtn.addEventListener("click", () => {
          showAdminCenterConfirm({
            title: "Remove Client Inquiry?",
            message: `Are you sure you want to remove inquiry from <strong>${escapeHtml(inq.name || 'Client')}</strong>?`,
            confirmText: "Remove Inquiry",
            icon: "fas fa-trash-alt",
            iconColor: "#ef4444",
            isDanger: true,
            onConfirm: async () => {
              delBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
              delBtn.disabled = true;
              if (typeof deleteInquiryFromCloud === "function") {
                await deleteInquiryFromCloud(inq.id || idx);
              }
              loadAndRenderAdminInquiries();
              showToast("Inquiry removed.");
            }
          });
        });
      }

      container.appendChild(card);
    });
  };

  // 9.3 Render Reviews Management in Admin Panel
  window.loadAndRenderAdminReviews = async function() {
    const container = document.getElementById("admin-reviews-list-container");
    const counter = document.getElementById("admin-reviews-counter");
    const titleCount = document.getElementById("admin-reviews-title-count");
    if (!container) return;

    container.innerHTML = `
      <div style="text-align:center; padding:24px; color:var(--text-muted);">
        <i class="fas fa-spinner fa-spin"></i> Loading reviews from database...
      </div>
    `;

    let reviews = [];
    if (typeof fetchReviewsFromCloud === "function") {
      reviews = await fetchReviewsFromCloud();
    } else {
      try {
        const raw = localStorage.getItem("devsphere_public_reviews");
        if (raw) reviews = JSON.parse(raw);
      } catch (e) {}
    }

    if (!Array.isArray(reviews)) reviews = [];
    if (counter) counter.textContent = reviews.length;
    if (titleCount) titleCount.textContent = reviews.length;

    if (reviews.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:36px 20px; background:rgba(255,255,255,0.02); border-radius:14px; border:1px dashed rgba(255,255,255,0.12);">
          <i class="fas fa-comment-slash" style="font-size:2.5rem; color:var(--text-muted); opacity:0.5; margin-bottom:12px; display:block;"></i>
          <h4 style="color:#fff; margin-bottom:6px;">No Reviews Published Yet</h4>
          <p style="color:var(--text-muted); font-size:0.9rem; margin:0; max-width:480px; margin:0 auto;">
            Jab bhi koi visitor website par <strong>Leave a Review</strong> submit karega, unka review yahan show hoga. Aap kisi bhi galat review ko yahan se foran delete kar sakte hain.
          </p>
        </div>
      `;
      return;
    }

    container.innerHTML = "";
    reviews.forEach((rev) => {
      const card = document.createElement("div");
      card.className = "review-admin-card glass-panel";
      card.style.cssText = "background:rgba(15, 23, 42, 0.75); border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:18px;";

      const stars = "★".repeat(rev.rating || 5) + "☆".repeat(Math.max(0, 5 - (rev.rating || 5)));

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px; margin-bottom:12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <img src="${escapeHtml(rev.avatar || 'assets/avatar.jpg')}" alt="${escapeHtml(rev.author || 'Client')}" style="width:42px; height:42px; border-radius:50%; object-fit:cover; border:2px solid var(--color-cyan);" onerror="this.src='https://api.dicebear.com/7.x/identicon/svg?seed=client'">
            <div>
              <h4 style="color:#fff; margin:0 0 2px 0; font-size:1.05rem;">
                ${escapeHtml(rev.author || 'Anonymous')}
              </h4>
              <div style="font-size:0.8rem; color:var(--text-muted);">
                ${escapeHtml(rev.title || 'Client')} • <span style="font-family:var(--font-mono);">${escapeHtml(rev.date || 'Recent')}</span>
              </div>
            </div>
          </div>
          <div style="display:flex; gap:10px; align-items:center;">
            <span style="color:#facc15; font-size:1rem; letter-spacing:2px;">${stars}</span>
            <button type="button" class="btn btn-sm rev-del-btn" style="background:rgba(239, 68, 68, 0.15); border:1px solid rgba(239, 68, 68, 0.4); color:#f87171; border-radius:8px; padding:6px 14px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:6px;">
              <i class="fas fa-trash-alt"></i> Delete Review
            </button>
          </div>
        </div>

        <div style="background:rgba(0,0,0,0.3); border-left:3px solid #facc15; padding:12px 14px; border-radius:0 8px 8px 0; font-size:0.9rem; color:#e2e8f0; line-height:1.5; font-style:italic;">
          "${(escapeHtml(rev.quote || '')).replace(/\\n/g, '<br>')}"
        </div>
      `;

      const delBtn = card.querySelector(".rev-del-btn");
      if (delBtn) {
        delBtn.addEventListener("click", () => {
          showAdminCenterConfirm({
            title: "Delete Client Review?",
            message: `Are you sure you want to delete this review by <strong>"${escapeHtml(rev.author || 'Client')}"</strong>?<br>It will be removed permanently from portfolio and cloud database.`,
            confirmText: "Delete Review Permanently",
            icon: "fas fa-trash-alt",
            iconColor: "#ef4444",
            isDanger: true,
            onConfirm: async () => {
              delBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Deleting...`;
              delBtn.disabled = true;
              if (typeof deleteReviewFromCloud === "function") {
                await deleteReviewFromCloud(rev.id);
              }
              loadAndRenderAdminReviews();
              showToast("Review deleted permanently.");
            }
          });
        });
      }

      container.appendChild(card);
    });
  };

  // 10. Save All Admin Changes
  function saveAllAdminChanges(showToastMsg = true) {
    if (!adminConfig) adminConfig = getActiveConfig();

    // 1. Gather Section Toggles
    if (!adminConfig.sections) adminConfig.sections = {};
    const secKeys = ["hero", "projects", "skills", "terminal", "experience", "testimonials", "contact", "visitorGate", "fluidBg"];
    secKeys.forEach(k => {
      const toggle = document.getElementById(`sec-toggle-${k}`);
      if (toggle) adminConfig.sections[k] = toggle.checked;
    });

    // 2. Gather Profile Info (Safeguard so data is NEVER wiped out or emptied)
    if (!adminConfig.profile) adminConfig.profile = {};
    const nameVal = getVal("adm-prof-name");
    if (nameVal) adminConfig.profile.name = nameVal;

    const brandVal = getVal("adm-prof-brand");
    if (brandVal) adminConfig.profile.brand = brandVal;

    const iconVal = getVal("adm-prof-icon");
    if (iconVal) adminConfig.profile.icon = iconVal;

    const bioVal = getVal("adm-prof-bio");
    if (bioVal) adminConfig.profile.heroBio = bioVal;

    const badgeVal = getVal("adm-prof-badge");
    if (badgeVal) adminConfig.profile.badge = badgeVal;

    const locVal = getVal("adm-prof-location");
    if (locVal) adminConfig.profile.location = locVal;

    // Rotating taglines
    const taglinesRaw = getVal("adm-prof-taglines");
    const taglinesArr = taglinesRaw.split("\n").map(l => l.trim()).filter(Boolean);
    if (taglinesArr.length) {
      adminConfig.profile.taglines = taglinesArr;
      adminConfig.profile.tagline = taglinesArr[0];
    }

    // Stats
    const expVal = getVal("adm-stat-exp");
    if (expVal) adminConfig.profile.experienceYears = expVal;
    const projVal = getVal("adm-stat-proj");
    if (projVal) adminConfig.profile.completedProjects = projVal;
    const comVal = getVal("adm-stat-commits");
    if (comVal) adminConfig.profile.codeCommits = comVal;
    const satVal = getVal("adm-stat-sat");
    if (satVal) adminConfig.profile.clientSatisfaction = satVal;

    // Avatar
    const avVal = getVal("adm-prof-avatar-url");
    if (avVal) adminConfig.profile.avatar = avVal;

    // Socials
    if (!adminConfig.socials) adminConfig.socials = {};
    const emailVal = getVal("adm-soc-email");
    if (emailVal) {
      adminConfig.socials.email = emailVal;
      adminConfig.adminEmail = emailVal;
    }

    const waVal = getVal("adm-soc-wa");
    if (waVal) {
      adminConfig.socials.whatsappNumber = waVal;
      const cleanDigits = waVal.replace(/[^0-9]/g, "");
      adminConfig.socials.whatsapp = `https://wa.me/${cleanDigits ? cleanDigits : "923446266246"}`;
    }

    const gitVal = getVal("adm-soc-github");
    if (gitVal) adminConfig.socials.github = gitVal;
    const linVal = getVal("adm-soc-linkedin");
    if (linVal) adminConfig.socials.linkedin = linVal;

    // Persist to localStorage & backend immediately
    saveActiveConfig(adminConfig, true);

    // Live DOM refresh
    if (window.refreshPortfolioFromConfig) {
      window.refreshPortfolioFromConfig(adminConfig);
    }

    if (showToastMsg) {
      showToast("🎉 All changes saved & applied to portfolio live!", "success");
      const modal = document.getElementById("admin-control-modal");
      if (modal) {
        modal.classList.remove("active");
        document.body.style.overflow = "";
      }
      editingProjectId = null;
    }
  }

})();
