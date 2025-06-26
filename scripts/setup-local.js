#!/usr/bin/env node

// Local development setup script
console.log('🚀 TOC Portal Local Setup');
console.log('==========================');

console.log('\n📋 Required Environment Variables:');
console.log('===================================');
console.log('DATABASE_URL="postgresql://username:password@localhost:5432/toc_portal"');
console.log('SUPABASE_URL="https://your-project.supabase.co"');
console.log('SUPABASE_ANON_KEY="your-supabase-anon-key"');
console.log('SUPABASE_JWT_SECRET="your-supabase-jwt-secret"');
console.log('PORT=8080');
console.log('GOTRUE_SITE_URL="http://localhost:8080"');

console.log('\n🔧 Setup Steps:');
console.log('===============');
console.log('1. Create a .env file with the variables above');
console.log('2. Set up a local PostgreSQL database');
console.log('3. Run: npm run migrate:dev');
console.log('4. Run: npm run db:seed');
console.log('5. Run: npm run dev');

console.log('\n🌐 Railway Deployment:');
console.log('=====================');
console.log('1. Push to Railway');
console.log('2. Set environment variables in Railway dashboard');
console.log('3. Railway will automatically run migrations on deploy');

console.log('\n💡 Quick Railway Commands:');
console.log('==========================');
console.log('railway login');
console.log('railway link');
console.log('railway up');
console.log('railway logs');
console.log('railway variables set DATABASE_URL=your-db-url');
console.log('railway variables set SUPABASE_URL=your-supabase-url');
console.log('railway variables set SUPABASE_ANON_KEY=your-anon-key');
console.log('railway variables set SUPABASE_JWT_SECRET=your-jwt-secret'); 