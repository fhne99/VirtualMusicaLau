// musicPlayer.js
import noteToFrequency from "./note.js";

class MusicPlayer {
  constructor() {
    // Contexte audio global
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  // Joue une note donnée avec un type d'onde choisi
  play(note, duration = 1, instrument = "sine") {
    const frequency = noteToFrequency[note];
    if (!frequency) {
      console.error(`Note ${note} inconnue`);
      return;
    }

    // Oscillateur (source du son)
    const oscillator = this.audioCtx.createOscillator();
    oscillator.type = instrument; // "sine", "square", "triangle", "sawtooth"
    oscillator.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);

    // Gain (volume)
    const gainNode = this.audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.05, this.audioCtx.currentTime); // volume

    // Connecter oscillateur → gain → haut-parleurs
    oscillator.connect(gainNode).connect(this.audioCtx.destination);

    // Jouer
    oscillator.start();
    oscillator.stop(this.audioCtx.currentTime + duration);
  }
}

export default MusicPlayer;
