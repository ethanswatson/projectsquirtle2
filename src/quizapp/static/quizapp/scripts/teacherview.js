// Dummy data. Will be replaced with data from websockets
// let quiz = {
//     quizName: 'Dummy Quiz',
//     questions: [
//         {
//             questionText: 'A Fake Question',
//             answers: [
//                 {
//                     text:'Option 1'
//                     correct: true,
//                     points: 0
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

    let modifyButton = document.createElement('button');
	modifyButton.textContent = 'Modify Quiz';
	modifyButton.style.margin = '10px';
	modifyButton.style.padding = '10px';
	modifyButton.onclick = function(){addQuestion(question, 'question')};
	main.appendChild(modifyButton);

    let questionTextSection = document.createElement('section');
    let questionText = document.createElement('input');
    questionText.setAttribute('class', 'question-text');
    questionText.setAttribute('id', 'questionText')
    questionText.value = question.questionText;
    questionTextSection.appendChild(questionText);
    main.appendChild(questionTextSection);
    let answerSection = document.createElement('section');
    answerSection.setAttribute('class', 'answer-section');
    answerSection.setAttribute('id', 'answerSecion');
    let labels = ['A','B','C','D','E','F'];
    let newData = [];
    for (let i = 0; i < question.answers.length && i < labels.length; i++) {
        newData.push(0);
        let answer = question.answers[i];
        let correct = answer.correct;
        let correctBox = document.createElement('input');
        correctBox.setAttribute('type', 'checkbox');
        if(correct){correctBox.checked = true};
        let points = answer.points;
        let pointEdit = document.createElement('input');
        pointEdit.setAttribute('type', 'number');
        pointEdit.value = points;
        let label = labels[i];
        let answerBox = document.createElement('div');
        answerBox.setAttribute('class', 'answer-box');
        answerBox.setAttribute('value', label);
        let answerText = document.createElement('input');
        answerText.value = answer.text;
        answerBox.appendChild(answerText);
        answerBox.appendChild(correctBox);
        answerBox.appendChild(pointEdit);
        answerSection.appendChild(answerBox);
    }
    voteData = newData;
    let addAnswerButton = document.createElement('button');
    addAnswerButton.textContent = 'Add Answer';
    addAnswerButton.onclick = function(){
        let correctBox = document.createElement('input');
        correctBox.setAttribute('type', 'checkbox');
        let pointEdit = document.createElement('input');
        pointEdit.setAttribute('type', 'number');
        let answerBox = document.createElement('div');
        answerBox.setAttribute('class', 'answer-box');
        let answerText = document.createElement('input');
        answerBox.appendChild(answerText);
        answerBox.appendChild(correctBox);
        answerBox.appendChild(pointEdit);
        answerSection.appendChild(answerBox);
    }
    main.appendChild(answerSection);
    let submitButton = document.createElement('button');
    submitButton.textContent = 'submit';
    submitButton.onclick = function(){
        answerSection = document.querySelector('#answerSection');
        questionText = document.querySelector('#questionText');
        newQuestion = {'questionText':questionText,
         'answers':[]
        }
		//This is where the errors are happening
        while(answerSection.firstChild){
            answer = answerSection.firstChild;
            let answerText = answer.firstChild.textContent;
            answer.removeChild(answer.firstChild);
            let correctBox = answer.firstChild.checked;
            answer.removeChild(answer.firstChild);
            let points = answer.firstChild.value;
            newQuestion['answers'] += [{'answerText':answerText,
                'correct':correctBox,
                'points':points
            }]            
        }
        chatSocket.send(JSON.stringify({
            'message': newQuestion,
            'msgType': 'msgUpdate' //add question is msgAdd
        }));
        newQuestion= '';
    }
    main.appendChild(addAnswerButton); 
    main.appendChild(submitButton); 
}

function addQuestion(question, page) {
    clearPage();
    document.title = 'Add Question';
    let main = document.querySelector('main');

    let questionTextSection = document.createElement('section');
    let questionText = document.createElement('input');
    questionText.setAttribute('class', 'question-text');
    questionText.setAttribute('id', 'questionText')
    questionTextSection.appendChild(questionText);
    main.appendChild(questionTextSection);
    let answerSection = document.createElement('section');
    answerSection.setAttribute('class', 'answer-section');
    answerSection.setAttribute('id', 'answerSecion');  
    let addAnswerButton = document.createElement('button');
    addAnswerButton.textContent = 'Add Answer';
    addAnswerButton.onclick = function(){
        let correctBox = document.createElement('input');
        correctBox.setAttribute('type', 'checkbox');
        let pointEdit = document.createElement('input');
        pointEdit.setAttribute('type', 'number');
        let answerBox = document.createElement('div');
        answerBox.setAttribute('class', 'answer-box');
        let answerText = document.createElement('input');
        answerBox.appendChild(answerText);
        answerBox.appendChild(correctBox);
        answerBox.appendChild(pointEdit);
        answerSection.appendChild(answerBox);
    }
    main.appendChild(answerSection);
    let submitButton = document.createElement('button');
    submitButton.textContent = 'submit';
    submitButton.onclick = function(){
        answerSection = document.querySelector('#answerSection');
        questionText = document.querySelector('#questionText');
        newQuestion = {'questionText':questionText,
         'answers':[]
        }
        while(answerSection.firstChild){
            answer = answerSection.firstChild;
            let answerText = answer.firstChild.textContent;
            answer.removeChild(answer.firstChild);
            let correctBox = answer.firstChild.checked;
            answer.removeChild(answer.firstChild);
            let points = answer.firstChild.value;
            newQuestion['answers'] += [{'answerText':answerText,
                'correct':correctBox,
                'points':points
            }]            
        }
        chatSocket.send(JSON.stringify({
            'message': newQuestion,
            'msgType': 'msgAdd'
        }));
        newQuestion= '';
    	if(page === 'question'){
    		renderQuestion(question);
    	}else if(page === 'results'){
    		renderQueResults(question);			
    	}
    }
    main.appendChild(addAnswerButton); 
    let cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.onclick = function(){ 
    	if(page === 'question'){
    		renderQuestion(question);
    	}else if(page === 'results'){
    		renderQueResults(question);			
    	}
    };
    main.appendChild(cancelButton);
    main.appendChild(submitButton); 
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

            // function addQuestion(question, page){
            //     clearPage();
            // 	document.title = 'Modify Quiz';
            // 	let main = document.querySelector('main');
                
            // 	let cancelButton = document.createElement('button');
            // 	cancelButton.textContent = 'Cancel';
            // 	cancelButton.onclick = function(){ 
            // 		if(page === 'question'){
            // 			renderQuestion(question);
            // 		}else if(page === 'results'){
            // 			renderQueResults(question);			
            // 		}
            // 	};
            
            // 	let addButton = document.createElement('button');
            // 	addButton.textContent = 'Add Question';
            // 	addButton.onclick = function(){ 
            // 		if(page === 'question'){
            // 			renderQuestion(question);
            // 		}else if(page === 'results'){
            // 			renderQueResults(question);			
            // 		}
            // 	};
            //     let buttonSection = document.createElement('section');
            // 	buttonSection.appendChild(cancelButton);
            // 	buttonSection.appendChild(addButton);
            // 	main.appendChild(buttonSection);
                
            //     let outerSection = document.createElement('section');
            
            //     let editSection = document.createElement('section');
            // 	editSection.setAttribute('class', 'modify-box');
            
            //     let questionNameSection = document.createElement('section');
            // 	questionNameSection.setAttribute('class', 'modify-box');
                
            // 	let questionWrapper = document.createElement('p');
            // 	let questionNameLabel = document.createElement('label');
            // 	questionNameLabel.setAttribute('for', 'id_questionName');
            // 	questionNameLabel.textContent = 'Question: ';
            // 	let questionName = document.createElement('input');
            // 	questionName.setAttribute('type', 'text');
            // 	questionName.setAttribute('id', 'id_questionName');
            // 	questionWrapper.appendChild(questionNameLabel);
            // 	questionWrapper.appendChild(questionName);
            
            // 	let answerWrapper = document.createElement('p');
            // 	let createAnswertxt = document.createElement('label');
            // 	createAnswertxt.textContent = 'Create Answer: ';
            // 	createAnswertxt.setAttribute('for', 'id_answerText');
            // 	let answerText = document.createElement('input');
            // 	answerText.setAttribute('type', 'text');
            // 	answerText.setAttribute('id', 'id_answerText');
                
            // 	let correctWrapper = document.createElement('p');
            // 	let isCorrectLabel = document.createElement('label');
            // 	isCorrectLabel.textContent = 'Correct Answer: ';
            // 	isCorrectLabel.setAttribute('for', 'id_isCorrect');
            // 	let isCorrect = document.createElement('input');
            // 	isCorrect.setAttribute('type', 'checkbox');
            // 	isCorrect.setAttribute('id', 'id_isCorrect');
            
            // 	let valueWrapper = document.createElement('p');
            // 	let valueLabel = document.createElement('label');
            // 	valueLabel.textContent = 'Answer Value: ';
            // 	valueLabel.setAttribute('for', 'id_value');
            // 	let value = document.createElement('input');
            // 	value.setAttribute('type', 'number');
            // 	value.setAttribute('id', 'id_isCorrect');
            
            // 	let addAnswerButton = document.createElement('button');
            // 	addAnswerButton.textContent = 'Add Answer';
            
            // 	questionNameSection.appendChild(questionWrapper);
            // 	answerWrapper.appendChild(createAnswertxt);
            // 	answerWrapper.appendChild(answerText);
            // 	editSection.appendChild(answerWrapper);
            // 	correctWrapper.appendChild(isCorrectLabel);
            // 	correctWrapper.appendChild(isCorrect);
            // 	editSection.appendChild(correctWrapper);
            // 	valueWrapper.appendChild(valueLabel);
            // 	valueWrapper.appendChild(value);
            // 	editSection.appendChild(valueWrapper);
            // 	editSection.appendChild(addAnswerButton);
            
            // 	outerSection.appendChild(questionNameSection);
            // 	outerSection.appendChild(editSection);
            // 	main.appendChild(outerSection);
            
            // 	let  = document.createElement('button');
            // }
