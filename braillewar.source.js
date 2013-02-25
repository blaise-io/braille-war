// To compress:
// http://closure-compiler.appspot.com/home
// http://marijnhaverbeke.nl/uglifyjs (allow non-ascii)
// http://www.iteral.com/jscrush/

var main = function(round) {

    var gameSpeed = 80 - (round || 1) * -10;
    var gameWidth = 50 - (round || 1) * 7;
    var gameRounds = 5;

    var playerPos = 1;

    var cpuPos = 1;
    var cpuAiKeepShooting = 0;
    var cpuAiHunting = 0;

    var end;

    var charHit = '✴';
    var killedChar = '†';
    var texts = ';ARROW KEYS;YOU DIED!;HURRAY YOU WON!;NEXT ROUND;# ROUND '.split(';');
    var braille = '⠀⠉⠒⠛⠤⠭⠶/⣀⣉⣒/⣤'.split('');

    var playerBullets = new Array(gameWidth);
    var cpuBullets = new Array(gameWidth);

    onkeydown = function(event) {
        var w = event.which;

        if (end || !round) {
            main(1);
        }

        if (w == 38) {
            playerPos = Math.max(1, playerPos - 1);
        } else if (w == 40) {
            playerPos = Math.min(4, playerPos + 1);
        } else if (w == 32 || w == 39) {
            playerBullets[0] = playerPos;
        }
    };

    var loop = function() {
        var hashStr, message = 0,

            // CPU MOVE VARS
            random = Math.random(),
            variance = Math.random(),
            playerBullStr = playerBullets.join(''),
            spamFactor = Math.max(playerBullStr.replace(/0/g, '').length, 0.05) / gameWidth,
            matches = playerBullStr.match(new RegExp(cpuPos, 'g')) || '';


        if (round) {

            // Detect spam in current lane
            if (matches.length > gameWidth / 4) {
                cpuAiKeepShooting = gameWidth / 4;
            }

            // Bullets are close-by in same lane, defensive shooting
            else if (playerBullets.slice(gameWidth * 0.9).indexOf(cpuPos) > 0) {
                cpuAiKeepShooting = gameWidth / 10;
            }

            // Shoot in current lane
            if (random < cpuAiKeepShooting + spamFactor) {
                cpuAiKeepShooting-=1;
                if (cpuAiKeepShooting && variance > 0.2) { // Hickup
                    cpuBullets[gameWidth] = cpuPos; // Shoot
                }
            }

            // Move to player lane and shoot a couple of times while going there
            else if (random < cpuAiHunting + spamFactor + 0.02) {
                cpuAiHunting = 1;
                if (cpuPos == playerPos) {
                    // Reached player
                    cpuAiHunting = 0;
                    cpuAiKeepShooting = variance * gameWidth / 10;
                } else {
                    // Move towards player, shoot while moving
                    cpuPos += (cpuPos > playerPos) ? -1 : 1;
                    cpuAiKeepShooting = variance * gameWidth / 5;
                }
            }

            // Move around randomly
            else if (random < spamFactor + 0.12) {
                cpuPos = Math.min(Math.max(cpuPos + random > .5 ? 1 : -1, 1), 4);
                cpuAiKeepShooting = variance * 3 * round;
            }

        } else {
            message = 1;
        }
        // Move player bullets
        playerBullets.unshift(0);
        playerBullets.length = gameWidth;

        // Move CPU bullets after collission check, or bullets will not always collide
        cpuBullets.shift();

        var player = braille[Math.pow(2, playerPos - 1)],
            cpu = braille[Math.pow(2, cpuPos - 1)];

        // Player segment
        if (cpuBullets[0] == playerPos) {
            player = killedChar;
            message = 2; // Killed
            setTimeout(function() {
                end = 1;
            }, 2000);
        }

        // CPU
        if (playerBullets[gameWidth - 1] == playerPos) {
            cpu = killedChar;
            if (round == gameRounds) {
                message = 3; // Won
                setTimeout(function() {
                    end = 1;
                }, 2000);
            } else {
                message = 4; // Round
                round += 1;
                setTimeout(function() {
                    main(round);
                }, 2000);
            }
        }

        hashStr = texts[5] + round + '/' + gameRounds + ' [' + player + ':';

        for (var i = 0; ++i < gameWidth;) {
            var playerBullet = playerBullets[i] ? Math.pow(2, playerBullets[i] - 1) : 0;

            if (playerBullet && playerBullets[i] == cpuBullets[i]) {
                playerBullets[i] = cpuBullets[i] = 0;
                hashStr += charHit;
            }

            else if (playerBullet && playerBullets[i] == cpuBullets[i - 1]) {
                playerBullets[i] = cpuBullets[i - 1] = 0;
                hashStr += charHit;
            }

            else {
                hashStr += braille[playerBullet + (cpuBullets[i] ? Math.pow(2, cpuBullets[i] - 1) : 0)];
            }
        }

        // CPU
        hashStr += ':' + cpu + '] ' + texts[message];

        // Prevent %20 showing in Safari
        hashStr = hashStr.replace(/ /g, braille[0]);

        // Show
        if (top.history.replaceState) {
            top.history.replaceState(0, 0, hashStr);
        } else {
            top.location.replace(hashStr);
        }

        if (!message) {
            setTimeout(loop, gameSpeed);
        }
    };

    loop();

};

main(0);