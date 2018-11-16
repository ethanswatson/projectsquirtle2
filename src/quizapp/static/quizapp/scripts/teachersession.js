var voteA = 0;
var voteB = 0;
var voteC = 0;
var voteD = 0;
var chatSocket;

var connectToSocket = function (roomName) {
    chatSocket = new WebSocket(
        'ws://' + window.location.host +
        '/ws/quizapp/host/' + roomName + '/');

    chatSocket.onmessage = function(e) {
        var data = JSON.parse(e.data);
        var message = data['message'];
        if (data['msgType']=='msgJoin') {
            
            document.querySelector('#log').value += message['userName'] + " has join the quiz\n";
        }
        if (data['msgType']=='msgVote') {
            answerID = message['answerID']
            if (answerID == '0') {
                voteA +=1;
                document.getElementById("dispVoteA").innerHTML = "Votes for A: " + voteA;
            }
            if (answerID == '1') {
                voteB +=1;
                document.getElementById("dispVoteB").innerHTML = "Votes for B: " + voteB;
            }
            if (answerID == '2') {
                voteC +=1;
                document.getElementById("dispVoteC").innerHTML = "Votes for C: " + voteC;
            }
            if (answerID == '3') {
                voteD +=1;
                document.getElementById("dispVoteD").innerHTML = "Votes for D: " + voteD;
            }
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
   	    var messageInputDom = document.querySelector('#questionInputSubmit');
        var message = messageInputDom.value;
        console.log("pressed send");
	    chatSocket.send(JSON.stringify({
    		'message': message,
		    'msgType': 'msgQuestion'
	    }));

	    messageInputDom.value = '';
};

};