const frame_rate = 10;
const grid_size= 25;

function generateId(length) {
    let result = '';
    let characters = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    for(let i = 0; i < length; i++){
        let index = Math.floor(Math.random()*characters.length)
        result += characters.charAt(index);
    }
    return result;
}

module.exports = {
    frame_rate,
    grid_size,
    generateId
}