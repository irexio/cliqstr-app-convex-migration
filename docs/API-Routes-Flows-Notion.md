# Cliqstr API Routes and Flow Documentation

*This file is formatted for Notion import. Last updated: 2025-07-20T17:02:25.296Z*

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
10acb30 - Fix email subject line: use username instead of user ID for inviter name (14 hours ago)
708a072 - Fix infinite loading on invite accept page - add timeout and comprehensive error handling (14 hours ago)
064c78d - Force fresh deployment to clear API route caching (15 hours ago)
3c80483 - Fix invite creation API to properly select database fields (16 hours ago)
cec1a28 - Fix invite validation API to select required database fields (19 hours ago)
3883c50 - Clean up console.log statements in my-cliqs-dashboard (22 hours ago)
82c90bc - Fix LoadingSpinner import paths in invite pages (22 hours ago)
6f554b3 - Fix 'use client' directive placement - must be first line in file (23 hours ago)
7a56274 - Fix build errors: Add dynamic exports, fix useSession destructuring, wrap useSearchParams in Suspense (23 hours ago)
22dc916 - Fix deployment errors: Remove conflicting route file and fix auth imports (23 hours ago)
```
