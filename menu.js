// ============================================================
// menu.js - Main menu (title screen)
//
// Creates the main menu (title + START GAME / THEME / HIGH SCORES),
// shows it only in the MENU state, and handles navigation:
//   - Arrow Up / Down    : move the selection
//   - Enter              : choose the selected item
//   - Arrow Left / Right : change the theme (when THEME is selected)
//   - T                  : change the theme (any time on this screen)
//   - Mouse              : hover to select, click to choose
//
// START GAME opens the character select screen (characterSelect.js),
// which then starts the game.
//
// Usage (in the team's main file):
//   initMenu({ container: gameContainerElement });
//   setState(GameState.MENU);
// ============================================================

import { GameState, getState, setState, onStateChange } from './state.js';
import { nextTheme, getThemeColors, onSettingChange } from './settings.js';
import { addScreenStyles } from './screenStyles.js';

// Layout of this screen only; colours and buttons come from screenStyles.js
const MENU_STYLES = `
    /* Title near the top, like the 1980 arcade title screen */
    #main-menu .pm-title {
        position: absolute;
        top: 12%;
        left: 0;
        right: 0;
    }

    /* Options start halfway down the screen, evenly spaced */
    #main-menu .menu-list {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translateX(-50%);
        width: 56cqw;
        display: flex;
        flex-direction: column;
        gap: 4cqw;
    }
`;

// Menu buttons, top to bottom. "action" is the key in the actions object below.
const MENU_ITEMS = [
    { label: 'START GAME', action: 'start' },
    { label: 'THEME', action: 'theme' },
    { label: 'HIGH SCORES', action: 'highscores' },
];

let menuElement = null; // the whole menu <div>
let menuItems = [];     // the button elements
let selectedIndex = 0;  // which button is highlighted

// What each button does
const actions = {
    start: () => setState(GameState.CHARACTER_SELECT),
    theme: () => nextTheme(),
    highscores: () => setState(GameState.HIGH_SCORES),
};

// Sets up the menu. Call once when the game loads.
//   container - element the menu goes into (needs position: relative so the menu covers it)
export function initMenu({ container }) {
    addScreenStyles();
    addStyles();
    menuElement = createMenuElement();
    container.appendChild(menuElement);

    // Visible only while the game is in the MENU state
    onStateChange((newState) => {
        menuElement.classList.toggle('hidden', newState !== GameState.MENU);
    });
    menuElement.classList.toggle('hidden', getState() !== GameState.MENU);

    // Show the new theme name when the theme changes (from this menu or the T key in game)
    onSettingChange((name) => {
        if (name === 'theme') updateThemeLabel();
    });
    updateThemeLabel();

    document.addEventListener('keydown', handleKeyDown);
    select(0);
}

function addStyles() {
    const style = document.createElement('style');
    style.textContent = MENU_STYLES;
    document.head.appendChild(style);
}

// Builds the menu HTML: <div id="main-menu"> with a title and a list of buttons.
function createMenuElement() {
    const menu = document.createElement('div');
    menu.id = 'main-menu';
    menu.className = 'pm-screen';

    const title = document.createElement('h1');
    title.className = 'pm-title';
    title.textContent = 'PAC-MAN';

    const list = document.createElement('nav');
    list.className = 'menu-list';

    menuItems = MENU_ITEMS.map(({ label, action }, index) => {
        const button = document.createElement('button');
        button.className = 'pm-button';
        button.textContent = label;
        button.dataset.action = action;
        button.addEventListener('mouseenter', () => select(index));
        button.addEventListener('click', () => activate(button));
        list.appendChild(button);
        return button;
    });

    menu.append(title, list);
    return menu;
}

// Shows the current theme on the THEME button, e.g. "THEME: CLASSIC".
function updateThemeLabel() {
    const themeButton = menuItems.find((item) => item.dataset.action === 'theme');
    themeButton.textContent = `THEME: ${getThemeColors().label}`;
}

function handleKeyDown(event) {
    // Ignore keys when the menu isn't on screen (e.g. arrows during the game)
    if (getState() !== GameState.MENU) return;

    const isThemeSelected = menuItems[selectedIndex].dataset.action === 'theme';

    switch (event.key) {
        case 'ArrowUp':
            // Going up from the first item wraps to the last one
            select((selectedIndex - 1 + menuItems.length) % menuItems.length);
            break;
        case 'ArrowDown':
            // Going down from the last item wraps to the first one
            select((selectedIndex + 1) % menuItems.length);
            break;
        case 'ArrowLeft':
            if (!isThemeSelected) return; // only used on the THEME button
            nextTheme(-1);
            break;
        case 'ArrowRight':
            if (!isThemeSelected) return;
            nextTheme(+1);
            break;
        case 't':
        case 'T':
            nextTheme();
            break;
        case 'Enter':
            activate(menuItems[selectedIndex]);
            break;
        default:
            return; // not our key, let other code handle it
    }

    // The menu used the key:
    // - preventDefault stops page scrolling and a focused button firing its own click
    // - stopImmediatePropagation stops other key handlers reacting to the same press
    //   (e.g. the Enter on START GAME also being read by the next screen)
    event.preventDefault();
    event.stopImmediatePropagation();
}

// Moves the highlight to the button at the given index.
function select(index) {
    menuItems[selectedIndex].classList.remove('selected');
    selectedIndex = index;
    menuItems[selectedIndex].classList.add('selected');
}

// Runs the action of the given button.
function activate(item) {
    actions[item.dataset.action]();
}

