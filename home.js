import MusicPlayer from "./player.js";
const noteCount = document.querySelector("#noteCount");
const noteCountBtn = document.querySelector("#noteCountBtn");
const mp = new MusicPlayer();

// Create random notes played when clicked play
noteCountBtn.addEventListener("click", async () => {
  for (let i = 0; i < noteCount.value; i++) {
    const note = await getRandomNote();
    console.log(note, i);
    mp.play(note, 1);
  }
});

//Générer un nombre aléatoire
const randomNbr = (max) => {
  return Math.floor(Math.random() * max);
};

async function getRandomNote() {
  const notesObj = await loadNotes();
  const keys = Object.keys(notesObj);
  console.log(randomNbr(keys.length));

  const idx = randomNbr(keys.length);
  const note = keys[idx].toString();

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

    // Jouer note tenue (pas de durée => null)
    mp.play(note, null);

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
