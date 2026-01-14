// =======================
// REPRODUCTOR DE SONIDOS
// =======================

class SoundPlayer {
  constructor(sounds = {}) {
    this.sounds = {};
    this.muted = false;
    console.log("SoundPlayer: Inicializando...");
    for (const key in sounds) {
      if (sounds.hasOwnProperty(key)) {
        const audio = new Audio(sounds[key]);
        audio.volume = 0.5;
        audio.preload = 'auto'; // Asegurar precarga
        audio.load(); // Cargar explícitamente el recurso de audio
        this.sounds[key] = audio;
        console.log(`SoundPlayer: Cargando ${key} desde ${sounds[key]}`);

        // Intento de desbloqueo inicial para algunos navegadores
        if (key !== 'silent') { // No intentar pre-reproducir el silent sound inmediatamente
          audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
            console.log(`SoundPlayer: Pre-reproducción/pausa exitosa para ${key}.`);
          }).catch(e => console.warn(`SoundPlayer: Fallo en pre-reproducción/pausa para ${key}:`, e));
        }
      }
    }
  }

  play(key) {
    if (this.muted || !this.sounds[key]) {
      if (!this.sounds[key]) console.warn(`SoundPlayer: Sonido '${key}' no encontrado.`);
      console.log(`SoundPlayer: Intento de reproducción de ${key} abortado (silenciado o no encontrado).`);
      return;
    }
    console.log(`SoundPlayer: Intentando reproducir ${key}`);
    // Clonar nodo para permitir múltiples reproducciones simultáneas sin interrupciones
    const soundInstance = this.sounds[key].cloneNode(true);
    soundInstance.volume = this.sounds[key].volume;
    soundInstance.muted = this.muted; // Asegurar que el clon hereda el estado de mute
    soundInstance.play().catch((e) => {
      console.warn(`SoundPlayer: Error al reproducir el sonido ${key}:`, e);
    });
  }

  setVolume(key, volume) {
    if (this.sounds[key]) {
      this.sounds[key].volume = volume;
      console.log(`SoundPlayer: Volumen de ${key} ajustado a ${volume}`);
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    console.log(`SoundPlayer: Audio ${this.muted ? 'silenciado' : 'activado'}`);
    for (const key in this.sounds) {
      if (this.sounds.hasOwnProperty(key)) {
        this.sounds[key].muted = this.muted;
      }
    }
  }
}