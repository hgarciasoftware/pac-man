// ============================================================
// settings.js - Game settings (data only, no screen)
//
// Stores the player's settings and saves them in the browser
// (localStorage), so they are still there after a page reload.
//
// How other files use it:
//   getSetting('muted')        -> read one setting
//   setSetting('muted', true)  -> change a setting (saved automatically)
//   nextTheme()                -> switch to the next colour theme (T key)
//   getThemeColors()           -> colours of the current theme
//   resetSettings()            -> go back to the default values
//   onSettingChange(fn)        -> run fn every time a setting changes
//
// Settings and their values:
//   muted     : true / false (M key toggles it)
//   theme     : one of the names in THEMES below
//   character : 'mr' / 'mrs' (Mr. or Mrs. Pac-Man, picked before each game)
// ============================================================

// Colour themes, in the order the T key cycles through them.
// PLACEHOLDER colours: replace them with the ones the team agrees on.
//   background - screen background
//   text       - normal text
//   highlight  - selected item, titles
//   accent     - borders, shadows
export const THEMES = Object.freeze({
    classic: {
        label: 'CLASSIC',
        background: '#000000',
        text: '#ffffff',
        highlight: '#ffff00',
        accent: '#2121de',
    },
    midnight: {
        label: 'MIDNIGHT',
        background: '#0b0b3b',
        text: '#ffffff',
        highlight: '#ffb8ff',
        accent: '#00ffff',
    },
    retro: {
        label: 'RETRO',
        background: '#001a00',
        text: '#ccffcc',
        highlight: '#33ff33',
        accent: '#008800',
    },
    // Colourblind-friendly: avoids red/green, uses orange and blue
    colorblind: {
        label: 'COLORBLIND',
        background: '#000000',
        text: '#ffffff',
        highlight: '#ffb000',
        accent: '#0072b2',
    },
});

const THEME_NAMES = Object.keys(THEMES);

// Playable characters: Mr. Pac-Man and Mrs. Pac-Man
const CHARACTER_IDS = ['mr', 'mrs'];

// Name of the saved data in the browser's localStorage
const STORAGE_KEY = 'pacman-settings';

// Values used the first time, or when saved data is missing/broken
const DEFAULT_SETTINGS = Object.freeze({
    muted: false,
    theme: 'classic',
    character: 'mr',
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

// Returns a copy of all settings, e.g. { muted: false, theme: 'classic', character: 'mr' }
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

    // Tell everyone who is listening, e.g. the menu recolours itself
    for (const listener of listeners) {
        listener(name, value);
    }
}

// Switches to the next theme, wrapping from the last back to the first.
// direction: +1 = next (default), -1 = previous.
export function nextTheme(direction = 1) {
    const index = THEME_NAMES.indexOf(settings.theme);
    const newIndex = (index + direction + THEME_NAMES.length) % THEME_NAMES.length;
    setSetting('theme', THEME_NAMES[newIndex]);
}

// Colours of the current theme, e.g. { label: 'CLASSIC', background: '#000000', ... }
export function getThemeColors() {
    return THEMES[settings.theme];
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
        case 'muted':
            return typeof value === 'boolean';
        case 'theme':
            return THEME_NAMES.includes(value);
        case 'character':
            return CHARACTER_IDS.includes(value);
        default:
            return false; // unknown setting name
    }
}

// Reads saved settings. Any value that is missing or invalid
// (e.g. old saved data from an earlier version) uses its default instead.
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

