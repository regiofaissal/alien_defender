const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const aircraftImg = new Image();
aircraftImg.src = "aircraft.png";

const planetImg = new Image();
planetImg.src = "planet.png";

// Add audio objects
// Modificar a parte dos áudios
const shootSound = new Audio();
shootSound.src = 'sounds/shoot.wav';
shootSound.volume = 0.3; // Controle do volume (0.0 a 1.0)

const explosionSound = new Audio();
explosionSound.src = 'sounds/explosion.wav';
explosionSound.volume = 0.2;

const crashSound = new Audio();
crashSound.src = 'sounds/crash.mp3';
crashSound.volume = 0.2;

const gameOverSound = new Audio();
gameOverSound.src = 'sounds/gameover.wav';
gameOverSound.volume = 0.5;

const backgroundMusic = new Audio();
backgroundMusic.src = 'sounds/background-music.mp3';
backgroundMusic.volume = 0.5;
backgroundMusic.loop = true;

// Adicione esta função para tocar a música
function playBackgroundMusic() {
    backgroundMusic.play().catch(error => console.log("Erro ao tocar música:", error));
}

function playSound(sound) {
    sound.currentTime = 0; // Reinicia o som
    sound.play().catch(error => console.log("Erro ao tocar som:", error));
}

const aircraft = { x: canvas.width / 2, y: canvas.height - 100, size: 40 };
let bullets = [];
let planets = [];
let score = 0;
let gameRunning = false;

function drawAircraft() {
    ctx.drawImage(aircraftImg, aircraft.x, aircraft.y, aircraft.size, aircraft.size);
}

function drawBullets() {
    ctx.fillStyle = "yellow";
    bullets.forEach((bullet, index) => {
        ctx.fillRect(bullet.x, bullet.y, 5, 10);
        bullet.y -= 5;
        if (bullet.y < 0) bullets.splice(index, 1);
    });
}

function drawPlanets() {
    planets.forEach((planet, index) => {
        ctx.drawImage(planetImg, planet.x, planet.y, planet.size, planet.size);
        planet.y += 2;
        if (planet.y > canvas.height) {
            gameRunning = false;
            playSound(gameOverSound);
            setTimeout(() => {
                alert("Game Over! Um planeta escapou. Pontuação: " + score);
                location.reload();
            }, 300); // Espera 300ms para dar tempo do som tocar
        }
    });
}

function detectCollisions() {
    bullets.forEach((bullet, bIndex) => {
        planets.forEach((planet, pIndex) => {
            const dx = bullet.x - planet.x;
            const dy = bullet.y - planet.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < planet.size) {
                bullets.splice(bIndex, 1);
                planets.splice(pIndex, 1);
                playSound(explosionSound); // Play explosion sound
                setTimeout(() => {
                    score += 100; // Modifica valor da pontuação
                    document.getElementById("score").textContent = "Pontuação: " + score;
                }, 300); // Espera 300ms para dar tempo do som tocar
            }
        });
    });
}

function checkGameOver() {
    planets.forEach((planet) => {
        const dx = (aircraft.x + aircraft.size/2) - (planet.x + planet.size/2);
        const dy = (aircraft.y + aircraft.size/2) - (planet.y + planet.size/2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < (planet.size/2 + aircraft.size/3)) { // Ajustado para aircraft.size/3
            gameRunning = false;
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0;
            playSound(crashSound);
            playSound(gameOverSound);
            setTimeout(() => {
                alert("Game Over! Pontuação: " + score);
                location.reload();
            }, 300);
        }
    });
}

function updateGame() {
    if (!gameRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawAircraft();
    drawBullets();
    drawPlanets();
    detectCollisions();
    checkGameOver();
    requestAnimationFrame(updateGame);
}

canvas.addEventListener("mousemove", (event) => {
    aircraft.x = event.clientX - aircraft.size / 2;
    aircraft.y = event.clientY - aircraft.size / 2;
});

canvas.addEventListener("click", () => {
    bullets.push({ x: aircraft.x + aircraft.size / 2, y: aircraft.y });
    playSound(shootSound); // Play shooting sound
});

function startGame() {
    document.getElementById("start-button").style.display = "none";
    gameRunning = true;
    // Inicia a música quando o jogo começar
    backgroundMusic.play().catch(error => {
        console.log("Erro ao tocar música:", error);
        // Tenta tocar novamente após interação do usuário
        document.addEventListener('click', () => {
            backgroundMusic.play();
        }, { once: true });
    });
    
    setInterval(() => {
        if (gameRunning) {
            planets.push({ x: Math.random() * canvas.width, y: 0, size: Math.random() * 30 + 15 });
        }
    }, 1000);
    updateGame();
}

document.getElementById("start-button").addEventListener("click", startGame);