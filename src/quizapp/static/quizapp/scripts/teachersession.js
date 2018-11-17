var votes = 0;
var chatSocket;

var connectToSocket = function (roomName) {
    chatSocket = new WebSocket(
        'ws://' + window.location.host +
        '/ws/quizapp/host/' + roomName + '/');

    chatSocket.onmessage = function(e) {
        var data = JSON.parse(e.data);
        var message = data['message'];
        var msgType = data['msgType']
        if (msgType=='msgJoin') {
            document.querySelector('#log').value += message['userName'] + " has join the quiz\n";
        }else if(msgType=='msgVote') {
                votes++;
                document.getElementById("votes").innerHTML = "Votes: " + votes;
        }else if(msgType== 'msgNext'){
            document.querySelector('#log').value += message['questionText'] + '\n';
            answers = message['answers'];
            for(i = 0; i < answers.length; i++){
                document.querySelector('#log').value += answers[i]['text'] + ", ";
            }
            document.querySelector('#log').value += "\n";
        }
    };
        
    chatSocket.onclose = function(e) {
            console.error('Chat socket closed unexpectedly');
    };


    document.querySelector('#questionInput').focus();
    document.querySelector('#questionInput').onkeyup = function(e) {
    	if (e.keyCode === 13) {  // enter, return
		    document.querySelector('#questionInputSubmit').click();
	    }
    };



    document.querySelector('#questionInputSubmit').onclick = function(e) {
   	    var messageInputDom = document.querySelector('#questionInput');
        var message = messageInputDom.value;
	    chatSocket.send(JSON.stringify({
    		'message': message,
		    'msgType': 'msgNext'
	    }));

	    messageInputDom.value = '';
};

};