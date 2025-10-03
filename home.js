import MusicPlayer from "./player.js";
const noteCount = document.querySelector("#noteCount");
const noteCountBtn = document.querySelector("#noteCountBtn");
const mp = new MusicPlayer();
const tempoSelect = document.querySelector("#tempo");

let notes = {};
let tempo = 0;

document.addEventListener(
  "click",
  () => {
    if (mp.audioCtx.state === "suspended") mp.audioCtx.resume();
  },
  { once: true }
);

let funMessage;

noteCountBtn.addEventListener("click", async () => {
  noteCountBtn.disabled = true;
  if (noteCount.value <= 100) {
    if (document.querySelector("#toManyNotesMsg")) {
      document.querySelector("#toManyNotesMsg").remove();
    }

    if (funMessage) funMessage.remove();

    for (let i = 0; i < noteCount.value; i++) {
      if (i === 74) {
        const hiddenButton = document.createElement('button');
        hiddenButton.textContent = '🎉 Clique-moi !';
        document.querySelector("#musicGenerator").appendChild(hiddenButton);
        hiddenButton.addEventListener('click', () => {
          hiddenButton.remove();
            funMessage = document.createElement('p');
            funMessage.textContent = '👀 Bientôt dispo.. reste branché !';
            funMessage.style="font-size: 24px; font-weight: bold;"
            document.querySelector("#musicGenerator").appendChild(funMessage);
        });
      }
      const note = await getRandomNote();
      if (tempoSelect.value === "random") {
        const duration = tempo / 1000;
        mp.play(note, duration);
        await new Promise((resolve) => setTimeout(resolve, tempo));
      } else {
        const fixedTempo = parseInt(tempoSelect.value);
        const duration = fixedTempo / 1000;
        mp.play(note, duration);
        await new Promise((resolve) => setTimeout(resolve, fixedTempo));
      }
    }
  } else {
    if (!document.querySelector("#toManyNotesMsg")) {
      const message = document.createElement("p");
      message.id = "toManyNotesMsg";
      message.textContent = "Non non pas plus de 100 notes";
      message.style.color = "rgb(0, 230, 230)";
      document.querySelector("#musicGenerator").appendChild(message);
    }
  }
  noteCountBtn.disabled = false;
});

// Charger le fichier JSON
async function loadNotes() {
  const response = await fetch("fichier.json");
  if (!response.ok) {
    throw new Error("Erreur lors du chargement de note.json");
  }
  notes = await response.json();
  return notes; // <-- important
}

//Générer un nombre aléatoire
const randomNbr = (max) => {
  return Math.floor(Math.random() * max);
};

async function getRandomNote() {
  const notesObj = await loadNotes();
  const keys = Object.keys(notesObj);
  const idx = randomNbr(keys.length);
  const note = keys[idx].toString();
  tempo = notesObj[note][1];
  return note;
}

// Assign piano keys to notes
Array.from(document.getElementsByClassName("blackButtons")).forEach(
  (btn, i) => {
    const notesNoires = [
      "C#4",
      "D#4",
      "F#4",
      "G#4",
      "A#4",
      "C#5",
      "D#5",
      "F#5",
      "G#5",
      "A#5",
      "C#6",
      "D#6",
      "F#6",
      "G#6",
      "A#6",
      "C#7",
      "D#7",
      "F#7",
      "G#7",
      "A#7",
    ];
    btn.addEventListener("click", () => {
      mp.play(notesNoires[i], 1);
      recordNote(notesNoires[i]);
    });
  }
);

// jouer les touches blanches du piano
document.querySelectorAll(".white-key").forEach((key, i) => {
  // Notes blanches sur 2 octaves (Do4 à Si5)
  const notesBlanches = [
    "C4",
    "D4",
    "E4",
    "F4",
    "G4",
    "A4",
    "B4",
    "C5",
    "D5",
    "E5",
    "F5",
    "G5",
    "A5",
    "B5",
    "C6",
    "D6",
    "E6",
    "F6",
    "G6",
    "A6",
    "B6",
    "C7",
    "D7",
    "E7",
    "F7",
    "G7",
    "A7",
    "B7",
  ];

  key.addEventListener("click", () => {
    mp.play(notesBlanches[i], 1);
    recordNote(notesBlanches[i]);
  });
});

//Assigner touches de clavier
const clavierToNote = {
  // Octave 4
  a: "C4",
  z: "D4",
  e: "E4",
  r: "F4",
  t: "G4",
  y: "A4",
  u: "B4",
  i: "C5",

  // Octave 5
  w: "C5",
  x: "D5",
  c: "E5",
  v: "F5",
  b: "G5",
  n: "A5",
  ",": "B5",
  ";": "C6",

  // Octave 4 Dièse et bémol
  é: "C#4",
  '"': "D#4",
  "(": "F#4",
  "-": "G#4",
  è: "A#4",

  // Octave 5 Dièse et bémol
  s: "C#5",
  d: "D#5",
  g: "F#5",
  h: "G#5",
  j: "A#5",
};

const activeNotes = {};

document.addEventListener("keydown", (event) => {
  const note = clavierToNote[event.key.toLowerCase()];
  if (note && !activeNotes[event.key]) {
    activeNotes[event.key] = note;

    mp.play(note, null);
    highlightKey(note, true);

    if (isRecording) {
      noteStartTimes[event.key] = Date.now();
      // Silence éventuel
      if (lastNoteEnd) {
        const silence = (Date.now() - lastNoteEnd) / 1000;
        if (silence > 0.05) {
          recordedNotes.push(["0", silence.toFixed(3)]);
        }
      }
    }
  }
});

document.addEventListener("keyup", (event) => {
  const note = clavierToNote[event.key.toLowerCase()];
  if (note) {
    mp.stop(note);
    delete activeNotes[event.key];
    highlightKey(note, false);

    if (isRecording && noteStartTimes[event.key]) {
      const start = noteStartTimes[event.key];
      const duration = (Date.now() - start) / 1000;
      recordedNotes.push([note, duration.toFixed(3)]);
      lastNoteEnd = Date.now();
      delete noteStartTimes[event.key];
    }
  }
});

document.querySelectorAll(".white-key, .blackButtons").forEach((key) => {
  const note = key.getAttribute("data-note");

  key.addEventListener("mousedown", () => {
    mp.play(note, null);

    if (isRecording) {
      noteStartTimes[note] = Date.now();
      if (lastNoteEnd) {
        const silence = (Date.now() - lastNoteEnd) / 1000;
        if (silence > 0.05) recordedNotes.push(["0", silence.toFixed(3)]);
      }
    }
  });

  key.addEventListener("mouseup", () => {
    mp.stop(note);

    if (isRecording && noteStartTimes[note]) {
      const duration = (Date.now() - noteStartTimes[note]) / 1000;
      recordedNotes.push([note, duration.toFixed(3)]);
      lastNoteEnd = Date.now();
      delete noteStartTimes[note];
    }
  });
});

// Fonction pour mettre à jour le visuel
function highlightKey(note, isActive) {
  const key = document.querySelector(`[data-note="${note}"]`);
  if (key) {
    key.classList.toggle("active", isActive);
  }
}

const importBtn = document.getElementById("importBtn");
const fileInput = document.getElementById("fileInput");
const message = document.getElementById("message");

const playerDiv = document.getElementById("player");
const playPauseBtn = document.getElementById("playPauseBtn");
const currentTimeSpan = document.getElementById("currentTime");
const totalTimeSpan = document.getElementById("totalTime");
const progressBar = document.getElementById("progressBar");

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const SILENCE_FREQUENCY = 0;

let NOTE_FREQUENCIES = {};
let scoreData = [];
let isPlaying = false;
let currentIndex = 0;
let startTime = 0;
let pauseTime = 0;
let playTimer = null;
let scoreDuration = 0;

async function loadFrequencies() {
  try {
    const response = await fetch("fichier.json");
    if (!response.ok) throw new Error("Impossible de charger fichier.json");
    NOTE_FREQUENCIES = await response.json();
  } catch (err) {
    console.error(err);
    message.textContent = "Erreur lors du chargement des fréquences";
  }
}
loadFrequencies();

importBtn.addEventListener("click", () => {
  if (audioContext.state === "suspended") audioContext.resume();
  fileInput.click();
});

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    const content = ev.target.result;
    scoreData = parseScore(content);

    const missingNote = scoreData.find(
      (item) => item.note !== "0" && !NOTE_FREQUENCIES[item.note]
    );
    if (missingNote) {
      message.textContent = `Erreur : note ${missingNote.note} non définie dans le JSON`;
      return;
    }

    scoreDuration = scoreData.reduce((sum, item) => sum + item.duration, 0);

    playerDiv.id = "playerVisible";
    progressBar.value = 0;
    currentTimeSpan.textContent = "0:00";
    totalTimeSpan.textContent = formatTime(scoreDuration);
    currentIndex = 0;
    pauseTime = 0;
    isPlaying = false;
    playPauseBtn.textContent = "⏵";
  };
  reader.readAsText(file);
});

progressBar.addEventListener("click", (e) => {
  if (!scoreData.length) return;

  const rect = progressBar.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const newPercent = clickX / rect.width;
  const newTime = newPercent * scoreDuration;

  let accumulated = 0;
  let newIndex = 0;
  for (let i = 0; i < scoreData.length; i++) {
    accumulated += scoreData[i].duration;
    if (accumulated >= newTime) {
      newIndex = i;
      break;
    }
  }

  currentIndex = newIndex;
  pauseTime = newTime;

  if (!isPlaying) {
    progressBar.value = newPercent * 100;
    currentTimeSpan.textContent = formatTime(newTime);
  } else {
    clearTimeout(playTimer);
    startTime = audioContext.currentTime - pauseTime;
    playFrom(currentIndex);
  }
});

function parseScore(content) {
  return content
    .trim()
    .split("\n")
    .slice(1)
    .map((line) => {
      const [note, duration] = line.trim().split(/\s+/);
      return { note: note.toUpperCase(), duration: parseFloat(duration) };
    })
    .filter((item) => !isNaN(item.duration));
}

playPauseBtn.addEventListener("click", () => {
  if (!isPlaying) {
    isPlaying = true;
    playPauseBtn.textContent = "⏸";
    startTime =
      pauseTime > 0
        ? audioContext.currentTime - pauseTime
        : audioContext.currentTime;
    if (pauseTime === 0) currentIndex = 0;
    playFrom(currentIndex);
  } else {
    isPlaying = false;
    playPauseBtn.textContent = "⏵";
    pauseTime = audioContext.currentTime - startTime;
    clearTimeout(playTimer);
  }
});

function playFrom(index) {
  if (index >= scoreData.length || !isPlaying) {
    isPlaying = false;
    pauseTime = 0;
    currentIndex = 0;
    playPauseBtn.textContent = "⏵";
    progressBar.value = 100;
    currentTimeSpan.textContent = formatTime(scoreDuration / playSpeed);
    return;
  }

  const item = scoreData[index];
  const freq = NOTE_FREQUENCIES[item.note]?.[0] || SILENCE_FREQUENCY;

  if (freq > 0)
    playTone(freq, audioContext.currentTime, item.duration / playSpeed);

  const elapsed =
    scoreData.slice(0, index).reduce((sum, i) => sum + i.duration, 0) /
    playSpeed;
  currentTimeSpan.textContent = formatTime(elapsed);
  progressBar.value = (elapsed / (scoreDuration / playSpeed)) * 100;

  currentIndex = index + 1;
  playTimer = setTimeout(
    () => playFrom(currentIndex),
    (item.duration / playSpeed) * 1000
  );
}

function playTone(freq, startTime, duration) {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
  gain.gain.linearRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(audioContext.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

// Enregistrement
let isRecording = false;
let recordedNotes = [];
let noteStartTimes = {}; // Pour suivre début de chaque note
let lastNoteEnd = null; // Pour calculer les silences

console.log(recordedNotes);

let lastTime = null;

function recordNote(note) {
  if (!isRecording) return;

  const now = Date.now();

  if (lastTime) {
    const delta = (now - lastTime) / 1000; // en secondes
    recordedNotes.push(["0", delta.toFixed(3)]); // silence
  }

  recordedNotes.push([note, 0.125]); // durée fixe (tu peux adapter)
  lastTime = now;
  console.log(recordedNotes);
}

// Boutons start/stop
const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const downloadBtn = document.getElementById("downloadBtn");
const speedSelect = document.getElementById("speedSelect");

let playSpeed = 1;

startBtn.addEventListener("click", () => {
  recordedNotes = [];
  lastTime = null;
  isRecording = true;
  alert("🎙️ Enregistrement démarré !");
});

stopBtn.addEventListener("click", () => {
  isRecording = false;
  alert("⏹️ Enregistrement arrêté !");
});

// Télécharger le fichier
downloadBtn.addEventListener("click", async () => {
  if (recordedNotes.length === 0) {
    alert("Aucune note enregistrée !");
    return;
  }

  const content = recordedNotes.map((n) => n.join(" ")).join("\n");
  const blob = new Blob([content], { type: "text/plain" });

  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: "partition.txt",
        types: [
          {
            description: "Partition",
            accept: { "text/plain": [".txt"] },
          },
        ],
      });

      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      alert("✅ Partition sauvegardée !");
      return;
    } catch (err) {
      console.warn("Annulé :", err);
    }
  }

  // 🔹 Fallback si le navigateur ne supporte pas showSaveFilePicker
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "partition.txt";
  a.click();
  URL.revokeObjectURL(url);
});

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

// Changer d'instrument
const selectInstrument = document.getElementById("instrument");
const fluteDiv = document.querySelector(".flute");
const pianoDiv = document.querySelector(".piano");

selectInstrument.addEventListener("change", function () {
  const choix = selectInstrument.value;

  if (choix === "flute") {
    fluteDiv.style.display = "block";
    pianoDiv.style.display = "none";
  } else if (choix === "piano") {
    fluteDiv.style.display = "none";
    pianoDiv.style.display = "flex";
  }
});

// creation des sons synthé flûte
let flutesonLike;
let holesflute; // Déclaré globalement
const notesflute = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];
const keyMap = { a: 0, z: 1, e: 2, r: 3, t: 4, y: 5, u: 6, i: 7 };

document.addEventListener("DOMContentLoaded", () => {
  // Crée le synthé flûte
  flutesonLike = new Tone.DuoSynth({
    voice0: {
      oscillator: { type: "triangle", detune: 10 },
      envelope: { attack: 0.4, decay: 0.1, sustain: 0.7, release: 1.5 },
    },
    voice1: {
      oscillator: { type: "sawtooth", detune: -10 },
      envelope: { attack: 0.5, decay: 0.1, sustain: 0.6, release: 1.5 },
    },
    harmonicity: 1.2,
    volume: -8,
  }).toDestination();

  // Réverb
  const reverb = new Tone.Reverb({ decay: 4, wet: 0.4 }).toDestination();
  flutesonLike.connect(reverb);

  // Récupère tous les trous
  holesflute = document.querySelectorAll(".hole");

  // Clic sur chaque trou
  holesflute.forEach((hole, i) => {
    hole.addEventListener("click", async () => {
      await Tone.start();
      flutesonLike.triggerAttackRelease(notesflute[i], "4n");
      // Enregistrer la note
       recordNote(notesflute[i]);

      // Illuminer le trou
      hole.classList.add("active");
      setTimeout(() => hole.classList.remove("active"), 400);
    });
  });
});

// gestion du clavier pour la flûte et le piano
document.addEventListener("keydown", async (event) => {
  const instrument = selectInstrument.value; 
  const key = event.key.toLowerCase();

  if (instrument === "flute") {
    // Jouer la flûte
    const index = keyMap[key];
    if (index !== undefined && holesflute) {
      await Tone.start();
      flutesonLike.triggerAttackRelease(notesflute[index], "4n");


      //ajouter pour enregistrer la note
      recordNote(notesflute[index]); 

      const hole = holesflute[index];
      if (hole) {
        hole.classList.add("active");
        setTimeout(() => hole.classList.remove("active"), 400);
      }
    }
  }

  if (instrument === "piano") {
    // Jouer le piano
    const note = clavierToNote[key];
    if (note && !activeNotes[key]) {
      activeNotes[key] = note;
      mp.play(note, null);
      recordNote(note);
      highlightKey(note, true);
    }
  }
});

document.addEventListener("keyup", (event) => {
  const instrument = selectInstrument.value;
  const key = event.key.toLowerCase();

  if (instrument === "piano") {
    const note = clavierToNote[key];
    if (note) {
      mp.stop(note);
      delete activeNotes[key];
      highlightKey(note, false);
    }
  }
});


// Boutons
const startRecBtn = document.getElementById("startRec");
const stopRecBtn = document.getElementById("stopRec");

startRecBtn.addEventListener("click", () => {
  mp.startRecording();
  startRecBtn.disabled = true;
  stopRecBtn.disabled = false;
});

stopRecBtn.addEventListener("click", async () => {
  const blob = await mp.stopRecording();
  if (!blob) return;

  // ✅ Méthode moderne : showSaveFilePicker
  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: "piano_recording.mp3",
        types: [
          {
            description: "Enregistrement audio",
            accept: { "audio/mp3": [".mp3"] },
          },
        ],
      });

      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      alert("✅ Enregistrement sauvegardé avec succès !");
      return;
    } catch (err) {
      console.warn("showSaveFilePicker annulé ou non dispo :", err);
    }
  }

  // 🔹 Fallback : création d'un lien temporaire
  const filename =
    prompt(
      "Nom du fichier (ex : piano_recording.mp3)",
      "piano_recording.mp3"
    ) || "piano_recording.mp3";

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
});

speedSelect.addEventListener("change", (e) => {
  playSpeed = parseInt(e.target.value) / 1000;
});
a.remove();
setTimeout(() => URL.revokeObjectURL(url), 2000);

startRecBtn.disabled = false;
stopRecBtn.disabled = true;