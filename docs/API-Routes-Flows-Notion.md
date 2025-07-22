# Cliqstr API Routes and Flow Documentation

*This file is formatted for Notion import. Last updated: 2025-07-22T16:52:28.887Z*

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
7ab557e - Add robust error handling to sign-up API route (3 hours ago)
eed973e - Fix sign-up error handling for adult verification flow (3 hours ago)
fd6e837 - Implement blocking email verification flow for adult users (13 hours ago)
19c29fc - Fix email verification flow and plan banner display (13 hours ago)
df25afc - Fix isApproved field compatibility between User and Account models (14 hours ago)
070510d - Implement APA-compliant parent credential setup flow and consolidate documentation (16 hours ago)
040501f - fix: Resolve foreign key constraint violation in parent approval (2 days ago)
4d8383b - test: Add GET handler to test parent approval API route (2 days ago)
53df548 - debug: Add detailed error logging to parent approval API (2 days ago)
27e9e93 - feat: Add firstName and lastName collection to solve parent identification issue (2 days ago)
```
