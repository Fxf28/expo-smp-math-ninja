function startGame() {
  const nameInput = document.getElementById("playerName");
  const name = nameInput.value.trim();

  if (!name) {
    nameInput.classList.add("invalid");
    nameInput.placeholder = "Nama harus diisi!";
    return;
  }

  // Validasi karakter khusus
  const regex = /^[a-zA-Z0-9 ]{2,15}$/;
  if (!regex.test(name)) {
    nameInput.classList.add("invalid");
    nameInput.value = "";
    nameInput.placeholder = "Nama tidak valid (2-15 karakter)";
    return;
  }

  // Jika valid, lanjutkan
  localStorage.setItem(
    "mathNinjaPlayer",
    JSON.stringify({
      name: name,
      level: document.getElementById("levelSelect").value,
    })
  );
  window.location.href = "game.html";
}

function loadScoreHistory() {
  const history = JSON.parse(localStorage.getItem("mathNinjaHistory")) || [];
  const container = document.getElementById("scoreHistory");
  const clearBtn = document.querySelector(".danger-btn");

  // Tampilkan/sembunyikan tombol clear
  clearBtn.style.display = history.length > 0 ? "block" : "none";

  // Hapus duplikasi menggunakan Set
  const uniqueEntries = new Map();
  history.forEach((entry) => {
    const key = `${entry.name}-${entry.score}-${entry.level}-${new Date(entry.date).toLocaleDateString()}`;
    uniqueEntries.set(key, entry);
  });

  const uniqueHistory = Array.from(uniqueEntries.values())
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Tampilkan history
  if (uniqueHistory.length === 0) {
    container.innerHTML = "<p class='empty-history'>Belum ada riwayat permainan</p>";
    return;
  }

  let html = `<div class="history-header">
      <span>Pemain</span>
      <span>Level</span>
      <span>Skor</span>
      <span>Tanggal</span>
  </div>`;

  uniqueHistory.forEach((entry) => {
    html += `<div class="history-item">
          <span class="player-name">${entry.name}</span>
          <span class="level-badge ${entry.level}">${entry.level.toUpperCase()}</span>
          <span class="score-value">${entry.score}</span>
          <span class="game-date">${new Date(entry.date).toLocaleString()}</span>
      </div>`;
  });

  container.innerHTML = html;
}

function clearScoreHistory() {
  if (confirm("Yakin ingin menghapus semua riwayat skor?")) {
    localStorage.removeItem("mathNinjaHistory");
    loadScoreHistory();
    // Tambahkan feedback visual
    const container = document.getElementById("scoreHistory");
    container.innerHTML = `<p class="empty-history">Riwayat telah dihapus</p>`;
    setTimeout(() => loadScoreHistory(), 1000);
  }
}

// Initialize
window.addEventListener("DOMContentLoaded", () => {
  loadScoreHistory();

  // Clear input error on typing
  document.getElementById("playerName").addEventListener("input", function () {
    this.classList.remove("error");
  });
});
