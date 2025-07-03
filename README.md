# 🟣 Cliqstr

**Private. Joyful. Social. Safe.**  
Cliqstr is a private-first social platform built for families, kids, and communities who want connection without the noise of surveillance capitalism, ads, or unsafe algorithms.

## Project Overview

This repository contains the Cliqstr social platform codebase, built with Next.js 15 and custom APA (Aiden's Power Auth) authentication to provide COPAA-compliant safety for children.

### Key Features

- **Safe Cliqs**: Private groups built around trust
- **APA-Hardened Auth**: Built-in protections for kids, verified parents, and consent-driven access
- **Custom Feeds**: Expiring content (90-day max)
- **Red Alert System**: Built-in panic/report feature for real-time safety

## Tech Stack

- **Framework**: Next.js 15 App Router
- **Database**: PostgreSQL (via Prisma)
- **Styling**: TailwindCSS + Shadcn UI
- **Authentication**: Custom APA with age validation and parental approval
- **Payments**: Stripe

## Repository Structure

- `/src` - Application source code
  - `/app` - Next.js application routes
  - `/components` - Reusable React components
  - `/lib` - Utility functions including auth
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
```

## Documentation

For more detailed information, see the documentation files in the `/docs` directory:

- [Cliqstr Overview](./docs/Cliqstr-Overview.md)
- [Project Roadmap](./docs/TOBEADDED.md)
- [Project Structure](./docs/STRUCTURE.md)

## License

Proprietary - All Rights Reserved
