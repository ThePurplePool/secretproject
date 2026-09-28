import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'antiscam.db');
export const db = new Database(DB_PATH);

// Enable foreign keys and WAL mode for reliability and performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      email TEXT,
      initial_balance INTEGER NOT NULL DEFAULT 10000000,
      current_balance INTEGER NOT NULL DEFAULT 10000000,
      simulated_loss INTEGER NOT NULL DEFAULT 0,
      protected_amount INTEGER NOT NULL DEFAULT 10000000,
      level INTEGER NOT NULL DEFAULT 1,
      invited_count INTEGER NOT NULL DEFAULT 0,
      referral_code TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS scenarios (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      difficulty INTEGER NOT NULL DEFAULT 1,
      level INTEGER NOT NULL DEFAULT 1,
      interface TEXT NOT NULL,
      time_limit INTEGER NOT NULL DEFAULT 20,
      starting_balance INTEGER NOT NULL DEFAULT 10000000,
      sender_json TEXT NOT NULL,
      content_json TEXT NOT NULL,
      pressure_phrases_json TEXT NOT NULL,
      available_actions_json TEXT NOT NULL,
      consequences_json TEXT NOT NULL,
      feedback_json TEXT NOT NULL,
      retry_scenario_id TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS scenario_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      scenario_id TEXT NOT NULL,
      chosen_action_id TEXT NOT NULL,
      time_taken_seconds REAL NOT NULL,
      is_success INTEGER NOT NULL,
      simulated_loss INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      certificate_id TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      level_number INTEGER NOT NULL,
      level_name TEXT NOT NULL,
      verification_hash TEXT NOT NULL,
      issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS scam_clusters (
      id TEXT PRIMARY KEY,
      cluster_code TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      indicators_summary TEXT NOT NULL,
      report_count INTEGER NOT NULL DEFAULT 1,
      confidence_score REAL NOT NULL DEFAULT 0.5,
      status TEXT NOT NULL DEFAULT 'active',
      matched_phones_json TEXT NOT NULL DEFAULT '[]',
      matched_telegrams_json TEXT NOT NULL DEFAULT '[]',
      matched_urls_json TEXT NOT NULL DEFAULT '[]',
      matched_requisites_json TEXT NOT NULL DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS fraud_reports (
      id TEXT PRIMARY KEY,
      report_id TEXT UNIQUE NOT NULL,
      user_id TEXT,
      category TEXT NOT NULL,
      phone_number TEXT,
      telegram_handle TEXT,
      whatsapp_handle TEXT,
      url TEXT,
      payment_requisites TEXT,
      description TEXT NOT NULL,
      screenshot_url TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      scam_cluster_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(scam_cluster_id) REFERENCES scam_clusters(id) ON DELETE SET NULL
    );
  `);
}
