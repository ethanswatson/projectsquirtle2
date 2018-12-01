let sessionId;

let chatSocket;

let voteData;

let curMessage;
let nextMessage;
let dataVisPalette = ['#F1C40F', '#2DCC70', '#E77E23', '#3598DB', '#E84C3D', '#9B58B5'];
let voteCount = 0;
let fixedIMG = document.getElementById('squirtle-mug');
fixedIMG.style.height = '36px';
fixedIMG.style.width = '36px';
let fixedVoteBox = document.getElementById("overlay-vote-box");
//let fixedVoteText = document.createElement('overlay-text');
let overlayTextBox = document.createElement('overlay-text-box');
let voteText = document.createElement('overlay-text');
voteText.style.textAlign = 'center';
voteText.style.verticalAlign = 'middle';
voteText.style.height = '36px';
voteText.style.width = '36px';
overlayTextBox.appendChild(voteText);
overlayTextBox.style.height = '36px';
overlayTextBox.style.width = '36px';
fixedVoteBox.appendChild(fixedIMG);
voteText.textContent = voteCount;
fixedVoteBox.appendChild(overlayTextBox);


let newQuestion;

let quizTitle;


let connectToSocket = function (roomName, quizName) {
    sessionId = roomName;
    quizTitle = quizName;
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

            incrementVote();
        } else if(msgType == 'msgQuestion') {
            curMessage = message;
            renderQuestion(message);
        } else if(msgType == 'msgAnswerResults') { // Answer results
            renderQueResults(message);
        } else if(msgType == 'msgResults') { // Final results
            renderFinalPage(message);
        }else if(msgType == 'msgEdit'){
            modifyQuestion(message);
        }else if(msgType == 'msgStart'){
            renderLanding(quizTitle, message);

        }
    };
    
    chatSocket.onclose = function(e) {
        console.error('Chat socket closed unexpectedly');
    };

};

function requestPage(){
    chatSocket.send(JSON.stringify({
        'message': '',
        'msgType': 'msgRequestPage'
    }));
}

function clearPage() {
    let main = document.querySelector('main');
    main.innerHTML = '';
}

function clearOverlay() {
    let overlay = document.getElementById("overlay-vote-box");
    overlay.innerHTML = '';
}

function overlayHide() {
    let overlay = document.getElementById("overlay-vote-box");
    //let sessionIDText = document.getElementById("sessionID");
    //sessionIDText.style.visibility='hidden';
    overlay.style.visibility='hidden';
}

function overlayShow() {
    let overlay = document.getElementById("overlay-vote-box");
    //let sessionIDText = document.getElementById("sessionID");
    //sessionIDText.style.visibility='visible';
    overlay.style.visibility='visible';
}

function landingAddUser(username) {
    let userSection = document.querySelector('.user-section');
    let userText = document.createElement('p');
    userText.setAttribute('class', 'user-name-text');
    userText.textContent = username;
    userSection.appendChild(userText);
    
}

function setNextState() {
    chatSocket.send(JSON.stringify({
        'message': '',
        'msgType': 'msgNext'
    }));
}

function playRap(audio){
    audio.play();
}

function stopRap(audio){
    audio.pause();
    audio.currentTime = 0;
}

function renderLanding(quizNameText, users) {
    clearPage();
    overlayHide();
    let pokeRap = document.getElementById("pokeRap");
    playRap(pokeRap);
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
    startButton.onclick = function(){
        let buncha = document.getElementById("buncha");
        buncha.play();     
        stopRap(pokeRap);
        setNextState();
    }
    quizNameSection.appendChild(startButton);
    main.appendChild(quizNameSection);
    let userSection = document.createElement('section');
    userSection.setAttribute('class', 'user-section');
    for(let i = 0; i < users.length; i++){
        let userText = document.createElement('p');
        userText.setAttribute('class', 'user-name-text');
        userText.textContent = users[i];
        userSection.appendChild(userText);
    }
    main.appendChild(userSection);
    
}

function renderQuestion(question) {
    clearPage();
    //clearOverlay();
    overlayShow();
    voteCount = question.votes;
    voteText.textContent = voteCount;
    document.title = 'Question';
    let main = document.querySelector('main');

    let addQuestionButton = document.createElement('button');
	addQuestionButton.textContent = 'Add Question';
	addQuestionButton.style.margin = '10px';
	addQuestionButton.style.padding = '10px';
	addQuestionButton.onclick = function(){addQuestion()};
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
    createResultsButton();
}

function renderQueResults(message) {
    clearPage();
    overlayHide();
    document.title = 'Question Results';
    let main = document.querySelector('main');

    let addQuestionButton = document.createElement('button');
	addQuestionButton.textContent = 'Add Question';
	addQuestionButton.style.margin = '10px';
	addQuestionButton.style.padding = '10px';
	addQuestionButton.onclick = function(){addQuestion()};
    main.appendChild(addQuestionButton);

    let questionTextSection = document.createElement('section');
    let questionText = document.createElement('p');
    questionText.setAttribute('class', 'question-text');
    questionText.textContent = 'Question Results:';
    questionTextSection.appendChild(questionText);
    main.appendChild(questionTextSection);
    let answerSection = document.createElement('section');
    answerSection.setAttribute('class', 'result-section');
    let labels = ['A','B','C','D','E','F'];
    let questionArray = message.votes;
    let voteSum = sumOfArray(questionArray);
    for (let i = 0; i < message.votes.length && i < labels.length; i++) {
        let vote  = message.votes[i];
        let label = labels[i];
        let answerBox = document.createElement('div');
        answerBox.setAttribute('class', 'result-box-quater');
        answerBox.setAttribute('value', label);
        answerBox.style.backgroundColor = dataVisPalette[i];
        let answerText = document.createElement('p');
        answerText.textContent = label;
        answerBox.appendChild(answerText);
        answerSection.appendChild(answerBox);

        let queTextBox = document.createElement('div');
        queTextBox.setAttribute('class', 'result-box-half');
        let queText = document.createElement('p');
        queText.textContent = vote.answerText;
        queTextBox.appendChild(queText);
        answerSection.appendChild(queTextBox);

        let queVoteBox = document.createElement('div');
        queVoteBox.setAttribute('class', 'result-box-fifth');
        queVoteBox.style.backgroundColor = dataVisPalette[i];
        let queVoteText = document.createElement('p');
        queVoteText.textContent = vote.votes;
        queVoteBox.appendChild(queVoteText);
        answerSection.appendChild(queVoteBox);

        let quePercBox = document.createElement('div');
        quePercBox.setAttribute('class', 'result-box-fifth');
        quePercBox.style.backgroundColor = dataVisPalette[i];
        let quePercText = document.createElement('p');
        let percOfNum = (vote.votes / voteSum) * 100;
        quePercText.textContent = percOfNum.toFixed(2) + '%';
        quePercBox.appendChild(quePercText);
        answerSection.appendChild(quePercBox);
    }



    main.appendChild(answerSection);
    createNextUserPlacementsButton();
}

function renderFinalPage(question) {
    clearPage();
    document.title = 'Quiz Results';
    let main = document.querySelector('main');

    let addQuestionButton = document.createElement('button');
	addQuestionButton.textContent = 'Add Question';
	addQuestionButton.style.margin = '10px';
	addQuestionButton.style.padding = '10px';
	addQuestionButton.onclick = function(){addQuestion()};
    main.appendChild(addQuestionButton);

    let questionTextSection = document.createElement('section');
    let questionText = document.createElement('p');
    questionText.setAttribute('class', 'question-text');
    questionText.textContent = 'Top 5:';
    questionTextSection.appendChild(questionText);
    main.appendChild(questionTextSection);
    let topUsersSection = document.createElement('section');
    topUsersSection.setAttribute('class', 'topuser-section');
    let usersArray = question.users;
    let colorArray = ['gold', 'silver', '#cd7f32', 'white', 'white'];

    for (i=0; i < usersArray.length; i++) {
        let user = usersArray[i];
        let userScore = user.points;
        let userName = user.userID;

        let userPlaceBox = document.createElement('div');
        userPlaceBox.setAttribute('class', 'topuser-box-placement');
        userPlaceBox.style.backgroundColor = colorArray[i];
        let userPlaceText = document.createElement('p');
        userPlaceText.textContent = i+1;
        userPlaceBox.appendChild(userPlaceText);
        topUsersSection.appendChild(userPlaceBox);

        let userNameBox = document.createElement('div');
        userNameBox.setAttribute('class', 'topuser-box-name');
        let userNameText = document.createElement('p');
        userNameText.textContent = userName;
        userNameBox.appendChild(userNameText);
        topUsersSection.appendChild(userNameBox);

        let userScoreBox = document.createElement('div');
        userScoreBox.setAttribute('class', 'topuser-box-score');
        userScoreBox.style.backgroundColor = colorArray[i];
        let userScoreText = document.createElement('p');
        userScoreText.textContent = userScore;
        userScoreBox.appendChild(userScoreText);
        topUsersSection.appendChild(userScoreBox);
    }
    main.appendChild(topUsersSection);
    if (question.quizEnd == false) {
        createNextQueButton();
    }
    else {
        createEndQuizText();
    }
}

function modifyQuestion(question) {
    clearPage();
    overlayHide();
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
    	requestPage();	
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

function addQuestion(page) {
    clearPage();
    overlayHide()
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
    	requestPage();
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


function createNextQueButton() {
    let main = document.querySelector('main');
    let nextSection = document.createElement('section');
    nextSection.setAttribute('class', 'answer-section');

    let nextBox = document.createElement('div');
    nextBox.setAttribute('class', 'next-button');
    nextBox.setAttribute('style', 'width: 10%; padding: 20px;');
    let nextText = document.createElement('p');
    nextText.textContent = "Next Question";
    nextBox.appendChild(nextText);
    nextSection.appendChild(nextBox);
    main.appendChild(nextSection);

    nextBox.onclick = function () {
        setNextState();
    }
}

function createNextUserPlacementsButton() {
    let main = document.querySelector('main');
    let nextSection = document.createElement('section');
    nextSection.setAttribute('class', 'answer-section');

    let nextBox = document.createElement('div');
    nextBox.setAttribute('class', 'next-button');
    nextBox.setAttribute('style', 'width: 10%; padding: 20px;');
    let nextText = document.createElement('p');
    nextText.textContent = "User Placements";
    nextBox.appendChild(nextText);
    nextSection.appendChild(nextBox);
    main.appendChild(nextSection);

    nextBox.onclick = function () {
        setNextState();
    }
}

function createEndQuizText() {
    let main = document.querySelector('main');
    let nextSection = document.createElement('section');
    nextSection.setAttribute('class', 'answer-section');

    let nextBox = document.createElement('div');
    nextBox.setAttribute('class', 'next-button');
    nextBox.setAttribute('style', 'width: 10%; padding: 20px;');
    let nextText = document.createElement('p');
    nextText.textContent = "Quiz has ended!";
    nextBox.appendChild(nextText);
    nextSection.appendChild(nextBox);
    main.appendChild(nextSection);
}

function createResultsButton() {
    let main = document.querySelector('main');
    let nextSection = document.createElement('section');
    nextSection.setAttribute('class', 'answer-section');

    let nextBox = document.createElement('div');
    nextBox.setAttribute('class', 'next-button');
    nextBox.setAttribute('style', 'width: 10%; padding: 20px;');
    let nextText = document.createElement('p');
    nextText.textContent = "Go To Results";
    nextBox.appendChild(nextText);
    nextSection.appendChild(nextBox);
    main.appendChild(nextSection);

    nextBox.onclick = function () {
        setNextState();

    }
}

function incrementVote() {
    voteCount += 1;
    voteText.textContent = voteCount;
}

function sumOfArray(array) {
    let sum = 0;
    for (i = 0; i < array.length; i++)
    {
        sum += array[i].votes;
    }
    return sum;
}

