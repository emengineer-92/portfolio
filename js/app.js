/**
 * Subhan DevSphere - Main Application Logic
 * Clean luxury portfolio with visitor email capture and interactive experience
 */

document.addEventListener("DOMContentLoaded", () => {
  const config = getActiveConfig();

  // 0. Top Scroll Glowing Progress Bar
  setupTopScrollProgressBar();

  // 1. Initialize Visual Theme & Dynamic Profile
  applyThemeToDOM(config);

  // 1.0 Apply Section Visibility (Enable/Disable sections)
  applySectionVisibility(config);

  // 1.1 Dynamic Smooth Typewriter for Hero Tagline
  initTypewriter(config);

  // 2. Initialize Visitor State (Passwordless Lead Capture)
  VisitorState.init();

  // 3. Render Portfolio Components
  renderProjectsInPortfolio(config);
  renderSkillsInPortfolio(config);
  renderExperiencesInPortfolio(config);
  renderTestimonialsInPortfolio(config);

  // 4. Initialize 3D Card Tilt Effects
  init3DTilt();

  // 5. Initialize Subhan-OS Interactive Terminal
  initTerminal();

  // 6. Contact Form Handler
  setupContactForm();

  // 6.1 Render Custom Direct Channels (YouTube, TikTok, Socials)
  renderDirectChannels(config);

  // 7. Public Reviews Form Handler
  setupReviewForm();

  // 8. Navigation scrollspy & mobile menu
  setupNavigation();

  // 9. Cross-device Cloud Sync (sync updates made from any other mobile or browser)
  if (typeof checkAndApplyCloudUpdates === "function") {
    checkAndApplyCloudUpdates();
  }
});

// Real-time Live Refresh for Admin Customizations
window.refreshPortfolioFromConfig = function(cfg) {
  if (!cfg) cfg = getActiveConfig();
  applyThemeToDOM(cfg);
  applySectionVisibility(cfg);
  initTypewriter(cfg);
  renderDirectChannels(cfg);
  renderProjectsInPortfolio(cfg);
  renderSkillsInPortfolio(cfg);
  renderExperiencesInPortfolio(cfg);
  renderTestimonialsInPortfolio(cfg);
  init3DTilt();
};

// Dynamic Smooth Typewriter for Hero Tagline
function initTypewriter(config) {
  const taglineEl = document.getElementById("dyn-hero-tagline");
  if (!taglineEl) return;

  if (window.__typewriterTimeout) {
    clearTimeout(window.__typewriterTimeout);
  }

  const defaultPhrases = [
    "Senior Full-Stack Developer & Software Architect",
    "Specialist in Next.js, React & Scalable Cloud Systems",
    "Engineering High-Performance Web Applications",
    "Distributed Cloud Architect & Modern API Engineer"
  ];

  const phrases = (config?.profile?.taglines && config.profile.taglines.length > 0)
    ? config.profile.taglines
    : (config?.profile?.tagline ? [config.profile.tagline] : defaultPhrases);

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function tick() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
      charIndex--;
      taglineEl.textContent = currentPhrase.substring(0, charIndex);
    } else {
      charIndex++;
      taglineEl.textContent = currentPhrase.substring(0, charIndex);
    }

    let delay = isDeleting ? 28 : (55 + Math.random() * 25);

    if (!isDeleting && charIndex === currentPhrase.length) {
      // Completed typing full phrase - pause comfortably for 2.4s so user can read
      delay = 2400;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      // Completed erasing - switch to next phrase and pause 400ms before typing next
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delay = 400;
    }

    window.__typewriterTimeout = setTimeout(tick, delay);
  }

  // Clear static placeholder and begin smooth typing
  taglineEl.textContent = "";
  window.__typewriterTimeout = setTimeout(tick, 450);
}

// Dynamic Styler & Profile Data Renderer
function applyThemeToDOM(config) {
  if (!config) return;
  const root = document.documentElement;

  // Colors
  if (config.theme?.primaryColor) root.style.setProperty("--primary-color", config.theme.primaryColor);
  if (config.theme?.secondaryColor) root.style.setProperty("--secondary-color", config.theme.secondaryColor);
  if (config.theme?.accentColor) root.style.setProperty("--accent-color", config.theme.accentColor);
  if (config.theme?.borderRadius) root.style.setProperty("--border-radius", config.theme.borderRadius);

  // Brand Logo Icon
  const brandIconEl = document.getElementById("brand-icon-i") || document.querySelector(".brand-icon-wrap i");
  if (brandIconEl) {
    brandIconEl.className = config.profile?.icon || "fas fa-code";
  }

  // Text contents
  const heroName = document.querySelectorAll(".dyn-profile-name");
  heroName.forEach(el => el.textContent = config.profile?.name || "Subhan");

  const heroBrand = document.querySelectorAll(".dyn-profile-brand");
  heroBrand.forEach(el => el.textContent = config.profile?.brand || "DevSphere");

  const heroBio = document.getElementById("dyn-hero-bio");
  if (heroBio) heroBio.textContent = config.profile?.heroBio || "";

  const heroBadge = document.getElementById("dyn-hero-badge");
  if (heroBadge) heroBadge.textContent = config.profile?.badge || "";

  const heroAvatar = document.getElementById("dyn-hero-avatar");
  if (heroAvatar && config.profile?.avatar) {
    heroAvatar.src = config.profile.avatar;
  }

  // Stat counters
  const statExp = document.getElementById("stat-exp");
  if (statExp) statExp.textContent = config.profile?.experienceYears || "4+";

  const statProj = document.getElementById("stat-projects");
  if (statProj) statProj.textContent = config.profile?.completedProjects || "35+";

  const statCommits = document.getElementById("stat-commits");
  if (statCommits) statCommits.textContent = config.profile?.codeCommits || "8.4k";

  const statSatisfaction = document.getElementById("stat-satisfaction");
  if (statSatisfaction) statSatisfaction.textContent = config.profile?.clientSatisfaction || "100%";

  // Dynamic Contact Channels & Socials
  const emailVal = config.socials?.email || config.adminEmail || "mirzasubhanali449@gmail.com";
  const waNumber = config.socials?.whatsappNumber || "03446266246";
  const cleanDigits = waNumber.replace(/[^0-9]/g, "") || "923446266246";

  const emailLink = document.getElementById("dyn-contact-email-link");
  if (emailLink) {
    emailLink.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailVal)}&su=Project%20Inquiry%20-%20DevSphere`;
  }

  const waLink = document.getElementById("dyn-contact-wa-link");
  if (waLink) {
    const formattedAdminNum = cleanDigits.startsWith("0") ? ("92" + cleanDigits.substring(1)) : (cleanDigits.startsWith("92") ? cleanDigits : ("92" + cleanDigits));
    const waText = encodeURIComponent("Hi Subhan! I visited your portfolio and would like to connect with you regarding a project.");
    waLink.href = `https://wa.me/${formattedAdminNum}?text=${waText}`;
  }

  const locEl = document.getElementById("dyn-contact-location");
  if (locEl) {
    locEl.textContent = config.profile?.location || "Pakistan 🇵🇰 (Available for Global & Remote Work)";
  }
}

// Enable / Disable Section Visibility Engine
function applySectionVisibility(config) {
  if (!config) return;
  const sections = config.sections || {};

  const mapping = [
    { id: "home", key: "hero", nav: "#home" },
    { id: "projects", key: "projects", nav: "#projects" },
    { id: "skills", key: "skills", nav: "#skills" },
    { id: "terminal", key: "terminal", nav: "#terminal" },
    { id: "experience", key: "experience", nav: "#experience" },
    { id: "testimonials", key: "testimonials", nav: null },
    { id: "contact", key: "contact", nav: "#contact" }
  ];

  mapping.forEach(item => {
    const isVisible = sections[item.key] !== false;
    const secEl = document.getElementById(item.id);
    if (secEl) {
      secEl.style.display = isVisible ? "" : "none";
    }

    if (item.nav) {
      const link = document.querySelector(`.nav-link[href="${item.nav}"]`);
      if (link) {
        const li = link.closest("li");
        if (li) li.style.display = isVisible ? "" : "none";
      }
    }
  });

  // Visitor email gate badge & auto popup
  const visitorBtn = document.getElementById("visitor-badge-btn");
  if (visitorBtn) {
    visitorBtn.style.display = sections.visitorGate !== false ? "" : "none";
  }

  // WebGL Fluid Background Canvas
  const fluidCanvas = document.getElementById("particle-canvas");
  if (fluidCanvas) {
    fluidCanvas.style.display = sections.fluidBg !== false ? "" : "none";
  }
}

// Render Project Showcase Cards (Respects Admin Enable/Disable)
function renderProjectsInPortfolio(config) {
  const container = document.getElementById("projects-grid");
  if (!container) return;

  const allProjects = config.projects || [];
  // Filter only enabled projects
  const visibleProjects = allProjects.filter(p => p.enabled !== false);
  container.innerHTML = "";

  if (visibleProjects.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-dim);">
        <i class="fas fa-eye-slash" style="font-size: 2rem; margin-bottom: 12px; display: block; color: var(--color-cyan);"></i>
        Projects are currently hidden. Enable them in the Admin Panel (click &lt;/&gt; 5 times).
      </div>
    `;
    return;
  }

  visibleProjects.forEach((proj) => {
    const card = document.createElement("div");
    card.className = "project-card glass-panel tilt-card";
    card.dataset.id = proj.id;

    const tagsHtml = (proj.tags || []).map(t => `<span class="tech-tag">${t}</span>`).join("");

    card.innerHTML = `
      <div class="project-media">
        <img src="${proj.image}" alt="${proj.title}" loading="lazy" decoding="async" onerror="this.src='assets/project1.jpg'">
        <span class="project-badge-tag">${proj.category || 'Full-Stack'}</span>
      </div>
      <div class="project-body">
        <h3 class="project-title">${proj.title}</h3>
        <p class="project-desc">${proj.description}</p>
        ${proj.stats ? `<div class="project-stats-pill"><i class="fas fa-chart-line"></i> ${proj.stats}</div>` : ''}
        <div class="project-tags">
          ${tagsHtml}
        </div>
        <div class="project-actions">
          <a href="${proj.liveUrl || '#'}" target="_blank" class="btn btn-primary btn-sm">
            <i class="fas fa-external-link-alt"></i> Live Demo
          </a>
          <a href="${proj.codeUrl || '#'}" target="_blank" class="btn btn-secondary btn-sm">
            <i class="fab fa-github"></i> Source Code
          </a>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Render Skills with Animated Progress Fill
function renderSkillsInPortfolio(config) {
  const container = document.getElementById("skills-container");
  if (!container) return;

  const skills = config.skills || [];
  container.innerHTML = "";

  skills.forEach(skill => {
    const card = document.createElement("div");
    card.className = "skill-card glass-panel";
    card.innerHTML = `
      <div class="skill-header">
        <div class="skill-name-wrap">
          <i class="${skill.icon || 'fas fa-code'} skill-icon"></i>
          <span>${skill.name}</span>
        </div>
        <span class="skill-percent">${skill.level}%</span>
      </div>
      <div class="skill-progress-bar">
        <div class="skill-progress-fill" style="width: ${skill.level}%"></div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Render Interactive Split Timeline with Scroll-Traveling Glowing Orb (Matching Reference)
function renderExperiencesInPortfolio(config) {
  const container = document.getElementById("timeline-container");
  if (!container) return;

  const experiences = config.experiences || [];
  container.className = "timeline-showcase-wrap";
  container.innerHTML = "";

  // 1. Center Background Track Line
  const track = document.createElement("div");
  track.className = "timeline-track-line";
  container.appendChild(track);

  // 2. Active Glowing Progress Line
  const progress = document.createElement("div");
  progress.className = "timeline-progress-line";
  progress.id = "timeline-progress-line";
  container.appendChild(progress);

  // 3. Traveling Glowing Orb (Scrolls smoothly with user scroll)
  const orb = document.createElement("div");
  orb.className = "timeline-scroll-orb";
  orb.id = "timeline-scroll-orb";
  container.appendChild(orb);

  // 4. Render Split Rows: [Role & Category] [Big Year] | [Description]
  experiences.forEach((exp, idx) => {
    const row = document.createElement("div");
    row.className = "timeline-split-row";
    row.dataset.index = idx;

    row.innerHTML = `
      <div class="timeline-left-col">
        <div class="timeline-role-info">
          <h3 class="timeline-title">${exp.role}</h3>
          <div class="timeline-category">${exp.company}</div>
        </div>
        <div class="timeline-big-year">${exp.year || '2024'}</div>
      </div>

      <div class="timeline-center-col">
        <div class="timeline-node-dot"></div>
      </div>

      <div class="timeline-right-col">
        <p class="timeline-desc">${exp.description}</p>
      </div>
    `;
    container.appendChild(row);
  });

  // 5. Initialize Scroll Listener to travel orb along line
  setupTimelineScrollTracker();
}

function setupTimelineScrollTracker() {
  const timeline = document.getElementById("timeline-container");
  const orb = document.getElementById("timeline-scroll-orb");
  const progressLine = document.getElementById("timeline-progress-line");
  const track = timeline ? timeline.querySelector(".timeline-track-line") : null;
  if (!timeline || !orb) return;

  function onScroll() {
    const rows = timeline.querySelectorAll(".timeline-split-row");
    if (!rows.length) return;

    const firstRow = rows[0];
    const lastRow = rows[rows.length - 1];
    const firstCenter = firstRow.offsetTop + firstRow.offsetHeight / 2;
    const lastCenter = lastRow.offsetTop + lastRow.offsetHeight / 2;
    const travelDistance = Math.max(1, lastCenter - firstCenter);

    if (track) {
      track.style.top = `${firstCenter}px`;
      track.style.height = `${travelDistance}px`;
    }

    const windowHeight = window.innerHeight;
    const focalPoint = windowHeight * 0.5; // Screen center focal point

    const firstRowRect = firstRow.getBoundingClientRect();
    const lastRowRect = lastRow.getBoundingClientRect();
    const firstMid = firstRowRect.top + firstRowRect.height / 2;
    const lastMid = lastRowRect.top + lastRowRect.height / 2;
    const currentSpan = lastMid - firstMid;

    let progress = 0;
    if (Math.abs(currentSpan) > 10) {
      progress = (focalPoint - firstMid) / currentSpan;
    }
    progress = Math.max(0, Math.min(1, progress));

    const orbY = firstCenter + progress * travelDistance;
    orb.style.top = `${orbY}px`;

    if (progressLine) {
      progressLine.style.top = `${firstCenter}px`;
      progressLine.style.height = `${Math.max(0, orbY - firstCenter)}px`;
    }

    // Active row highlight based on proximity to the orb's current Y position
    rows.forEach(row => {
      const rowMid = row.offsetTop + row.offsetHeight / 2;
      const dist = Math.abs(rowMid - orbY);
      if (dist < row.offsetHeight * 0.48) {
        row.classList.add("active-row");
      } else {
        row.classList.remove("active-row");
      }
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  setTimeout(onScroll, 60);
  setTimeout(onScroll, 300);
}

// Top Scroll Glowing Progress Bar Handler
function setupTopScrollProgressBar() {
  const bar = document.getElementById("top-scroll-progress");
  if (!bar) return;

  function update() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  }

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update, { passive: true });
  update();
}

// Render Testimonials & Public Reviews
async function renderTestimonialsInPortfolio(config) {
  const container = document.getElementById("testimonials-container");
  if (!container) return;

  let reviews = [];

  // 1. Fetch live reviews from persistent API so all visitors see reviews
  try {
    const res = await fetch('/api/reviews');
    if (res.ok) {
      reviews = await res.json();
      if (Array.isArray(reviews) && reviews.length > 0) {
        localStorage.setItem('devsphere_reviews_cache', JSON.stringify(reviews));
      }
    }
  } catch (e) {
    console.log("Loading reviews from cache or defaults...");
  }

  // 2. Fallback to localStorage cache or default config testimonials
  if (!reviews || reviews.length === 0) {
    try {
      const cached = localStorage.getItem('devsphere_reviews_cache');
      if (cached) reviews = JSON.parse(cached);
    } catch (e) {}
  }

  if (!reviews || reviews.length === 0) {
    reviews = config.testimonials || [];
  }

  container.innerHTML = "";

  reviews.forEach((test, idx) => {
    const card = createReviewElement(test, idx);
    container.appendChild(card);
  });
}

// Create compact single-row review item (Name + Stars, click to reveal quote)
function createReviewElement(test, idx) {
  const card = document.createElement("div");
  card.className = "review-compact-card glass-panel";
  
  const ratingStars = '<i class="fas fa-star"></i>'.repeat(test.rating || 5);
  const dateBadge = test.date ? `<span class="review-date-badge">${test.date}</span>` : '';

  card.innerHTML = `
    <div class="review-row-header" onclick="toggleReviewExpand('${idx}')">
      <div class="review-author-info">
        <img src="${test.avatar || 'assets/avatar.jpg'}" alt="${test.author}" class="review-author-img">
        <div>
          <div class="review-author-name">${test.author}</div>
          <div class="review-author-role">${test.title || 'Client'}</div>
        </div>
      </div>

      <div class="review-stars-col">
        <div class="review-stars-stars">${ratingStars}</div>
        ${dateBadge}
      </div>

      <button type="button" class="btn-review-toggle" id="review-toggle-btn-${idx}" aria-expanded="false" onclick="event.stopPropagation(); toggleReviewExpand('${idx}')">
        <span>Show Review</span> <i class="fas fa-chevron-down toggle-icon"></i>
      </button>
    </div>

    <div class="review-expand-body" id="review-body-${idx}">
      <div class="review-expand-inner">
        <p class="review-quote-text">
          <i class="fas fa-quote-left quote-mark"></i> "${test.quote}"
        </p>
      </div>
    </div>
  `;
  return card;
}

window.toggleReviewExpand = function(idx) {
  const body = document.getElementById(`review-body-${idx}`);
  const btn = document.getElementById(`review-toggle-btn-${idx}`);
  const card = body?.closest('.review-compact-card');
  if (!body || !btn) return;

  const isOpen = body.classList.toggle('expanded');
  if (card) card.classList.toggle('is-open', isOpen);
  
  btn.setAttribute('aria-expanded', isOpen);
  btn.innerHTML = isOpen 
    ? `<span>Hide Review</span> <i class="fas fa-chevron-up toggle-icon"></i>` 
    : `<span>Show Review</span> <i class="fas fa-chevron-down toggle-icon"></i>`;

  if (typeof sfx !== 'undefined' && sfx.playClick) sfx.playClick();
};

function openReviewModal() {
  const modal = document.getElementById("review-submission-modal");
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeReviewModal() {
  const modal = document.getElementById("review-submission-modal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

function setupReviewForm() {
  const form = document.getElementById("public-review-form");
  const reviewModal = document.getElementById("review-submission-modal");
  const visitorModal = document.getElementById("visitor-gate-modal");

  // Close modal when clicking outside on the background overlay
  if (reviewModal) {
    reviewModal.addEventListener("click", (e) => {
      if (e.target === reviewModal) {
        closeReviewModal();
      }
    });
  }

  if (visitorModal) {
    visitorModal.addEventListener("click", (e) => {
      if (e.target === visitorModal) {
        closeVisitorModal();
      }
    });
  }

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeReviewModal();
      closeVisitorModal();
    }
  });

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("review-submit-btn");
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Publishing...`;

    const author = document.getElementById("review-author").value.trim();
    const title = document.getElementById("review-title").value.trim();
    const rating = parseInt(document.getElementById("review-rating").value) || 5;
    const quote = document.getElementById("review-quote").value.trim();

    const newReview = {
      id: "rev-" + Date.now(),
      author,
      title,
      rating,
      quote,
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(author)}`,
      date: new Date().toISOString().split('T')[0]
    };

    // 1. Save to backend API so all users can see it
    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      });
    } catch (err) {
      console.warn("Server review save note:", err);
    }

    // 2. Cache in localStorage
    try {
      let cached = [];
      const raw = localStorage.getItem('devsphere_reviews_cache');
      if (raw) cached = JSON.parse(raw);
      cached.unshift(newReview);
      localStorage.setItem('devsphere_reviews_cache', JSON.stringify(cached));
    } catch (err) {}

    // 3. Prepend into DOM immediately
    const container = document.getElementById("testimonials-container");
    if (container) {
      const card = createReviewElement({ ...newReview, date: "Just now" }, Date.now());
      container.prepend(card);
    }

    showToast("⭐ Review published! Thank you for your feedback.");
    form.reset();
    btn.disabled = false;
    btn.innerHTML = originalText;
    closeReviewModal();
  });
}

// 3D Tilt Card Interaction
function init3DTilt() {
  const cards = document.querySelectorAll(".avatar-hologram-card, .tilt-card");

  cards.forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
  });
}

// Interactive Subhan-OS Terminal
function initTerminal() {
  const input = document.getElementById("terminal-cmd-input");
  const body = document.getElementById("terminal-output-body");
  if (!input || !body) return;

  function printLine(text, className = "terminal-line") {
    const line = document.createElement("div");
    line.className = className;
    line.innerHTML = text;
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
  }

  function handleCommand(cmdRaw) {
    const cmd = cmdRaw.trim().toLowerCase();
    printLine(`<span class="terminal-prompt">visitor@subhan-os:~$</span> <span class="terminal-cmd-highlight">${cmdRaw}</span>`);
    sfx.playBeep(580, 'sine', 0.04);

    const config = getActiveConfig();

    switch (cmd) {
      case "help":
        printLine(`
Available commands:
  <span style="color:var(--primary-color);">skills</span>      - Print technical mastery and stack architecture
  <span style="color:var(--primary-color);">projects</span>    - List highlighted full-stack production deployments
  <span style="color:var(--primary-color);">whoami</span>      - Display current visitor status
  <span style="color:var(--primary-color);">contact</span>     - Direct transmission link to EM.Subhan ali
  <span style="color:var(--primary-color);">guestbook</span>   - Leave your email to connect with EM.Subhan ali
  <span style="color:var(--primary-color);">hire</span>        - Open priority consultation & contract form
  <span style="color:var(--primary-color);">uptime</span>      - Display cluster telemetry & system health
  <span style="color:var(--primary-color);">matrix</span>      - Simulate visual cyber matrix stream
  <span style="color:var(--primary-color);">clear</span>       - Wipe terminal buffer
        `);
        break;

      case "whoami":
        const current = VisitorState.visitorEmail 
          ? `<span style="color:#4ade80;">Registered Guest: ${VisitorState.visitorEmail}</span>` 
          : `Guest Visitor (Type 'guestbook' to leave your email)`;
        printLine(`User: ${current}`);
        break;

      case "skills":
        printLine(`Core Architecture Stack:
  • <span style="color:#61dafb;">Frontend:</span> React 19, Next.js 15, TypeScript, WebGL/Three.js, Tailwind
  • <span style="color:#68a063;">Backend:</span> Node.js, Python (FastAPI/Django), Golang, Rust, GraphQL
  • <span style="color:#384d54;">Databases:</span> PostgreSQL, Redis, MongoDB, Vector DBs (Chroma/Pinecone)
  • <span style="color:#f59e0b;">Cloud/DevOps:</span> Kubernetes, Docker, AWS, Terraform, CI/CD Actions
  • <span style="color:#ec4899;">AI & Models:</span> Fine-tuned LLMs, LangChain, RAG Pipelines, Autonomous Agents`);
        break;

      case "projects":
        printLine(`Featured Deployments:`);
        (config.projects || []).forEach(p => {
          printLine(`  🚀 <strong>${p.title}</strong> (${p.category}) — <a href="${p.liveUrl}" target="_blank" style="color:var(--primary-color); text-decoration:underline;">Live Demo</a>`);
        });
        break;

      case "contact":
        printLine(`Direct Channels:
  • Email: <a href="mailto:${config.adminEmail}" style="color:var(--primary-color);">${config.adminEmail}</a>
  • Location: Remote / Worldwide
  • WhatsApp: <a href="${config.socials?.whatsapp || '#'}" style="color:#4ade80;">Direct Chat</a>`);
        break;

      case "guestbook":
      case "connect":
        printLine(`Opening visitor guestbook modal...`);
        openVisitorModal();
        break;

      case "hire":
        printLine(`🚀 Scrolling to direct inquiry transmission...`);
        const contactSec = document.getElementById("contact");
        if (contactSec) contactSec.scrollIntoView({ behavior: 'smooth' });
        break;

      case "uptime":
        printLine(`SYSTEM TELEMETRY:
  • Node ID: cluster-devsphere-01-prod
  • Uptime: 99.98% SLA
  • Latency: 12ms (Edge Cache Active)
  • Status: 🟢 100% HEALTHY`);
        break;

      case "matrix":
        printLine(`<span style="color:#4ade80;">Initializing fluid neural cascade...</span>`);
        for (let i = 0; i < 4; i++) {
          setTimeout(() => {
            const hex = Array.from({length: 42}, () => Math.random().toString(36)[2] || '0').join('');
            printLine(`<span style="color:#4ade80; font-size:0.75rem;">${hex}</span>`);
          }, (i + 1) * 150);
        }
        break;

      case "clear":
        body.innerHTML = "";
        break;

      default:
        printLine(`Command not recognized: '<span style="color:#fb7185;">${cmdRaw}</span>'. Type '<span style="color:var(--primary-color);">help</span>' for manual.`);
    }
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const val = input.value;
      if (val.trim()) {
        handleCommand(val);
        input.value = "";
      }
    }
  });

  // Quick Command Badges
  const badges = document.querySelectorAll(".cmd-badge");
  badges.forEach(b => {
    b.addEventListener("click", () => {
      const cmd = b.dataset.cmd;
      if (cmd) {
        handleCommand(cmd);
      }
    });
  });
}

// Render Dynamic Direct Channels (YouTube, TikTok, Socials)
function renderDirectChannels(config) {
  const container = document.getElementById("dyn-direct-channels-list");
  if (!container) return;

  const channels = config?.channels || [];
  if (!channels.length) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = channels.filter(ch => ch.enabled !== false).map(ch => {
    const iconClass = ch.icon || "fas fa-link";
    const color = ch.color || "#38bdf8";
    return `
      <a href="${ch.url}" target="_blank" rel="noopener noreferrer" class="contact-direct-link" title="${ch.title}">
        <div class="contact-icon-box" style="background: ${color}22; color: ${color};">
          <i class="${iconClass}"></i>
        </div>
        <div>
          <div style="font-size:0.8rem; color:var(--text-dim);">${ch.subtitle || "Official Channel"}</div>
          <strong style="color:#fff; display:flex; align-items:center; gap:6px;">
            ${ch.title} <i class="fas fa-arrow-right" style="font-size:0.75rem; color:${color};"></i>
          </strong>
        </div>
      </a>
    `;
  }).join("");
}

// Contact Form Handler with Silent Background WhatsApp & Email Transmission
function setupContactForm() {
  const form = document.getElementById("contact-inquiry-form");
  if (!form) return;

  const phoneInput = document.getElementById("contact-phone");
  const phoneErr = document.getElementById("contact-phone-error");

  // Real-time strictly 11 digits numerical filter
  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      phoneInput.value = phoneInput.value.replace(/[^0-9]/g, "").slice(0, 11);
      if (phoneErr) {
        if (phoneInput.value.length > 0 && phoneInput.value.length !== 11) {
          phoneErr.style.display = "block";
          phoneInput.style.borderColor = "#ef4444";
        } else {
          phoneErr.style.display = "none";
          phoneInput.style.borderColor = "";
        }
      }
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("contact-name").value.trim();
    const cleanPhone = phoneInput ? phoneInput.value.replace(/[^0-9]/g, "") : "";
    const projectType = document.getElementById("contact-type").value;
    const message = document.getElementById("contact-message").value.trim();

    // Strict 11-digit phone check
    if (!name || !cleanPhone || cleanPhone.length !== 11) {
      if (phoneErr) phoneErr.style.display = "block";
      if (phoneInput) {
        phoneInput.style.borderColor = "#ef4444";
        phoneInput.focus();
      }
      return;
    }

    if (phoneErr) phoneErr.style.display = "none";
    if (phoneInput) phoneInput.style.borderColor = "";

    const btn = document.getElementById("contact-submit-btn") || form.querySelector("button[type='submit']");
    const origHtml = btn.innerHTML;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Transmitting...`;
    btn.disabled = true;

    const config = getActiveConfig();
    const adminWhatsApp = config.socials?.whatsappNumber || "03446266246";
    const cleanAdminNum = adminWhatsApp.replace(/[^0-9]/g, "");
    const formattedAdminNum = cleanAdminNum.startsWith("0") ? ("92" + cleanAdminNum.substring(1)) : (cleanAdminNum.startsWith("92") ? cleanAdminNum : ("92" + cleanAdminNum));

    const timestamp = new Date().toLocaleString();

    // 1. Save persistently to GitHub Cloud & LocalStorage
    const inquiryObj = {
      id: "inq_" + Date.now(),
      name,
      phone: cleanPhone,
      projectType,
      message,
      targetAdminWhatsApp: formattedAdminNum,
      timestamp: new Date().toISOString(),
      formattedTime: timestamp
    };
    if (typeof saveInquiryToCloud === "function") {
      saveInquiryToCloud(inquiryObj);
    }

    // Also send to local SQLite backend if running Node server
    fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inquiryObj)
    }).catch(() => {});

    // 2. Dispatch structured inquiry email to Subhan's verified email
    // Email par is tarha aayega: Name, Phone (11 digits), Jis Kaam Ke Liye Apply Kiya, aur Bio
    const emailVal = config.socials?.email || config.adminEmail || "mirzasubhanali449@gmail.com";
    fetch(`https://formsubmit.co/ajax/${encodeURIComponent(emailVal)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        _subject: `💼 New Inquiry: ${name} (${cleanPhone}) - ${projectType}`,
        _template: "table",
        "Client Name": name,
        "Phone Number": cleanPhone,
        "Applied For Service / Work": projectType,
        "Client Bio & Project Details": message,
        "Date & Time": timestamp
      })
    }).catch(() => {});

    // 3. Silent WhatsApp Notification Gateway ping
    const waText = encodeURIComponent(`💼 *New Client Inquiry!*\n\n👤 *Name:* ${name}\n📞 *Phone:* ${cleanPhone}\n🎯 *Applied For:* ${projectType}\n📝 *Bio:* ${message}\n⏰ *Time:* ${timestamp}`);
    fetch(`https://api.callmebot.com/whatsapp.php?phone=${formattedAdminNum}&text=${waText}&apikey=free`, { mode: 'no-cors' }).catch(() => {});

    // 4. Clean professional UI completion for visitor (NO alert, NO popup, NO whatsapp reveal)
    setTimeout(() => {
      btn.innerHTML = `<i class="fas fa-check-circle" style="color:var(--color-mint);"></i> Inquiry Transmitted Successfully!`;
      form.reset();
      setTimeout(() => {
        btn.innerHTML = origHtml;
        btn.disabled = false;
      }, 3500);
    }, 800);
  });
}

// Navigation 3-Dot Horizontal Menu in Header Banner & Scrollspy
window.toggleHorizontalNav = function(e) {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }
  const navContainer = document.getElementById("nav-horizontal-links");
  const dotsBtn = document.getElementById("nav-dots-btn");
  const dotsIcon = document.getElementById("nav-dots-icon");
  if (!navContainer) return;

  const isOpen = navContainer.classList.toggle("open");
  if (dotsBtn) {
    dotsBtn.classList.toggle("active", isOpen);
  }
  if (dotsIcon) {
    dotsIcon.className = isOpen ? "fas fa-times" : "fas fa-ellipsis-v";
  }
};
window.toggleNavMenu = window.toggleHorizontalNav;

function setupNavigation() {
  const navLinks = document.querySelectorAll(".nav-link");

  let isClickScrolling = false;
  let clickScrollTimeout = null;

  // Click on any nav button: move blue line immediately and scroll to section
  // Buttons are NEVER removed/hidden on click - ONLY the (X) button closes them
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      const targetSection = document.querySelector(href);
      if (targetSection) {
        e.preventDefault();

        // 1. Instantly move blue line under the clicked button
        navLinks.forEach(l => l.classList.remove("active"));
        link.classList.add("active");

        // 2. Lock scrollspy so it doesn't overwrite while scrolling
        isClickScrolling = true;
        clearTimeout(clickScrollTimeout);

        // 3. Smooth scroll directly to section with header offset
        const navbar = document.getElementById("site-navbar");
        const navOffset = (navbar ? navbar.offsetHeight : 70) + 20;
        const targetPos = targetSection.getBoundingClientRect().top + window.pageYOffset - navOffset;

        window.scrollTo({
          top: Math.max(0, targetPos),
          behavior: "smooth"
        });

        // 4. Release lock after smooth scroll completes
        clickScrollTimeout = setTimeout(() => {
          isClickScrolling = false;
        }, 900);
      }
    });
  });

  // Active state highlighting on scroll
  const sections = document.querySelectorAll("section[id]");
  window.addEventListener("scroll", () => {
    if (isClickScrolling) return; // Don't override while user clicked a button

    const scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 140;
      const sectionId = current.getAttribute("id");

      const link = document.querySelector(`.nav-link[href*="${sectionId}"]`);
      if (link) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          navLinks.forEach(l => l.classList.remove("active"));
          link.classList.add("active");
        }
      }
    });
  });
}
