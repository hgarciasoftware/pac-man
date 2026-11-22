import { GameState, getState } from './state.js';
import { draw, maze_v1 } from './maze_demo.js';
import { collectPellet, pelletsRemaining, PELLET_REGULAR, PELLET_SUPER } from './pellet_collection.js';
import { redGhostCaughtPlayer, resetRedGhost, updateRedGhost } from "./ghosts/red_ghost.js";
import { pinkGhostCaughtPlayer, resetPinkGhost, updatePinkGhost } from './ghosts/pink_ghost.js';
import { blueGhostCaughtPlayer, resetBlueGhost, updateBlueGhost } from './ghosts/blue_ghost.js';
import { orangeGhostCaughtPlayer, resetOrangeGhost, updateOrangeGhost } from './ghosts/orange_ghost.js';
import { awardPellet, getScoreData } from './scoring.js';
import { getCurrentLevel, completeLevel } from './levelProgression.js';
import { loseLife } from './lives.js';
import { activateFrightenedMode, updateFrightenedMode } from "./ghosts/frightened.js";

console.log("player_movement.js loaded");

const SPEED = 5; // tiles per second, can increase for difficulty?
const START = {x: 9, y: 9}; // the player's starting point

export let gameOver = false;

// variables for frame counting
let frameCount = 0;
let fpsTimer = 0;
let last = performance.now();

export let player = {
    x: START.x,            // logical tile (used for collision)
    y: START.y,
    renderX: START.x,      // smoothed position (used for drawing), in tile units
    renderY: START.y,
    moving: false,
    nextDir: null, // buffered direction
    pellets: 0
};

//a change in x or y based on the key input
const movements = {
    ArrowUp: {dy: -1, dx: 0},
    ArrowDown: {dy: 1, dx: 0},
    ArrowLeft: {dy: 0, dx: -1},
    ArrowRight: {dy: 0, dx: 1}
};

// move the player back to the starting point
function resetPlayer() {
    player.x = START.x;
    player.y = START.y;
    player.renderX = START.x;
    player.renderY = START.y;
    player.moving = false;
    player.nextDir = null;
}

/* Sends move log to the console, as well as updates a coordinate
    text below the maze, I don't know if this is temporary or a feature,
    or something that can be toggled in settings, up to Specs.
*/
function logMovement(player) {
    console.log(`You have moved to (${player.x}, ${player.y})`);
    document.getElementById('coordinates').textContent = `[${player.x}, ${player.y}]`;
}

function logFPS(fps) {
    console.log(`FPS: ${fps}`);
    document.getElementById('fps').textContent = `${fps}`;
}

document.addEventListener('keydown', (event) => {
    // if the game's state is not PLAYING then do not allow the player to move
    if (getState() !== GameState.PLAYING) return;

    const direction = movements[event.key];

    //this is so it ignores all keys that arent the arrow keys
    if (!direction) {
        return;
    }
    event.preventDefault();
    player.nextDir = direction;
});

function checkCollision(player, direction, maze) {
    const newX = player.x + direction.dx;
    const newY = player.y + direction.dy;

    // out of bounds counts as a wall
    if (maze[newY] === undefined || maze[newY][newX] === undefined) {
        return true;
    }

    if (maze[newY][newX] == 1) { // Wall!!
        return true;
    }
    return false;
}

function update(dt) {
    // the position the player is drawn at slides toward the logical tile
    if (player.moving) {
        const dx = player.x - player.renderX;
        const dy = player.y - player.renderY;
        const distance = Math.hypot(dx, dy);
        const step = SPEED * dt;

        if (distance <= step) {
            player.renderX = player.x;
            player.renderY = player.y;
            player.moving = false;

            // logs all pellets eaten in the 'pellets' field in player
            const eaten = collectPellet(player);
            if (eaten == PELLET_REGULAR) {
              player.pellets++;
              awardPellet(eaten, getCurrentLevel());
            } else if (eaten == PELLET_SUPER) {
              player.pellets++;
              awardPellet(eaten, getCurrentLevel());
              activateFrightenedMode(8);
            }

            // retrieve the player's score and completion status
            const score = getScoreData();
            const completion = completeLevel(pelletsRemaining());

            // TODO: display the score to the player
            console.log('totalScore: ' + score.totalScore);

            // TODO: display completion status to the player
            if (completion) {
                console.log('Level complete:', completion);
            }
        } else {
            player.renderX += (dx / distance) * step;
            player.renderY += (dy / distance) * step;
        }
    }

    // collision detection for walls, then start the next move
    if (!player.moving && player.nextDir) {
        if (!checkCollision(player, player.nextDir, maze_v1)) {
            player.x += player.nextDir.dx;
            player.y += player.nextDir.dy;
            player.moving = true;
            logMovement(player);
        }
    }
}

function loop(now) {
    const rawDt = (now - last) / 1000;
    last = now;
    const dt = Math.min(rawDt, 1 / 30);

    frameCount++;
    fpsTimer += rawDt;
    if (fpsTimer >= 1) {
        logFPS(Math.round(frameCount / fpsTimer));
        frameCount = 0;
        fpsTimer = 0;
    }

    if (!gameOver) {
        update(dt);
        updateFrightenedMode(dt);
        updateRedGhost(dt);
        updatePinkGhost(dt);
        updateBlueGhost(dt);
        updateOrangeGhost(dt);
        if (redGhostCaughtPlayer() || pinkGhostCaughtPlayer() || blueGhostCaughtPlayer() || orangeGhostCaughtPlayer()) {
            // loseLife() returns an object with three properties:
            // lives (number), lifeLost (boolean), and gameOver (boolean)
            const result = loseLife();

            if (result.gameOver) {
                gameOver = true;
                // TODO: handle game over
            } else {
                resetPlayer();
                resetRedGhost();
                resetPinkGhost();
                resetBlueGhost();
                resetOrangeGhost();
            }
        }
    }
    draw(maze_v1);
    requestAnimationFrame(loop);
}

export function startGameLoop() {
    last = performance.now();
    requestAnimationFrame(loop);
}
