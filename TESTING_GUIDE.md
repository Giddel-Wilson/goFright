# 🚀 Quick Start Guide - Testing GoFright

## Prerequisites
- Bun installed
- MongoDB Atlas connection configured in `.env`
- Dev server running

## Step 1: Start the Application

```bash
cd /Users/maintenance/Documents/goFright
bun run dev
```

Visit: **http://localhost:5173**

---

## Step 2: Test User Registration

1. Click **"Get Started"** or **"Register"** button
2. Fill in the registration form:
   - **Name**: John Doe
   - **Email**: john@example.com
   - **Password**: password123
   - **Confirm Password**: password123
   - **Phone**: +1234567890
   - **Address**: 123 Main St, New York, NY 10001

3. Click **"Create Account"**
4. You'll be redirected to the login page

---

## Step 3: Login

1. Enter your credentials:
   - **Email**: john@example.com
   - **Password**: password123

2. Click **"Sign In"**
3. You'll be redirected to the **Dashboard**

---

## Step 4: Explore the Dashboard

You should see:
- ✅ Welcome message with your name
- ✅ Statistics cards (Total, In Transit, Delivered, Pending)
- ✅ Quick action buttons
- ✅ Recent shipments section (empty initially)

---

## Step 5: Book Your First Cargo

1. Click **"Book Cargo"** button
2. Fill in the **Shipment Details**:
   - **Origin**: New York, USA
   - **Destination**: London, UK
   - **Cargo Type**: Select "General Cargo"
   - **Weight**: 25.5 kg
   - **Dimensions**: 50 × 40 × 30 cm (optional)
   - **Description**: Electronics and accessories

3. Fill in **Sender Information**:
   - **Name**: John Doe
   - **Phone**: +1234567890
   - **Email**: john@example.com
   - **Address**: 123 Main St, New York, NY 10001

4. Fill in **Receiver Information**:
   - **Name**: Jane Smith
   - **Phone**: +441234567890
   - **Email**: jane@example.com
   - **Address**: 456 Oxford St, London, W1D 1BS, UK

5. Click **"📦 Book Cargo"**
6. You'll see a success message with your **Tracking ID** (e.g., GF-XXXXXXXXXX)
7. You'll be redirected to the cargo detail page

---

## Step 6: View Cargo Details

On the cargo detail page, you'll see:
- ✅ Large tracking ID at the top
- ✅ Status badge (should be "booked")
- ✅ Shipment information (type, weight, dimensions)
- ✅ Sender and receiver details
- ✅ Payment summary with cost breakdown
- ✅ Tracking history timeline (initial booking entry)

---

## Step 7: Test Public Tracking

1. Copy your tracking ID (e.g., GF-ABC123XYZ)
2. Open a **new incognito/private browser window**
3. Go to: **http://localhost:5173/track**
4. Enter your tracking ID
5. Click **"🔍 Track Shipment"**
6. You'll see the public tracking view with timeline

**Note**: Public tracking works WITHOUT login!

---

## Step 8: View Cargo List

1. Go back to your logged-in session
2. Click **"Cargo"** in the navigation menu
3. You'll see your booked cargo in the list
4. Try the search box: type part of your tracking ID
5. Try the filter dropdown: select "Booked" status
6. Click on any cargo card to view details

---

## Step 9: Test Navigation

Explore the navigation menu:
- ✅ **Dashboard** - Your main overview
- ✅ **Cargo** - List of all shipments
- ✅ **Track** - Public tracking page
- ✅ **Admin Panel** - Only visible if you're an admin (you won't see this as a customer)

Click on your **avatar** in the top right:
- View your name and email
- Click **"Profile"** (will be implemented later)
- Click **"Logout"** to sign out

---

## Step 10: Test Logout and Login Again

1. Click your avatar → **"Logout"**
2. You'll be redirected to the homepage
3. Click **"Sign In"**
4. Enter your credentials again
5. You'll be back on the dashboard with your data intact

---

## 🧪 Testing Different Cargo Types

Book multiple cargos with different types to see variety:

1. **Fragile Cargo**:
   - Type: Fragile
   - Weight: 5 kg
   - Origin: Paris, France
   - Destination: Rome, Italy

2. **Perishable Cargo**:
   - Type: Perishable
   - Weight: 100 kg
   - Origin: Miami, USA
   - Destination: San Juan, Puerto Rico

3. **Electronics**:
   - Type: Electronics
   - Weight: 15 kg
   - Origin: Seoul, South Korea
   - Destination: San Francisco, USA

---

## 🔐 Testing Admin Features (Optional)

To test admin features, you need to create an admin user via the API:

### Using the Init Script:
```bash
cd /Users/maintenance/Documents/goFright
node scripts/init-db.js
```

This creates:
- **Admin User**:
  - Email: admin@gofright.com
  - Password: admin123

### Login as Admin:
1. Logout of your customer account
2. Login with: admin@gofright.com / admin123
3. You'll see additional menu items:
   - **Admin Panel**
   - **Reports**

---

## 📱 Testing Responsive Design

Test on different screen sizes:
1. Open Chrome DevTools (F12)
2. Click the device toolbar icon (Ctrl+Shift+M)
3. Try these viewports:
   - iPhone 12 Pro (390×844)
   - iPad Air (820×1180)
   - Desktop (1920×1080)

All pages should adapt beautifully!

---

## 🎨 Visual Features to Notice

### Color-Coded Status Badges
Each status has a unique color:
- 🔵 Booked - Blue
- 🟡 Pending Pickup - Yellow
- 🟣 In Transit - Purple
- 🔵 Out for Delivery - Indigo
- 🟢 Delivered - Green
- 🟠 Delayed - Orange
- 🔴 Cancelled - Red

### Icons Throughout
- 📦 Cargo/Packages
- 🚚 In Transit
- ✅ Delivered
- 📍 Location
- ⚖️ Weight
- 💰 Payment

### Gradient Backgrounds
- Landing page: Navy to Steel Blue gradient
- Cards: Subtle gradients on stat cards
- Buttons: Hover effects

---

## 🐛 Common Issues & Solutions

### Issue: "MongoDB connection failed"
**Solution**: Check your `.env` file has the correct MongoDB Atlas connection string

### Issue: "User not found" after login
**Solution**: Register a new account or check if the email is correct

### Issue: Page not loading
**Solution**: Ensure dev server is running (`bun run dev`)

### Issue: Components not styled
**Solution**: Check if TailwindCSS is working (inspect element in browser)

---

## 📊 What to Test

### ✅ Core Functionality
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard loads with stats
- [ ] Cargo booking creates new shipment
- [ ] Cargo list displays all cargo
- [ ] Search and filters work
- [ ] Public tracking works without login
- [ ] Logout clears session

### ✅ UI/UX
- [ ] All pages are styled correctly
- [ ] Navigation menu works
- [ ] Buttons have hover effects
- [ ] Forms validate inputs
- [ ] Error messages display properly
- [ ] Success messages show
- [ ] Loading states appear during async operations
- [ ] Empty states show appropriate CTAs

### ✅ Responsive Design
- [ ] Mobile view (< 640px) works
- [ ] Tablet view (640px - 1024px) works
- [ ] Desktop view (> 1024px) works
- [ ] Navigation adapts to screen size
- [ ] Forms are usable on mobile

---

## 🎉 Success Criteria

You've successfully tested the app when:
1. ✅ You can register and login
2. ✅ You can book a cargo shipment
3. ✅ You can see your cargo in the list
4. ✅ You can view cargo details with tracking timeline
5. ✅ You can track shipments publicly without login
6. ✅ All pages load without errors
7. ✅ The design looks professional and modern
8. ✅ The app is responsive on all devices

---

## 🚀 Next Steps

After testing:
1. **Create more test data**: Book multiple shipments
2. **Test edge cases**: Try empty fields, invalid data
3. **Check API endpoints**: Use the test script in `scripts/test-api.sh`
4. **Deploy to production**: When ready, deploy to Vercel/Netlify
5. **Add real SMTP credentials**: For email notifications
6. **Implement admin features**: User management, reports

---

## 📞 Need Help?

- Check the main README: `README.md`
- API documentation: `DOCS.md`
- Frontend overview: `FRONTEND_COMPLETION.md`
- Project summary: `PROJECT_SUMMARY.md`

Happy testing! 🎉📦
