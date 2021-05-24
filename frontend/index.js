const socket = io('https://secret-earth-68215.herokuapp.com/');
let playerNum = 0;

socket.on('gameState', handleGameState);
socket.on('gameEnd', handleGameEnd);
socket.on('gameId', handleGameId);
socket.on('invalidGameCode', handleInvalidGameCode);
socket.on('full', handleFullGame);
socket.on('countdown', handleCountdown);

function copy(){
  var copyText = document.getElementById('display-gameId');
  var copyBtn = document.getElementById('copy-btn');
  var textArea = document.createElement('textarea')
  textArea.value = copyText.textContent;
  document.body.append(textArea)
  textArea.select();
  document.execCommand("copy");
  textArea.remove()
  copyBtn.textContent = "Copied"
}


createGameBtn.addEventListener('click', () => {
  playerNum = 1
  socket.emit('newGame')
  init();
})

joinGameBtn.addEventListener('click', () => {
  playerNum = 2
  const gid = gameId.value;
 // console.log("gid",gid)
  socket.emit('joinGame', gid)
  init();
})


let canvas, ctx;
let play = false;

function init() {
  play = true;
  homeScreen.style.display = "none";
  gameScreen.style.display = "block";

  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  canvas.width = 700;
  canvas.height = 700;

  var gradient = ctx.createLinearGradient(0,0,canvas.width,canvas.height);
  gradient.addColorStop(0,bgColor)
  gradient.addColorStop(1,white)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // display initial message
  let text;
  if (playerNum == 1) {
    text = "Send the game code to a friend to start the game. Your snake is red.";
    message.textContent = text;
  } else if (playerNum == 2) {
    text = "You have joined the game. Your snake is blue."
    message.textContent = text;
  }
  document.addEventListener('keydown', keydown);
}

function keydown(e) {
  socket.emit('keydown', e.keyCode);
}

function paintGame(state) {
  var gradient = ctx.createLinearGradient(0,0,canvas.width,canvas.height);
  gradient.addColorStop(0,bgColor)
  gradient.addColorStop(1,white)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height);


  const food = state.food;
  const gridsize = state.gridsize;
  const size = canvas.width / gridsize;

  ctx.fillStyle = foodColor;
  ctx.fillRect(food.x * size, food.y * size, size, size);

  paintPlayer(state.players[0], size, snakeColor_1);
  paintPlayer(state.players[1], size, snakeColor_2);
}

function paintPlayer(playerState, size, color) {
  ctx.fillStyle = color;
  for (let cell of playerState.snake) {
    ctx.fillRect(cell.x * size, cell.y * size, size, size);
  }
}

/***** HANDLER FUNCTIONS *****/

function handleGameState(gameState){
  if(!play){
    return;
  }
  gameState = JSON.parse(gameState)
  //  calls a specified function to update an animation before the next repaint
  requestAnimationFrame(() => paintGame(gameState))
}

function handleCountdown(data){
  var sec = data["seconds"]
  counter_message.textContent = "Game starting in "
  var interval = setInterval( function displaySeconds() {
    counter_value.textContent = sec
    sec -= 1
    if (sec <= 0) {
      message.textContent = "";
      counter_value.textContent = "";
      counter_message.textContent = "";
      socket.emit('startGame', data["gameId"])
      clearInterval(interval)
    }
  }, 1200);
}

function handleGameEnd(data) {
  if(!play) {
    return;
  }
  let winner = JSON.parse(data).winner;
  if (winner == playerNum) {
    alert("You won!")
  } else {
    alert("You lost :( ")
  }
  play = false;
}

function handleGameId(gid) {
  displayGameId.innerText = gid;
}


function handleInvalidGameCode(){
  reset()
  alert("Game code invalid")
}
function handleFullGame(){
  reset()
  alert("This game is full")
}

/* Resets UI back to original state */
function reset() {
  playerNum = null;
  gameId.value = "";
  displayGameId.value = "";
  homeScreen.style.display = "block";
  gameScreen.style.display = "none"
}