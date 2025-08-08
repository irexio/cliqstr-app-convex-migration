# Deprecation Notice — Parents HQ & Invite legacy routes

**Date:** August 8, 2025  
**Owner:** Robyn

## What changed
We consolidated Parents HQ to **/parents/hq** and invite entry to **/invite/accept?code=…**.  
Old pages now redirect; old parent-approval APIs return 410.

## Why we keep legacy stubs
- Avoid breaking old bookmarks.
- Provide quick rollback if needed.

## Rollback (kill switch)
Set env: `USE_LEGACY_PARENTS_HQ=true`.  
If legacy files exist under `legacy/parents-hq-invites/`, stubs will attempt to render them.  
If not present, stubs continue redirecting / returning 410.

## Removal plan
- Monitor `[DEPRECATED_*]` logs weekly.
- When stubs see **0 hits for 7 days**, remove legacy folder + stubs.
