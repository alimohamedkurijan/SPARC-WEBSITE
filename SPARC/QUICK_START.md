# Quick Start Guide - SPARC Admin Panel with Supabase

Your admin panel is now fully integrated with Supabase! Follow these steps to get started.

## ✅ What's Already Done

- ✅ Supabase client installed (`@supabase/supabase-js`)
- ✅ Environment variables configured in `.env.local`
- ✅ All admin pages updated to use Supabase
- ✅ Authentication system ready
- ✅ Event management ready
- ✅ User management ready
- ✅ Image upload system ready

## 🚀 Setup Steps

### Step 1: Set Up Database Tables

1. Go to your Supabase project: https://scpxfavmlrmccwyigldi.supabase.co
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase-setup.sql` and paste it into the editor
5. Click **Run** to execute the SQL

This will create:
- `profiles` table for users
- `events` table for club events
- `image_metadata` table for image organization
- All necessary Row Level Security (RLS) policies
- Automatic triggers for user creation

### Step 2: Set Up Storage Bucket

1. In your Supabase project, go to **Storage** in the left sidebar
2. Click **Create a new bucket**
3. Name it: `images`
4. Make it **Public** (toggle the Public bucket option)
5. Click **Create bucket**

### Step 3: Add Storage Policies

1. Click on the `images` bucket you just created
2. Go to the **Policies** tab
3. Click **New Policy**
4. Add these three policies:

**Policy 1: Public Read Access**
- Policy name: `Public Access`
- Allowed operation: `SELECT`
- Policy definition:
```sql
bucket_id = 'images'
```

**Policy 2: Authenticated Upload**
- Policy name: `Authenticated users can upload images`
- Allowed operation: `INSERT`
- Policy definition:
```sql
bucket_id = 'images' AND auth.role() = 'authenticated'
```

**Policy 3: Admin Delete**
- Policy name: `Admins can delete images`
- Allowed operation: `DELETE`
- Policy definition:
```sql
bucket_id = 'images' AND EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid()
  AND profiles.role = 'admin'
)
```

### Step 4: Create Your Admin Account

1. Start your development server:
```bash
npm run dev
```

2. Open your browser to: http://localhost:3000

3. Go to: http://localhost:3000/admin/login

4. You'll need to create your first account through Supabase Dashboard:
   - Go to **Authentication** > **Users** in Supabase
   - Click **Add user** > **Create new user**
   - Enter your email and password
   - Click **Create user**

5. Make yourself an admin:
   - Go to **Database** > **Table Editor** > **profiles**
   - Find your user (it should be auto-created by the trigger)
   - Click on the row and change `role` from `user` to `admin`
   - Click **Save**

   OR run this SQL (replace `your-user-id` with your actual user ID from the auth.users table):
   ```sql
   UPDATE profiles SET role = 'admin' WHERE id = 'your-user-id';
   ```

### Step 5: Log In to Admin Panel

1. Go to http://localhost:3000/admin/login
2. Enter the email and password you created in Step 4
3. You should now have access to the admin dashboard!

## 🎉 You're All Set!

You can now:
- ✅ **Manage Events**: Add, edit, and delete events
- ✅ **Manage Users**: Assign admin roles to other users
- ✅ **Upload Images**: Upload and organize images for your website
- ✅ **View Dashboard**: See statistics and quick actions

## 📝 Admin Panel URLs

- Login: http://localhost:3000/admin/login
- Dashboard: http://localhost:3000/admin/dashboard
- Events: http://localhost:3000/admin/events
- Users: http://localhost:3000/admin/users
- Images: http://localhost:3000/admin/images

## 🔐 Security Notes

- Your `.env.local` file is already in `.gitignore` - never commit it
- Only users with `role = 'admin'` can access the admin panel
- All database operations are protected by Row Level Security
- Storage is protected by bucket policies

## 🐛 Troubleshooting

### "Invalid login credentials"
- Make sure you created the user in Supabase Authentication
- Check that your email and password are correct

### "Access denied. Admin privileges required."
- Make sure you set `role = 'admin'` in the profiles table
- Try logging out and back in

### "Failed to fetch user profile"
- Check that the `profiles` table was created
- Make sure the trigger `on_auth_user_created` is working
- Manually insert a profile if needed

### Images not uploading
- Check that the `images` bucket exists and is public
- Verify storage policies are set up correctly
- Make sure you're logged in as an authenticated user

### Tables don't exist
- Make sure you ran the entire `supabase-setup.sql` file
- Check for any error messages in the SQL Editor

## 📚 Next Steps

1. **Add Your First Event**
   - Go to Admin > Events
   - Click "Add New Event"
   - Fill in the details and save

2. **Upload Images**
   - Go to Admin > Images
   - Click "Upload Images"
   - Select images from your computer

3. **Invite Team Members**
   - Have them sign up through Supabase
   - Go to Admin > Users
   - Change their role to `admin` if needed

4. **Customize Your Website**
   - Update event details
   - Upload custom images
   - Manage user roles

## 🆘 Need Help?

If you encounter any issues:
1. Check the browser console for errors (F12)
2. Check the Supabase logs in your dashboard
3. Verify all SQL was executed successfully
4. Make sure environment variables are loaded (restart dev server)

Enjoy your new admin panel! 🎉
