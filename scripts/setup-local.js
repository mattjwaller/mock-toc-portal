#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🚀 Setting up local TOC Portal environment...\n');

// Check if .env file exists
const envPath = join(projectRoot, '.env');
if (!existsSync(envPath)) {
    console.log('📝 Creating .env file...');
    
    const envContent = `# Database - Update this with your local PostgreSQL URL or Railway URL
DATABASE_URL="postgresql://username:password@localhost:5432/toc_portal"

# Supabase Authentication - Update with your Supabase credentials
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_JWT_SECRET="your-supabase-jwt-secret"

# Application
PORT=8080
GOTRUE_SITE_URL="http://localhost:8080"
`;
    
    writeFileSync(envPath, envContent);
    console.log('✅ Created .env file');
    console.log('⚠️  Please update the DATABASE_URL in .env with your actual database connection string');
    console.log('⚠️  Please update the Supabase credentials in .env with your actual values\n');
} else {
    console.log('✅ .env file already exists');
}

// Check if DATABASE_URL is set
try {
    const envContent = readFileSync(envPath, 'utf8');
    if (!envContent.includes('DATABASE_URL=') || envContent.includes('DATABASE_URL="postgresql://username:password@localhost:5432/toc_portal"')) {
        console.log('⚠️  DATABASE_URL not configured or using default value');
        console.log('⚠️  Please update .env with your actual DATABASE_URL\n');
    } else {
        console.log('✅ DATABASE_URL is configured');
    }
} catch (error) {
    console.log('❌ Error reading .env file:', error.message);
}

// Try to run database setup
console.log('🔧 Setting up database...');
try {
    // Generate Prisma client
    console.log('📦 Generating Prisma client...');
    execSync('npx prisma generate', { cwd: projectRoot, stdio: 'inherit' });
    
    // Push database schema
    console.log('📊 Creating database tables...');
    execSync('npx prisma db push', { cwd: projectRoot, stdio: 'inherit' });
    
    // Seed database
    console.log('🌱 Seeding database with sample data...');
    execSync('npm run db:seed', { cwd: projectRoot, stdio: 'inherit' });
    
    console.log('\n🎉 Local setup completed successfully!');
    console.log('🚀 You can now start the development server with: npm run dev');
    
} catch (error) {
    console.log('\n❌ Database setup failed:', error.message);
    console.log('\n📋 Troubleshooting:');
    console.log('1. Make sure PostgreSQL is running locally');
    console.log('2. Update DATABASE_URL in .env with correct connection string');
    console.log('3. Or use Railway database URL if you have one');
    console.log('4. Run: npm run db:seed to seed the database manually');
}

console.log('\n📚 Next steps:');
console.log('1. Update .env with your actual database and Supabase credentials');
console.log('2. Run: npm run dev to start the development server');
console.log('3. Open http://localhost:8080 in your browser'); 