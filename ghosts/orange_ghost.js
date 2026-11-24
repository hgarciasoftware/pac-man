import { ctx, maze_v1, TILE_SIZE } from "../maze_demo.js";
import { player } from "../player_movement.js";
import { frightenedNextStep, isFrightened, markGhostCaught } from "./frightened.js";

console.log("orange_ghost.js loaded");

const ORANGE_GHOST_SPEED = 3;
const ORANGE_SHY_DISTANCE = 8; // tiles;
const ORANGE_GHOST_START = {x: 17, y: 21};

export let orangeGhost = {
  x:  ORANGE_GHOST_START.x,
  y: ORANGE_GHOST_START.y,
  renderX: ORANGE_GHOST_START.x,
  renderY: ORANGE_GHOST_START.y,
  moving: false
};

//the corner orange retreats to when he gets too close
const ORANGE_HOME = {x: 1, y: 21};

const ORANGE_DIRS = [
  {dx: 0, dy: -1},
  {dx: 0, dy: 1},
  {dx: -1, dy: 0},
  {dx: 1, dy: 0}
];

//orange's target: chases pacman when far away, goes to his corner
//when closer to pacman
function orangeTarget() {
  const distance = Math.hypot(orangeGhost.x - player.x, orangeGhost.y - player.y);
  if (distance > ORANGE_SHY_DISTANCE) {
    return {x: player.x, y: player.y};
  }
  return ORANGE_HOME;
}

function orangeNextStep(fromX, fromY, toX, toY, maze) {
  if (fromX == toX && fromY == toY) return null;
  
  const visited = maze.map(row => row.map(() => false));
  const queue = [{x: fromX, y: fromY, first: null}];
  visited[fromY][fromX] = true;

  for (let head = 0; head < queue.length; head++) {
    const current = queue[head];
    for (const d of ORANGE_DIRS) {
      const nx = current.x + d.dx;
      const ny = current.y + d.dy;

      if (maze[ny] === undefined || maze[ny][nx] === undefined) continue;
      if (maze[ny][nx] == 1 || visited[ny][nx]) continue;

      visited[ny][nx] = true;
      const first = current.first || d;
      if (nx == toX && ny == toY) return first;
      queue.push({x: nx, y: ny, first: first});
    }
  }
  return null;
}

export function updateOrangeGhost(dt) {
  if (orangeGhost.moving) {
    const dx = orangeGhost.x - orangeGhost.renderX;
    const dy = orangeGhost.y - orangeGhost.renderY;
    const distance = Math.hypot(dx, dy);
    const step = ORANGE_GHOST_SPEED * dt;

    if (distance <= step) {
      orangeGhost.renderX = orangeGhost.x;
      orangeGhost.renderY = orangeGhost.y;
      orangeGhost.moving = false;
    } else {
      orangeGhost.renderX += (dx / distance) * step;
      orangeGhost.renderY += (dy / distance) * step;
    }
  }

  if (!orangeGhost.moving) {
    const target = orangeTarget();
    const next = isFrightened('orange')
      ? frightenedNextStep(orangeGhost.x, orangeGhost.y, player.x, player.y, maze_v1)
      : orangeNextStep(orangeGhost.x, orangeGhost.y, target.x, target.y, maze_v1);
    if (next) {
      orangeGhost.x += next.dx;
      orangeGhost.y += next.dy;
      orangeGhost.moving = true;
    }
  }
}

export function orangeGhostCaughtPlayer() {
  const dx = orangeGhost.renderX - player.renderX;
  const dy = orangeGhost.renderY - player.renderY;
  const touching =  Math.hypot(dx, dy) < 0.6;

  if (!touching) return false;

  if (isFrightened('orange')) {
    markGhostCaught('orange');
    resetOrangeGhost();
    return false; // The game loop won't make Pac-Man lose a life.
  }

  return true; // Normal ghost: Pac-Man loses a life.
}

export function drawOrangeGhost() {
  ctx.fillStyle = isFrightened('orange') ? '#ffffff' : '#ffb852';
  ctx.fillRect(orangeGhost.renderX * TILE_SIZE, orangeGhost.renderY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

export function resetOrangeGhost() {
  orangeGhost.x = ORANGE_GHOST_START.x;
  orangeGhost.y = ORANGE_GHOST_START.y;
  orangeGhost.renderX = ORANGE_GHOST_START.x;
  orangeGhost.renderY = ORANGE_GHOST_START.y;
  orangeGhost.moving = false;
}
