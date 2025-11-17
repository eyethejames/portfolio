// advCalc.js - Advanced Calculator Logic

let currentInput = "0";
let memory = 0;
let history = [];
let advancedMode = false;

// Update display
function updateDisplay() {
  document.getElementById("display").innerText = currentInput || "0";
}

// Append to input
function append(value) {
  if (currentInput === "0" && !isNaN(value)) {
    currentInput = value;
  } else {
    currentInput += value;
  }
  updateDisplay();
}

// Clear display
function clearDisplay() {
  currentInput = "0";
  updateDisplay();
}

// Calculate result
function calculate() {
  try {
    const result = eval(
      currentInput
        .replace("pow", "Math.pow")
        .replace("sqrt", "Math.sqrt")
        .replace("sin", "Math.sin")
        .replace("cos", "Math.cos")
        .replace("tan", "Math.tan")
        .replace("log", "Math.log10")
        .replace("exp", "Math.exp")
        .replace("PI", "Math.PI")
    );
    history.push(`${currentInput} = ${result}`);
    updateHistory();
    currentInput = result.toString();
  } catch (error) {
    currentInput = "Error";
  }
  updateDisplay();
}

// Memory functions
function memoryRecall() {
  currentInput = memory.toString();
  updateDisplay();
}

function memoryClear() {
  memory = 0;
}

function memoryAdd() {
  memory += parseFloat(currentInput) || 0;
}

function memorySubtract() {
  memory -= parseFloat(currentInput) || 0;
}

// Update history list
function updateHistory() {
  const historyDiv = document.getElementById("history");
  historyDiv.innerHTML = "<h3>History</h3>";
  history.slice(-10).forEach((entry) => {
    const p = document.createElement("p");
    p.textContent = entry;
    historyDiv.appendChild(p);
  });
}

// Toggle advanced mode
function toggleAdvanced() {
  advancedMode = !advancedMode;
  const advancedSection = document.getElementById("advancedSection");
  const toggleBtn = document.getElementById("toggleBtn");

  if (advancedMode) {
    advancedSection.style.display = "grid";
    toggleBtn.textContent = "Basic Mode";
    toggleBtn.classList.add("active");
  } else {
    advancedSection.style.display = "none";
    toggleBtn.textContent = "Advanced Mode";
    toggleBtn.classList.remove("active");
  }
}

// Keyboard support
document.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") append(e.key);
  if (e.key === ".") append(".");
  if (e.key === "+") append("+");
  if (e.key === "-") append("-");
  if (e.key === "*") append("*");
  if (e.key === "/") append("/");
  if (e.key === "Enter") calculate();
  if (e.key === "Escape") clearDisplay();
  if (e.key === "Backspace") currentInput = currentInput.slice(0, -1) || "0";
  updateDisplay();
});
