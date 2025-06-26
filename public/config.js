// Configuration for TOC Portal Frontend
window.TOC_CONFIG = {
  // These will be loaded from the backend API
  SUPABASE_URL: null,
  SUPABASE_ANON_KEY: null,
  
  // API base URL (usually the same as your Railway app URL)
  API_BASE_URL: window.location.origin,
  
  // App settings
  APP_NAME: 'TOC Portal',
  VERSION: '1.0.0'
};

// Load configuration from backend
async function loadConfig() {
  try {
    const response = await fetch('/api/config');
    if (response.ok) {
      const config = await response.json();
      Object.assign(window.TOC_CONFIG, config);
      console.log('Configuration loaded successfully');
    } else {
      console.error('Failed to load configuration');
    }
  } catch (error) {
    console.error('Error loading configuration:', error);
  }
}

// Helper function to get config values
window.getConfig = function(key) {
  return window.TOC_CONFIG[key];
};

// Load config when script loads
loadConfig(); 