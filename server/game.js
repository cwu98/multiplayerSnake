const { frame_rate, grid_size } = require('./helpers')

function initGameState() {
    let state = {
        players: [{
          pos: {
            x: 4,
            y: 10,
          },
          vel: {
            x: 1,
            y: 0,
          },
          snake: [
            {x: 2, y: 10},
            {x: 3, y: 10},
            {x: 4, y: 10},
          ],
        }, {
        pos: {
            x: 4,
            y: 20,
          },
          vel: {
            x: 1,
            y: 0,
          },
          snake: [
            {x: 2, y: 20},
            {x: 3, y: 20},
            {x: 4, y: 20},
          ],
        }
    ],
        food: {
            x: 0,
            y: 0
        },
        gridsize: grid_size,
    };
    food(state)
    return state
}

function gameLoop(state) {
    if(!state) {
        return;
    } else {
        const player1 = state.players[0];
        const player2 = state.players[1];
        console.log(player1, player2)
        player1.pos.x += player1.vel.x;
        player1.pos.y += player1.vel.y;
        player2.pos.x += player2.vel.x;
        player2.pos.y += player2.vel.y;
        
        // check in bounds
        if (player1.pos.x < 0 || player1.pos.x > grid_size || player1.pos.y < 0 || player1.pos.y > grid_size){
           return 2; 
        } 
        if (player2.pos.x < 0 || player2.pos.x > grid_size || player2.pos.y < 0 || player2.pos.y > grid_size){
            return 1; 
        } 
        // check if snake is eating the food
        if (state.food.x === player1.pos.x && state.food.y == player1.pos.y) {
            player1.snake.push({...player1.pos}); // increase size of player
            player1.pos.x += player1.vel.x;
            player1.pos.y += player1.vel.y;
        
            food(state); // add new food to the screen
        }
        if (state.food.x === player2.pos.x && state.food.y == player2.pos.y) {
            player2.snake.push({...player2.pos}); // increase size of player
            player2.pos.x += player2.vel.x;
            player2.pos.y += player2.vel.y;
        
            food(state); // add new food to the screen
        }

        if (player1.vel.x || player1.vel.y) {
            // make sure snake hasn't touched itself
            for(let cell of player1.snake){
                if (player1.pos.x === cell.x  && player1.pos.y === cell.y) {
                    return 2;
                }                
            }
            // update the player's snake to reflect its movement
            player1.snake.push({...player1.pos});
            player1.snake.shift();
        }
        if (player2.vel.x || player2.vel.y) {
            // make sure snake hasn't touched itself
            for(let cell of player2.snake){
                if (player2.pos.x === cell.x  && player2.pos.y === cell.y) {
                    return 1;
                }                
            }
            // update the player's snake to reflect its movement
            player2.snake.push({...player2.pos});
            player2.snake.shift();
        }
    }
    return false; 
}

function getVelocity(keyCode) {
    switch(keyCode) {
        case 37: {
            return {x: -1, y: 0};
        }
        case 39: {
            return {x: 1, y: 0};
        }
        case 40: {
            return {x: 0, y: 1};
        }
        case 38: {
            return {x: 0, y: -1};
        }
    }
}

function food(state){
    let randomCell = {
        x: Math.floor(Math.random() * grid_size),
        y: Math.floor(Math.random() * grid_size) 
    }
    // make sure food is not on a snake
    for(let cell of state.players[0].snake) {
        if(cell.x === randomCell.x && cell.y == randomCell.y) {
            return food(state); // recursively find a valid cell to put new food
        }
    }
    for(let cell of state.players[1].snake) {
        if(cell.x === randomCell.x && cell.y == randomCell.y) {
            return food(state); // recursively find a valid cell to put new food
        }
    }
    state.food = randomCell;
}

module.exports = {initGameState, gameLoop, getVelocity}