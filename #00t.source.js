var playerPos = 0;
var playerBullets = [10,0];

var cpuPos = 0;
var cpuBullets = [0,0, 1,1, 2,2, 3,3]; // TODO: make fixed length

var gameSpeed = 50;
var gameWidth = 20;

setInterval(function main() {
    paint();
    update();
}, gameSpeed);

function getBullets() {
    var paintBullets = [];
    for (var i = 0; i < cpuBullets.length; i += 2) {
        var bullet = cpuBullets[i];
        paintBullets[bullet] =
            (paintBullets[bullet] || 0) +
                Math.pow(cpuBullets[i + 1], 2);
    }
    return paintBullets;
}

function update() {

}

function binToBraille(pos) {
    return '⠀⠁⠂⠃⠄⠅⠆X⡀⡁⡂X⡄'.charAt(pos == undefined ? 0 : pos + 1);
}

function paint() {
    var bullets = getBullets(), string = binToBraille(playerPos) + ' ';
    for (var i = 0; i < gameWidth; i++) {
        string += binToBraille(bullets[i])
    }
    string += ' ' + binToBraille(cpuPos);
    location.replace('#' + string);
}