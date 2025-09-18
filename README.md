# 🛡️ Cliqstr – Private Social Platform for Families

> **Protecting children online through privacy, parental controls, and purposeful design.**

## 🌟 What is Cliqstr?

Cliqstr is an **invite-only, ad-free social platform** designed specifically for families who prioritize safety and privacy. Unlike traditional social media, Cliqstr puts parents in control while giving children age-appropriate freedom to connect with family and trusted friends.

---

## 🎯 Mission

Create a digital space where:
- Children can safely explore social connections  
- Parents have peace of mind without being overbearing  
- Families stay connected across generations  
- Privacy is guaranteed, not promised  

---

## 🚸 Key Safety Features

### For Children (17 and under)
- **Parent-approved accounts** – No child creates an account alone  
- **Customizable freedoms** – Parents decide what their child can do  
- **No strangers** – Only connect with trusted people (requires parent approval)  
- **Age-appropriate content** – Built-in protections by age  
- **Red Alert** – Emergency button that notifies trusted adults immediately  

### For Parents
- **Parents HQ Dashboard** – Configure permissions for each child  
- **Flexible monitoring** – From light touch to full oversight  
- **Approval workflows** – Review invites and connections  
- **Activity insights** – Stay informed without being intrusive  
- **Trust building** – Gradually increase freedoms as children grow  

### For Everyone
- **No ads or tracking** – Data is never sold  
- **No algorithms** – No manipulation or echo chambers  
- **Invite-only** – No public profiles or unwanted contact  
- **Private by default** – Share only with chosen cliqs  
- **Family-friendly** – Designed for ages 6 to 80+  

---

## 🔐 Authentication (APA)

Cliqstr uses a **custom authentication system** (APA – Aiden’s Power Auth) to handle:  
- Parent-child relationships  
- Approval workflows  
- Session-based permissions  
- Role-based access control  
- Real-time monitoring  

---

## 💻 Tech Stack (Current)

- **Framework**: Next.js 15 with App Router  
- **Database**: Convex (serverless, document-based)  
- **Auth**: Custom APA + iron-session  
- **Styling**: TailwindCSS + shadcn/ui components  
- **File Uploads**: UploadThing (COPPA-compliant)  
- **Payments**: Stripe (subscription management – pending activation)  
- **Email**: Resend (transactional emails)  
- **Hosting**: Vercel (edge functions)  

---

## 🚧 In Development

- **Mobile Apps**: TWA (Trusted Web Activity) + Capacitor  
- **AI Moderation**: Content safety for public cliqs  
- **Educational AI**: Homework Helpline  
- **SMS Notifications**: Twilio integration  
- **Games & Activities**: Safe, family-friendly games  
- **Onboarding Assistants**: Pip & Pippy AI helpers  

---

## 📋 Parent Control Options

| Permission            | Description                                 | Default |
|-----------------------|---------------------------------------------|---------|
| Can Send Invites      | Allow child to invite others                | Age-based |
| Can Invite Adults     | Permit inviting grandparents/friends        | Disabled |
| Invite Requires Approval | Parent must approve outgoing invites     | Enabled |
| Can Join Public Cliqs | Access age-appropriate groups               | Age 13+ |
| Can Create Public Cliqs | Start their own public groups             | Age 16+ |
| Monitoring Level      | Oversight level (Light/Medium/Full)         | Medium |

---

## 🏗️ Project Structure


/src
/app - Next.js 15 app router
/components - Reusable React components
/lib - Core utilities
/auth - APA auth system
/security - Role/permission checks
/convex - Convex functions (users, invites, cliqs)
/server - Server actions
/convex - Convex schema + functions
/docs - Documentation (.md files)
/deprecated - Old code moved out (do not delete)
/.github - PR templates and repo rules

---

## 🚀 Development Setup

bash

# Install dependencies
npm install

# Run Next.js dev server
npm run dev

# Convex Commands

- `npx convex dev` → Run locally, connects to your dev deployment.
- `npx convex deploy` → Deploy schema + functions to production. 
  (This is the command Vercel also runs during builds.)

---

## Environment Variables

NEXT_PUBLIC_CONVEX_URL=   # Convex deployment URL (.cloud)
CONVEX_DEPLOY_KEY=        # For Vercel prod deployment
SESSION_SECRET=           # 32+ char secret
RESEND_API_KEY=           # Email
STRIPE_SECRET_KEY=        # Stripe
UPLOADTHING_SECRET=       # File uploads

---

## 🤝 Contributing

We welcome contributions aligned with our mission of child safety and family privacy.

---

## Must-Read Docs

DEV_RULES.md – Contribution rules

.github/PULL_REQUEST_TEMPLATE.md – Required PR checklist

deprecated/README.md – Do-not-delete policy

---

## Code Standards

Security First – Protect children by design

No Bypasses – Never circumvent parental controls

Privacy Default – Everything is private by default

Proof of Persistence – Show Convex Data tab screenshots for auth/invite changes

---

## 🛡️ Security Reporting

Found an issue? Email mimi@cliqstr.com

---

## 🙏 Acknowledgments

Built with love by parents and people who believe everyone, especially children deserve better than today’s social media landscape.

Special thanks to:

The parents who shaped our permission system

Children who tested features and guided usability

Security researchers who stress-tested our design

The open source community for tools that made this possible

Remember: If you're working on Cliqstr, you're not just writing code — you're protecting children and strengthening families. 🛡️

Let's Change The Way We Socialize Online (and maybe offline too?) - For Good!

## 📚 Documentation
- [APA — Aiden’s Power Auth](./docs/APA.md)
- [APA Quick Checklist](./docs/APA-CHECKLIST.md)

