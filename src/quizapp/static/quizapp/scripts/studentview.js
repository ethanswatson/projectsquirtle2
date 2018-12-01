
var chatSocket;

var userName;

var roomName

var connectToSocket = function(newRoomName){
    roomName = newRoomName
	chatSocket = new WebSocket(
		'ws://' + window.location.host +
		'/ws/quizapp/client/' + roomName + '/');

	chatSocket.onmessage = function(e) {
        var data = JSON.parse(e.data);
        var msgType = data['msgType'];


		if (msgType == 'msgQuestion') {
            setQuestionPage(data);
		}else if(msgType == 'msgResults'){
            setResults(data);
        }else if(msgType == 'msgAnswerResult'){
            setAnswerResult(data);
        }else if(msgType == 'msgUserName'){
            wasAccepted(data);
        }else if(msgType == 'msgRequestUserName'){
            requestUserName();
        }else if (msgType == 'msgStart'){
            setStart();
        }else if (msgType == 'msgWaiting'){
            setWaiting();
        }
	};

	chatSocket.onclose = function(e) {
        	console.error('Chat socket closed unexpectedly');
    };
}



var requestUserName = function(){
 
    document.querySelector('#waiting').style.display='none';

    var main = document.querySelector('#main');

    while (main.firstChild){
        main.removeChild(main.firstChild);
    }

    var div = document.createElement('div');
    div.setAttribute('class', 'boxcenter');

    var section = document.createElement('section');
    section.setAttribute('class','join-quiz-form');

    var article = document.createElement('article');
    article.setAttribute('class','session-id-section');
    article.setAttribute('style', 'align-items: center');

    var h2 = document.createElement('h2');
    h2.textContent = 'Please enter a username.';

    var text = document.createElement('input');
    text.setAttribute('type', 'test');
    text.setAttribute('id', 'userName');
    text.setAttribute('class', 'session-id');
    text.setAttribute('style','size: 10;');

    var button = document.createElement('input');
    button.setAttribute('type','button');
    button.setAttribute('value', 'Submit');
    button.setAttribute('class', 'submit-btn');
    button.setAttribute('style','width: 150px;');
    button.setAttribute('onclick', 'sendusername()');
    text.onkeyup = function(e) {
    	if (e.keyCode === 13) {  // enter, return
		    button.click();
	    }
    };

    main.appendChild(div);
    div.appendChild(section);
    section.appendChild(article);
    article.appendChild(h2);
    article.appendChild(text);
    article.appendChild(button);

}

var wasAccepted = function(data){
    if(data['message']['accepted'] == true){
        userName = data['message']['userName'];
    }else if(data['message']['accepted'] == false){
        window.alert("That username is already taken. Please choose another username.");
    }
}

var sendusername = function(){
    var newUserName = document.querySelector('#userName').value
    chatSocket.send(JSON.stringify({
        'message':  JSON.stringify({
                    'userName': newUserName,
                    'roomName': roomName
                    }),             
        'msgType': 'msgJoin'
    }));
}

var setWaiting = function(){

    document.querySelector('#waiting').style.display='block';

    var main = document.querySelector('#main');

    while (main.firstChild){
        main.removeChild(main.firstChild);
    }

    var thankYouMessage = document.createElement('h2');
    thankYouMessage.setAttribute('style', 'margin: 5%');
    thankYouMessage.textContent = "Thanks you answering! Please wait for the next question.";
    main.appendChild(thankYouMessage);

}

var setQuestionPage= function(data){
    var message = data['message'];
    var questionText = message['questionText'];
    var answers = message['answers'];

    var image = document.querySelector('#waiting').style.display='none';
    
    var main = document.querySelector('#main');

    while (main.firstChild){
        main.removeChild(main.firstChild);
    }

    var article = document.createElement('article');
    main.appendChild(article);

    article.setAttribute('style', 'justify-content: flex-start; ');
    
    var question = document.createElement('h2');
    question.setAttribute('style', 'margin: 3%');
    question.textContent = questionText;
    
    article.appendChild(question);

    var section = document.createElement('section');
    for(i = 0; i < answers.length; i++){
        var answerdiv = document.createElement('div');
        answerdiv.setAttribute('class', 'answer-button');
        answerdiv.setAttribute('style', 'width: 40%; padding: 20px;');
        answerdiv.onclick = function(a) {
            return function () {
                sendMessage(a);
            };
        }(answers[i]['id']);

        answerdiv.textContent = answers[i]['text'];
        section.appendChild(answerdiv);
    }
    article.appendChild(section);

}

var sendMessage = function(answerID){
   
    message = JSON.stringify({
            'answerID': answerID,
            'userID': userName
        })
    chatSocket.send(JSON.stringify({
        'message': message,
        'msgType': 'msgVote'
    }));
    setWaiting();
    
}

var setStart = function(){

    document.querySelector('#waiting').style.display='block';

    var main = document.querySelector('#main');

    while (main.firstChild){
        main.removeChild(main.firstChild);
    }
  
    var waitMessage = document.createElement('h2');
    waitMessage.setAttribute('style', 'margin: 5%');
    waitMessage.textContent = "Please wait for the quiz to start.";
    
    main.appendChild(waitMessage);
}


var setResults = function(data){
    var message = JSON.parse(data['message']);
    var currentUserScore = message['currentUserScore'];
    var users = message['users'];

    document.querySelector('#waiting').style.display='none';

    var main = document.querySelector('#main');

    while (main.firstChild){
        main.removeChild(main.firstChild);
    }

    let questionTextSection = document.createElement('section');
    var top = document.createElement('p');
    top.setAttribute('class', 'question-text');
    top.textContent = "Top 5:";
    questionTextSection.appendChild(top);
    main.appendChild(questionTextSection);

    let topUsersSection = document.createElement('section');
    topUsersSection.setAttribute('class', 'topuser-section');
    let usersArray = data.users;
    console.log(users);
    console.log(usersArray);
    let colorArray = ['gold', 'silver', '#cd7f32', 'white', 'white'];
    for(i = 0; i < users.length; i++){

        let user = users[i];
        console.log(user);
        let userScore = user.points;
        console.log(userScore);
        let userName = user.userID;
        console.log(userName);

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

    let currentUserBox = document.createElement('section');
    var currentUser = document.createElement('p');
    currentUser.setAttribute('class', 'question-text');
    currentUser.textContent = "Your score was: " + currentUserScore;
    currentUserBox.appendChild(currentUser);
    main.appendChild(currentUserBox);
}


var setAnswerResult = function(data){
    var message = JSON.parse(data['message']);
    var answerCorrect = message['answerCorrect'];
    var answerPointValue = message['answerPointValue'];
    var userTotalScore = message['userTotalScore'];

    var main = document.querySelector('#main');

    while (main.firstChild){
        main.removeChild(main.firstChild);
    }

    let correctSection = document.createElement('section');
    let pointSection = document.createElement('section');

    correctSection.setAttribute('class', 'topuser-section');
    pointSection.setAttribute('class', 'topuser-section');

    let correctBox = document.createElement('div');
    let pointEarnedTextBox = document.createElement('div');
    let pointEarnedValueBox = document.createElement('div');
    let pointTotalTextBox = document.createElement('div');
    let pointTotalValueBox = document.createElement('div');

    correctBox.setAttribute('class', 'full-box');
    pointEarnedTextBox.setAttribute('class', 'point-box-text');
    pointEarnedValueBox.setAttribute('class', 'point-box-value');
    pointTotalTextBox.setAttribute('class', 'point-box-text');
    pointTotalValueBox.setAttribute('class', 'point-box-value');

    if(answerCorrect) {
        correctBox.style.backgroundColor = '#77dd77';
    } else{
        correctBox.style.backgroundColor = '#ff6961';
    }

    var correct = document.createElement('p');
    var pointsText = document.createElement('p');
    var pointsValue = document.createElement('p');
    var totalText = document.createElement('p');
    var totalValue = document.createElement('p');

    if(answerCorrect) {
        correct.textContent = 'True';
    } else{
        correct.textContent = 'False';
    }

    pointsText.textContent = "Earned Points: ";
    pointsValue.textContent = answerPointValue;
    totalText.textContent = "Total Points: ";
    totalValue.textContent = userTotalScore;

    correctBox.appendChild(correct);
    pointEarnedTextBox.appendChild(pointsText);
    pointEarnedValueBox.appendChild(pointsValue);
    pointTotalTextBox.appendChild(totalText);
    pointTotalValueBox.appendChild(totalValue);

    correctSection.appendChild(correctBox);
    pointSection.appendChild(pointEarnedTextBox);
    pointSection.appendChild(pointEarnedValueBox);
    pointSection.appendChild(pointTotalTextBox);
    pointSection.appendChild(pointTotalValueBox);

    main.appendChild(correctSection);
    main.appendChild(pointSection);
}
