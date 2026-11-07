import { ctx, maze_v1, TILE_SIZE } from "./maze_demo.js";

console.log("pellet_collection.js loaded");

const pellet_radius = 3;

//this maps pellets onto every empty tile
// const pellets = maze_v1.map(row => row.map(cell => cell == 0));
let pellets = [];

// pellets[9][9] = false; // no pellets at the starting point


// draws pellets to the screen
export function drawPellets() {
  if (pellets.length === 0) {
    pellets = maze_v1.map(row => row.map(cell => cell == 0));
    pellets[9][9] = false;
  }

  ctx.fillStyle = '#ffd9a0';
  for (let i = 0; i < pellets.length; i++) {
    for (let j = 0; j < pellets[i].length; j++) {
      if (pellets[i][j]) {
        ctx.beginPath();
        ctx.arc(
          j * TILE_SIZE + TILE_SIZE / 2,
          i * TILE_SIZE + TILE_SIZE / 2,
          pellet_radius, 0, Math.PI * 2
        );
        ctx.fill();
      }
    }
  }
}


export function collectPellet(player) {
  if (pellets.length === 0) {
    pellets = maze_v1.map(row => row.map(cell => cell == 0));
    pellets[9][9] = false;
  }

  if (pellets[player.y][player.x]) {
    pellets[player.y][player.x] = false;
  }
}
function pelletsRemaining() {
  return pellets.flat().filter(Boolean).length;
}
