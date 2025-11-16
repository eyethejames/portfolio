/* -------------------------------------------------
   theme-persist.js – put in the root
   ------------------------------------------------- */
(() => {
  const hue = localStorage.getItem("selectedHue") || "180";
  const name = localStorage.getItem("myName") || "eyeTheJames";

  // CSS variables
  document.documentElement.style.setProperty("--hue", hue);
  const bg = `hsl(${hue}, 50%, 25%)`;
  const text = getContrastingText(hslToHex(hue, 50, 25));

  document.body.style.background = bg;
  document.body.style.color = text;
  document.body.dataset.myName = name;

  // ---- Helper: HSL → HEX -------------------------------------------------
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

  // ---- Helper: contrasting text -----------------------------------------
  function getContrastingText(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum > 0.5 ? "#000" : "#fff";
  }

  // ---- Optional: tint the favicon ---------------------------------------
  const faviconPath = location.pathname.includes("projects")
    ? "../assets/faviconWhiteFlower.ico"
    : "assets/faviconWhiteFlower.ico";
  const img = new Image();
  img.src = faviconPath;
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 32;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, 32, 32);
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = hslToHex(hue, 70, 50);
    ctx.fillRect(0, 0, 32, 32);
    const link =
      document.querySelector('link[rel*="icon"]') ||
      document.createElement("link");
    link.rel = "shortcut icon";
    link.href = canvas.toDataURL();
    document.head.appendChild(link);
  };
})();
