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
// It also applies the current theme's colours to the page as CSS
// variables, so other screens can use them too:
//   var(--theme-background), var(--theme-text),
//   var(--theme-highlight), var(--theme-accent)
//
// Usage (in the team's main file):
//   initMenu({ container: gameContainerElement, onPlay: startGame });
//   setState(GameState.MENU);
// ============================================================

import { GameState, getState, setState, onStateChange } from './state.js';
import { nextTheme, getThemeColors, onSettingChange } from './settings.js';

// Menu styles live here so the menu works without a separate CSS file.
// Colours come from the theme variables, so they change with the theme.
const MENU_STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

    /* Covers the whole game area */
    #main-menu {
        position: absolute;
        inset: 0;
        background: var(--theme-background);
        color: var(--theme-text);
        font-family: 'Press Start 2P', monospace;
    }
    #main-menu.hidden { display: none; }

    /* Title near the top, like the 1980 arcade title screen */
    #main-menu .title {
        position: absolute;
        top: 12%;
        left: 0;
        right: 0;
        margin: 0;
        text-align: center;
        font-size: 40px;
        color: var(--theme-highlight);
        text-shadow: 4px 4px 0 var(--theme-accent);
    }

    /* Options start halfway down the screen, evenly spaced */
    #main-menu .menu-list {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translateX(-50%);
        width: 320px;
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    /* Blocky retro buttons: square border in the theme's accent colour */
    #main-menu .menu-item {
        background: none;
        border: 3px solid var(--theme-accent);
        color: var(--theme-text);
        font-family: inherit;
        font-size: 14px;
        padding: 12px;
        cursor: pointer;
    }
    #main-menu .menu-item:focus { outline: none; }

    /* Selected item: filled block in the highlight colour */
    #main-menu .menu-item.selected {
        background: var(--theme-highlight);
        border-color: var(--theme-highlight);
        color: var(--theme-background);
    }
`;

// Menu buttons, top to bottom. "action" is the key in the actions object below.
const MENU_ITEMS = [
    { label: 'START GAME', action: 'play' },
    { label: 'THEME', action: 'theme' },
    { label: 'HIGH SCORES', action: 'highscores' },
];

let menuElement = null; // the whole menu <div>
let menuItems = [];     // the button elements
let selectedIndex = 0;  // which button is highlighted
let actions = {};       // what each button does

// Sets up the menu. Call once when the game loads.
//   container - element the menu goes into (needs position: relative so the menu covers it)
//   onPlay    - function that starts the game (from the game-logic team);
//               later this will open the character select screen first
export function initMenu({ container, onPlay }) {
    actions = {
        play: onPlay,
        theme: () => nextTheme(),
        highscores: () => setState(GameState.HIGH_SCORES), // screen comes in Stage 3
    };

    addStyles();
    menuElement = createMenuElement();
    container.appendChild(menuElement);

    // Visible only while the game is in the MENU state
    onStateChange((newState) => {
        menuElement.classList.toggle('hidden', newState !== GameState.MENU);
    });
    menuElement.classList.toggle('hidden', getState() !== GameState.MENU);

    // Recolour everything when the theme changes (from this menu or the T key in game)
    onSettingChange((name) => {
        if (name === 'theme') applyTheme();
    });
    applyTheme();

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

    const title = document.createElement('h1');
    title.className = 'title';
    title.textContent = 'PAC-MAN';

    const list = document.createElement('nav');
    list.className = 'menu-list';

    menuItems = MENU_ITEMS.map(({ label, action }, index) => {
        const button = document.createElement('button');
        button.className = 'menu-item';
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

// Puts the current theme's colours into CSS variables on the page,
// and shows the theme name on the THEME button, e.g. "THEME: CLASSIC".
function applyTheme() {
    const colors = getThemeColors();
    const root = document.documentElement.style;
    root.setProperty('--theme-background', colors.background);
    root.setProperty('--theme-text', colors.text);
    root.setProperty('--theme-highlight', colors.highlight);
    root.setProperty('--theme-accent', colors.accent);

    const themeButton = menuItems.find((item) => item.dataset.action === 'theme');
    themeButton.textContent = `THEME: ${colors.label}`;
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
    const action = actions[item.dataset.action];
    if (action) {
        action();
    } else {
        console.warn(`No action for menu item "${item.dataset.action}"`);
    }
}
