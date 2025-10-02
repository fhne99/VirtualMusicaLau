import MusicPlayer from "./player.js";
const noteCount = document.querySelector("#noteCount");
const noteCountBtn = document.querySelector("#noteCountBtn");
const mp = new MusicPlayer();
let notes = {};
let tempo = 0;

document.addEventListener(
  "click",
  () => {
    if (mp.audioCtx.state === "suspended") mp.audioCtx.resume();
  },
  { once: true }
);

noteCountBtn.addEventListener("click", async () => {
  if (noteCount.value <= 100) {
    if (document.querySelector("#toManyNotesMsg")) {
      document.querySelector("#toManyNotesMsg").remove();
    }

    for (let i = 0; i < noteCount.value; i++) {
      const note = await getRandomNote();
      mp.play(note, tempo / 1000);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  } else {
    if (!document.querySelector("#toManyNotesMsg")) {
      const message = document.createElement("p");
      message.id = "toManyNotesMsg";
      message.textContent = "Non non pas plus de 100 notes";
      message.style.color = "red";
      document.querySelector("#musicGenerator").appendChild(message);
    }
  }
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
  "c": "F#4", // ← remplacé "(" par "c" pour éviter souci
  "-": "G#4",
  è: "A#4",

  // Octave 5 Dièse et bémol
  s: "C#5",
  d: "D#5",
  g: "F#5",
  h: "G#5",
  j: "A#5",

  // Octave 6
  J: "D6",
  p: "E6",
  q: "F6",
  m: "G6",
  l: "A6",
  k: "B6",

  // Octave 6 Dièse et bémol
  1: "C#6",
  2: "D#6",
  3: "F#6",
  4: "G#6",
  5: "A#6",

  // Octave 7
  "!": "C7",
  "@": "D7",
  "#": "E7",
  "$": "F7",
  "%": "G7",
  "^": "A7",
  "&": "B7",

  // Octave 7 Dièse et bémol
  6: "C#7",
  7: "D#7",
  8: "F#7",
  9: "G#7",
  0: "A#7",
};


const activeNotes = {};

document.addEventListener("keydown", (event) => {
  const note = clavierToNote[event.key.toLowerCase()];
  if (note && !activeNotes[event.key]) {
    activeNotes[event.key] = note;

    // Jouer note tenue (pas de durée => null)
    mp.play(note, null);
    recordNote(note);
    highlightKey(note, true);
  }
});

document.addEventListener("keyup", (event) => {
  const note = clavierToNote[event.key.toLowerCase()];
  if (note) {
    mp.stop(note);
    delete activeNotes[event.key];

    highlightKey(note, false);
  }
});

// Fonction pour mettre à jour le visuel
function highlightKey(note, isActive) {
  const key = document.querySelector(`[data-note="${note}"]`);
  if (key) {
    key.classList.toggle("active", isActive);
  }
}

// Import file to read tablatures
const importBtn = document.getElementById("importBtn");
const fileInput = document.getElementById("fileInput");
const message = document.getElementById("message");

importBtn.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const content = e.target.result;
    message.textContent = "Fichier importé";
  };
  reader.readAsText(file);
});

const playerDiv = document.getElementById("player");
const playPauseBtn = document.getElementById("playPauseBtn");
const currentTimeSpan = document.getElementById("currentTime");
const totalTimeSpan = document.getElementById("totalTime");
const progressBar = document.getElementById("progressBar");

const SILENCE_FREQUENCY = 0;
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

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
    console.error("Erreur :", err);
    message.textContent = "Erreur lors du chargement des fréquences";
  }
}
await loadFrequencies();

importBtn.addEventListener("click", () => {
  if (audioContext.state === "suspended") audioContext.resume();
  fileInput.click();
});

fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const content = e.target.result;
    scoreData = parseScore(content);

    // Vérification des notes
    const missingNote = scoreData.find(
      (item) => item.note !== "0" && !NOTE_FREQUENCIES[item.note]
    );
    if (missingNote) {
      message.textContent = `Erreur : La note ${missingNote.note} n'est pas définie.`;
      return;
    }

    scoreDuration = scoreData.reduce((sum, item) => sum + item.duration, 0);

    playerDiv.style.display = "flex";
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

progressBar.addEventListener("click", (e) => {
  if (!scoreData.length) return;
  const rect = progressBar.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const newPercent = clickX / rect.width;
  const newTime = newPercent * scoreDuration;

  let accumulated = 0;
  for (let i = 0; i < scoreData.length; i++) {
    accumulated += scoreData[i].duration;
    if (accumulated >= newTime) {
      currentIndex = i;
      pauseTime = newTime;
      if (!isPlaying) {
        progressBar.value = newPercent * 100;
        currentTimeSpan.textContent = formatTime(newTime);
      } else {
        clearTimeout(playTimer);
        startTime = audioContext.currentTime - pauseTime;
        playFrom(currentIndex);
      }
      break;
    }
  }
});

function parseScore(rawContent) {
  return rawContent
    .trim()
    .split("\n")
    .slice(1)
    .map((line) => {
      const [note, duration] = line.trim().split(/\s+/);
      return { note: note.toUpperCase(), duration: parseFloat(duration) };
    })
    .filter((item) => !isNaN(item.duration));
}

function playFrom(index) {
  if (index >= scoreData.length || !isPlaying) {
    isPlaying = false;
    pauseTime = 0;
    currentIndex = 0;
    playPauseBtn.textContent = "⏵";
    progressBar.value = 100;
    currentTimeSpan.textContent = formatTime(scoreDuration);
    return;
  }

  const item = scoreData[index];
  const frequency = NOTE_FREQUENCIES[item.note] || SILENCE_FREQUENCY;

  if (frequency > 0)
    playTone(frequency, audioContext.currentTime, item.duration);

  const elapsedTime = scoreData
    .slice(0, index)
    .reduce((sum, i) => sum + i.duration, 0);
  currentTimeSpan.textContent = formatTime(elapsedTime);
  progressBar.value = (elapsedTime / scoreDuration) * 100;

  currentIndex = index + 1;
  playTimer = setTimeout(() => playFrom(currentIndex), item.duration * 1000);
}

function playTone(frequency, startTime, duration) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(frequency, startTime);

  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
  gainNode.gain.linearRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}
// Enregistrement
let isRecording = false;
let recordedNotes = [];
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
downloadBtn.addEventListener("click", () => {
  if (recordedNotes.length === 0) {
    alert("Aucune note enregistrée !");
    return;
  }

  let content = "Unknown 0.125\n";
  recordedNotes.forEach(([note, duration]) => {
    content += `${note} ${duration}\n`;
  });

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "partition.txt";
  a.click();

  URL.revokeObjectURL(url);
});
