# Sign-Up Flow Improvement Recommendations

## Overview

This document outlines recommendations to improve the Cliqstr sign-up flow while maintaining strict COPPA compliance and ensuring proper age verification and parental consent for children under 17.

## Key Principles

1. **Streamline adult sign-up** - Reduce friction by eliminating unnecessary steps
2. **Strict child protection** - ALL children under 17 require parent pre-approval and verification
3. **Separate invite flow** - Dedicated path for users with invite codes
4. **Age verification** - Maintain birthdate verification to properly route users
5. **Security first** - Implement proper authentication while minimizing friction

## Recommended Changes

### 1. Streamlined Adult Authentication Flow

```typescript
// In sign-up-form.tsx handleSubmit function
const res = await fetchJson('/api/sign-up', {
  method: 'POST',
  body: JSON.stringify(body),
});

// Different flows based on age
if (res.isChild) {
  // Children flow - redirect to a safe confirmation page
  router.push('/sign-up-confirmation?status=pending');
} else if (res.token) {
  // Adult flow - auto-sign in and go to plans
  setAuthCookie(res.token);
  router.push('/plans');
} else {
  // Fallback - go to sign in
  router.push('/sign-in?status=complete');
}
```

### 2. Backend Implementation

```typescript
// In API route.ts
// After creating the user and determining age...

if (isChild) {
  // Child account - parent email required and verification
  if (!parentEmail) {
    return NextResponse.json({ 
      error: 'Children under 17 must include a parent email for verification',
      code: 'PARENT_EMAIL_REQUIRED'
    }, { status: 403 });
  }
  
  // Send parent verification regardless of invite status
  await sendParentEmail({
    to: parentEmail,
    childName: email,
    childId: newUser.id,
    inviteCode: inviteCode ?? undefined,
  });
  
  return NextResponse.json({ 
    success: true, 
    userId: newUser.id,
    isChild: true 
  });
} else {
  // Adult account - auto-authenticate
  const token = await signJwtAccessToken({
    userId: newUser.id,
    email: newUser.email,
  });

  // Send verification email (but don't block access)
  await sendVerificationEmail({
    to: email,
    userId: newUser.id,
  });

  return NextResponse.json({ 
    success: true, 
    userId: newUser.id,
    isChild: false,
    token: token 
  });
}
```

### 3. Dedicated Invite Flow

Add a prominent "Have an Invite?" button to the navigation:

```tsx
// In the main navigation component
<Link href="/invited" className="btn btn-outline">
  Have an Invite?
</Link>
```

Create a dedicated page for handling invites:

```tsx
// pages/invited.tsx
export default function InvitedPage() {
  const [inviteCode, setInviteCode] = useState('');
  const [email, setEmail] = useState('');
  const router = useRouter();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate invite code first
    const validInvite = await validateInviteCode(inviteCode);
    
    if (validInvite) {
      // Redirect to streamlined sign-up with invite code prefilled
      router.push(`/sign-up?invite=${inviteCode}&email=${encodeURIComponent(email)}`);
    }
  };
  
  return (
    <div className="container">
      <h1>Join with Invite</h1>
      <form onSubmit={handleSubmit}>
        <Input 
          label="Invite Code" 
          value={inviteCode} 
          onChange={(e) => setInviteCode(e.target.value)}
        />
        <Input 
          label="Your Email" 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit">Continue</Button>
      </form>
    </div>
  );
}
```

### 4. Strict Child Protection (Regardless of Invite)

Even with invites, all children require parent approval:

```typescript
// In the invite validation logic
const userAge = calculateAge(birthdate);
if (userAge < 17) {
  // Still require parent email and approval
  return {
    requiresParentApproval: true,
    // Continue with modified sign-up flow that REQUIRES parent email
  };
}
```

### 5. Complete User Journey

#### Adult Flow:
1. User completes sign-up with email, password, birthdate (17+)
2. Backend validates, creates account, auto-signs in (sets JWT token)
3. Send verification email (non-blocking)
4. Redirect to plans page
5. User selects and pays for plan
6. Redirect to My Cliqs Dashboard with:
   - "Create a Cliq" button
   - "Complete Your Profile" button
   - Any invitations they've received

#### Child Flow:
1. User completes sign-up with email, password, birthdate (<17)
2. MUST provide parent email
3. Backend creates account (unapproved) and sends parent verification email
4. Show child a "Pending Approval" page
5. Parent receives email with verification link
6. Parent must complete verification process including credit card verification
7. After approval, child can sign in
8. Child user follows normal flow through plans and dashboard

## Implementation Priority

1. Fix the authentication flow to auto-sign in adults
2. Add verification email sending (but non-blocking for adults)
3. Implement proper redirects to plans page and then dashboard
4. Add the dedicated invite flow
5. Enhance parent verification with credit card validation

## Security Considerations

- JWT tokens for secure authentication
- Email verification for all users (blocking for children, non-blocking for adults)
- Proper password hashing and storage
- Secure parent verification links
- Credit card verification for parent approval
