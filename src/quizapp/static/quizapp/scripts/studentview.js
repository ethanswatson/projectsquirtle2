
var chatSocket;

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

var setWaiting = function(){

    document.querySelector('#waiting').style.visibility='visible';

    var main = document.querySelector('#main');

    while (main.firstChild){
        main.removeChild(main.firstChild);
    }

}

var setQuestionPage= function(data){

    var message = data['message'];
    //document.querySelector('#chat-log').value += (message + '\n');

    var image = document.querySelector('#waiting').style.visibility='hidden';
    
    var main = document.querySelector('#main');

    while (main.firstChild){
        main.removeChild(main.firstChild);
    }

    var article = document.createElement('article');
    main.appendChild(article);

    article.setAttribute('style', 'justify-content: flex-start; ');
    
    var question = document.createElement('h2');
    question.setAttribute('style', 'margin: 2%');
    question.textContent = message;
    
    article.appendChild(question);

    var section = document.createElement('section');
    for(i = 0; i < 4; i++){
        var answer = document.createElement('div');
        answer.setAttribute('class', 'answer-button');
        answer.setAttribute('style', 'width: 40%; padding: 20px;');
        //answer.setAttribute('onclick',"sendMessage(i)");

        answer.onclick = function(a) {
            return function () {
                sendMessage(a);
            };
        }(i);


        answer.textContent = "Answer number " + i;
        section.appendChild(answer);
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

