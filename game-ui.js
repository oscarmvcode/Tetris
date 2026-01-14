// ============================================================
// 2. INFRAESTRUCTURA & RENDER
// ============================================================

class BoardRenderer {
  constructor(boardElement, rows, cols) {
    this.boardElement = boardElement;
    this.rows = rows;
    this.cols = cols;
    this.cells = [];
    this._buildGrid();
  }

  _buildGrid() {
    this.boardElement.innerHTML = "";
    for (let r = 0; r < this.rows; r++) {
      this.cells[r] = [];
      for (let c = 0; c < this.cols; c++) {
        const div = document.createElement("div");
        div.className = "cell";
        this.boardElement.appendChild(div);
        this.cells[r][c] = div;
      }
    }
  }

  render(board, activeTetromino, ghostTetromino) {
    for (let r = 0; r < board.rows; r++) {
      for (let c = 0; c < board.cols; c++) {
        const cell = this.cells[r][c];
        cell.className = "cell";
        const value = board.grid[r][c];
        if (value) {
          cell.classList.add("cell--filled", "cell--" + value);
        }
      }
    }

    if (ghostTetromino) {
      const shape = ghostTetromino.shape;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (!shape[r][c]) continue;
          const row = ghostTetromino.row + r;
          const col = ghostTetromino.col + c;
          if (row >= 0 && row < board.rows && col >= 0 && col < board.cols) {
            const cell = this.cells[row][col];
            if (!board.grid[row][col]) {
              cell.classList.add("cell--ghost");
            }
          }
        }
      }
    }

    if (activeTetromino) {
      const shape = activeTetromino.shape;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (!shape[r][c]) continue;
          const row = activeTetromino.row + r;
          const col = activeTetromino.col + c;
          if (row >= 0 && row < board.rows && col >= 0 && col < board.cols) {
            const cell = this.cells[row][col];
            cell.classList.add("cell--filled", "cell--" + activeTetromino.type);
          }
        }
      }
    }
  }
}

class HudView {
  constructor({ scoreEl, linesEl, levelEl, highScoreEl, messageEl }) {
    this.scoreEl = scoreEl;
    this.linesEl = linesEl;
    this.levelEl = levelEl;
    this.highScoreEl = highScoreEl;
    this.messageEl = messageEl;
  }

  update(state) {
    this.scoreEl.textContent = state.score;
    this.linesEl.textContent = state.lines;
    this.levelEl.textContent = state.level;
    if (this.highScoreEl) {
      this.highScoreEl.textContent = state.highScore ?? 0;
    }
  }

  showMessage(text) {
    this.messageEl.textContent = text;
  }
}

class InputHandler {
  constructor(document, { onMoveLeft, onMoveRight, onRotate, onSoftDrop, onHardDrop, onPauseToggle }) {
    this.onMoveLeft = onMoveLeft;
    this.onMoveRight = onMoveRight;
    this.onRotate = onRotate;
    this.onSoftDrop = onSoftDrop;
    this.onHardDrop = onHardDrop;
    this.onPauseToggle = onPauseToggle;
    this.enabled = true;

    document.addEventListener("keydown", (e) => this._handleKey(e));
  }

  _handleKey(e) {
    if (!this.enabled) return;

    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        this.onMoveLeft();
        break;
      case "ArrowRight":
        e.preventDefault();
        this.onMoveRight();
        break;
      case "ArrowUp":
        e.preventDefault();
        this.onRotate();
        break;
      case "ArrowDown":
        e.preventDefault();
        this.onSoftDrop();
        break;
      case " ":
        e.preventDefault();
        this.onHardDrop();
        break;
      case "Escape":
      case "p":
      case "P":
        e.preventDefault();
        this.onPauseToggle();
        break;
    }
  }

  setEnabled(value) {
    this.enabled = value;
  }
}

// ============================================================
// 4. INICIALIZACIÓN (Composition Root)
// ============================================================

(function bootstrapTetrisApp() {
  console.log("bootstrapTetrisApp: Iniciando inicialización de la app.");
  const boardEl = document.getElementById("board");
  const scoreEl = document.getElementById("score");
  const linesEl = document.getElementById("lines");
  const levelEl = document.getElementById("level");
  const highScoreEl = document.getElementById("high-score");
  const messageEl = document.getElementById("message");
  const btnStart = document.getElementById("btn-start");
  const btnPause = document.getElementById("btn-pause");
  const btnMuteToggle = document.getElementById("btn-mute-toggle");
  const overlayEl = document.getElementById("game-over-overlay");
  const btnRestartOverlay = document.getElementById("btn-restart-overlay");

  const btnMobileLeft = document.getElementById("btn-mobile-left");
  const btnMobileRight = document.getElementById("btn-mobile-right");
  const btnMobileRotate = document.getElementById("btn-mobile-rotate");
  const btnMobileSoft = document.getElementById("btn-mobile-soft");
  const btnMobileHard = document.getElementById("btn-mobile-hard");

  const storageAvailable =
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined";
  const highScoreStorage = new HighScoreStorage(
    storageAvailable ? window.localStorage : null
  );
  const initialHighScore = highScoreStorage.get();

  const soundURLs = {
    drop: "./sounds/drop.wav",
    rotate: "./sounds/rotate.wav",
    move: "./sounds/move.wav",
    clear: "./sounds/clear.wav",
    gameOver: "./sounds/gameover.wav",
    silent: "./sounds/silent.wav", // Sonido silencioso para desbloquear audio
  };
  const soundPlayer = new SoundPlayer(soundURLs);

  const board = new GameBoard(20, 10);
  const state = new GameState(initialHighScore);
  const renderer = new BoardRenderer(boardEl, 20, 10);
  const hud = new HudView({
    scoreEl,
    linesEl,
    levelEl,
    highScoreEl,
    messageEl,
  });
  const factory = new TetrominoFactory();

  const effects = {
    onStart: () => {
      console.log("Effects: onStart llamado.");
      overlayEl.classList.add("opacity-0", "pointer-events-none");
      setTimeout(() => {
        overlayEl.classList.add("hidden");
      }, 250);
    },
    onGameOver: () => {
      console.log("Effects: onGameOver llamado.");
      overlayEl.classList.remove("hidden");
      requestAnimationFrame(() => {
        overlayEl.classList.remove("opacity-0", "pointer-events-none");
      });
    },
  };

  const game = new TetrisGame({
    rows: 20,
    cols: 10,
    board,
    state,
    renderer,
    hud,
    factory,
    effects,
    highScoreStorage,
    soundPlayer,
  });

  const input = new InputHandler(document, {
    onMoveLeft: () => {
      console.log("InputHandler: moveLeft");
      game.moveLeft();
    },
    onMoveRight: () => {
      console.log("InputHandler: moveRight");
      game.moveRight();
    },
    onRotate: () => {
      console.log("InputHandler: rotate");
      game.rotate();
    },
    onSoftDrop: () => {
      console.log("InputHandler: softDrop");
      game.softDrop();
    },
    onHardDrop: () => {
      console.log("InputHandler: hardDrop");
      game.hardDrop();
    },
    onPauseToggle: () => {
      console.log("InputHandler: pauseToggle");
      game.pauseToggle();
    },
  });

  let audioUnlocked = false;
  const unlockAudio = async () => {
    if (audioUnlocked) {
      console.log("unlockAudio: Audio ya desbloqueado, saltando.");
      return;
    }
    console.log("unlockAudio: Intentando desbloquear el contexto de audio.");
    try {
      // Reproducir el sonido silencioso para asegurar el desbloqueo del contexto de audio del navegador
      const silentAudio = new Audio(soundURLs.silent);
      silentAudio.volume = 0; // Asegurarse de que sea realmente silencioso
      await silentAudio.play().then(() => {
        silentAudio.pause();
        silentAudio.currentTime = 0;
        console.log("unlockAudio: Sonido silencioso reproducido y pausado.");
      }).catch(e => {
        console.warn("unlockAudio: Fallo al intentar reproducir silent.wav", e);
      });

      audioUnlocked = true;
      console.log("unlockAudio: Contexto de audio desbloqueado con silent.wav.");

    } catch (e) {
      console.error("unlockAudio: Error general al intentar desbloquear audio:", e);
    }
  };

  // Listener para la primera interacción global del usuario
  document.addEventListener("click", unlockAudio, { once: true });
  document.addEventListener("keydown", unlockAudio, { once: true });

  btnStart.addEventListener("click", () => {
    console.log("btnStart click: Iniciando juego.");
    game.start();
    input.setEnabled(true);
  });

  btnPause.addEventListener("click", () => {
    console.log("btnPause click: Toggle pausa.");
    game.pauseToggle();
  });

  if (btnMuteToggle) {
    btnMuteToggle.addEventListener("click", () => {
      console.log("btnMuteToggle click: Toggle mute.");
      soundPlayer.toggleMute();
      btnMuteToggle.textContent = soundPlayer.muted ? "🔇" : "🔊";
    });
  }

  if (btnRestartOverlay) {
    btnRestartOverlay.addEventListener(touchEvent, (e) => {
      e.preventDefault();
      console.log("btnRestartOverlay touch/click: Reiniciando juego.");
      game.start();
    });
  }

  // Optimización para móviles: usar touchstart en lugar de click para eliminar delay de 300ms
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const touchEvent = isMobile ? "touchstart" : "click";

  if (btnMobileLeft) {
    btnMobileLeft.addEventListener(touchEvent, (e) => {
      e.preventDefault();
      game.moveLeft();
    });
  }
  if (btnMobileRight) {
    btnMobileRight.addEventListener(touchEvent, (e) => {
      e.preventDefault();
      game.moveRight();
    });
  }
  if (btnMobileRotate) {
    btnMobileRotate.addEventListener(touchEvent, (e) => {
      e.preventDefault();
      game.rotate();
    });
  }
  if (btnMobileSoft) {
    btnMobileSoft.addEventListener(touchEvent, (e) => {
      e.preventDefault();
      game.softDrop();
    });
  }
  if (btnMobileHard) {
    btnMobileHard.addEventListener(touchEvent, (e) => {
      e.preventDefault();
      game.hardDrop();
    });
  }

  hud.showMessage("Pulsa Iniciar y juega con las flechas y espacio.");
})();

