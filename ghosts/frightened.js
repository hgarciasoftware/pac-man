// ghosts/frightened.js
let timeLeft = 0;
const caughtGhosts = new Set();

export function activateFrightenedMode(seconds = 8) {
  timeLeft = seconds; // A new super pellet resets the timer.
  caughtGhosts.clear();
}

export function updateFrightenedMode(dt) {
  timeLeft = Math.max(0, timeLeft - dt);

  if (timeLeft === 0) {
    caughtGhosts.clear();
  }
}

export function isFrightened(name) {
  return timeLeft > 0 && !caughtGhosts.has(name);
}

export function markGhostCaught(name) {
  caughtGhosts.add(name);
}

const DIRS = [
  {dx: 0, dy: -1},
  {dx: 0 , dy: 1},
  {dx: -1, dy: 0},
  {dx: 1, dy: 0}
];

export function frightenedNextStep(x, y, playerX, playerY, maze) {
  const distances = maze.map(row => row.map(() => -1));
  const queue = [{ x: playerX, y: playerY }];
  let head = 0;

  distances[playerY][playerX] = 0;

  // BFS outward from Pac-Man, recording distance to every reachable tile.
  while (head < queue.length) {
    const current = queue[head++];

    for (const { dx, dy } of DIRS) {
      const nx = current.x + dx;
      const ny = current.y + dy;

      if (maze[ny]?.[nx] !== 0 || distances[ny][nx] !== -1) continue;

      distances[ny][nx] = distances[current.y][current.x] + 1;
      queue.push({ x: nx, y: ny });
    }
  }

  const options = DIRS
    .map(direction => ({
      ...direction,
      nx: x + direction.dx,
      ny: y + direction.dy,
    }))
    .filter(({ nx, ny }) => maze[ny]?.[nx] === 0);

  if (options.length === 0) return null;

  const farthestDistance = Math.max(
    ...options.map(({ nx, ny }) => distances[ny][nx])
  );

  const farthestOptions = options.filter(
    ({ nx, ny }) => distances[ny][nx] === farthestDistance
  );

  // Randomize ties so a ghost doesn't always choose the same route.
  return farthestOptions[
    Math.floor(Math.random() * farthestOptions.length)
  ];
}
