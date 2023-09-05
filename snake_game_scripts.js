// Initialize Socket.io
const socket = io();
// Example: Sending player movement to the server
function sendMove(direction) {
  socket.emit("move", direction);
}

// Example: Handling movement updates from the server
socket.on("move", (data) => {
  // Update the position of the player with data.playerId
  // and the new direction data.direction
});

// Example: Handling player disconnection
socket.on("playerDisconnected", (playerId) => {
  // Remove the disconnected player from your game
});
const backgroundMusic = document.getElementById("background-music");
// Function to start playing the background music
function playBackgroundMusic() {
  backgroundMusic.play();
}
// Function to stop playing the background music
function stopBackgroundMusic() {
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
}
// Check the browser appearance (light/dark mode) and set the CSS variables accordingly
const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
/**
 * The function sets CSS variables to different values based on whether the dark mode media query
 * matches or not.
 * @returns The function `setDarkModePreference()` returns nothing (`undefined`).
 */
function setDarkModePreference() {
  if (darkModeMediaQuery.matches) {
    document.documentElement.style.setProperty("--background-color", "#333333");
    document.documentElement.style.setProperty(
      "--snakeboard-background",
      "#4a4a4a"
    );
    document.documentElement.style.setProperty(
      "--snakeboard-border",
      "#333333"
    );
    document.documentElement.style.setProperty(
      "--snakeboard-shadow-dark",
      "#2b2b2b"
    );
    document.documentElement.style.setProperty(
      "--snakeboard-shadow-light",
      "#5c5c5c"
    );
    return;
  }
  document.documentElement.style.setProperty("--background-color", "#eaeaea");
  document.documentElement.style.setProperty(
    "--snakeboard-background",
    "#dfd9e3"
  );
  document.documentElement.style.setProperty("--snakeboard-border", "#dfd9e3");
  document.documentElement.style.setProperty(
    "--snakeboard-shadow-dark",
    "#bcb5bf"
  );
  document.documentElement.style.setProperty(
    "--snakeboard-shadow-light",
    "#fbf9ff"
  );
}
darkModeMediaQuery.addListener(setDarkModePreference);
setDarkModePreference();

const board_border = "black";
const snake_border = "darkblue";

let snake = [
  { x: 200, y: 200 },
  { x: 190, y: 200 },
  { x: 180, y: 200 },
  { x: 170, y: 200 },
  { x: 160, y: 200 },
];

let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let changing_direction = false;
let food_x;
let food_y;
let dx = 10;
let dy = 0;
let gameStarted = false;
let gamePaused = false;

const snakeboard = document.getElementById("snakeboard");
const snakeboard_ctx = snakeboard.getContext("2d");

/* The above code is adding an event listener to the document for the "keydown" event. When a key
    is pressed, it checks if the key code is "Space" and if the game has not started yet. If both
    conditions are true, it calls the function startGame(). If the key code is "Escape", it calls
    the function togglePauseGame(). Finally, it calls the function change_direction() and passes the
    event object as an argument. */
document.addEventListener("keydown", (event) => {
  if (event.code === "Space" && !gameStarted) {
    startGame();
  } else if (event.code === "Escape") {
    togglePauseGame();
  }
  change_direction(event);
});

/**
 * The function "selectLevel" takes a level parameter and assigns a corresponding value to the
 * "currentLevel" variable, then calls the "updateLevelIndicator" function.
 * @param level - The `level` parameter is a string that represents the desired level. It can be
 * one of the following values: 'easy', 'medium', or 'hard'.
 */
function selectLevel(level) {
  switch (level) {
    case "easy":
      currentLevel = 0;
      break;
    case "medium":
      currentLevel = 1;
      break;
    case "hard":
      currentLevel = 2;
      break;
    default:
      currentLevel = 0; // Default to Easy level
      break;
  }
  updateLevelIndicator();
}

/**
 * The startGame function initializes the game by setting up the game environment, initializing
 * variables, generating food, and starting the main game loop.
 */
function startGame() {
  gameStarted = true;
  playBackgroundMusic(); // Start playing the music
  // Hide welcome overlay, start button, and other welcome elements
  document.getElementById("welcome-overlay").style.display = "none";
  document.getElementById("start-container").style.display = "none";
  document.getElementById("welcome-overlay").style.display = "none";
  document.getElementById("high-score").innerHTML = `High Score: ${highScore}`;
  score = 0;
  dx = 10;
  dy = 0;
  changing_direction = false;
  snake = [
    { x: 200, y: 200 },
    { x: 190, y: 200 },
    { x: 180, y: 200 },
    { x: 170, y: 200 },
    { x: 160, y: 200 },
  ];
  gen_food();
  document.getElementById("score").innerHTML = score;
  selectLevel("easy"); // Default to Easy level
  main();
}

// Function to update the level indicator
function updateLevelIndicator() {
  document.getElementById("level-indicator").innerHTML = `Level ${
    currentLevel + 1
  }`;
}

/**
 * The function "nextLevel" moves the game to the next level if possible, resetting the game state
 * and starting the game loop for the new level.
 * @returns nothing (undefined).
 */
function nextLevel() {
  // Move to the next level if possible
  if (currentLevel >= levels.length - 1) {
    return;
  }
  currentLevel++;
  // Reset the game state for the new level
  score = 0;
  dx = 10;
  dy = 0;
  changing_direction = false;
  snake = [
    { x: 200, y: 200 },
    { x: 190, y: 200 },
    { x: 180, y: 200 },
    { x: 170, y: 200 },
    { x: 160, y: 200 },
  ];
  gen_food();
  gen_power_apple();
  document.getElementById("score").innerHTML = score;
  document.getElementById("high-score").innerHTML = `High Score: ${highScore}`;
  // Start the game loop for the new level
  main();
  // Update the level indicator
  updateLevelIndicator();
  return;
}

/**
 * The function toggles the pause state of a game and updates the UI accordingly.
 * @returns nothing (undefined).
 */
function togglePauseGame() {
  if (!gameStarted || has_game_ended()) return; // Check if the game hasn't started or has ended

  gamePaused = !gamePaused;

  // Hide or show the "Wall Collision" switch and label based on the game state
  const wallCollisionSwitch = document.getElementById("wall-collision-switch");
  wallCollisionSwitch.style.display = gamePaused ? "none" : "block";

  if (gamePaused) {
    document.getElementById("welcome-text").innerText = "Paused";
    document.getElementById("play-text").innerText = "Press Esc to Continue";
    document.getElementById("welcome-overlay").style.display = "flex";
    return;
  }
  document.getElementById("welcome-overlay").style.display = "none";
  main();
}

// Define the levels and their parameters
const levels = [
  {
    snakeSpeed: 100,
    foodSpawnRate: 2000,
    powerAppleSpawnRate: 10_000,
    numObstacles: 0,
  },
  {
    snakeSpeed: 90,
    foodSpawnRate: 1500,
    powerAppleSpawnRate: 8000,
    numObstacles: 2,
  },
  {
    snakeSpeed: 80,
    foodSpawnRate: 1200,
    powerAppleSpawnRate: 6000,
    numObstacles: 4,
  },
  // Add more levels with different parameters
];

/* The above code is declaring a variable called `currentLevel` and assigning it a value of 0. */
let currentLevel = 0;

/**
 * The main function controls the flow of the game by checking if the game has ended, showing the
 * game over screen if it has, handling the game pause functionality, updating the game board,
 * moving the snake, and redrawing the snake and food on the board.
 * @returns In the given code, there are two return statements.
 */
function main() {
  if (has_game_ended()) {
    showGameOver();
    return;
  }

  if (gamePaused) {
    document.getElementById("welcome-text").innerText = "Paused";
    document.getElementById("play-text").innerText = "Press Esc to Continue";
    document.getElementById("welcome-overlay").style.display = "flex";
    return;
  }

  changing_direction = false;
  setTimeout(function onTick() {
    clear_board();
    drawFood();
    move_snake();
    drawSnake();
    main();
  }, levels[currentLevel].snakeSpeed);
}

/**
 * The clear_board function clears the snakeboard by filling it with a white color and drawing a
 * border.
 */
function clear_board() {
  snakeboard_ctx.fillStyle = "white";
  snakeboard_ctx.strokestyle = board_border;
  snakeboard_ctx.fillRect(0, 0, snakeboard.width, snakeboard.height);
  snakeboard_ctx.strokeRect(0, 0, snakeboard.width, snakeboard.height);
}

/**
 * The function "drawSnake" iterates through each part of the snake and calls the function
 * "drawSnakePart" to draw each part.
 */
function drawSnake() {
  snake.forEach((part, index) => {
    drawSnakePart(part, index);
  });
}

/**
 * The function `getPatternColor` returns the color associated with a given pattern segment, or
 * blue if the segment is not found.
 * @param patternSegment - The parameter `patternSegment` is a string that represents a specific
 * segment of a pattern.
 * @returns the color associated with the given pattern segment. If the pattern segment is found in
 * the color map, the corresponding color is returned. If the pattern segment is not found in the
 * color map, the function defaults to returning 'blue'.
 */
function getPatternColor(patternSegment) {
  // Define color mappings for each pattern segment
  const colorMap = {
    "pattern-segment-1": "blue",
    "pattern-segment-2": "green",
    "pattern-segment-3": "red",
    // ... Add more color mappings
  };

  return colorMap[patternSegment] || "blue"; // Default to blue if segment not found
}

/**
 * The function "drawFood" is used to draw a green square on a canvas representing food.
 */
function drawFood() {
  snakeboard_ctx.fillStyle = "lightgreen";
  snakeboard_ctx.strokestyle = "darkgreen";
  snakeboard_ctx.fillRect(food_x, food_y, 10, 10);
  snakeboard_ctx.strokeRect(food_x, food_y, 10, 10);
}

/* The above code is defining an array called `snakeDesignPattern` which contains different
    segments of a pattern. Each segment is represented by a string value. */
const snakeDesignPattern = [
  "pattern-segment-1",
  "pattern-segment-2",
  "pattern-segment-3",
  // ... Define more segments of the pattern
];

/**
 * The function `drawSnakePart` is used to draw a part of a snake on a canvas using a specific
 * pattern and color.
 * @param snakePart - The snakePart parameter represents a segment of the snake's body. It contains
 * information about the position of the segment on the game board, such as the x and y
 * coordinates.
 * @param index - The index parameter represents the position of the snake part in the snake's
 * body. It is used to determine the pattern segment and color for that specific part.
 */
function drawSnakePart(snakePart, index) {
  const patternSegment = snakeDesignPattern[index % snakeDesignPattern.length];
  snakeboard_ctx.fillStyle = getPatternColor(patternSegment); // Get color based on the pattern segment
  snakeboard_ctx.strokestyle = snake_border;
  snakeboard_ctx.fillRect(snakePart.x, snakePart.y, 10, 10);
  snakeboard_ctx.strokeRect(snakePart.x, snakePart.y, 10, 10);
}

/**
 * The function checks if the game has ended by checking for self-collision and wall collision (if
 * enabled).
 * @returns a boolean value. It returns true if the game has ended (either due to self-collision or
 * wall collision if enabled), and false otherwise.
 */
function has_game_ended() {
  // Check for self-collision
  for (let i = 4; i < snake.length; i++) {
    if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
      return true;
    }
  }

  // Check for wall collision (if enabled)
  if (wallCollisionEnabled) {
    return (
      snake[0].x < 0 ||
      snake[0].x >= snakeboard.width ||
      snake[0].y < 0 ||
      snake[0].y >= snakeboard.height
    );
  }

  return false;
}

/**
 * The function random_food generates a random number between a given minimum and maximum value,
 * rounded to the nearest multiple of 10.
 * @param min - The minimum value for the random food. This is the lowest possible value that the
 * random food can be.
 * @param max - The maximum value for the random food.
 * @returns a random number between the minimum and maximum values provided, rounded to the nearest
 * multiple of 10.
 */
function random_food(min, max) {
  return Math.round((Math.random() * (max - min) + min) / 10) * 10;
}

/**
 * The function generates random coordinates for food on a game board and checks if the snake has
 * already eaten the food.
 */
function gen_food() {
  food_x = random_food(0, snakeboard.width - 10);
  food_y = random_food(0, snakeboard.height - 10);
  snake.forEach(function has_snake_eaten_food(part) {
    const has_eaten = part.x === food_x && part.y === food_y;
    if (has_eaten) gen_food();
  });
}

/**
 * The function `change_direction` is used to handle keyboard events and change the direction of
 * movement for a game character.
 * @param event - The event parameter is an object that represents the event that triggered the
 * function. In this case, it is expected to be a keyboard event, such as a key press.
 * @returns The function does not explicitly return anything.
 */
function change_direction(event) {
  const LEFT_KEY = 37;
  const RIGHT_KEY = 39;
  const UP_KEY = 38;
  const DOWN_KEY = 40;

  if (!gameStarted || gamePaused) return;

  if (changing_direction) return;
  changing_direction = true;
  const keyPressed = event.keyCode;
  const goingUp = dy === -10;
  const goingDown = dy === 10;
  const goingRight = dx === 10;
  const goingLeft = dx === -10;
  if (keyPressed === LEFT_KEY && !goingRight) {
    dx = -10;
    dy = 0;
  }
  if (keyPressed === UP_KEY && !goingDown) {
    dx = 0;
    dy = -10;
  }
  if (keyPressed === RIGHT_KEY && !goingLeft) {
    dx = 10;
    dy = 0;
  }
  if (keyPressed === DOWN_KEY && !goingUp) {
    dx = 0;
    dy = 10;
  }
}

/**
 * The function `move_snake()` moves the snake on the game board, checks for collisions with the
 * wall, handles eating food, updates the score, and wraps the snake around the board if wall
 * collision is disabled.
 * @returns The function move_snake() returns nothing.
 */
function move_snake() {
  // Check if the snake has hit the wall (collision detection)
  if (has_hit_wall()) {
    // Perform actions when the snake hits the wall (e.g., game over)
    showGameOver();
    return;
  }

  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);

  const has_eaten_food = snake[0].x === food_x && snake[0].y === food_y;

  if (has_eaten_food) {
    score++;
    document.getElementById("score").innerHTML = score;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
      document.getElementById(
        "high-score"
      ).innerHTML = `High Score: ${highScore}`;
    }
    gen_food();
  } else {
    snake.pop();
  }

  // Grid-based movement: Round snake's position to the nearest grid unit
  head.x = Math.round(head.x / 10) * 10;
  head.y = Math.round(head.y / 10) * 10;

  // If wall collision is disabled, wrap the snake around the board
  if (!wallCollisionEnabled) {
    if (head.x < 0) head.x = snakeboard.width - 10;
    else if (head.x >= snakeboard.width) head.x = 0;
    if (head.y < 0) head.y = snakeboard.height - 10;
    else if (head.y >= snakeboard.height) head.y = 0;
  }
}

/**
 * The restartGame function resets the game state and displays the welcome message and play
 * instructions.
 */
function restartGame() {
  gameStarted = false;
  gamePaused = false;
  document.getElementById("welcome-text").innerText = "Welcome to Snake";
  document.getElementById("play-text").innerText = "Press Space to Play";
  document.getElementById("game-over").style.display = "none";
  startGame();
}

/**
 * The function "showGameOver" stops the background music, displays the "Game Over" screen, updates
 * the final score and high score, and plays the game over sound effect.
 */
function showGameOver() {
  stopBackgroundMusic(); // Stop the music
  // Display the "Game Over" screen (existing code)
  document.getElementById("game-over").style.display = "block";
  document.getElementById("final-score").innerHTML = score;
  const highScore = localStorage.getItem("highScore") || 0;
  document.getElementById("high-score").innerHTML = `High Score: ${highScore}`;

  // Play the game over sound effect
  const gameOverSound = document.getElementById("game-over-sound");
  gameOverSound.play();
}

// Touch control event handlers
/**
 * The function moveLeft sets the dx and dy variables to move the object to the left.
 */
function moveLeft() {
  if (dx !== 10) {
    dx = -10;
    dy = 0;
  }
}

/**
 * The function moveRight sets the dx and dy variables to move the object to the right.
 */
function moveRight() {
  if (dx !== -10) {
    dx = 10;
    dy = 0;
  }
}

/**
 * The function "moveUp" sets the values of dx and dy to move an object upwards.
 */
function moveUp() {
  if (dy !== 10) {
    dx = 0;
    dy = -10;
  }
}

/**
 * The function moveDown() sets the dx and dy variables to 0 and 10 respectively, if dy is not
 * already -10.
 */
function moveDown() {
  if (dy !== -10) {
    dx = 0;
    dy = 10;
  }
}

let wallCollisionEnabled = true; // Default value: wall collision enabled

// Function to toggle wall collision
/**
 * The function toggles the state of wall collision and updates the wall collision label if the
 * game has not started.
 */
function toggleWallCollision() {
  wallCollisionEnabled = !wallCollisionEnabled;

  if (!gameStarted) {
    // Update the wall collision state in the Welcome Overlay (optional)
    const wallCollisionLabel = document.getElementById("wall-collision-label");
    wallCollisionLabel.innerText = `Wall Collision: ${
      wallCollisionEnabled ? "On" : "Off"
    }`;
  }
}
/**
 * The function checks if the snake has hit the wall by comparing its position with the boundaries of
 * the game board.
 * @returns a boolean value. It returns true if the snake's head has hit the wall, and false otherwise.
 */
function has_hit_wall() {
  if (!wallCollisionEnabled) {
    return false; // Wall collision is disabled, so the snake will not collide with the wall
  }

  return (
    snake[0].x < 0 ||
    snake[0].x >= snakeboard.width ||
    snake[0].y < 0 ||
    snake[0].y >= snakeboard.height
  );
}

// Add an event listener to the document to detect key presses
/* The above code is adding an event listener to the document for the 'keydown' event. When a key is
pressed, the code checks which key was pressed and assigns the corresponding button element to the
variable 'buttonToClick'. If a valid button element is found, the code adds the 'pressed' class to
the button element to apply a press animation and then simulates a button click on that element. */
document.addEventListener("keydown", (event) => {
  let buttonToClick = null;

  switch (event.key) {
    case "w":
      buttonToClick = document.getElementById("moveUpBtn");
      break;
    case "a":
      buttonToClick = document.getElementById("moveLeftBtn");
      break;
    case "s":
      buttonToClick = document.getElementById("moveDownBtn");
      break;
    case "d":
      buttonToClick = document.getElementById("moveRightBtn");
      break;
    default:
      break;
  }

  if (buttonToClick) {
    buttonToClick.classList.add("pressed"); // Apply the press animation class
    buttonToClick.click(); // Simulate button click
  }
});

// Add an event listener to the document to detect key releases
/* The above code is adding an event listener to the document for the 'keyup' event. When a key is
released, the code checks which key was released and assigns the corresponding button element to the
variable 'buttonToRelease'. If a button element is found, the code removes the 'pressed' class from
that button element, which likely removes a visual effect indicating that the button is pressed. */
document.addEventListener("keyup", (event) => {
  let buttonToRelease = null;

  switch (event.key) {
    case "w":
      buttonToRelease = document.getElementById("moveUpBtn");
      break;
    case "a":
      buttonToRelease = document.getElementById("moveLeftBtn");
      break;
    case "s":
      buttonToRelease = document.getElementById("moveDownBtn");
      break;
    case "d":
      buttonToRelease = document.getElementById("moveRightBtn");
      break;
    default:
      break;
  }

  if (buttonToRelease) {
    buttonToRelease.classList.remove("pressed"); // Remove the press animation class
  }
});
