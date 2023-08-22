    // Initialize Socket.io
    const socket = io();
    // Example: Sending player movement to the server
    function sendMove(direction) {
      socket.emit('move', direction);
    }

    // Example: Handling movement updates from the server
    socket.on('move', (data) => {
      // Update the position of the player with data.playerId
      // and the new direction data.direction
    });

    // Example: Handling player disconnection
    socket.on('playerDisconnected', (playerId) => {
      // Remove the disconnected player from your game
    });
    let powerApple_x;
    let powerApple_y;
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
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    function setDarkModePreference() {
      if (darkModeMediaQuery.matches) {
        document.documentElement.style.setProperty('--background-color', '#333333');
        document.documentElement.style.setProperty('--snakeboard-background', '#4a4a4a');
        document.documentElement.style.setProperty('--snakeboard-border', '#333333');
        document.documentElement.style.setProperty('--snakeboard-shadow-dark', '#2b2b2b');
        document.documentElement.style.setProperty('--snakeboard-shadow-light', '#5c5c5c');
      } else {
        document.documentElement.style.setProperty('--background-color', '#eaeaea');
        document.documentElement.style.setProperty('--snakeboard-background', '#dfd9e3');
        document.documentElement.style.setProperty('--snakeboard-border', '#dfd9e3');
        document.documentElement.style.setProperty('--snakeboard-shadow-dark', '#bcb5bf');
        document.documentElement.style.setProperty('--snakeboard-shadow-light', '#fbf9ff');
      }
    }
    darkModeMediaQuery.addListener(setDarkModePreference);
    setDarkModePreference();

    const board_border = 'black';
    const snake_col = 'lightblue';
    const snake_border = 'darkblue';

    let snake = [
      {x: 200, y: 200},
      {x: 190, y: 200},
      {x: 180, y: 200},
      {x: 170, y: 200},
      {x: 160, y: 200}
    ];

    let score = 0;
    let highScore = localStorage.getItem('highScore') || 0;
    let changing_direction = false;
    let food_x;
    let food_y;
    let dx = 10;
    let dy = 0;
    let gameStarted = false;
    let gamePaused = false;

    const snakeboard = document.getElementById("snakeboard");
    const snakeboard_ctx = snakeboard.getContext("2d");

    document.addEventListener("keydown", (event) => {
      if (event.code === "Space" && !gameStarted) {
        startGame();
      } else if (event.code === "Escape") {
        togglePauseGame();
      }
      change_direction(event);
    });

    function selectLevel(level) {
      switch (level) {
        case 'easy':
          currentLevel = 0;
          break;
        case 'medium':
          currentLevel = 1;
          break;
        case 'hard':
          currentLevel = 2;
          break;
        default:
          currentLevel = 0; // Default to Easy level
          break;
      }
      updateLevelIndicator();
    }

    function startGame() {
      gameStarted = true;
      playBackgroundMusic(); // Start playing the music
      // Hide welcome overlay, start button, and other welcome elements
      document.getElementById('welcome-overlay').style.display = 'none';
      document.getElementById('start-container').style.display = 'none';
      document.getElementById('welcome-overlay').style.display = 'none';
      document.getElementById('high-score').innerHTML = "High Score: " + highScore;
      score = 0;
      dx = 10;
      dy = 0;
      changing_direction = false;
      snake = [
        { x: 200, y: 200 },
        { x: 190, y: 200 },
        { x: 180, y: 200 },
        { x: 170, y: 200 },
        { x: 160, y: 200 }
      ];
      gen_food();
      document.getElementById('score').innerHTML = score;
      selectLevel('easy'); // Default to Easy level
      main();
    }

    // Function to update the level indicator
    function updateLevelIndicator() {
      document.getElementById('level-indicator').innerHTML = "Level " + (currentLevel + 1);
    }

    function nextLevel() {
      // Move to the next level if possible
      if (currentLevel < levels.length - 1) {
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
          { x: 160, y: 200 }
        ];
        gen_food();
        gen_power_apple();
        document.getElementById('score').innerHTML = score;
        document.getElementById('high-score').innerHTML = "High Score: " + highScore;
        // Start the game loop for the new level
        main();
        // Update the level indicator
        updateLevelIndicator();
      } else {
        // If there are no more levels, the player has won the game
        // Display a "Congratulations" message or handle game completion
      }
    }

    function togglePauseGame() {
      if (!gameStarted || has_game_ended()) return; // Check if the game hasn't started or has ended
        
      gamePaused = !gamePaused;
        
      // Hide or show the "Wall Collision" switch and label based on the game state
      const wallCollisionSwitch = document.getElementById('wall-collision-switch');
      wallCollisionSwitch.style.display = gamePaused ? 'none' : 'block';
    
      if (gamePaused) {
        document.getElementById('welcome-text').innerText = "Paused";
        document.getElementById('play-text').innerText = "Press Esc to Continue";
        document.getElementById('welcome-overlay').style.display = 'flex';
      } else {
        document.getElementById('welcome-overlay').style.display = 'none';
        main();
      }
    }                

  // Define the levels and their parameters
  const levels = [
      { snakeSpeed: 100, foodSpawnRate: 2000, powerAppleSpawnRate: 10000, numObstacles: 0 },
      { snakeSpeed: 90, foodSpawnRate: 1500, powerAppleSpawnRate: 8000, numObstacles: 2 },
      { snakeSpeed: 80, foodSpawnRate: 1200, powerAppleSpawnRate: 6000, numObstacles: 4 },
      // Add more levels with different parameters
    ];

    let currentLevel = 0;

    function main() {
  if (has_game_ended()) {
    showGameOver();
    return;
  }

  if (gamePaused) {
    document.getElementById('welcome-text').innerText = "Paused";
    document.getElementById('play-text').innerText = "Press Esc to Continue";
    document.getElementById('welcome-overlay').style.display = 'flex';
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
  

    function clear_board() {
      snakeboard_ctx.fillStyle = 'white';
      snakeboard_ctx.strokestyle = board_border;
      snakeboard_ctx.fillRect(0, 0, snakeboard.width, snakeboard.height);
      snakeboard_ctx.strokeRect(0, 0, snakeboard.width, snakeboard.height);
    }

    function drawSnake() {
      snake.forEach(drawSnakePart);
    }

    function drawFood() {
      snakeboard_ctx.fillStyle = 'lightgreen';
      snakeboard_ctx.strokestyle = 'darkgreen';
      snakeboard_ctx.fillRect(food_x, food_y, 10, 10);
      snakeboard_ctx.strokeRect(food_x, food_y, 10, 10);
    }

    function drawSnakePart(snakePart) {
      snakeboard_ctx.fillStyle = snake_col;
      snakeboard_ctx.strokestyle = snake_border;
      snakeboard_ctx.fillRect(snakePart.x, snakePart.y, 10, 10);
      snakeboard_ctx.strokeRect(snakePart.x, snakePart.y, 10, 10);
    }

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
          snake[0].x < 0 || snake[0].x >= snakeboard.width ||
          snake[0].y < 0 || snake[0].y >= snakeboard.height
        );
      }

      return false;
    }

    function random_food(min, max) {
      return Math.round((Math.random() * (max - min) + min) / 10) * 10;
    }

    function gen_food() {
      food_x = random_food(0, snakeboard.width - 10);
      food_y = random_food(0, snakeboard.height - 10);
      snake.forEach(function has_snake_eaten_food(part) {
        const has_eaten = part.x === food_x && part.y === food_y;
        if (has_eaten) gen_food();
      });
    }
    
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
        score += 1;
        document.getElementById('score').innerHTML = score;
        if (score > highScore) {
          highScore = score;
          localStorage.setItem('highScore', highScore);
          document.getElementById('high-score').innerHTML = "High Score: " + highScore;
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


    function restartGame() {
      gameStarted = false;
      gamePaused = false;
      document.getElementById('welcome-text').innerText = "Welcome to Snake";
      document.getElementById('play-text').innerText = "Press Space to Play";
      document.getElementById('game-over').style.display = 'none';
      startGame();
    }

    function showGameOver() {
      stopBackgroundMusic(); // Stop the music
// Display the "Game Over" screen (existing code)
document.getElementById('game-over').style.display = 'block';
document.getElementById('final-score').innerHTML = score;
const highScore = localStorage.getItem('highScore') || 0;
document.getElementById('high-score').innerHTML = "High Score: " + highScore;

// Play the game over sound effect
const gameOverSound = document.getElementById('game-over-sound');
gameOverSound.play();
}

// Touch control event handlers
  function moveLeft() {
    if (dx !== 10) {
      dx = -10;
      dy = 0;
    }
  }

  function moveRight() {
    if (dx !== -10) {
      dx = 10;
      dy = 0;
    }
  }

  function moveUp() {
    if (dy !== 10) {
      dx = 0;
      dy = -10;
    }
  }

  function moveDown() {
    if (dy !== -10) {
      dx = 0;
      dy = 10;
    }
  }

  let wallCollisionEnabled = true; // Default value: wall collision enabled

    // Function to toggle wall collision
    function toggleWallCollision() {
    wallCollisionEnabled = !wallCollisionEnabled;

    if (!gameStarted) {
      // Update the wall collision state in the Welcome Overlay (optional)
      const wallCollisionLabel = document.getElementById('wall-collision-label');
      wallCollisionLabel.innerText = `Wall Collision: ${wallCollisionEnabled ? 'On' : 'Off'}`;
    }
}
function has_hit_wall() {
  if (!wallCollisionEnabled) {
    return false; // Wall collision is disabled, so the snake will not collide with the wall
  }

  return (
    snake[0].x < 0 || snake[0].x >= snakeboard.width ||
    snake[0].y < 0 || snake[0].y >= snakeboard.height
  );
}

// Add an event listener to the document to detect key presses
document.addEventListener('keydown', function(event) {
  let buttonToClick = null;
  
  switch (event.key) {
    case 'w':
      buttonToClick = document.getElementById('moveUpBtn');
      break;
    case 'a':
      buttonToClick = document.getElementById('moveLeftBtn');
      break;
    case 's':
      buttonToClick = document.getElementById('moveDownBtn');
      break;
    case 'd':
      buttonToClick = document.getElementById('moveRightBtn');
      break;
    default:
      break;
  }
  
  if (buttonToClick) {
    buttonToClick.classList.add('pressed'); // Apply the press animation class
    buttonToClick.click(); // Simulate button click
  }
});

let lastDirectionPressed = "right"; // Initialize with a default direction

// Add an event listener to the document to detect key releases
document.addEventListener('keyup', function(event) {
  let buttonToRelease = null;
  
  switch (event.key) {
    case 'w':
      buttonToRelease = document.getElementById('moveUpBtn');
      break;
    case 'a':
      buttonToRelease = document.getElementById('moveLeftBtn');
      break;
    case 's':
      buttonToRelease = document.getElementById('moveDownBtn');
      break;
    case 'd':
      buttonToRelease = document.getElementById('moveRightBtn');
      break;
    default:
      break;
  }
  
  if (buttonToRelease) {
    buttonToRelease.classList.remove('pressed'); // Remove the press animation class
  }
});