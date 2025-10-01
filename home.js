
const noteCount = document.querySelector('#noteCount');
const noteCountBtn = document.querySelector('#noteCountBtn');
const mp = new MusicPlayer();

noteCountBtn.addEventListener('click', async() => {
    for (let i = 0; i < noteCount.value; i++) {
        const note = await getRandomNote();
        mp.play(note, 1);
    }
});


// Charger le fichier JSON
async function loadNotes() {
  const response = await fetch("fichier.json");
  if (!response.ok) {
    throw new Error("Erreur lors du chargement de notes.json");
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
  const note = keys[idx];            
  const value = notesObj[note]; 
  
  return { [note]: value }; 
}
