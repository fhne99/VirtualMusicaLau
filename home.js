import MusicPlayer from "./player.js";

const mp = new MusicPlayer();

fetch("fichier.json")
  .then((response) => response.json())
  .then((notes) => {
    // Récupérer toutes les touches noires (celles qui contiennent #)
    const touchesNoires = Object.keys(notes).filter((nom) => nom.includes("#"));

    // Touches noires de la gamme de Do (octave 4)
    const gammeDoNoires = [
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
    // Touches noires de la gamme de Ré (octave 4)

    // Exemple : jouer toutes les touches noires de la gamme de Do
    gammeDoNoires.forEach((nom) => {
      setTimeout(() => mp.play(nom, 0.5), 500 * gammeDoNoires.indexOf(nom));
    });

    // Pour jouer la gamme de Ré, décommente la ligne suivante :
    // gammeReNoires.forEach(nom => setTimeout(() => mp.play(nom, 0.5), 500 * gammeReNoires.indexOf(nom)));
  })
  .catch((err) => {
    console.error("Erreur lors du chargement ou du traitement du JSON :", err);
  });

// ...après la création de mp...
document.querySelectorAll("button").forEach((btn, i) => {
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
