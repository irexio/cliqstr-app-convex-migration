# Cliqstr Cliq Architecture Documentation

## Overview

This document outlines the architecture, component structure, and data flow for the Cliq-related features in the Cliqstr application. It serves as a reference for future development and maintenance.

## 🔐 APA Security Model

All Cliq-related features adhere to the APA (Aiden's Power Auth) security model:

- **Session-based authentication** via HTTP-only cookies
- **Role and approval checks** for access control
- **Membership validation** for cliq access
- **Server-side validation** of all requests

## Directory Structure

```
src/
├── app/
│   ├── api/
│   │   └── cliqs/         # API routes for cliq operations
│   │       ├── [id]/      # Cliq-specific API endpoints
│   │       ├── feed.ts    # Feed data endpoint
│   │       └── ...
│   └── cliqs/             # Page routes for cliq views
│       ├── [id]/          # Individual cliq view
│       ├── create/        # Cliq creation page
│       └── ...
├── components/
│   ├── cliqs/             # Cliq-specific components
│   │   ├── CliqFeed.tsx   # Feed display component
│   │   ├── CliqTools.tsx  # Tools for cliq interaction
│   │   └── ...
│   └── PostCardBubble.tsx # Message bubble component for posts
└── lib/
    └── auth/
        └── requireCliqMembership.ts  # Membership validation helpers
```

## Cliq Creation Flow

1. **Initiation**: User navigates to `/cliqs/create`
2. **Form Submission**: User fills out cliq details and submits
3. **Validation**: Server validates input and user permissions
4. **Database Creation**: New cliq record created with initial membership
5. **Redirect**: User redirected to the new cliq page

## Cliq View Flow

1. **Request**: User navigates to `/cliqs/[id]`
2. **Authentication**: Middleware validates user session
3. **Authorization**: `requireCliqMembership` validates user is a member
4. **Data Fetching**: Server fetches cliq data and posts
5. **Rendering**: Page renders with `CliqFeed` and `CliqTools` components

## Feed Component Structure

The feed display is composed of several key components:

1. **CliqFeed.tsx**: Main container component that:
   - Fetches feed data from `/api/cliqs/feed?id=[cliqId]`
   - Manages post creation and submission
   - Renders the list of posts using PostCardBubble

2. **PostCardBubble.tsx**: Renders individual posts with:
   - Author information and avatar
   - Message content in a styled bubble
   - Timestamp
   - Emoji reaction options

3. **CliqTools.tsx**: Provides interactive tools:
   - Calendar, Games, Video, and Help buttons
   - Red Alert emergency notification feature

## Data Models

### Cliq

```typescript
interface Cliq {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  memberships: CliqMembership[];
  posts: Post[];
}
```

### Post

```typescript
interface Post {
  id: string;
  content: string;
  image?: string;
  createdAt: string;
  expiresAt?: string;
  author: User;
  replies: Reply[];
}
```

### Reply

```typescript
interface Reply {
  id: string;
  content: string;
  createdAt: string;
  author: User;
}
```

## API Endpoints

| Endpoint | Method | Description | Security |
|----------|--------|-------------|----------|
| `/api/cliqs` | GET | List user's cliqs | Session, Role |
| `/api/cliqs` | POST | Create new cliq | Session, Role |
| `/api/cliqs/[id]` | GET | Get cliq details | Session, Membership |
| `/api/cliqs/[id]` | PUT | Update cliq | Session, Membership |
| `/api/cliqs/[id]/posts` | POST | Create post | Session, Membership |
| `/api/cliqs/feed` | GET | Get cliq feed | Session, Membership |

## Security Helpers

### requireCliqMembership

```typescript
async function requireCliqMembership(userId: string, cliqId: string): Promise<boolean>
```

Enforces that a user is a member of a cliq before allowing access to cliq data.

### checkSharedCliqMembership

```typescript
async function checkSharedCliqMembership(viewerUserId: string, targetUserId: string): Promise<boolean>
```

Verifies that two users share at least one cliq for profile visibility.

## Styling Components

The feed styling relies on several key components:

1. **PostCardBubble**: Main component for message bubbles with:
   - Rounded corners and proper spacing
   - Avatar display with fallback
   - Emoji reaction options

2. **Avatar**: From UI component library for consistent user avatars

3. **Tailwind Classes**: Key classes used include:
   - `rounded-xl` for message bubbles
   - `flex gap-3 items-start` for layout
   - `shadow-sm` for subtle elevation

## Common Issues and Solutions

1. **Missing Styling**: If feed bubbles don't appear correctly, ensure:
   - PostCardBubble is properly imported
   - Types match the expected interface
   - CSS is properly loaded

2. **Oversized Icons**: For tool icons that appear too large:
   - Check icon size classes (should be w-5 h-5)
   - Verify padding and container classes

3. **Layout Wrapping**: If feed layout breaks:
   - Check max-width constraints
   - Verify flex layout classes
   - Ensure proper nesting of components

## Future Improvements

1. Implement real-time updates using WebSockets
2. Add media attachments to posts
3. Enhance emoji reactions with full picker
4. Add thread view for longer conversations
5. Implement read receipts for messages
