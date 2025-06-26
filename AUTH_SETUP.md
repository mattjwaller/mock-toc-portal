# Supabase Authentication Setup Guide

This guide explains how to configure Supabase authentication for the TOC Portal frontend.

## 🔧 Frontend Configuration

### 1. Get Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### 2. Configure Frontend

Edit `public/config.js` and replace the placeholder values:

```javascript
window.TOC_CONFIG = {
  // Replace with your actual Supabase credentials
  SUPABASE_URL: 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  
  // API base URL (usually the same as your Railway app URL)
  API_BASE_URL: window.location.origin,
  
  // App settings
  APP_NAME: 'TOC Portal',
  VERSION: '1.0.0'
};
```

### 3. Create Test User

1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **Users**
3. Click **"Add user"**
4. Enter email and password for testing
5. The user will receive a confirmation email

### 4. Configure Email Settings (Optional)

1. Go to **Authentication** → **Settings**
2. Configure email templates if needed
3. Set up SMTP settings for custom email provider

## 🔐 Backend Configuration

### 1. Environment Variables

Ensure these are set in your Railway environment:

```env
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
SUPABASE_URL=https://your-project.supabase.co
GOTRUE_SITE_URL=https://your-app-name.up.railway.app
```

### 2. Get JWT Secret

1. Go to Supabase dashboard
2. Navigate to **Settings** → **Auth** → **JWT Settings**
3. Copy the **JWT Secret**
4. Add to Railway environment variables

## 🧪 Testing Authentication

### 1. Test Login

1. Open your TOC Portal
2. You should see a login modal
3. Enter the test user credentials
4. Should successfully log in and load incidents

### 2. Test API Access

After login, the frontend will:
- Include proper JWT token in API requests
- Handle 401 responses (token expired/invalid)
- Automatically logout on auth errors

### 3. Test Logout

1. Click the logout button
2. Should clear session and show login modal
3. API requests should fail with 401

## 🚨 Troubleshooting

### Common Issues

1. **"Invalid token" errors**
   - Check `SUPABASE_JWT_SECRET` matches your Supabase project
   - Verify `SUPABASE_URL` is correct
   - Ensure frontend config has correct credentials

2. **Login fails**
   - Check Supabase anon key is correct
   - Verify user exists in Supabase
   - Check email confirmation if required

3. **401 errors after login**
   - Token might be expired
   - Check JWT secret configuration
   - Verify `GOTRUE_SITE_URL` matches your app URL

4. **CORS errors**
   - Add your Railway URL to Supabase allowed origins
   - Go to **Settings** → **API** → **CORS**

### Debug Steps

1. **Check browser console** for JavaScript errors
2. **Check Network tab** for failed requests
3. **Verify environment variables** in Railway
4. **Test Supabase connection** directly

### Environment Variables Checklist

- [ ] `SUPABASE_JWT_SECRET` - JWT signing secret
- [ ] `SUPABASE_URL` - Project URL
- [ ] `GOTRUE_SITE_URL` - Your app URL
- [ ] Frontend config updated with anon key

## 🔒 Security Notes

1. **Never commit secrets** to git
2. **Use environment variables** for all secrets
3. **Rotate JWT secrets** periodically
4. **Monitor auth logs** in Supabase dashboard
5. **Set up proper CORS** for production

## 📱 User Management

### Creating Users

1. **Via Supabase Dashboard** (admin)
   - Go to Authentication → Users
   - Click "Add user"

2. **Via Supabase Auth API** (self-registration)
   - Users can sign up via `/auth/v1/signup`
   - Requires email confirmation

3. **Via your application** (custom flow)
   - Implement custom signup form
   - Use Supabase Auth API

### User Roles

The system supports three roles:
- **Viewer**: Read-only access
- **Editor**: Create, update, comment
- **Admin**: Full access

Configure roles in Supabase user metadata or implement custom role system.

## 🔄 Token Refresh

The frontend automatically handles:
- Token storage in localStorage
- Token refresh on 401 responses
- Automatic logout on auth failures

## 📊 Monitoring

Monitor authentication in:
- **Supabase Dashboard** → Authentication → Logs
- **Railway Logs** for backend auth errors
- **Browser Console** for frontend auth issues 