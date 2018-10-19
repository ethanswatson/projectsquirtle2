
var accountSocket = new WebSocket(
    'ws://' + window.location.host +
    '/ws/accounts/profile/'
);

accountSocket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
};

accountSocket.onmessage = function(e) {
}

