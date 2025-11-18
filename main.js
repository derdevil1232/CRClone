const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 600;

// Game Variables
let playerUnits = [];
let botUnits = [];
let elixir = 5;
let gameActive = true;
let enemyTowerHP = 100;
let playerTowerHP = 100;

// Cards Information
const cards = {
  Knight: { elixir: 3, speed: 1, damage: 50, health: 500, color: 'blue' },
  Archers: { elixir: 3, speed: 2, damage: 30, health: 200, color: 'green' },
  Giant: { elixir: 5, speed: 0.5, damage: 200, health: 2000, color: 'orange' },
  Bomber: { elixir: 2, speed: 1.5, damage: 100, health: 100, color: 'red' },
};

// Drag-and-Drop Logic
const cardElements = document.querySelectorAll('.card');

cardElements.forEach((card) => {
  card.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', e.target.dataset.card);
  });
});

canvas.addEventListener('dragover', (e) => e.preventDefault());

canvas.addEventListener('drop', (e) => {
  const cardName = e.dataTransfer.getData('text/plain');
  const card = cards[cardName];

  if (card && elixir >= card.elixir) {
    spawnPlayerUnit(card, e.offsetX, e.offsetY);
    elixir -= card.elixir;
  }
});

// Spawn a player unit
function spawnPlayerUnit(card, x, y) {
  playerUnits.push({
    x: x - 10,
    y: y - 10,
    width: 20,
    height: 20,
    speed: card.speed,
    damage: card.damage,
    health: card.health,
    color: card.color,
  });
}

// Elixir Bar Logic
const elixirProgress = document.getElementById('elixir-progress');
const elixirText = document.getElementById('elixir-text');

function updateElixir() {
  if (elixir < 10) elixir += 0.1;
  elixirProgress.style.width = `${(elixir / 10) * 100}%`;
  elixirText.textContent = Math.floor(elixir);
}

// Game Loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Player/Base Towers
  ctx.fillStyle = 'blue';
  ctx.fillRect(150, 540, 100, 50); // Player tower
  ctx.fillStyle = 'red';
  ctx.fillRect(150, 10, 100, 50); // Enemy tower

  // Draw Units
  playerUnits.forEach((unit) => {
    unit.y -= unit.speed;
    ctx.fillStyle = unit.color;
    ctx.fillRect(unit.x, unit.y, unit.width, unit.height);
  });

  // Update Elixir
  updateElixir();

  if (gameActive) requestAnimationFrame(gameLoop);
}

// Start the Game
gameLoop();
