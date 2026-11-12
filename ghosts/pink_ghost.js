import { maze_v1 } from "../maze_demo.js";
import { player } from "../player_movement.js";

console.log("pink_ghost.js loaded");

const PINK_GHOST_SPEED = 4;

let pinkGhost = {
  x: 1,
  y: 1,
  renderX: 1,
  renderY: 1,
  moving: false
};

const PINK_DIRS = [
  {dx: 0, dy: -1},
  {dx: 0, dy: 1},
  {dx: -1, dy: 0},
  {dx: 1, dy: 0}
];

//pinks target: 4 tiles ahead of pacman, it tries to cut pacman off.
function pinkTarget() {
  const dir = player.nextDir;
  if (!dir) return {x: player.x, y: player.y};

  for (let n = 4; n >= 0; n--) {
    const tx = player.x + dir.dx * n;
    const ty = player.y + dir.dy * n;
    if (maze_v1[ty] !== undefined && maze_v1[ty][tx] === 0) {
      return {x: tx, y: ty};
    }
  }
  return {x: player.x, y: player.y};
}

// same code from red_ghost.js just modified slighltly for pink ghost;
function pinkNextStep(fromX, fromY, toX, toY, maze) {
  if (fromX == toX && fromY == toY) return null;

  const visited = maze.map(row => row.map(() => false));
  const queue = [{x: fromX, y: fromY, first: null}];
  visited[fromY][fromX] = true;

  for (let head = 0; head < queue.length; head++) {
    const current = queue[head];
    for (const d of PINK_DIRS) {
      const nx = current.x + d.dx;
      const ny = current.y + d.dy;

      if (maze[ny] === undefined || maze[ny][nx] === undefined) continue;
      if (maze[ny][nx] === 1 | visited[ny][nx]) continue;

      visited[ny][nx] = true;
      const first = current.first || d;
      if (nx === toX && ny === toY) return first;
      queue.push({x: nx, y: ny, first: first});
    }
  }
  return null;
}

export function updatePinkGhost(dt) {
  if (pinkGhost.moving) {
    const dx = pinkGhost.x - pinkGhost.renderX;
    const dy = pinkGhost.y - pinkGhost.renderY;
    const distance = Math.hypot(dx, dy);
    const step = PINK_GHOST_SPEED * dt;

    if (distance <= step) {
      pinkGhost.renderX = pinkGhost.x;
      pinkGhost.renderY = pinkGhost.y;
      pinkGhost.moving = false;
    } else {
      pinkGhost.renderX += (dx / distance) * step;
      pinkGhost.renderY += (dy / distance) * step;
    }
  }

  if (!pinkGhost.moving) {
    const target = pinkTarget();
    const next = pinkNextStep(pinkGhost.x, pinkGhost.y, target.x, target.y, maze_v1);
    if (next) {
      pinkGhost.x += next.dx;
      pinkGhost.y += next.dy;
      pinkGhost.moving = true;
    }
  }
}

export function pinkGhostCaughtPlayer() {
  const dx = pinkGhost.renderX - player.renderX;
  const dy = pinkGhost.renderY - player.renderY;
  return Math.hypot(dx, dy) < 0.6;
}

function drawPinkGhost() {
  ctx.fillStyle = '#ffb8ff';
  ctx.fillRect(pinkGhost.renderX * TILE_SIZE, pinkGhost.renderY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}
