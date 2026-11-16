console.log("blue_ghost.js loaded");

const BLUE_GHOST_SPEED = 3;

let blueGhost = {
  x: 1,
  y: 21,
  renderX: 1,
  renderY: 21,
  moving: false
};

const BLUE_DIRS = [
  {dx: 0, dy: -1},
  {dx: 0, dy: 1},
  {dx: -1, dy: 0},
  {dx: 1, dy: 0}
];

//the open tile closest to (tx, ty). Needed because the double vector
//can land in a wall or off the map, and the search can only reach open tiles
function blueNearestOpenTile(tx, ty) {
  let best = {x: player.x, y: player.y};
  let bestDist = Infinity;
  
  for (let y = 0; y < maze_v1.length; y++) {
    for (let x = 0; x < maze_v1[y].length; x++) {
      if (maze_v1[y][x] != 0) continue;
      const dist = (x - tx) ** 2 + (y - ty) ** 2;
      if (dist < bestDist) {
        bestDist = dist;
        best = {x: x, y: y};
      }
    }
  }
  return best;
}

//blues target : pivot is 2 tiles ahead of pacman, then double the line
//from the red ghost to the pivot
function blueTarget() {
  const dir = player.nextDir || {dx: 0, dy: 0};
  const pivotX = player.x + dir.dx * 2;
  const pivotY = player.y + dir.dy * 2;

  const tx = redGhost.x + (pivotX - redGhost.x) * 2;
  const ty = redGhost.y + (pivotY - redGhost.y) * 2;

  return blueNearestOpenTile(tx, ty);
}

function blueNextStep(fromX, fromY, toX, toY, maze) {
  if (fromX == toX && fromY == toY) return null;

  const visited = maze.map(row => row.map(() => false));
  const queue = [{x: fromX, y: fromY, first: null}];
  visited[fromY][fromX] = true;

  for (let head = 0; head < queue.length; head++) {
    const current = queue[head];
    for (const d of BLUE_DIRS) {
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

function updateBlueGhost(dt) {
  if (blueGhost.moving) {
    const dx = blueGhost.x - blueGhost.renderX;
    const dy = blueGhost.y - blueGhost.renderY;
    const distance = Math.hypot(dx, dy);
    const step = BLUE_GHOST_SPEED * dt;

    if (distance <= step) {
      blueGhost.renderX = blueGhost.x;
      blueGhost.renderY = blueGhost.y;
      blueGhost.moving = false;
    } else {
      blueGhost.renderX += (dx / distance) * step;
      blueGhost.renderY += (dy / distance) * step;
    }
  }

  if (!blueGhost.moving) {
    const target = blueTarget();
    const next = blueNextStep(blueGhost.x, blueGhost.y, target.x, target.y, maze_v1);
    if (next) {
      blueGhost.x += next.dx;
      blueGhost.y += next.dy;
      blueGhost.moving = true;
    }
  }
}

function blueGhostCaughtPlayer() {
  const dx = blueGhost.renderX - player.renderX;
  const dy = blueGhost.renderY - player.renderY;
  return Math.hypot(dx, dy) < 0.6;
}

function drawBlueGhost() {
  ctx.fillStyle = '#00ffff';
  ctx.fillRect(blueGhost.renderX * TILE_SIZE, blueGhost.renderY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}



 

