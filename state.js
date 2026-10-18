// ============================================================
// state.js - Game state machine
//
// Keeps track of what the game is doing right now (menu, playing,
// paused...). Only one state is active at a time.
//
// How other files use it:
//   getState()             -> which state is active
//   setState(GameState.X)  -> switch to another state
//   onStateChange(fn)      -> run fn every time the state changes
// ============================================================

// All possible states. Use these instead of typing strings by hand,
// so a typo shows up as an error instead of a silent bug.
// Object.freeze stops anyone from changing the list by accident.
export const GameState = Object.freeze({
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    SETTINGS: 'settings',
    HIGH_SCORES: 'highScores',
    GAME_OVER: 'gameOver',
});

const validStates = new Set(Object.values(GameState));

let currentState = null; // null until the game sets its first state
const listeners = [];    // functions to call when the state changes

export function getState() {
    return currentState;
}

export function setState(newState) {
    if (!validStates.has(newState)) {
        console.error(`Unknown game state: "${newState}"`);
        return;
    }
    // Already in this state: nothing to do
    if (newState === currentState) return;

    const previousState = currentState;
    currentState = newState;

    // Tell everyone who is listening, e.g. the menu shows/hides itself
    for (const listener of listeners) {
        listener(newState, previousState);
    }
}

// Register a function to run on every state change.
// It receives (newState, previousState).
export function onStateChange(listener) {
    listeners.push(listener);
}
