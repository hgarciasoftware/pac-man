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
// Losing a life should reduce lives from 3 to 2.
//
// Game Over should remain false because lives are still left.
// ============================================================

assert.deepEqual(loseLife(), {
    lives: 2,
    lifeLost: true,
    gameOver: false
});

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


// All tests completed successfully.
console.log('\nAll 7 tests passed!');
