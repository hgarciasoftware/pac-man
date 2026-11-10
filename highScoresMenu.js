// ============================================================
// highScoresMenu.js - High scores screen
//
// Shows the top 10 table (RANK / SCORE / INITIAL) while the game is
// in the HIGH_SCORES state. Empty places are shown as dashes.
//   - Enter / Escape : back to the main menu
//   - Mouse          : click BACK
//
// Usage (in the team's main file, next to initMenu):
//   initHighScoresMenu({ container: gameContainerElement });
// ============================================================

import { GameState, getState, setState, onStateChange } from './state.js';
import { getHighScores, MAX_HIGH_SCORES } from './highScores.js';
import { addScreenStyles } from './screenStyles.js';

// Layout of this screen only; colours and buttons come from screenStyles.js
const HIGH_SCORES_STYLES = `
    #high-scores {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6cqw;
    }

    #high-scores table {
        width: 70cqw;
        border-collapse: collapse;
        font-size: 2.4cqw;
    }
    #high-scores th {
        padding-bottom: 2cqw;
        color: var(--theme-highlight);
        font-weight: normal;
    }
    #high-scores td {
        padding: 1.2cqw 0;
        text-align: center;
    }
    #high-scores .rank {
        color: var(--theme-highlight);
    }
`;

let screenElement = null; // the whole screen <div>
let tableBody = null;     // <tbody> holding the 10 rows

// Sets up the screen. Call once when the game loads.
//   container - element the screen goes into (needs position: relative so the screen covers it)
export function initHighScoresMenu({ container }) {
    addScreenStyles();
    addStyles();
    screenElement = createScreenElement();
    container.appendChild(screenElement);

    onStateChange((newState) => {
        const isOpen = newState === GameState.HIGH_SCORES;
        screenElement.classList.toggle('hidden', !isOpen);

        // Rebuild the table every time, so a new high score shows up
        if (isOpen) fillTable();
    });
    screenElement.classList.toggle('hidden', getState() !== GameState.HIGH_SCORES);

    document.addEventListener('keydown', handleKeyDown);
    fillTable();
}

function addStyles() {
    const style = document.createElement('style');
    style.textContent = HIGH_SCORES_STYLES;
    document.head.appendChild(style);
}

// Builds the screen HTML: title, an empty table and a BACK button.
function createScreenElement() {
    const screen = document.createElement('div');
    screen.id = 'high-scores';
    screen.className = 'pm-screen';

    const title = document.createElement('h2');
    title.className = 'pm-title';
    title.style.fontSize = '5cqw';
    title.textContent = 'HIGH SCORES';

    const table = document.createElement('table');
    table.innerHTML = '<thead><tr><th>RANK</th><th>SCORE</th><th>INITIAL</th></tr></thead>';
    tableBody = document.createElement('tbody');
    table.appendChild(tableBody);

    // The only button on this screen, so it is always selected
    const backButton = document.createElement('button');
    backButton.className = 'pm-button selected';
    backButton.textContent = 'BACK';
    backButton.addEventListener('click', goBack);

    screen.append(title, table, backButton);
    return screen;
}

// Fills the table with the saved scores; missing places get dashes.
function fillTable() {
    const scores = getHighScores();
    tableBody.innerHTML = '';

    for (let rank = 1; rank <= MAX_HIGH_SCORES; rank++) {
        const entry = scores[rank - 1];
        const row = document.createElement('tr');
        row.append(
            createCell(rank, 'rank'),
            createCell(entry ? entry.score : '-----'),
            createCell(entry ? entry.initials : '---'),
        );
        tableBody.appendChild(row);
    }
}

// textContent (not innerHTML) so initials can never be read as HTML.
function createCell(text, className = '') {
    const cell = document.createElement('td');
    cell.className = className;
    cell.textContent = text;
    return cell;
}

function goBack() {
    setState(GameState.MENU);
}

function handleKeyDown(event) {
    // Ignore keys when this screen isn't on screen
    if (getState() !== GameState.HIGH_SCORES) return;

    if (event.key !== 'Enter' && event.key !== 'Escape') return; // not our key

    goBack();

    // Stop the same key press also being read by the main menu
    event.preventDefault();
    event.stopImmediatePropagation();
}
