/**
 * Session Synchronization Utility
 * Keeps authentication state synchronized across browser tabs
 */

export class SessionSync {
  private static instance: SessionSync;
  private listeners: Set<(isAuthenticated: boolean) => void> = new Set();
  private checkInterval: NodeJS.Timeout | null = null;
  private lastAuthState: boolean | null = null;

  private constructor() {
    // Listen for storage events (cross-tab communication)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageChange.bind(this));
      window.addEventListener('beforeunload', this.cleanup.bind(this));
    }
  }

  static getInstance(): SessionSync {
    if (!SessionSync.instance) {
      SessionSync.instance = new SessionSync();
    }
    return SessionSync.instance;
  }

  /**
   * Start monitoring session state across tabs
   */
  startMonitoring() {
    if (this.checkInterval) return;

    // Check auth status every 30 seconds
    this.checkInterval = setInterval(async () => {
      await this.checkAuthStatus();
    }, 30000);

    // Initial check
    this.checkAuthStatus();
  }

  /**
   * Stop monitoring session state
   */
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Add listener for auth state changes
   */
  addListener(callback: (isAuthenticated: boolean) => void) {
    this.listeners.add(callback);
  }

  /**
   * Remove listener
   */
  removeListener(callback: (isAuthenticated: boolean) => void) {
    this.listeners.delete(callback);
  }

  /**
   * Check current authentication status
   */
  private async checkAuthStatus() {
    try {
      const response = await fetch('/api/auth/status', {
        method: 'GET',
        credentials: 'include',
      });

      const isAuthenticated = response.ok;
      
      // If auth state changed, notify all listeners
      if (this.lastAuthState !== isAuthenticated) {
        this.lastAuthState = isAuthenticated;
        this.notifyListeners(isAuthenticated);
        
        // Store state for cross-tab communication
        localStorage.setItem('cliqstr_auth_state', JSON.stringify({
          isAuthenticated,
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error('Session sync error:', error);
      // On error, assume not authenticated
      if (this.lastAuthState !== false) {
        this.lastAuthState = false;
        this.notifyListeners(false);
      }
    }
  }

  /**
   * Handle storage changes from other tabs
   */
  private handleStorageChange(event: StorageEvent) {
    if (event.key === 'cliqstr_auth_state' && event.newValue) {
      try {
        const authData = JSON.parse(event.newValue);
        const isAuthenticated = authData.isAuthenticated;
        
        // Only process if this is a recent change (within 5 seconds)
        const timeDiff = Date.now() - authData.timestamp;
        if (timeDiff < 5000) {
          this.lastAuthState = isAuthenticated;
          this.notifyListeners(isAuthenticated);
        }
      } catch (error) {
        console.error('Error parsing auth state from storage:', error);
      }
    }
  }

  /**
   * Notify all listeners of auth state change
   */
  private notifyListeners(isAuthenticated: boolean) {
    this.listeners.forEach(callback => {
      try {
        callback(isAuthenticated);
      } catch (error) {
        console.error('Error in session sync listener:', error);
      }
    });
  }

  /**
   * Manually trigger sign out across all tabs
   */
  async signOutAllTabs() {
    try {
      // Call sign out API
      await fetch('/api/sign-out', {
        method: 'POST',
        credentials: 'include',
      });

      // Update state immediately
      this.lastAuthState = false;
      this.notifyListeners(false);
      
      // Notify other tabs
      localStorage.setItem('cliqstr_auth_state', JSON.stringify({
        isAuthenticated: false,
        timestamp: Date.now()
      }));

      // Redirect to sign in
      window.location.href = '/sign-in';
    } catch (error) {
      console.error('Error signing out all tabs:', error);
    }
  }

  /**
   * Cleanup when tab is closing
   */
  private cleanup() {
    this.stopMonitoring();
  }
}

// Export singleton instance
export const sessionSync = SessionSync.getInstance();
