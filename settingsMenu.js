// ============================================================
// settingsMenu.js - Settings screen
//
// Creates the settings screen, shows it only in the SETTINGS state,
// and changes the values stored in settings.js:
//   - Arrow Up / Down    : move between rows
//   - Arrow Left / Right : change the value of the selected row
//   - Enter              : change the value / choose RESET or BACK
//   - Escape             : go back
//   - Mouse              : hover to select, click a row or its ◀ ▶ arrows
//
// BACK returns to the screen the settings were opened from
// (main menu now, pause menu later in Stage 3).
//
// Usage (in the team's main file, next to initMenu):
//   initSettingsMenu({ container: gameContainerElement });
// ============================================================

import { GameState, getState, setState, onStateChange } from './state.js';
import { getSetting, setSetting, resetSettings, onSettingChange, SETTING_OPTIONS } from './settings.js';

// Same look as the main menu (menu.js)
const SETTINGS_STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

    /* Covers the whole game area, content centred */
    #settings-menu {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 32px;
        background: rgba(0, 0, 0, 0.92);
        font-family: 'Press Start 2P', monospace;
        color: #fff;
    }
    #settings-menu.hidden { display: none; }

    #settings-menu .title {
        margin: 0;
        font-size: 24px;
        color: #ffff00;
        text-shadow: 3px 3px 0 #2121de;
    }

    #settings-menu .settings-list {
        display: flex;
        flex-direction: column;
        gap: 18px;
        width: 380px;
    }

    /* One row: label on the left, value on the right */
    #settings-menu .settings-row {
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-left: 28px; /* space on the left for the arrow */
        font-size: 12px;
        cursor: pointer;
        user-select: none;
    }

    #settings-menu .value {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    #settings-menu .value-text {
        min-width: 104px; /* fits the longest value ("NORMAL", "ARROWS") */
        text-align: center;
    }
    #settings-menu .arrow {
        background: none;
        border: none;
        color: #2121de;
        font-family: inherit;
        font-size: 10px;
        cursor: pointer;
        padding: 0;
    }
    #settings-menu .arrow:focus { outline: none; }

    /* Selected row: yellow with a blinking arrow in front */
    #settings-menu .settings-row.selected { color: #ffff00; }
    #settings-menu .settings-row.selected .arrow { color: #ffff00; }
    #settings-menu .settings-row.selected::before {
        content: '▶';
        position: absolute;
        left: 0;
        animation: settings-blink 0.8s steps(1) infinite;
    }
    @keyframes settings-blink { 50% { opacity: 0; } }

    #settings-menu .hint {
        font-size: 8px;
        color: #888;
    }
`;

// Rows, top to bottom. A row either changes a setting ("setting")
// or does something when chosen ("action").
const ROWS = [
    { label: 'VOLUME', setting: 'volume' },
    { label: 'MUSIC', setting: 'music' },
    { label: 'SOUND FX', setting: 'sfx' },
    { label: 'DIFFICULTY', setting: 'difficulty' },
    { label: 'CONTROLS', setting: 'controls' },
    { label: 'RESET DEFAULTS', action: 'reset' },
    { label: 'BACK', action: 'back' },
];

const VOLUME_STEP = 10; // how much one press changes the volume

let settingsElement = null;         // the whole settings <div>
let rowElements = [];               // one element per row in ROWS
let selectedIndex = 0;              // which row is highlighted
let returnState = GameState.MENU;   // where BACK goes

// Sets up the settings screen. Call once when the game loads.
//   container - element the screen goes into (needs position: relative so the screen covers it)
export function initSettingsMenu({ container }) {
    addStyles();
    settingsElement = createSettingsElement();
    container.appendChild(settingsElement);

    onStateChange((newState, previousState) => {
        const isOpen = newState === GameState.SETTINGS;
        settingsElement.classList.toggle('hidden', !isOpen);

        if (isOpen) {
            // Remember where we came from, so BACK can return there
            returnState = previousState ?? GameState.MENU;
            select(0);
        }
    });
    settingsElement.classList.toggle('hidden', getState() !== GameState.SETTINGS);

    // Keep the shown values up to date, also when a setting is changed from another file
    onSettingChange(updateValues);

    document.addEventListener('keydown', handleKeyDown);
    updateValues();
    select(0);
}

function addStyles() {
    const style = document.createElement('style');
    style.textContent = SETTINGS_STYLES;
    document.head.appendChild(style);
}

// Builds the screen HTML: <div id="settings-menu"> with a title, the rows and a hint.
function createSettingsElement() {
    const screen = document.createElement('div');
    screen.id = 'settings-menu';

    const title = document.createElement('h2');
    title.className = 'title';
    title.textContent = 'SETTINGS';

    const list = document.createElement('div');
    list.className = 'settings-list';

    rowElements = ROWS.map((row, index) => {
        const rowElement = document.createElement('div');
        rowElement.className = 'settings-row';

        const label = document.createElement('span');
        label.textContent = row.label;
        rowElement.appendChild(label);

        // Setting rows also get "◀ value ▶" on the right
        if (row.setting) {
            rowElement.appendChild(createValueElement(row));
        }

        rowElement.addEventListener('mouseenter', () => select(index));
        rowElement.addEventListener('click', () => activateRow(row));
        list.appendChild(rowElement);
        return rowElement;
    });

    const hint = document.createElement('p');
    hint.className = 'hint';
    hint.textContent = 'LEFT/RIGHT CHANGE   ESC BACK';

    screen.append(title, list, hint);
    return screen;
}

// Builds "◀ value ▶" for a setting row. The arrows can be clicked.
function createValueElement(row) {
    const value = document.createElement('span');
    value.className = 'value';

    const left = document.createElement('button');
    left.className = 'arrow';
    left.textContent = '◀';
    left.addEventListener('click', (event) => {
        event.stopPropagation(); // don't also run the row's own click
        changeValue(row.setting, -1);
    });

    const text = document.createElement('span');
    text.className = 'value-text';

    const right = document.createElement('button');
    right.className = 'arrow';
    right.textContent = '▶';
    right.addEventListener('click', (event) => {
        event.stopPropagation();
        changeValue(row.setting, +1);
    });

    value.append(left, text, right);
    return value;
}

// Changes a setting one step. direction: -1 = left/previous, +1 = right/next.
function changeValue(name, direction) {
    const current = getSetting(name);

    if (name === 'volume') {
        // Steps of 10, kept between 0 and 100
        const volume = Math.min(100, Math.max(0, current + direction * VOLUME_STEP));
        setSetting(name, volume);
    } else if (typeof current === 'boolean') {
        // ON / OFF: either direction flips it
        setSetting(name, !current);
    } else {
        // List of options: move to the previous/next one, wrapping around
        const options = SETTING_OPTIONS[name];
        const index = options.indexOf(current);
        setSetting(name, options[(index + direction + options.length) % options.length]);
    }
}

// What Enter or a click does on a row.
function activateRow(row) {
    if (row.setting) {
        changeValue(row.setting, +1);
    } else if (row.action === 'reset') {
        resetSettings();
    } else if (row.action === 'back') {
        goBack();
    }
}

function goBack() {
    setState(returnState);
}

// Shows the current value of every setting row.
function updateValues() {
    ROWS.forEach((row, index) => {
        if (row.setting) {
            rowElements[index].querySelector('.value-text').textContent = formatValue(row.setting);
        }
    });
}

// Turns a setting value into the text shown on screen, e.g. 70 -> "70%", true -> "ON".
function formatValue(name) {
    const value = getSetting(name);
    if (name === 'volume') return `${value}%`;
    if (typeof value === 'boolean') return value ? 'ON' : 'OFF';
    return value.toUpperCase();
}

function handleKeyDown(event) {
    // Ignore keys when the settings screen isn't on screen
    if (getState() !== GameState.SETTINGS) return;

    const row = ROWS[selectedIndex];

    switch (event.key) {
        case 'ArrowUp':
            // Going up from the first row wraps to the last one
            select((selectedIndex - 1 + ROWS.length) % ROWS.length);
            break;
        case 'ArrowDown':
            // Going down from the last row wraps to the first one
            select((selectedIndex + 1) % ROWS.length);
            break;
        case 'ArrowLeft':
            if (row.setting) changeValue(row.setting, -1);
            break;
        case 'ArrowRight':
            if (row.setting) changeValue(row.setting, +1);
            break;
        case 'Enter':
            activateRow(row);
            break;
        case 'Escape':
            goBack();
            break;
        default:
            return; // not our key, let other code handle it
    }

    // This screen used the key:
    // - preventDefault stops page scrolling and a focused button firing its own click
    // - stopImmediatePropagation stops other key handlers reacting to the same press
    //   (e.g. the Enter on BACK also being read by the main menu)
    event.preventDefault();
    event.stopImmediatePropagation();
}

// Moves the highlight to the row at the given index.
function select(index) {
    rowElements[selectedIndex].classList.remove('selected');
    selectedIndex = index;
    rowElements[selectedIndex].classList.add('selected');
}
