let notes = {};

async function loadNotes() {
  const response = await fetch("./fichier.json");
  notes = await response.json();
}

class MusicPlayer { 
  constructor() {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.activeOscillators = {}; // <-- stocke les oscillateurs en cours
    if (Object.keys(notes).length === 0) {
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
    gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime);

    oscillator.connect(gainNode).connect(this.audioCtx.destination);

    oscillator.start();

    if (duration) {
      oscillator.stop(this.audioCtx.currentTime + duration);
    } else {
      // note tenue = on stocke l’oscillateur
      this.activeOscillators[note] = oscillator;
    }
  }

  stop(note) {
    const osc = this.activeOscillators[note];
    if (osc) {
      osc.stop();
      delete this.activeOscillators[note];
    }
  }
}

export default MusicPlayer;
