# Parent Invite Controls - Implementation Requirements

## Current State
The Parents HQ allows parents to:
- Enable/disable child's ability to send invites (`canSendInvites`)
- Toggle whether invites require approval (`inviteRequiresApproval`)

## Missing Features

### 1. Granular Invite Controls
Parents should be able to separately control:
- **Child → Adult invites** (higher risk, should default to requiring approval)
- **Child → Child invites** (moderate risk, parent preference)
- **Block all invites** (already exists as `canSendInvites = false`)

### 2. Pre-Approval Flow
When `inviteRequiresApproval = true`:
- Create an `InviteRequest` instead of direct `Invite`
- Notify parent via email/SMS
- Parent approval page to review and approve/deny
- Only create actual invite after approval

### 3. Parent Notification System
- Email notifications when child attempts to send invite
- Dashboard showing pending invite requests
- Quick approve/deny actions

## Recommended Schema Changes

```prisma
model ChildSettings {
  // Existing fields...
  
  // New granular controls
  canInviteAdults          Boolean   @default(false)
  canInviteChildren        Boolean   @default(false)
  adultInviteRequiresApproval    Boolean   @default(true)
  childInviteRequiresApproval    Boolean   @default(true)
}

model InviteRequest {
  id                String   @id @default(cuid())
  childId           String
  cliqId            String
  inviteType        String   // 'adult' or 'child'
  recipientEmail    String?
  friendFirstName   String?
  inviteNote        String?
  status            String   @default('pending') // pending, approved, denied
  createdAt         DateTime @default(now())
  reviewedAt        DateTime?
  reviewedBy        String?
  
  child             User     @relation(fields: [childId], references: [id])
  cliq              Cliq     @relation(fields: [cliqId], references: [id])
  reviewer          User?    @relation(fields: [reviewedBy], references: [id])
}
```

## Implementation Steps

1. **Update Parents HQ UI**:
   - Add separate toggles for adult/child invite permissions
   - Add section for reviewing pending invite requests

2. **Update Invite Creation Flow**:
   - Check granular permissions based on invite type
   - Create InviteRequest when approval needed
   - Send parent notification

3. **Create Parent Approval Flow**:
   - New API endpoint: `/api/parent/invite-requests`
   - Approval page/modal in Parents HQ
   - Convert approved requests to actual invites

4. **Update Invite Pages**:
   - Check parent preferences before allowing invite creation
   - Show appropriate messaging when invites are blocked
   - Handle pending approval state

## Security Considerations
- Always default to most restrictive settings for new child accounts
- Require parent authentication for all approval actions
- Log all invite attempts and approvals for audit trail
- Consider rate limiting child invite attempts