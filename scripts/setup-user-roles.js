// Script to set up user roles in Supabase
// Run this in your browser console after logging into Supabase

console.log('Supabase User Role Setup Script');
console.log('================================');

// Function to set user role
async function setUserRole(userId, role) {
  try {
    const response = await fetch(`${window.TOC_CONFIG.SUPABASE_URL}/rest/v1/auth/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': window.TOC_CONFIG.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${authManager.token}`
      },
      body: JSON.stringify({
        user_metadata: { role: role }
      })
    });

    if (response.ok) {
      console.log(`✅ User ${userId} role set to ${role}`);
      return true;
    } else {
      console.error(`❌ Failed to set role for user ${userId}:`, await response.text());
      return false;
    }
  } catch (error) {
    console.error(`❌ Error setting role for user ${userId}:`, error);
    return false;
  }
}

// Function to list all users
async function listUsers() {
  try {
    const response = await fetch(`${window.TOC_CONFIG.SUPABASE_URL}/rest/v1/auth/users`, {
      headers: {
        'apikey': window.TOC_CONFIG.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${authManager.token}`
      }
    });

    if (response.ok) {
      const users = await response.json();
      console.log('📋 Available users:');
      users.forEach(user => {
        console.log(`- ${user.email} (ID: ${user.id}, Role: ${user.user_metadata?.role || 'none'})`);
      });
      return users;
    } else {
      console.error('❌ Failed to list users:', await response.text());
      return [];
    }
  } catch (error) {
    console.error('❌ Error listing users:', error);
    return [];
  }
}

// Function to set role for current user
async function setCurrentUserRole(role) {
  if (!authManager.isAuthenticated()) {
    console.error('❌ Not authenticated. Please log in first.');
    return false;
  }

  const user = authManager.getCurrentUser();
  console.log(`🔄 Setting role for current user (${user.email}) to ${role}...`);
  
  return await setUserRole(user.id, role);
}

// Export functions to global scope
window.setUserRole = setUserRole;
window.listUsers = listUsers;
window.setCurrentUserRole = setCurrentUserRole;

console.log('🚀 Functions available:');
console.log('- setCurrentUserRole("viewer") - Set current user as viewer');
console.log('- setCurrentUserRole("editor") - Set current user as editor');
console.log('- setCurrentUserRole("admin") - Set current user as admin');
console.log('- listUsers() - List all users');
console.log('- setUserRole(userId, role) - Set role for specific user');

console.log('');
console.log('💡 Quick setup:');
console.log('1. Make sure you are logged in');
console.log('2. Run: setCurrentUserRole("admin")');
console.log('3. Refresh the page and try accessing incidents again'); 