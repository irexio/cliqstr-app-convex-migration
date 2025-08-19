# Local Testing Guide for Cliqstr

## 🚀 Quick Start

### 1. Prerequisites
- Node.js installed (v18+)
- PostgreSQL database running
- Environment variables configured (.env.local)

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database with test data (optional)
npx prisma db seed
```

### 4. Start Development Server
```bash
npm run dev
```
Server will run on http://localhost:3000

## 🧪 Testing Options

### Option 1: Manual Testing (Recommended for Initial Setup)

Since you cannot run tests locally, manual testing is the best approach:

1. **Start the dev server**:
   ```bash
   npm run dev
   ```

2. **Open browser**: http://localhost:3000

3. **Test Key Flows**:

#### Adult Sign-up Flow
1. Click "Sign Up" on homepage
2. Select "Adult" role
3. Fill in: First Name, Last Name, Birthdate, Email
4. Check console for email simulation (no actual email sent in dev)
5. Complete email verification flow
6. Select test plan
7. Verify redirect to dashboard

#### Child Sign-up Flow (Parent-Initiated)
1. Sign in as parent
2. Go to Parents HQ (/parents/hq)
3. Click "Add Child"
4. Fill in child details
5. Configure child settings
6. Verify child account created

#### Invite Flows
Follow the detailed instructions in `MANUAL-TEST-INSTRUCTIONS.md`

### Option 2: Automated Testing with Playwright

If you want to try running automated tests:

1. **Install Playwright**:
   ```bash
   npx playwright install
   ```

2. **Run specific test file**:
   ```bash
   npx playwright test tests/signup/signup-flow-adult.spec.ts
   ```

3. **Run all tests**:
   ```bash
   npx playwright test
   ```

4. **View test report**:
   ```bash
   npx playwright show-report
   ```

### Option 3: Database Testing

Check database state directly:

1. **Access Prisma Studio**:
   ```bash
   npx prisma studio
   ```
   Opens at http://localhost:5555

2. **Verify data**:
   - Check User table for created accounts
   - Check Account table for approval status
   - Check Invite table for invite states
   - Check ParentLink for parent-child relationships

## 🔍 Debugging Tips

### Enable Console Logging
The codebase has extensive console logging. Open browser DevTools to see:
- API responses
- Authentication state changes
- Form submissions
- Error messages

### Check Session State
Visit `/api/auth/session` to see current session data

### Common Issues & Solutions

1. **"Cannot connect to database"**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in .env.local
   - Run: `npx prisma migrate dev`

2. **"Session not found" errors**
   - Clear browser cookies
   - Restart dev server
   - Check SESSION_SECRET in .env.local

3. **Email verification not working**
   - In dev mode, check console for email content
   - Use Prisma Studio to manually set `isVerified = true`

4. **Stripe/Payment errors**
   - Test mode uses mock payments
   - Any card number works in test mode
   - Check STRIPE_* env variables

## 📝 Test Checklist

Use this checklist to verify core functionality:

- [ ] Adult can sign up with email verification
- [ ] Parent can create child account
- [ ] Child settings are enforced (canSendInvites, etc.)
- [ ] Adult can create a cliq
- [ ] Invites work for all flows:
  - [ ] Adult to Adult
  - [ ] Adult to Child (requires parent approval)
  - [ ] Child to Child (if allowed)
  - [ ] Child to Adult (if allowed)
- [ ] Parent approval flow works
- [ ] Red alert system shows confirmation
- [ ] Session persists across page refreshes
- [ ] Logout clears session properly

## 🛠️ Utility Scripts

### Clean Start
```bash
npm run clean  # Kill node processes and ports
npm run reset  # Clean + rebuild
```

### Database Reset
```bash
npx prisma migrate reset  # Reset DB and re-run migrations
```

### Admin User
```bash
npm run seed:admin  # Create admin user for testing
```

### Sanity Check
```bash
npm run sanity  # Run basic health checks
```

## 📊 Monitoring

### Check Logs
- Browser console for client-side logs
- Terminal running `npm run dev` for server logs
- Prisma Studio for database state

### Performance
- Use browser DevTools Network tab
- Check for slow API calls
- Monitor console for React warnings

## 🚨 Important Notes

1. **Never test with real email addresses** - Use test domains like @example.com
2. **Test data is ephemeral** - Database may be reset frequently
3. **File uploads are currently broken** - Skip cliq image upload tests
4. **Use test payment methods only** - Never enter real credit cards
5. **Parent approval is mandatory** - Child accounts cannot self-approve

## Need Help?

1. Check `MANUAL-TEST-INSTRUCTIONS.md` for detailed flow testing
2. Review `docs/TODO.md` for known issues
3. Check console logs for detailed error messages
4. Use Prisma Studio to inspect database state