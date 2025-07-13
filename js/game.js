// game.js
let player = JSON.parse(localStorage.getItem("mathNinjaPlayer")) || { name: "Guest", level: "easy" };
let score = 0;
let lives = 3;
let timer = 10;
let timerInterval;
let correctAnswer;

// DOM Elements
const elements = {
  score: document.getElementById("score"),
  lives: document.getElementById("lives"),
  timer: document.getElementById("timer"),
  question: document.getElementById("question"),
  choices: document.getElementById("choices"),
  message: document.getElementById("message"),
  playerName: document.getElementById("playerNameDisplay"),
  gameOverPopup: document.getElementById("gameOverPopup"),
};

// Initialize Game
function initGame() {
  elements.playerName.textContent = player.name;
  resetGameState();
  generateQuestion();
}

function resetGameState() {
  score = 0;
  lives = 3;
  timer = 5;
  updateGameInfo();
  elements.gameOverPopup.classList.add("hidden");
  elements.message.textContent = "";
}

function updateGameInfo() {
  elements.score.textContent = `Skor: ${score}`;
  elements.lives.textContent = `❤️ x ${lives}`;
  elements.timer.textContent = `⏱️ : ${timer}`;
}

function handleWrongAnswer() {
  lives--;
  updateGameInfo();
  if (lives <= 0) {
    gameOver();
  }
}

function generateQuestion() {
  clearInterval(timerInterval);

  // Fade transition
  elements.question.parentElement.classList.remove("show");
  elements.question.parentElement.classList.add("fade");

  setTimeout(() => {
    // Generate question based on level
    let a, b, op;
    const level = player.level;

    if (level === "easy") {
      a = Math.floor(Math.random() * 20) + 1;
      b = Math.floor(Math.random() * 20) + 1;
      op = Math.random() < 0.5 ? "+" : "-";
      correctAnswer = op === "+" ? a + b : a - b;
      elements.question.textContent = `${a} ${op} ${b} = ?`;
    } else if (level === "medium") {
      a = Math.floor(Math.random() * 10) + 1;
      b = Math.floor(Math.random() * 9) + 2;
      op = Math.random() < 0.5 ? "×" : "÷";
      if (op === "×") {
        correctAnswer = a * b;
        elements.question.textContent = `${a} × ${b} = ?`;
      } else {
        correctAnswer = a * b;
        elements.question.textContent = `${correctAnswer} ÷ ${a} = ?`;
        correctAnswer = b;
      }
    } else {
      // hard
      const ops = ["+", "-", "×", "÷"];
      op = ops[Math.floor(Math.random() * ops.length)];
      a = Math.floor(Math.random() * 50) + 1;
      b = Math.floor(Math.random() * 49) + 1;

      switch (op) {
        case "+":
          correctAnswer = a + b;
          break;
        case "-":
          correctAnswer = a - b;
          break;
        case "×":
          correctAnswer = a * b;
          break;
        case "÷":
          correctAnswer = a * b;
          elements.question.textContent = `${correctAnswer} ÷ ${a} = ?`;
          correctAnswer = b;
          break;
      }
      if (op !== "÷") elements.question.textContent = `${a} ${op} ${b} = ?`;
    }

    // Generate answer choices
    let answers = [correctAnswer];
    while (answers.length < 4) {
      let wrong = correctAnswer + Math.floor(Math.random() * 10 - 5);
      if (wrong < 0) wrong = Math.abs(wrong);
      if (!answers.includes(wrong)) answers.push(wrong);
    }
    answers.sort(() => Math.random() - 0.5);

    // Create choice buttons
    elements.choices.innerHTML = "";
    answers.forEach((answer) => {
      const button = document.createElement("button");
      button.className = "choice-btn";
      button.textContent = answer;
      button.onclick = () => checkAnswer(answer, button);
      elements.choices.appendChild(button);
    });

    // Start timer and fade in
    startTimer();
    elements.question.parentElement.classList.remove("fade");
    elements.question.parentElement.classList.add("show");
  }, 300);
}

function startTimer() {
  timer = 10;
  elements.timer.textContent = `time: ${timer}`;

  timerInterval = setInterval(() => {
    timer--;
    elements.timer.textContent = `time: ${timer}`;

    if (timer <= 0) {
      clearInterval(timerInterval);
      handleWrongAnswer();
      if (lives > 0) {
        setTimeout(generateQuestion, 1500);
      }
    }
  }, 1000);
}

function checkAnswer(selectedAnswer, button) {
  clearInterval(timerInterval);
  const isCorrect = selectedAnswer === correctAnswer;

  // Disable all buttons and show feedback
  document.querySelectorAll(".choice-btn").forEach((btn) => {
    btn.disabled = true;
    if (btn === button) {
      btn.classList.add(isCorrect ? "correct" : "wrong");
    }
  });

  if (isCorrect) {
    score++;
    playSound("correctSound");
    showMessage("Jawaban Benar!", "success");
  } else {
    playSound("wrongSound");
    showMessage(`Salah! Jawaban: ${correctAnswer}`, "error");
    handleWrongAnswer();
  }

  updateGameInfo();

  if (lives > 0) {
    setTimeout(generateQuestion, 1500);
  } else {
    setTimeout(gameOver, 1500);
  }
}

// Tambahkan variabel kontrol
let isGameOver = false;

function gameOver() {
  if (isGameOver) return;
  isGameOver = true;

  const history = JSON.parse(localStorage.getItem("mathNinjaHistory")) || [];
  const newEntry = {
    name: player.name,
    level: player.level,
    score: score,
    date: new Date().toISOString(), // Menggunakan timestamp lebih presisi
  };

  // Cek duplikasi dengan entry terakhir
  const lastEntry = history[history.length - 1];
  const isDuplicate = lastEntry && lastEntry.name === newEntry.name && lastEntry.score === newEntry.score && lastEntry.level === newEntry.level && Math.abs(new Date(lastEntry.date) - new Date(newEntry.date)) < 5000; // 5 detik

  if (!isDuplicate) {
    const updatedHistory = [...history, newEntry].slice(-5); // Hanya simpan 5 entry terakhir

    localStorage.setItem("mathNinjaHistory", JSON.stringify(updatedHistory));
  }

  // Tampilkan popup
  document.querySelector(".game-container").classList.add("modal-active");
  elements.gameOverPopup.classList.add("active");
  document.getElementById("finalScore").textContent = `Skor Akhir: ${score}`;
}

function restartGame() {
  // Reset semua state
  isGameOver = false;
  score = 0;
  lives = 3;
  timer = 10;

  // Hapus efek modal
  document.querySelector(".game-container").classList.remove("modal-active");
  elements.gameOverPopup.classList.remove("active");

  // Reset tampilan
  updateGameInfo();
  elements.message.textContent = "";

  // Mulai game baru
  generateQuestion();
}

// Tambahkan event listener untuk klik di luar modal
document.addEventListener("click", (e) => {
  if (e.target === elements.gameOverPopup) {
    restartGame();
  }
});

// Tambahkan event listener untuk tombol ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && elements.gameOverPopup.classList.contains("active")) {
    restartGame();
  }
});

function goToMenu() {
  window.location.href = "index.html";
}

// Helper functions
function playSound(soundId) {
  const sound = document.getElementById(soundId);
  sound.currentTime = 0;
  sound.play();
}

function showMessage(text, type) {
  elements.message.textContent = text;
  elements.message.className = `message-box ${type}`;
  setTimeout(() => {
    elements.message.className = "message-box";
  }, 1500);
}

// Initialize game when page loads
window.addEventListener("DOMContentLoaded", initGame);
