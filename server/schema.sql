CREATE TABLE IF NOT EXISTS calls (
  id SERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  call_date TIMESTAMP NOT NULL,
  duration_seconds INTEGER NOT NULL,
  sentiment TEXT NOT NULL CHECK (sentiment IN ('Positive', 'Neutral', 'Negative')),
  status TEXT NOT NULL CHECK (status IN ('New', 'Reviewed', 'Follow up')),
  summary TEXT NOT NULL,
  next_step TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
