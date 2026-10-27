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

function saveActiveConfig(newConfig) {
  try {
    if (!newConfig) return false;
    newConfig.updatedAt = Date.now();
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(newConfig));

    // Save to SQLite database via /api/config so changes persist across all devices & browsers
    if (typeof fetch !== "undefined") {
      fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      }).catch(err => {
        console.warn("Could not sync to server disk, saved in browser localStorage:", err);
      });
    }
    return true;
  } catch (e) {
    console.error("Failed to save config:", e);
    return false;
  }
}

// Automatically sync configuration from server SQLite database or static config on page load
(function autoSyncConfig() {
  if (typeof fetch === "undefined") return;

  const localSaved = localStorage.getItem(STORAGE_CONFIG_KEY);
  let localConfig = null;
  try {
    if (localSaved) localConfig = JSON.parse(localSaved);
  } catch (e) {}

  // CRITICAL RULE: If the user/admin has already customized their portfolio in this browser,
  // NEVER overwrite their localStorage! Their changes must remain permanent across refreshes.
  if (localConfig && localConfig.profile) {
    // If running on a local server, push localConfig to SQLite so disk database stays in sync
    fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(localConfig)
    }).catch(() => {});
    return;
  }

  // Only if this is a fresh browser with NO local customization yet, hydrate from server or static JSON
  fetch('/api/config')
    .then(res => {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(serverConfig => {
      if (serverConfig && serverConfig.profile) {
        const merged = deepMergeConfig(DEFAULT_CONFIG, serverConfig);
        localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(merged));
        if (window.refreshPortfolioFromConfig) window.refreshPortfolioFromConfig(merged);
      }
    })
    .catch(() => {
      // Fallback for static hosting like GitHub Pages on first visit
      fetch('./data/portfolio-config.json')
        .then(res => res.ok ? res.json() : null)
        .then(staticConfig => {
          if (staticConfig && staticConfig.profile) {
            const merged = deepMergeConfig(DEFAULT_CONFIG, staticConfig);
            localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(merged));
            if (window.refreshPortfolioFromConfig) window.refreshPortfolioFromConfig(merged);
          }
        })
        .catch(() => {});
    });
})();

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
