// ============================================================
// highScores.js - Top 10 high scores (data only, no screen)
//
// Keeps the 10 best scores in the browser (localStorage), so they
// are still there after a page reload. Scores are local to that
// browser, as the spec says.
//
// How other files use it:
//   getHighScores()             -> list of { initials, score }, best first
//   isHighScore(1230)           -> true if the score makes the top 10
//   addHighScore('ABC', 1230)   -> saves it, returns its rank (1-10)
// ============================================================

export const MAX_HIGH_SCORES = 10;

// Name of the saved data in the browser's localStorage
const STORAGE_KEY = 'pacman-highscores';

// Initials: exactly three capital letters, e.g. "ABC", "MAX"
const INITIALS_PATTERN = /^[A-Z]{3}$/;

let highScores = loadHighScores(); // sorted, best score first

// Returns a copy of the list, e.g. [{ initials: 'MAX', score: 2500 }, ...]
export function getHighScores() {
    return highScores.map((entry) => ({ ...entry }));
}

// True if this score would get into the top 10.
export function isHighScore(score) {
    if (!Number.isFinite(score) || score <= 0) return false;
    if (highScores.length < MAX_HIGH_SCORES) return true; // list not full yet
    return score > highScores[highScores.length - 1].score; // beats the 10th place
}

// Saves a new high score and returns its rank (1 = best).
// Returns 0 if it wasn't saved (not a top 10 score, or wrong initials).
export function addHighScore(initials, score) {
    if (!INITIALS_PATTERN.test(initials)) {
        console.error(`Initials must be 3 capital letters, got "${initials}"`);
        return 0;
    }
    if (!isHighScore(score)) return 0;

    // Whole points only (the 1.3x level bonus can give decimals)
    const entry = { initials, score: Math.round(score) };

    // Insert after all scores that are equal or higher,
    // so on a tie the player who got there first stays ahead
    let index = highScores.findIndex((existing) => entry.score > existing.score);
    if (index === -1) index = highScores.length;
    highScores.splice(index, 0, entry);

    // Keep only the top 10
    highScores = highScores.slice(0, MAX_HIGH_SCORES);
    saveHighScores();
    return index + 1;
}

// Reads saved scores, skipping any broken entries.
function loadHighScores() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (!Array.isArray(saved)) return [];
        return saved
            .filter((entry) => entry
                && INITIALS_PATTERN.test(entry.initials)
                && Number.isFinite(entry.score))
            .map((entry) => ({ initials: entry.initials, score: entry.score }))
            .sort((a, b) => b.score - a.score)
            .slice(0, MAX_HIGH_SCORES);
    } catch (error) {
        // Broken JSON or localStorage blocked (e.g. private browsing): start empty
        console.warn('Could not load high scores.', error);
        return [];
    }
}

function saveHighScores() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(highScores));
    } catch (error) {
        // The game still works, the scores just won't survive a reload
        console.warn('Could not save high scores.', error);
    }
}

