# HZA Store — Production Ecommerce App

A full-featured ecommerce application built with **Next.js 15 App Router**, **Supabase**, **TailwindCSS v4**, and **TypeScript**.

---

## Features

### Store (Customer-facing)
- Product catalog with categories, search, and filtering
- Product detail pages with images
- Shopping cart (Zustand + localStorage persistence)
- Checkout with city-based delivery charges
- Order placement and tracking
- User authentication (signup, login, forgot/reset password)
- Account page with order history

### Admin Panel (`/admin`)
- Dashboard with total revenue, orders, recent activity, low-stock alerts
- Product management (create, edit, delete, image upload)
- Category management with image upload
- Order management with status updates and tracking numbers
- Customer management (view, block/unblock)
- Delivery charges by city
...

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| Next.js 15 (App Router) | Full-stack framework, Server Actions |
| TypeScript | Type safety |
| Supabase | PostgreSQL DB + Auth + Storage |
| TailwindCSS v4 | Styling |
| Zustand 5 | Client state (cart, auth) |
| Zod + React Hook Form | Form validation |
| Sonner | Toast notifications |
| Lucide React | Icons |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Create three Storage buckets in **Storage**:
   - `products` (public)
   - `categories` (public)
   - `avatars` (public)

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

NEXT_PUBLIC_SITE_NAME=HZA Store
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

You can find your Supabase keys in **Project Settings → API**.

### 4. Set up admin user

After signing up with your email:
1. Go to Supabase **Table Editor → profiles**
2. Find your record and set `is_admin = true`

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the store.  
Open [http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel.

---

## Project Structure

```
src/
├── app/
│   ├── (store)/          # Customer-facing pages
│   ├── (auth)/           # Login, signup, password reset
│   └── admin/            # Admin panel pages
├── components/
│   ├── ui/               # Reusable UI components (Button, Badge, etc.)
│   ├── layout/           # Header, Footer, AdminSidebar
│   └── store/            # Store-specific components (ProductCard, etc.)
├── services/             # Server Actions / API logic
├── repositories/         # Supabase query layer
├── store/                # Zustand stores (cart, auth)
├── lib/
│   ├── supabase/         # Supabase client setup
│   ├── validations/      # Zod schemas
│   ├── utils.ts          # Utility functions
│   └── constants.ts      # App constants
└── types/                # TypeScript types
```

---

## Available Scripts

```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run type-check # Run TypeScript check
```

---

## Storage Bucket Policies

In Supabase Storage, for each public bucket (`products`, `categories`, `avatars`) add RLS policies to allow public reads and authenticated uploads:

- **SELECT (read):** Allow for `public` role
- **INSERT (upload):** Allow for `authenticated` role

