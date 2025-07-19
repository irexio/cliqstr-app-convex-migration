# Cliqstr API Routes and Flow Documentation

*This file is formatted for Notion import. Last updated: 2025-07-19T17:45:48.444Z*

## How to Use This Documentation in Notion

1. Import the CSV files into Notion:
   - `API-Routes-Notion.csv` - Contains all API endpoints
   - `Page-Flows-Notion.csv` - Contains all page flows

2. After importing, convert each table to a database
3. For API Routes, add filters and views:
   - Filter by Tags (APA-Hardened, Auth-Required, etc.)
   - Group by HTTP Methods
   - Sort by Route

4. For Page Flows, add filters and views:
   - Filter by Has Auth Check
   - Filter by Dynamic Rendering
   - Group by Redirects To

## Recent Changes

```
e2f76d2 - Implement redesigned invite system with separate landing pages for adult and parent approval invites (7 minutes ago)
a19202f - Trigger Vercel redeploy (24 hours ago)
cc55fd1 - Fix invite email subject line and invite link issues (24 hours ago)
ce782b4 - Fix invite email sending and allow resending to existing invites for testing (25 hours ago)
d2276e3 - Fix invite creation by using correct Prisma schema structure (25 hours ago)
3203132 - Fix invite API and improve member management with better error handling and feedback (25 hours ago)
f7a6377 - Update My Cliqs Dashboard to match design with responsive grid layout and CliqCard component (26 hours ago)
a6dd05f - fix: prevent plan banner from showing on dashboard and improve plan selection flow (26 hours ago)
1fcf832 - fix: add PlanBanner component and fix plan selection page (26 hours ago)
36ae504 - fix: ensure plans display on choose-plan page (26 hours ago)
```
