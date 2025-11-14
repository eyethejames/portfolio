// Global username default
let username = "anonym";

// DOMContentLoaded : Set up initial event listeners and animations
document.addEventListener("DOMContentLoaded", () => {
  const openingBlock = document.getElementById("openingBlock");
  const input = document.getElementById("username");
  const btn = document.getElementById("usernameBtn");

  // Force reflow and add visible class for opening block
  openingBlock.offsetHeight;
  setTimeout(() => {
    openingBlock.classList.add("visible");
  }, 150);

  // Enable username button only when input has text
  input.addEventListener("input", () => {
    btn.disabled = !input.value.trim();
  });
});

// Starts the process: Fade out opening and show username card
function getStarted() {
  const openingBlock = document.getElementById("openingBlock");
  const usernameCard = document.getElementById("usernameCard");

  openingBlock.classList.add("removing");

  openingBlock.addEventListener(
    "transitionend",
    function handler() {
      openingBlock.remove();
      usernameCard.classList.add("visible");
      setTimeout(() => {
        usernameCard.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
      openingBlock.removeEventListener("transitionend", handler);
    },
    { once: true }
  );
}

// Initizalize session: Set username -> Fade out username card -> Show name card
function initSession(goIncognito = false) {
  // Get username and span
  const usernameInput = document.getElementById("username");
  const usernameCard = document.getElementById("usernameCard");
  const nameCard = document.getElementById("nameCard");

  // Determine and store username
  username = goIncognito ? "anonym" : usernameInput.value.trim() || "anonym";
  localStorage.setItem("username", username);

  // Animate out username card -> Show name card
  usernameCard.classList.add("removing");

  usernameCard.addEventListener(
    "transitionend",
    function handler() {
      usernameCard.remove();
      nameCard.classList.add("visible");
      setTimeout(() => {
        nameCard.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
      usernameCard.removeEventListener("transitionend", handler);
    },
    { once: true }
  );
}

// Change name: Handle selection, modal for no selection and update UI
function changeName() {
  const select = document.getElementById("nameChoice");
  const nameInputContainer = document.getElementById("nameInputContainer");
  const nameSpan = document.getElementById("selectedName");
  const modal = document.getElementById("nameModal");
  const modalCancel = document.getElementById("modalCancel");
  const modalOk = document.getElementById("modalOk");

  let selectedValue = select.value;

  // If no value is selected -> Popup Modal
  if (!selectedValue) {
    modal.style.display = "flex";
    modalCancel.onclick = () => (modal.style.display = "none");
    modalOk.onclick = () => {
      modal.style.display = "none";
      selectedValue = "The Beast";
      updateName(selectedValue);
    };
    return;
  }

  // Update name
  updateName(selectedValue);

  function updateName(value) {
    nameSpan.innerText = value;
    localStorage.setItem("myName", value);
    nameInputContainer.remove();

    // Show color card
    const colorCard = document.getElementById("colorCard");
    colorCard.classList.add("visible");
    setTimeout(() => {
      colorCard.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }
}

// Handle keyboard navigation for hue slider
function handleKey(e) {
  const slider = e.target;
  let change = 0;

  if (e.key === "ArrowLeft") change = -5;
  else if (e.key === "ArrowRight") change = 5;
  else if (e.key === "ArrowUp") change = 10;
  else if (e.key === "ArrowDown") change = -10;

  if (change !== 0) {
    e.preventDefault();
    const newValue = parseInt(slider.value) + change;
    if (newValue >= 0 && newValue <= 360) {
      slider.value = newValue;
      previewColor(newValue);
    }
  }
}

// Map hue to color name (closest match)
function getColorName(hue) {
  const colorMap = {
    0: "Blood Red",
    15: "Dark Orange",
    30: "Burnt Orange",
    45: "Deep Gold",
    60: "Olive",
    75: "Forest Lime",
    90: "Moss Green",
    105: "Jungle Green",
    120: "Emerald",
    135: "Teal",
    150: "Deep Cyan",
    165: "Midnight Blue",
    180: "Steel Blue",
    195: "Navy",
    210: "Indigo",
    225: "Royal Blue",
    240: "Dark Violet",
    255: "Plum",
    270: "Magenta",
    285: "Deep Rose",
    300: "Crimson",
    315: "Wine Red",
    330: "Maroon",
    345: "Dark Scarlet",
  };

  const keys = Object.keys(colorMap).map(Number);
  const closest = keys.reduce((a, b) =>
    Math.abs(b - hue) < Math.abs(a - hue) ? b : a
  );
  return colorMap[closest];
}

// Live preview of changing background color with name
function previewColor(hue) {
  const hex = hslToHex(hue, 50, 25);
  const colorName = getColorName(hue);

  document.getElementById("hueValue").textContent = `${colorName} (${hue})`;
  document.body.style.background = hex;
  document.body.style.color = getContrastingText(hex);
}

// Submit color: Lock in choice and show welcome screen
function submitColor() {
  const slider = document.getElementById("hueSlider");
  const nameCard = document.getElementById("nameCard");
  const colorCard = document.getElementById("colorCard");
  const hue = slider.value;
  const colorName = getColorName(hue);
  const myName = document.getElementById("selectedName").innerText;

  // Remove name and color cards
  nameCard.remove();
  colorCard.remove();

  // Show welcome screen and populate with inputs
  const welcome = document.getElementById("welcomeScreen");
  welcome.style.display = "block";

  document.getElementById("finalName").innerText = myName;
  document.getElementById("finalHue").innerText = colorName;
  document.getElementById("usersName").innerText =
    localStorage.getItem("username") || "anonym";

  // Send to Google Sheets
  fetch(
    "https://script.google.com/macros/s/AKfycbzQy_LHGbabtSbzdzFLsPUgVy7pDwAorOEpHTL2mG0zhdCvYykbAxll2-r2u77Q10OB4g/exec",
    {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        username: localStorage.getItem("username") || "anonym",
        myName: myName,
        color: colorName,
        hue: hue,
      }),
    }
  );
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

// Get contrasting text color
function getContrastingText(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

// Enter portfolio: Remove welcome card and show main content
function enterPortfolio() {
  document.getElementById("welcomeScreen").remove();
  document.getElementById("mainContent").style.display = "block";
}
