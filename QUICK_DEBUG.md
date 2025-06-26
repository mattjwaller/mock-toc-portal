# Quick Debug Guide - 401 Error

## 🚨 Current Issues Fixed

1. ✅ **Script loading error** - Removed problematic external script
2. ✅ **refreshToken function error** - Fixed naming conflict
3. ✅ **setCurrentUserRole not defined** - Added function directly to HTML

## 🔍 Debug Steps

### Step 1: Test Authentication
Open browser console and run:
```javascript
testAuthDebug()
```

This will show you:
- Whether you have a valid token
- Whether the JWT secret is configured
- Your user role
- Any JWT errors

### Step 2: Set User Role (if needed)
If the debug shows no role or "none", run:
```javascript
setCurrentUserRole("admin")
```

### Step 3: Check Environment Variables
Make sure these are set in Railway:
```env
SUPABASE_JWT_SECRET=your-actual-jwt-secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

## 🚀 Quick Commands

### In Browser Console:
```javascript
// Test authentication
testAuthDebug()

// Set user role
setCurrentUserRole("admin")

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

## 🔧 Common Solutions

### If JWT Secret is Wrong:
1. Go to Supabase Dashboard
2. Settings → Auth → JWT Settings
3. Copy the JWT Secret
4. Update Railway environment variable

### If User Has No Role:
1. Run `setCurrentUserRole("admin")` in console
2. Refresh the page
3. Try accessing incidents again

### If Token is Expired:
1. Log out and log back in
2. Or run `authManager.refreshAuthToken()`

## 📋 Expected Results

**Good debug output:**
```
Auth Debug Info:
Header: true
Token: true
JWT Secret: true
User ID: [uuid]
Email: [your-email]
Role: admin
Expired: false
```

**Bad debug output:**
```
Auth Debug Info:
Header: false
Token: false
JWT Secret: false
```

Or:
```
Auth Debug Info:
Header: true
Token: true
JWT Secret: true
JWT Error: invalid signature
```

## 🆘 Still Having Issues?

1. **Check Railway logs** for server errors
2. **Verify Supabase project** is active
3. **Test with a fresh user** in Supabase
4. **Check CORS settings** in Supabase 