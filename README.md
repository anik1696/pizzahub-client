# PizzaHub — Pizza Ordering & Delivery Platform

Next.js 16 frontend for PizzaHub — a full-stack pizza ordering and delivery platform built for Bangladesh.

## Live Site

**Client:** https://pizzahub-client-sable.vercel.app  
**Server:** https://pizzahub-server-pthr.onrender.com

## GitHub Repositories

- **Client:** https://github.com/anik1696/pizzahub-client
- **Server:** https://github.com/anik1696/pizzahub-server

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- Tailwind CSS v4 + shadcn/ui
- Framer Motion
- Better Auth (email + Google OAuth)
- Stripe (vendor subscription checkout)
- ImgBB (image uploads)

## Quick Start

```bash
npm install
cp .env.example .env.local
# Fill in your environment variables
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Express backend URL (https://pizzahub-server-pthr.onrender.com) |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | This app's URL (https://pizzahub-client-sable.vercel.app) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `BETTER_AUTH_SECRET` | Secret for Better Auth session signing |
| `BETTER_AUTH_URL` | Same as `NEXT_PUBLIC_BETTER_AUTH_URL` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `JWT_SECRET` | JWT signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `NEXT_PUBLIC_IMGBB_API_KEY` | ImgBB API key for image uploads |

## Admin Credentials

```
Email:    admin@pizzahub.com
Password: Admin@1234
```

## Features

- Browse menu by category with search and filters
- Place orders with Cash on Delivery
- Customer dashboard with order history and analytics
- Vendor dashboard — add/manage menu items, track orders
- Admin panel — approve items, manage users, view transactions
- Customer reviews and star ratings (verified purchase only)
- Dark / Light mode toggle
- Vendor premium subscription via Stripe

## Roles

| Role | Access |
|------|--------|
| Customer | Browse, order, review |
| Vendor | Add items (3 free, unlimited premium), manage orders |
| Admin | Full access — users, menu approval, transactions |
