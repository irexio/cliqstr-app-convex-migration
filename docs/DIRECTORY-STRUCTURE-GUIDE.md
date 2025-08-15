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
- **`/account`** - Account management system (email, password, security settings)
- **`/profile`** - Social profile management (username, avatar, bio)
- **`/forgot-password`** - Password reset flow
- **`/reset-password`** - Password reset completion
- **`/verify-email`** - Email verification
- **`/verification-pending`**, **`/verification-success`**, **`/verification-error`** - Email verification states

#### Parent & Child System
- **`/parents`** - **Parents HQ with beautiful single-page design**
- **`/parent`** - Parent-specific features and signup
- **`/parent-approval`** - Child invite approval flows
- **`/child`** - Child-specific dashboard and features
- **`/child-account-created`** - Child account creation success
- **`/awaiting-approval`** - Child waiting state
- **`/verify-parent`** - Parent verification flow

#### Core Social Features
- **`/cliqs`** - Cliq (group) creation, management, and viewing
- **`/explore`** - Discover public cliqs and content
- **`/invite`** - Invitation system for joining cliqs
- **`/my-cliqs-dashboard`** - User's cliq management dashboard
- **`/replies`** - Reply management
- **`/join`** - Cliq joining flow

#### Business & Legal
- **`/pricing`** - Subscription plans and billing
- **`/choose-plan`** - Plan selection flow
- **`/verify-card`** - Payment verification
- **`/terms`**, **`/privacy`**, **`/safety`** - Legal pages
- **`/for-parents`** - Marketing page for parents
- **`/about`**, **`/features`**, **`/how-it-works`**, **`/faqs`** - Marketing pages

#### Admin & Debug
- **`/admin`** - Admin dashboard for system management
- **`/debug`** - Development debugging tools
- **`/not-authorized`** - Access denied page
- **`/suspended`** - Account suspension page
- **`/session-ping`** - Session management
- **`/test-avatar`**, **`/test-simple`**, **`/test-upload`** - Development testing pages

### `/src/app/api` - Backend API Routes
All server-side functionality organized by feature:

#### Core Authentication & User Management
- **`/api/auth`** - Authentication (sign-in, sign-up, session management, verification)
- **`/api/account`** - Account management APIs (change email, password, upgrade to parent)
- **`/api/user`** - User profile and data management
- **`/api/sign-in`**, **`/api/sign-out`**, **`/api/sign-up`** - Authentication endpoints
- **`/api/verify-email`**, **`/api/resend-verification`** - Email verification
- **`/api/reset-password`**, **`/api/send-reset-email`** - Password reset

#### Parent & Child Management
- **`/api/parent`** - Parent-specific APIs (child management, permissions, approval)
- **`/api/parent-approval`** - Child invite approval system
- **`/api/wizard`** - Parents HQ wizard steps
- **`/api/send-parent-email`** - Parent notification emails
- **`/api/get-child-info`** - Child account information

#### Social Features
- **`/api/cliqs`** - Cliq creation, management, feeds, and social features
- **`/api/posts`** - Post creation and management
- **`/api/replies`** - Reply system
- **`/api/invites`**, **`/api/invite`** - Invitation system APIs
- **`/api/accept-invite`** - Invite acceptance
- **`/api/invite-request`** - Invite request handling
- **`/api/red-alert`** - Safety alert system

#### File Management & Media
- **`/api/uploadthing`** - File upload handling (UploadThing integration)
- **`/api/profile`** - Profile image and data management
- **`/api/scrapbook`** - User gallery/scrapbook features

#### Business & Payments
- **`/api/create-checkout-session`** - Stripe checkout
- **`/api/create-setup-intent`** - Payment setup
- **`/api/webhooks`** - Payment and external service webhooks

#### Admin & Development
- **`/api/admin`** - Admin-only functionality
- **`/api/debug-uploadthing`**, **`/api/test-uploadthing`** - Development testing
- **`/api/test-email`**, **`/api/test-email-debug`** - Email testing
- **`/api/dev-reset`** - Development utilities

### `/src/components` - Reusable UI Components

#### Component Organization
- **`/Header`** - Navigation components (UserDropdown, main header, mobile menu)
- **`/parents`** - Parent-related components (ParentsHQWithSignup, ParentsHQContent, wizard modals)
- **`/cliqs`** - Cliq-related UI components (CliqCard, CliqFeed, CliqTools, CreateCliqForm, etc.)
- **`/admin`** - Admin dashboard components
- **`/ui`** - Base UI components (buttons, forms, modals, avatars, etc.)
- **`/server`** - Server-side components for data fetching
- **Root level** - Shared components including:
  - **ProfileClient.tsx** - Main profile viewing/editing component
  - **CreateProfileForm.tsx** - Profile creation form
  - **SetUpProfileClient.tsx** - Profile setup for invited users
  - **ScrapbookGallery.tsx** - User gallery component
  - **AvatarUploader.tsx**, **BannerUploader.tsx** - Image upload components
  - **PostCardBubble.tsx**, **PostForm.tsx** - Social posting components
  - **InviteClient.tsx** - Invitation handling
  - **Logo.tsx**, **Footer.tsx**, **Hero.tsx** - Layout components
  - **Pricing.tsx**, **Testimonials.tsx** - Marketing components

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

### Recent Major Features (Latest: 2025)
- **Account Management System** - Complete account settings with email, password, security
- **🎯 BEAUTIFUL SINGLE-PAGE PARENTS HQ** - **Elegant, streamlined parent experience**
  - **ParentsHQWithSignup** - Single page that adapts to show what parent needs
  - **Server-driven logic** - Intelligently detects signup → child creation → permissions → dashboard
  - **Beautiful design** - Clean gray background with white sections, professional styling
  - **Conditional sections** - Shows signup form at top when needed, then dashboard below
  - **Child creation modal** - Integrated child account setup
  - **Permission system** - Simple checkbox interface for child safety controls
- **Cliq System Enhancements**
  - **CliqFeed** - Post and reply system with beautiful card layout
  - **CliqTools** - Calendar, Games, Video Chat, Homework Help, Red Alert
  - **CliqNoticeBar** - Birthday celebrations, admin announcements, safety alerts
  - **Activity tracking** - Visit tracking and notification badges
  - **Age gating** - minAge/maxAge fields for appropriate content
- **Upload System** - UploadThing integration for avatars, banners, and media
- **Profile System** - Comprehensive social profiles with galleries
- **Session Management** - Extended 7-day sessions with proper sync
- **Invite System** - Branded cliq-xxxxx invite codes with full flow

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
