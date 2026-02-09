-- Users table with extended fields
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  organization TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Scans table
CREATE TABLE IF NOT EXISTS scans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  domain TEXT NOT NULL,
  status TEXT DEFAULT 'running',
  total_found INTEGER DEFAULT 0,
  total_resolved INTEGER DEFAULT 0,
  sources TEXT DEFAULT 'all',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Results table
CREATE TABLE IF NOT EXISTS results (
  id TEXT PRIMARY KEY,
  scan_id TEXT NOT NULL,
  subdomain TEXT NOT NULL,
  ip_addresses TEXT,
  source TEXT,
  resolved INTEGER DEFAULT 0,
  discovered_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_domain ON scans(domain);
CREATE INDEX IF NOT EXISTS idx_results_scan_id ON results(scan_id);
CREATE INDEX IF NOT EXISTS idx_results_subdomain ON results(subdomain);
