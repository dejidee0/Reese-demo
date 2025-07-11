# ReeseBlanks – The Luxe Vanguard of Streetwear Culture

## 🧭 Overview
ReeseBlanks is a full-stack, mobile-first, high-end streetwear ecommerce platform built with:

- **Next.js + Tailwind + Shadcn + Framer Motion**
- **Supabase (Auth, Storage, Realtime)**
- **Zustand for state**
- **Paystack integration**
- **OpenAI (AI stylist + captions)**

## 🚀 Features
- Live product drops w/ countdown
- Product hover preview + model video
- Full cart + checkout
- Admin tools for inventory & sales tracking
- Community styling arena & battles
- AI-powered stylist for outfit suggestions
- Tiered user system + referral access
- NFT pass simulation + embedded streams

## 🛠 Getting Started

```bash
git clone https://github.com/your-username/reese-blanks.git
cd reese-blanks
npm install
```

### 🔑 Environment Setup

Create `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...
```

### 🧪 Run Dev Server

```bash
npm run dev
```

## ✨ Deployment
Push to **Vercel** for frontend.
Ensure **Supabase** project is configured with:
- Auth (email/password only)
- Storage: products bucket
- Tables created via SQL (included in /sql/init.sql)

## 🎯 Performance Notes

- Lazy load all images and videos
- Use dynamic imports where appropriate
- Compress images for performance
- Animate on scroll only when in viewport
- Optimize cart/store and styling AI calls