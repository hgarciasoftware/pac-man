console.log("player_movement.js loaded");

let player = {
    x: 9,
    y: 9
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
    document.getElementById('coordinates').textContent = `[${player.x}, ${player.y}]`; //this could be removed as it is just to display coordinates on a temp webpage I was working on, We can keep if we plan to display coords.
};

document.addEventListener('keydown', (event) => {
    console.log(`Key pressed: ${event.key}`);
    const direction = movements[event.key];

    //this is so it ignores all keys that arent the arrow keys
    if (!direction) {
        return;
    };
    event.preventDefault();
    /*
    if checkCollision returns false, this moves the player's x and y.
    */
    if (!checkCollision(player, direction , maze_v1)) {
        player.x += direction.dx;
        player.y += direction.dy;
        logMovement(player);
        draw(maze_v1)
    };
});


function checkCollision(player, direction, maze) {
    const newX = player.x + direction.dx;
    const newY = player.y + direction.dy;


    if (maze[newY][newX] == 1) { // Wall!!
        console.log(`Wall at (${newX}, ${newY})`);
        return true;
    }
    return false;
}
