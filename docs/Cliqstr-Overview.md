# 🟣 Cliqstr

**Private. Joyful. Social. Safe.**  
Cliqstr is a private-first social platform built for families, kids, and communities who want connection without the noise of surveillance capitalism, ads, or unsafe algorithms. It’s modern social done right.

---

## 🚀 What Is Cliqstr?

Cliqstr is a subscription-based, invite-only social media platform that provides:

- **Safe Cliqs**: Groups built around trust — no public feeds, no algorithms, and no strangers.
- **APA-Hardened Auth**: Built-in protections for kids, verified parents, and consent-driven access.
- **Custom Feeds**: Expiring content (90-day max), no infinite archives.
- **Red Alert System**: A built-in panic/report feature for real-time safety.
- **Cliq Tools**: Built-in camera, calendar, games, and AI-powered Homework Helpline (coming soon).

---

## 🔑 Types of Cliqs

Cliqstr supports **three types of cliqs**, each with different visibility and access:

| Type           | Who Can Join | Who Can See Posts | Use Case Examples |
|----------------|--------------|--------------------|-------------------|
| **Private Cliq**     | Invite only        | Members only       | Family threads, class groups, youth groups |
| **Public (Members-Only)** | Any logged-in user (age-gated) | Members only | Open topics like “Grandparents”, “Homeschool Help”, “Teen AI Club” |
| **Semi-Private** | Request-to-join or invite only | Members only | Clubs, safe hobby groups, neighborhood kids |

All cliq types are fully moderated. Only verified adults may create public or semi-private cliqs.

---

## 🧠 Architecture

- **Framework**: Next.js 15 App Router
- **DB**: PostgreSQL (via Prisma)
- **Styling**: TailwindCSS + custom `BaseCard`, `CliqCard`, and `FeaturePanel` components
- **Deployment**: Vercel (PWA-first)
- **Authentication**: Custom APA (Aiden’s Power Auth) with age validation and parental approval
- **Payments**: Stripe integration with trials, paid plans, and EBT support

---

## 👀 Key Features

| Feature | Description |
|--------|-------------|
| **Invite-Only Access** | No global search, no browsing strangers—just people you know |
| **Parental Controls (Parents HQ)** | Silent monitoring, invite approval, public cliq permissions |
| **Post Expiration** | All content auto-deletes after 90 days |
| **Red Alert System** | One-click safety report button for urgent issues |
| **AI Moderation** | Coming soon: blended AI + human moderation for safer feeds |
| **Cliq Tools** | Calendar, games, camera, video chat, Homework Helpline |
| **Pip & Pippy Chatbots** | Friendly AI guides for adults and kids to onboard, ask questions, and explore the platform |
| **PWA & Capacitor** | Planned rollout for mobile homescreen installation and app store publishing |

---

## 📁 Project Structure

