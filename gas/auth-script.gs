// =============================================================================
// GOOGLE APPS SCRIPT - Authentication Backend
// =============================================================================
//
// SETUP INSTRUCTIONS FOR @Jakob:
//
// 1. Go to https://script.google.com and create a new project
// 2. Copy this entire file into the Code.gs file
// 3. Update the USERS object below with your admin credentials
// 4. Click "Deploy" -> "New deployment"
// 5. Select type: "Web app"
// 6. Set "Execute as": "Me"
// 7. Set "Who has access": "Anyone"
// 8. Click "Deploy" and copy the URL
// 9. Paste the URL into assets/js/auth.js (AUTH_ENDPOINT)
//
// SECURITY NOTES:
// - Passwords are stored as SHA-256 hashes (see hashPassword function)
// - To generate a hash, run: hashPassword("your-password") in GAS console
// - Never store plain text passwords!
// - Consider adding rate limiting for production use
//
// =============================================================================

// ===========================================================================
// USER DATABASE - Update with your users
// ===========================================================================
// To add a user:
// 1. Run hashPassword("thepassword") in the GAS execution log
// 2. Copy the hash and add it below

const USERS = {
  "admin": {
    passwordHash: "YOUR_HASHED_PASSWORD_HERE", // Run hashPassword("yourpassword") to get this
    role: "admin",
    name: "Administrator"
  },
  "jakob": {
    passwordHash: "YOUR_HASHED_PASSWORD_HERE",
    role: "admin",
    name: "Jakob"
  }
  // Add more users as needed
};

// ===========================================================================
// HELPER FUNCTIONS
// ===========================================================================

/**
 * Hash a password using SHA-256
 * Run this function to generate password hashes for USERS object
 *
 * Usage: In GAS, run hashPassword("mypassword") and check the execution log
 */
function hashPassword(password) {
  const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password);
  const hashHex = hash.map(byte => {
    const hex = (byte < 0 ? byte + 256 : byte).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');

  Logger.log("Password hash: " + hashHex);
  return hashHex;
}

/**
 * Verify a password against a stored hash
 */
function verifyPassword(password, storedHash) {
  const inputHash = hashPassword(password);
  return inputHash === storedHash;
}

/**
 * Create JSON response with CORS headers
 */
function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===========================================================================
// WEB APP ENDPOINTS
// ===========================================================================
//
// CORS FIX: Google Apps Script håndterer CORS på en spesiell måte.
// Vi bruker doGet med URL-parametere for å unngå CORS-problemer.
// Alternativt kan doPost brukes med 'mode: no-cors', men da får vi ikke
// lese responsen. Løsningen er å bruke doGet for alt.
// ===========================================================================

/**
 * Handle GET requests - Main endpoint for authentication
 * Using GET to avoid CORS preflight issues
 *
 * Parameters:
 * - action: "login" | "verify" | "health"
 * - username: (for login)
 * - password: (for login) - Base64 encoded for URL safety
 */
function doGet(e) {
  const params = e.parameter;
  const action = params.action || "health";

  switch (action) {
    case "login":
      return handleLoginGet(params);

    case "verify":
      return handleVerify(params);

    case "health":
    default:
      return createResponse({
        status: "ok",
        message: "Auth API is running",
        timestamp: new Date().toISOString()
      });
  }
}

/**
 * Handle POST requests (kept for compatibility, but GET is preferred)
 * Note: POST requests may have CORS issues from some origins
 */
function doPost(e) {
  try {
    // Parse incoming JSON
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    switch (action) {
      case "login":
        return handleLogin(data);

      case "verify":
        return handleVerify(data);

      default:
        return createResponse({
          success: false,
          message: "Unknown action: " + action
        });
    }
  } catch (error) {
    Logger.log("Error in doPost: " + error.toString());
    return createResponse({
      success: false,
      message: "Server error: " + error.toString()
    });
  }
}

/**
 * Handle login via GET request (CORS-safe)
 */
function handleLoginGet(params) {
  const username = (params.username || "").toLowerCase().trim();
  // Password is Base64 encoded in URL for safety
  let password = "";
  try {
    password = Utilities.newBlob(Utilities.base64Decode(params.password || "")).getDataAsString();
  } catch (e) {
    password = params.password || ""; // Fallback to plain if not encoded
  }

  // Check if user exists
  if (!USERS[username]) {
    Utilities.sleep(500);
    return createResponse({
      success: false,
      message: "Feil brukernavn eller passord"
    });
  }

  const user = USERS[username];

  // Verify password
  if (!verifyPassword(password, user.passwordHash)) {
    Utilities.sleep(500);
    return createResponse({
      success: false,
      message: "Feil brukernavn eller passord"
    });
  }

  // Login successful
  Logger.log("Successful login: " + username + " at " + new Date().toISOString());

  return createResponse({
    success: true,
    message: "Innlogget",
    username: username,
    role: user.role,
    name: user.name
  });
}

/**
 * Handle login request
 */
function handleLogin(data) {
  const username = (data.username || "").toLowerCase().trim();
  const password = data.password || "";

  // Check if user exists
  if (!USERS[username]) {
    // Use generic message to prevent user enumeration
    Utilities.sleep(500); // Slow down brute force attempts
    return createResponse({
      success: false,
      message: "Feil brukernavn eller passord"
    });
  }

  const user = USERS[username];

  // Verify password
  if (!verifyPassword(password, user.passwordHash)) {
    Utilities.sleep(500); // Slow down brute force attempts
    return createResponse({
      success: false,
      message: "Feil brukernavn eller passord"
    });
  }

  // Login successful
  Logger.log("Successful login: " + username + " at " + new Date().toISOString());

  return createResponse({
    success: true,
    message: "Innlogget",
    username: username,
    role: user.role,
    name: user.name
  });
}

/**
 * Handle token/session verification (optional)
 */
function handleVerify(data) {
  // For simple implementation, we don't use server-side sessions
  // The client manages the session via sessionStorage
  // This endpoint can be extended for more advanced use cases

  return createResponse({
    success: true,
    message: "Verification endpoint - extend as needed"
  });
}

// ===========================================================================
// OPTIONAL: LOGGING TO GOOGLE SHEETS
// ===========================================================================
// Uncomment and configure to log login attempts to a Google Sheet

/*
const LOG_SHEET_ID = "YOUR_GOOGLE_SHEET_ID";

function logLoginAttempt(username, success, ip) {
  try {
    const sheet = SpreadsheetApp.openById(LOG_SHEET_ID).getSheetByName("LoginLog");
    sheet.appendRow([
      new Date().toISOString(),
      username,
      success ? "SUCCESS" : "FAILED",
      ip || "unknown"
    ]);
  } catch (e) {
    Logger.log("Failed to log login attempt: " + e.toString());
  }
}
*/

// ===========================================================================
// TEST FUNCTION - Run this to test your setup
// ===========================================================================

function testSetup() {
  // Test password hashing
  const testPassword = "test123";
  const hash = hashPassword(testPassword);
  Logger.log("Test password '" + testPassword + "' hashes to: " + hash);

  // Verify the hash works
  const verified = verifyPassword(testPassword, hash);
  Logger.log("Password verification: " + (verified ? "PASSED" : "FAILED"));

  // Test creating a response
  const response = createResponse({ test: true });
  Logger.log("Response creation: " + (response ? "PASSED" : "FAILED"));

  Logger.log("\n=== SETUP COMPLETE ===");
  Logger.log("1. Update USERS object with your hashed passwords");
  Logger.log("2. Deploy as Web App");
  Logger.log("3. Copy deployment URL to auth.js");
}