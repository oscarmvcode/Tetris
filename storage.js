// =======================
// PERSISTENCIA (LocalStorage)
// =======================

/**
 * Servicio pequeño para guardar la mejor puntuación con caducidad.
 * Vida de los datos: 7 días (se limpia automáticamente cuando expira).
 */
class HighScoreStorage {
  constructor(storage, key = "tetris_high_score_v1") {
    this.storage = storage;
    this.key = key;
    this.maxAgeMs = 7 * 24 * 60 * 60 * 1000; // 7 días
  }

  _now() {
    return Date.now();
  }

  get() {
    if (!this.storage) return 0;
    try {
      const raw = this.storage.getItem(this.key);
      if (!raw) return 0;
      const parsed = JSON.parse(raw);
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        typeof parsed.score !== "number" ||
        typeof parsed.storedAt !== "number"
      ) {
        this.storage.removeItem(this.key);
        return 0;
      }
      const age = this._now() - parsed.storedAt;
      if (age > this.maxAgeMs) {
        this.storage.removeItem(this.key);
        return 0;
      }
      return parsed.score;
    } catch {
      try {
        this.storage.removeItem(this.key);
      } catch {}
      return 0;
    }
  }

  set(score) {
    if (!this.storage || typeof score !== "number" || !isFinite(score)) {
      return;
    }
    const payload = {
      score,
      storedAt: this._now(),
    };
    try {
      this.storage.setItem(this.key, JSON.stringify(payload));
    } catch {
      // ignorar errores de espacio o permisos
    }
  }
}

