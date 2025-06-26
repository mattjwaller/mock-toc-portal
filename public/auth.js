// Authentication module for TOC Portal
class AuthManager {
  constructor() {
    this.token = localStorage.getItem('auth_token');
    this.user = JSON.parse(localStorage.getItem('auth_user') || 'null');
    this.supabaseUrl = null;
    this.supabaseKey = null;
  }

  // Initialize with Supabase credentials
  init(supabaseUrl, supabaseKey) {
    this.supabaseUrl = supabaseUrl;
    this.supabaseKey = supabaseKey;
  }

  // Get auth headers for API requests
  getAuthHeaders() {
    if (this.token) {
      return {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      };
    }
    return {
      'Content-Type': 'application/json'
    };
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // Get current user
  getCurrentUser() {
    return this.user;
  }

  // Login with email/password
  async login(email, password) {
    try {
      const response = await fetch(`${this.supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseKey
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      this.token = data.access_token;
      this.user = data.user;
      
      localStorage.setItem('auth_token', this.token);
      localStorage.setItem('auth_user', JSON.stringify(this.user));
      
      return { success: true, user: this.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }

  // Logout
  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    window.location.reload();
  }

  // Refresh token
  async refreshToken() {
    if (!this.token) return false;
    
    try {
      const response = await fetch(`${this.supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseKey
        },
        body: JSON.stringify({ refresh_token: this.token })
      });

      if (response.ok) {
        const data = await response.json();
        this.token = data.access_token;
        localStorage.setItem('auth_token', this.token);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    
    return false;
  }
}

// Global auth instance
window.authManager = new AuthManager(); 