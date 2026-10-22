var mainText = document.getElementById("main-text");
var historyText = document.getElementById("history-text");
var historyList = document.getElementById("history-list");
var noHistory = document.getElementById("no-history");

var current = "0";      
var previous = "";      
var operator = "";     
var startNew = false;   
var historyItems = [];       

var symbols = { "+": "+", "-": "−", "*": "×", "/": "÷" };


function updateScreen() {
  mainText.textContent = current;
  if (operator !== "") {
    historyText.textContent = previous + " " + symbols[operator];
  } else {
    historyText.textContent = "";
  }
}


function pressNumber(num) {
  if (startNew || current === "0" || current === "Error") {
    current = num;
    startNew = false;
  } else {
    if (current.length < 14) {
      current = current + num;
    }
  }
  updateScreen();
}


// decimal point
function pressDot() {
  if (startNew || current === "Error") {
    current = "0";
    startNew = false;
  }
  if (current.indexOf(".") === -1) {
    current = current + ".";
  }
  updateScreen();
}


// do the math
function doMath(a, b, op) {
  a = parseFloat(a);
  b = parseFloat(b);
  var result = 0;

  if (op === "+") result = a + b;
  if (op === "-") result = a - b;
  if (op === "*") result = a * b;
  if (op === "/") result = a / b;

  // this fixes stuff like 0.1 + 0.2 = 0.30000000000000004
  result = Math.round(result * 1000000000) / 1000000000;
  return String(result);
}


// when + - × ÷ is pressed
function pressOperator(op) {
  if (current === "Error") return;

  // if we already have an operator, finish that one first
  if (operator !== "" && startNew === false) {
    pressEquals();
  }

  previous = current;
  operator = op;
  startNew = true;
  updateScreen();
}


// equals button
function pressEquals() {
  if (operator === "") return;

  // can't divide by zero
  if (operator === "/" && parseFloat(current) === 0) {
    current = "Error";
    operator = "";
    previous = "";
    startNew = true;
    updateScreen();
    return;
  }

  var answer = doMath(previous, current, operator);
  var text = previous + " " + symbols[operator] + " " + current;

  addToHistory(text, answer);

  current = answer;
  operator = "";
  previous = "";
  startNew = true;
  updateScreen();
}


// AC button
function pressClear() {
  current = "0";
  previous = "";
  operator = "";
  startNew = false;
  updateScreen();
}


// DEL button
function pressDelete() {
  if (startNew || current === "Error") return;
  if (current.length > 1) {
    current = current.slice(0, -1);
  } else {
    current = "0";
  }
  if (current === "-") current = "0";
  updateScreen();
}


// +/- button
function pressNegative() {
  if (current === "0" || current === "Error") return;
  if (current.charAt(0) === "-") {
    current = current.slice(1);
  } else {
    current = "-" + current;
  }
  updateScreen();
}


// % button
function pressPercent() {
  if (current === "Error") return;
  current = String(parseFloat(current) / 100);
  startNew = true;
  updateScreen();
}


// ---------- history ----------
function addToHistory(text, answer) {
  historyItems.unshift({ text: text, answer: answer });
  if (historyItems.length > 20) historyItems.pop();
  showHistory();
}

function showHistory() {
  historyList.innerHTML = "";

  for (var i = 0; i < historyItems.length; i++) {
    var li = document.createElement("li");
    li.innerHTML = "<small>" + historyItems[i].text + " =</small><strong>" + historyItems[i].answer + "</strong>";
    li.setAttribute("data-answer", historyItems[i].answer);

    // click an old answer to use it again
    li.addEventListener("click", function () {
      current = this.getAttribute("data-answer");
      operator = "";
      startNew = true;
      updateScreen();
    });

    historyList.appendChild(li);
  }

  if (historyItems.length === 0) {
    noHistory.style.display = "block";
  } else {
    noHistory.style.display = "none";
  }
}

document.getElementById("clear-history").addEventListener("click", function () {
  historyItems = [];
  showHistory();
});


// ---------- connect the buttons ----------
var numberButtons = document.querySelectorAll(".number");
for (var i = 0; i < numberButtons.length; i++) {
  numberButtons[i].addEventListener("click", function () {
    if (this.id === "dot") {
      pressDot();
    } else {
      pressNumber(this.textContent);
    }
  });
}

var operatorButtons = document.querySelectorAll(".operator");
for (var j = 0; j < operatorButtons.length; j++) {
  operatorButtons[j].addEventListener("click", function () {
    pressOperator(this.getAttribute("data-op"));
  });
}

document.getElementById("equals").addEventListener("click", pressEquals);
document.getElementById("clear").addEventListener("click", pressClear);
document.getElementById("delete").addEventListener("click", pressDelete);
document.getElementById("negative").addEventListener("click", pressNegative);
document.getElementById("percent").addEventListener("click", pressPercent);


// ---------- keyboard support ----------
document.addEventListener("keydown", function (e) {
  var key = e.key;

  if (key >= "0" && key <= "9") pressNumber(key);
  else if (key === ".") pressDot();
  else if (key === "+" || key === "-" || key === "*" || key === "/") pressOperator(key);
  else if (key === "Enter" || key === "=") pressEquals();
  else if (key === "Backspace") pressDelete();
  else if (key === "Escape") pressClear();
});


// ---------- themes ----------
var themeButtons = document.querySelectorAll(".dot");
for (var k = 0; k < themeButtons.length; k++) {
  themeButtons[k].addEventListener("click", function () {
    document.body.className = this.getAttribute("data-theme");
    localStorage.setItem("calc-theme", this.getAttribute("data-theme"));
  });
}

// load saved theme if there is one
var savedTheme = localStorage.getItem("calc-theme");
if (savedTheme) {
  document.body.className = savedTheme;
}

showHistory();
updateScreen();