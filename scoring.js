// ============================================================
// scoring.js - Points and level-completion bonuses
//
// Owns the player's cumulative score and current-level subtotal.
// Other files tell it which confirmed gameplay event happened;
// this file decides how many points the event is worth.
//
// Does NOT detect pellets, control ghosts, or change game screens.
// The caller should only report valid gameplay events.
//
// How other files use it:
//   awardPellet(type, level)  -> points awarded (or 0)
//   awardFrightenedGhost()   -> points awarded (or 0)
//   resetGhostChain()        -> restart ghost scoring sequence
//   awardLevelBonus()        -> bonus results (or null)
//   resetLevelScoring()      -> clear current-level values
//   resetScoring()           -> reset score for a new game
//   getScoreData()           -> read current scoring values
// ============================================================


// Points defined in the game specifications.
const SUPER_PELLET_POINTS = 50;
const LEVEL_BONUS_RATE = 0.30;

// Points for eating frightened ghosts in one sequence.
// Object.freeze prevents accidental changes to these values.
const GHOST_POINTS = Object.freeze([200, 400, 800, 1600]);


// Variables that store the player's scoring information.
// These are private to this module.
let totalScore = 0;        // Points earned across all levels
let levelScore = 0;        // Points earned in the current level
let ghostChain = 0;        // Frightened ghosts eaten in this sequence
let bonusApplied = false;  // Prevents awarding the bonus twice

// ============================================================
// PELLET SCORING
//
// Called after Elian's code confirms a pellet was collected.
//
// Elian's collectPellet() returns:
//   0 = No pellet collected
//   1 = Regular pellet
//   2 = Super pellet
//
// Regular pellets:
//   Level 1 = 1 point
//   Level 2 = 2 points
//   Level 3 = 3 points
//
// Super pellets:
//   50 points on every level.
//
// The current level is supplied by levelProgression.js.
// ============================================================

export function awardPellet(type, level) {

    // Do not award additional points after level completion.
    if (bonusApplied) return 0;

    // Make sure the level number is valid.
    if (!Number.isInteger(level) || level < 1 || level > 3) {
        return 0;
    }

    let points = 0;

    if (type === 1) {

        // Regular pellet: points depend on the current level.
        points = level;

    } else if (type === 2) {

        // Super pellet: always worth 50 points.
        points = SUPER_PELLET_POINTS;

    } else {

        // Type 0 means no pellet was collected.
        // Unknown types also receive no points.
        return 0;
    }

    // Update the overall and current-level scores.
    totalScore += points;
    levelScore += points;

    // Return the points awarded to the calling component.
    return points;
}

// ============================================================
// FRIGHTENED GHOST SCORING
//
// When Pac-Man eats frightened ghosts, points increase:
//
// First ghost  = 200
// Second ghost = 400
// Third ghost  = 800
// Fourth ghost = 1600
//
// ghostChain tracks which ghost in the sequence comes next.
// ============================================================

export function awardFrightenedGhost() {

    // Do not award points after level completion or after
    // all four ghosts have already been scored.
    if (bonusApplied || ghostChain >= GHOST_POINTS.length) {
        return 0;
    }

    // Find the points for the current ghost.
    const points = GHOST_POINTS[ghostChain];

    // Advance the sequence for the next ghost.
    ghostChain++;

    // Update both scores.
    totalScore += points;
    levelScore += points;

    return points;
}


// Reset the sequence so the next frightened ghost is worth 200.
// The ghost/power-up component must call this at the correct time.
export function resetGhostChain() {
    ghostChain = 0;
}


// ============================================================
// LEVEL-COMPLETION BONUS
//
// When all required pellets are collected, the player receives
// a bonus equal to 30% of the current level's subtotal.
//
// Example:
//   Level subtotal = 100
//   Bonus = 100 * 0.30 = 30
//   Level total = 130
//
// The subtotal is already included in totalScore.
// Therefore, we add ONLY the bonus to totalScore.
//
// bonusApplied prevents the same bonus being awarded twice.
// ============================================================

export function awardLevelBonus() {

    // A completed level cannot receive another bonus.
    if (bonusApplied) return null;

    const subtotal = levelScore;
    const bonus = subtotal * LEVEL_BONUS_RATE;

    // Add only the extra 30%.
    totalScore += bonus;

    // Mark the bonus as completed.
    bonusApplied = true;

    // Return the results for the level-completion screen.
    return {
        subtotal,
        bonus,
        levelTotal: subtotal + bonus,
        totalScore
    };
}


// ============================================================
// RESET SCORING FOR THE NEXT LEVEL
//
// Starting another level must preserve the cumulative score.
//
// Only information belonging to the previous level or
// frightened-ghost sequence is reset.
// ============================================================

export function resetLevelScoring() {
    levelScore = 0;
    ghostChain = 0;
    bonusApplied = false;
}


// Reset all scoring information when starting a new game.
export function resetScoring() {
    totalScore = 0;
    resetLevelScoring();
}


// ============================================================
// GET SCORING INFORMATION
//
// Returns a snapshot of the player's current scoring data.
//
// Other components can read the values without modifying
// the private variables directly.
// ============================================================

export function getScoreData() {
    return {
        totalScore,
        levelScore,
        ghostChain,
        bonusApplied
    };
}
