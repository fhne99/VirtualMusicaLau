import MusicPlayer from "./player.js";
const noteCount = document.querySelector('#noteCount');
const noteCountBtn = document.querySelector('#noteCountBtn');
const mp = new MusicPlayer();
let tempo = 0;

noteCountBtn.addEventListener('click', async() => {
  if (noteCount.value <= 100) {
    if (document.querySelector('#toManyNotesMsg')) {
      document.querySelector('#toManyNotesMsg').remove();
    }

    for (let i = 0; i < noteCount.value; i++) {
    const note = await getRandomNote();
    mp.play(note, tempo / 1000);
    await new Promise(resolve => setTimeout(resolve, 500));
    }
  } else {
    if (!document.querySelector('#toManyNotesMsg')) {
      const message = document.createElement('p');
      message.id = "toManyNotesMsg";
      message.textContent = "Non non pas plus de 100 notes";
      message.style.color = 'red';
      document.querySelector('#musicGenerator').appendChild(message);
    }
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
  const idx = randomNbr(keys.length); 
  const note = keys[idx].toString(); 
  tempo = notesObj[note][1];
  return  note 
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

importBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        message.textContent = "Fichier importé";
    };
    reader.readAsText(file);
})
