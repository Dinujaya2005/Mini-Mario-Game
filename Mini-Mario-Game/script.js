
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const restartBtn = document.getElementById("restartBtn");

const WORLD_WIDTH = 2600;
const keys = {};

let score = 0;
let lives = 3;
let camera = 0;
let gameOver = false;
let won = false;
let frame = 0;

const player = {
    x: 60,
    y: 400,
    width: 32,
    height: 42,
    vx: 0,
    vy: 0,
    speed: 4,
    jump: -12,
    grounded: false,
    invincible: 0
};

const platforms = [
    {x: 0, y: 490, w: 700, h: 50},
    {x: 800, y: 490, w: 500, h: 50},
    {x: 1400, y: 490, w: 550, h: 50},
    {x: 2050, y: 490, w: 550, h: 50},
    {x: 220, y: 390, w: 130, h: 20},
    {x: 450, y: 320, w: 130, h: 20},
    {x: 850, y: 390, w: 130, h: 20},
    {x: 1100, y: 320, w: 150, h: 20},
    {x: 1500, y: 390, w: 130, h: 20},
    {x: 1750, y: 310, w: 150, h: 20},
    {x: 2150, y: 390, w: 150, h: 20}
];

let coins = [
    {x: 250, y: 350, collected: false},
    {x: 310, y: 350, collected: false},
    {x: 480, y: 280, collected: false},
    {x: 540, y: 280, collected: false},
    {x: 700, y: 430, collected: false},
    {x: 900, y: 350, collected: false},
    {x: 1160, y: 280, collected: false},
    {x: 1210, y: 280, collected: false},
    {x: 1550, y: 350, collected: false},
    {x: 1800, y: 270, collected: false},
    {x: 1870, y: 270, collected: false},
    {x: 2100, y: 430, collected: false},
    {x: 2220, y: 350, collected: false}
];

let enemies = [
    {x: 400, y: 462, w: 30, h: 28, speed: 1.5, min: 360, max: 650, alive: true},
    {x: 1000, y: 462, w: 30, h: 28, speed: 1.8, min: 850, max: 1250, alive: true},
    {x: 1600, y: 462, w: 30, h: 28, speed: 1.5, min: 1450, max: 1900, alive: true},
    {x: 2200, y: 462, w: 30, h: 28, speed: 2, min: 2100, max: 2450, alive: true}
];

function resetGame() {
    score = 0;
    lives = 3;
    camera = 0;
    gameOver = false;
    won = false;
    frame = 0;

    player.x = 60;
    player.y = 400;
    player.vx = 0;
    player.vy = 0;
    player.grounded = false;
    player.invincible = 0;

    coins.forEach(c => c.collected = false);

    enemies.forEach((e, i) => {
        e.alive = true;
        e.x = [400, 1000, 1600, 2200][i];
        e.speed = [1.5, 1.8, 1.5, 2][i];
    });

    updateInfo();
}

function updateInfo() {
    scoreDisplay.textContent = score;
    livesDisplay.textContent = lives;
}

document.addEventListener("keydown", e => {
    keys[e.code] = true;

    if (["ArrowLeft", "ArrowRight", "ArrowUp", "Space"].includes(e.code)) {
        e.preventDefault();
    }

    if (!e.repeat && !gameOver && !won &&
        (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW")) {
        if (player.grounded) {
            player.vy = player.jump;
            player.grounded = false;
        }
    }
});

document.addEventListener("keyup", e => {
    keys[e.code] = false;
});

restartBtn.addEventListener("click", resetGame);

function rectangleCollision(a, b) {
    return a.x < b.x + b.w &&
           a.x + a.width > b.x &&
           a.y < b.y + b.h &&
           a.y + a.height > b.y;
}

function drawBackground() {
    ctx.fillStyle = "#75d9ff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ffffff";

    for (let i = 0; i < 8; i++) {
        let x = ((i * 300 - camera * 0.3) % 1100 + 1100) % 1100;

        ctx.fillRect(x, 90, 65, 20);
        ctx.fillRect(x + 20, 70, 65, 30);
        ctx.fillRect(x + 50, 90, 55, 20);
    }

    ctx.fillStyle = "#62c76b";

    for (let i = 0; i < 10; i++) {
        let x = i * 300 - camera * 0.5;

        ctx.beginPath();
        ctx.arc(x, 490, 100, Math.PI, 0);
        ctx.fill();
    }
}

function drawPlatforms() {
    platforms.forEach(p => {
        let x = p.x - camera;

        if (x + p.w < 0 || x > canvas.width) return;

        ctx.fillStyle = "#9b5729";
        ctx.fillRect(x, p.y, p.w, p.h);

        ctx.fillStyle = "#38bd43";
        ctx.fillRect(x, p.y, p.w, 9);

        ctx.fillStyle = "#d68b40";

        for (let i = 0; i < p.w; i += 35) {
            ctx.fillRect(x + i, p.y + 17, 25, 5);
        }
    });
}

function drawPlayer() {
    let x = player.x - camera;
    let y = player.y;

    if (player.invincible > 0 && frame % 8 < 4) return;

    ctx.fillStyle = "#e52c35";
    ctx.fillRect(x + 4, y, 25, 10);
    ctx.fillRect(x, y + 9, 32, 7);

    ctx.fillStyle = "#ffcc99";
    ctx.fillRect(x + 7, y + 16, 20, 13);

    ctx.fillStyle = "#171717";
    ctx.fillRect(x + 20, y + 19, 4, 5);

    ctx.fillStyle = "#1758b5";
    ctx.fillRect(x + 5, y + 29, 22, 10);
    ctx.fillRect(x + 1, y + 29, 7, 7);

    ctx.fillStyle = "#633016";
    ctx.fillRect(x, y + 38, 13, 4);
    ctx.fillRect(x + 20, y + 38, 13, 4);
}

function drawCoins() {
    coins.forEach(c => {
        if (c.collected) return;

        let x = c.x - camera;

        ctx.fillStyle = "#ffb900";
        ctx.beginPath();
        ctx.ellipse(x, c.y, 10, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#fff17a";
        ctx.fillRect(x - 2, c.y - 8, 4, 16);
    });
}

function drawEnemies() {
    enemies.forEach(e => {
        if (!e.alive) return;

        let x = e.x - camera;

        ctx.fillStyle = "#a45a2a";
        ctx.fillRect(x, e.y + 7, e.w, 18);

        ctx.fillStyle = "#f3c39b";
        ctx.fillRect(x + 4, e.y + 3, 22, 15);

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x + 7, e.y + 7, 5, 6);
        ctx.fillRect(x + 19, e.y + 7, 5, 6);

        ctx.fillStyle = "#111111";
        ctx.fillRect(x + 9, e.y + 9, 2, 3);
        ctx.fillRect(x + 21, e.y + 9, 2, 3);

        ctx.fillStyle = "#452214";
        ctx.fillRect(x + 2, e.y + 24, 10, 4);
        ctx.fillRect(x + 19, e.y + 24, 10, 4);
    });
}

function drawFlag() {
    let x = 2490 - camera;

    ctx.fillStyle = "#eeeeee";
    ctx.fillRect(x, 330, 8, 160);

    ctx.fillStyle = "#24c65b";
    ctx.fillRect(x + 8, 330, 60, 35);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + 8, 365, 35, 5);
}

function updatePlayer() {
    player.vx = 0;

    if (keys["ArrowLeft"] || keys["KeyA"]) {
        player.vx = -player.speed;
    }

    if (keys["ArrowRight"] || keys["KeyD"]) {
        player.vx = player.speed;
    }

    player.x += player.vx;
    player.x = Math.max(0, Math.min(WORLD_WIDTH - player.width, player.x));

    let oldY = player.y;

    player.vy += 0.55;
    player.vy = Math.min(player.vy, 14);
    player.y += player.vy;

    player.grounded = false;

    platforms.forEach(p => {
        let horizontal = player.x + player.width > p.x &&
                         player.x < p.x + p.w;

        let crossedTop = oldY + player.height <= p.y &&
                         player.y + player.height >= p.y;

        if (horizontal && crossedTop && player.vy >= 0) {
            player.y = p.y - player.height;
            player.vy = 0;
            player.grounded = true;
        }
    });

    if (player.invincible > 0) {
        player.invincible--;
    }

    if (player.y > canvas.height + 100) {
        loseLife();
    }

    if (player.x > 2460) {
        won = true;
    }

    camera = Math.max(0, Math.min(
        WORLD_WIDTH - canvas.width,
        player.x - canvas.width / 2
    ));
}

function updateCoins() {
    coins.forEach(c => {
        if (c.collected) return;

        let dx = player.x + player.width / 2 - c.x;
        let dy = player.y + player.height / 2 - c.y;

        if (Math.sqrt(dx * dx + dy * dy) < 25) {
            c.collected = true;
            score += 10;
            updateInfo();
        }
    });
}

function updateEnemies() {
    enemies.forEach(e => {
        if (!e.alive) return;

        e.x += e.speed;

        if (e.x < e.min || e.x > e.max) {
            e.speed *= -1;
        }

        if (rectangleCollision(player, e)) {
            if (player.vy > 0 && player.y + player.height - e.y < 18) {
                e.alive = false;
                player.vy = -8;
                score += 20;
                updateInfo();
            } else if (player.invincible === 0) {
                loseLife();
            }
        }
    });
}

function loseLife() {
    lives--;
    updateInfo();

    if (lives <= 0) {
        gameOver = true;
    } else {
        player.x = Math.max(0, player.x - 100);
        player.y = 350;
        player.vx = 0;
        player.vy = 0;
        player.invincible = 100;
    }
}

function drawMessage(title, subtitle) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ffdb35";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText(title, canvas.width / 2, 240);

    ctx.fillStyle = "#ffffff";
    ctx.font = "22px Arial";
    ctx.fillText(subtitle, canvas.width / 2, 290);

    ctx.textAlign = "left";
}

function gameLoop() {
    frame++;

    drawBackground();
    drawPlatforms();
    drawCoins();
    drawEnemies();
    drawFlag();
    drawPlayer();

    if (!gameOver && !won) {
        updatePlayer();
        updateCoins();
        updateEnemies();
    }

    if (gameOver) {
        drawMessage("GAME OVER!", "Press RESTART to play again");
    }

    if (won) {
        drawMessage("YOU WIN!", "Final Score: " + score);
    }

    requestAnimationFrame(gameLoop);
}

resetGame();
gameLoop();
