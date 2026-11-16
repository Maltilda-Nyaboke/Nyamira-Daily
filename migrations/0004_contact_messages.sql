-- Contact form messages (decision #122). Stored for the editor to read; purged after the retention period.
CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  topic TEXT NOT NULL CHECK (topic IN ('general', 'tip', 'concern', 'correction', 'reply', 'partnership', 'careers', 'story', 'volunteer')),
  name TEXT CHECK (name IS NULL OR length(name) <= 120),
  contact TEXT CHECK (contact IS NULL OR length(contact) <= 200),
  ward TEXT CHECK (ward IS NULL OR length(ward) <= 60),
  message TEXT NOT NULL CHECK (length(message) BETWEEN 10 AND 3000),
  consent INTEGER NOT NULL CHECK (consent = 1),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'done')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS contact_messages_created ON contact_messages (created_at);

CREATE TABLE IF NOT EXISTS contact_rate_limits (
  ip_hash TEXT PRIMARY KEY,
  window_started TEXT NOT NULL,
  submission_count INTEGER NOT NULL CHECK (submission_count >= 1)
);
