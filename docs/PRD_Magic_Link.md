# PRD: Magic Link Authentication Flow (Cliqstr)

## 1. Overview
Cliqstr will implement **passwordless login** using secure **email-based magic links**. This flow must integrate with **APA (Aiden’s Power Auth)** — meaning **session-based auth only** (iron-session), no JWTs, no persistent tokens.  

The magic link must:  
- Support both **new user signup (direct + invite)** and **returning user login**.  
- Route new users through the **Plan page** (plan acceptance required, even if no payment card is collected).  
- Respect strict parental controls: **children cannot log in directly**.  

---

## 2. Objectives
- Provide a simple, secure login option that replaces passwords.  
- Enforce **plan acceptance** on first login (new signup or invited).  
- Maintain APA compliance and session security.  
- Reduce user friction while preserving Cliqstr’s **safety-first approach**.  

---

## 3. User Stories
1. **Parent (New Signup)**  
   - As a new parent, I want to click my magic link, accept a plan, and then enter Parent HQ.  

2. **Parent (Returning)**  
   - As a returning parent, I want to log in via magic link and land directly in Parent HQ.  

3. **Adult (New Signup or Invited)**  
   - As an adult, I must accept a plan (even if invited) before accessing My Cliqs.  

4. **Adult (Returning)**  
   - As a returning adult, I log in via magic link and go directly to My Cliqs.  

5. **Child (Any Case)**  
   - As a child, I cannot log in directly — my parent must approve my account and manage access.  

---

## 4. Flow Requirements

### 4.1 Magic Link Request
- Endpoint: `/auth/magic-link`  
- User enters email.  
- System checks if email exists:  
  - If no account → return *“No account with this email. Please sign up.”*  
  - If child account → return *“Child accounts cannot log in directly. Please log in as a parent/guardian.”*  

### 4.2 Magic Link Generation
- Generate a one-time, random string.  
- Save in `MagicLinkToken` table:  
  - `id` (UUID)  
  - `userId` (FK → User)  
  - `tokenHash` (hashed random string)  
  - `expiresAt` (15 min from creation)  
  - `usedAt` (nullable datetime)  
- Store only hashed token.  
- Email link to user:  
  ```
  https://cliqstr.com/auth/magic?token=<randomString>&email=<userEmail>
  ```

### 4.3 Verification
- Endpoint: `/api/auth/magic/verify`  
- Validate:  
  - Token exists.  
  - Token not expired.  
  - Token not already used.  
- On success:  
  - Create **iron-session** with `userId`, `role`, and `planStatus`.  
  - Mark token as used.  

### 4.4 Redirect Logic
- **New User (Signup or Invite)**  
  - Always redirect to `/plans`.  
  - User must hit **Accept** on plan page (even if trial / no card entry).  
  - After plan acceptance:  
    - Parent → `/parents/hq`  
    - Adult → `/my-cliqs`  
    - Child → parent approval flow in `/parents/hq`.  

- **Returning User (Login)**  
  - If `planStatus = active` → redirect directly:  
    - Parent → `/parents/hq`  
    - Adult → `/my-cliqs`.  

---

## 5. Security Requirements
- **No JWTs.**  
- **No persistent cookies.**  
- One-time tokens expire after 15 minutes or first use.  
- Session duration: 7 days (iron-session).  
- Rate limit: max 5 link requests/hour/email.  
- Log all attempts for abuse monitoring.  

---

## 6. UX & Edge Cases
- Expired token → *“This link has expired. Please request a new one.”*  
- Used token → *“This link has already been used.”*  
- Unrecognized email → *“No account with this email. Please sign up.”*  
- Child email → *“Child accounts cannot log in directly. Please log in as a parent/guardian.”*  

---

## 7. Acceptance Criteria
- ✅ Email with magic link sent in under 1 minute.  
- ✅ New users (signup or invited) always land on **/plans** before proceeding.  
- ✅ Plan page requires hitting **Accept** before continuing.  
- ✅ Returning users with active plan skip `/plans`.  
- ✅ Child accounts are blocked from logging in directly.  
- ✅ No JWTs or persistent tokens used anywhere in implementation.  
- ✅ Sessions created only via iron-session.  

---

## 8. Non-Goals
- No SMS magic links (future roadmap).  
- No fallback password auth.  
- No social logins.  
