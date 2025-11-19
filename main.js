const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const elixirProgressBar = document.getElementById('elixir-progress');
const elixirText = document.getElementById('elixir-text');

// Canvas Setup
canvas.width = 400;
canvas.height = 600;

// Game State
let gameState = {
  playerUnits: [],
  botUnits: [],
  elixir: 5,
  maxElixir: 10,
  gameActive: true,
  botDeployCounter: 0,
  lastBotDeploy: 0,
};

// Building positions (Clash Royale layout)
const buildingPositions = {
  player: [
    { x: 80, y: 500, size: 50, isKing: false, maxHp: 1000 },      // Left Crown Tower
    { x: 270, y: 500, size: 50, isKing: false, maxHp: 1000 },     // Right Crown Tower
    { x: 175, y: 420, size: 60, isKing: true, maxHp: 3000 },      // King Tower
  ],
  enemy: [
    { x: 80, y: 50, size: 50, isKing: false, maxHp: 1000 },       // Left Crown Tower
    { x: 270, y: 50, size: 50, isKing: false, maxHp: 1000 },      // Right Crown Tower
    { x: 175, y: 130, size: 60, isKing: true, maxHp: 3000 },      // King Tower
  ],
};

// Initialize Buildings
let buildings = {
  player: buildingPositions.player.map(b => ({ ...b, hp: b.maxHp })),
  enemy: buildingPositions.enemy.map(b => ({ ...b, hp: b.maxHp })),
};

// Card Definitions
const cardDefinitions = {
  Knight: {
    elixir: 3,
    speed: 1.2,
    damage: 80,
    health: 600,
    attacksTroops: true,
    targetsTroops: true,
    targetsBuild: true,
    size: 20,
  },
  Archers: {
    elixir: 3,
    speed: 1.5,
    damage: 40,
    health: 150,
    attacksTroops: true,
    targetsTroops: true,
    targetsBuild: true,
    size: 15,
  },
  Giant: {
    elixir: 5,
    speed: 0.8,
    damage: 150,
    health: 2200,
    attacksTroops: false,
    targetsTroops: false,
    targetsBuild: true,
    size: 30,
  },
};

// Drag and Drop
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('dragstart', (e) => {
    const cardName = e.target.closest('.card').dataset.card;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', cardName);
  });
});

canvas.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
});

canvas.addEventListener('drop', (e) => {
  e.preventDefault();
  const cardName = e.dataTransfer.getData('text/plain');
  const card = cardDefinitions[cardName];

  if (card && gameState.elixir >= card.elixir) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Only allow placing units in player territory (bottom half)
    if (y > 300) {
      spawnPlayerUnit(card, x, y);
      gameState.elixir -= card.elixir;
      updateElixirUI();
    }
  }
});

// Spawn Player Unit
function spawnPlayerUnit(card, x, y) {
  gameState.playerUnits.push({
    x,
    y,
    vx: 0,
    vy: -card.speed,
    ...card,
    hp: card.health,
    attackCooldown: 0,
    direction: 'up',
  });
}

// Spawn Bot Unit (AI)
function spawnBotUnit() {
  const cardNames = Object.keys(cardDefinitions);
  const randomCard = cardDefinitions[cardNames[Math.floor(Math.random() * cardNames.length)]];

  const x = Math.random() * (canvas.width - 40) + 20;
  gameState.botUnits.push({
    x,
    y: 50,
    vx: 0,
    vy: randomCard.speed,
    ...randomCard,
    hp: randomCard.health,
    attackCooldown: 0,
    direction: 'down',
  });
}

// Update Elixir
function updateElixir() {
  const elixirRechargeRate = 0.017; // ~2.8 seconds to full
  if (gameState.elixir < gameState.maxElixir) {
    gameState.elixir += elixirRechargeRate;
    if (gameState.elixir > gameState.maxElixir) {
      gameState.elixir = gameState.maxElixir;
    }
  }
}

// Update Elixir UI
function updateElixirUI() {
  const percentage = (gameState.elixir / gameState.maxElixir) * 100;
  elixirProgressBar.style.height = percentage + '%';
  elixirText.textContent = Math.floor(gameState.elixir) + '/' + gameState.maxElixir;
}

// Draw Health Bar
function drawHealthBar(x, y, width, hp, maxHp, showValue = false) {
  const barWidth = width;
  const barHeight = 4;
  
  ctx.fillStyle = '#333';
  ctx.fillRect(x - width / 2, y - 15, barWidth, barHeight);
  
  const healthPercent = Math.max(0, hp / maxHp);
  ctx.fillStyle = healthPercent > 0.3 ? '#00ff00' : '#ff0000';
  ctx.fillRect(x - width / 2, y - 15, barWidth * healthPercent, barHeight);
  
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.strokeRect(x - width / 2, y - 15, barWidth, barHeight);

  if (showValue) {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(Math.floor(hp), x, y + 15);
  }
}

// Draw Units
function drawUnits() {
  [...gameState.playerUnits, ...gameState.botUnits].forEach(unit => {
    if (unit.hp > 0) {
      // Draw unit
      ctx.fillStyle = unit.direction === 'up' ? '#3498db' : '#e74c3c';
      ctx.fillRect(unit.x - unit.size / 2, unit.y - unit.size / 2, unit.size, unit.size);

      // Draw HP Bar
      drawHealthBar(unit.x, unit.y - unit.size / 2 - 5, 25, unit.hp, unit.health);
    }
  });
}

// Draw Buildings
function drawBuildings() {
  ['player', 'enemy'].forEach(side => {
    buildings[side].forEach(building => {
      if (building.hp > 0) {
        ctx.fillStyle = building.isKing ? '#ffd700' : '#8b4513';
        ctx.fillRect(building.x, building.y, building.size, building.size);

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(building.x, building.y, building.size, building.size);

        // Draw HP Bar
        drawHealthBar(
          building.x + building.size / 2,
          building.y - 10,
          building.size,
          building.hp,
          building.maxHp,
          true
        );
      }
    });
  });
}

// Find Target
function findTarget(unit) {
  let target = null;
  let closestDistance = Infinity;

  if (unit.direction === 'up') {
    // Player units targeting enemy
    if (unit.targetsTroops) {
      gameState.botUnits.forEach(enemy => {
        if (enemy.hp > 0) {
          const dist = Math.hypot(unit.x - enemy.x, unit.y - enemy.y);
          if (dist < closestDistance) {
            closestDistance = dist;
            target = enemy;
          }
        }
      });
    }

    if (!target && unit.targetsBuild) {
      buildings.enemy.forEach(building => {
        if (building.hp > 0) {
          const dist = Math.hypot(unit.x - (building.x + building.size / 2), unit.y - (building.y + building.size / 2));
          if (dist < closestDistance) {
            closestDistance = dist;
            target = building;
          }
        }
      });
    }
  } else {
    // Bot units targeting player
    if (unit.targetsTroops) {
      gameState.playerUnits.forEach(enemy => {
        if (enemy.hp > 0) {
          const dist = Math.hypot(unit.x - enemy.x, unit.y - enemy.y);
          if (dist < closestDistance) {
            closestDistance = dist;
            target = enemy;
          }
        }
      });
    }

    if (!target && unit.targetsBuild) {
      buildings.player.forEach(building => {
        if (building.hp > 0) {
          const dist = Math.hypot(unit.x - (building.x + building.size / 2), unit.y - (building.y + building.size / 2));
          if (dist < closestDistance) {
            closestDistance = dist;
            target = building;
          }
        }
      });
    }
  }

  return target;
}

// Update Units
function updateUnits() {
  const allUnits = [...gameState.playerUnits, ...gameState.botUnits];

  allUnits.forEach(unit => {
    if (unit.hp <= 0) return;

    const target = findTarget(unit);

    if (target) {
      // Move towards target
      const dx = target.x - unit.x;
      const dy = target.y - unit.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 30) {
        unit.x += (dx / dist) * unit.speed;
        unit.y += (dy / dist) * unit.speed;
      } else {
        // Attack target
        unit.attackCooldown--;
        if (unit.attackCooldown <= 0) {
          target.hp -= unit.damage;
          unit.attackCooldown = 60; // Attack cooldown in frames
        }
      }
    } else {
      // Move towards enemy side
      unit.y += unit.vy;
    }

    // Remove units that go off screen
    if (unit.y < -50 || unit.y > canvas.height + 50) {
      unit.hp = 0;
    }
  });

  // Remove dead units
  gameState.playerUnits = gameState.playerUnits.filter(u => u.hp > 0);
  gameState.botUnits = gameState.botUnits.filter(u => u.hp > 0);
}

// Bot AI Spawner
function botAI() {
  gameState.botDeployCounter++;
  if (gameState.botDeployCounter > 100 && Math.random() > 0.7) {
    spawnBotUnit();
    gameState.botDeployCounter = 0;
  }
}

// Game Loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw arena divider
  ctx.strokeStyle = '#333';
  ctx.setLineDash([10, 10]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 300);
  ctx.lineTo(canvas.width, 300);
  ctx.stroke();
  ctx.setLineDash([]);

  // Update and Draw
  updateElixir();
  updateElixirUI();
  updateUnits();
  botAI();

  drawBuildings();
  drawUnits();

  // Check win conditions
  const playerBuildings = buildings.player.filter(b => b.hp > 0);
  const enemyBuildings = buildings.enemy.filter(b => b.hp > 0);

  if (enemyBuildings.length === 0) {
    gameState.gameActive = false;
    alert('YOU WIN!');
  } else if (playerBuildings.length === 0) {
    gameState.gameActive = false;
    alert('YOU LOSE!');
  }

  if (gameState.gameActive) {
    requestAnimationFrame(gameLoop);
  }
}

// Start the game
gameLoop();
