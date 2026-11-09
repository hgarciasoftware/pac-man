import { GameState, getState } from './state.js';
import { draw, maze_v1 } from './maze_demo.js';
import { collectPellet } from './pellet_collection.js';
import { redGhostCaughtPlayer, updateRedGhost } from "./ghosts/red_ghost.js";

console.log("player_movement.js loaded");

const SPEED = 5; // tiles per second, can increase for difficulty?

export let gameOver = false;

// variables for frame counting
let frameCount = 0;
let fpsTimer = 0;
let last = performance.now();

export let player = {
    x: 9,            // logical tile (used for collision)
    y: 9,
    renderX: 9,      // smoothed position (used for drawing), in tile units
    renderY: 9,
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
            collectPellet(player);
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
        updateRedGhost(dt);
        if (redGhostCaughtPlayer()) {
            gameOver = true;
        }
    }
    draw(maze_v1);
    requestAnimationFrame(loop);
}

export function startGameLoop() {
    last = performance.now();
    requestAnimationFrame(loop);
}
