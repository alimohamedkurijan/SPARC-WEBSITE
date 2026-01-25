# Supabase Setup Guide for SPARC Website

This guide will help you set up Supabase for the SPARC website admin panel.

## Prerequisites

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project in Supabase
3. Get your project URL and anon key from the project settings

## Step 1: Environment Variables

Create a `.env.local` file in the root of your project with the following:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 2: Install Supabase Client

Run this command to install the Supabase JavaScript client:

```bash
npm install @supabase/supabase-js
```

## Step 3: Database Schema

Run the following SQL in your Supabase SQL Editor to create the necessary tables:

### 1. Enable Row Level Security (RLS) and Create Tables

```sql
-- Create profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT,
  spots INTEGER NOT NULL DEFAULT 0,
  deadline DATE NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create image_metadata table
CREATE TABLE image_metadata (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT DEFAULT 'other' CHECK (category IN ('hero', 'events', 'about', 'team', 'gallery', 'other')),
  size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_metadata ENABLE ROW LEVEL SECURITY;
```

### 2. Create RLS Policies

```sql
-- Profiles: Anyone can read, only admins can update roles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Events: Everyone can read, only admins can create/update/delete
CREATE POLICY "Events are viewable by everyone"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Admins can create events"
  ON events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update events"
  ON events FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete events"
  ON events FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Images: Everyone can read, only admins can manage
CREATE POLICY "Images are viewable by everyone"
  ON image_metadata FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage images"
  ON image_metadata FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

### 3. Create Functions and Triggers

```sql
-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updating updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Step 4: Storage Setup

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `images`
3. Set the bucket to **Public** (so images can be accessed publicly)
4. Add storage policies:

```sql
-- Allow public read access to images
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'images'
    AND auth.role() = 'authenticated'
  );

-- Allow admins to delete images
CREATE POLICY "Admins can delete images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'images'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

## Step 5: Create Your First Admin User

After setting up authentication, you need to manually set the first admin:

1. Sign up through the website (this creates a user)
2. Go to Supabase Dashboard > Authentication > Users
3. Copy the user's UUID
4. Go to SQL Editor and run:

```sql
UPDATE profiles
SET role = 'admin'
WHERE id = 'your-user-uuid-here';
```

Or use the Table Editor:
1. Go to Database > Tables > profiles
2. Find your user and change the `role` column to `admin`

## Step 6: Update Your Code

Once Supabase is set up, update your code to use the real Supabase client:

### In `/app/admin/login/page.tsx`:
Uncomment the Supabase authentication code and remove the hardcoded credentials.

### In `/app/admin/dashboard/page.tsx`:
Uncomment the Supabase data fetching code.

### In `/app/admin/events/page.tsx`:
Uncomment the Supabase CRUD operations.

### In `/app/admin/users/page.tsx`:
Uncomment the Supabase user management code.

### In `/app/admin/images/page.tsx`:
Uncomment the Supabase storage operations.

## Testing

1. Create an account through the website
2. Make yourself an admin using the SQL query above
3. Log in to `/admin/login`
4. Test all CRUD operations:
   - Create, edit, and delete events
   - Assign admin roles to users
   - Upload and manage images

## Security Notes

- Never commit your `.env.local` file to version control
- Add `.env.local` to your `.gitignore` file
- Use RLS policies to protect sensitive data
- Only allow admins to perform destructive operations
- Validate all user inputs on the backend

## Troubleshooting

### Issue: "Invalid API key"
- Check that your environment variables are correct
- Restart your Next.js development server after adding `.env.local`

### Issue: "Row Level Security" errors
- Make sure RLS is enabled on all tables
- Verify that your RLS policies are set up correctly
- Check that the user has the correct role in the profiles table

### Issue: Images not uploading
- Verify the `images` bucket exists and is public
- Check storage policies are set correctly
- Ensure the user is authenticated

## Next Steps

Once Supabase is connected:
1. Test all admin features thoroughly
2. Add more event fields if needed
3. Implement event registration system
4. Add email notifications using Supabase Edge Functions
5. Set up backups and monitoring in Supabase dashboard
