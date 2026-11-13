// ============================================================
// test.mjs - Unit tests for Pac-Man game logic
//
// Tests the scoring, lives, and level-progression modules.
//
// These tests check that the functions produce the expected
// results without running the complete Pac-Man game.
//
// Run using: node test.mjs
// ============================================================

import assert from 'node:assert/strict';

// Import scoring functions.
import {
    awardPellet,
    awardFrightenedGhost,
    resetGhostChain,
    getScoreData
} from './scoring.js';

// Import lives functions.
import {
    getLives,
    loseLife
} from './lives.js';

// Import level-progression functions.
import {
    getCurrentLevel,
    completeLevel,
    startNextLevel,
    startNewGame
} from './levelProgression.js';


// ============================================================
// TEST 1 - NEW GAME INITIALIZATION
//
// A new game should start at Level 1 with 3 lives and 0 points.
// ============================================================

startNewGame();

assert.equal(getCurrentLevel(), 1);
assert.equal(getLives(), 3);
assert.equal(getScoreData().totalScore, 0);

console.log('PASS: New game initialization');


// ============================================================
// TEST 2 - PELLET AND GHOST SCORING
//
// Elian's pellet_collection.js returns:
//   0 = No pellet
//   1 = Regular pellet
//   2 = Super pellet
//
// Level 1 regular pellet = 1 point
// Super pellet = 50 points
// First frightened ghost = 200 points
// Second frightened ghost = 400 points
//
// Expected subtotal: 651 points.
// ============================================================

assert.equal(awardPellet(0, 1), 0);
assert.equal(awardPellet(1, 1), 1);
assert.equal(awardPellet(2, 1), 50);

assert.equal(awardFrightenedGhost(), 200);
assert.equal(awardFrightenedGhost(), 400);

assert.equal(getScoreData().levelScore, 651);

console.log('PASS: Pellet and ghost scoring');


// ============================================================
// TEST 3 - LEVEL COMPLETION CONDITION
//
// A level cannot be completed while pellets remain.
// ============================================================

assert.equal(completeLevel(5), null);

console.log('PASS: Level completion condition');


// ============================================================
// TEST 4 - LEVEL COMPLETION BONUS
//
// Level subtotal = 651
// Bonus = 651 * 0.30 = 195.3
// Total = 651 + 195.3 = 846.3
//
// The bonus must only be applied once.
// ============================================================

const result = completeLevel(0);

assert.ok(Math.abs(result.bonus - 195.3) < 0.000001);
assert.ok(Math.abs(result.totalScore - 846.3) < 0.000001);

// Completing the same level again must not award another bonus.
assert.equal(completeLevel(0), null);

console.log('PASS: Level bonus applied once');


// ============================================================
// TEST 5 - LEVEL PROGRESSION
//
// Moving to Level 2 must preserve the overall score and lives.
//
// The current level subtotal must reset to zero.
// A regular pellet in Level 2 must award 2 points.
// ============================================================

assert.equal(startNextLevel(), 2);

assert.equal(getCurrentLevel(), 2);
assert.equal(getLives(), 3);
assert.equal(getScoreData().levelScore, 0);

assert.ok(
    Math.abs(getScoreData().totalScore - 846.3) < 0.000001
);

assert.equal(awardPellet(1, getCurrentLevel()), 2);

console.log('PASS: Level progression');

// ============================================================
// TEST 6 - LIVES SYSTEM
//
// Pac-Man starts with 3 lives.
// Each collision removes one life.
//
// When lives reach 0, Game Over must become true.
// Additional collisions must not make lives negative.
// ============================================================

// First collision: 3 -> 2 lives.
assert.deepEqual(loseLife(), {
    lives: 2,
    lifeLost: true,
    gameOver: false
});

// Second collision: 2 -> 1 life.
assert.deepEqual(loseLife(), {
    lives: 1,
    lifeLost: true,
    gameOver: false
});

// Third collision: 1 -> 0 lives (Game Over).
assert.deepEqual(loseLife(), {
    lives: 0,
    lifeLost: true,
    gameOver: true
});

// Additional collision: lives must stay at 0.
assert.deepEqual(loseLife(), {
    lives: 0,
    lifeLost: false,
    gameOver: true
});

assert.equal(getLives(), 0);

console.log('PASS: Lives system');


// ============================================================
// TEST 7 - NEW GAME RESET
//
// Starting a new game must restore:
//   Level = 1
//   Lives = 3
//   Total score = 0
//   Level score = 0
// ============================================================

startNewGame();

assert.equal(getCurrentLevel(), 1);
assert.equal(getLives(), 3);
assert.equal(getScoreData().totalScore, 0);
assert.equal(getScoreData().levelScore, 0);

console.log('PASS: Game reset');

// ============================================================
// TEST 8 - SCORING ACROSS ALL THREE LEVELS
//
// Regular pellet points depend on the current level.
// Super pellets always award 50 points.
// ============================================================

startNewGame();

// Level 1.
assert.equal(awardPellet(1, 1), 1);
assert.equal(awardPellet(2, 1), 50);

// Level 2.
assert.equal(awardPellet(1, 2), 2);
assert.equal(awardPellet(2, 2), 50);

// Level 3.
assert.equal(awardPellet(1, 3), 3);
assert.equal(awardPellet(2, 3), 50);

assert.equal(getScoreData().totalScore, 156);

console.log('PASS: Scoring across all three levels');

// ============================================================
// TEST 9 - FRIGHTENED GHOST SCORING
//
// Consecutive frightened ghosts award increasing points.
//
// After four ghosts, no additional points are awarded
// until the ghost scoring sequence is reset.
// ============================================================

startNewGame();

// Check the sequence of ghost points.
assert.equal(awardFrightenedGhost(), 200);
assert.equal(awardFrightenedGhost(), 400);
assert.equal(awardFrightenedGhost(), 800);
assert.equal(awardFrightenedGhost(), 1600);

// The sequence has reached its limit.
assert.equal(awardFrightenedGhost(), 0);

// Reset the sequence.
resetGhostChain();

// The first ghost should award 200 points again.
assert.equal(awardFrightenedGhost(), 200);

console.log('PASS: Frightened ghost scoring');

// ============================================================
// TEST 10 - LEVEL PROGRESSION BOUNDARIES
//
// Players cannot skip unfinished levels.
// The game contains only three levels.
// ============================================================

startNewGame();

// Cannot advance before completing Level 1.
assert.equal(startNextLevel(), null);
assert.equal(getCurrentLevel(), 1);

// Complete Level 1 and advance to Level 2.
completeLevel(0);
assert.equal(startNextLevel(), 2);

// Cannot skip Level 2.
assert.equal(startNextLevel(), null);

// Complete Level 2 and advance to Level 3.
completeLevel(0);
assert.equal(startNextLevel(), 3);

// Complete the final level.
const finalResult = completeLevel(0);

assert.equal(finalResult.isFinalLevel, true);

// There must not be a Level 4.
assert.equal(startNextLevel(), null);
assert.equal(getCurrentLevel(), 3);

console.log('PASS: Level progression boundaries');

// ============================================================
// TEST 11 - GAME OVER RESTRICTIONS
//
// A player with zero lives cannot complete a level
// or advance to the next level.
// ============================================================

startNewGame();

// Lose all three lives.
loseLife();
loseLife();
loseLife();

assert.equal(getLives(), 0);

// Cannot complete a level after Game Over.
assert.equal(completeLevel(0), null);

// Cannot advance to another level.
assert.equal(startNextLevel(), null);

// The current level must remain unchanged.
assert.equal(getCurrentLevel(), 1);

console.log('PASS: Game Over restrictions');

// All tests completed successfully.
console.log('\nAll 11 tests passed!');
