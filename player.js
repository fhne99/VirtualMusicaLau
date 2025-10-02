// musicPlayer.js
let notes = {};

async function loadNotes() {
  const response = await fetch("./fichier.json");
  notes = await response.json();
}

class MusicPlayer { 
  constructor() {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (Object.keys(notes).length === 0) {
      // charger les notes au démarrage
      loadNotes();
    }
  }

  play(note, duration = 1, instrument = "sine") {
    const frequency = notes[note][0];
    if (!frequency) {
      console.error(`Note ${note} inconnue`);
      return;
    }

    const oscillator = this.audioCtx.createOscillator();
    oscillator.type = instrument;
    oscillator.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);

    const gainNode = this.audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.05, this.audioCtx.currentTime);

    oscillator.connect(gainNode).connect(this.audioCtx.destination);

    oscillator.start();
    oscillator.stop(this.audioCtx.currentTime + duration);
  }
}

export default MusicPlayer;
