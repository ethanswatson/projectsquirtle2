// Dummy data. Will be replaced with data from websockets
let question = {
    questionText: 'A Fake Question',
    answers: [
        {
            text:'Option 1'
        },
        {
            text: 'Option 2'
        },
        {
            text: 'Option 3'
        },
        {
            text: 'Option 4'
        },
        {
            text: 'Option 5'
        },
        {
            text: 'Option 6'
        },
    ]
}

renderQuestion(question);

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
