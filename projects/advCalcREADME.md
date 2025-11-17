# Advanced Calculator

## Overview

This is a cool and advanced calculator built with pure HTML, CSS, and JavaScript. It's designed to be a standalone project page for your portfolio, featuring:

- **Basic Arithmetic**: Addition, subtraction, multiplication, division.
- **Scientific Functions**: sin, cos, tan, log (base 10), sqrt, power (^), exponential (e^x), π constant.
- **Memory Operations**: M+ (add to memory), M- (subtract from memory), MR (recall), MC (clear).
- **Calculation History**: Keeps last 10 calculations with scrollable list.
- **Keyboard Support**: Use number keys, operators, Enter (=), Escape (clear), Backspace (delete).
- **Theme Integration**: Matches your portfolio's dynamic hue from localStorage (via theme-persist.js).
- **Responsive Design**: Works on mobile/desktop, with touch-friendly buttons.
- **Error Handling**: Catches invalid expressions (e.g., division by zero) and shows "Error".

No external libraries — pure vanilla JS for lightweight performance (~5KB).

## Features in Detail

### User Interface

- **Display**: Large, scrollable screen for long expressions.
- **Buttons**: Grid layout with color-coded categories (ops, sci, mem, clear).
- **Hover Effects**: Buttons lift on hover for premium feel.
- **History Panel**: Below calculator, shows equations + results.

### Advanced Capabilities

- **Scientific Mode**: Handles trigonometry (radians), logs, exponents.
- **Parentheses**: Supports nested expressions like `sin(30) * (2 + 3)`.
- **Constants**: π button for quick math.
- **Memory**: Persistent during session (resets on refresh).

### Integration with Your Portfolio

- **Themeable**: Uses `--hue` var for colors.
- **Back Link**: Top-left "Back to Portfolio" button.
- **Favicon**: Custom calculator icon (add calculator.ico to assets/).

## Installation / Setup

1. **Place Files**:

   - Put `advancedCalculator.html` in `/projects/`.
   - Put `advCalc.js` in root or `/projects/` (adjust <script src> if needed).

2. **Link from Portfolio**:
   In `index.html` #projects list:
   ```html
   <li>
     <a href="projects/advancedCalculator.html" target="_blank"
       >Advanced Calculator</a
     >
   </li>
   ```
