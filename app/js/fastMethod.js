'use strict';

//----------------------------------------------------------------------------------
// Speed-up LeapMotion
// Create the socket with event handlers
//----------------------------------------------------------------------------------

function handleLeapMotion(handler) {
    //Create and open the socket
    var ws = new WebSocket("ws://localhost:6437/");

    //On connection
    ws.onopen = function(event) {
    };

    //On new message
    ws.onmessage = function(event) {
        var obj = JSON.parse(event.data);
        if (obj) {
            if (obj.pointables) {
                if (obj.pointables[0]) {
                    handler(obj);
                }
            }
        }
    };

    //On socket close
    ws.onclose = function(event) {
        ws = null;
    }

    //On socket error
    ws.onerror = function(event) {
        alert("Received error");
    };
}
