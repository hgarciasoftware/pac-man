// ============================================================
// characterSelect.js - Character select screen
//
// Shown after START GAME, before the maze. The player picks
// Mr. Pac-Man or Mrs. Pac-Man (with her pink bow):
//   - Arrow keys : move between the two characters
//   - Enter      : confirm and start the game
//   - Escape     : back to the main menu
//   - Mouse      : hover to select, click to confirm
//
// The choice is saved as the 'character' setting ('mr' or 'mrs'),
// so the game can draw the right sprite: getSetting('character').
//
// Usage (in the team's main file, next to initMenu):
//   initCharacterSelect({ container: gameContainerElement, onPlay: startGame });
// ============================================================

import { GameState, getState, setState, onStateChange } from './state.js';
import { getSetting, setSetting } from './settings.js';
import { addScreenStyles } from './screenStyles.js';

// Layout of this screen only; colours and buttons come from screenStyles.js
const CHARACTER_STYLES = `
    #character-select {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8cqw;
    }

    #character-select .character-list {
        display: flex;
        gap: 4cqw;
    }

    /* One card per character: picture on top, name below */
    #character-select .character-card {
        width: 36cqw;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3cqw;
        font-size: 2.2cqw;
    }

    /* Selected card: highlight only the border and name, not the background,
       otherwise the yellow Pac-Man would disappear on a yellow block */
    #character-select .character-card.selected {
        background: none;
        border-color: var(--theme-highlight);
        color: var(--theme-highlight);
    }

    #character-select canvas {
        width: 18cqw;
        image-rendering: pixelated; /* keep the small drawing blocky when scaled up */
    }
`;

// The two characters, left to right. "id" is the value saved in settings.
const CHARACTERS = [
    { id: 'mr', label: 'MR. PAC-MAN' },
    { id: 'mrs', label: 'MRS. PAC-MAN' },
];

let screenElement = null; // the whole screen <div>
let cards = [];           // one card element per character
let selectedIndex = 0;    // which character is highlighted
let onPlayCallback = null;

// Sets up the screen. Call once when the game loads.
//   container - element the screen goes into (needs position: relative so the screen covers it)
//   onPlay    - function that starts the game (from the game-logic team)
export function initCharacterSelect({ container, onPlay }) {
    onPlayCallback = onPlay;

    addScreenStyles();
    addStyles();
    screenElement = createScreenElement();
    container.appendChild(screenElement);

    onStateChange((newState) => {
        const isOpen = newState === GameState.CHARACTER_SELECT;
        screenElement.classList.toggle('hidden', !isOpen);

        // Start on the character picked last time
        if (isOpen) {
            select(CHARACTERS.findIndex((character) => character.id === getSetting('character')));
        }
    });
    screenElement.classList.toggle('hidden', getState() !== GameState.CHARACTER_SELECT);

    document.addEventListener('keydown', handleKeyDown);
    select(0);
}

function addStyles() {
    const style = document.createElement('style');
    style.textContent = CHARACTER_STYLES;
    document.head.appendChild(style);
}

// Builds the screen HTML: a title and one card per character.
function createScreenElement() {
    const screen = document.createElement('div');
    screen.id = 'character-select';
    screen.className = 'pm-screen';

    const title = document.createElement('h2');
    title.className = 'pm-title';
    title.style.fontSize = '4.5cqw';
    title.textContent = 'CHOOSE PLAYER';

    const list = document.createElement('div');
    list.className = 'character-list';

    cards = CHARACTERS.map((character, index) => {
        const card = document.createElement('button');
        card.className = 'pm-button character-card';

        const picture = document.createElement('canvas');
        drawCharacter(picture, character.id);

        const name = document.createElement('span');
        name.textContent = character.label;

        card.append(picture, name);
        card.addEventListener('mouseenter', () => select(index));
        card.addEventListener('click', () => confirm(index));
        list.appendChild(card);
        return card;
    });

    const hint = document.createElement('p');
    hint.className = 'pm-hint';
    hint.textContent = 'ENTER START   ESC BACK';

    screen.append(title, list, hint);
    return screen;
}

// Draws a small 32x32 Pac-Man facing right; Mrs. Pac-Man also gets a pink bow.
// Simple placeholder until the graphics team's sprites are ready.
function drawCharacter(canvas, id) {
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    // Body: a yellow circle with the mouth cut out on the right
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.moveTo(16, 17);
    ctx.arc(16, 17, 13, 0.25 * Math.PI, 1.75 * Math.PI);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.fillStyle = '#000000';
    ctx.fillRect(15, 8, 3, 3);

    if (id === 'mrs') {
        // Bow: two pink triangles with a knot in the middle, on top of the head
        ctx.fillStyle = '#ff69b4';
        ctx.beginPath();
        ctx.moveTo(10, 5);
        ctx.lineTo(4, 1);
        ctx.lineTo(4, 9);
        ctx.moveTo(10, 5);
        ctx.lineTo(16, 1);
        ctx.lineTo(16, 9);
        ctx.fill();
        ctx.fillRect(8, 3, 4, 4);

        // Red lips at the corner of the mouth
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(23, 24, 3, 2);
    }
}

function handleKeyDown(event) {
    // Ignore keys when this screen isn't on screen
    if (getState() !== GameState.CHARACTER_SELECT) return;

    switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'ArrowRight':
        case 'ArrowDown':
            // Only two characters, so any arrow switches to the other one
            select(1 - selectedIndex);
            break;
        case 'Enter':
            confirm(selectedIndex);
            break;
        case 'Escape':
            setState(GameState.MENU);
            break;
        default:
            return; // not our key, let other code handle it
    }

    // This screen used the key:
    // - preventDefault stops page scrolling and a focused button firing its own click
    // - stopImmediatePropagation stops other key handlers reacting to the same press
    //   (e.g. the Enter that starts the game also being read by the game)
    event.preventDefault();
    event.stopImmediatePropagation();
}

// Moves the highlight to the card at the given index.
function select(index) {
    cards[selectedIndex].classList.remove('selected');
    selectedIndex = index;
    cards[selectedIndex].classList.add('selected');
}

// Saves the chosen character and starts the game.
function confirm(index) {
    setSetting('character', CHARACTERS[index].id);
    onPlayCallback();
}
