CREATE TABLE IF NOT EXISTS plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  project_name text,
  snapshot jsonb NOT NULL,
  edit_token_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS plan_items (
  id text PRIMARY KEY,
  plan_id text NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  package_name text NOT NULL,
  target text NOT NULL,
  position integer NOT NULL,
  note text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'todo'
);
