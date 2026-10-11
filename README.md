# Kitabo — Corporate eBook Distribution Platform

A secure, multi-tenant digital eBook platform for learning organizations. Built with React 18, TypeScript, Vite, Tailwind CSS, and Supabase.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- A Supabase project (for production)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/kitabo.git
cd kitabo

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your Supabase credentials
# (Leave blank for demo mode)
```

### Development

```bash
npm run dev
```

Open http://localhost:3000

### Production Build

```bash
npm run build
```

The build output is in `dist/`. Deploy to any static hosting (Vercel, Netlify, Cloudflare Pages, etc.).

---

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for fast builds
- **Tailwind CSS v4** with custom Helix-inspired theme
- **React Router** for navigation
- **Recharts** for analytics
- **Lucide React** for icons

### Backend (Supabase)
- **PostgreSQL** database with Row Level Security (RLS)
- **Supabase Auth** for authentication
- **Supabase Storage** for private book files
- **Edge Functions** for server-side operations (code generation, fulfillment)

### Service Layer
The application uses a service abstraction (`src/services/kitabo.ts`) that:
- Uses Supabase when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured
- Falls back to **demo mode** with in-memory storage when credentials are missing
- Enforces all business rules (validation, authorization, audit logging) in both modes
- Clearly labels demo mode in the UI

**Demo Mode Limitations:**
- Data is NOT persisted across page refreshes
- Authentication is simulated (any demo email works)
- NOT suitable for production use

---

## 🔐 Authentication & Roles

### User Roles

| Role | Access |
|------|--------|
| **Super Admin** | Platform-wide management: organizations, users, orders, books, codes, reports |
| **Support Agent** | Order fulfillment, code generation, code export, operational reports |
| **Partner Admin** | Own organization: orders, classrooms, students, codes, reports |
| **Student** | Personal bookshelf, redeem codes, read books, bookmarks, progress |

### Demo Accounts

| Email | Role | Password |
|-------|------|----------|
| `admin@kitabo.io` | Super Admin | Any (demo mode) |
| `support@kitabo.io` | Support Agent | Any (demo mode) |
| `admin@stanford.edu` | Partner Admin | Any (demo mode) |
| `alice@student.edu` | Student | Any (demo mode) |

**In production**, authentication is handled by Supabase Auth with real passwords.

---

## 📊 Database Schema

The complete schema is in `supabase/migrations/001_initial_schema.sql`.

### Core Tables

- **learning_partners** — Organizations
- **profiles** — Users (extends `auth.users`)
- **books** — Book catalog with metadata
- **book_partner_approvals** — Which books are approved for which partners
- **orders** — Corporate orders from partners
- **access_code_batches** — Groups of codes generated for an order
- **access_codes** — Individual access codes (hashed)
- **book_entitlements** — Student access to books
- **registered_devices** — Device limit enforcement
- **reading_progress** — Student reading state
- **bookmarks** / **highlights** — Student annotations
- **audit_logs** — Security and operational audit trail
- **export_records** — CSV export audit

### Row Level Security (RLS)

All sensitive tables have RLS policies:
- Super admins see everything
- Partner admins see only their organization's data
- Students see only their own data
- Support agents see orders and codes within their scope

---

## 🛠️ Key Features

### Order Management
- LP admins create orders with: Order ID, Book, Quantity, Validity (30/90/180/365 days), Max Devices
- Orders flow: Draft → Submitted → Approved → Processing → Fulfilled
- Duplicate Order ID validation per partner
- Server-side authorization (partners can only create orders for their own org)

### Access Code Generation
- Cryptographically secure random codes
- Generated server-side via Supabase Edge Functions or service layer
- Idempotent fulfillment (repeated requests don't create duplicate codes)
- Atomic batch creation with database constraints
- Audit logging of all generation events

### Code Redemption
- Server-validated redemption with transactional safety
- Checks: code exists, is active, not expired, not revoked, not already redeemed
- Partner restriction enforcement
- Automatic entitlement creation with expiration
- Device limit tracking

### Secure eBook Reader
- **Print disabled**: Ctrl+P, Cmd+P, beforeprint event blocked
- **Download disabled**: Ctrl+S, Cmd+S blocked
- **Right-click disabled**: Context menu prevented
- **Copy disabled**: onCopy, onCut prevented, CSS user-select: none
- **Print CSS**: @media print hides all content
- Content delivered as rendered text (no original PDF/EPUB files exposed)
- Entitlement validation with expiration checking

### User Management (Super Admin)
- Edit user name, email, role, organization, status
- Email uniqueness validation
- Suspend/Activate/Deactivate users
- Password reset flow (via Supabase Auth in production)
- User audit history view
- Confirmation dialogs for destructive actions

### Reporting & Analytics
- Access code report: total, redeemed, available, expired, revoked, redemption rate
- Order report: all orders with codes ordered/generated/redeemed
- CSV export with audit logging and formula injection protection
- Real-time statistics from database (not hardcoded)

---

## 🚢 Deployment

### Option 1: Vercel / Netlify / Cloudflare Pages

```bash
# Build
npm run build

# Deploy dist/ folder
# Set environment variables in hosting platform:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
```

### Option 2: Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### Option 3: Self-hosted

```bash
npm run build
# Serve dist/ with any static file server
```

---

## 🔧 Supabase Setup

### 1. Create Project

Go to https://supabase.com and create a new project.

### 2. Run Migrations

Copy the contents of `supabase/migrations/001_initial_schema.sql` into the Supabase SQL Editor and run it.

### 3. Configure Auth

- Go to Authentication → Providers
- Enable Email provider
- Configure email templates (optional)
- Set site URL to your deployed frontend URL

### 4. Create First Super Admin

After deploying the frontend, sign up with your admin email. Then run in SQL Editor:

```sql
UPDATE profiles SET role = 'super_admin' WHERE email = 'your-admin-email@example.com';
```

### 5. Configure Storage (for book files)

- Go to Storage → New bucket
- Name: `books`
- Public access: **DISABLED**
- File size limit: 100MB
- Allowed MIME types: `application/pdf`, `application/epub+zip`

### 6. Get API Keys

Go to Project Settings → API and copy:
- Project URL → `VITE_SUPABASE_URL`
- anon public key → `VITE_SUPABASE_ANON_KEY`

### 7. Set Environment Variables

In your hosting platform, set:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🧪 Testing

### Manual Testing Checklist

1. **Authentication**
   - [ ] Sign in with each demo account
   - [ ] Verify role-based routing
   - [ ] Verify suspended account handling

2. **Order Workflow**
   - [ ] Partner admin creates order
   - [ ] Super admin approves order
   - [ ] Support agent fulfills order (generates codes)
   - [ ] Verify codes are generated (check quantity matches)
   - [ ] Export codes as CSV

3. **Code Redemption**
   - [ ] Student redeems a code
   - [ ] Verify book appears on bookshelf
   - [ ] Verify entitlement expiration
   - [ ] Try redeeming same code twice (should fail)

4. **Reader Security**
   - [ ] Try Ctrl+P in reader (should be blocked)
   - [ ] Try right-click (should be blocked)
   - [ ] Try selecting and copying text (should be blocked)

5. **User Management**
   - [ ] Super admin edits a user
   - [ ] Verify changes persist after refresh
   - [ ] Suspend a user and verify they can't log in

6. **Multi-tenant Isolation**
   - [ ] Partner admin can only see their own orders
   - [ ] Partner admin cannot see other partners' data
   - [ ] Student can only see their own books

---

## 🔒 Security

### Implemented

- **Row Level Security (RLS)** on all sensitive tables
- **Server-side authorization** via service layer
- **Cryptographically secure** code generation
- **Idempotent fulfillment** prevents duplicate code generation
- **Audit logging** for all privileged operations
- **Print/download protection** in reader
- **Content protection** (no original files exposed)
- **Email enumeration protection** (password reset always returns success)
- **CSV formula injection protection**

### Not Implemented (Requires Additional Setup)

- **Multi-factor authentication** (configure in Supabase Auth)
- **Rate limiting** (configure via Supabase Edge Functions or API gateway)
- **DRM** (requires licensed DRM provider)
- **Penetration testing** (requires third-party security audit)

### Known Limitations

- Browser-based device identification cannot guarantee physical-device identity
- Reader protection cannot prevent screenshots or photography
- Demo mode does not persist data (by design)

---

## 📝 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Production | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Production | Supabase anon key (public) |

**Never commit these to version control.**

---

## 📄 License

Proprietary. All rights reserved.

---

## 🤝 Contributing

1. Create a feature branch
2. Make changes
3. Run `npm run build` to verify
4. Submit a pull request

---

## 📞 Support

For issues or questions, contact your platform administrator.
