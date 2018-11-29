let sessionId;

let chatSocket;

let voteData;

let curMessage;

var newQuestion;

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
        }else if(msgType == 'msgEdit'){
            modifyQuestion(message);
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
    
}

function renderQuestion(question) {
    clearPage();
    document.title = 'Question';
    let main = document.querySelector('main');

    let addQuestionButton = document.createElement('button');
	addQuestionButton.textContent = 'Add Question';
	addQuestionButton.style.margin = '10px';
	addQuestionButton.style.padding = '10px';
	addQuestionButton.onclick = function(){addQuestion(question, 'question')};
    main.appendChild(addQuestionButton);

    let modQuestionButton = document.createElement('button');
	modQuestionButton.textContent = 'Modify Question';
	modQuestionButton.style.margin = '10px';
	modQuestionButton.style.padding = '10px';
	modQuestionButton.onclick = function(){
        chatSocket.send(JSON.stringify({
            'message': '',
            'msgType': 'msgEdit'
        }));
    };
	main.appendChild(modQuestionButton);

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
    main.appendChild(answerSection);
    createNext('results');
}

function renderQueResults(question) {
    clearPage();
    document.title = 'Question Results';
    let main = document.querySelector('main');

    let modifyButton = document.createElement('button');
	modifyButton.textContent = 'Add Question';
	modifyButton.style.margin = '10px';
	modifyButton.style.padding = '10px';
	modifyButton.onclick = function(){addQuestion(question, 'results')};
	main.appendChild(modifyButton);

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

function modifyQuestion(question) {
    clearPage();
    document.title = 'Modify Question';
    let main = document.querySelector('main');

    let questionTextSection = document.createElement('section');
    let questionText = document.createElement('input');
    questionText.setAttribute('class', 'question-text');
    questionText.setAttribute('id', 'questionText')
    questionText.value = question.questionText;
    questionTextSection.appendChild(questionText);
    main.appendChild(questionTextSection);
    let answerSection = document.createElement('section');
    answerSection.setAttribute('class', 'answer-section');
    answerSection.setAttribute('id', 'answerSection');
    let labels = ['A','B','C','D','E','F'];
    let newData = [];
    for (let i = 0; i < question.answers.length && i < labels.length; i++) {
        newData.push(0);
        let answer = question.answers[i];
		let correctText = document.createElement('p');
		correctText.textContent = 'Correct Answer: ';
        let correct = answer.correct;
        let correctBox = document.createElement('input');
        correctBox.setAttribute('type', 'checkbox');
        if(correct){correctBox.checked = true};
        let points = answer.points;
        let pointEdit = document.createElement('input');
        pointEdit.setAttribute('type', 'number');
        pointEdit.value = points;
		let pointText = document.createElement('p');
		pointText.textContent = 'Answer Value: ';
        let label = labels[i];
        let answerBox = document.createElement('div');
        answerBox.setAttribute('class', 'answer-box');
        answerBox.setAttribute('value', label);
        let answerText = document.createElement('input');
        answerText.value = answer.text;
        answerBox.appendChild(answerText);
		answerBox.appendChild(correctText);
        answerBox.appendChild(correctBox);
		answerBox.appendChild(pointText);
        answerBox.appendChild(pointEdit);
        answerSection.appendChild(answerBox);
    }
    voteData = newData;
    let addAnswerButton = document.createElement('button');
    addAnswerButton.textContent = 'Add Answer';
    addAnswerButton.onclick = function(){
		let correctText = document.createElement('p');
		correctText.textContent = 'Correct Answer: ';
        let correctBox = document.createElement('input');
        correctBox.setAttribute('type', 'checkbox');
		let pointText = document.createElement('p');
		pointText.textContent = 'Answer Value: ';
        let pointEdit = document.createElement('input');
        pointEdit.setAttribute('type', 'number');
        pointEdit.value = 0;
        let answerBox = document.createElement('div');
        answerBox.setAttribute('class', 'answer-box');
        let answerText = document.createElement('input');
		answerText.setAttribute('placeholder','Type Answer Here');
        answerBox.appendChild(answerText);
		answerBox.appendChild(correctText);
        answerBox.appendChild(correctBox);
		answerBox.appendChild(pointText);
        answerBox.appendChild(pointEdit);
        answerSection.appendChild(answerBox);
    }
    main.appendChild(answerSection);
    let submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    submitButton.onclick = function(){
        answerSection = document.querySelector('#answerSection');
        questionText = document.querySelector('#questionText').value;
        newQuestion = {'questionText':questionText,
            'questionID': question['questionID'],
            'answers':[]
        }
        while(answerSection.firstChild){
            answer = answerSection.firstChild;
            answerSection.removeChild(answerSection.firstChild);
            let answerText = answer.firstChild.value;
            answer.removeChild(answer.firstChild);
            answer.removeChild(answer.firstChild);
            let correctBox = answer.firstChild.checked;
            answer.removeChild(answer.firstChild);
            answer.removeChild(answer.firstChild);
            let points = answer.firstChild.value;
            newQuestion['answers'].push({'answerText':answerText,
                'correct':correctBox,
                'points':points
            });
        }
        chatSocket.send(JSON.stringify({
            'message': newQuestion,
            'msgType': 'msgUpdate'
        }));
        newQuestion= '';
    }
    let cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.onclick = function(){ 
    	renderQuestion(question);	
    };
    let buttonSection = document.createElement('section');
    buttonSection.appendChild(addAnswerButton); 
	addAnswerButton.style.margin = '10px';
	addAnswerButton.style.padding = '10px';
    buttonSection.appendChild(submitButton); 
    buttonSection.appendChild(cancelButton);
	submitButton.style.margin = '10px';
	submitButton.style.padding = '10px';
    main.appendChild(buttonSection); 
}

function addQuestion(question, page) {
    clearPage();
    document.title = 'Add Question';
    let main = document.querySelector('main');

    let questionTextSection = document.createElement('section');
    let questionText = document.createElement('input');
    questionText.setAttribute('class', 'question-text');
    questionText.setAttribute('id', 'questionText')
	questionText.setAttribute('placeholder','Type Question Here');
    questionTextSection.appendChild(questionText);
    main.appendChild(questionTextSection);
    let answerSection = document.createElement('section');
    answerSection.setAttribute('class', 'answer-section');
    answerSection.setAttribute('id', 'answerSection');  
    let addAnswerButton = document.createElement('button');
    addAnswerButton.textContent = 'Add Answer';
    addAnswerButton.onclick = function(){
		let correctText = document.createElement('p');
		correctText.textContent = 'Correct Answer: ';
        let correctBox = document.createElement('input');
        correctBox.setAttribute('type', 'checkbox');
		let pointText = document.createElement('p');
		pointText.textContent = 'Answer Value: ';
        let pointEdit = document.createElement('input');
        pointEdit.setAttribute('type', 'number');
        pointEdit.value = 0;
        let answerBox = document.createElement('div');
        answerBox.setAttribute('class', 'answer-box');
        let answerText = document.createElement('input');
		answerText.setAttribute('placeholder','Type Answer Here');
        answerBox.appendChild(answerText);
		answerBox.appendChild(correctText);
        answerBox.appendChild(correctBox);
		answerBox.appendChild(pointText);
        answerBox.appendChild(pointEdit);
        answerSection.appendChild(answerBox);
    }
    main.appendChild(answerSection);
    let submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    submitButton.onclick = function(){
        
        answerSection = document.querySelector('#answerSection');
        questionText = document.querySelector('#questionText').value;
        newQuestion = {'questionText':questionText,
            'answers':[]
        }
        while(answerSection.firstChild){
            answer = answerSection.firstChild;
            answerSection.removeChild(answerSection.firstChild);
            let answerText = answer.firstChild.value;
            answer.removeChild(answer.firstChild);
            answer.removeChild(answer.firstChild);
            let correctBox = answer.firstChild.checked;
            answer.removeChild(answer.firstChild);
            answer.removeChild(answer.firstChild);
            let points = answer.firstChild.value;
            newQuestion['answers'].push({'answerText':answerText,
                'correct':correctBox,
                'points':points
            });
        }
        chatSocket.send(JSON.stringify({
            'message': newQuestion,
            'msgType': 'msgAdd'
        }));
        newQuestion= '';
    }
    let cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.onclick = function(){ 
    	if(page === 'question'){
    		renderQuestion(question);
    	}else if(page === 'results'){
    		renderQueResults(question);			
    	}
    };
    let buttonSection = document.createElement('section');
    buttonSection.appendChild(addAnswerButton); 
	addAnswerButton.style.margin = '10px';
	addAnswerButton.style.padding = '10px';
    buttonSection.appendChild(cancelButton);
	cancelButton.style.margin = '10px';
	cancelButton.style.padding = '10px';
    buttonSection.appendChild(submitButton); 
	submitButton.style.margin = '10px';
	submitButton.style.padding = '10px';
    main.appendChild(buttonSection); 
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

