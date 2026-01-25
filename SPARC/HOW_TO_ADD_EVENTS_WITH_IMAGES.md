# How to Add Events with Images

Follow these simple steps to add events with images to your SPARC website.

## Step 1: Upload Image First

1. Go to http://localhost:3000/admin/images
2. Click **"+ Upload Images"**
3. Select your event image (JPG, PNG, etc.)
4. Wait for "Images uploaded successfully!" message
5. Find your uploaded image in the grid
6. Click **"Copy URL"** button
7. The image URL is now in your clipboard!

## Step 2: Create Event with Image

1. Go to http://localhost:3000/admin/events
2. Click **"+ Add New Event"**
3. Fill in the event details:
   - **Title**: Event name
   - **Date**: Event date
   - **Time**: Event time (e.g., "2:00 PM - 4:00 PM")
   - **Location**: Where it's happening
   - **Description**: Describe the event
   - **Image URL**: **PASTE** the URL you copied from Step 1
   - **Available Spots**: Number of participants
   - **Registration Deadline**: Last day to register
   - **Featured Event**: ✅ Check this if you want it as the BIG card on homepage

4. Click **"Create Event"**

## ✅ That's It!

Your event will now show on the homepage with the image!

## 📝 Tips

### For the Main/Featured Event:
- Image will be displayed on the LEFT side of a large card
- Best image ratio: **Landscape** (wider than tall)
- Recommended size: **800x600px** or similar
- Only check "Featured Event" for ONE event at a time

### For Other Events:
- No image needed (they don't show images in the small cards)
- But you can still add an image URL for future use

### If Image Doesn't Work:
- Don't worry! The website will show a nice gradient background instead
- No errors, no broken image icons
- The event will still display perfectly

## 🎨 Image Guidelines

**Good images:**
- Clear, high quality
- Not too dark or too bright
- Shows people, robots, or event activity
- Landscape orientation (horizontal)

**Avoid:**
- Very tall/vertical images (they'll be cropped)
- Images with important text (text might be covered by overlay)
- Very small images (will look pixelated)

## 🔄 To Change/Update Event Image

1. Go to Admin > Events
2. Click **"Edit"** on the event
3. Upload a new image in Admin > Images
4. Copy the new image URL
5. Paste it in the "Image URL" field
6. Click **"Update Event"**

## ❌ To Remove Image

1. Edit the event
2. Clear the "Image URL" field (delete the URL)
3. Save - event will show with gradient background

---

**Need help?** Make sure:
- You copied the FULL URL from the Images page
- The URL starts with `https://`
- You're pasting it in the "Image URL" field, not the title or description!
