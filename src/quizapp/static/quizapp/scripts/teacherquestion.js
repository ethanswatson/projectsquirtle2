// Dummy data. Will be replaced with data from websockets
let quiz = {
    quizName: 'Dummy Quiz',
    questions: [
        {
            questionText: 'A Fake Question',
            answers: [
                {
                    id: 1,
                    text:'Option 1'
                },
                {
                    id: 2,
                    text: 'Option 2'
                },
                {
                    id: 3,
                    text: 'Option 3'
                },
                {
                    id: 4,
                    text: 'Option 4'
                },
                {
                    id: 5,
                    text: 'Option 5'
                },
                {
                    id: 6,
                    text: 'Option 6'
                },
            ]
        }
    ]
}

let sessionId = 'AERTYF';

let users = ['user a', 'user b', 'user c', 'user d', 'user e', 'user f', 'user g', 'user h', 'user i', 'user j']

renderLanding(quiz, users);
// renderQuestion(quiz.questions[0]);

function landingAddUser(username) {
    let userSection = document.querySelector('.user-section');
    let userText = document.createElement('p');
    userText.setAttribute('class', 'user-name-text');
    userText.textContent = username;
    userSection.appendChild(userText);
    
}

function renderLanding(quiz, users) {
    let main = document.querySelector('main');
    let quizNameSection = document.createElement('section');
    quizNameSection.setAttribute('class', 'quiz-name-section');
    let quizName = document.createElement('p');
    quizName.setAttribute('class', 'quiz-name-text');
    quizName.textContent = quiz.quizName;
    quizNameSection.appendChild(quizName);
    let sessionIdText = document.createElement('p');
    sessionIdText.setAttribute('class', 'session-id-text');
    sessionIdText.textContent = 'Session ID: ' + sessionId;
    quizNameSection.appendChild(sessionIdText);
    let startButton = document.createElement('button');
    startButton.setAttribute('class', 'start-quiz-btn');
    startButton.textContent = 'Start Quiz';
    quizNameSection.appendChild(startButton);
    main.appendChild(quizNameSection);
    let userSection = document.createElement('section');
    userSection.setAttribute('class', 'user-section');
    main.appendChild(userSection);
    for (let i = 0; i < users.length; i++) {
        let username = users[i];
        landingAddUser(username);
    }
}

function renderQuestion(question) {
    let main = document.querySelector('main');
    let questionTextSection = document.createElement('section');
    let questionText = document.createElement('p');
    questionText.setAttribute('class', 'question-text');
    questionText.textContent = question.questionText;
    questionTextSection.appendChild(questionText);
    main.appendChild(questionTextSection);
    let answerSection = document.createElement('section');
    answerSection.setAttribute('class', 'answer-section');
    let labels = ['A','B','C','D','E','F'];
    for (let i = 0; i < question.answers.length && i < labels.length; i++) {
        let answer = question.answers[i];
        let label = labels[i];
        let answerBox = document.createElement('div');
        answerBox.setAttribute('class', 'answer-box');
        answerBox.setAttribute('value', label);
        let answerText = document.createElement('p');
        answerText.textContent = label + ': ' + answer.text;
        answerBox.appendChild(answerText);
        answerSection.appendChild(answerBox);
    }
    main.appendChild(answerSection);
}
