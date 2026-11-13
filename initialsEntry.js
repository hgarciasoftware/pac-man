// ============================================================
// initialsEntry.js - "NEW HIGH SCORE!" initials entry
//
// Asks the player for 3 capital letters (arcade style) and saves
// the score to the top 10 (highScores.js). Used by the You Win and
// Game Over screens. Only appears if the score makes the top 10.
//   - Arrow Up / Down    : change the letter
//   - Arrow Left / Right : move to the previous / next letter
//   - A-Z keys           : type a letter (jumps to the next one)
//   - Backspace          : go back one letter
//   - Enter              : confirm
//   - Mouse              : click a letter to select it, click OK
//
// Usage (e.g. in the Game Over screen):
//   askForInitials({
//       container: gameContainerElement,
//       score: 1230,
//       onDone: (initials, rank) => { ... },   // rank 1-10
//   });
// If the score is not a top 10 score, nothing is shown and
// onDone(null, 0) runs straight away.
// ============================================================

import { isHighScore, addHighScore } from './highScores.js';
import { addScreenStyles } from './screenStyles.js';

// Layout of this screen only; colours and buttons come from screenStyles.js
const INITIALS_STYLES = `
    #initials-entry {
        z-index: 10; /* on top of the Game Over / You Win screen */
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6cqw;
    }

    #initials-entry .score {
        font-size: 3cqw;
    }

    #initials-entry .letters {
        display: flex;
        gap: 4cqw;
    }

    /* One box per letter; the one being edited is highlighted */
    #initials-entry .letter {
        width: 10cqw;
        padding: 2cqw 0;
        font-size: 7cqw;
    }
`;

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

let entry = null; // details of the open entry screen, or null when closed
let keyListenerAdded = false;

export function askForInitials({ container, score, onDone }) {
    if (!isHighScore(score)) {
        onDone(null, 0);
        return;
    }

    addScreenStyles();
    addStyles();

    // Only one key listener for the whole page, even if this is used many times.
    // "true" = capture phase: this listener runs before the other screens'
    // listeners, so letters like Q, R, M, T are typed here instead of
    // quitting, restarting, muting or changing the theme.
    if (!keyListenerAdded) {
        document.addEventListener('keydown', handleKeyDown, true);
        keyListenerAdded = true;
    }

    entry = {
        score,
        onDone,
        letters: ['A', 'A', 'A'],
        slot: 0,           // which of the 3 letters is being edited
        element: null,
        letterBoxes: [],
    };
    entry.element = createEntryElement();
    container.appendChild(entry.element);
    showLetters();
}

let stylesAdded = false;

function addStyles() {
    if (stylesAdded) return;
    stylesAdded = true;
    const style = document.createElement('style');
    style.textContent = INITIALS_STYLES;
    document.head.appendChild(style);
}

// Builds the screen HTML: title, score, 3 letter boxes, OK button, hint.
function createEntryElement() {
    const screen = document.createElement('div');
    screen.id = 'initials-entry';
    screen.className = 'pm-screen';

    const title = document.createElement('h2');
    title.className = 'pm-title';
    title.style.fontSize = '5cqw';
    title.textContent = 'NEW HIGH SCORE!';

    const score = document.createElement('p');
    score.className = 'score';
    score.textContent = `SCORE ${Math.round(entry.score)}`;

    const letters = document.createElement('div');
    letters.className = 'letters';
    entry.letterBoxes = entry.letters.map((_, index) => {
        const box = document.createElement('button');
        box.className = 'pm-button letter';
        box.addEventListener('click', () => {
            entry.slot = index;
            showLetters();
        });
        letters.appendChild(box);
        return box;
    });

    const okButton = document.createElement('button');
    okButton.className = 'pm-button';
    okButton.textContent = 'OK';
    okButton.addEventListener('click', confirm);

    const hint = document.createElement('p');
    hint.className = 'pm-hint';
    hint.textContent = 'UP/DOWN LETTER   ENTER OK';

    screen.append(title, score, letters, okButton, hint);
    return screen;
}

// Updates the 3 boxes: shows the letters and highlights the one being edited.
function showLetters() {
    entry.letterBoxes.forEach((box, index) => {
        box.textContent = entry.letters[index];
        box.classList.toggle('selected', index === entry.slot);
    });
}

// Moves the current letter forward (+1) or back (-1) through the alphabet, wrapping Z -> A.
function changeLetter(direction) {
    const index = ALPHABET.indexOf(entry.letters[entry.slot]);
    entry.letters[entry.slot] = ALPHABET[(index + direction + ALPHABET.length) % ALPHABET.length];
}

// Moves to another letter box, staying between the first and the last.
function moveSlot(direction) {
    entry.slot = Math.min(2, Math.max(0, entry.slot + direction));
}

function handleKeyDown(event) {
    // Only while the entry screen is open
    if (!entry) return;

    // Let browser shortcuts like Ctrl+R through
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    const key = event.key;

    if (key === 'ArrowUp') {
        changeLetter(+1);
    } else if (key === 'ArrowDown') {
        changeLetter(-1);
    } else if (key === 'ArrowLeft' || key === 'Backspace') {
        moveSlot(-1);
    } else if (key === 'ArrowRight') {
        moveSlot(+1);
    } else if (key === 'Enter') {
        confirm();
    } else if (key.length === 1 && ALPHABET.includes(key.toUpperCase())) {
        // Typed a letter: put it in the current box and go to the next one
        entry.letters[entry.slot] = key.toUpperCase();
        moveSlot(+1);
    } else {
        return; // not our key
    }

    if (entry) showLetters(); // entry is null if Enter just closed the screen

    // Stop the game and other screens reacting to this key press
    event.preventDefault();
    event.stopImmediatePropagation();
}

// Saves the score, closes the screen and tells the caller.
function confirm() {
    const { letters, score, onDone, element } = entry;
    const initials = letters.join('');
    const rank = addHighScore(initials, score);

    element.remove();
    entry = null;
    onDone(initials, rank);
}

