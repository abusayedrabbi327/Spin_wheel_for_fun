# 🎡 Spin Wheel

A modern, interactive Spin Wheel SaaS application built with React and Vite. Create customizable spin wheels for giveaways, decisions, team activities, and more!

![React](https://img.shields.io/badge/React-18.3.1-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-6.3.5-purple?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-cyan?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-7.4-green?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue?logo=postgresql)

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
- **Prisma ORM** - Database abstraction
- **Neon PostgreSQL** - Serverless database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## 📁 Project Structure

```
├── api/                    # Vercel serverless API routes
│   ├── _lib/              # Shared utilities
│   │   ├── auth.ts        # JWT authentication
│   │   ├── prisma.ts      # Database client
│   │   └── utils.ts       # Helper functions
│   ├── admin/             # Admin endpoints
│   ├── auth/              # Authentication endpoints
│   ├── spins/             # Spin tracking
│   └── wheels/            # Wheel CRUD operations
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeding
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
- Neon PostgreSQL account (free tier available)

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
   # Database (get from https://console.neon.tech)
   DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
   DIRECT_URL="postgresql://user:password@host/database?sslmode=require"
   
   # JWT Secret (generate a random 32+ character string)
   JWT_SECRET="your-secret-key-here"
   
   # Admin credentials for seeding
   ADMIN_EMAIL="your-admin-email@example.com"
   ADMIN_PASSWORD="your-secure-password"
   ```

4. **Set up the database**
   ```bash
   # Push schema to database
   npx prisma db push
   
   # Generate Prisma client
   npx prisma generate
   
   # Seed admin user
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
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with initial data |
| `npm run db:studio` | Open Prisma Studio |

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
   - `DATABASE_URL`
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

This project is proprietary software. All rights reserved.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a pull request.

## 📧 Support

For support, open an issue on GitHub.

---

Made with ❤️ by Digital Salami Team