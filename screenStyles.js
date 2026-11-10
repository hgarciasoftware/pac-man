// ============================================================
// screenStyles.js - Shared look for all menu screens
//
// Every screen (main menu, character select, high scores,
// initials entry) uses these styles, so they all look the same
// and only need to describe their own layout.
//
// It also puts the current theme's colours into CSS variables on
// the page and updates them when the theme changes:
//   var(--theme-background), var(--theme-text),
//   var(--theme-highlight), var(--theme-accent)
// The game team can use these variables too.
//
// Usage (inside a screen's init function):
//   addScreenStyles();
//   screenElement.className = 'pm-screen';
// ============================================================

import { getThemeColors, onSettingChange } from './settings.js';

// Shared classes, all starting with "pm-" so they don't clash with the team's CSS.
// Sizes use "cqw": 1cqw = 1% of the screen's width, so everything
// scales with the game area instead of having a fixed pixel size.
const SCREEN_STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

    /* A screen covers the whole game area */
    .pm-screen {
        position: absolute;
        inset: 0;
        container-type: size; /* makes "cqw" measure this screen */
        overflow: hidden;
        background: var(--theme-background);
        color: var(--theme-text);
        font-family: 'Press Start 2P', monospace;
    }
    /* !important so it also wins over a screen's own "display: flex" */
    .pm-screen.hidden { display: none !important; }

    .pm-title {
        margin: 0;
        text-align: center;
        font-size: 7cqw;
        color: var(--theme-highlight);
        text-shadow: 0.7cqw 0.7cqw 0 var(--theme-accent);
    }

    /* Blocky retro button: square border in the theme's accent colour */
    .pm-button {
        background: none;
        border: 3px solid var(--theme-accent);
        color: var(--theme-text);
        font-family: inherit;
        font-size: 2.5cqw;
        padding: 2cqw;
        cursor: pointer;
    }
    .pm-button:focus { outline: none; }

    /* Selected button: filled block in the highlight colour */
    .pm-button.selected {
        background: var(--theme-highlight);
        border-color: var(--theme-highlight);
        color: var(--theme-background);
    }

    /* Small help text, e.g. "ENTER OK" */
    .pm-hint {
        margin: 0;
        text-align: center;
        font-size: 1.6cqw;
        opacity: 0.6;
    }
`;

let stylesAdded = false;

// Adds the shared styles and theme colours to the page.
// Every screen calls this; only the first call does anything.
export function addScreenStyles() {
    if (stylesAdded) return;
    stylesAdded = true;

    const style = document.createElement('style');
    style.textContent = SCREEN_STYLES;
    document.head.appendChild(style);

    applyTheme();
    onSettingChange((name) => {
        if (name === 'theme') applyTheme();
    });
}

// Puts the current theme's colours into the CSS variables.
function applyTheme() {
    const colors = getThemeColors();
    const root = document.documentElement.style;
    root.setProperty('--theme-background', colors.background);
    root.setProperty('--theme-text', colors.text);
    root.setProperty('--theme-highlight', colors.highlight);
    root.setProperty('--theme-accent', colors.accent);
}
