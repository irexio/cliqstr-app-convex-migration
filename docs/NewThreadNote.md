Hi — starting a fresh thread for clarity and accuracy.

I'm building Cliqstr, a private social app designed around APA (Aiden’s Power Auth) — a strict safety framework that protects children, parents, and adult users with:

    Role-based access control (Child, Parent, Adult, Admin)

    Invite-only group structures (“Cliqs”)

    Parental approval requirements for under-13 users

    No public profiles or global search

    Middleware and session-based protection across all routes

This project must follow APA rules without exception. That means:

    No auto-approval of child accounts

    No skipping plan selection on adult sign-up

    No redirect loops or broken middleware escapes

Please ignore previous thread assumptions. I’ll clearly describe the current behavior below so we can track and resolve it properly.
