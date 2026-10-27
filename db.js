/**
 * DevSphere Portfolio - Database Engine
 * Powered by Node.js native SQLite (node:sqlite DatabaseSync)
 * Provides high-performance, ACID-compliant persistence for:
 * - Client Inquiries & Lead capture
 * - Client Reviews & Testimonials
 * - Site & Profile Configuration
 * - Visitor Analytics & Traffic Logs
 */

const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'portfolio.db');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let db = null;
let isNativeSqlite = false;

try {
  const { DatabaseSync } = require('node:sqlite');
  db = new DatabaseSync(DB_FILE);
  isNativeSqlite = true;

  // Optimize SQLite with Write-Ahead Logging & foreign keys
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
  `);
  console.log(`[Database] SQLite engine initialized successfully: ${DB_FILE}`);
} catch (err) {
  console.warn('[Database] Native SQLite initialization fallback:', err.message);
}

/**
 * Initialize Tables
 */
function initSchema() {
  if (!isNativeSqlite || !db) return;

  // Inquiries / Leads table
  db.exec(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      project_type TEXT,
      budget TEXT,
      message TEXT,
      status TEXT DEFAULT 'new',
      created_at TEXT NOT NULL,
      formatted_time TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries (created_at DESC);
  `);

  // Reviews / Testimonials table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      author TEXT NOT NULL,
      title TEXT,
      quote TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      avatar TEXT,
      date TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews (created_at DESC);
  `);

  // Site Configuration table
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Visitor traffic logs
  db.exec(`
    CREATE TABLE IF NOT EXISTS visitor_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip TEXT,
      path TEXT,
      user_agent TEXT,
      visited_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_logs_visited ON visitor_logs (visited_at DESC);
  `);

  migrateLegacyJson();
}

/**
 * Migrate legacy JSON files into SQLite database seamlessly
 */
function migrateLegacyJson() {
  if (!isNativeSqlite || !db) return;

  try {
    // 1. Migrate Reviews
    const reviewsCountStmt = db.prepare('SELECT COUNT(*) as count FROM reviews');
    const { count: reviewCount } = reviewsCountStmt.get();
    const reviewsJsonFile = path.join(DB_DIR, 'reviews.json');

    if (reviewCount === 0 && fs.existsSync(reviewsJsonFile)) {
      try {
        const legacyReviews = JSON.parse(fs.readFileSync(reviewsJsonFile, 'utf8'));
        if (Array.isArray(legacyReviews) && legacyReviews.length > 0) {
          const insertReview = db.prepare(`
            INSERT OR REPLACE INTO reviews (id, author, title, quote, rating, avatar, date, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);
          for (const r of legacyReviews) {
            insertReview.run(
              r.id || `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              r.author || 'Anonymous',
              r.title || 'Client',
              r.quote || '',
              parseInt(r.rating) || 5,
              r.avatar || '',
              r.date || new Date().toISOString().split('T')[0],
              r.createdAt || new Date().toISOString()
            );
          }
          console.log(`[Database Migration] Migrated ${legacyReviews.length} reviews into SQLite database.`);
        }
      } catch (e) {
        console.warn('[Database Migration] Reviews migration warning:', e.message);
      }
    }

    // 2. Migrate Inquiries
    const inquiriesCountStmt = db.prepare('SELECT COUNT(*) as count FROM inquiries');
    const { count: inqCount } = inquiriesCountStmt.get();
    const inquiriesJsonFile = path.join(DB_DIR, 'inquiries.json');

    if (inqCount === 0 && fs.existsSync(inquiriesJsonFile)) {
      try {
        const legacyInquiries = JSON.parse(fs.readFileSync(inquiriesJsonFile, 'utf8'));
        if (Array.isArray(legacyInquiries) && legacyInquiries.length > 0) {
          const insertInquiry = db.prepare(`
            INSERT OR REPLACE INTO inquiries (id, name, email, project_type, budget, message, status, created_at, formatted_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          for (const item of legacyInquiries) {
            insertInquiry.run(
              item.id || `inq_${Date.now()}`,
              item.name || 'Anonymous Client',
              item.email || '',
              item.projectType || 'General Inquiry',
              item.budget || 'Custom',
              item.message || '',
              item.status || 'new',
              item.timestamp || new Date().toISOString(),
              item.formattedTime || new Date().toLocaleString()
            );
          }
          console.log(`[Database Migration] Migrated ${legacyInquiries.length} inquiries into SQLite database.`);
        }
      } catch (e) {
        console.warn('[Database Migration] Inquiries migration warning:', e.message);
      }
    }

    // 3. Migrate Config
    const configStmt = db.prepare("SELECT value FROM site_config WHERE key = 'portfolio_config'");
    const existingConfig = configStmt.get();
    const configFile = path.join(DB_DIR, 'portfolio-config.json');

    if (!existingConfig && fs.existsSync(configFile)) {
      try {
        const rawConfig = fs.readFileSync(configFile, 'utf8');
        JSON.parse(rawConfig); // validate JSON
        const insertConfig = db.prepare(`
          INSERT OR REPLACE INTO site_config (key, value, updated_at)
          VALUES ('portfolio_config', ?, ?)
        `);
        insertConfig.run(rawConfig, new Date().toISOString());
        console.log('[Database Migration] Site config migrated into SQLite database.');
      } catch (e) {
        console.warn('[Database Migration] Config migration warning:', e.message);
      }
    }
  } catch (err) {
    console.warn('[Database Migration] Error during migration:', err.message);
  }
}

// Inquiries API
function getInquiries() {
  if (isNativeSqlite && db) {
    const stmt = db.prepare('SELECT * FROM inquiries ORDER BY created_at DESC');
    const rows = stmt.all();
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      projectType: r.project_type,
      budget: r.budget,
      message: r.message,
      status: r.status,
      timestamp: r.created_at,
      formattedTime: r.formatted_time
    }));
  }

  // Fallback to JSON
  const inquiriesFile = path.join(DB_DIR, 'inquiries.json');
  if (fs.existsSync(inquiriesFile)) {
    try {
      return JSON.parse(fs.readFileSync(inquiriesFile, 'utf8'));
    } catch (e) {}
  }
  return [];
}

function addInquiry(inquiryData) {
  const entry = {
    id: inquiryData.id || `inq_${Date.now()}`,
    name: inquiryData.name || 'Anonymous Client',
    email: inquiryData.email || '',
    projectType: inquiryData.projectType || 'General Inquiry',
    budget: inquiryData.budget || 'Custom',
    message: inquiryData.message || '',
    status: inquiryData.status || 'new',
    timestamp: new Date().toISOString(),
    formattedTime: new Date().toLocaleString()
  };

  if (isNativeSqlite && db) {
    const stmt = db.prepare(`
      INSERT INTO inquiries (id, name, email, project_type, budget, message, status, created_at, formatted_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      entry.id,
      entry.name,
      entry.email,
      entry.projectType,
      entry.budget,
      entry.message,
      entry.status,
      entry.timestamp,
      entry.formattedTime
    );
  }

  // Dual backup to JSON
  try {
    const inquiriesFile = path.join(DB_DIR, 'inquiries.json');
    let current = [];
    if (fs.existsSync(inquiriesFile)) {
      try { current = JSON.parse(fs.readFileSync(inquiriesFile, 'utf8')); } catch (e) {}
    }
    current.unshift(entry);
    fs.writeFileSync(inquiriesFile, JSON.stringify(current, null, 2), 'utf8');
  } catch (e) {}

  return entry;
}

// Reviews API
function getReviews() {
  if (isNativeSqlite && db) {
    const stmt = db.prepare('SELECT * FROM reviews ORDER BY created_at DESC');
    const rows = stmt.all();
    return rows.map(r => ({
      id: r.id,
      author: r.author,
      title: r.title,
      quote: r.quote,
      rating: r.rating,
      avatar: r.avatar,
      date: r.date
    }));
  }

  // Fallback to JSON
  const reviewsFile = path.join(DB_DIR, 'reviews.json');
  if (fs.existsSync(reviewsFile)) {
    try {
      return JSON.parse(fs.readFileSync(reviewsFile, 'utf8'));
    } catch (e) {}
  }
  return [];
}

function addReview(reviewData) {
  const author = String(reviewData.author || 'Anonymous').slice(0, 80);
  const reviewEntry = {
    id: reviewData.id || `rev-${Date.now()}`,
    author,
    title: String(reviewData.title || 'Client').slice(0, 100),
    quote: String(reviewData.quote || '').slice(0, 1000),
    rating: Math.min(5, Math.max(1, parseInt(reviewData.rating) || 5)),
    avatar: reviewData.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(author)}`,
    date: reviewData.date || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };

  if (isNativeSqlite && db) {
    const stmt = db.prepare(`
      INSERT INTO reviews (id, author, title, quote, rating, avatar, date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      reviewEntry.id,
      reviewEntry.author,
      reviewEntry.title,
      reviewEntry.quote,
      reviewEntry.rating,
      reviewEntry.avatar,
      reviewEntry.date,
      reviewEntry.createdAt
    );
  }

  // Dual backup to JSON
  try {
    const reviewsFile = path.join(DB_DIR, 'reviews.json');
    let current = [];
    if (fs.existsSync(reviewsFile)) {
      try { current = JSON.parse(fs.readFileSync(reviewsFile, 'utf8')); } catch (e) {}
    }
    current.unshift(reviewEntry);
    fs.writeFileSync(reviewsFile, JSON.stringify(current, null, 2), 'utf8');
  } catch (e) {}

  return reviewEntry;
}

// Config API
function getConfig() {
  if (isNativeSqlite && db) {
    const stmt = db.prepare("SELECT value FROM site_config WHERE key = 'portfolio_config'");
    const row = stmt.get();
    if (row && row.value) {
      try {
        const parsed = JSON.parse(row.value);
        if (!parsed.updatedAt) parsed.updatedAt = 1000;
        return parsed;
      } catch (e) {}
    }
  }

  const configFile = path.join(DB_DIR, 'portfolio-config.json');
  if (fs.existsSync(configFile)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      if (!parsed.updatedAt) parsed.updatedAt = 1000;
      return parsed;
    } catch (e) {}
  }
  return {};
}

function saveConfig(configObj) {
  if (!configObj || typeof configObj !== 'object') return false;
  if (!configObj.updatedAt) {
    configObj.updatedAt = Date.now();
  }
  const jsonStr = JSON.stringify(configObj, null, 2);

  if (isNativeSqlite && db) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO site_config (key, value, updated_at)
      VALUES ('portfolio_config', ?, ?)
    `);
    stmt.run(jsonStr, new Date().toISOString());
  }

  // Dual backup to file
  try {
    const configFile = path.join(DB_DIR, 'portfolio-config.json');
    fs.writeFileSync(configFile, jsonStr, 'utf8');
  } catch (e) {}

  return true;
}

// Visitor Log API
function logVisitor(ip, ua, reqPath) {
  if (!isNativeSqlite || !db) return;
  try {
    const stmt = db.prepare(`
      INSERT INTO visitor_logs (ip, path, user_agent, visited_at)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(ip || 'unknown', reqPath || '/', String(ua || '').slice(0, 255), new Date().toISOString());
  } catch (e) {}
}

// Database Diagnostics & Metrics
function getDbStats() {
  let stats = {
    engine: isNativeSqlite ? 'SQLite 3 (Native node:sqlite)' : 'JSON Persistence Fallback',
    dbFile: DB_FILE,
    dbSizeBytes: 0,
    dbSizeFormatted: '0 KB',
    counts: {
      inquiries: 0,
      reviews: 0,
      visitorLogs: 0,
      configRecords: 0
    },
    lastUpdated: new Date().toISOString()
  };

  if (fs.existsSync(DB_FILE)) {
    const s = fs.statSync(DB_FILE);
    stats.dbSizeBytes = s.size;
    stats.dbSizeFormatted = `${(s.size / 1024).toFixed(2)} KB`;
  }

  if (isNativeSqlite && db) {
    try {
      stats.counts.inquiries = db.prepare('SELECT COUNT(*) as c FROM inquiries').get().c;
      stats.counts.reviews = db.prepare('SELECT COUNT(*) as c FROM reviews').get().c;
      stats.counts.visitorLogs = db.prepare('SELECT COUNT(*) as c FROM visitor_logs').get().c;
      stats.counts.configRecords = db.prepare('SELECT COUNT(*) as c FROM site_config').get().c;
    } catch (e) {}
  } else {
    stats.counts.inquiries = getInquiries().length;
    stats.counts.reviews = getReviews().length;
  }

  return stats;
}

// Initialize immediately
initSchema();

module.exports = {
  isNativeSqlite,
  getInquiries,
  addInquiry,
  getReviews,
  addReview,
  getConfig,
  saveConfig,
  logVisitor,
  getDbStats
};
