// ============================================================
// lives.js - Remaining lives and life-loss rules
//
// Keeps track of how many lives Pac-Man has remaining.
//
// Pac-Man begins each new game with three lives.
// Colliding with a normal ghost causes one life to be lost.
//
// This file does NOT:
//   - Detect collisions
//   - Move Pac-Man back to the starting position
//   - Draw the lives on the screen
//   - Change the game state
//
// Those actions belong to the collision, rendering,
// and game-flow components.
//
// How other files use it:
//   loseLife()    -> life-loss result and game-over condition
//   getLives()    -> current number of lives
//   resetLives()  -> restore three lives for a new game
// ============================================================


// Number of lives at the beginning of every new game.
const STARTING_LIVES = 3;

// Store the current number of remaining lives.
let lives = STARTING_LIVES;


// ============================================================
// LOSE ONE LIFE
//
// Called after the collision system confirms that Pac-Man
// was caught by a normal, non-frightened ghost.
//
// The function reduces the number of lives and reports
// whether the game-over condition has been reached.
//
// It does not directly change the game state.
// ============================================================

export function loseLife() {

    // Prevent lives from becoming negative.
    // This also handles collision events reported after Game Over.
    if (lives === 0) {
        return {
            lives,
            lifeLost: false,
            gameOver: true
        };
    }

    // Remove exactly one life.
    lives--;

    // Return the result to Hector's game-flow component.
    // Hector can decide whether to respawn or show Game Over.
    return {
        lives,
        lifeLost: true,
        gameOver: lives === 0
    };
}


// ============================================================
// GET REMAINING LIVES
//
// Other modules use this function to check how many lives
// Pac-Man currently has without changing the variable.
// ============================================================

export function getLives() {
    return lives;
}


// ============================================================
// RESET LIVES
//
// Called when the player starts a completely new game
// or selects Retry after Game Over.
//
// This function should NOT be called when changing levels,
// because remaining lives carry over between levels.
// ============================================================

export function resetLives() {
    lives = STARTING_LIVES;
}
