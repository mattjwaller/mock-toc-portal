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

// Check if logged in
authManager.isAuthenticated()

// Get current user
authManager.getCurrentUser()

// Refresh token
authManager.refreshAuthToken()
```

### Direct URL Test:
Visit this URL to test the debug endpoint:
```
https://mock-toc-portal-production.up.railway.app/api/debug/auth
```

## 🔧 **Required Environment Variables**

Make sure these are set in Railway:
```env
SUPABASE_JWT_SECRET=your-actual-jwt-secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

**To get the JWT Secret:**
1. Go to Supabase Dashboard
2. Settings → Auth → JWT Settings
3. Copy the JWT Secret
4. Update Railway environment variable

## 📋 **Expected Results**

**Good debug output:**
```
Auth Debug Info:
Header: true
Token: true
JWT Secret: true
User ID: [uuid]
Email: [your-email]
Role: admin (or any role - doesn't matter now)
Expired: false
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