<div align="center">

# Alma Fitness

**Online store for a fitness apparel brand, with customer accounts and an admin panel.**

🇧🇷 [Leia em português](README.pt-BR.md)

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white) ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white) ![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)

</div>

## About

Full-stack Next.js storefront. Customers browse the catalog, create an account and place orders; the store owner manages products (with image upload) and follows orders in a protected admin area.

## Features

- Product catalog and order placement
- Customer sign-up, login and account page with structured address
- Admin: product CRUD, image upload, order list and order detail
- Login rate limiting persisted in MySQL

## Tech stack

| Layer | Technology |
|---|---|
| App | Next.js 16 (App Router + Route Handlers), React 19, TypeScript |
| UI | Tailwind CSS 4, shadcn/ui (Base UI) |
| Data | MySQL + Prisma 7 (`@prisma/adapter-mariadb`) |
| Auth | JWT (`jose`) in httpOnly cookies, `bcryptjs` |

## Security

- Separate sessions for customers and admin, both in httpOnly cookies
- Admin credentials compared in constant time (`timingSafeEqual`)
- Rate limiting on login stored in the database (`RateLimitAttempt`)

## Getting started

**Prerequisites:** Node.js 20+, MySQL 8

```bash
npm install        # postinstall runs prisma generate
# create .env with the variables below
npx prisma migrate deploy
npm run dev        # http://localhost:3000
```

### Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | MySQL connection string |
| `SESSION_SECRET` | Secret used to sign session tokens |
| `ADMIN_USERNAME / ADMIN_PASSWORD` | Admin panel credentials |

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Apply migrations and build for production |
| `npm start` | Production server |

## Team

- [Vinicius do Valle](https://github.com/vallevinicius)
