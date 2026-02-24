const DEFAULT_HUE = 180;
const DEFAULT_USERNAME = "anonym";

const visitData = {
  username: DEFAULT_USERNAME,
  colorName: getColorName(DEFAULT_HUE),
  hueValue: DEFAULT_HUE,
};

// =============================================================================
// SECURITY FIX: API Endpoint Configuration
// =============================================================================
// TODO: @Jakob - Replace this with your authenticated backend endpoint
//
// PREVIOUS (INSECURE - hardcoded Google Apps Script URL):
// const API_ENDPOINT = "https://script.google.com/macros/s/AKfycbyfgPgbN6giXdD-rLqd4ghAnMAWF0ePMLOY425_J9aNf4OqDMjFCShPhjjpbT4m6hl4wA/exec";
//
// RECOMMENDED: Use environment variable or config, e.g.:
// const API_ENDPOINT = process.env.API_ENDPOINT || "/api/log-visit";
//
// For now, set your backend URL here:
const API_ENDPOINT = "YOUR_BACKEND_API_ENDPOINT_HERE";

// TODO: @Jakob - Add your authentication token/method here
// Options:
// 1. API Key in header: headers: { "Authorization": "Bearer YOUR_API_KEY" }
// 2. CSRF token from meta tag
// 3. Session-based auth if user is logged in
const AUTH_CONFIG = {
  // Add authentication headers here
  // "Authorization": "Bearer YOUR_API_KEY",
};
// =============================================================================

function logVisit(visitData) {
  // Send to backend API with authentication
  fetch(API_ENDPOINT, {
    method: "POST",
    mode: "cors", // Changed from "no-cors" to allow proper CORS with auth
    headers: {
      "Content-Type": "application/json",
      ...AUTH_CONFIG,
    },
    body: JSON.stringify(visitData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log("Visit logged successfully");
    })
    .catch((err) => {
      console.error("Failed to log visit:", err);
    });
}

// HSL to HEX converter
function hslToHex(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function applyCustomization() {
  // Get saved hue or use default
  const hue = localStorage.getItem("hue") || DEFAULT_HUE;
  const hex = hslToHex(parseInt(hue), 50, 25);

  // Apply background and text color
  document.body.style.backgroundColor = hex;
}

// Get contrasting text color
function getContrastingText(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

// Get color name for live preview
function getColorName(hue) {
  // Normalize hue
  hue = ((hue % 360) + 360) % 360;

  const colorMap = {
    0: "Blood Red",
    15: "Dark Orange",
    30: "Burnt Orange",
    45: "Deep Gold",
    60: "Golden Yellow",
    75: "Lime",
    90: "Forest Green",
    105: "Jungle Green",
    120: "Emerald",
    135: "Teal",
    150: "Deep Cyan",
    165: "Turquoise",
    180: "Steel Blue",
    195: "Ocean Blue",
    210: "Indigo",
    225: "Royal Blue",
    240: "Violet",
    255: "Plum",
    270: "Magenta",
    285: "Rose",
    300: "Crimson",
    315: "Wine",
    330: "Maroon",
    345: "Scarlet",
  };

  const keys = Object.keys(colorMap).map(Number);
  const closest = keys.reduce((a, b) =>
    Math.abs(b - hue) < Math.abs(a - hue) ? b : a
  );
  return colorMap[closest];
}
