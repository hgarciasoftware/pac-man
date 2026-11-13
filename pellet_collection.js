import { ctx, maze_v1, TILE_SIZE } from "./maze_demo.js";

console.log("pellet_collection.js loaded");


//pellet types are stored in the maze grid
const PELLET_NONE = 0;
export const PELLET_REGULAR = 1;
export const PELLET_SUPER = 2;

const pellet_radius = 3;
const super_pellet_radius = 7;

//this maps pellets onto every empty tile
// Note to Hector: explain what commenting Elian's code here achieves
// Note to Hector: explain how you eventually implement Elian's code
// const pellets = maze_v1.map(row => row.map(cell => cell == 0 ? PELLET_REGULAR : PELLET_NONE));
let pellets = [];

// pellets[9][9] = PELLET_NONE; // no pellets at the starting point

//super pellets in the corners
// pellets[1][1] = PELLET_SUPER;
// pellets[1][17] = PELLET_SUPER;
// pellets[21][1] = PELLET_SUPER;
// pellets[21][17] = PELLET_SUPER;


// draws pellets to the screen
export function drawPellets() {
  if (pellets.length === 0) {
    pellets = maze_v1.map(row => row.map(cell => cell == 0 ? PELLET_REGULAR : PELLET_NONE));
    pellets[9][9] = PELLET_NONE;
    pellets[1][1] = PELLET_SUPER;
    pellets[1][17] = PELLET_SUPER;
    pellets[21][1] = PELLET_SUPER;
    pellets[21][17] = PELLET_SUPER;
  }

  ctx.fillStyle = '#ffd9a0';
  for (let i = 0; i < pellets.length; i++) {
    for (let j = 0; j < pellets[i].length; j++) {
      if (pellets[i][j] == PELLET_NONE) continue;
      // follows lines to the replaced with the actual image of the pellet, this is just temporary
      // for testing purposes
      const radius = pellets[i][j] == PELLET_SUPER ? super_pellet_radius : pellet_radius;
      ctx.beginPath();
      ctx.arc(
        j * TILE_SIZE + TILE_SIZE / 2,
        i * TILE_SIZE + TILE_SIZE / 2,
        radius, 0, Math.PI * 2
      );
      ctx.fill();
    }
  }
}


export function collectPellet(player) {
  if (pellets.length === 0) {
    pellets = maze_v1.map(row => row.map(cell => cell == 0 ? PELLET_REGULAR : PELLET_NONE));
    pellets[9][9] = PELLET_NONE;
    pellets[1][1] = PELLET_SUPER;
    pellets[1][17] = PELLET_SUPER;
    pellets[21][1] = PELLET_SUPER;
    pellets[21][17] = PELLET_SUPER;
  }

  const type = pellets[player.y][player.x];
  pellets[player.y][player.x] = PELLET_NONE;
  return type;
}
export function pelletsRemaining() {
  return pellets.flat().filter(p => p != PELLET_NONE).length;
}
