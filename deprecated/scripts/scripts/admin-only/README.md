# Admin-Only Scripts

⚠️ **APA SECURITY WARNING** ⚠️

These scripts bypass normal authentication flows and should only be used in dev/test environments. Never use in production. All critical changes (roles, password updates, approvals) must be handled via APA-compliant routes.

## Scripts in this folder

- **create-admin.js**: Creates an admin user with proper role and permissions
- **cleanup-db.js**: Removes all users except admin@cliqstr.com
- **cleanTestUsers.ts**: Deletes specific test users

## Usage

Run scripts using Node.js from the project root:

```bash
node scripts/admin-only/create-admin.js
node scripts/admin-only/cleanup-db.js
```

For TypeScript scripts:

```bash
npx ts-node scripts/admin-only/cleanTestUsers.ts
```

## Security Notes

1. These scripts directly modify database records, bypassing APA security controls
2. They should only be used by administrators in controlled environments
3. Any changes to user roles, approvals, or credentials in production must go through proper APA-compliant API routes
4. Never expose these scripts in a production environment
