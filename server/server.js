const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server, { cors:{origin: "*"}})
const { gameLoop, initGameState, getVelocity} = require("./game.js")
const { frame_rate, generateId} = require("./helpers.js")
let port = process.env.PORT;
if (port == null || port ==""){
    port = 3001
}
server.listen(port, () => {
    console.log("Server running on port", port);
})

/*
* Since we want multiple rooms, we use a global variable to hold the state of each room 
*/
// global variables
var rooms = {}; //lets us look up the roomId of a particular user(the user's socket id)
var states = {};

io.on('connection', (socket) => {
    
    socket.on('keydown', handleKeyPressed);
    socket.on('newGame', handleNewGame);
    socket.on('joinGame', handleJoinGame);
    socket.on('startGame', startGame)

    /** HANDLERS **/
    function handleJoinGame(gameId) {
        socket.emit('gameId', gameId);
         const room = io.sockets.adapter.rooms.get(gameId)
         let players;
         if (room) {
             players = room; //gives us the current players in room with key being the clientId
        }
         let numClients = 0;
         if (players) {
             numClients = players.length
         }
         if (numClients == 0){
             socket.emit('invalidGameCode');
             return;
         } else if (numClients > 1){
            socket.emit('full');
            return;
         }
         rooms[socket.id] = gameId;
         socket.join(gameId);
         socket.playerid = 1;
         io.sockets.in(gameId).emit('countdown', { seconds: 5, gameId: gameId })
    }

    function handleKeyPressed(keyCode) {
        let roomId = rooms[socket.id];
        try{
            keyCode = parseInt(keyCode);
        } catch(err) {
            console.error(error)
            return;
        }
        const velocity = getVelocity(keyCode);
        if(velocity && states[roomId]) {
            states[roomId].players[socket.playerid].vel = velocity
        } else {
            console.log("states[roomId] is undefined");
        }
    }

    function handleNewGame(){
        let gameId = generateId(5);
        rooms[socket.id] = gameId;
        socket.emit('gameId', gameId);
        states[gameId] = initGameState();
        socket.join(gameId);
        socket.playerid = 0;
    }

    function startGame(roomId) {
        const interval = setInterval( () => {
            const winner = gameLoop(states[roomId]); // tells which player wins
            if (!winner) {
                io.sockets.in(roomId).emit('gameState', JSON.stringify(states[roomId]))
            } else {
                io.sockets.in(roomId).emit('gameEnd', JSON.stringify({winner}));
                states[roomId] = null
                clearInterval(interval)
            }
        }, 1000/frame_rate) //how long to wait between each frame
    }
})



