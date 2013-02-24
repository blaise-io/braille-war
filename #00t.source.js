var gameSpeed = 80;
var gameWidth = 60;
var gameRounds = 5;

var playerPos = 1;
var playerBullets = blank();

var cpuPos = 1;
var cpuKeepShooting = 0;
var cpuHunting = 0;
var cpuBullets = blank();

var round = 1;

var charHit = 'X';
var braille = ' ⠉⠒⠛⠤⠭⠶x⣀⣉⣒x⣤'.split('');

var math = Math,
    min = math.min,
    max = math.max,
    pow = math.pow,
    random = math.random;

onkeydown = function(event) {
    switch (event.which) {
        case 38:
            return playerPos = max(1, --playerPos);
        case 40:
            return playerPos = min(4, ++playerPos);
        case 32:
        case 39:
            return playerBullets[0] = playerPos;
    }
};

(function TURN() {
    var string, player, cpu, quit = '';

    CPUMOVE();

    // Move player bullets
    playerBullets.unshift(0);
    playerBullets.splice(gameWidth, gameWidth);

    // Move CPU bullets after collission check, or bullets will not always collide
    cpuBullets.shift();

    // Player segment
    player = playerbraille(playerPos);
    if (cpuBullets[0] == playerPos) {
        player = charHit;
        quit = 'UDIED!(F5)';
    }

    // CPU
    cpu = playerbraille(cpuPos);
    if (playerBullets[gameWidth - 1] == playerPos) {
        cpu = charHit;
        if (round == gameRounds) {
            quit = 'UWON!'
        } else {
            quit = 'LEVELUP!';
            gameSpeed -= 15;
            gameWidth -= 8;
            playerBullets = blank();
            cpuBullets = blank();
            setTimeout(TURN, 2000);
            round++;
        }
    }

    string = 'ROUND ' + round + '/' + gameRounds + ' [' + player + ':';

    for (var i = 0; ++i < gameWidth;) {
        var charIndex = brailleBullet(i, playerBullets);
        if (charIndex && playerBullets[i] == cpuBullets[i]) {
            playerBullets[i] = cpuBullets[i] = 0;
            string += charHit;
        } else if (charIndex && playerBullets[i] == cpuBullets[i + 1]) {
            playerBullets[i] = cpuBullets[i + 1] = 0;
            i += 1;
            string += braille[0] + charHit;
        } else {
            string += braille[charIndex + brailleBullet(i, cpuBullets)];
        }
    }

    // CPU
    string += ':' + cpu + '] ';

    // Show
    top.location.replace('#' + string + quit);

    if (!quit) {
        setTimeout(TURN, gameSpeed);
    }
})();

function CPUMOVE() {

    // When user is spamming in same lane, spam back
    var matches, bullets, spamTreshold, spamFactor,
        randomChance = random(),
        randomVariance = random(),
        join = playerBullets.join('');

    bullets = join.match(/[^0]/g);
    spamTreshold = gameWidth / 4;
    spamFactor = (bullets && bullets.length / gameWidth) || 0.001;

    matches = join.match(new RegExp(cpuPos, 'g'));
    if (matches && matches.length > spamTreshold) {
        cpuKeepShooting = spamTreshold;
    }

    // Bullet are close-by, defensive shooting
    else if (playerBullets.lastIndexOf(cpuPos) > gameWidth * 0.8) {
        cpuKeepShooting = spamTreshold * 0.2;
    }

    // Shoot in current lane
    if (cpuKeepShooting > 0 || randomChance < spamFactor) {
        cpuKeepShooting--;
        if (cpuKeepShooting && randomVariance < 0.8) { // Hickup
            return cpuBullets[gameWidth] = cpuPos; // Shoot
        }
    }

    // Move to player lane and shoot a couple of times
    if (cpuHunting || (randomChance < spamFactor + 0.1)) {
        cpuHunting = 1;
        if (cpuPos == playerPos) {
            cpuHunting = 0;
            return cpuKeepShooting = randomVariance * spamFactor * 70;
        } else {
            return cpuPos += (cpuPos > playerPos) ? -1 : 1;
        }
    }

    // Move around randomly
    if (randomChance < spamFactor + 0.12) {
        cpuPos += min(max(randomChance > .5 ? 1 : -1, 1), 4);
        cpuKeepShooting = randomVariance * 3 * round;
    }
}

function blank() {
    return new Array(gameWidth);
}

function brailleBullet(i, add) {
    return add[i] ? pow(2, add[i] - 1) : 0;
}

function playerbraille(pos) {
    return braille[pow(2, pos - 1)];
}