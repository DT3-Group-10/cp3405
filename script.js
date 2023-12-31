"use strict";

/**
 * The function $ is a shorthand for document.querySelector.
 * @param x - The parameter `x` is a string representing a CSS selector.
 * @returns the result of the `document.querySelector(x)` method.
 */
const $ = (x) => {
  return document.querySelector(x);
};
/* The above code is written in JavaScript and it is creating a canvas element and getting its 2D
rendering context. It also selects some HTML elements using their IDs and assigns them to variables.
It defines an array of colors. */
const canvas = $("#canvas");
const ctx = canvas.getContext("2d");
const menu = $("#menu");
const darkBox = $("#darkBox");
const unitBox = $("#unitBox");
const foodValBox = $("#foodValBox");
const foodAmtBox = $("#foodAmtBox");
const colors = ["blue", "red", "green", "orange"];
/* The above code is declaring a constant variable called "controls" which is an array of arrays. Each
inner array represents a row of controls. The controls are represented by strings, where each string
represents a key on the keyboard. The first inner array represents the top row of controls, the
second inner array represents the second row of controls, and so on. */
const controls = [
  ["w", "a", "s", "d"],
  ["t", "f", "g", "h"],
  ["i", "j", "k", "l"],
  ["arrowup", "arrowleft", "arrowdown", "arrowright"],
];
/**
 * The function `shiftPlayer` takes in the current coordinates of a player's head and a direction, and
 * returns the next location of the player based on the direction.
 * @param p - The parameter `p` represents the current coordinates of the player's head. It is an array
 * with two elements, where the first element represents the x-coordinate and the second element
 * represents the y-coordinate.
 * @param d - The parameter `d` represents the direction in which the player should move. It is an
 * integer value ranging from 0 to 3, where:
 * @returns The function `shiftPlayer` returns the updated coordinates of the player's head after
 * shifting in the specified direction.
 */
const shiftPlayer = (p, d) => {
  // send coords of head [x, y] and direction and this gives the next location
  //var temp = [...p];
  switch (d) {
    case 0: // up
      p[1]--;
      break;
    case 1: // left
      p[0]--;
      break;
    case 2: // down
      p[1]++;
      break;
    case 3: // right
      p[0]++;
      break;
  }
  return p;
};

/* The above code is initializing variables and constants for a game. */
let startScore = 5;
let foodValue = 5;
let amtOfFood = 3;
const advanceRate = 4; // milliseconds that pass between each frame
let unit = 24;
const dimension = [0, 0];
const food = [];
let paused = true;
const nOfPlayers = 4;
let frameCounter = 0;
let startLocation = [
  [0, 0],
  [dimension[0] - 1, 0],
  [0, dimension[1] - 1],
  [dimension[0] - 1, dimension[1] - 1],
];
/* The above code is initializing variables and arrays in JavaScript. */
const startDirection = [3, 1, 3, 1];
const active = [false, false, false, false];
const deathRow = [false, false, false, false];
let body = [
  [[...startLocation[0]]],
  [[...startLocation[1]]],
  [[...startLocation[2]]],
  [[...startLocation[3]]],
];
/* The above code is declaring several variables and initializing them with empty arrays or values. */
const deadPlayers = [];
const playerFood = [[], [], [], []];
const keyQueue = [[], [], [], []];
const direction = [...startDirection];
const score = [];
const highscore = [0, 0, 0, 0];

/**
 * The function applies the settings chosen by the user and updates the corresponding variables and
 * elements on the page.
 */
function applySettings() {
  darkMode = Boolean(darkBox.checked);
  unit = Number(unitBox.value);
  $("#unitOut").innerText = unit;
  foodValue = Number(foodValBox.value);
  amtOfFood = Number(foodAmtBox.value);
  startScore = Number($("#startScoreBox").value);
  refreshColors();
}

/**
 * The function togglePause toggles the display of the menu element between "block" and "none" based on
 * the value of the paused variable.
 */
function togglePause() {
  paused = !paused;
  menu.style.display = paused ? "block" : "none";
}

/**
 * The function "resetOptions" resets various options and values to their default settings.
 */
function resetOptions() {
  darkBox.checked = false;
  unitBox.value = 24;
  $("#unitOut").innerText = unit;
  foodValBox.value = 5;
  foodAmtBox.value = 3;
  $("#startScoreBox").value = 5;
  $("#pFoodBox").checked = true;
  $("#loopBox").checked = false;
  applySettings();
}

/* The above code is handling keydown events in JavaScript. */
document.onkeydown = (e) => {
  if (e.key == "Escape") {
    togglePause();
  }
  if (!paused) {
    var key = e.key.toLowerCase();
    for (let p = 0; p < controls.length; p++) {
      if (active[p]) {
        for (let c = 0; c < controls[p].length; c++) {
          if (
            key == controls[p][c] &&
            c % 2 !=
              (keyQueue[p].length
                ? keyQueue[p][keyQueue[p].length - 1]
                : direction[p]) %
                2
          ) {
            keyQueue[p].push(c);
          }
        }
      }
    }
  }
  const num = Number(key) - 1;
  if (num < 4 && num >= 0 && e.target.tagName == "BODY") {
    // spawn players
    if (active[num]) {
      deathRow[num] = true;
    } else {
      score[num] = startScore;
    }
    active[num] = !active[num];
  }
};

/**
 * The function "directPlayers" is responsible for updating the positions of players in a game based on
 * their input and game rules.
 */
function directPlayers() {
  for (let i = 0; i < nOfPlayers; i++) {
    if (active[i]) {
      if (keyQueue[i].length > 0) {
        direction[i] = keyQueue[i][0];
        keyQueue[i].shift();
      }
      var potential = shiftPlayer([...body[i][0]], direction[i]);
      if (
        potential[0] < 0 ||
        potential[0] > dimension[0] - 1 ||
        potential[1] < 0 ||
        potential[1] > dimension[1] - 1
      ) {
        if ($("#loopBox").checked) {
          body[i].unshift([
            (potential[0] + dimension[0]) % dimension[0],
            (potential[1] + dimension[1]) % dimension[1],
          ]); // loops player head to other end of screen
        } else {
          deathRow[i] = true;
        }
      } else {
        body[i].unshift(potential);
        if (body[i].length > score[i]) {
          body[i].pop();
        }
      }
    }
  }
}

function generateFood() {
  let foodCheck = true;
  let foodX;
  let foodY;
  let loopCounter = 0;
  do {
    foodCheck = true;
    foodX = Math.floor(Math.random() * dimension[0]);
    foodY = Math.floor(Math.random() * dimension[1]);
    loopCounter++;
    for (let i = 0; i < nOfPlayers; i++) {
      for (const element of body[i]) {
        if (element[0] == foodX && element[1] == foodY) {
          foodCheck = false;
        }
        for (const f of food) {
          if (f[0] == foodX && f[1] == foodY) {
            foodCheck = false;
          }
        }
      }
    }
  } while (!foodCheck);
  food.unshift([foodX, foodY]);
}

function eatFood() {
  for (let i = 0; i < nOfPlayers; i++) {
    for (let e = 0; e < food.length; e++) {
      if (body[i][0][0] == food[e][0] && body[i][0][1] == food[e][1]) {
        score[i] += foodValue;
        if (score[i] > highscore[i]) {
          highscore[i] = score[i];
        }
        food.splice(e, 1);
        if (score[i] < 1) {
          deathRow[i] = true;
          continue;
        }
        while (body[i].length > score[i]) {
          body[i].pop();
        }
      }
    }
  }
}

function eatPlayerFood() {
  for (let i = 0; i < nOfPlayers; i++) {
    for (var e of playerFood) {
      for (const f = 0; f < e.length; e++) {
        if (body[i][0][0] == e[f][0] && body[i][0][1] == e[f][1] && active[i]) {
          score[i] += e[f][2];
          if (score[i] > highscore[i]) {
            highscore[i] = score[i];
          }
          e.splice(f, 1);
        }
      }
    }
  }
}

function die() {
  for (let i = 0; i < nOfPlayers; i++) {
    // player dying
    if (active[i]) {
      for (let e = 0; e < nOfPlayers; e++) {
        // player being run into
        if (active[e]) {
          for (let t = i == e ? 1 : 0; t < body[e].length; t++) {
            if (
              body[i][0][0] == body[e][t][0] &&
              body[i][0][1] == body[e][t][1]
            ) {
              deathRow[i] = true;
            }
          }
        }
      }
    }
  }
}

function killPlayers() {
  for (let i = 0; i < nOfPlayers; i++) {
    if (deathRow[i]) {
      var playerFoodValue =
        Math.floor(body[i].length / (foodValue * 2)) * foodValue;
      if (playerFoodValue > 0 && score[i] > 0 && $("#pFoodBox").checked) {
        playerFood[i].unshift([body[i][0][0], body[i][0][1], playerFoodValue]);
      }
      deadPlayers.unshift([[...body[i]], colors[i]]);
      body[i] = [[...startLocation[i]]];
      direction[i] = startDirection[i];
      score[i] = startScore;
      deathRow[i] = false;
    }
  }
}

function calculate() {
  for (let i = 0; i < food.length; i++) {
    if (food[i][0] > dimension[0] - 1 || food[i][1] > dimension[1] - 1) {
      food.splice(i, 1);
    }
  }
  directPlayers();
  eatFood();
  eatPlayerFood();
  if (food.length < amtOfFood) {
    generateFood();
  }
  die();
}

function resizeCanvas() {
  dimension[0] = Math.floor(innerWidth / unit);
  dimension[1] = Math.floor(innerHeight / unit);
  canvas.width = dimension[0] * unit;
  canvas.height = dimension[1] * unit;
  startLocation = [
    [0, 0],
    [dimension[0] - 1, 0],
    [0, dimension[1] - 1],
    [dimension[0] - 1, dimension[1] - 1],
  ];
}

function grid() {
  ctx.strokeStyle = "gray";
  for (var i = 0; i < dimension[0] + 1; i++) {
    ctx.beginPath();
    ctx.moveTo(i * unit, 0);
    ctx.lineTo(i * unit, canvas.height);
    ctx.stroke();
  }
  for (var i = 0; i < dimension[1] + 1; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * unit);
    ctx.lineTo(canvas.width, i * unit);
    ctx.stroke();
  }
}

function drawFood() {
  for (const i of food) {
    ctx.beginPath();
    ctx.arc(
      i[0] * unit + unit / 2,
      i[1] * unit + unit / 2,
      unit / 2,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "purple";
    ctx.fill();
  }
}

function drawPlayerFood() {
  for (let i = 0; i < playerFood.length; i++) {
    for (const f of playerFood[i]) {
      ctx.beginPath();
      ctx.arc(
        f[0] * unit + unit / 2,
        f[1] * unit + unit / 2,
        unit / 2,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = colors[i];
      ctx.fill();
    }
  }
}

function drawBody(b) {
  ctx.beginPath();
  ctx.moveTo(b[0][0] * unit + unit / 2, b[0][1] * unit + unit / 2);
  for (let s = 1; s < b.length; s++) {
    if (
      Math.abs(b[s - 1][0] - b[s][0]) > 1 ||
      Math.abs(b[s - 1][1] - b[s][1]) > 1
    ) {
      // if segments are detached
      ctx.lineTo(b[s - 1][0] * unit + unit / 2, b[s - 1][1] * unit + unit / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(b[s][0] * unit + unit / 2, b[s][1] * unit + unit / 2);
      ctx.lineTo(b[s][0] * unit + unit / 2, b[s][1] * unit + unit / 2);
    }
    if (
      s == b.length - 1 ||
      !(b[s - 1][0] == b[s + 1][0] || b[s - 1][1] == b[s + 1][1])
    ) {
      // Makes the lines of the snakes draw from points of turning instead of every segment
      ctx.lineTo(b[s][0] * unit + unit / 2, b[s][1] * unit + unit / 2);
    }
  }
  ctx.stroke();
}

function drawPlayers() {
  ctx.lineCap = "square";
  ctx.lineWidth = unit - 2;
  ctx.globalAlpha = 0.5;
  for (var i = 0; i < deadPlayers.length; i++) {
    ctx.strokeStyle = deadPlayers[i][1];
    drawBody(deadPlayers[i][0]);
  }
  for (var i = 0; i < deadPlayers.length; i++) {
    deadPlayers[i][0].pop();
    if (deadPlayers[i][0].length < 1) {
      deadPlayers.splice(i, 1);
    }
  }
  for (var i = 0; i < nOfPlayers; i++) {
    if (active[i]) {
      ctx.strokeStyle = colors[i];
      ctx.globalAlpha = 1;
      drawBody(body[i]);
      ctx.beginPath();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = "#000";
      ctx.fillRect(
        body[i][0][0] * unit + unit / 3,
        body[i][0][1] * unit + unit / 3,
        unit / 3,
        unit / 3
      );
    }
  }
}

function spawnPoints() {
  for (let i = 0; i < nOfPlayers; i++) {
    const x = (startLocation[i][0] + 0.5) * unit;
    const y = (startLocation[i][1] + 0.5) * unit;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 128);
    gradient.addColorStop(0, colors[i]);
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.beginPath();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = gradient;
    ctx.arc(x, y, 128, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function scoreBoards() {
  const TBLoc = [
    [8, 20, "left"],
    [canvas.width - 8, 20, "right"],
    [8, canvas.height - 24, "left"],
    [canvas.width - 8, canvas.height - 24, "right"],
  ];
  ctx.font = "bold 16px Arial";
  ctx.fillStyle = bgColor[Math.abs(darkMode - 1)];
  ctx.beginPath();
  for (let i = 0; i < nOfPlayers; i++) {
    ctx.textAlign = TBLoc[i][2];
    if (active[i]) {
      ctx.fillText(`Score: ${score[i]}`, TBLoc[i][0], TBLoc[i][1]);
      ctx.fillText(`Highscore: ${highscore[i]}`, TBLoc[i][0], TBLoc[i][1] + 16);
    } else {
      ctx.fillText(`Join with the "${i + 1}" key!`, TBLoc[i][0], TBLoc[i][1]);
      var controlKeys = (
        controls[i][0] +
        controls[i][1] +
        controls[i][2] +
        controls[i][3]
      ).toUpperCase();
      if (controlKeys.length > 4) {
        controlKeys = "the arrow keys";
      }
      ctx.fillText(
        `Control with ${controlKeys}!`,
        TBLoc[i][0],
        TBLoc[i][1] + 16
      );
    }
  }
  if (paused) {
    return;
  }
  ctx.beginPath();
  ctx.textAlign = "center";
  ctx.fillText('Press "Esc" to pause', canvas.width / 2, 18);
  ctx.textAlign = "left";
}

function draw() {
  resizeCanvas();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  grid();
  drawFood();
  drawPlayerFood();
  drawPlayers();
  spawnPoints();
  scoreBoards();
}

function main() {
  frameCounter++;
  if (frameCounter >= advanceRate && !paused) {
    calculate();
    frameCounter = 0;
  }
  killPlayers();
  draw();
  requestAnimationFrame(main);
}

function init() {
  resizeCanvas();
  body = [
    [[...startLocation[0]]],
    [[...startLocation[1]]],
    [[...startLocation[2]]],
    [[...startLocation[3]]],
  ];
  requestAnimationFrame(main);
}

/* Dark Mode Code */

const rootColors = $(":root").style;
const cScheme = ["light", "dark"];
const bgColor = ["#fff", "#111"];

var darkMode = false;

function refreshColors() {
  const i = Number(darkMode);
  $(":root").style = `color-scheme: ${cScheme[i]}`;
  rootColors.setProperty("--bg-color", bgColor[i]);
}

refreshColors();

init();
