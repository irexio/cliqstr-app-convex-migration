# 🛡️ Cliqstr - Private Social Platform for Families

> **Protecting children online through privacy, parental controls, and purposeful design.**

## What is Cliqstr?

Cliqstr is an **invite-only, ad-free social platform** designed specifically for families who prioritize safety and privacy. Unlike traditional social media, Cliqstr puts parents in control while giving children age-appropriate freedom to connect with family and friends.

### 🎯 Our Mission

Create a digital space where:
- Children can safely explore social connections
- Parents have peace of mind without being overbearing  
- Families stay connected across generations
- Privacy is guaranteed, not promised

## 🚸 Key Safety Features

### For Children (17 and under)
- **Parent-approved accounts** - No child creates an account alone
- **Customizable freedoms** - Parents decide what their child can do
- **No strangers** - Only connect with people you know in real life
- **Age-appropriate content** - Built-in protections based on age
- **Red Alert** - Emergency button that notifies all trusted adults

### For Parents
- **Parents HQ Dashboard** - Configure permissions for each child
- **Flexible monitoring** - From light touch to full oversight
- **Approval workflows** - Review invites and connections
- **Activity insights** - Stay informed without being intrusive
- **Trust building** - Gradually increase freedoms as children grow

### For Everyone
- **No ads or tracking** - Your data is never sold
- **No algorithms** - No manipulation or echo chambers
- **Invite-only** - No public profiles or unwanted contact
- **Private by default** - Share only with your chosen cliqs
- **Family-friendly** - Designed for ages 8 to 80+

## 🔐 Technical Security

### Custom Authentication (APA)
We built our own authentication system because standard solutions (Clerk, Auth0, Supabase) cannot handle:
- Parent-child relationships
- Approval workflows
- Real-time monitoring
- Session-based permissions
- Role-based access control

## 💻 Tech Stack

### Current Implementation
- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL on Neon (serverless)
- **ORM**: Prisma with type-safe queries
- **Authentication**: Custom APA with iron-session
- **Styling**: TailwindCSS + shadcn/ui components
- **File Uploads**: UploadThing (secure, COPPA-compliant)
- **Payments**: Stripe (subscription management)
- **Email**: Resend (transactional emails)
- **Hosting**: Vercel (edge functions)

### Coming Soon (In Development)
- **Mobile Apps**: TWA (Trusted Web Activity) + Capacitor
- **AI Moderation**: Content safety for public cliqs
- **SMS Notifications**: Twilio integration
- **Educational AI**: Homework Helpline feature
- **PWA Support**: Installable app experience
- **App Store**: iOS and Android native apps
- **Onboarding Assistants**: Pip & Pippy AI helpers
- **Educational Games**: Built-in learning activities

## 📋 Parent Control Options

Parents can configure these settings per child in the **Parents HQ**:

| Permission | Description | Default |
|------------|-------------|---------|
| Can Send Invites | Allow child to invite others to cliqs | Age-based |
| Can Invite Adults | Permit inviting grandparents, family friends | Disabled |
| Invite Requires Approval | Review invites before they're sent | Enabled |
| Can Join Public Cliqs | Access age-appropriate public groups | Age 13+ |
| Can Create Public Cliqs | Start their own public groups | Age 16+ |
| Monitoring Level | Choose oversight level (Light/Medium/Full) | Medium |

## 🏗️ Project Structure

```
/src
  /app              - Next.js 15 app router pages
  /components       - Reusable React components
  /lib              - Core utilities
    /auth          - APA authentication system
    /security      - Permission & role checks
    /db            - Database utilities
  /server          - Server-side actions
/prisma            - Database schema & migrations
/docs              - Documentation
  /SECURITY        - Security principles & guides
  /ARCHITECTURE    - System design docs
/public            - Static assets
```

## 🚀 Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your specific configuration

# Generate Prisma client
npx prisma generate

# Run development server
npm run dev

# Run database migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

### Environment Variables

Required environment variables:
```env
DATABASE_URL=          # Neon PostgreSQL connection string
SESSION_PASSWORD=      # 32+ character secret for sessions
STRIPE_SECRET_KEY=     # Stripe API key
RESEND_API_KEY=       # Email service API key
UPLOADTHING_SECRET=   # File upload service key
```

## 🤝 Contributing

We welcome contributions that align with our mission of child safety and family privacy.

### Before Contributing
1. Read our [Security Principles](./docs/SECURITY/SECURITY_PRINCIPLES.md)
2. Review [CLAUDE.md](./CLAUDE.md) for AI assistant context
3. Understand parent-child relationships in our data model
4. Test with child safety in mind

### Code Standards
- **Security First**: Every feature must consider child safety
- **No Bypasses**: Never circumvent parental controls
- **Privacy Default**: Features must be private by default
- **Clear Documentation**: Explain security implications

## 🛡️ Security Reporting

Found a security issue? Please email security@cliqstr.com immediately. Do NOT create public issues for security vulnerabilities.

## 📜 License

[License details - contact for information]

## 🙏 Acknowledgments

Built with love by parents who believe children deserve better than today's social media landscape.

Special thanks to:
- The dozens of parents who shared their concerns and shaped our permission system
- Children who tested features and kept us honest about usability
- Security researchers who helped us build it right from day one
- The open source community for tools that make this possible

---

**Remember**: If you're working on Cliqstr, you're not just writing code - you're protecting children and strengthening families. Make us proud. 🛡️
