#!/usr/bin/env node

// Test script to verify server startup
console.log('🧪 Testing TOC Portal startup...');

// Check environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'SUPABASE_URL', 
  'SUPABASE_ANON_KEY',
  'SUPABASE_JWT_SECRET'
];

console.log('\n📋 Environment Variables:');
console.log('========================');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: Set`);
  } else {
    console.log(`❌ ${varName}: Not set`);
  }
});

// Check if we can import the server
console.log('\n🔧 Testing imports...');
try {
  require('@prisma/client');
  console.log('✅ Prisma client can be imported');
} catch (error) {
  console.log('❌ Prisma client import failed:', error.message);
}

try {
  require('express');
  console.log('✅ Express can be imported');
} catch (error) {
  console.log('❌ Express import failed:', error.message);
}

// Check if dist files exist
const fs = require('fs');
const path = require('path');

console.log('\n📁 Checking build files...');
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  console.log('✅ dist directory exists');
  
  const serverPath = path.join(distPath, 'src', 'server.js');
  if (fs.existsSync(serverPath)) {
    console.log('✅ server.js exists in dist');
  } else {
    console.log('❌ server.js not found in dist');
  }
} else {
  console.log('❌ dist directory not found');
}

console.log('\n🚀 Startup test complete!');
console.log('💡 If all checks pass, the server should start successfully.'); 