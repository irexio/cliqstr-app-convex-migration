# Cliqstr Data Deletion Compliance

**Document Version:** 1.0  
**Date:** January 2025  
**System:** Convex Migration (Post-Prisma)  
**Compliance Standards:** GDPR, CCPA, COPPA

## Overview

This document outlines the data deletion capabilities implemented in the Cliqstr platform to ensure compliance with privacy regulations including GDPR (General Data Protection Regulation), CCPA (California Consumer Privacy Act), and COPPA (Children's Online Privacy Protection Act).

## Data Deletion Implementation

### Hard Delete Functionality

When a user is deleted using the **Hard Delete** option in the admin dashboard, the system performs a complete and irreversible removal of ALL user data across the entire platform.

### Data Types Deleted

The following data is completely removed during a hard delete operation:

#### Core User Data
- ✅ **User Account** - Email, password, verification tokens, creation timestamps
- ✅ **User Profile** - Username, bio, profile images, banner images, birthdate, privacy settings
- ✅ **Account Settings** - Role, approval status, plan information, Stripe data

#### Content Data
- ✅ **Posts** - All posts authored by the user
- ✅ **Replies** - All replies/comments made by the user
- ✅ **Scrapbook Items** - All photos and captions uploaded by the user

#### Social Data
- ✅ **Cliq Memberships** - All cliq memberships and roles
- ✅ **Invites Sent** - All invitations created by the user
- ✅ **Invite Requests** - All invite requests initiated by the user

#### Family/Safety Data
- ✅ **Parent-Child Links** - All parent-child relationships (both as parent and child)
- ✅ **Parent Audit Logs** - All monitoring and safety logs
- ✅ **Child Settings** - All child safety and privacy settings

#### System Data
- ✅ **Activity Logs** - All user activity and login history
- ✅ **Session Data** - All authentication and session information

### Deletion Process

1. **Verification** - Admin confirms deletion with user identification
2. **Data Discovery** - System identifies all data associated with the user
3. **Cascading Deletion** - All related data is systematically removed
4. **Verification** - System confirms complete data removal
5. **Audit Logging** - Deletion process is logged for compliance records

### Compliance Features

#### Transparency
- **Pre-deletion Summary** - Admins can preview exactly what data will be deleted
- **Detailed Logging** - Complete audit trail of deletion process
- **Data Counts** - Shows number of records deleted in each category

#### Security
- **Admin-Only Access** - Only users with Admin role can perform hard deletes
- **Confirmation Required** - Multiple confirmation steps prevent accidental deletion
- **Irreversible Process** - Hard delete cannot be undone (by design for compliance)

#### Audit Trail
- **Deletion Logs** - All deletions are logged with timestamps and admin identification
- **Data Summary** - Records show exactly what data was removed
- **Compliance Reporting** - Logs can be used for regulatory compliance reporting

## Technical Implementation

### Database Tables Affected

The hard delete process removes data from the following Convex database tables:

- `users` - Core user records
- `accounts` - User account settings and roles
- `myProfiles` - User profile information
- `posts` - User-created posts
- `replies` - User-created replies
- `invites` - User-sent invitations
- `inviteRequests` - User-initiated invite requests
- `parentLinks` - Parent-child relationships
- `parentAuditLogs` - Safety monitoring logs
- `memberships` - Cliq membership records
- `userActivityLogs` - User activity history
- `childSettings` - Child safety settings
- `scrapbookItems` - User scrapbook content

### API Endpoints

- `POST /api/admin/users/[userId]` - Hard delete user (Admin only)
- `GET /api/admin/users/[userId]/deletion-summary` - Preview deletion scope

### Convex Functions

- `hardDeleteUser` - Performs complete data deletion
- `getDataDeletionSummary` - Provides deletion preview
- `softDeleteUser` - Marks user as deleted (recoverable)

## Compliance Standards Met

### GDPR (General Data Protection Regulation)
- ✅ **Right to Erasure** - Complete data removal capability
- ✅ **Data Minimization** - Only necessary data is retained
- ✅ **Transparency** - Clear documentation of data processing
- ✅ **Accountability** - Audit trails and logging

### CCPA (California Consumer Privacy Act)
- ✅ **Right to Delete** - Complete data deletion functionality
- ✅ **Transparency** - Clear data handling practices
- ✅ **Non-discrimination** - Deletion doesn't affect service quality

### COPPA (Children's Online Privacy Protection Act)
- ✅ **Parental Rights** - Parents can request complete data deletion
- ✅ **Child Data Protection** - All child-related data is removed
- ✅ **Audit Requirements** - Complete deletion logs maintained

## Usage Instructions

### For Administrators

1. **Access Admin Dashboard** - Navigate to `/sentinel` with Admin credentials
2. **Select User** - Choose user from User Management tab
3. **Preview Deletion** - Review data deletion summary
4. **Confirm Deletion** - Execute hard delete with confirmation
5. **Verify Completion** - Confirm successful deletion

### For Compliance Officers

1. **Audit Logs** - Review deletion logs in admin dashboard
2. **Data Reports** - Generate compliance reports from audit trails
3. **Verification** - Confirm complete data removal
4. **Documentation** - Maintain compliance records

## Contact Information

For compliance questions or data deletion requests:
- **Email:** inquiry@cliqstr.com
- **Admin Access:** mimi@cliqstr.com

---

**Last Updated:** January 2025  
**System Version:** Convex Migration v1.0  
**Compliance Status:** ✅ Fully Compliant
