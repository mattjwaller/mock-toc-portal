# Authentication Debug Guide

## 🚨 401 Error on /incidents

You're getting a 401 error, which means the authentication is working but there's an issue with the JWT token or user permissions.

## 🔍 Debug Steps

### 1. Test Authentication Debug Endpoint

Visit this URL in your browser (replace with your Railway URL):
```
https://your-app.up.railway.app/api/debug/auth
```

This will show you:
- Whether the Authorization header is present
- Whether the JWT token is valid
- Whether the JWT secret is configured
- User information from the token
- Any JWT verification errors

### 2. Use Browser Console Debug

1. **Open your TOC Portal** in the browser
2. **Open Developer Tools** (F12)
3. **Go to Console tab**
4. **Run this command**:
   ```javascript
   debugAuth()
   ```

This will show you detailed authentication information in an alert.

### 3. Check Environment Variables

Make sure these are set correctly in Railway:

```env
SUPABASE_JWT_SECRET=your-actual-jwt-secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

## 🔧 Common Issues & Solutions

### Issue 1: JWT Secret Mismatch
**Symptoms**: JWT verification fails
**Solution**: 
1. Go to Supabase Dashboard → Settings → Auth → JWT Settings
2. Copy the JWT Secret
3. Update `SUPABASE_JWT_SECRET` in Railway

### Issue 2: Token Expired
**Symptoms**: Token is valid but expired
**Solution**: 
1. Log out and log back in
2. Check if token refresh is working

### Issue 3: User Has No Role
**Symptoms**: Token is valid but user has no role
**Solution**: 
1. Run this in browser console:
   ```javascript
   setCurrentUserRole("admin")
   ```
2. Or manually set role in Supabase Dashboard

### Issue 4: Missing Environment Variables
**Symptoms**: JWT secret not configured
**Solution**: 
1. Check Railway environment variables
2. Set missing variables

## 🚀 Quick Fixes

### Fix 1: Set User Role
```javascript
// In browser console after logging in
setCurrentUserRole("admin")
```

### Fix 2: Check JWT Secret
1. Go to Supabase Dashboard
2. Settings → Auth → JWT Settings
3. Copy JWT Secret
4. Update Railway environment variable

### Fix 3: Refresh Token
```javascript
// In browser console
authManager.refreshToken()
```

## 📋 Debug Checklist

- [ ] JWT Secret is set correctly
- [ ] User is logged in
- [ ] Token is not expired
- [ ] User has a role assigned
- [ ] Environment variables are set
- [ ] Supabase project is active

## 🔍 Expected Debug Output

**Good output should show:**
```
Auth Debug Info:
Header: true
Token: true
JWT Secret: true
User ID: [some-uuid]
Email: [your-email]
Role: admin
Expired: false
```

**Bad output might show:**
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

1. **Check Railway logs** for server-side errors
2. **Verify Supabase project** is active
3. **Test with a fresh user** in Supabase
4. **Check CORS settings** in Supabase
5. **Verify the JWT secret** matches exactly 