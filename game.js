// ============================================================
// 1. MODELOS & TIPOS (S - Single Responsibility)
// ============================================================

class Tetromino {
  constructor(type, rotations) {
    this.type = type;
    this.rotations = rotations;
    this.rotationIndex = 0;
    this.row = 0;
    this.col = 3;
  }

  get shape() {
    return this.rotations[this.rotationIndex];
  }

  rotateClockwise() {
    this.rotationIndex = (this.rotationIndex + 1) % this.rotations.length;
  }

  clone() {
    const copy = new Tetromino(this.type, this.rotations);
    copy.rotationIndex = this.rotationIndex;
    copy.row = this.row;
    copy.col = this.col;
    return copy;
  }
}

class GameBoard {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.grid = this._createEmptyGrid();
  }

  _createEmptyGrid() {
    return Array.from({ length: this.rows }, () =>
      Array(this.cols).fill(null)
    );
  }

  reset() {
    this.grid = this._createEmptyGrid();
  }

  canPlace(tetromino, rowOffset, colOffset) {
    const shape = tetromino.shape;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!shape[r][c]) continue;
        const newRow = tetromino.row + r + rowOffset;
        const newCol = tetromino.col + c + colOffset;

        if (newRow < 0) continue;
        if (
          newRow >= this.rows ||
          newCol < 0 ||
          newCol >= this.cols ||
          this.grid[newRow][newCol] !== null
        ) {
          return false;
        }
      }
    }
    return true;
  }

  lockTetromino(tetromino) {
    const shape = tetromino.shape;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!shape[r][c]) continue;
        const boardRow = tetromino.row + r;
        const boardCol = tetromino.col + c;
        if (boardRow >= 0) {
          this.grid[boardRow][boardCol] = tetromino.type;
        }
      }
    }
  }

  clearFullLines() {
    let cleared = 0;
    for (let r = this.rows - 1; r >= 0; r--) {
      if (this.grid[r].every((cell) => cell !== null)) {
        this.grid.splice(r, 1);
        this.grid.unshift(Array(this.cols).fill(null));
        cleared++;
        r++;
      }
    }
    return cleared;
  }
}

class TetrominoFactory {
  constructor(randomProvider = () => Math.random()) {
    this.randomProvider = randomProvider;
    this.types = ["I", "O", "T", "S", "Z", "J", "L"];
  }

  createRandom() {
    const index = Math.floor(this.randomProvider() * this.types.length);
    const type = this.types[index];
    return this._create(type);
  }

  _create(type) {
    const T = true;
    const F = false;

    switch (type) {
      case "I":
        return new Tetromino("I", [
          [
            [F, F, F, F],
            [T, T, T, T],
            [F, F, F, F],
            [F, F, F, F],
          ],
          [
            [F, F, T, F],
            [F, F, T, F],
            [F, F, T, F],
            [F, F, T, F],
          ],
        ]);
      case "O":
        return new Tetromino("O", [
          [
            [F, T, T, F],
            [F, T, T, F],
            [F, F, F, F],
            [F, F, F, F],
          ],
        ]);
      case "T":
        return new Tetromino("T", [
          [
            [F, T, F, F],
            [T, T, T, F],
            [F, F, F, F],
            [F, F, F, F],
          ],
          [
            [F, T, F, F],
            [F, T, T, F],
            [F, T, F, F],
            [F, F, F, F],
          ],
          [
            [F, F, F, F],
            [T, T, T, F],
            [F, T, F, F],
            [F, F, F, F],
          ],
          [
            [F, T, F, F],
            [T, T, F, F],
            [F, T, F, F],
            [F, F, F, F],
          ],
        ]);
      case "S":
        return new Tetromino("S", [
          [
            [F, T, T, F],
            [T, T, F, F],
            [F, F, F, F],
            [F, F, F, F],
          ],
          [
            [F, T, F, F],
            [F, T, T, F],
            [F, F, T, F],
            [F, F, F, F],
          ],
        ]);
      case "Z":
        return new Tetromino("Z", [
          [
            [T, T, F, F],
            [F, T, T, F],
            [F, F, F, F],
            [F, F, F, F],
          ],
          [
            [F, F, T, F],
            [F, T, T, F],
            [F, T, F, F],
            [F, F, F, F],
          ],
        ]);
      case "J":
        return new Tetromino("J", [
          [
            [T, F, F, F],
            [T, T, T, F],
            [F, F, F, F],
            [F, F, F, F],
          ],
          [
            [F, T, T, F],
            [F, T, F, F],
            [F, T, F, F],
            [F, F, F, F],
          ],
          [
            [F, F, F, F],
            [T, T, T, F],
            [F, F, T, F],
            [F, F, F, F],
          ],
          [
            [F, T, F, F],
            [F, T, F, F],
            [T, T, F, F],
            [F, F, F, F],
          ],
        ]);
      case "L":
        return new Tetromino("L", [
          [
            [F, F, T, F],
            [T, T, T, F],
            [F, F, F, F],
            [F, F, F, F],
          ],
          [
            [F, T, F, F],
            [F, T, F, F],
            [F, T, T, F],
            [F, F, F, F],
          ],
          [
            [F, F, F, F],
            [T, T, T, F],
            [T, F, F, F],
            [F, F, F, F],
          ],
          [
            [T, T, F, F],
            [F, T, F, F],
            [F, T, F, F],
            [F, F, F, F],
          ],
        ]);
      default:
        throw new Error("Tipo de tetromino desconocido: " + type);
    }
  }
}

class GameState {
  constructor(initialHighScore = 0) {
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.gameOver = false;
    this.highScore = initialHighScore;
  }

  reset() {
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.gameOver = false;
  }

  applyLineClear(lineCount) {
    if (lineCount <= 0) return;

    const lineScoreTable = {
      1: 100,
      2: 300,
      3: 500,
      4: 800,
    };

    this.score += lineScoreTable[lineCount] || lineCount * 100;
    this.lines += lineCount;
    this.level = 1 + Math.floor(this.lines / 10);
  }
}

// ============================================================
// 3. CONTROLADOR PRINCIPAL DEL JUEGO
// ============================================================

class TetrisGame {
  constructor({ rows = 20, cols = 10, board, state, renderer, hud, factory, effects, highScoreStorage, soundPlayer }) {
    this.rows = rows;
    this.cols = cols;
    this.board = board;
    this.state = state;
    this.renderer = renderer;
    this.hud = hud;
    this.factory = factory;
    this.effects = effects || {};
    this.highScoreStorage = highScoreStorage;
    this.soundPlayer = soundPlayer;

    this.activeTetromino = null;
    this.nextTetromino = null;
    this.dropIntervalMs = 800;
    this.timerId = null;
    this.isPaused = false;
  }

  start() {
    this.board.reset();
    this.state.reset();
    this.activeTetromino = null;
    this.nextTetromino = null;
    this.isPaused = false;
    this._updateDropInterval();
    this._spawnTetromino();
    this._startLoop();
    this._render();
    this.hud.showMessage("¡En marcha! Usa las flechas y espacio para jugar.");
    if (this.effects.onStart) {
      this.effects.onStart();
    }
  }

  pauseToggle() {
    if (this.state.gameOver) return;
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this._stopLoop();
      this.hud.showMessage("Pausa. Pulsa Pausa o ESC/P de nuevo para continuar.");
    } else {
      this._startLoop();
      this.hud.showMessage("Reanudado.");
    }
  }

  moveLeft() {
    if (this._tryMove(0, -1)) {
      this.soundPlayer.play("move");
    }
  }

  moveRight() {
    if (this._tryMove(0, 1)) {
      this.soundPlayer.play("move");
    }
  }

  softDrop() {
    if (!this._tryMove(1, 0)) {
      this._fixAndContinue();
    } else {
      this.soundPlayer.play("move"); // Sonido para soft drop
    }
  }

  hardDrop() {
    if (!this.activeTetromino) return;
    while (this._tryMove(1, 0)) {
      // seguir bajando
    }
    this.soundPlayer.play("drop"); // Sonido al fijar con hard drop
    this._fixAndContinue();
  }

  rotate() {
    if (!this.activeTetromino) return;
    const clone = this.activeTetromino.clone();
    clone.rotateClockwise();
    if (this.board.canPlace(clone, 0, 0)) {
      this.activeTetromino = clone;
      this.soundPlayer.play("rotate");
      this._render();
    }
  }

  _startLoop() {
    this._stopLoop();
    this.timerId = setInterval(() => {
      if (this.isPaused || this.state.gameOver) return;
      if (!this._tryMove(1, 0)) {
        this._fixAndContinue();
      }
    }, this.dropIntervalMs);
  }

  _stopLoop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  _updateDropInterval() {
    this.dropIntervalMs = Math.max(120, 800 - (this.state.level - 1) * 60);
  }

  _spawnTetromino() {
    if (!this.nextTetromino) {
      this.nextTetromino = this.factory.createRandom();
    }
    this.activeTetromino = this.nextTetromino;
    this.activeTetromino.row = -1;
    this.activeTetromino.col = 3;
    this.nextTetromino = this.factory.createRandom();

    if (!this.board.canPlace(this.activeTetromino, 0, 0)) {
      this._gameOver();
    }
  }

  _tryMove(rowOffset, colOffset) {
    if (!this.activeTetromino) return false;
    const clone = this.activeTetromino.clone();
    clone.row += rowOffset;
    clone.col += colOffset;
    if (this.board.canPlace(clone, 0, 0)) {
      this.activeTetromino = clone;
      this._render();
      return true;
    }
    return false;
  }

  _computeGhost() {
    if (!this.activeTetromino) return null;
    const ghost = this.activeTetromino.clone();
    while (this.board.canPlace(ghost, 1, 0)) {
      ghost.row += 1;
    }
    return ghost;
  }

  _fixAndContinue() {
    if (!this.activeTetromino) return;
    this.board.lockTetromino(this.activeTetromino);
    this.soundPlayer.play("drop"); // Sonido al fijar la pieza
    const cleared = this.board.clearFullLines();
    if (cleared > 0) {
      this.state.applyLineClear(cleared);
      this.soundPlayer.play("clear"); // Sonido al limpiar línea
      this._updateHighScoreIfNeeded();
      this._updateDropInterval();
      this._startLoop();
    }
    this._spawnTetromino();
    this._render();
  }

  _updateHighScoreIfNeeded() {
    if (!this.highScoreStorage) return;
    if (this.state.score > (this.state.highScore ?? 0)) {
      this.state.highScore = this.state.score;
      this.highScoreStorage.set(this.state.highScore);
    }
  }

  _render() {
    const ghost = this._computeGhost();
    this.renderer.render(this.board, this.activeTetromino, ghost);
    this.hud.update(this.state);
  }

  _gameOver() {
    this.state.gameOver = true;
    this._stopLoop();
    this._updateHighScoreIfNeeded();
    this._render();
    this.hud.showMessage("Game Over. Pulsa Iniciar para intentarlo de nuevo.");
    this.soundPlayer.play("gameOver"); // Sonido de Game Over
    if (this.effects.onGameOver) {
      this.effects.onGameOver();
    }
  }
}

