
var chatSocket;


var setstart = function(username){

    document.querySelector('#waiting').style.display='block';

    var main = document.querySelector('#main');

    while (main.firstChild){
        main.removeChild(main.firstChild);
    }

    var waitMessage = document.createElement('h2');
    waitMessage.setAttribute('style', 'margin: 5%');
    waitMessage.textContent = "Please wait for the quiz to start. " + username;
    main.appendChild(waitMessage);

}


var connectToSocket = function(roomName){
	chatSocket = new WebSocket(
		'ws://' + window.location.host +
		'/ws/quizapp/' + roomName + '/');

	chatSocket.onmessage = function(e) {
        	var data = JSON.parse(e.data);

		if (data['msg_type']=='0') {
            setQuestionPage(data);
		}
	};

	chatSocket.onclose = function(e) {
        	console.error('Chat socket closed unexpectedly');
    };
}

var sendusername = function(username){
    chatSocket.send(JSON.stringify({
        'message': username,
        'msg_type': '2'
    }));
    setstart(username);
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

    var message = JSON.parse(data['message']);
    var questionText = message['questionText'];
    var answers = message['answers'];

    //document.querySelector('#chat-log').value += (message + '\n');

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
        //answer.setAttribute('onclick',"sendMessage(i)");

        answerdiv.onclick = function(a) {
            return function () {
                sendMessage(a);
            };
        }(i);


        answerdiv.textContent = answers[i]['text'];
        //answerdiv.setAttribute('value', answer[i]['id'])
        section.appendChild(answerdiv);
    }
    article.appendChild(section);

}

var sendMessage = function(message){
   
    console.log(message);
    chatSocket.send(JSON.stringify({
        'message': message,
        'msg_type': '1'
    }));
    setWaiting();
    
}

