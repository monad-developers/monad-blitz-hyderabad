import kaboom from "kaboom";

export function initializeKaboom(canvas: HTMLCanvasElement, updateGameState?: (state: any) => void) {
  // Initialize Kaboom
  const k = kaboom({
    canvas: canvas,
    width: 800,
    height: 600,
    scale: 1,
    debug: false,
    stretch: true,
    letterbox: true,
    crisp: true,
    pixelDensity: 1,
  });

  // Load sprites
  k.loadSprite("background", "/sprites/background-day.png");
  k.loadSprite("bird", "/sprites/yellowbird-midflap.png");
  k.loadSprite("bird-up", "/sprites/yellowbird-upflap.png");
  k.loadSprite("bird-down", "/sprites/yellowbird-downflap.png");
  k.loadSprite("pipe", "/sprites/pipe-green.png");
  k.loadSprite("base", "/sprites/base.png");
  k.loadSprite("gameover", "/sprites/gameover.png");
  k.loadSprite("monad-cat", "/sprites/monad-cat.png");
  // Load power-up sprites
  k.loadSprite("coin", "/sprites/Monad Logo - Default - Logo Mark.png");
  k.loadSprite("mushroom", "/sprites/Mushroom from KAPLAY Wiki.png");
  k.loadSprite("ghostiny", "/sprites/Ghostiny from KAPLAY Crew Wiki.png");

  // Load sounds
  k.loadSound("jump", "/audio/wing.wav");
  k.loadSound("score", "/audio/point.wav");
  k.loadSound("hit", "/audio/hit.wav");
  k.loadSound("die", "/audio/die.wav");

  // Set gravity
  k.setGravity(1000); // Increased from 800 to make bird fall faster

  // Game constants
  const PIPE_MIN = 60; // Reduced from 80 to allow pipes closer to edges
  const JUMP_FORCE = 200; // Reduced from 220 to make jumps weaker
  const BASE_SPEED = 320; // Increased from 240 to make game faster
  const SPEED_INCREASE_THRESHOLD = 5; // Reduced from 10 to increase speed more frequently
  const SPEED_INCREASE_AMOUNT = 80; // Increased from 50 to make speed increases more dramatic
  const CEILING = -50; // Raised from -100 to reduce vertical space

  // Game scene
  k.scene("game", () => {
    // Game state variables
    let score = 0;
    let coins = 0;
    let lives = 3;
    let doublePointsActive = false;
    let doublePointsTimer = 0;
    let ghostModeActive = false;
    let ghostModeTimer = 0;
    let currentSpeed = BASE_SPEED;
    let currentPipeGap = 120; // Dynamic pipe gap that gets smaller as score increases
    let pipeSpawnTimer = 0;
    let itemSpawnTimer = 0; // Timer for coordinated item spawning
    let gameStarted = false; // Track if game has started (first pipe spawned)
    let lastItemSpawnTime = 0; // Track when last item was spawned
    let showReadyUI = true; // Track if ready UI should be shown
    const basePipeSpawnInterval = 1.2; // Reduced from 1.5 for faster pipe spawning
    const itemSpawnInterval = 0.5; // Reduced interval between item spawns

    // Update React state function
    const updateState = () => {
      if (updateGameState) {
        updateGameState({
          score,
          coins,
          lives,
          doublePoints: doublePointsActive,
          doublePointsTimer,
          ghostMode: ghostModeActive,
          ghostModeTimer,
          gameOver: false,
          gameStarted,
          showReadyUI
        });
      }
    };

    // Initial state update
    updateState();

    // Handle death function
    function handleDeath() {
      k.play("hit");
      lives--;
      updateState();
      
      if (lives <= 0) {
        // Game over - all lives lost
        k.go("lose", { score, coins });
      } else {
        // Reset bird position and continue
        bird.pos.x = k.width() / 4;
        bird.pos.y = k.height() / 2;
        bird.vel.x = 0;
        bird.vel.y = 0;
      }
    }

    // Add scrolling background
    k.add([
      k.sprite("background"),
      k.pos(0, 0),
      k.scale(2.8, 1.2),
      k.fixed(),
    ]);

    // Add scrolling base/ground
    const base1 = k.add([
      k.sprite("base"),
      k.pos(0, k.height() - 100),
      k.scale(2.5, 1),
      "base",
    ]);

    const base2 = k.add([
      k.sprite("base"),
      k.pos(base1.width * 2.5, k.height() - 100),
      k.scale(2.5, 1),
      "base",
    ]);

    // Move base with current speed
    k.onUpdate("base", (base) => {
      base.move(-currentSpeed, 0);
      if (base.pos.x <= -base.width * 2.5) {
        base.pos.x = base.width * 2.5;
      }
    });

    // Create bird
    const bird = k.add([
      k.sprite("bird"),
      k.pos(k.width() / 4, k.height() / 2),
      k.area(),
      k.body(),
      k.scale(0.05),
      k.opacity(1),
      "monad-cat",
    ]);

    // Bird animation
    let birdFrame = 0;
    const birdSprites = ["monad-cat"];
    
    k.onUpdate(() => {
      birdFrame += k.dt() * 10;
      if (birdFrame >= birdSprites.length) birdFrame = 0;
      bird.use(k.sprite(birdSprites[Math.floor(birdFrame)]));
      
      // Dynamic pipe spawning based on speed
      pipeSpawnTimer += k.dt();
      const dynamicSpawnInterval = basePipeSpawnInterval * (BASE_SPEED / currentSpeed);
      
      if (pipeSpawnTimer >= dynamicSpawnInterval) {
        spawnPipe();
        pipeSpawnTimer = 0;
      }
    });

    // Check for death
    bird.onUpdate(() => {
      if (bird.pos.y >= k.height() - 100 || bird.pos.y <= CEILING) {
        handleDeath();
      }
    });

    // Jump controls
    k.onKeyPress("space", () => {
      if (showReadyUI) {
        showReadyUI = false;
        updateState();
      }
      bird.jump(JUMP_FORCE);
      k.play("jump");
    });

    k.onClick(() => {
      if (showReadyUI) {
        showReadyUI = false;
        updateState();
      }
      bird.jump(JUMP_FORCE);
      k.play("jump");
    });

    // UI Elements removed - using React overlay instead

    // Power-up timers update
    k.onUpdate(() => {
      // Double points timer
      if (doublePointsActive) {
        doublePointsTimer -= k.dt();
        if (doublePointsTimer <= 0) {
          doublePointsActive = false;
        }
      }

      // Ghost mode timer
      if (ghostModeActive) {
        ghostModeTimer -= k.dt();
        // Make bird semi-transparent during ghost mode
        bird.opacity = 0.6;
        if (ghostModeTimer <= 0) {
          ghostModeActive = false;
          bird.opacity = 1;
        }
      }

      // Update React state
      updateState();
    });

    // Track current pipe gap for safe spawning
    let currentPipeGapPosition = { top: 0, bottom: 0 };

    // Coin spawning function - spawn in safe areas only
    function spawnCoin() {
      // Only spawn if game has started (at least one pipe exists)
      if (!gameStarted) return;
      
      // Wait a bit to ensure pipe gap is set correctly
      k.wait(0.1, () => {
        // Only spawn if we have a safe gap defined
        if (currentPipeGapPosition.top > 0 && currentPipeGapPosition.bottom > 0) {
          const safeZoneStart = currentPipeGapPosition.top + 30; // Reduced margin for better visibility
          const safeZoneEnd = currentPipeGapPosition.bottom - 30; // Reduced margin for better visibility
          
          if (safeZoneEnd > safeZoneStart) {
            const y = k.rand(safeZoneStart, safeZoneEnd);
            k.add([
              k.sprite("coin"),
              k.pos(k.width() + 100, y),
              k.area(),
              k.offscreen({ destroy: true }),
              k.scale(0.15),
              k.anchor("center"),
              "coin",
            ]);
          }
        }
      });
    }

    // Power-up spawning functions - spawn in safe areas only
    function spawnMushroom() {
      // Only spawn if game has started (at least one pipe exists)
      if (!gameStarted) return;
      
      // Wait a bit to ensure pipe gap is set correctly
      k.wait(0.1, () => {
        // Only spawn if we have a safe gap defined
        if (currentPipeGapPosition.top > 0 && currentPipeGapPosition.bottom > 0) {
          const safeZoneStart = currentPipeGapPosition.top + 30; // Reduced margin for better visibility
          const safeZoneEnd = currentPipeGapPosition.bottom - 30; // Reduced margin for better visibility
          
          if (safeZoneEnd > safeZoneStart) {
            const y = k.rand(safeZoneStart, safeZoneEnd);
            k.add([
              k.sprite("mushroom"),
              k.pos(k.width() + 150, y),
              k.area(),
              k.offscreen({ destroy: true }),
              k.scale(0.4),
              k.anchor("center"),
              "mushroom",
            ]);
          }
        }
      });
    }

    function spawnGhostiny() {
      // Only spawn if game has started (at least one pipe exists)
      if (!gameStarted) return;
      
      // Wait a bit to ensure pipe gap is set correctly
      k.wait(0.1, () => {
        // Only spawn if we have a safe gap defined
        if (currentPipeGapPosition.top > 0 && currentPipeGapPosition.bottom > 0) {
          const safeZoneStart = currentPipeGapPosition.top + 30; // Reduced margin for better visibility
          const safeZoneEnd = currentPipeGapPosition.bottom - 30; // Reduced margin for better visibility
          
          if (safeZoneEnd > safeZoneStart) {
            const y = k.rand(safeZoneStart, safeZoneEnd);
            k.add([
              k.sprite("ghostiny"),
              k.pos(k.width() + 150, y),
              k.area(),
              k.offscreen({ destroy: true }),
              k.scale(0.7),
              k.anchor("center"),
              "ghostiny",
            ]);
          }
        }
      });
    }

    // Coordinated item spawning function - ensures only one item spawns at a time
    function spawnRandomItem() {
      if (!gameStarted) return;
      
      // Guarantee 100% chance to spawn an item after each pipe
      const itemType = k.rand();
      if (itemType < 0.75) {
        spawnCoin(); // 75% chance for coins (less valuable items)
      } else if (itemType < 0.90) {
        spawnMushroom(); // 15% chance for mushroom
      } else {
        spawnGhostiny(); // 10% chance for ghostiny
      }
      
      lastItemSpawnTime = k.time();
    }

    // Pipe spawning function
    function spawnPipe() {
      let h1, h2;
      
      // Mark game as started when first pipe spawns
      if (!gameStarted) {
        gameStarted = true;
        lastItemSpawnTime = k.time(); // Initialize item spawn timer
        updateState();
      }
      
      // Check if we should start straight line stage
      // Removed straight line stage logic
      
      // Normal random pipe generation
      h1 = k.rand(PIPE_MIN, k.height() - PIPE_MIN - currentPipeGap - 100);
      h2 = k.height() - h1 - currentPipeGap - 100;

      // Update current pipe gap for safe spawning (fixed calculation)
      currentPipeGapPosition = {
        top: h1,
        bottom: h1 + currentPipeGap
      };

      // Top pipe
      k.add([
        k.pos(k.width(), 0),
        k.sprite("pipe"),
        k.area(),
        k.offscreen({ destroy: true }),
        k.scale(2, h1 / 320),
        k.anchor("topleft"),
        "pipe",
      ]);

      // Bottom pipe
      k.add([
        k.pos(k.width(), h1 + currentPipeGap),
        k.sprite("pipe"),
        k.area(),
        k.offscreen({ destroy: true }),
        k.scale(2, h2 / 320),
        k.anchor("topleft"),
        "pipe",
        { passed: false },
      ]);
      
      // Schedule item spawning after this pipe
      k.wait(0.2, () => {
        spawnRandomItem();
      });
    }

    // Update all moving objects with current speed
    k.onUpdate("coin", (coin) => {
      coin.pos.x -= currentSpeed * k.dt();
    });

    k.onUpdate("mushroom", (mushroom) => {
      mushroom.pos.x -= currentSpeed * k.dt();
    });

    k.onUpdate("ghostiny", (ghostiny) => {
      ghostiny.pos.x -= currentSpeed * k.dt();
    });

    k.onUpdate("pipe", (pipe) => {
      pipe.pos.x -= currentSpeed * k.dt();
    });

    // Collision handlers
    
    // Coin collision
    bird.onCollide("coin", (coin) => {
      coin.destroy();
      const coinValue = doublePointsActive ? 2 : 1;
      coins += coinValue;
      updateState();
      k.play("score");
    });

    // Mushroom collision
    bird.onCollide("mushroom", (mushroom) => {
      mushroom.destroy();
      doublePointsActive = true;
      doublePointsTimer = 3; // Reduced from 5 seconds to 3 seconds
      updateState();
      k.play("score");
    });

    // Ghostiny collision
    bird.onCollide("ghostiny", (ghostiny) => {
      ghostiny.destroy();
      ghostModeActive = true;
      ghostModeTimer = 3; // Reduced from 5 seconds to 3 seconds
      updateState();
      k.play("score");
    });

    // Pipe collision (only if not in ghost mode)
    bird.onCollide("pipe", () => {
      if (!ghostModeActive) {
        handleDeath();
      }
    });

    // Check for scoring
    k.onUpdate("pipe", (pipe) => {
      if (pipe.pos.x + pipe.width <= bird.pos.x && pipe.passed === false) {
        addScore();
        pipe.passed = true;
      }
    });

    function addScore() {
      score++;
      updateState();
      k.play("score");
      
      // Increase speed after every SPEED_INCREASE_THRESHOLD pipes
      if (score > 0 && score % SPEED_INCREASE_THRESHOLD === 0) {
        currentSpeed += SPEED_INCREASE_AMOUNT;
        // Additional difficulty spike - reduce pipe gap slightly at higher scores
        if (score >= 20) {
          // At score 20+, make pipes even tighter occasionally
          currentPipeGap = Math.max(100, currentPipeGap - 2);
        }
      }
    }

    // Remove old independent spawning loops and replace with coordinated spawning
    // Items now spawn in coordination with pipes to prevent overlapping
  });

  // Lose scene
  k.scene("lose", (gameData: { score: number; coins: number }) => {
    // Update React state to show game over
    if (updateGameState) {
      updateGameState({
        score: gameData.score,
        coins: gameData.coins,
        lives: 0,
        doublePoints: false,
        doublePointsTimer: 0,
        ghostMode: false,
        ghostModeTimer: 0,
        gameOver: true,
        gameStarted: true,
        showReadyUI: false
      });
    }

    k.add([
      k.sprite("background"),
      k.pos(0, 0),
      k.scale(2.8, 1.2),
      k.fixed(),
    ]);

    k.add([
      k.sprite("base"),
      k.pos(0, k.height() - 100),
      k.scale(2.5, 1),
    ]);

    // Game over handled by React overlay now
    k.onKeyPress("space", () => k.go("game"));
    k.onClick(() => k.go("game"));
  });

  // Start scene
  k.scene("start", () => {
    // Update React state for start screen
    if (updateGameState) {
      updateGameState({
        score: 0,
        coins: 0,
        lives: 3,
        doublePoints: false,
        doublePointsTimer: 0,
        ghostMode: false,
        ghostModeTimer: 0,
        gameOver: false,
        gameStarted: false,
        showReadyUI: true
      });
    }

    k.add([
      k.sprite("background"),
      k.pos(0, 0),
      k.scale(2.8, 1.2),
      k.fixed(),
    ]);

    k.add([
      k.sprite("base"),
      k.pos(0, k.height() - 100),
      k.scale(2.5, 1),
    ]);

    // Start screen handled by React overlay now
    k.onKeyPress("space", () => k.go("game"));
    k.onClick(() => k.go("game"));
  });

  // Start the game
  k.go("start");

  // Return cleanup function
  return () => {
    if (k && typeof k.quit === 'function') {
      k.quit();
    }
  };
}