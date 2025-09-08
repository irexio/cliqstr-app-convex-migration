# 🚀 Data Migration Guide: Neon PostgreSQL → Convex

This guide will help you safely migrate your data from Neon PostgreSQL to Convex.

## 📋 Prerequisites

1. **Backup your Neon database** (IMPORTANT!)
2. **Convex is set up and running** (`npx convex dev`)
3. **Both databases are accessible**

## 🔄 Migration Process

### Step 1: Prepare for Migration

```bash
# Make sure you're in the migration directory
cd c:/cli/cliqstr-app-convex-migration

# Ensure Convex is running
npx convex dev
```

### Step 2: Run the Migration

```bash
# Run the simplified migration script
npx tsx scripts/migrate-data-simple.ts
```

This script will:
- ✅ Migrate users with profiles and accounts
- ✅ Migrate cliqs with proper ownership
- ✅ Migrate memberships
- ✅ Migrate posts and replies
- ✅ Handle ID mapping between databases

### Step 3: Validate the Migration

```bash
# Run the validation script
npx tsx scripts/validate-migration.ts
```

This will compare data between Neon and Convex to ensure everything migrated correctly.

## 📊 What Gets Migrated

### Core Data
- **Users** - All user accounts with authentication data
- **Profiles** - User profiles with personal information
- **Accounts** - Account settings and subscription data
- **Cliqs** - All social groups with settings
- **Memberships** - User memberships in cliqs
- **Posts** - All posts with content and metadata
- **Replies** - All replies to posts

### Relationships
- User → Profile (1:1)
- User → Account (1:1)
- User → Cliqs (1:many, as owner)
- User → Memberships (1:many)
- Cliq → Posts (1:many)
- Post → Replies (1:many)

## ⚠️ Important Notes

### Data Types
- **Timestamps**: Converted from PostgreSQL `DateTime` to Convex `number` (milliseconds)
- **IDs**: Mapped from Prisma string IDs to Convex document IDs
- **Enums**: Converted to string literals in Convex

### What's NOT Migrated
- **Sessions** - You'll need to re-authenticate users
- **File uploads** - Images remain in your existing storage
- **Temporary data** - Cache, logs, etc.

## 🔧 Troubleshooting

### Common Issues

1. **"No Convex user ID found"**
   - This means a user in Neon doesn't have a corresponding user in Convex
   - Check the migration logs for specific users

2. **"Missing IDs for membership"**
   - This happens when a membership references a user or cliq that wasn't migrated
   - Usually indicates a data integrity issue in the original database

3. **"Count mismatch"**
   - The validation script found different numbers of records
   - Check the validation output for specific issues

### Recovery Steps

If something goes wrong:

1. **Stop the migration** (Ctrl+C)
2. **Check the logs** for specific errors
3. **Fix the issue** in your source data if needed
4. **Restart the migration**

## 🎯 Post-Migration Steps

### 1. Test Your App
```bash
# Start your development server
npm run dev
```

### 2. Verify Key Features
- ✅ User authentication works
- ✅ Users can view their cliqs
- ✅ Posts and replies display correctly
- ✅ Real-time updates work

### 3. Update Environment Variables
```bash
# Remove or comment out Neon database URL
# DATABASE_URL=postgresql://...

# Ensure Convex URL is set
NEXT_PUBLIC_CONVEX_URL=https://your-convex-deployment.convex.cloud
```

### 4. Deploy to Production
```bash
# Deploy Convex to production
npx convex deploy

# Update your production environment variables
```

## 📈 Performance Benefits

After migration, you'll notice:

- **⚡ Faster queries** - Convex optimizes automatically
- **🔄 Real-time updates** - No more polling needed
- **📱 Better UX** - Instant updates across all clients
- **🛠️ Easier development** - No complex API routes

## 🆘 Support

If you encounter issues:

1. **Check the logs** from the migration scripts
2. **Review the validation results** carefully
3. **Test individual components** to isolate issues
4. **Contact support** if needed

## 🎉 Success!

Once migration is complete, you'll have:
- ✅ All your data in Convex
- ✅ Real-time capabilities
- ✅ Better performance
- ✅ Simplified architecture

Your original Neon database remains untouched, so you can always rollback if needed.
