
var chatSocket;

var userName;

var connectToSocket = function(roomName){
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
            wasAccepted(data)
        }
	};

	chatSocket.onclose = function(e) {
        	console.error('Chat socket closed unexpectedly');
    };
}

var wasAccepted = function(data){
    if(data['message'] == 'Accepted'){
        setStart(userName);
    }else if(data['message'] == 'Taken'){
        window.alert("That username is already taken. Please choose another username.");
    }
}

var sendusername = function(user_name, roomName){
    userName = user_name;
    chatSocket.send(JSON.stringify({
        'message':  JSON.stringify({
                    'userName': userName,
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
    console.log(answerID);
    console.log(userName);
   
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

var setStart = function(userName){

    document.querySelector('#waiting').style.display='block';

    var main = document.querySelector('#main');

    while (main.firstChild){
        main.removeChild(main.firstChild);
    }

    var waitMessage = document.createElement('h2');
    waitMessage.setAttribute('style', 'margin: 5%');
    waitMessage.textContent = "Please wait for the quiz to start. " + userName;
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

    var top = document.createElement('p');
    top.textContent = "Final Results";

    main.appendChild(top);

    for(i = 0; i < users.length; i++){
        var userScore = document.createElement('p');
        userScore.textContent = users[i]['username'] + ": " + users[i]['score'];
        main.appendChild(userScore);
    }

    var currentUser = document.createElement('p');
        currentUser.textContent = "Your score was: " + currentUserScore;
        main.appendChild(currentUser);
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

    var correct = document.createElement('p');
    var points = document.createElement('p');
    var total = document.createElement('p');

    correct.textContent = answerCorrect;
    points.textContent = "Earned Points: " + answerPointValue;
    total.textContent = "Total Points: " + userTotalScore;

    main.appendChild(correct);
    main.appendChild(points);
    main.appendChild(total);
}
