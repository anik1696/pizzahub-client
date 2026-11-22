# PizzaHub — Pizza Ordering & Delivery Platform

> Next.js 15 frontend for PizzaHub — a full-stack pizza ordering and delivery platform built for Bangladesh.

## 🍕 Live Site

[https://pizzahub.vercel.app](https://pizzahub.vercel.app) *(update after deployment)*

## ⚡ Quick Start

```bash
npm install
cp .env.example .env.local
# Fill in your environment variables
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔐 Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Express backend URL (e.g. https://pizzahub-server.onrender.com) |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | This app's URL (e.g. https://pizzahub.vercel.app) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `BETTER_AUTH_SECRET` | Secret for Better Auth session signing |
| `BETTER_AUTH_URL` | Same as `NEXT_PUBLIC_BETTER_AUTH_URL` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `JWT_SECRET` | JWT signing secret |

## 🛠️ Tech Stack

| Package | Purpose |
|---------|---------|
| `next` | React framework (App Router) |
| `better-auth` | Authentication (Google OAuth + email/password) |
| `axios` | HTTP client with interceptors |
| `framer-motion` | Page & component animations |
| `react-hot-toast` | Toast notifications |
| `next-themes` | Dark/light mode |
| `react-icons` | Icon library |
| `recharts` | Analytics charts in dashboards |
| `tailwindcss` v4 | Utility-first CSS |
| `shadcn/ui` | Accessible UI components |
| `clsx` + `tailwind-merge` | Class name utilities |

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/          # Sign in / Sign up pages
│   ├── (main)/          # Public pages (Home, Menu)
│   ├── api/             # Next.js API routes (auth, jwt)
│   ├── auth/            # OAuth callback handler
│   ├── dashboard/       # Admin, Vendor, Customer dashboards
│   ├── payment/         # Order confirmed / cancelled pages
│   └── profile/         # User profile settings
├── components/
│   ├── home/            # Homepage sections
│   ├── menu/            # Menu item card
│   ├── shared/          # Navbar, Footer, Layout
│   └── ui/              # shadcn/ui components
├── contexts/            # AuthContext, ThemeProvider
└── lib/                 # API client, auth config, utilities
```

## 👥 User Roles

| Role | Access |
|------|--------|
| **Customer** | Browse menu, place orders, track order history |
| **Vendor** | Add/manage menu items, view incoming orders |
| **Admin** | Approve menu items, manage users, view transactions |

> Admin accounts cannot self-register. Role must be assigned manually in the database.
