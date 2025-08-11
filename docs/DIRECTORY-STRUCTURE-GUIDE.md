# 📁 Cliqstr App Directory Structure Guide

## 🏗️ Root Level Structure

### Core Configuration Files
- **`package.json`** - Dependencies, scripts, and project metadata
- **`next.config.js`** - Next.js configuration
- **`tailwind.config.js`** - Tailwind CSS styling configuration
- **`tsconfig.json`** - TypeScript compiler settings
- **`middleware.ts`** - Next.js middleware for authentication and routing

### Environment & Secrets
- **`.env.local`** - Local environment variables (database URLs, API keys)
- **`.env.example`** - Template for environment variables
- **`vercel.json`** - Deployment configuration for Vercel

## 📂 `/src` - Main Application Code

### `/src/app` - Next.js 13 App Router Pages
This follows the new Next.js App Router structure where folders = routes:

#### Authentication & User Management
- **`/sign-in`** - Login page and API routes
- **`/sign-up`** - Registration flow with email verification
- **`/auth`** - Authentication utilities and callbacks
- **`/account`** - **Account management system** (email, password, security settings)
- **`/profile`** - Social profile management (username, avatar, bio)

#### Parent & Child System
- **`/parents`** - **Parents HQ with new multi-step wizard**
- **`/parent-approval`** - Child invite approval flows
- **`/child`** - Child-specific dashboard and features
- **`/awaiting-approval`** - Child waiting state

#### Core Social Features
- **`/cliqs`** - Cliq (group) creation, management, and viewing
- **`/explore`** - Discover public cliqs and content
- **`/invite`** - Invitation system for joining cliqs
- **`/my-cliqs-dashboard`** - User's cliq management

#### Business & Legal
- **`/pricing`** - Subscription plans and billing
- **`/choose-plan`** - Plan selection flow
- **`/terms`**, **`/privacy`**, **`/safety`** - Legal pages
- **`/for-parents`** - Marketing page for parents

#### Admin & Debug
- **`/admin`** - Admin dashboard for system management
- **`/debug`** - Development debugging tools

### `/src/app/api` - Backend API Routes
All server-side functionality organized by feature:

- **`/api/auth`** - Authentication (sign-in, sign-up, session management)
- **`/api/account`** - **Account management APIs** (change email, password, upgrade to parent)
- **`/api/parent`** - Parent-specific APIs (child management, permissions)
- **`/api/cliqs`** - Cliq creation, management, and social features
- **`/api/invites`** - Invitation system APIs
- **`/api/upload`** - File upload handling
- **`/api/admin`** - Admin-only functionality

### `/src/components` - Reusable UI Components

#### Component Organization
- **`/Header`** - Navigation components (UserDropdown, main header)
- **`/parents`** - **Parent-related components** (ParentsHQWizard, ParentDashboard, wizard steps)
- **`/cliqs`** - Cliq-related UI components (creation, management, viewing)
- **`/admin`** - Admin dashboard components
- **`/ui`** - Base UI components (buttons, forms, modals)
- **Root level** - Shared components (Logo, Footer, layouts)

### `/src/lib` - Utility Libraries
- **`/auth`** - Authentication utilities and session management
- **`/prisma`** - Database connection and utilities
- **`/utils`** - General utility functions
- **`fetchJson.ts`** - API request helper

### `/src/hooks` - Custom React Hooks
- **`useSessionSync.ts`** - **Session synchronization across tabs**
- Custom hooks for common functionality

## 📂 Other Important Directories

### `/prisma` - Database Schema & Migrations
- **`schema.prisma`** - Database schema definition
- **`/migrations`** - Database migration files
- **`seed.ts`** - Database seeding scripts

### `/docs` - Documentation
- **`ACCOUNT-MANAGEMENT-SYSTEM.md`** - Account system documentation
- **`PARENTS-HQ-WIZARD.md`** - **New Parents HQ wizard documentation**
- **`PROFILE-VS-ACCOUNT.md`** - Distinction between Account and Profile
- **`DIRECTORY-STRUCTURE-GUIDE.md`** - **This guide!**
- Various other technical documentation

### `/scripts` - Utility Scripts
- **`check-admin-user.js`** - Admin user verification
- Database management and testing scripts
- Development utilities

### `/public` - Static Assets
- Images, icons, and static files served directly

## 🎯 Key Architecture Patterns

### Next.js 13 App Router Structure
```
/src/app/
├── page.tsx          # Homepage
├── layout.tsx        # Root layout
├── [feature]/
│   ├── page.tsx      # Feature page
│   └── [dynamic]/    # Dynamic routes
└── api/
    └── [endpoint]/
        └── route.ts  # API endpoint
```

### Component Organization
```
/src/components/
├── [feature]/        # Feature-specific components
├── ui/              # Base UI components
└── shared/          # Shared across features
```

## 🔍 How to Navigate the Codebase

### Finding Features
1. **Pages**: Look in `/src/app/[feature-name]/page.tsx`
2. **APIs**: Look in `/src/app/api/[feature-name]/route.ts`
3. **Components**: Look in `/src/components/[feature-name]/`
4. **Utilities**: Look in `/src/lib/[utility-name].ts`

### Understanding the Flow
1. **User visits URL** → `/src/app/[route]/page.tsx`
2. **Page needs data** → Calls `/src/app/api/[endpoint]/route.ts`
3. **API processes request** → Uses `/src/lib/` utilities
4. **Page renders UI** → Uses `/src/components/` components

### Recent Major Additions
- **Account Management System** - Complete account settings with email, password, security
- **Parents HQ Wizard** - **Multi-step parent onboarding with beautiful UI**
- **Session Synchronization** - Keeps auth state in sync across browser tabs

## 🛡️ Security & Compliance
- **APA Compliance** - Built into parent/child workflows
- **Session Management** - Encrypted cookies with iron-session
- **Role-Based Access** - Adult, Parent, Child, Admin roles
- **Child Safety** - Comprehensive permission system

## 🚀 Development Tips

### Adding New Features
1. Create page in `/src/app/[feature]/page.tsx`
2. Add API routes in `/src/app/api/[feature]/route.ts`
3. Build components in `/src/components/[feature]/`
4. Add utilities in `/src/lib/` if needed
5. Document in `/docs/[FEATURE-NAME].md`

### File Naming Conventions
- **Pages**: `page.tsx` (Next.js App Router requirement)
- **API Routes**: `route.ts` (Next.js App Router requirement)
- **Components**: `PascalCase.tsx`
- **Utilities**: `camelCase.ts`
- **Documentation**: `UPPERCASE-WITH-HYPHENS.md`

This structure follows modern Next.js best practices with clear separation of concerns, making it easy to navigate and maintain the codebase while ensuring scalability and security.
