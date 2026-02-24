// =============================================================================
// AUTH MODULE - Google Apps Script IAM
// =============================================================================
// This module handles authentication against a Google Apps Script backend.
//
// TODO: @Jakob - Deploy the GAS script (see /gas/auth-script.js) and update
// the AUTH_ENDPOINT below with your deployment URL.
// =============================================================================

const AuthModule = (function () {
  // ===========================================================================
  // CONFIGURATION - Update this after deploying your GAS script
  // ===========================================================================
  const AUTH_ENDPOINT = "YOUR_GAS_AUTH_ENDPOINT_HERE";
  // Example: "https://script.google.com/macros/s/AKfycbx.../exec"

  const SESSION_KEY = "portfolio_auth_session";
  const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

  // ===========================================================================
  // PRIVATE METHODS
  // ===========================================================================

  /**
   * Get current session from sessionStorage
   */
  function getSession() {
    try {
      const sessionData = sessionStorage.getItem(SESSION_KEY);
      if (!sessionData) return null;

      const session = JSON.parse(sessionData);

      // Check if session has expired
      if (Date.now() > session.expiresAt) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }

      return session;
    } catch (e) {
      console.error("Error reading session:", e);
      return null;
    }
  }

  /**
   * Save session to sessionStorage
   */
  function saveSession(userData) {
    const session = {
      user: userData,
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_DURATION_MS,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  /**
   * Clear session from sessionStorage
   */
  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  // ===========================================================================
  // PUBLIC API
  // ===========================================================================

  return {
    /**
     * Authenticate user against GAS backend
     * Uses GET request with URL parameters to avoid CORS preflight issues.
     * Password is Base64 encoded for URL safety.
     *
     * @param {string} username
     * @param {string} password
     * @returns {Promise<{success: boolean, message?: string, user?: object}>}
     */
    async login(username, password) {
      try {
        // Base64 encode password for URL safety
        const encodedPassword = btoa(unescape(encodeURIComponent(password)));

        // Build URL with query parameters (GET request avoids CORS preflight)
        const url = new URL(AUTH_ENDPOINT);
        url.searchParams.append("action", "login");
        url.searchParams.append("username", username);
        url.searchParams.append("password", encodedPassword);

        const response = await fetch(url.toString(), {
          method: "GET",
          // No special headers needed for GET - avoids CORS preflight
        });

        // GAS returns text, parse as JSON
        const text = await response.text();
        const result = JSON.parse(text);

        if (result.success) {
          saveSession({
            username: result.username,
            name: result.name,
            role: result.role || "user",
            loginTime: new Date().toISOString(),
          });
        }

        return result;
      } catch (error) {
        console.error("Login request failed:", error);
        return {
          success: false,
          message: "Kunne ikke koble til autentiseringsserver",
        };
      }
    },

    /**
     * Log out current user
     */
    logout() {
      clearSession();
      window.location.href = "admin-login.html";
    },

    /**
     * Check if user is currently authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
      return getSession() !== null;
    },

    /**
     * Get current user info
     * @returns {object|null}
     */
    getCurrentUser() {
      const session = getSession();
      return session ? session.user : null;
    },

    /**
     * Check if current user has a specific role
     * @param {string} requiredRole
     * @returns {boolean}
     */
    hasRole(requiredRole) {
      const session = getSession();
      if (!session) return false;

      const userRole = session.user.role;

      // Role hierarchy: admin > editor > user
      const roleHierarchy = { admin: 3, editor: 2, user: 1 };
      return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0);
    },

    /**
     * Require authentication - redirects to login if not authenticated
     * Call this at the top of protected pages
     */
    requireAuth() {
      if (!this.isAuthenticated()) {
        window.location.href = "admin-login.html";
        return false;
      }
      return true;
    },

    /**
     * Require specific role - redirects if insufficient permissions
     * @param {string} requiredRole
     */
    requireRole(requiredRole) {
      if (!this.requireAuth()) return false;

      if (!this.hasRole(requiredRole)) {
        alert("Du har ikke tilgang til denne siden.");
        window.location.href = "index.html";
        return false;
      }
      return true;
    },
  };
})();