-- Add tables for About SPARC and Meet The Team sections
-- Run this in Supabase SQL Editor

-- About Content Table
CREATE TABLE IF NOT EXISTS about_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  image TEXT,
  points TEXT[], -- Array of bullet points
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  image TEXT,
  email TEXT,
  linkedin TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Policies for about_content
CREATE POLICY "About content is viewable by everyone"
  ON about_content FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage about content"
  ON about_content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policies for team_members
CREATE POLICY "Team members are viewable by everyone"
  ON team_members FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage team members"
  ON team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert default about content
INSERT INTO about_content (section_key, title, subtitle, description, image, points, display_order) VALUES
  ('welcome', 'Welcome to SPARC', 'An Amazing Boost to your Journey', 'SPARC is dedicated to empowering students through robotics and programming education.', '/images/about-1.jpg', ARRAY['Hands-on learning experiences', 'Industry-relevant skills development', 'Collaborative project-based approach'], 1),
  ('philosophy', 'Our Philosophy', 'Able to Enable', 'We believe in nurturing talent and providing opportunities for growth and innovation.', '/images/about-2.jpg', ARRAY['Student-centered learning', 'Innovation and creativity', 'Building future leaders'], 2)
ON CONFLICT (section_key) DO NOTHING;

-- Insert sample team members
INSERT INTO team_members (name, role, bio, image, display_order) VALUES
  ('John Smith', 'President', 'Passionate about robotics and leading the club to new heights.', '', 1),
  ('Sarah Johnson', 'Vice President', 'Dedicated to fostering a collaborative learning environment.', '', 2),
  ('Mike Chen', 'Technical Lead', 'Expert in programming and hardware integration.', '', 3),
  ('Emily Davis', 'Events Coordinator', 'Organizing amazing events and workshops for our members.', '', 4)
ON CONFLICT DO NOTHING;

-- Add triggers for updated_at
CREATE TRIGGER update_about_content_updated_at
  BEFORE UPDATE ON about_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
