# TOC Portal Deployment Guide

This guide covers deploying the TOC Portal to Railway with Supabase Auth integration.

## 🚀 Railway Deployment

### 1. Prerequisites

- Railway account
- Supabase project
- PostgreSQL database (Railway provides this)

### 2. Deploy to Railway

1. **Connect Repository**
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your TOC Portal repository

2. **Configure Environment Variables**
   In Railway dashboard, add these environment variables:

   ```env
   # Server
   PORT=8080
   NODE_ENV=production
   
   # Database (Railway will auto-generate this)
   DATABASE_URL=postgresql://...
   
   # Supabase Auth
   SUPABASE_JWT_SECRET=your-supabase-jwt-secret
   SUPABASE_URL=https://your-project.supabase.co
   GOTRUE_SITE_URL=https://your-app-name.up.railway.app
   ```

3. **Database Setup**
   - Railway will automatically create a PostgreSQL database
   - The `DATABASE_URL` will be auto-generated
   - Run database migrations: Railway will run `npm run postinstall` automatically

### 3. Supabase Auth Configuration

1. **Get Supabase Credentials**
   - Go to your Supabase project dashboard
   - Navigate to Settings → API
   - Copy the Project URL and anon public key

2. **Configure JWT Secret**
   - Go to Settings → Auth → JWT Settings
   - Copy the JWT Secret
   - Add to Railway environment variables as `SUPABASE_JWT_SECRET`

3. **Set Site URL**
   - Go to Settings → Auth → URL Configuration
   - Set `SITE_URL` to your Railway app URL:
     ```
     https://your-app-name.up.railway.app
     ```
   - This enables proper email links and redirect security

4. **Configure Auth Settings**
   - Go to Settings → Auth → Auth Settings
   - Enable the authentication providers you need
   - Configure email templates if needed

### 4. Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `PORT` | Server port | Yes | `8080` |
| `NODE_ENV` | Environment | Yes | `production` |
| `DATABASE_URL` | PostgreSQL connection | Yes | `postgresql://...` |
| `SUPABASE_JWT_SECRET` | JWT signing secret | Yes | `your-secret-here` |
| `SUPABASE_URL` | Supabase project URL | Yes | `https://project.supabase.co` |
| `GOTRUE_SITE_URL` | Base URL for auth emails | Yes | `https://app.up.railway.app` |

### 5. Deployment Verification

After deployment, verify these endpoints:

```bash
# Health check
curl https://your-app-name.up.railway.app/healthz

# Metrics (should return Prometheus format)
curl https://your-app-name.up.railway.app/metrics

# API (should return 401 without auth)
curl https://your-app-name.up.railway.app/api/incidents
```

### 6. Database Migration

If you need to run migrations manually:

```bash
# Connect to Railway shell
railway shell

# Run migrations
npx prisma migrate deploy

# Seed data (optional)
npm run seed
```

### 7. Monitoring & Logs

- **Logs**: View in Railway dashboard under your service
- **Metrics**: Available at `/metrics` endpoint
- **Health**: Monitored at `/healthz` endpoint

### 8. Troubleshooting

#### Common Issues

1. **Module not found errors**
   - Ensure `npm run build` completes successfully
   - Check that `dist/src/server.js` exists

2. **Database connection errors**
   - Verify `DATABASE_URL` is set correctly
   - Check that Prisma client is generated (`npm run postinstall`)

3. **Auth errors**
   - Verify `SUPABASE_JWT_SECRET` matches your Supabase project
   - Check that `GOTRUE_SITE_URL` is set to your Railway URL

4. **Port binding errors**
   - Railway sets `PORT` automatically, don't override it
   - Ensure your app listens on `process.env.PORT`

#### Debug Commands

```bash
# Check build output
ls -la dist/src/

# Test server locally
npm run build && npm start

# Check environment variables
railway variables

# View logs
railway logs
```

### 9. Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Supabase Auth configured
- [ ] Health endpoint responding
- [ ] Metrics endpoint working
- [ ] API endpoints secured
- [ ] Logs being generated
- [ ] SSL certificate valid

### 10. Scaling

Railway automatically scales based on traffic. For custom scaling:

- Go to Railway dashboard
- Select your service
- Adjust CPU and memory allocation
- Set custom scaling rules if needed

### 11. Custom Domain

To add a custom domain:

1. Go to Railway dashboard
2. Select your service
3. Go to Settings → Domains
4. Add your custom domain
5. Update `GOTRUE_SITE_URL` to match
6. Update Supabase Auth settings

## 🔐 Security Considerations

1. **Environment Variables**: Never commit secrets to git
2. **JWT Secret**: Keep your Supabase JWT secret secure
3. **Database**: Use connection pooling in production
4. **CORS**: Configure CORS for your domain
5. **Rate Limiting**: Consider adding rate limiting for API endpoints

## 📊 Monitoring

The application includes:

- **Health checks**: `/healthz` endpoint
- **Metrics**: Prometheus-compatible `/metrics` endpoint
- **Structured logging**: JSON logs for aggregation
- **Error tracking**: Consider adding Sentry or similar

## 🆘 Support

For deployment issues:

1. Check Railway logs in dashboard
2. Verify environment variables
3. Test endpoints manually
4. Check Supabase Auth configuration
5. Review this deployment guide 