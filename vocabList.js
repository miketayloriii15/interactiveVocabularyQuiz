const vocabFileUrl = 'assets/files/vocabularyForFlashCards.xlsx';

// Load vocabulary data and display when the page loads
window.onload = function () {
    loadVocabularyData(vocabFileUrl);
};

// Load and display vocabulary data
function loadVocabularyData(fileUrl) {
    fetch(fileUrl)
        .then(response => response.arrayBuffer())
        .then(data => {
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }).slice(1);

            // Display the complete vocabulary list
            displayVocabularyList(jsonData);
        })
        .catch(error => console.error("Error loading vocabulary file:", error));
}

// Display vocabulary list
function displayVocabularyList(items) {
    const container = document.getElementById('vocabularyContainer');
    container.innerHTML = ''; // Clear any previous content

    items.forEach((item) => {
        const word = item[0] || "Word";
        const definition = item[1] || "Definition";
        const wordDefPair = document.createElement('div');
        wordDefPair.classList.add('word-definition-pair');
        wordDefPair.innerHTML = `<strong>${word}</strong>: ${definition}`;
        container.appendChild(wordDefPair);
    });
}
