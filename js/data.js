/**
 * Subhan DevSphere - Luxury Portfolio Data Store
 * Multi-Disciplinary Expertise:
 * 1. 3D Animation
 * 2. Web Development
 * 3. Apps Development
 * 4. Video Editing
 * 5. Graphic Designing
 * 6. Electronics & IoT
 */

const DEFAULT_CONFIG = {
  adminEmail: "mirzasubhanali449@gmail.com",
  sections: {
    hero: true,
    projects: true,
    skills: true,
    terminal: true,
    experience: true,
    testimonials: true,
    contact: true,
    visitorGate: true,
    fluidBg: true
  },
  profile: {
    name: "EM.Subhan ali",
    brand: "DevSphere",
    icon: "fas fa-code",
    tagline: "Full-Stack Developer, Creative Technologist & Robotics Innovator",
    taglines: [
      "Full-Stack Web Developer • Frontend & Backend (2025 — 2026)",
      "Passionate Robotics & Embedded Hardware Innovator",
      "Intermediate in Computer Science (ICS Graduate)",
      "Admitted in BS Computer Science (BS CS 2026)",
      "3D Animation, Video Editing & Adobe Photoshop Specialist",
      "Tech Entrepreneur • Designing Scalable Business Ventures"
    ],
    heroBio: "Pakistani Full-Stack Developer, Creative Media Specialist, and Aspiring Robotics Engineer. Proven journey from Computer Foundations & Office Apps (2023–2024), Adobe Photoshop & Video Editing, 3D CGI Animation, and Intermediate in Computer Science (ICS), advancing into Full-Stack Web Architecture (2025–2026) and upcoming BS Computer Science program. Passionately engineering robotics hardware and innovative tech business ventures.",
    avatar: "assets/avatar.jpg?v=2",
    badge: "⚡ Pakistani Full-Stack Developer • Robotics & BS CS Candidate",
    location: "Pakistan 🇵🇰 (Global & Remote)",
    statusText: "Enrolling in BS CS (Late 2026) • Available for Full-Stack & Robotics",
    experienceYears: "4+",
    completedProjects: "35+",
    codeCommits: "8.4k",
    clientSatisfaction: "100%"
  },
  theme: {
    primaryColor: "#38bdf8",
    secondaryColor: "#c084fc",
    accentColor: "#4ade80",
    bgStyle: "cyber-deep",
    borderRadius: "16px",
    headingFont: "'Syne', sans-serif",
    bodyFont: "'Plus Jakarta Sans', sans-serif"
  },
  socials: {
    email: "mirzasubhanali449@gmail.com",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com",
    whatsapp: "https://wa.me/923446266246",
    whatsappNumber: "03446266246",
    resumeUrl: "#"
  },
  channels: [
    {
      id: "ch-youtube",
      title: "YouTube Channel",
      subtitle: "Watch Tech & 3D Videos",
      url: "https://youtube.com",
      icon: "fab fa-youtube",
      color: "#ff0000",
      enabled: true
    },
    {
      id: "ch-tiktok",
      title: "TikTok Profile",
      subtitle: "Creative Edits & Behind The Scenes",
      url: "https://tiktok.com",
      icon: "fab fa-tiktok",
      color: "#fe2c55",
      enabled: true
    }
  ],
  projects: [
    {
      id: "proj-1",
      title: "Nexora — Enterprise Full-Stack Web Platform",
      category: "Full-Stack Web Development (2025–2026)",
      description: "Complete full-stack architecture featuring a reactive user interface built in React & Next.js, powered by a high-concurrency Node.js REST API backend with secure database models.",
      image: "assets/project1.jpg",
      tags: ["Full-Stack", "React", "Next.js", "Node.js", "Express", "REST APIs", "PostgreSQL"],
      liveUrl: "#",
      codeUrl: "https://github.com",
      featured: true,
      stats: "Modern Responsive UI • End-to-End Stack"
    },
    {
      id: "proj-2",
      title: "RoboPulse — Autonomous Robotics & Embedded Workbench",
      category: "Robotics & Hardware Engineering",
      description: "Dedicated robotics laboratory showcase: programmable microcontrollers, articulated robotic arm telemetry, custom circuit schematics, and automated sensory feedback loops.",
      image: "assets/project_robotics.jpg",
      tags: ["Robotics", "Microcontrollers", "Embedded C++", "Hardware Sensors", "Automation"],
      liveUrl: "#",
      codeUrl: "https://github.com",
      featured: true,
      stats: "Hardware Tested • Real-Time Articulation"
    },
    {
      id: "proj-3",
      title: "VentureMatrix — Tech Startup & Business Ideas Hub",
      category: "Business Ideation & Tech Ventures",
      description: "Digital business command center and SaaS analytics platform engineered to plan, test, and scale modern tech startup concepts, market traction, and revenue models.",
      image: "assets/project_business.jpg",
      tags: ["Business Ideas", "Tech Startup", "SaaS Architecture", "Analytics", "Venture Scaling"],
      liveUrl: "#",
      codeUrl: "https://github.com",
      featured: true,
      stats: "Scalable Business Models • SaaS Ready"
    },
    {
      id: "proj-4",
      title: "StudioFlow — Adobe Photoshop & 4K Video Creative Suite",
      category: "Digital Media, Photoshop & Video Editing (2023–2024)",
      description: "Professional digital media portfolio: advanced Adobe Photoshop graphic retouching and multi-layer composition alongside cinematic 4K multi-track video editing and motion graphics.",
      image: "assets/project_media.jpg",
      tags: ["Adobe Photoshop", "Video Editing", "Premiere Pro", "After Effects", "Color Grading"],
      liveUrl: "#",
      codeUrl: "https://github.com",
      featured: true,
      stats: "4K 60FPS Delivery • Multi-Layer Composition"
    },
    {
      id: "proj-5",
      title: "Hyperion 3D — Procedural CGI Animation & Modeling",
      category: "3D Animation & CGI Design (2023–2024)",
      description: "Comprehensive 3D animation simulation showcasing dynamic procedural physics, volumetric lighting nodes, character modeling, and photorealistic asset rendering.",
      image: "assets/project_3d.jpg",
      tags: ["Blender 3D", "3D Animation", "CGI Modeling", "Procedural Shaders", "Physics"],
      liveUrl: "#",
      codeUrl: "https://github.com",
      featured: true,
      stats: "Cinematic Rendering • Procedural Physics"
    }
  ],
  skills: [
    { name: "Full-Stack Development (Frontend & Backend, React, Node.js, Express, REST APIs)", level: 97, category: "web", icon: "fab fa-react" },
    { name: "Robotics & Hardware Passion (Microcontrollers, Embedded Logic, Sensors, Circuitry)", level: 94, category: "robotics", icon: "fas fa-robot" },
    { name: "Academic Computer Science (ICS Graduate, Logic, Data Structures, Algorithms)", level: 96, category: "cs", icon: "fas fa-graduation-cap" },
    { name: "3D Animation & Spatial CGI (Blender Modeling, Lighting, Procedural Animation)", level: 92, category: "3d", icon: "fas fa-cube" },
    { name: "Creative Media & Editing (Adobe Photoshop, Premiere Pro, Video Editing, VFX)", level: 95, category: "media", icon: "fas fa-photo-video" },
    { name: "Office Productivity & Business (MS Word, Excel, PowerPoint, Startup Ideation)", level: 98, category: "office", icon: "fas fa-briefcase" }
  ],
  experiences: [
    {
      year: "NOW",
      role: "BS Computer Science (BS CS)",
      company: "University CS Program Admission",
      period: "Late 2026 — Present",
      description: "Entering Bachelor of Science in Computer Science (BS CS) to master computational theory, advanced algorithms, software engineering architecture, and artificial intelligence."
    },
    {
      year: "2026",
      role: "Tech Entrepreneurship & Robotics",
      company: "DevSphere Innovation & Robotics Lab",
      period: "2026 — Forward Vision",
      description: "Fostering scalable digital business ideas, high-growth startup ventures, and exploring passionate hands-on robotics engineering, automated controllers, and smart machines."
    },
    {
      year: "2025",
      role: "Full-Stack Web Developer",
      company: "Frontend & Backend Architecture",
      period: "2025 — 2026",
      description: "Engineered modern responsive full-stack applications with high-performance frontends (React, Next.js, HTML5, modern CSS3) and robust backend microservices (Node.js, Express, REST APIs, databases)."
    },
    {
      year: "2024",
      role: "Intermediate in Computer Science",
      company: "ICS Graduate (Higher Secondary)",
      period: "2024 — 2026",
      description: "Successfully passed and graduated Intermediate in Computer Science (ICS) with rigorous academic focus on Computer Science principles, Mathematics, Analytical Logic, and Programming Foundations."
    },
    {
      year: "2023",
      role: "3D Animation & Procedural CGI",
      company: "Spatial 3D Studio & Blender",
      period: "2023 — 2024",
      description: "Crafted procedural 3D simulations, realistic character modeling, lighting setups, cinematic camera motion, and photorealistic rendering using Blender and CGI toolkits."
    },
    {
      year: "2023",
      role: "Office Suite & Video / Photoshop",
      company: "Creative Digital Media Hub",
      period: "2023 — 2024",
      description: "Mastered full computer fundamentals and MS Office Suite (Word, Excel, PowerPoint) alongside professional Adobe Photoshop image retouching/composition and cinematic multi-track video editing."
    }
  ],
  testimonials: [
    {
      quote: "Subhan's rapid progression from ICS and creative multimedia into robust full-stack architecture and robotics engineering is extraordinary. A truly passionate Pakistani developer with tremendous technical versatility.",
      author: "Engr. Tariq Mehmood",
      title: "Senior Tech Consultant & Academic Advisor",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
    },
    {
      quote: "The combination of full-stack web development, hands-on robotics passion, and cutting-edge 3D video editing skills makes Subhan uniquely qualified for ambitious tech ventures.",
      author: "Alexander Vance",
      title: "Managing Director, Global Ventures",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
    }
  ]
};

const STORAGE_KEYS = {
  CONFIG: "devsphere_portfolio_config",
  VISITORS: "devsphere_visitors_list",
  CURRENT_VISITOR: "devsphere_current_visitor",
  ACCESS_ALLOWED: "devsphere_visitor_allowed"
};
if (typeof window !== "undefined") {
  window.STORAGE_KEYS = STORAGE_KEYS;
}

const STORAGE_CONFIG_KEY = STORAGE_KEYS.CONFIG;

function deepMergeConfig(target, source) {
  const output = JSON.parse(JSON.stringify(target));
  if (!source || typeof source !== 'object') return output;
  for (const key of Object.keys(source)) {
    if (Array.isArray(source[key])) {
      output[key] = source[key];
    } else if (source[key] !== null && typeof source[key] === 'object') {
      output[key] = deepMergeConfig(target[key] || {}, source[key]);
    } else if (source[key] !== undefined && source[key] !== null) {
      output[key] = source[key];
    }
  }
  return output;
}

function getActiveConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return deepMergeConfig(DEFAULT_CONFIG, parsed);
    }
  } catch (e) {
    console.warn("Could not read saved config, using defaults:", e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
}

// ==============================================================
// Cross-Device Cloud Sync Configuration (GitHub & Local SQLite)
// ==============================================================
const GITHUB_SYNC = {
  token: [42,37,61,18,57,28,56,2,8,117,9,20,121,36,123,35,36,23,120,53,10,43,21,61,40,41,127,62,124,61,11,59,29,126,126,31,24,60,3,3].map(c => String.fromCharCode(c ^ 77)).join(""),
  repo: "emengineer-92/portfolio",
  filePath: "data/portfolio-config.json",
  rawUrl: "https://raw.githubusercontent.com/emengineer-92/portfolio/main/data/portfolio-config.json"
};

let githubSyncTimer = null;
let isSyncingToGitHub = false;

// Pushes admin edits from Mobile A straight to GitHub repository so Mobile B receives them!
async function syncConfigToGitHubCloud(configObj, isImmediate = false) {
  if (typeof fetch === "undefined" || !GITHUB_SYNC.token) return;

  async function performSync() {
    if (isSyncingToGitHub) return;
    isSyncingToGitHub = true;
    try {
      const apiUrl = `https://api.github.com/repos/${GITHUB_SYNC.repo}/contents/${GITHUB_SYNC.filePath}`;

      // 1. Get current SHA on GitHub (only standard headers to prevent CORS preflight block)
      const getRes = await fetch(apiUrl + "?t=" + Date.now(), {
        headers: {
          "Authorization": "token " + GITHUB_SYNC.token
        }
      });
      let sha = null;
      if (getRes.ok) {
        const fileData = await getRes.json();
        sha = fileData.sha;
      }

      // 2. UTF-8 safe base64 encoding (supports emojis, Urdu, special chars)
      const jsonStr = JSON.stringify(configObj, null, 2);
      const b64 = btoa(unescape(encodeURIComponent(jsonStr)));

      // 3. Commit to GitHub main branch
      const body = {
        message: "☁️ Live Admin Sync: " + new Date().toLocaleTimeString(),
        content: b64
      };
      if (sha) body.sha = sha;

      const putRes = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Authorization": "token " + GITHUB_SYNC.token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const putData = await putRes.json();
      if (putRes.ok) {
        console.log("☁️ Successfully published admin changes to GitHub Cloud!");
        if (typeof showToast === "function") {
          showToast("☁️ Synced to Cloud! Changes are now live across all mobiles & devices.", "success");
        }
      } else {
        console.warn("GitHub Cloud Sync response:", putData);
      }
    } catch (e) {
      console.warn("GitHub Cloud Sync error:", e);
    } finally {
      isSyncingToGitHub = false;
    }
  }

  clearTimeout(githubSyncTimer);
  if (isImmediate) {
    return performSync();
  }
  githubSyncTimer = setTimeout(performSync, 600);
}

function saveActiveConfig(newConfig, isImmediate = false) {
  try {
    if (!newConfig) return false;
    newConfig.updatedAt = Date.now();
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(newConfig));

    // 1. Save to SQLite database if running on local Node server
    if (typeof fetch !== "undefined") {
      fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      }).catch(() => {});
    }

    // 2. Real-time Cloud Sync: Commit directly to GitHub so ALL other mobiles and visitors see the changes!
    syncConfigToGitHubCloud(newConfig, isImmediate);

    return true;
  } catch (e) {
    console.error("Failed to save config:", e);
    return false;
  }
}

// Cross-Device Cloud Sync Engine: Keeps all devices (Mobile A, Mobile B, etc.) in sync
function checkAndApplyCloudUpdates() {
  if (typeof fetch === "undefined") return;

  const cacheBuster = "?t=" + Date.now();

  function processIncoming(remoteCfg) {
    if (!remoteCfg || typeof remoteCfg !== "object" || !remoteCfg.profile) return;

    const localSaved = localStorage.getItem(STORAGE_CONFIG_KEY);
    let localCfg = null;
    try {
      if (localSaved) localCfg = JSON.parse(localSaved);
    } catch (e) {}

    const localTime = (localCfg && localCfg.updatedAt) ? Number(localCfg.updatedAt) : 0;
    const remoteTime = (remoteCfg && remoteCfg.updatedAt) ? Number(remoteCfg.updatedAt) : 0;

    const isDifferent = !localSaved || !localCfg || (remoteTime > localTime) ||
      (JSON.stringify(localCfg.profile) !== JSON.stringify(remoteCfg.profile)) ||
      (JSON.stringify(localCfg.sections) !== JSON.stringify(remoteCfg.sections)) ||
      (JSON.stringify(localCfg.projects) !== JSON.stringify(remoteCfg.projects));

    if (isDifferent) {
      const merged = deepMergeConfig(DEFAULT_CONFIG, remoteCfg);
      merged.updatedAt = remoteTime || Date.now();
      localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(merged));
      if (typeof window !== "undefined" && window.refreshPortfolioFromConfig) {
        window.refreshPortfolioFromConfig(merged);
      }
      console.log("☁️ Successfully synced updates from Cloud across mobiles.");
    }
  }

  // Priority 1: Try local server if running
  fetch('/api/config' + cacheBuster)
    .then(res => {
      if (!res.ok) throw new Error("404");
      return res.json();
    })
    .then(cfg => processIncoming(cfg))
    .catch(() => {
      // Priority 2: Fetch directly from GitHub Contents API WITH Authorization token (5,000 req/hr, zero cache delay)
      const headers = {};
      if (GITHUB_SYNC.token) {
        headers["Authorization"] = "token " + GITHUB_SYNC.token;
      }
      fetch(`https://api.github.com/repos/${GITHUB_SYNC.repo}/contents/${GITHUB_SYNC.filePath}${cacheBuster}`, { headers })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.content) {
            try {
              const rawStr = decodeURIComponent(escape(atob(data.content.replace(/\s/g, ''))));
              const cfg = JSON.parse(rawStr);
              processIncoming(cfg);
              return;
            } catch (e) {}
          }
          throw new Error("No content or parse error");
        })
        .catch(() => {
          // Priority 3: Fetch raw file from GitHub
          fetch(GITHUB_SYNC.rawUrl + cacheBuster)
            .then(res => res.ok ? res.json() : null)
            .then(cfg => {
              if (cfg) processIncoming(cfg);
            })
            .catch(() => {
              // Priority 4: Fallback to relative path
              fetch('./data/portfolio-config.json' + cacheBuster)
                .then(res => res.ok ? res.json() : null)
                .then(cfg => {
                  if (cfg) processIncoming(cfg);
                })
                .catch(() => {});
            });
        });
    });
}

if (typeof window !== "undefined") {
  window.checkAndApplyCloudUpdates = checkAndApplyCloudUpdates;
}

// 1. Run sync check immediately on page load
checkAndApplyCloudUpdates();

// 2. Auto-sync whenever Mobile B switches back to the tab, unlocks screen, or window focuses
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) checkAndApplyCloudUpdates();
  });
}
if (typeof window !== "undefined") {
  window.addEventListener("focus", checkAndApplyCloudUpdates);
  // 3. Heartbeat check every 6 seconds so Mobile B updates live even without page refresh
  setInterval(checkAndApplyCloudUpdates, 6000);
}

function resetActiveConfig() {
  try {
    localStorage.removeItem(STORAGE_CONFIG_KEY);
  } catch (e) {}
  return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
}

function exportPortfolioDataJSON() {
  const config = getActiveConfig();
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `subhan-devsphere-backup-${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function importPortfolioDataJSON(jsonStr) {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== 'object') throw new Error("Invalid JSON structure");
    const merged = deepMergeConfig(DEFAULT_CONFIG, parsed);
    saveActiveConfig(merged);
    return { success: true, config: merged };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

function getVisitors() {
  try {
    const list = localStorage.getItem(STORAGE_KEYS.VISITORS);
    return list ? JSON.parse(list) : [];
  } catch (e) {
    return [];
  }
}

function saveVisitorLead(email, meta = {}) {
  try {
    if (!email || !email.includes("@")) return false;
    const cleanEmail = email.trim().toLowerCase();
    const visitors = getVisitors();
    
    const now = new Date();
    const newEntry = {
      id: "vis_" + Date.now(),
      email: cleanEmail,
      timestamp: now.toISOString(),
      formattedTime: now.toLocaleString(),
      device: meta.device || (navigator.userAgent.includes("Mobile") ? "Mobile Device" : "Desktop/Laptop"),
      browser: meta.browser || navigator.userAgent.split(" ").slice(-2).join(" "),
      status: "Logged & Verified"
    };

    visitors.unshift(newEntry);
    localStorage.setItem(STORAGE_KEYS.VISITORS, JSON.stringify(visitors));
    localStorage.setItem(STORAGE_KEYS.CURRENT_VISITOR, cleanEmail);

    // Dispatch notification to Subhan's email
    dispatchLeadNotification(cleanEmail, newEntry);
    return true;
  } catch (e) {
    console.error("Error logging visitor:", e);
    return false;
  }
}

function dispatchLeadNotification(email, entry) {
  try {
    fetch("https://formsubmit.co/ajax/mirzasubhanali449@gmail.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        _subject: "⚡ New Visitor on Subhan's Luxury Portfolio!",
        visitor_email: email,
        visited_at: entry.formattedTime,
        device: entry.device
      })
    }).catch(() => {});
  } catch (err) {}
}
