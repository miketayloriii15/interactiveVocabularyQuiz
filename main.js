const vocabFileUrl = 'assets/files/vocabularyForFlashCards.xlsx';
const quizFileUrl = 'assets/files/vocabQuestions.xlsx';

let flashcardData = [], questions = [], selectedQuestions = [], currentQuestionIndex = 0, score = 0;
let answerDetails = [];

// Load vocabulary data and quiz data when the page loads
window.onload = function () {
    loadVocabularyData(vocabFileUrl);
    loadQuizData(quizFileUrl);
};

// Load and display vocabulary data for flashcards and list
function loadVocabularyData(fileUrl) {
    fetch(fileUrl)
        .then(response => response.arrayBuffer())
        .then(data => {
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }).slice(1);

            if (jsonData.length < 6) {
                console.error("Not enough items to create flashcards.");
                return;
            }

            flashcardData = shuffleArray(jsonData).slice(0, 6);
            displayFlashcards(flashcardData);
            displayVocabularyList(jsonData);
        })
        .catch(error => console.error("Error loading vocabulary file:", error));
}

// Load quiz data and select random questions
function loadQuizData(fileUrl) {
    fetch(fileUrl)
        .then(response => response.arrayBuffer())
        .then(data => {
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }).slice(1);

            jsonData.forEach(row => {
                if (row && row.length >= 6 && row[0] && row[5] !== undefined) {
                    questions.push({
                        question: row[0] || "Untitled Question",
                        choices: [
                            row[1] || "Option 1",
                            row[2] || "Option 2",
                            row[3] || "Option 3",
                            row[4] || "Option 4"
                        ],
                        answer: typeof row[5] === 'number' ? row[5] - 1 : 0
                    });
                }
            });

            if (questions.length > 0) {
                selectedQuestions = getRandomQuestions(questions, 10);
                displayQuestion();
            } else {
                console.error("No questions found in the file.");
            }
        })
        .catch(error => console.error("Error loading quiz file:", error));
}

// Shuffle function
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Display flashcards
function displayFlashcards(items) {
    const container = document.getElementById('flashcardContainer');
    container.innerHTML = '';
    items.forEach((item) => {
        const word = item[0] || "Word";
        const definition = item[1] || "Definition";

        const flashcard = document.createElement('div');
        flashcard.classList.add('flashcard');
        flashcard.onclick = () => flashcard.classList.toggle('is-flipped');

        const front = document.createElement('div');
        front.classList.add('flashcard-front');
        front.innerHTML = `<p>${word}</p>`;
        flashcard.appendChild(front);

        const back = document.createElement('div');
        back.classList.add('flashcard-back');
        back.innerHTML = `<p>${definition}</p>`;
        flashcard.appendChild(back);

        container.appendChild(flashcard);
    });
}

// Display vocabulary list
function displayVocabularyList(items) {
    const container = document.getElementById('vocabularyContainer');
    container.innerHTML = '';
    items.forEach((item) => {
        const word = item[0] || "Word";
        const definition = item[1] || "Definition";
        const wordDefPair = document.createElement('div');
        wordDefPair.classList.add('word-definition-pair');
        wordDefPair.innerHTML = `<strong>${word}</strong>: ${definition}`;
        container.appendChild(wordDefPair);
    });
}

// Function to shuffle and select random questions
function getRandomQuestions(array, num) {
    const shuffled = array.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
}

// Display quiz question
function displayQuestion() {
    const questionElement = document.getElementById("question");
    const choicesElement = document.getElementById("choices");
    const progressElement = document.getElementById("progress");

    choicesElement.innerHTML = ''; // Clear previous choices
    const currentQuestion = selectedQuestions[currentQuestionIndex];
    if (!currentQuestion) return;

    questionElement.textContent = currentQuestion.question;
    currentQuestion.choices.forEach((choice, index) => {
        const choiceLabel = document.createElement("label");
        const choiceInput = document.createElement("input");
        choiceInput.type = "radio";
        choiceInput.name = "choice";
        choiceInput.value = index;
        choiceLabel.appendChild(choiceInput);
        choiceLabel.appendChild(document.createTextNode(choice));
        choicesElement.appendChild(choiceLabel);
        choicesElement.appendChild(document.createElement("br"));
    });

    // Update progress bar
    progressElement.textContent = `Question ${currentQuestionIndex + 1} of 10`;
}

// Submit quiz answer
function submitAnswer() {
    const selectedOption = document.querySelector('input[name="choice"]:checked');
    const resultElement = document.getElementById("result");

    if (!selectedOption) {
        resultElement.textContent = "Please select an answer.";
        return;
    }

    const selectedAnswer = parseInt(selectedOption.value);
    const currentQuestion = selectedQuestions[currentQuestionIndex];
    
    // Record the question, the correct answer, and the student's answer
    answerDetails.push({
        question: currentQuestion.question,
        choices: currentQuestion.choices,
        correctAnswer: currentQuestion.choices[currentQuestion.answer],
        selectedAnswer: currentQuestion.choices[selectedAnswer]
    });

    if (selectedAnswer === currentQuestion.answer) {
        score++;
        resultElement.textContent = "Correct!";
    } else {
        resultElement.textContent = "Incorrect.";
    }

    currentQuestionIndex++;
    if (currentQuestionIndex < selectedQuestions.length) {
        displayQuestion();
    } else {
        showResults();
    }
}

// Show results with correct answers and student choices
function showResults() {
    document.getElementById("quiz-container").style.display = "none";
    document.getElementById("results-container").style.display = "block";

    document.getElementById("score").textContent = `Your score is ${score} out of ${selectedQuestions.length}.`;

    const detailedResults = document.getElementById("detailed-results");
    detailedResults.innerHTML = ''; // Clear previous content

    answerDetails.forEach(detail => {
        const resultItem = document.createElement("div");
        resultItem.classList.add("result-item");

        resultItem.innerHTML = `
            <p><strong>Question:</strong> ${detail.question}</p>
            <p><strong>Your Answer:</strong> ${detail.selectedAnswer}</p>
            <p><strong>Correct Answer:</strong> ${detail.correctAnswer}</p>
        `;
        detailedResults.appendChild(resultItem);
    });
}

// Retake the same quiz
function retakeQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    answerDetails = [];
    document.getElementById("results-container").style.display = "none";
    document.getElementById("quiz-container").style.display = "block";
    displayQuestion();
}

// Load a new quiz with different questions
function loadNewQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    answerDetails = [];
    selectedQuestions = getRandomQuestions(questions, 10);
    document.getElementById("results-container").style.display = "none";
    document.getElementById("quiz-container").style.display = "block";
    displayQuestion();
}