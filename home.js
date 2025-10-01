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
});
