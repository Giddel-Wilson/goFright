# 🚚 GoFright - Computerized Cargo Freight System

> **A comprehensive web-based logistics management solution for automating freight operations**

Built with **SvelteKit**, **MongoDB**, **TypeScript**, and modern web technologies.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-2.0-orange)](https://kit.svelte.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)](https://www.mongodb.com/)

---

## 📋 Quick Links

- **[📖 Full Documentation](DOCS.md)** - Complete technical documentation
- **[🚀 Quick Start Guide](QUICKSTART.md)** - Get started in 5 minutes
- **[📊 Project Summary](PROJECT_SUMMARY.md)** - Implementation details and status

---

## ✨ Key Features

### 🔐 **Secure Authentication**
- JWT-based authentication with HTTP-only cookies
- Role-based access control (Admin, Freight Officer, Customer)
- Secure password hashing with bcrypt

### 📦 **Cargo Management**
- Automated booking with unique tracking IDs
- Real-time status updates
- Complete tracking history
- Multi-type cargo support (general, fragile, hazardous, etc.)

### 🔍 **Public Tracking**
- Track shipments without login
- View detailed status timeline
- Location updates

### 💰 **Payment Processing**
- Automated charge calculation
- PDF receipt generation
- Payment history tracking

### 📧 **Notifications**
- Email alerts on status changes
- Welcome emails for new users
- Professional HTML templates

### 📊 **Reporting** (Backend Ready)
- Monthly/quarterly/yearly reports
- Analytics and insights
- Export capabilities

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | SvelteKit + TailwindCSS | UI Framework |
| **Backend** | SvelteKit API Routes | REST API |
| **Database** | MongoDB + Mongoose | Data Storage |
| **Auth** | JWT + bcrypt | Security |
| **Services** | Nodemailer, PDFKit | Email & PDF |
| **Validation** | Zod | Input Validation |
| **Language** | TypeScript | Type Safety |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or bun

### Quick Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your configuration

# 3. Initialize database (creates admin user)
npm run db:init

# 4. Start development server
npm run dev
```

Visit **http://localhost:5173**

### Default Admin Credentials

```
Email: admin@gofright.com
Password: Admin@123456
```

⚠️ **Change these credentials after first login!**

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new customer
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Cargo Management
- `GET /api/cargo` - List cargo (filtered, paginated)
- `POST /api/cargo` - Create cargo booking
- `GET /api/cargo/[id]` - Get cargo details
- `PATCH /api/cargo/[id]` - Update cargo status (Officer/Admin)
- `DELETE /api/cargo/[id]` - Delete cargo (Admin)

### Tracking
- `GET /api/track/[trackingId]` - Track cargo (public)

See [DOCS.md](DOCS.md) for complete API documentation with examples.

---

## 🗄️ Database Models

### Collections
- **users** - User accounts and roles
- **cargo** - Shipment information
- **tracking** - Status history
- **payments** - Billing records
- **notifications** - Email/SMS queue
- **reports** - Analytics data

---

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run db:init      # Initialize database with admin user
npm run check        # TypeScript type checking
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run test         # Run tests
```

### Testing the API

```bash
# Make script executable (first time only)
chmod +x scripts/test-api.sh

# Run API tests
./scripts/test-api.sh
```

---

## 🎯 Project Status

### ✅ Completed
- [x] Complete database layer (6 models)
- [x] Authentication system (JWT, roles)
- [x] API endpoints (Auth, Cargo, Tracking)
- [x] Email service (Nodemailer)
- [x] PDF generation (Receipts)
- [x] Input validation (Zod)
- [x] Documentation

### 🚧 In Progress / Next Steps
- [ ] Frontend UI components (Shadcn-Svelte)
- [ ] User dashboards (Admin, Officer, Customer)
- [ ] Cargo booking interface
- [ ] Payment processing UI
- [ ] Report generation UI
- [ ] Deployment to Vercel

---

## 🔐 Security Features

- ✅ Password hashing (bcrypt, 10 rounds)
- ✅ JWT tokens with secure configuration
- ✅ HTTP-only cookies
- ✅ Role-based access control
- ✅ Input validation (Zod schemas)
- ✅ MongoDB injection prevention (Mongoose)
- ✅ Environment variable protection

---

## 🎨 Design System

### Color Palette
- **Primary**: `#1B263B` (Deep Navy)
- **Accent**: `#3A506B` (Steel Blue)
- **Secondary**: `#5BC0BE` (Cyan Aqua)
- **Neutral**: `#F4F4F9` (Off White)

### Typography
- **Headings**: Poppins (700)
- **Body**: Inter (400-500)
- **Buttons**: Roboto Condensed

---

## 📚 Documentation

- **[DOCS.md](DOCS.md)** - Full technical documentation
  - Complete API reference
  - Database schema details
  - Deployment instructions
  
- **[QUICKSTART.md](QUICKSTART.md)** - Quick start guide
  - Setup instructions
  - Testing guide
  - Common issues & solutions
  
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Implementation summary
  - What's been built
  - Architecture details
  - Next steps

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Environment Variables for Production

Set these in your Vercel dashboard:

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-strong-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
NODE_ENV=production
PUBLIC_APP_URL=https://your-domain.com
```

---

## 🧪 Testing

### Manual Testing with cURL

```bash
# Register user
curl -X POST http://localhost:5173/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Pass123"}'

# Login
curl -X POST http://localhost:5173/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Pass123"}'
```

### Automated Testing

```bash
# Run the test script
./scripts/test-api.sh
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 📧 Support

For support, questions, or feedback:
- Email: admin@gofright.com
- Documentation: [DOCS.md](DOCS.md)
- Issues: GitHub Issues

---

## 🎉 Acknowledgments

Built with modern web technologies:
- [SvelteKit](https://kit.svelte.dev/) - Full-stack framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Mongoose](https://mongoosejs.com/) - ODM
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [Shadcn-Svelte](https://shadcn-svelte.com/) - UI components
- [Nodemailer](https://nodemailer.com/) - Email service
- [PDFKit](https://pdfkit.org/) - PDF generation

---

**GoFright** - Streamlining Cargo Management 🚚✨

Built with ❤️ using SvelteKit and TypeScript
