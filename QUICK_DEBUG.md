# Quick Debug Guide - Simplified Authentication

## ✅ **Role Checks Removed!**

**Good news**: We've removed all role-based authorization. Now **any authenticated user** has full access to all features.

## 🔍 **Current Status**

- ✅ **Authentication required** - Users must log in with Supabase
- ✅ **Full access** - All authenticated users can view, create, edit incidents
- ✅ **No role management** - No need to set user roles
- ✅ **Simplified setup** - Only need basic Supabase credentials

## 🚀 **Quick Commands**

### In Browser Console:
```javascript
// Test authentication
testAuthDebug()

// Test database connection
testDatabase()

// Check if logged in
authManager.isAuthenticated()

// Get current user
authManager.getCurrentUser()

// Refresh token
authManager.refreshAuthToken()
```

### Direct URL Tests:
Visit these URLs to test the endpoints:
```
https://mock-toc-portal-production.up.railway.app/api/debug/auth
https://mock-toc-portal-production.up.railway.app/api/debug/db
```

## 🔧 **Required Environment Variables**

Make sure these are set in Railway:
```env
DATABASE_URL=postgresql://...  # Railway auto-sets this
SUPABASE_JWT_SECRET=your-actual-jwt-secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

## 🚨 **400 Error Debugging**

If you're getting a 400 error on `/api/incidents`:

### Step 1: Test Database
```javascript
testDatabase()
```

This will show you:
- Whether the database connection works
- Whether the tables exist
- Any database errors

### Step 2: Check Railway Logs
The enhanced error logging will show the exact error in Railway logs.

### Step 3: Common 400 Error Causes
1. **Database tables don't exist** - Run migrations
2. **Database connection failed** - Check DATABASE_URL
3. **Prisma client not generated** - Check build process
4. **Invalid query parameters** - Check frontend request

## 📋 **Expected Results**

**Good database output:**
```
Database Debug Info:
Prisma: true
Database URL: true
Connection: success
Incident Table: exists
Incident Count: 0
Customer Table: exists
Customer Count: 0
```

**Bad database output:**
```
Database Debug Info:
Prisma: true
Database URL: true
Connection: failed
Connection Error: [error details]
```

Or:
```
Database Debug Info:
Prisma: true
Database URL: true
Connection: success
Incident Table: missing
Incident Error: [error details]
```

## 🆘 **If Still Having Issues**

1. **Check Railway logs** for server errors
2. **Verify Supabase project** is active
3. **Test with a fresh user** in Supabase
4. **Check CORS settings** in Supabase
5. **Verify the JWT secret** matches exactly

## 🎉 **What's Changed**

- ❌ **Removed**: Role-based authorization
- ❌ **Removed**: User role management functions
- ❌ **Removed**: Service role key requirement
- ✅ **Added**: Simple authentication-only access
- ✅ **Added**: All authenticated users get full access
- ✅ **Added**: Automatic database table creation on startup
- ✅ **Added**: Enhanced error logging and debugging tools

## 🚀 **Automatic Database Setup**

The server now automatically:
1. **Connects to the database** on startup
2. **Creates tables** if they don't exist
3. **Seeds sample data** (if available)
4. **Starts serving requests**

No manual database setup required! 