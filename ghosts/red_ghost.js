
console.log("red_ghost.js loaded");

const RED_GHOST_SPEED = 4;

let redGhost = {
  x: 17,
  y: 1,
  renderX : 17,
  renderY: 1,
  moving: false
};

const RED_DIRS = [
  {dx: 0, dy: -1},
  {dx: 0 , dy: 1},
  {dx: -1, dy: 0},
  {dx: 1, dy: 0}
];


//red's way of moving : it searches for the shortest path to pacman, always
//follows pacman and rarely turns around
//returns the first step {dx, dy} on that path

function redNextStep(fromX, fromY, toX, toY, maze) {
  if (fromX == toX && fromY == toY) return null;
  
  // this prevents the red ghost from going to previous tiles
  // by keeping track of what tiles it has visited so far
  // immediately after leaving it, basically stopping it from
  // going it constant circles;
  const visited = maze.map(row => row.map(() => false));
  const queue = [{x: fromX, y: fromY, first: null}];
  visited[fromY][fromX] = true;
  
  //Actual search for the next tile to go to
  for (let head = 0; head < queue.length; head++) {
    const current = queue[head];
    for (const d of RED_DIRS) {
      const nx = current.x + d.dx;
      const ny = current.y + d.dy;
  
      if (maze[ny] == undefined || maze[ny][nx] == undefined) continue;
      if (maze[ny][nx] == 1 || visited[ny][nx]) continue;

      visited[ny][nx] = true;
      const first = current.first || d;
      
      //if the neighbor of the current position has pacman on it, it returns
      //its first step, which is where the ghost should move to.
      //If not, it's added to a quete to return to later
      if (nx == toX && ny == toY) return first;
      queue.push({x: nx, y: ny, first: first});
    }
  }
  return null;
}

function updateRedGhost(dt) {
  //slide the drawn position toward the actual tile
  if (redGhost.moving) {
    const dx = redGhost.x - redGhost.renderX;
    const dy = redGhost.y - redGhost.renderY;
    const distance = Math.hypot(dx, dy);
    const step = RED_GHOST_SPEED * dt;
    
    //same logic that makes player movement smooth in player_movement.js
    if (distance <= step) {
      redGhost.renderX = redGhost.x;
      redGhost.renderY = redGhost.y;
      redGhost.moving = false;
    } else {
      redGhost.renderX += (dx / distance) * step;
      redGhost.renderY += (dy / distance) * step;
    }
  }

  //when it reaches a specific tile, it steps towards pacmans current tile
  if (!redGhost.moving) {
    const next = redNextStep(redGhost.x, redGhost.y, player.x, player.y, maze_v1);
    if (next) {
      redGhost.x += next.dx;
      redGhost.y += next.dy;
      redGhost.moving = true;
    }
  }
}

//true when the ghost and pacman share the same position, (pacman dies)
function redGhostCaughtPlayer() {
  const dx = redGhost.renderX - player.renderX;
  const dy = redGhost.renderY - player.renderY;
  return Math.hypot(dx, dy) < 0.6;
  // 0.6 is the catch distance, increasing it will make it
  // so even a slight graze will catch pacman; maybe this could be 
  // something that could be increased for a higher difficulty
  
}

//this is just temporary for testing purposes, can be replaced with 
//code that provides that actual images for the red ghost
function drawRedGhost() {
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(redGhost.renderX * TILE_SIZE, redGhost.renderY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}


