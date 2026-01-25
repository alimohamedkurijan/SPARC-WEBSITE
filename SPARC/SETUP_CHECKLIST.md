# 📋 Supabase Setup Checklist

Use this checklist to set up your SPARC admin panel. Check off each item as you complete it.

## ✅ Setup Checklist

### Phase 1: Database Setup
- [ ] 1. Go to https://scpxfavmlrmccwyigldi.supabase.co
- [ ] 2. Click **SQL Editor** in the sidebar
- [ ] 3. Click **New Query**
- [ ] 4. Open `supabase-setup.sql` file
- [ ] 5. Copy ALL the SQL code
- [ ] 6. Paste it into the SQL Editor
- [ ] 7. Click **Run** button
- [ ] 8. Verify you see "Success. No rows returned" message
- [ ] 9. Go to **Database** > **Tables** and verify these tables exist:
  - [ ] `profiles`
  - [ ] `events`
  - [ ] `image_metadata`

### Phase 2: Storage Setup
- [ ] 10. Click **Storage** in the sidebar
- [ ] 11. Click **Create a new bucket**
- [ ] 12. Name it: `images`
- [ ] 13. Toggle **Public bucket** ON
- [ ] 14. Click **Create bucket**
- [ ] 15. Click on the `images` bucket
- [ ] 16. Go to **Policies** tab
- [ ] 17. Click **New Policy** and add these three policies:

#### Policy 1: Public Read
- [ ] 18. Name: `Public Access`
- [ ] 19. Allowed operation: `SELECT`
- [ ] 20. Target roles: `public` (or leave default)
- [ ] 21. USING expression: `bucket_id = 'images'`
- [ ] 22. Click **Review** then **Save policy**

#### Policy 2: Authenticated Upload
- [ ] 23. Click **New Policy** again
- [ ] 24. Name: `Authenticated users can upload images`
- [ ] 25. Allowed operation: `INSERT`
- [ ] 26. Target roles: `authenticated`
- [ ] 27. WITH CHECK expression: `bucket_id = 'images' AND auth.role() = 'authenticated'`
- [ ] 28. Click **Review** then **Save policy**

#### Policy 3: Admin Delete
- [ ] 29. Click **New Policy** again
- [ ] 30. Name: `Admins can delete images`
- [ ] 31. Allowed operation: `DELETE`
- [ ] 32. Target roles: `authenticated`
- [ ] 33. USING expression:
```sql
bucket_id = 'images' AND EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid()
  AND profiles.role = 'admin'
)
```
- [ ] 34. Click **Review** then **Save policy**

### Phase 3: Create Admin Account
- [ ] 35. Click **Authentication** in the sidebar
- [ ] 36. Click **Users** tab
- [ ] 37. Click **Add user** button
- [ ] 38. Select **Create new user**
- [ ] 39. Enter your email address
- [ ] 40. Enter a strong password
- [ ] 41. Click **Create user**
- [ ] 42. Copy the user ID (UUID) that appears

### Phase 4: Make Yourself Admin
- [ ] 43. Click **Database** in the sidebar
- [ ] 44. Click **Table Editor**
- [ ] 45. Select `profiles` table
- [ ] 46. Find your user row (match the email)
- [ ] 47. Click on the `role` cell
- [ ] 48. Change from `user` to `admin`
- [ ] 49. Press Enter or click away to save

### Phase 5: Test the Admin Panel
- [ ] 50. Open terminal in your project folder
- [ ] 51. Run: `npm run dev`
- [ ] 52. Wait for "Ready" message
- [ ] 53. Open browser to: http://localhost:3000/admin/login
- [ ] 54. Enter your email and password
- [ ] 55. Click **Sign In**
- [ ] 56. Verify you see the admin dashboard

### Phase 6: Test Each Feature
- [ ] 57. **Dashboard**: Check that statistics load
- [ ] 58. **Events**: Try creating a new event
- [ ] 59. **Events**: Try editing the event
- [ ] 60. **Events**: Try deleting the event
- [ ] 61. **Users**: Check that you see yourself in the list
- [ ] 62. **Images**: Try uploading an image
- [ ] 63. **Images**: Try copying the image URL
- [ ] 64. **Images**: Try deleting the image
- [ ] 65. **Logout**: Click logout and verify you're redirected to login

## 🎉 Completion

- [ ] 66. All features tested and working
- [ ] 67. Admin panel is fully operational
- [ ] 68. Ready to add real events and content!

## 📞 Troubleshooting

If something doesn't work:

1. **SQL errors when running setup**
   - Make sure you copied ALL the SQL code
   - Try running it in smaller chunks if needed

2. **Can't log in**
   - Verify user was created in Authentication > Users
   - Check email and password are correct

3. **"Access denied" after login**
   - Make sure you set role to 'admin' in profiles table
   - Try logging out and back in

4. **Images won't upload**
   - Verify `images` bucket exists and is public
   - Check all three storage policies are created
   - Make sure you're logged in

5. **Tables don't exist**
   - Go back to SQL Editor
   - Run `supabase-setup.sql` again

6. **Profile not created automatically**
   - Check if trigger `on_auth_user_created` exists
   - Manually insert profile:
   ```sql
   INSERT INTO profiles (id, email, role)
   VALUES ('your-user-id', 'your-email', 'admin');
   ```

## ✅ All Done!

When all checkboxes are checked, your admin panel is fully set up and ready to use!

Next steps:
- Add your real club events
- Upload event images
- Invite team members
- Start managing your website content

Congratulations! 🎊
