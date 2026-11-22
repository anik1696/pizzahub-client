# PizzaHub — Pizza Ordering & Delivery Platform (Client)

> Next.js 16 frontend for PizzaHub — a full-stack pizza ordering and delivery platform.

## 🍕 Live Site

[https://pizzahub.vercel.app](https://pizzahub.vercel.app) *(update after deployment)*

## ⚡ Quick Start

```bash
npm install
cp .env.local.example .env.local
# Fill in your environment variables
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔐 Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_key
```

## 🛠️ Tech Stack

| Package | Purpose |
|---------|---------|
| `next` | React framework (App Router) |
| `better-auth` | Authentication client |
| `axios` | HTTP client with interceptors |
| `framer-motion` | Page & component animations |
| `react-hot-toast` | Toast notifications |
| `next-themes` | Dark/light mode |
| `react-icons` | Icon library (react-icons/fi, gi, fa6) |
| `@stripe/stripe-js` | Stripe payment client |
| `tailwindcss` v4 | Utility-first CSS |
| `shadcn/ui` | Accessible UI components |
| `clsx` + `tailwind-merge` | Class name utilities |
| `date-fns` | Date formatting |

## 📁 Project Structure

```
src/
├── app/
│   ├── (main)/              # Public pages (Navbar + Footer)
│   │   ├── page.tsx         # Home page
│   │   └── menu/            # Browse menu + item details
│   ├── (auth)/              # Auth pages (full-screen)
│   │   ├── signin/
│   │   └── signup/
│   ├── dashboard/           # Role-based dashboards (sidebar layout)
│   │   ├── layout.tsx       # Sidebar + role guard
│   │   ├── customer/
│   │   ├── vendor/
│   │   └── admin/
│   ├── payment/             # Stripe success/cancel
│   ├── profile/             # Profile settings
│   └── not-found.tsx        # Custom 404
├── components/
│   ├── shared/              # Navbar, Footer, LoadingPage
│   ├── home/                # HomePage sections
│   └── menu/                # MenuItemCard
├── contexts/
│   ├── AuthContext.tsx      # Auth state + login/register/logout
│   └── ThemeProvider.tsx    # Dark/light mode
└── lib/
    ├── api.ts               # Axios instance with JWT interceptor
    ├── auth-client.ts       # Better Auth client
    └── utils.ts             # cn(), formatPrice(), CATEGORIES, etc.
```

## 🔑 Important Notes

- **Admin access**: Cannot be created via signup. Set `role: "admin"` in MongoDB directly.
- **Protected routes**: All `/dashboard/*` routes check authentication and role server-side via JWT.
- **Stripe**: Only used for vendor Premium subscription. Pizza ordering does NOT require payment.
- **ImgBB**: Used for menu item image uploads only. Profile images are also uploaded via ImgBB.

## 🧪 Testing

Use Stripe test card: `4242 4242 4242 4242` | Any future date | Any CVC

## 🏗️ Challenge Features

### Advanced Search & Sort
- Menu Browse page supports `search`, `category`, `location`, `sort` query params
- Sort options: `newest`, `price_asc`, `price_desc`

### Dark / Light Mode
- Toggle button in Navbar and Dashboard header
- Persisted via `next-themes` with `localStorage`
