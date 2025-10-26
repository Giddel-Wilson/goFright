# 🚀 GoFright Quick Start Guide

Get the GoFright cargo management system up and running in minutes!

---

## 📋 Prerequisites

Before you begin, ensure you have:
- **Node.js** (v18 or higher)
- **Bun** runtime installed
- **MongoDB Atlas** account (or local MongoDB)
- **Google Maps API** key (for tracking features)

---

## ⚙️ Setup Steps

### 1. Install Dependencies

```bash
cd /Users/maintenance/Documents/goFright
bun install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit the `.env` file and add your credentials:

```env
# MongoDB (REQUIRED)
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/
MONGO_DB_NAME=goFright

# JWT Secret (REQUIRED)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters

# Google Maps API (REQUIRED for tracking)
PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Environment
NODE_ENV=development
```

#### Getting Your Google Maps API Key:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **"Maps JavaScript API"**
4. Go to **Credentials** → Create API Key
5. Copy the key to your `.env` file

#### Getting Your MongoDB URI:
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster (M0)
3. Create a database user
4. Get connection string: **Connect** → **Drivers**
5. Replace `<password>` with your user password
6. Copy to your `.env` file

### 3. Seed Initial Data (Optional)

Create a test admin user:

```bash
bun run seed
```

Or manually register through the UI after starting the server.

### 4. Start Development Server

```bash
bun run dev
```

The application will be available at: **http://localhost:5173**

---

## 👥 Default User Accounts

After seeding or manual registration, you can create users with these roles:

### Admin
- **Email:** admin@gofright.com
- **Password:** admin123
- **Access:** Full system management

### Freight Officer
- **Email:** officer@gofright.com
- **Password:** officer123
- **Access:** Shipment operations

### Customer
- **Email:** customer@gofright.com
- **Password:** customer123
- **Access:** Cargo booking and tracking

---

## 🎯 Testing the Application

### 1. Register/Login
Visit http://localhost:5173/login and:
- Register a new account
- Or login with seeded credentials

### 2. Admin Dashboard
**URL:** http://localhost:5173/admin

**Test Features:**
- View dashboard statistics
- Create and manage packages
- Create and manage users
- View analytics and reports
- Configure system settings
- Update profile and upload photo

### 3. Freight Officer Dashboard
**URL:** http://localhost:5173/freight-officer

**Test Features:**
- View today's tasks and active shipments
- Create new shipment (generates tracking number)
- Track shipments on Google Maps
- Generate delivery reports
- Update profile

### 4. Customer Dashboard
**URL:** http://localhost:5173/customer

**Test Features:**
- Book new cargo (5-step form)
- View all shipments
- Track cargo on map
- View invoices
- Manage profile

---

## 🗂️ Project Structure

```
goFright/
├── src/
│   ├── lib/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── NotificationModal.svelte
│   │   │   └── ConfirmModal.svelte
│   │   ├── server/
│   │   │   ├── auth/           # Authentication utilities
│   │   │   ├── db/             # Database models
│   │   │   │   ├── models/
│   │   │   │   │   ├── User.ts
│   │   │   │   │   ├── Cargo.ts
│   │   │   │   │   └── Settings.ts
│   │   │   │   └── connection.ts
│   │   │   └── utils/          # Helper functions
│   │   └── stores/
│   │       └── auth.ts         # Auth state management
│   │
│   ├── routes/
│   │   ├── (admin)/            # Admin dashboard (blue theme)
│   │   │   ├── +layout.svelte
│   │   │   └── admin/
│   │   │       ├── +page.svelte              # Dashboard
│   │   │       ├── packages/+page.svelte     # Package management
│   │   │       ├── users/+page.svelte        # User management
│   │   │       ├── reports/+page.svelte      # Analytics
│   │   │       ├── settings/+page.svelte     # System settings
│   │   │       └── profile/+page.svelte      # Admin profile
│   │   │
│   │   ├── (freight-officer)/  # Freight Officer (green theme)
│   │   │   ├── +layout.svelte
│   │   │   └── freight-officer/
│   │   │       ├── +page.svelte              # Dashboard
│   │   │       ├── shipments/+page.svelte    # Shipment management
│   │   │       ├── tracking/+page.svelte     # Live tracking
│   │   │       ├── reports/+page.svelte      # Reports
│   │   │       └── profile/+page.svelte      # Profile
│   │   │
│   │   ├── (customer)/         # Customer portal (orange theme)
│   │   │   ├── +layout.svelte
│   │   │   └── customer/
│   │   │       ├── +page.svelte              # Dashboard
│   │   │       ├── book/+page.svelte         # Book cargo
│   │   │       ├── shipments/+page.svelte    # My shipments
│   │   │       ├── track/+page.svelte        # Track cargo
│   │   │       ├── invoices/+page.svelte     # Invoices
│   │   │       └── profile/+page.svelte      # Profile
│   │   │
│   │   ├── api/                # API endpoints
│   │   │   ├── auth/           # Authentication
│   │   │   ├── admin/          # Admin APIs
│   │   │   ├── freight-officer/# Freight Officer APIs
│   │   │   └── customer/       # Customer APIs
│   │   │
│   │   └── login/              # Public login page
│   │       └── +page.svelte
│   │
│   ├── app.html                # HTML template
│   └── app.css                 # Global styles
│
├── static/
│   └── uploads/
│       └── profiles/           # Profile photos
│
├── .env.example                # Environment template
├── PROGRESS.md                 # Development tracker
├── COMPLETION_SUMMARY.md       # What's done
└── QUICK_START.md             # This file
```

---

## 🔧 Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"
**Solution:** Check your `MONGODB_URI` in `.env` file:
- Ensure password doesn't have special characters
- Whitelist your IP in MongoDB Atlas
- Test connection string in MongoDB Compass

### Issue: "Google Maps not loading"
**Solution:** 
- Verify `PUBLIC_GOOGLE_MAPS_API_KEY` in `.env`
- Check API key has "Maps JavaScript API" enabled
- Ensure billing is enabled in Google Cloud (required even for free tier)

### Issue: "Profile photo not uploading"
**Solution:**
- Check `static/uploads/profiles/` directory exists
- Verify write permissions on the directory
- Try: `mkdir -p static/uploads/profiles`

### Issue: "Authentication not working"
**Solution:**
- Clear browser cookies
- Check `JWT_SECRET` is set in `.env`
- Verify MongoDB is connected
- Try registering a new user

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Admin (41 total endpoints)
- Dashboard, Packages, Users, Analytics, Settings, Profile

### Freight Officer (12 endpoints)
- Dashboard, Shipments, Tracking, Reports, Profile

### Customer (13 endpoints)
- Dashboard, Bookings, Tracking, Invoices, Profile

**Full API documentation:** See `PROGRESS.md` for complete endpoint list

---

## 🎯 Next Steps

### After Setup
1. ✅ Register test users for each role
2. ✅ Create sample shipments as Freight Officer
3. ✅ Book cargo as Customer
4. ✅ Track shipments on map
5. ✅ Test all CRUD operations

### For Production
1. [ ] Set `NODE_ENV=production` in `.env`
2. [ ] Use production MongoDB cluster
3. [ ] Generate strong JWT secret (32+ chars)
4. [ ] Restrict Google Maps API key to domain
5. [ ] Set up payment gateway (Paystack/Flutterwave)
6. [ ] Configure email/SMS notifications
7. [ ] Enable HTTPS/SSL
8. [ ] Set up backups

---

## 🆘 Getting Help

### Documentation
- **Progress Tracker:** `PROGRESS.md`
- **Completion Summary:** `COMPLETION_SUMMARY.md`
- **API Endpoints:** See `PROGRESS.md` Backend APIs section

### Testing Checklist
See `COMPLETION_SUMMARY.md` for comprehensive testing checklist

### Troubleshooting
1. Check `.env` file is properly configured
2. Verify MongoDB connection
3. Check browser console for errors
4. Review terminal logs for API errors

---

## 🎉 You're Ready!

Your GoFright cargo management system is now running. Start by registering users and testing the features!

**Happy Shipping! 🚛📦**
