// To compress:
// http://closure-compiler.appspot.com/home
// http://marijnhaverbeke.nl/uglifyjs (allow non-ascii)
// http://www.iteral.com/jscrush/

var main = function(round) {

    var gameSpeed = 60;
    var gameWidth = 50;
    var gameRounds = 5;

    var playerPos = 1;

    var cpuPos = 1;
    var cpuKeepShooting = 0;
    var cpuHunting = 0;

    var end = 0;

    var charHit = 'X';
    var texts = ';ARROW KEYS;YOU DIED;YOU WON;NXT RND ;# RND '.split(';');
    var braille = '⠀⠉⠒⠛⠤⠭⠶X⣀⣉⣒X⣤'.split('');

    var blank = function() {
        return new Array(gameWidth);
    };

    var brailleBullet = function(i, add) {
        return add[i] ? Math.pow(2, add[i] - 1) : 0;
    };

    var playerbraille = function(i) {
        return braille[Math.pow(2, i - 1)];
    };

    var playerBullets = blank();
    var cpuBullets = blank();


    document.onkeydown = function(event) {
        var w = event.which;

        if (end) {
            main(1);
        } else {
            round = round || 1;
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
        var string, player, cpu, message = 0;

        if (round) {
            cpuMove();
        } else {
            message = 1;
            setTimeout(loop, gameSpeed);
        }

        // Move player bullets
        playerBullets.unshift(0);
        playerBullets.splice(gameWidth, 1);

        // Move CPU bullets after collission check, or bullets will not always collide
        cpuBullets.shift();

        // Player segment
        player = playerbraille(playerPos);
        if (cpuBullets[0] == playerPos) {
            player = charHit;
            message = 2;
            // TODO PREVENT IMMEDIATE
        }

        // CPU
        cpu = playerbraille(cpuPos);
        if (playerBullets[gameWidth - 1] == playerPos) {
            cpu = charHit;
            if (round == gameRounds) {
                message = 3;
                // TODO PREVENT IMMEDIATE
            } else {
                message = 4;
                round++;
                setTimeout(function() {
                    gameSpeed -= 10;
                    gameWidth -= 7;
                    playerBullets = blank();
                    cpuBullets = blank();
                    loop();
                }, 2000);
            }
        }

        string = texts[5] + round + '/' + gameRounds + ' [' + player + ':';

        for (var i = 0; ++i < gameWidth;) {
            var playerBullet = brailleBullet(i, playerBullets),
                cpuBullet = brailleBullet(i, cpuBullets);

            if (playerBullet) {

                if (playerBullets[i] == cpuBullets[i]) {
                    playerBullets[i] = cpuBullets[i] = 0;
                    string += charHit;
                }

                else if (playerBullets[i] == cpuBullets[i - 1]) {
                    playerBullets[i] = cpuBullets[i - 1] = 0;
                    string += charHit;
                }
            }

            else {
                string += braille[playerBullet + cpuBullet];
            }
        }

        // CPU
        string += ':' + cpu + '] ' + texts[message];

        // Prevent %20 showing in Safari
        string = string.replace(/ /g, braille[0]);

        // Show
        if (top.history.pushState) {
            top.history.pushState('', '', string);
        } else {
            top.location.replace(string);
        }

        if (!message) {
            setTimeout(loop, gameSpeed);
        }
    };

    var cpuMove = function() {

        // When user is spamming in same lane, spam back
        var matches, spamFactor,
            randomChance = Math.random(),
            randomVariance = Math.random(),
            join = playerBullets.join('');

        spamFactor = (join.replace(/0/g, '').length || 0.05) / gameWidth;

        matches = join.match(new RegExp(cpuPos, 'g')) || [];
        if (matches.length > gameWidth / 4) {
            cpuKeepShooting = gameWidth / 4;
        }

        // Bullets are close-by in same lane, defensive shooting
        else if (cpuPos in playerBullets.slice(gameWidth * 0.8)) {
            cpuKeepShooting = gameWidth / 10;
        }

        // Shoot in current lane
        if (cpuKeepShooting + randomChance < spamFactor) {
            cpuKeepShooting--;
            if (cpuKeepShooting && randomVariance < 0.8) { // Hickup
                return cpuBullets[gameWidth] = cpuPos; // Shoot
            }
        }

        // Move to player lane and shoot a couple of times
        else if (randomChance < cpuHunting + spamFactor + 0.1) {
            cpuHunting = 1;
            if (cpuPos == playerPos) {
                cpuHunting = 0;
                cpuKeepShooting = randomVariance * spamFactor * 70;
            } else {
                cpuPos += (cpuPos > playerPos) ? -1 : 1;
            }
        }

        // Move around randomly
        else if (randomChance < spamFactor + 0.12) {
            cpuPos = Math.min(Math.max(cpuPos + randomChance > .5 ? 1 : -1, 1), 4);
            cpuKeepShooting = randomVariance * 3 * round;
        }
    };

    loop();

};

main(0);