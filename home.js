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
