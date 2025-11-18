const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 400; // Set game width
canvas.height = 600; // Set game height

// Game state
let playerUnits = [];
let botUnits = [];
let elixir = 5;
let gameActive = true;
let enemyTowerHP = 100;
let playerTowerHP = 100;

// Game loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw towers
  ctx.fillStyle = 'red';
  ctx.fillRect(150, 10, 100, 50); // Enemy tower
  ctx.fillStyle = 'blue';
  ctx.fillRect(150, 540, 100, 50); // Player tower

  // Draw HP bars
  ctx.fillStyle = 'black';
  ctx.fillText(`Enemy HP: ${enemyTowerHP}`, 150, 75);
  ctx.fillText(`Player HP: ${playerTowerHP}`, 150, 530);

  // Draw all the units
  playerUnits.forEach((unit) => {
    updateUnit(unit, 'player');
    drawUnit(unit);
  });

  botUnits.forEach((unit) => {
    updateUnit(unit, 'bot');
    drawUnit(unit);
  });

  // Elixir regeneration
  if (elixir < 10) elixir += 0.01;

  // Spawn bot units
  if (Math.random() < 0.02) spawnUnit(botUnits, 'bot');

  // Check Win/Loss Condition
  if (enemyTowerHP <= 0) {
    endGame('Player Wins!');
  }
  if (playerTowerHP <= 0) {
    endGame('Bot Wins!');
  }

  if (gameActive) requestAnimationFrame(gameLoop);
}

// Handle unit movement and attacking
function updateUnit(unit, type) {
  unit.y += type === 'player' ? -unit.speed : unit.speed;

  const isAttacking = type === 'player'
    ? unit.y <= 60 && enemyTowerHP > 0
    : unit.y >= 540 && playerTowerHP > 0;

  if (isAttacking) {
    if (type === 'player') enemyTowerHP -= unit.damage;
    if (type === 'bot') playerTowerHP -= unit.damage;

    unit.y = type === 'player' ? 60 : 540;
    unit.speed = 0;
  }
}

// Draw units on the canvas
function drawUnit(unit) {
  ctx.fillStyle = unit.color;
  ctx.fillRect(unit.x, unit.y, unit.width, unit.height);
}

// Spawn a unit
function spawnUnit(units, type) {
  const unit = {
    x: Math.random() * 300 + 50,
    y: type === 'player' ? 500 : 50,
    width: 20,
    height: 20,
    speed: 1,
    damage: 5,
    color: type === 'player' ? 'blue' : 'red',
  };
  units.push(unit);
}

canvas.addEventListener('click', () => {
  if (elixir >= 2) {
    spawnUnit(playerUnits, 'player');
    elixir -= 2;
  }
});

function endGame(message) {
  gameActive = false;
  alert(message);
}

// Start the game loop
gameLoop();
