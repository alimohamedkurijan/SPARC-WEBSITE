# How to Add Events with Images - UPDATED!

The easiest way to add events with images to your SPARC website.

## ✨ New Feature: Direct File Upload in Event Form!

You can now upload images **directly** when creating events - no need to go to the Images page first!

## Quick Method: Upload Image Directly (Recommended)

1. Go to http://localhost:3000/admin/events
2. Click **"+ Add New Event"**
3. Fill in the event details:
   - **Title**: Event name
   - **Date**: Event date  
   - **Time**: Event time (e.g., "2:00 PM - 4:00 PM")
   - **Location**: Where it's happening
   - **Description**: Describe the event
   - **Available Spots**: Number of participants
   - **Registration Deadline**: Last day to register

4. **For the Event Image section**, you have TWO options:

   ### Option 1: Upload File (Easiest!)
   - Click **"Choose File"** button
   - Select your image from your computer (JPG, PNG, etc.)
   - You'll see a live preview of the image
   - Click "Remove" if you want to change it
   - The image will upload automatically when you click "Create Event"

   ### Option 2: Paste Image URL
   - If you already have an image URL from somewhere
   - Paste it in the "Or paste image URL" field
   - Must be a direct link starting with `https://`

5. **Featured Event Checkbox**: 
   - ✅ Check this if you want it as the **BIG card** on homepage
   - ⚠️ Only ONE event should be featured at a time

6. Click **"Create Event"**

7. **Wait a moment** while the image uploads (you'll see "Uploading image...")

8. **Done!** Your event appears on the website instantly!

---

## Alternative: Upload to Library First

If you prefer to organize images in the library:

1. Go to http://localhost:3000/admin/images  
2. Upload images there
3. Copy the URL
4. Paste it when creating the event

---

## 📝 Important Tips

### For Featured Events (Big Card):
- **Image position**: Left side of a large horizontal card
- **Best ratio**: Landscape (horizontal) images work best
- **Recommended size**: 800x600px or larger
- **Only ONE featured event** - Having multiple messes up the display

### For Regular Events:
- Small cards don't show images currently
- But you can still upload for future features

### Image Format:
- **Supported**: JPG, PNG, WebP
- **Max size**: Keep under 2-3MB for fast uploading
- **Quality**: Use good quality - website handles optimization

### If Something Goes Wrong:
- **Image fails to load**: Website shows a nice red-orange gradient instead
- **No errors displayed**: Everything gracefully falls back
- **Event still works**: Even without an image, event displays perfectly

---

## 🎨 Image Best Practices

### ✅ Good Images:
- Clear and high quality
- Good lighting (not too dark/bright)
- Shows people, robots, or event activities  
- Horizontal/landscape orientation
- File size 500KB - 2MB

### ❌ Avoid:
- Vertical/portrait images (will be cropped badly)
- Images with important text (overlay might cover it)
- Tiny images under 400px wide (pixelated)
- Huge files over 5MB (slow upload)

---

## 🔄 To Edit Event Image

1. Go to Admin > Events
2. Click **"Edit"** on the event
3. In the image section:
   - Upload a new file, OR
   - Paste a new URL, OR  
   - Click "Remove" to delete current image
4. Click **"Update Event"**

---

## 🚀 Pro Tips

1. **Preview is your friend** - Always check the preview before saving
2. **Landscape for featured** - Horizontal images look best in the big featured card
3. **One featured only** - Don't check "Featured" on multiple events
4. **Upload > URL** - File upload is easier than copying URLs
5. **Quality matters** - Better quality images = better looking website

---

## ❓ FAQ

**Q: Can I upload multiple images?**  
A: One image per event. For featured events, this shows in the big card.

**Q: What if I don't upload an image?**  
A: The event still works! It shows a nice gradient background instead.

**Q: How long does upload take?**  
A: Usually 1-5 seconds depending on file size and internet speed.

**Q: Can I change the image later?**  
A: Yes! Edit the event and upload a new image anytime.

**Q: What's the difference between featured and regular events?**  
A: Featured events show as a large card with image. Regular events show in smaller cards.

---

**Need Help?** Make sure:
- ✅ Your image is JPG, PNG, or WebP
- ✅ File size is under 5MB  
- ✅ You have internet connection
- ✅ Supabase storage bucket is set up (from initial setup)
