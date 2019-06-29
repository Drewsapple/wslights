// Adapted from elements of Charles Lohr's esp8266ws2812i2s project, 
// available at https://github.com/cnlohr/esp8266ws2812i2s

var WebSocket = require("websocket").w3cwebsocket;
var sleep = require("sleep");

var ledConfiguration = { 
	address: "10.0.0.221",
	totalCount: 300,
	segments: [
		{
			direction: "up",
			firstLed: 1,
			lastLed: 120
		},
		{
			direction: "out",
			firstLed: 121,
			lastLed: 202,
			middleLed: 162
		},
		{
			direction: "down",
			firstLed: 203,
			lastLed: 300
		}
	]
};

var sock;
var numLEDs = 300;
var commsup = 0;

ConnectionHandler();

function StartWebSocket(target)
{
	var sock = new WebSocket(target);
	sock.binaryType = 'arraybuffer';
	sock.onopen = function(evt) { onOpen(evt) };
	sock.onclose = function(evt) { onClose(evt) };
	sock.onmessage = function(evt) { onMessage(evt) };
	sock.onerror = function(evt) { onError(evt) };

	return sock;
}

function ConnectionHandler()
{
	setTimeout( ConnectionHandler, 1000 );

	if(commsup == 0){
		sock = StartWebSocket("ws://10.0.0.221/d/ws/issue");
	}
}

function onOpen(msg){
	commsup = 1;
	//sock.send('e');
	console.log("WebSocket Connected");
	//sock.send(new Uint8Array([67,80,7,1,44]));
	/**
	while(true){
		for(var v = 0; v < 80; v+=1){
			customPattern(v);
			sleep.msleep(10);
		}
	}
	*/
}

function onMessage(msg){
	console.log(msg.data);
}

function onError(msg){
	console.log(msg.data);
}

function onClose(msg){
	commsup = 0;
	console.log("WebSocket Disconnected");
}

function customPattern(value){
	var wholeStripData = new Uint8Array(3 + numLEDs*3); // 3 bytes for command header, and 3 per led for the strip
	wholeStripData[0] = 'C'.charCodeAt();
	wholeStripData[1] = 'T'.charCodeAt();
	for(var i=3; i < numLEDs*3+3; i+= 3){
		wholeStripData[i] = value;
		wholeStripData[i+1] = value;
		wholeStripData[i+2] = value;
	}
	console.log(wholeStripData);
	sock.send(wholeStripData);
}

function getRGB()

var individualLedArray = new Array(ledConfiguration.totalCount);
individualLedArray.forEach(function(value,index){
	value = new Uint8ClampedArray(3);
	value[0] = getR()
});