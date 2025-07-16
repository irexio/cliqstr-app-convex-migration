# Cliqstr API Routes and Flow Documentation

*This file is formatted for Notion import. Last updated: 2025-07-16T21:27:55.354Z*

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
d21b935 - Improve choose-plan-form mobile responsiveness and center test plan (17 minutes ago)
d453fc7 - Fix session flow to automatically redirect approved users and test plan users to dashboard (4 hours ago)
1f3736f - Temp: Show only 'Test Plan' in choose-plan form during Stripe setup freeze (5 hours ago)
c092758 - Fix session stability issues: implement hard navigations, standardize session data, loosen frontend plan validations, ensure dynamic rendering (5 hours ago)
3f328c7 - Add diagnostic session check page for debugging authentication issues (6 hours ago)
07728f2 - Fix plan redirect loop with hard reload and session refresh (6 hours ago)
c374057 - Add logging to getCurrentUser to trace session and plan data for redirect debugging (7 hours ago)
909bf43 - Fix client component directive order - move 'use client' before dynamic export (18 hours ago)
6f5837f - Fix dynamic server usage errors by restructuring imports and dynamic exports (19 hours ago)
e708f9a - Add global dynamic configuration to fix Vercel dynamic server usage errors (19 hours ago)
```
