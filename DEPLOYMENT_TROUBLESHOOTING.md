# Railway Deployment Troubleshooting

## 🚨 Common Issues

### 1. Healthcheck Failing

**Symptoms:**
- Service unavailable errors
- Healthcheck timeout
- Server not starting

**Solutions:**
1. **Check Railway logs** for specific error messages
2. **Verify environment variables** are set correctly
3. **Check database connection** - ensure `DATABASE_URL` is set
4. **Verify Supabase credentials** are correct

### 2. Database Migration Failures

**Symptoms:**
- Migration errors in logs
- Tables don't exist
- 400/500 errors on API calls

**Solutions:**
1. **Run migrations manually**:
   ```bash
   railway run npm run migrate
   ```
2. **Check database URL** format
3. **Verify database permissions**
4. **Reset database** if needed:
   ```bash
   railway run npx prisma migrate reset
   ```

### 3. Authentication Issues

**Symptoms:**
- 401/403 errors
- Login failures
- Token validation errors

**Solutions:**
1. **Verify Supabase environment variables**:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_JWT_SECRET`
2. **Check CORS settings** in Supabase
3. **Verify user roles** are set correctly

## 🔧 Debugging Steps

### 1. Check Railway Logs
```bash
# Install Railway CLI
npm install -g @railway/cli

# View logs
railway logs
```

### 2. Test Database Connection
```bash
# Connect to Railway database
railway run npx prisma db pull

# Run migrations
railway run npm run migrate

# Test connection
railway run npx prisma studio
```

### 3. Test Environment Variables
```bash
# List all variables
railway variables

# Set missing variables
railway variables set SUPABASE_URL=https://your-project.supabase.co
railway variables set SUPABASE_ANON_KEY=your-anon-key
railway variables set SUPABASE_JWT_SECRET=your-jwt-secret
```

### 4. Manual Server Start
```bash
# Start server manually to see errors
railway run npm start
```

## 📋 Environment Variables Checklist

Make sure these are set in Railway:

- [ ] `DATABASE_URL` (auto-set by Railway)
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_ANON_KEY`
- [ ] `SUPABASE_JWT_SECRET`
- [ ] `GOTRUE_SITE_URL`
- [ ] `NODE_ENV=production`

## 🚀 Quick Fixes

### Reset Everything
```bash
# Reset database
railway run npx prisma migrate reset

# Redeploy
railway up
```

### Manual Migration
```bash
# Run migrations
railway run npm run migrate

# Seed data
railway run npm run db:seed
```

### Check Health
```bash
# Test health endpoint
curl https://your-app.up.railway.app/health

# Test database health
curl https://your-app.up.railway.app/healthz
```

## 📞 Getting Help

1. **Check Railway logs** for specific error messages
2. **Verify all environment variables** are set
3. **Test database connection** manually
4. **Check Supabase dashboard** for auth issues
5. **Review this troubleshooting guide**

## 🔍 Common Error Messages

### "Invalid `prisma.incident.findMany()` invocation"
- **Cause**: Database tables don't exist
- **Fix**: Run migrations

### "Environment variable not found: DATABASE_URL"
- **Cause**: Database not provisioned
- **Fix**: Add PostgreSQL service in Railway

### "Invalid token"
- **Cause**: JWT secret mismatch
- **Fix**: Update `SUPABASE_JWT_SECRET`

### "Service unavailable"
- **Cause**: Server not starting
- **Fix**: Check logs for startup errors 