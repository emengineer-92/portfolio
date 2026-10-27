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

  // 1. Rapid Sequence 5-Tap Detector on Brand Icon (`</>`)
  // Admin panel will ONLY open if 5 taps are in fast sequence (< 500ms between taps)
  // Slow / casual taps are completely ignored and will reset!
  let tapTimestamps = [];

  window.handleBrandIconClick = function(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const now = Date.now();

    // If more than 500ms has elapsed since the previous tap, reset the sequence!
    if (tapTimestamps.length > 0 && (now - tapTimestamps[tapTimestamps.length - 1] > 500)) {
      tapTimestamps = [];
    }

    tapTimestamps.push(now);

    // Keep only last 5 taps
    if (tapTimestamps.length > 5) {
      tapTimestamps.shift();
    }

    // Require exact 5 rapid taps within 1.8 seconds total
    if (tapTimestamps.length === 5) {
      const totalSpan = now - tapTimestamps[0];
      if (totalSpan <= 1800) {
        tapTimestamps = [];
        openAdminPanel();
        if (typeof showToast === "function") {
          showToast("👑 Admin Control Panel Unlocked!", "success");
        }
      } else {
        tapTimestamps = [];
      }
    }
  };

  function initAdminTrigger() {
    const triggerEl = document.getElementById("brand-icon-trigger") || document.querySelector(".brand-icon-wrap");

    if (triggerEl) {
      triggerEl.setAttribute("title", "DevSphere");
      triggerEl.style.cursor = "pointer";

      // Also listen to touchstart for smooth mobile tapping
      triggerEl.addEventListener("touchstart", function(e) {
        handleBrandIconClick(e);
      }, { passive: false });
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

  // Close Admin Panel
  window.closeAdminPanel = function() {
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
              <i class="fas fa-save"></i> Save Changes
            </button>
            <button type="button" class="admin-close-x" onclick="closeAdminPanel()" title="Close Admin Panel">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Navigation Tabs with Horizontal Scroll Controls -->
        <div class="admin-tabs-wrapper">
          <button type="button" class="admin-tab-scroll-arrow left" id="admin-tab-scroll-left" title="Scroll Left (Previous Tabs)">
            <i class="fas fa-chevron-left"></i>
          </button>
          <div class="admin-tabs-nav" id="admin-tabs-nav">
            <button type="button" class="admin-tab-btn active" data-tab="tab-visual-map">
              <i class="fas fa-map-marked-alt"></i> 📍 Kis Jagha Add Hoga (Visual Guide)
            </button>
            <button type="button" class="admin-tab-btn" data-tab="tab-sections">
              <i class="fas fa-toggle-on"></i> Enable / Disable Sections
            </button>
            <button type="button" class="admin-tab-btn" data-tab="tab-profile">
              <i class="fas fa-user-edit"></i> Edit Information
            </button>
            <button type="button" class="admin-tab-btn" data-tab="tab-projects">
              <i class="fas fa-cubes"></i> Manage Projects (<span id="admin-proj-counter">5</span>)
            </button>
            <button type="button" class="admin-tab-btn" data-tab="tab-skills-exp">
              <i class="fas fa-layer-group"></i> Skills &amp; Timeline
            </button>
            <button type="button" class="admin-tab-btn" data-tab="tab-backup">
              <i class="fas fa-database"></i> Backup &amp; Reset
            </button>
          </div>
          <button type="button" class="admin-tab-scroll-arrow right" id="admin-tab-scroll-right" title="Scroll Right (More Tabs)">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>

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

            <!-- Add / Edit Project Form Box -->
            <div id="admin-project-form-wrap" class="admin-subform-box" style="display: none;">
              <div class="subform-header">
                <h4 id="proj-form-title"><i class="fas fa-folder-plus"></i> Add New Project</h4>
                <button type="button" class="admin-btn-text" id="btn-cancel-project-form"><i class="fas fa-times"></i> Cancel</button>
              </div>

              <!-- Placement Indicator Banner -->
              <div class="proj-placement-banner">
                <div class="placement-banner-icon"><i class="fas fa-bullseye"></i></div>
                <div>
                  <strong>Kis Jagha Add Hoga (Website Placement):</strong>
                  <p>Yeh project portfolio ke <strong>Featured Projects Showcase Grid (#projects)</strong> mein ek interactive glass card ke tor par add hoga.</p>
                </div>
              </div>

              <div class="admin-form-grid">
                <div class="form-group">
                  <label class="form-label" for="proj-input-placement">Display Position (Order / Placement)</label>
                  <div class="field-placement-tag"><i class="fas fa-sort-amount-up"></i> Projects Grid mein Kahan Show Hoga?</div>
                  <select id="proj-input-placement" class="form-control" style="background: var(--bg-input);">
                    <option value="top">Top of Showcase (Sab se pehle show ho)</option>
                    <option value="normal" selected>Normal Order (Chronological)</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label" for="proj-input-category">Category / Discipline</label>
                  <div class="field-placement-tag"><i class="fas fa-tag"></i> Project Image ke ooper Glowing Badge</div>
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
                  <div class="field-placement-tag"><i class="fas fa-heading"></i> Project Card ka Main Headline Title</div>
                  <input type="text" id="proj-input-title" class="form-control" placeholder="e.g. Nexora — Full-Stack Cloud Architecture" required>
                </div>

                <div class="form-group form-col-full">
                  <label class="form-label" for="proj-input-stats">Highlights / Stats Pill</label>
                  <div class="field-placement-tag"><i class="fas fa-chart-line"></i> Description ke ooper Glowing Feature Tag</div>
                  <input type="text" id="proj-input-stats" class="form-control" placeholder="e.g. Modern Responsive UI • End-to-End Stack">
                </div>

                <div class="form-group form-col-full">
                  <label class="form-label" for="proj-input-desc">Project Description *</label>
                  <div class="field-placement-tag"><i class="fas fa-align-left"></i> Project Card ka Summary Paragraph</div>
                  <textarea id="proj-input-desc" class="form-control" rows="3" placeholder="Explain the architecture, objectives, and technology used..." required></textarea>
                </div>

                <div class="form-group form-col-full">
                  <label class="form-label" for="proj-input-tags">Tech Stack Tags (Comma-separated)</label>
                  <div class="field-placement-tag"><i class="fas fa-tags"></i> Card ke Bottom par Tech Pills</div>
                  <input type="text" id="proj-input-tags" class="form-control" placeholder="React, Node.js, Express, PostgreSQL, REST API">
                </div>

                <div class="form-group">
                  <label class="form-label" for="proj-input-live">Live Demo URL</label>
                  <div class="field-placement-tag"><i class="fas fa-external-link-alt"></i> Blue "Live Demo" Button ka link</div>
                  <input type="text" id="proj-input-live" class="form-control" placeholder="https://example.com or #">
                </div>

                <div class="form-group">
                  <label class="form-label" for="proj-input-code">GitHub / Source Code URL</label>
                  <div class="field-placement-tag"><i class="fab fa-github"></i> "Source Code" Button ka link</div>
                  <input type="text" id="proj-input-code" class="form-control" placeholder="https://github.com/...">
                </div>

                <!-- Image URL or Upload -->
                <div class="form-group form-col-full">
                  <label class="form-label">Project Cover Image</label>
                  <div class="field-placement-tag"><i class="fas fa-image"></i> Project Card ki 16:9 Cover Picture</div>
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

                <div class="form-col-full" style="display: flex; gap: 10px; margin-top: 10px;">
                  <button type="button" class="btn btn-primary" id="btn-save-project-item">
                    <i class="fas fa-check"></i> Save Project
                  </button>
                  <button type="button" class="btn btn-secondary" id="btn-cancel-project-item">
                    Cancel
                  </button>
                </div>
              </div>
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
                <button type="button" class="btn btn-secondary btn-sm" id="btn-add-skill-row"><i class="fas fa-plus"></i> Add Skill</button>
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

        </div>

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
              <i class="fas fa-save"></i> Save All Changes
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    setupAdminModalEvents();
  }

  // 4. Setup Events inside Admin Modal
  function setupAdminModalEvents() {
    // Tab scrolling and switching
    const tabsNav = document.getElementById("admin-tabs-nav") || document.querySelector(".admin-tabs-nav");
    const scrollLeftBtn = document.getElementById("admin-tab-scroll-left");
    const scrollRightBtn = document.getElementById("admin-tab-scroll-right");

    if (tabsNav) {
      // Horizontal mousewheel scrolling on tabs bar
      tabsNav.addEventListener("wheel", (e) => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          tabsNav.scrollLeft += e.deltaY * 1.5;
        }
      }, { passive: false });

      if (scrollLeftBtn) {
        scrollLeftBtn.addEventListener("click", () => {
          tabsNav.scrollBy({ left: -220, behavior: "smooth" });
        });
      }
      if (scrollRightBtn) {
        scrollRightBtn.addEventListener("click", () => {
          tabsNav.scrollBy({ left: 220, behavior: "smooth" });
        });
      }
    }

    const tabs = document.querySelectorAll(".admin-tab-btn");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".admin-tab-pane").forEach(p => p.classList.remove("active"));

        tab.classList.add("active");
        tab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });

        const targetId = tab.dataset.tab;
        const targetPane = document.getElementById(targetId);
        if (targetPane) targetPane.classList.add("active");
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

    // Projects: Add new project toggle
    const btnToggleForm = document.getElementById("btn-toggle-project-form");
    const formWrap = document.getElementById("admin-project-form-wrap");
    const btnCancelForm = document.getElementById("btn-cancel-project-form");
    const btnCancelProjItem = document.getElementById("btn-cancel-project-item");

    if (btnToggleForm && formWrap) {
      btnToggleForm.addEventListener("click", () => {
        editingProjectId = null;
        resetProjectForm();
        document.getElementById("proj-form-title").innerHTML = `<i class="fas fa-folder-plus"></i> Add New Project`;
        formWrap.style.display = formWrap.style.display === "none" ? "block" : "none";
        if (formWrap.style.display === "block") {
          formWrap.scrollIntoView({ behavior: "smooth" });
        }
      });
    }

    const hideForm = () => {
      if (formWrap) formWrap.style.display = "none";
      editingProjectId = null;
    };
    if (btnCancelForm) btnCancelForm.addEventListener("click", hideForm);
    if (btnCancelProjItem) btnCancelProjItem.addEventListener("click", hideForm);

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

    // Save project item button
    const btnSaveProjItem = document.getElementById("btn-save-project-item");
    if (btnSaveProjItem) {
      btnSaveProjItem.addEventListener("click", () => saveProjectForm());
    }

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

    // Reset Defaults button
    const btnReset = document.getElementById("btn-reset-defaults");
    if (btnReset) {
      btnReset.addEventListener("click", () => {
        const ok = confirm("Are you sure you want to restore original factory defaults? Any customized text or added projects will be reset.");
        if (ok) {
          adminConfig = resetActiveConfig();
          populateAdminForm(adminConfig);
          if (window.refreshPortfolioFromConfig) window.refreshPortfolioFromConfig(adminConfig);
          showToast("🔄 Portfolio reset to factory defaults.", "info");
        }
      });
    }

    // Add Skill Row button
    const btnAddSkill = document.getElementById("btn-add-skill-row");
    if (btnAddSkill) {
      btnAddSkill.addEventListener("click", () => {
        if (!adminConfig.skills) adminConfig.skills = [];
        adminConfig.skills.push({
          name: "New Technical Skill",
          level: 90,
          category: "web",
          icon: "fas fa-code"
        });
        renderSkillsAdminList();
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

    // Project edit buttons
    list.querySelectorAll(".proj-edit-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.index);
        editProjectItem(idx);
      });
    });

    // Project delete buttons
    list.querySelectorAll(".proj-delete-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.index);
        const proj = adminConfig.projects[idx];
        if (proj && confirm(`Are you sure you want to delete "${proj.title}"?`)) {
          adminConfig.projects.splice(idx, 1);
          renderProjectsAdminList();
          saveActiveConfig(adminConfig);
          if (window.refreshPortfolioFromConfig) window.refreshPortfolioFromConfig(adminConfig);
          showToast(`Deleted project "${proj.title}".`);
        }
      });
    });
  }

  // 7. Edit Project Item
  function editProjectItem(idx) {
    const proj = adminConfig.projects[idx];
    if (!proj) return;

    editingProjectId = proj.id || ("proj-" + idx);

    document.getElementById("proj-input-title").value = proj.title || "";
    document.getElementById("proj-input-category").value = proj.category || "Full-Stack Web Development (2025–2026)";
    document.getElementById("proj-input-stats").value = proj.stats || "";
    document.getElementById("proj-input-desc").value = proj.description || "";
    document.getElementById("proj-input-tags").value = (proj.tags || []).join(", ");
    document.getElementById("proj-input-live").value = proj.liveUrl || "#";
    document.getElementById("proj-input-code").value = proj.codeUrl || "https://github.com";
    document.getElementById("proj-input-image").value = proj.image || "";
    document.getElementById("proj-img-preview").src = proj.image || "assets/project1.jpg";
    document.getElementById("proj-input-enabled").checked = proj.enabled !== false;
    document.getElementById("proj-input-featured").checked = proj.featured !== false;

    document.getElementById("proj-form-title").innerHTML = `<i class="fas fa-pencil-alt"></i> Edit Project: ${proj.title}`;
    const formWrap = document.getElementById("admin-project-form-wrap");
    if (formWrap) {
      formWrap.style.display = "block";
      formWrap.scrollIntoView({ behavior: "smooth" });
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
    document.getElementById("admin-project-form-wrap").style.display = "none";
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
        if (adminConfig.skills[idx]) adminConfig.skills[idx].name = e.target.value.trim();
      });
    });

    container.querySelectorAll(".skill-level-input").forEach(inp => {
      inp.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.idx);
        if (adminConfig.skills[idx]) adminConfig.skills[idx].level = Math.max(1, Math.min(100, parseInt(e.target.value) || 90));
      });
    });

    container.querySelectorAll(".skill-cat-select").forEach(sel => {
      sel.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.idx);
        if (adminConfig.skills[idx]) adminConfig.skills[idx].category = e.target.value;
      });
    });

    container.querySelectorAll(".skill-del-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.idx);
        adminConfig.skills.splice(idx, 1);
        renderSkillsAdminList();
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
        if (adminConfig.experiences[idx]) adminConfig.experiences[idx].year = e.target.value.trim();
      });
    });

    container.querySelectorAll(".exp-role-input").forEach(inp => {
      inp.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.idx);
        if (adminConfig.experiences[idx]) adminConfig.experiences[idx].role = e.target.value.trim();
      });
    });

    container.querySelectorAll(".exp-comp-input").forEach(inp => {
      inp.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.idx);
        if (adminConfig.experiences[idx]) adminConfig.experiences[idx].company = e.target.value.trim();
      });
    });

    container.querySelectorAll(".exp-desc-input").forEach(inp => {
      inp.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.idx);
        if (adminConfig.experiences[idx]) adminConfig.experiences[idx].description = e.target.value.trim();
      });
    });

    container.querySelectorAll(".exp-del-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.idx);
        adminConfig.experiences.splice(idx, 1);
        renderExperienceAdminList();
      });
    });
  }

  // 10. Save All Admin Changes
  function saveAllAdminChanges() {
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

    // Persist
    saveActiveConfig(adminConfig);

    // Live DOM refresh
    if (window.refreshPortfolioFromConfig) {
      window.refreshPortfolioFromConfig(adminConfig);
    }

    showToast("🎉 All changes saved & applied to portfolio live!", "success");
    closeAdminPanel();
  }

})();
