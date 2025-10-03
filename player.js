let notes = {};

async function loadNotes() {
  const response = await fetch("./fichier.json");
  notes = await response.json();
}

class MusicPlayer {
  constructor() {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.activeOscillators = {}; // stocke les oscillateurs en cours
    if (Object.keys(notes).length === 0) {
      loadNotes();
    }

    // 🎙️ Création de la destination pour l'enregistrement
    this.dest = this.audioCtx.createMediaStreamDestination();
    this.mediaRecorder = null;
    this.recordedChunks = [];
  }

  // Jouer une note
  play(note, duration = 1, instrument = "sine") {
    const frequency = notes[note]?.[0];
    if (!frequency) {
      console.error(`Note ${note} inconnue`);
      return;
    }

    const oscillator = this.audioCtx.createOscillator();
    oscillator.type = instrument;
    oscillator.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);

    const gainNode = this.audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime);

    // ⚡ Connecter au MediaStreamDestination pour enregistrer
    oscillator.connect(gainNode).connect(this.dest);
    // ⚡ Aussi jouer sur les enceintes
    gainNode.connect(this.audioCtx.destination);

    oscillator.start();
    this.activeOscillators[note] = oscillator;

    if (duration) {
      oscillator.stop(this.audioCtx.currentTime + duration);
      oscillator.onended = () => delete this.activeOscillators[note];
    }
  }

  stop(note) {
    const osc = this.activeOscillators[note];
    if (osc) {
      osc.stop();
      delete this.activeOscillators[note];
    }
  }

  // Démarrer l'enregistrement
  startRecording() {
    if (this.audioCtx.state === "suspended") this.audioCtx.resume();
    this.mediaRecorder = new MediaRecorder(this.dest.stream);
    this.recordedChunks = [];

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.recordedChunks.push(e.data);
    };

    this.mediaRecorder.start();
  }

  // Arrêter l'enregistrement et retourner un blob
  stopRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) return resolve(null);
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: "audio/webm" });
        resolve(blob);
      };
      this.mediaRecorder.stop();
    });
  }
}

export default MusicPlayer;
