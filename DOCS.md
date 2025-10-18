# 🚚 GoFright - Computerized Cargo Freight System

A comprehensive web-based logistics management solution that automates booking, tracking, billing, and managing freight operations. Built with SvelteKit, MongoDB, and modern web technologies.

## 🎯 Project Overview

GoFright eliminates paperwork, improves coordination between staff, and ensures real-time tracking and secure record-keeping for cargo operations. The system supports multiple user roles (Admin, Freight Officer, Customer) and handles the full cargo lifecycle.

## ✨ Features

### Core Functionality
- **User Authentication**: JWT-based secure authentication with role-based access control
- **Cargo Booking**: Automated booking with unique tracking ID generation
- **Real-time Tracking**: Track shipments with status updates and location history
- **Payment Processing**: Automated billing with PDF receipt generation
- **Notifications**: Email/SMS alerts for status changes
- **Reporting**: Automated report generation (monthly, quarterly, yearly)
- **Admin Dashboard**: User management, analytics, and system controls

### User Roles
- **Admin**: Full system access, user management, analytics, reports
- **Freight Officer**: Update cargo status, manage shipments, track deliveries
- **Customer**: Book shipments, track cargo, view payment history

## 🛠️ Tech Stack

### Frontend
- **SvelteKit** - Full-stack framework with reactive components
- **TailwindCSS** - Utility-first CSS framework
- **Shadcn-Svelte** - UI component library
- **TypeScript** - Type-safe development

### Backend
- **Node.js** - Runtime environment
- **SvelteKit API Routes** - RESTful API endpoints
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM

### Authentication & Security
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Role-based access control** - Middleware protection

### Automation & Services
- **Nodemailer** - Email notifications
- **PDFKit** - PDF receipt/report generation
- **node-cron** - Scheduled tasks
- **nanoid** - Unique ID generation

## 📁 Project Structure

```
goFright/
├── src/
│   ├── lib/
│   │   ├── server/
│   │   │   ├── auth/           # Authentication system
│   │   │   │   ├── jwt.ts      # JWT utilities
│   │   │   │   ├── middleware.ts # Auth middleware
│   │   │   │   └── index.ts
│   │   │   ├── db/             # Database layer
│   │   │   │   ├── models/     # Mongoose models
│   │   │   │   │   ├── User.ts
│   │   │   │   │   ├── Cargo.ts
│   │   │   │   │   ├── Tracking.ts
│   │   │   │   │   ├── Payment.ts
│   │   │   │   │   ├── Notification.ts
│   │   │   │   │   ├── Report.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts    # DB connection
│   │   │   └── services/       # Business logic
│   │   │       ├── email.ts    # Email service
│   │   │       └── pdf.ts      # PDF generation
│   │   ├── components/         # Svelte components
│   │   │   └── ui/            # Shadcn-Svelte components
│   │   └── utils.ts
│   └── routes/
│       ├── api/                # API endpoints
│       │   ├── auth/           # Authentication APIs
│       │   │   ├── register/
│       │   │   ├── login/
│       │   │   ├── logout/
│       │   │   └── me/
│       │   ├── cargo/          # Cargo management APIs
│       │   │   ├── +server.ts
│       │   │   └── [id]/
│       │   └── track/          # Public tracking API
│       │       └── [trackingId]/
│       ├── +layout.svelte
│       └── +page.svelte
├── .env.example                # Environment template
├── .env                        # Local environment (not in git)
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or bun

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd goFright
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

Required environment variables:
```env
MONGODB_URI=mongodb://localhost:27017/gofright
JWT_SECRET=your-secret-key
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

4. **Start MongoDB** (if running locally)
```bash
mongod
```

5. **Run development server**
```bash
npm run dev
```

Visit `http://localhost:5173`

## 📡 API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phone": "+1234567890",
  "address": "123 Main St"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Cargo Endpoints

#### List Cargo
```http
GET /api/cargo?status=in_transit&page=1&limit=20
Authorization: Bearer <token>
```

#### Create Cargo Booking
```http
POST /api/cargo
Authorization: Bearer <token>
Content-Type: application/json

{
  "senderName": "John Doe",
  "senderPhone": "+1234567890",
  "senderAddress": "123 Main St, City",
  "receiverName": "Jane Smith",
  "receiverPhone": "+0987654321",
  "receiverAddress": "456 Oak Ave, Town",
  "destination": "New York",
  "origin": "Los Angeles",
  "weight": 25.5,
  "cargoType": "general",
  "description": "Electronics"
}
```

#### Get Cargo Details
```http
GET /api/cargo/:id
Authorization: Bearer <token>
```

#### Update Cargo Status (Officer/Admin)
```http
PATCH /api/cargo/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in_transit",
  "location": "Chicago Hub",
  "description": "Package in transit"
}
```

### Tracking Endpoint (Public)

#### Track by Tracking ID
```http
GET /api/track/:trackingId
```

## 🗄️ Database Schema

### Collections

#### Users
- `_id`: ObjectId
- `name`: String
- `email`: String (unique)
- `password_hash`: String
- `role`: Enum (admin, freight_officer, customer)
- `phone`: String
- `address`: String
- `isActive`: Boolean
- `createdAt`, `updatedAt`: Date

#### Cargo
- `_id`: ObjectId
- `trackingId`: String (unique, auto-generated)
- `senderId`: ObjectId → User
- `senderName`, `senderPhone`, `senderAddress`: String
- `receiverName`, `receiverPhone`, `receiverAddress`: String
- `destination`, `origin`: String
- `weight`: Number
- `dimensions`: Object {length, width, height}
- `cargoType`: Enum
- `status`: Enum (booked, in_transit, delivered, etc.)
- `estimatedDelivery`, `actualDelivery`: Date
- `assignedOfficerId`: ObjectId → User
- `createdAt`, `updatedAt`: Date

#### Tracking
- `_id`: ObjectId
- `cargoId`: ObjectId → Cargo
- `status`: Enum
- `location`: String
- `description`: String
- `updatedBy`: ObjectId → User
- `timestamp`: Date
- `latitude`, `longitude`: Number

#### Payments
- `_id`: ObjectId
- `cargoId`: ObjectId → Cargo
- `userId`: ObjectId → User
- `amount`: Number
- `currency`: String
- `paymentMethod`: Enum
- `paymentStatus`: Enum
- `receiptNumber`: String (unique)
- `breakdown`: Object
- `createdAt`, `updatedAt`: Date

## 🎨 Color Palette

- **Primary**: #1B263B (Deep Navy)
- **Accent**: #3A506B (Steel Blue)
- **Secondary**: #5BC0BE (Cyan Aqua)
- **Neutral**: #F4F4F9 (Off White)

## 📝 Development Status

### ✅ Completed
- [x] Project setup and dependencies
- [x] Database models and schemas
- [x] Authentication system (JWT)
- [x] API endpoints (Auth, Cargo, Tracking)
- [x] Email service integration
- [x] PDF receipt generation
- [x] Role-based access control

### 🚧 In Progress
- [ ] UI components (Shadcn-Svelte)
- [ ] User dashboards (Admin, Officer, Customer)
- [ ] Cargo booking interface
- [ ] Payment processing UI
- [ ] Notification system
- [ ] Report generation module
- [ ] Deployment configuration

## 🔐 Security

- JWT tokens with HTTP-only cookies
- Password hashing with bcrypt (10 rounds)
- Role-based access control middleware
- Input validation with Zod
- MongoDB injection prevention via Mongoose
- HTTPS in production (Vercel)

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**
```bash
vercel
```

2. **Set environment variables** in Vercel dashboard

3. **Deploy**
```bash
vercel --prod
```

### MongoDB Atlas Setup

1. Create cluster at mongodb.com
2. Create database user
3. Whitelist IP addresses
4. Get connection string
5. Update `MONGODB_URI` in environment

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please follow the existing code style and submit PRs.

## 📧 Contact

For support or questions, contact: admin@gofright.com

---

**GoFright** - Streamlining Cargo Management 🚚✨
