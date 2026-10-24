// ============================================================
// settings.js - Game settings (data only, no screen)
//
// Stores the player's settings and saves them in the browser
// (localStorage), so they are still there after a page reload.
//
// How other files use it:
//   getSetting('difficulty')   -> read one setting
//   setSetting('volume', 50)   -> change a setting (saved automatically)
//   resetSettings()            -> go back to the default values
//   onSettingChange(fn)        -> run fn every time a setting changes
//
// Settings and their values:
//   volume     : whole number 0-100 (percent)
//   music      : true / false
//   sfx        : true / false (sound effects)
//   difficulty : 'easy' / 'normal' / 'hard'
//   controls   : 'arrows' / 'wasd'
// ============================================================

// Name of the saved data in the browser's localStorage
const STORAGE_KEY = 'pacman-settings';

// Values used the first time, or when saved data is missing/broken
const DEFAULT_SETTINGS = Object.freeze({
    volume: 70,
    music: true,
    sfx: true,
    difficulty: 'normal',
    controls: 'arrows',
});

// Allowed choices for settings that are a list of options.
// Exported so the settings screen can show them in this order.
export const SETTING_OPTIONS = Object.freeze({
    difficulty: ['easy', 'normal', 'hard'],
    controls: ['arrows', 'wasd'],
});

let settings = loadSettings(); // the current values
const listeners = [];          // functions to call when a setting changes

export function getSetting(name) {
    if (!(name in DEFAULT_SETTINGS)) {
        console.error(`Unknown setting: "${name}"`);
        return undefined;
    }
    return settings[name];
}

// Returns a copy of all settings, e.g. { volume: 70, music: true, ... }
export function getAllSettings() {
    return { ...settings };
}

export function setSetting(name, value) {
    if (!isValidValue(name, value)) {
        console.error(`Invalid value for setting "${name}":`, value);
        return;
    }
    // Same value as before: nothing to do
    if (settings[name] === value) return;

    settings[name] = value;
    saveSettings();

    // Tell everyone who is listening, e.g. the sound code updates the volume
    for (const listener of listeners) {
        listener(name, value);
    }
}

export function resetSettings() {
    // setSetting only saves and notifies for values that really change
    for (const name of Object.keys(DEFAULT_SETTINGS)) {
        setSetting(name, DEFAULT_SETTINGS[name]);
    }
}

// Register a function to run on every setting change.
// It receives (settingName, newValue).
export function onSettingChange(listener) {
    listeners.push(listener);
}

// Checks that a value is allowed for the given setting.
function isValidValue(name, value) {
    switch (name) {
        case 'volume':
            return Number.isInteger(value) && value >= 0 && value <= 100;
        case 'music':
        case 'sfx':
            return typeof value === 'boolean';
        case 'difficulty':
        case 'controls':
            return SETTING_OPTIONS[name].includes(value);
        default:
            return false; // unknown setting name
    }
}

// Reads saved settings. Any value that is missing or invalid
// (e.g. someone edited the saved data by hand) uses its default instead.
function loadSettings() {
    const loaded = { ...DEFAULT_SETTINGS };
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (saved && typeof saved === 'object') {
            for (const name of Object.keys(DEFAULT_SETTINGS)) {
                if (isValidValue(name, saved[name])) {
                    loaded[name] = saved[name];
                }
            }
        }
    } catch (error) {
        // Broken JSON or localStorage blocked (e.g. private browsing): use the defaults
        console.warn('Could not load settings, using defaults.', error);
    }
    return loaded;
}

function saveSettings() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
        // The game still works, the settings just won't survive a reload
        console.warn('Could not save settings.', error);
    }
}
