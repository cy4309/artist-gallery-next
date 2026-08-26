CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  provider TEXT,
  line_user_id TEXT,
  email TEXT,
  name TEXT,
  picture TEXT,
  created_at TEXT,
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_line ON users(line_user_id);

CREATE TABLE IF NOT EXISTS user_favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event_title TEXT,
  event_start_date TEXT,
  event_end_date TEXT,
  event_location TEXT,
  event_url TEXT,
  image_url TEXT,
  created_at TEXT,
  UNIQUE(user_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_fav_user ON user_favorites(user_id);

CREATE TABLE IF NOT EXISTS device_push_tokens (
  expo_push_token TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  user_id TEXT,
  updated_at TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  source TEXT,
  source_id TEXT,
  category TEXT,
  title TEXT,
  start_time TEXT,
  end_time TEXT,
  city_name TEXT,
  address TEXT,
  description TEXT,
  website TEXT,
  image_url TEXT,
  synced_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_events_city ON events(city_name);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_start ON events(start_time);

CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT
);
