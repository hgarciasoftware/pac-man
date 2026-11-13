
console.log("pellet_collection.js loaded");


//pellet types are stored in the maze grid
const PELLET_NONE = 0;
const PELLET_REGULAR = 1;
const PELLET_SUPER = 2;

const pellet_radius = 3;
const super_pellet_radius = 7;

//this maps pellets onto every empty tile
const pellets = maze_v1.map(row => row.map(cell => cell == 0 ? PELLET_REGULAR : PELLET_NONE));

pellets[9][9] = PELLET_NONE; // no pellets at the starting point

//super pellets in the corners
pellets[1][1] = PELLET_SUPER;
pellets[1][17] = PELLET_SUPER;
pellets[21][1] = PELLET_SUPER;
pellets[21][17] = PELLET_SUPER;


// draws pellets to the screen
function drawPellets() {
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


function collectPellet(player) {
  const type = pellets[player.y][player.x];
  pellets[player.y][player.x] = PELLET_NONE;
  return type;
}
function pelletsRemaining() {
  return pellets.flat().filter(p => p != PELLET_NONE).length;
}

