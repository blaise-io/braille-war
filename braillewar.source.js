// To compress:
// http://closure-compiler.appspot.com/home
// http://marijnhaverbeke.nl/uglifyjs (allow non-ascii)
// http://www.iteral.com/jscrush/

(function main(round) {

    var gameSpeed = 60;
    var gameWidth = 50;
    var gameRounds = 5;

    var playerPos = 1;
    var playerBullets = blank();

    var cpuPos = 1;
    var cpuKeepShooting = 0;
    var cpuHunting = 0;
    var cpuBullets = blank();

    var end = 0;

    var charHit = 'X';
    var braille = ' ⠉⠒⠛⠤⠭⠶x⣀⣉⣒x⣤'.split('');

    document.onkeydown = function(event) {
        if (end) {
            main(1);
        } else {
            round = round || 1;
        }
        switch (event.which) {
            case 38:
                return playerPos = Math.max(1, --playerPos);
            case 40:
                return playerPos = Math.min(4, ++playerPos);
            case 32:
            case 39:
                return playerBullets[0] = playerPos;
        }
    };

    (function loop() {
        var string, player, cpu, preventImmediateContinue, message = '';

        preventImmediateContinue = function() {
            setTimeout(function() {
                end = 1;
            }, 1500);
        };

        if (round) {
            cpuMove();
        } else {
            message = '↑ ↓ →';
            setTimeout(loop, gameSpeed);
        }

        // Move player bullets
        playerBullets.unshift(0);
        playerBullets.splice(gameWidth, gameWidth);

        // Move CPU bullets after collission check, or bullets will not always collide
        cpuBullets.shift();

        // Player segment
        player = playerbraille(playerPos);
        if (cpuBullets[0] == playerPos) {
            player = charHit;
            message = 'YOU DIED!';
            preventImmediateContinue();
        }

        // CPU
        cpu = playerbraille(cpuPos);
        if (playerBullets[gameWidth - 1] == playerPos) {
            cpu = charHit;
            if (round == gameRounds) {
                message = 'YOU WON!! TNX 4 PLAYING!';
                preventImmediateContinue();
            } else {
                message = 'LEVEL UP!';
                round++;
                setTimeout(function() {
                    gameSpeed -= 10;
                    gameWidth -= 7;
                    playerBullets = blank();
                    cpuBullets = blank();
                    loop();
                }, 1500);
            }
        }

        string = '#  ROUND ' + round + '/' + gameRounds + '  [' + player + ':';

        for (var i = 0; ++i < gameWidth;) {
            var playerBullet = brailleBullet(i, playerBullets),
                cpuBullet = brailleBullet(i, cpuBullets);

            if (playerBullet && playerBullets[i] == cpuBullets[i]) {
                playerBullets[i] = cpuBullets[i] = 0;
                string += charHit;
            }

            else if (playerBullet && playerBullets[i] == cpuBullets[i - 1]) {
                playerBullets[i] = cpuBullets[i - 1] = 0;
                string += charHit;
            }

            else {
                string += braille[playerBullet + cpuBullet];
            }
        }

        // CPU
        string += ':' + cpu + ']   ' + message;

        // Show
        top.location.replace(string);

        if (!message) {
            setTimeout(loop, gameSpeed);
        }
    })();

    function cpuMove() {

        // When user is spamming in same lane, spam back
        var matches, bullets, spamTreshold, spamFactor,
            randomChance = Math.random(),
            randomVariance = Math.random(),
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
            cpuPos = Math.min(Math.max(cpuPos + randomChance > .5 ? 1 : -1, 1), 4);
            cpuKeepShooting = randomVariance * 3 * round;
        }
    }

    function blank() {
        return new Array(gameWidth);
    }

    function brailleBullet(i, add) {
        return add[i] ? Math.pow(2, add[i] - 1) : 0;
    }

    function playerbraille(pos) {
        return braille[Math.pow(2, pos - 1)];
    }

})(0);