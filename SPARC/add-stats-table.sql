-- Add site_stats table for "Our Numbers" section
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS site_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stat_key TEXT UNIQUE NOT NULL,
  number TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Stats are viewable by everyone" ON site_stats;
DROP POLICY IF EXISTS "Admins can manage stats" ON site_stats;

-- Everyone can read stats
CREATE POLICY "Stats are viewable by everyone"
  ON site_stats FOR SELECT
  USING (true);

-- Only admins can manage stats
CREATE POLICY "Admins can manage stats"
  ON site_stats FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert default stats
INSERT INTO site_stats (stat_key, number, label, description, display_order) VALUES
  ('members', '560+', 'Active Members', 'Students', 1),
  ('success_rate', '96.3', 'Success Rate', '%', 2),
  ('projects', '1090+', 'Projects', 'Completed', 3),
  ('hours', '6000+', 'Hours', 'Coaching & Collaboration', 4)
ON CONFLICT (stat_key) DO NOTHING;

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_site_stats_updated_at ON site_stats;

CREATE TRIGGER update_site_stats_updated_at
  BEFORE UPDATE ON site_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
