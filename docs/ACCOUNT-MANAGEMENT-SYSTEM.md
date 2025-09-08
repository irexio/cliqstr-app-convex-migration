# Account Management System Documentation

## Overview

The Cliqstr account management system provides a comprehensive, user-friendly interface for managing account settings, security, and profile information. The system follows APA compliance guidelines and maintains clear separation between Account (system-level) and MyProfile (social-level) data.

---

## User Dropdown Menu Structure

### Header Location
- **Position**: Top-right corner of the header
- **Trigger**: User avatar (initials-based circle)
- **Visibility**: Always visible when user is authenticated

### Menu Sections

#### 1. **User Information Display**
```
[RO] robynpthomas
     Role: Adult
     Plan: Free (if applicable)
```
- Shows user initials in avatar
- Displays username or email
- Shows current role (Adult, Parent, Child, Admin)
- Shows current plan status (if applicable)

#### 2. **Account Management Section** (Primary)
- **Account Settings** → `/account`
  - Hub page with overview and navigation to all account functions
- **Change Email** → `/account/email`
  - Update account email address with password verification
- **Change Password** → `/account/password`
  - Change account password with strength validation
- **Billing & Plans** → `/billing` (Adults & Parents only)
  - Manage subscription and billing information
- **Security** → `/account/security`
  - Manage sessions, security settings, and recovery options

#### 3. **Social Profile Section** (Secondary)
**If MyProfile exists:**
- **View Social Profile** → `/profile/{username}`
  - View public-facing social media profile
- **Edit Social Profile** → `/profile/edit`
  - Edit social media profile information

**If MyProfile doesn't exist:**
- **Create Social Profile** → `/profile/create`
  - Create new social media profile for cliq participation

#### 4. **Role-Specific Items**
**Parents:**
- **Parent Controls** → `/parent-controls`
  - Manage children's accounts and permissions

**Admins:**
- **Sentinel Dashboard** → `/sentinel`
  - Access administrative functions

#### 5. **Account Actions** (Future Enhancement)
- **Suspend Account** (Coming Soon)
  - Temporarily disable account
- **Delete Account** (Coming Soon)
  - Permanently delete account with confirmation

#### 6. **Sign Out**
- **Sign Out** → Destroys session and redirects to home

---

## Account Management Pages

### 1. `/account` - Account Settings Hub
**Purpose**: Central dashboard for all account management functions

**Features**:
- Account overview (email, role, plan)
- Navigation cards to specialized pages
- Role-specific sections (Parent features for parents)
- Clean, organized layout with visual sections

**Access**: Adults and Parents only

### 2. `/account/email` - Change Email Address
**Purpose**: Update account email address

**Features**:
- Current email display (read-only)
- New email input with confirmation
- Password verification required
- Email validation and conflict checking
- Verification email sent to new address

**Process**:
1. User enters new email (twice for confirmation)
2. User enters current password
3. System validates password and email availability
4. Verification token generated and email sent
5. User must verify new email to complete change

### 3. `/account/password` - Change Password
**Purpose**: Update account password

**Features**:
- Current password verification
- New password with confirmation
- Real-time password strength validation
- Security requirements display

**Password Requirements**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

**Process**:
1. User enters current password
2. User enters new password (twice for confirmation)
3. System validates current password
4. System validates new password strength
5. Password updated immediately

### 4. `/account/security` - Security Settings
**Purpose**: Manage account security and sessions

**Features**:
- Account information overview
- Password management links
- Active session display
- Sign out all devices functionality
- Future: Two-factor authentication
- Future: Account recovery options

**Current Capabilities**:
- View current session information
- Sign out of all devices
- Quick access to email/password change
- Security overview and recommendations

---

## API Routes

### Authentication Required
All account management API routes require valid authentication via `getCurrentUser()`.

### 1. `POST /api/account/change-email`
**Purpose**: Process email change requests

**Request Body**:
```json
{
  "newEmail": "new@example.com",
  "password": "currentPassword"
}
```

**Response**:
- `200`: Email change verification sent
- `400`: Validation errors (password incorrect, email in use, etc.)
- `401`: Unauthorized

### 2. `POST /api/account/change-password`
**Purpose**: Process password changes

**Request Body**:
```json
{
  "currentPassword": "oldPassword",
  "newPassword": "newPassword"
}
```

**Response**:
- `200`: Password changed successfully
- `400`: Validation errors (weak password, incorrect current password, etc.)
- `401`: Unauthorized

### 3. `POST /api/account/sign-out-all`
**Purpose**: Sign out of all devices

**Response**:
- `200`: Successfully signed out of all devices
- `401`: Unauthorized

---

## Design Principles

### 1. **Account vs MyProfile Separation**
- **Account**: System-level identity (email, password, role, billing)
- **MyProfile**: Social-facing identity (username, avatar, bio)
- Clear visual and functional separation in the dropdown menu

### 2. **Progressive Disclosure**
- Most important account functions prominently displayed
- Advanced features grouped logically
- Role-specific items shown only when relevant

### 3. **Security First**
- Password verification required for sensitive changes
- Clear security indicators and requirements
- Session management capabilities

### 4. **User Experience**
- Intuitive navigation with clear labels
- Visual separators between sections
- Consistent styling and interactions
- Responsive design for all devices

### 5. **APA Compliance**
- Role-based access control
- Proper parent/child account management
- Secure session handling

---

## Future Enhancements

### Planned Features
1. **Account Suspension/Deletion**
   - Modal confirmations with warnings
   - Grace periods for account recovery
   - Data export options

2. **Two-Factor Authentication**
   - SMS or authenticator app support
   - Backup codes generation
   - Recovery options

3. **Advanced Session Management**
   - Device-specific session tracking
   - Location and browser information
   - Selective session termination

4. **Email Verification System**
   - Complete email change verification flow
   - Automated email sending
   - Verification link handling

5. **Account Activity Log**
   - Login history
   - Account changes log
   - Security events tracking

---

## Technical Implementation

### Components
- `UserDropdown.tsx`: Main dropdown component with role-based rendering
- Account pages: Individual pages for each account function
- API routes: Backend handlers for account operations

### Security Features
- Password hashing with bcrypt
- Session-based authentication with iron-session
- Input validation and sanitization
- CSRF protection via Next.js

### Database Integration
- Prisma ORM for database operations
- Proper error handling and transaction support
- Data validation at database level

---

## Testing Recommendations

### User Flows to Test
1. **Email Change Flow**: End-to-end email change with verification
2. **Password Change Flow**: Password update with validation
3. **Security Dashboard**: Session management and sign-out functionality
4. **Role-Based Access**: Verify correct menu items for each role
5. **Responsive Design**: Test on mobile and desktop devices

### Security Testing
1. **Authentication**: Verify all routes require proper authentication
2. **Authorization**: Test role-based access controls
3. **Input Validation**: Test with invalid/malicious inputs
4. **Session Management**: Verify session handling and expiration

---

This account management system provides a solid foundation for user account administration while maintaining security, usability, and APA compliance standards.
