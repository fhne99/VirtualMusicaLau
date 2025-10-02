import MusicPlayer from "./player.js";
const noteCount = document.querySelector('#noteCount');
const noteCountBtn = document.querySelector('#noteCountBtn');
const mp = new MusicPlayer();

noteCountBtn.addEventListener('click', async() => {
    for (let i = 0; i < noteCount.value; i++) {
        const note = await getRandomNote();
        console.log(note, i)
        mp.play(note, 1);
    }

});

// Charger le fichier JSON
async function loadNotes() {
  const response = await fetch("fichier.json");
  if (!response.ok) {
    throw new Error("Erreur lors du chargement de note.json");
  }
  return await response.json();
}

//Générer un nombre aléatoire
const randomNbr = (max) => {
    return Math.floor(Math.random() * max)
};

async function getRandomNote() {
  const notesObj = await loadNotes();
  const keys = Object.keys(notesObj);
console.log(randomNbr(keys.length));


  const idx = randomNbr(keys.length);
  const note = keys[idx].toString();

  return  note ;
}


fetch("fichier.json")
  .then((response) => response.json())
  .then((notes) => {

    // gammeReNoires.forEach(nom => setTimeout(() => mp.play(nom, 0.5), 500 * gammeReNoires.indexOf(nom)));
  })
  .catch((err) => {
    console.error("Erreur lors du chargement ou du traitement du JSON :", err);
  });

// ...après la création de mp...
Array.from(document.getElementsByClassName("blackButtons")).forEach((btn, i) => {
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
  ];
  btn.addEventListener("click", () => {
    mp.play(notesNoires[i], 1);
  });
});

const importBtn = document.getElementById('importBtn');
const fileInput = document.getElementById('fileInput');
const message = document.getElementById('message');

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

importBtn.addEventListener('click', () => {
  if (audioContext.state === 'suspended') audioContext.resume();
  fileInput.click();
});

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const content = e.target.result;
    scoreData = parseScore(content);

    // Vérification des notes
    const missingNote = scoreData.find(item => item.note !== '0' && !NOTE_FREQUENCIES[item.note]);
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
    startTime = pauseTime > 0 ? audioContext.currentTime - pauseTime : audioContext.currentTime;
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
    .split('\n')
    .slice(1)
    .map(line => {
      const [note, duration] = line.trim().split(/\s+/);
      return { note: note.toUpperCase(), duration: parseFloat(duration) };
    })
    .filter(item => !isNaN(item.duration));
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

  if (frequency > 0) playTone(frequency, audioContext.currentTime, item.duration);

  const elapsedTime = scoreData.slice(0, index).reduce((sum, i) => sum + i.duration, 0);
  currentTimeSpan.textContent = formatTime(elapsedTime);
  progressBar.value = (elapsedTime / scoreDuration) * 100;

  currentIndex = index + 1;
  playTimer = setTimeout(() => playFrom(currentIndex), item.duration * 1000);
}

function playTone(frequency, startTime, duration) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = 'sawtooth';
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
