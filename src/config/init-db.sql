
\c muud_health;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS journal_entries (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  entry_text TEXT NOT NULL,
  mood_rating INTEGER NOT NULL CHECK (mood_rating BETWEEN 1 AND 5),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_journal_user_id ON journal_entries (user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts (user_id);

INSERT INTO users (username, email, password)
VALUES 
  ('user1', 'user1@example.com', '$2b$10$6Q5o95Y5nJRMBgHnH4VuFeJCEeQKWSKuU/J/Z0ZGc0KFzDvKKAXiy'),
  ('user2', 'user2@example.com', '$2b$10$6Q5o95Y5nJRMBgHnH4VuFeJCEeQKWSKuU/J/Z0ZGc0KFzDvKKAXiy');

INSERT INTO journal_entries (user_id, entry_text, mood_rating, timestamp)
VALUES 
  ('user1', 'Today was a great day!', 5, '2025-05-01T12:00:00Z'),
  ('user1', 'Feeling a bit tired today.', 3, '2025-05-02T12:00:00Z'),
  ('user2', 'Had a productive day at work.', 4, '2025-05-01T14:00:00Z');

INSERT INTO contacts (user_id, contact_name, contact_email)
VALUES 
  ('user1', 'John Doe', 'john.doe@example.com'),
  ('user1', 'Jane Smith', 'jane.smith@example.com'),
  ('user2', 'Alice Johnson', 'alice.johnson@example.com');