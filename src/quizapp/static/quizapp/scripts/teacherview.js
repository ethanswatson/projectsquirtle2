// Dummy data. Will be replaced with data from websockets
// let quiz = {
//     quizName: 'Dummy Quiz',
//     questions: [
//         {
//             questionText: 'A Fake Question',
//             answers: [
//                 {
//                     id: 1,
//                     text:'Option 1'
//                 },
//                 {
//                     id: 2,
//                     text: 'Option 2'
//                 },
//                 {
//                     id: 3,
//                     text: 'Option 3'
//                 },
//                 {
//                     id: 4,
//                     text: 'Option 4'
//                 },
//                 {
//                     id: 5,
//                     text: 'Option 5'
//                 },
//                 {
//                     id: 6,
//                     text: 'Option 6'
//                 },
//             ]
//         }
//     ]
// }

// let users = ['user a', 'user b', 'user c', 'user d', 'user e', 'user f', 'user g', 'user h', 'user i', 'user j']

let sessionId;

let chatSocket;

let voteData;

let curMessage;

let connectToSocket = function (roomName) {
    sessionId = roomName;
    chatSocket = new WebSocket(
        'ws://' + window.location.host +
        '/ws/quizapp/host/' + roomName + '/');

    chatSocket.onmessage = function(e) {
        var data = JSON.parse(e.data);
        var message = data['message'];
        var msgType = data['msgType'];
        if (msgType=='msgJoin') {
            landingAddUser(message['userName']);
        } else if(msgType=='msgVote') {
            console.log(message['answerID']); //Testing to see if answerID comes through
            incrementVote(message['answerID']-1); //database values start at 1 instead of 0
        } else if(msgType == 'msgQuestion') {
            curMessage = message;
            renderQuestion(message);
        }
    };
        
    chatSocket.onclose = function(e) {
        console.error('Chat socket closed unexpectedly');
    };
};

function clearPage() {
    let main = document.querySelector('main');
    main.innerHTML = '';
}

function landingAddUser(username) {
    let userSection = document.querySelector('.user-section');
    let userText = document.createElement('p');
    userText.setAttribute('class', 'user-name-text');
    userText.textContent = username;
    userSection.appendChild(userText);
    
}

function requestNextQuestion() {
    chatSocket.send(JSON.stringify({
        'message': '',
        'msgType': 'msgNext'
    }));
}

function renderLanding(quizNameText) {
    clearPage();
    document.title = quizNameText;
    let main = document.querySelector('main');
    let quizNameSection = document.createElement('section');
    quizNameSection.setAttribute('class', 'quiz-name-section');
    let quizName = document.createElement('p');
    quizName.setAttribute('class', 'quiz-name-text');
    quizName.textContent = quizNameText;
    quizNameSection.appendChild(quizName);
    let sessionIdText = document.createElement('p');
    sessionIdText.setAttribute('class', 'session-id-text');
    sessionIdText.textContent = 'Session ID: ' + sessionId;
    quizNameSection.appendChild(sessionIdText);
    let startButton = document.createElement('button');
    startButton.setAttribute('class', 'start-quiz-btn');
    startButton.textContent = 'Start Quiz';
    startButton.onclick = requestNextQuestion;
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
    clearPage();
    document.title = 'Question';
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
    let newData = [];
    for (let i = 0; i < question.answers.length && i < labels.length; i++) {
        newData.push(0);
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
    voteData = newData;
    let modifyButton = document.createElement('button');
	modifyButton.textContent = 'Modify Quiz';
	modifyButton.onclick = modifyQuiz;
	//modifyButton.onclick = modifyQuiz(question);
	main.appendChild(modifyButton);
    main.appendChild(answerSection);
    createNext('results');
}

function renderQueResults(question) {
    clearPage();
    document.title = 'Question Results';
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
        answerText.textContent = label + ': ' + answer.text + ': ' + voteData[i];
        answerBox.appendChild(answerText);
        answerSection.appendChild(answerBox);
    }
    main.appendChild(answerSection);
    createNext('question');
}

function modifyQuiz(question){
    clearPage();
	document.title = 'Modify Quiz';
	let main = document.querySelector('main');
	
	let cancelButton = document.createElement('button');
	cancelButton.textContent = 'Cancel';
	cancelButton.onClick = renderQuestion;
	let addNextButton = document.createElement('button');
	addNextButton.textContent = 'Add Next Question';
	let addLastButton = document.createElement('button');
	addLastButton.textContent = 'Add Last Question';
    let buttonSection = document.createElement('section');
	buttonSection.appendChild(cancelButton);
	buttonSection.appendChild(addNextButton);
	buttonSection.appendChild(addLastButton);
	main.appendChild(buttonSection);
	
    let outerSection = document.createElement('section');

    let editSection = document.createElement('section');
	editSection.setAttribute('class', 'modify-box');

    let questionNameSection = document.createElement('section');
	questionNameSection.setAttribute('class', 'modify-box');
	
	let questionWrapper = document.createElement('p');
	let questionNameLabel = document.createElement('label');
	questionNameLabel.setAttribute('for', 'id_questionName');
	questionNameLabel.textContent = 'Question: ';
	let questionName = document.createElement('input');
	questionName.setAttribute('type', 'text');
	//questionName.setAttribute('class', 'input-size');
	questionName.setAttribute('id', 'id_questionName');
	questionWrapper.appendChild(questionNameLabel);
	questionWrapper.appendChild(questionName);

	let answerWrapper = document.createElement('p');
	let createAnswertxt = document.createElement('label');
	createAnswertxt.textContent = 'Create Answer: ';
	createAnswertxt.setAttribute('for', 'id_answerText');
	let answerText = document.createElement('input');
	answerText.setAttribute('type', 'text');
	answerText.setAttribute('id', 'id_answerText');
	
	let correctWrapper = document.createElement('p');
	let isCorrectLabel = document.createElement('label');
	isCorrectLabel.textContent = 'Correct Answer: ';
	isCorrectLabel.setAttribute('for', 'id_isCorrect');
	let isCorrect = document.createElement('input');
	isCorrect.setAttribute('type', 'checkbox');
	isCorrect.setAttribute('id', 'id_isCorrect');

	let valueWrapper = document.createElement('p');
	let valueLabel = document.createElement('label');
	valueLabel.textContent = 'Answer Value: ';
	valueLabel.setAttribute('for', 'id_value');
	let value = document.createElement('input');
	value.setAttribute('type', 'number');
	value.setAttribute('id', 'id_isCorrect');

	let addAnswerButton = document.createElement('button');
	addAnswerButton.textContent = 'Add Answer';

	//questionNameSection.appendChild(questionNameLabel);
	//questionNameSection.appendChild(questionName);
	questionNameSection.appendChild(questionWrapper);
	answerWrapper.appendChild(createAnswertxt);
	answerWrapper.appendChild(answerText);
	editSection.appendChild(answerWrapper);
	correctWrapper.appendChild(isCorrectLabel);
	correctWrapper.appendChild(isCorrect);
	editSection.appendChild(correctWrapper);
	valueWrapper.appendChild(valueLabel);
	valueWrapper.appendChild(value);
	editSection.appendChild(valueWrapper);
	editSection.appendChild(addAnswerButton);

	outerSection.appendChild(questionNameSection);
	outerSection.appendChild(editSection);
	main.appendChild(outerSection);

	let  = document.createElement('button');
}

function createNext( generateNext ) {
    let main = document.querySelector('main');
    let nextSection = document.createElement('section');
    nextSection.setAttribute('class', 'answer-section');

    let nextBox = document.createElement('div');
    nextBox.setAttribute('class', 'answer-button');
    nextBox.setAttribute('style', 'width: 10%; padding: 20px;');
    let nextText = document.createElement('p');
    nextText.textContent = "Next";
    nextBox.appendChild(nextText);
    nextSection.appendChild(nextBox);
    main.appendChild(nextSection);

    nextBox.onclick = function () {
        if (generateNext == 'results') {
            console.log("Function entered");
            renderQueResults(curMessage);
        }
        else {
            //Next Question
            requestNextQuestion();
        }
    }
}

function incrementVote( voteID ) {
    voteData[voteID] += 1;
}
