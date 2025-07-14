# 🟣 Cliqstr

**Private. Joyful. Social. Safe.**  
Cliqstr is a private-first social platform built for families, kids, and communities who want connection without the noise of surveillance capitalism, ads, or unsafe algorithms.

## Project Overview

This repository contains the Cliqstr social platform codebase, built with Next.js 15 and custom APA (Aiden's Power Auth) authentication to provide APA-aligned safety and COPPA compliance for minors.

### Key Features

- **Safe Cliqs**: Private groups built around trust
- **APA-Hardened Auth**: Role-based access for kids, parents, and adults
- **Custom Feeds**: Expiring posts (90-day lifecycle)
- **Red Alert System**: Emergency escalation system tied to role, parent, and moderation logic

## Tech Stack

- **Framework**: Next.js 15 App Router
- **Database**: PostgreSQL (via Prisma on Neon)
- **Styling**: TailwindCSS + Shadcn UI
- **Authentication**: Custom APA logic (session-based)
- **Payments**: Stripe
- **Email**: Resend
- **SMS**: Twilio (in development)

## Repository Structure

- `/src` - Application source code
  - `/app` - Next.js application routes
  - `/components` - Reusable React components
  - `/lib` - Utility functions including APA logic
- `/scripts` - Utility scripts for development and maintenance
- `/prisma` - Database schema and migrations
- `/docs` - Project documentation
- `/public` - Static assets

## Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your specific configuration

# Generate Prisma client
npx prisma generate

# Run development server
npm run dev
