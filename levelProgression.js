
// ============================================================
// levelProgression.js - Level number and level transitions
//
// Manages the progression through the game's three levels.
//
// Each level must be completed before the next one begins.
// A level is complete when all regular and super pellets
// required for that level have been collected.
//
// This file coordinates scoring and lives without keeping
// duplicate copies of their data.
//
// It does NOT:
//   - Detect or remove pellets
//   - Load or draw the next maze
//   - Move Pac-Man or the ghosts
//   - Change the game state or display screens
//
// Hector's game-flow component coordinates those actions.
//
// How other files use it:
//   getCurrentLevel()          -> current level number
//   completeLevel(remaining)   -> completion result or null
//   startNextLevel()           -> next level number or null
//   startNewGame()             -> reset game progress
// ============================================================


// Import the scoring functions needed for level transitions.
import {
    awardLevelBonus,
    getScoreData,
    resetLevelScoring,
    resetScoring
} from './scoring.js';

// Import the lives functions needed for game progression.
import {
    getLives,
    resetLives
} from './lives.js';


// The game contains three levels.
const LAST_LEVEL = 3;

// Pac-Man always begins a new game at Level 1.
let currentLevel = 1;


// ============================================================
// GET CURRENT LEVEL
//
// Returns the current level number.
//
// The scoring system uses this value to determine how many
// points a regular pellet is worth.
// ============================================================

export function getCurrentLevel() {
    return currentLevel;
}


// ============================================================
// COMPLETE THE CURRENT LEVEL
//
// Called after the pellet collection system reports how many
// required pellets remain in the maze.
//
// A level is completed only when the remaining count is zero.
//
// This function applies the completion bonus through
// scoring.js and returns the results to game flow.
// ============================================================

export function completeLevel(remainingPellets) {

    // Reject invalid pellet counts.
    // Missing information must not trigger level completion.
    if (!Number.isInteger(remainingPellets) ||
        remainingPellets !== 0) {
        return null;
    }

    // A level cannot be completed if Pac-Man has no lives.
    if (getLives() === 0) {
        return null;
    }

    // Check whether the completion bonus was already applied.
    // This prevents processing the same level twice.
    if (getScoreData().bonusApplied) {
        return null;
    }

    // Ask the scoring module to calculate the 30% bonus.
    const results = awardLevelBonus();

    if (results === null) {
        return null;
    }

    // Return the completed level's results.
    // Hector will determine which screen to display.
    return {
        level: currentLevel,
        ...results,
        isFinalLevel: currentLevel === LAST_LEVEL
    };
}


// ============================================================
// START THE NEXT LEVEL
//
// Called after the player successfully completes a level
// and the game-flow system is ready to advance.
//
// Total score and remaining lives must be preserved.
//
// Current-level scoring data is reset so the next level
// starts with a fresh subtotal.
// ============================================================

export function startNextLevel() {

    // The previous level must have been completed.
    if (!getScoreData().bonusApplied) {
        return null;
    }

    // Do not advance after Game Over.
    if (getLives() === 0) {
        return null;
    }

    // There is no level after Level 3.
    if (currentLevel === LAST_LEVEL) {
        return null;
    }

    // Advance exactly one level.
    currentLevel++;

    // Reset only the scoring information for the new level.
    resetLevelScoring();

    // The caller uses this value to load the correct maze.
    return currentLevel;
}


// ============================================================
// START A NEW GAME
//
// Called when the player begins a new game or selects Retry.
//
// Unlike changing levels, a new game resets everything:
//   - Current level becomes 1
//   - Total score becomes 0
//   - Level subtotal becomes 0
//   - Lives return to 3
//   - Ghost scoring sequence is reset
//   - Completion bonus status is reset
//
// Do not call this immediately when Game Over appears.
// The final score must remain available for high scores.
// ============================================================

export function startNewGame() {

    // Return to the first level.
    currentLevel = 1;

    // Reset scoring and lives through their own modules.
    resetScoring();
    resetLives();
}
