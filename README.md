# 🎡 Spin Wheel

A modern, interactive Spin Wheel SaaS application built with React and Vite. Create customizable spin wheels for giveaways, decisions, team activities, and more!

![React](https://img.shields.io/badge/React-18.3.1-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-6.3.5-purple?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-cyan?logo=tailwindcss)
![Mongoose](https://img.shields.io/badge/Mongoose-9.3-red?logo=mongodb)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)

## ✨ Features

### 🎯 Wheel Types
- **Names** - Pick random names for raffles and giveaways
- **Numbers** - Random number selection
- **Decisions** - Help make yes/no or multiple choice decisions
- **Prizes** - Giveaway wheels with customizable prizes
- **Food** - Restaurant or meal decision maker
- **Custom** - Create any type of wheel you need

### 🔐 Authentication
- User registration and login
- Role-based access control (Admin/User)
- JWT-based API authentication
- Secure password hashing

### 📊 Dashboard
- Create and manage multiple wheels
- Track spin analytics and history
- Share wheels via unique links
- Customize wheel appearance

### 🛡️ Admin Panel
- View platform analytics
- Manage users and roles
- Monitor wheel activity
- Platform-wide statistics

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TailwindCSS 4** - Utility-first CSS framework
- **Framer Motion** - Animations
- **Radix UI** - Accessible component primitives
- **React Router** - Client-side routing
- **Recharts** - Analytics charts

### Backend
- **Vercel Serverless Functions** - API routes
- **Mongoose ODM** - MongoDB object modeling
- **MongoDB** - NoSQL database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## 📁 Project Structure

```
├── api/                    # Vercel serverless API routes
│   ├── _lib/              # Shared utilities
│   │   ├── auth.ts        # JWT authentication
│   │   ├── mongodb.ts     # Database client connection
│   │   └── utils.ts       # Helper functions
│   ├── models/            # Mongoose Schemas
│   ├── admin/             # Admin endpoints
│   ├── auth/              # Authentication endpoints
│   ├── spins/             # Spin tracking
│   └── wheels/            # Wheel CRUD operations
├── scripts/
│   └── seed.ts            # Database initialization script
├── src/
│   ├── app/
│   │   ├── components/    # React components
│   │   │   ├── admin/     # Admin panel
│   │   │   ├── auth/      # Login/Register
│   │   │   ├── dashboard/ # User dashboard
│   │   │   ├── landing/   # Landing page
│   │   │   ├── spin/      # Public spin page
│   │   │   └── ui/        # Shadcn UI components
│   │   ├── api.ts         # API client
│   │   ├── auth.ts        # Auth utilities
│   │   └── routes.ts      # Route definitions
│   ├── styles/            # CSS files
│   └── main.tsx           # App entry point
├── vercel.json            # Vercel configuration
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm
- MongoDB Atlas account (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/digital-salami-wheel.git
   cd digital-salami-wheel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database Connection String
   MONGODB_URI="mongodb+srv://admin:password@cluster.mongodb.net/spinwheel"
   
   # JWT Secret (generate a random 32+ character string)
   JWT_SECRET="your-secret-key-here"
   
   # Admin credentials for seeding
   ADMIN_EMAIL="your-admin-email@example.com"
   ADMIN_PASSWORD="your-secure-password"
   ```

4. **Set up the database**
   ```bash
   # Seed database with the default admin user account
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173)

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run db:seed` | Seed database with initial admin data |

## 🌐 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Wheels
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wheels` | List user's wheels |
| POST | `/api/wheels` | Create new wheel |
| GET | `/api/wheels/[id]` | Get wheel by ID |
| PUT | `/api/wheels/[id]` | Update wheel |
| DELETE | `/api/wheels/[id]` | Delete wheel |
| GET | `/api/wheels/public/[slug]` | Get public wheel |

### Spins
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/spins` | Record a spin |
| GET | `/api/spins?wheelId=xxx` | Get spin history |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Platform statistics |
| GET | `/api/admin/users` | List all users |
| PUT | `/api/admin/users?id=xxx` | Update user role |
| DELETE | `/api/admin/users?id=xxx` | Delete user |

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import repository on [Vercel](https://vercel.com/new)
3. Add environment variables in Vercel dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
4. Deploy!

### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

## 🎨 Customization

### Brand Colors
The app uses custom "Salami" brand colors defined in the theme:
- **Primary Green**: `#0F9D58`
- **Accent Gold**: `#D4AF37`

Modify in `src/styles/theme.css` to customize.

### Wheel Themes
Each wheel type has a unique color scheme defined in:
- `src/app/components/dashboard/CreateWheel.tsx` - Creation colors
- `src/app/components/spin/PublicSpinPage.tsx` - Spin page themes

## 📄 License

**⚠️ PROPRIETARY SOFTWARE - ALL RIGHTS RESERVED**

This software is protected under a strict proprietary license. See [LICENSE](LICENSE) for full terms.

**You are NOT permitted to:**
- Download, copy, clone, or fork this repository
- Modify, adapt, or create derivative works
- Distribute, sublicense, or transfer the software
- Reverse engineer or decompile the source code
- Use for commercial purposes without authorization

**Access is ONLY permitted through the official Vercel deployment.**

Unauthorized use may result in severe civil and criminal penalties.

© 2024-2026 Abu Sayed. All Rights Reserved.

## 📧 Contact

For inquiries or authorization requests: abusayed102188@gmail.com

---

Made with ❤️ by Abu Sayed