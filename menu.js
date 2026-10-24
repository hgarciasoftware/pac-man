// ============================================================
// menu.js - Main menu
//
// Creates the main menu (title + PLAY / SETTINGS / HIGH SCORES),
// shows it only in the MENU state, and handles navigation:
//   - Arrow Up / Down : move the selection
//   - Enter           : choose the selected item
//   - Mouse           : hover to select, click to choose
//
// Usage (in the team's main file):
//   initMenu({ container: gameContainerElement, onPlay: startGame });
//   setState(GameState.MENU);
// ============================================================

import { GameState, getState, setState, onStateChange } from './state.js';

// Menu styles live here so the menu works without a separate CSS file.
const MENU_STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

    /* Covers the whole game area, content centred */
    #main-menu {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 40px;
        background: rgba(0, 0, 0, 0.92);
        font-family: 'Press Start 2P', monospace;
    }
    #main-menu.hidden { display: none; }

    #main-menu .title {
        margin: 0;
        font-size: 40px;
        color: #ffff00;
        text-shadow: 4px 4px 0 #2121de;
    }

    #main-menu .menu-list {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    #main-menu .menu-item {
        position: relative;
        background: none;
        border: none;
        color: #fff;
        font-family: inherit;
        font-size: 16px;
        padding: 4px 0 4px 32px; /* space on the left for the arrow */
        text-align: left;
        cursor: pointer;
    }
    #main-menu .menu-item:focus { outline: none; }

    /* Selected item: yellow with a blinking arrow in front */
    #main-menu .menu-item.selected { color: #ffff00; }
    #main-menu .menu-item.selected::before {
        content: '▶';
        position: absolute;
        left: 0;
        animation: menu-blink 0.8s steps(1) infinite;
    }
    @keyframes menu-blink { 50% { opacity: 0; } }
`;

// Menu buttons, top to bottom. "action" is the key in the actions object below.
const MENU_ITEMS = [
    { label: 'PLAY', action: 'play' },
    { label: 'SETTINGS', action: 'settings' },
    { label: 'HIGH SCORES', action: 'highscores' },
];

let menuElement = null; // the whole menu <div>
let menuItems = [];     // the button elements
let selectedIndex = 0;  // which button is highlighted
let actions = {};       // what each button does

// Sets up the menu. Call once when the game loads.
//   container - element the menu goes into (needs position: relative so the menu covers it)
//   onPlay    - function that starts the game (from the game-logic team)
export function initMenu({ container, onPlay }) {
    actions = {
        play: onPlay,
        settings: () => setState(GameState.SETTINGS),      // screen in settingsMenu.js
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

function handleKeyDown(event) {
    // Ignore keys when the menu isn't on screen (e.g. arrows during the game)
    if (getState() !== GameState.MENU) return;

    switch (event.key) {
        case 'ArrowUp':
            // Going up from the first item wraps to the last one
            select((selectedIndex - 1 + menuItems.length) % menuItems.length);
            break;
        case 'ArrowDown':
            // Going down from the last item wraps to the first one
            select((selectedIndex + 1) % menuItems.length);
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
    //   (e.g. the Enter on SETTINGS also changing a setting on the settings screen)
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
