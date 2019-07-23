// Adapted from elements of Charles Lohr's esp8266ws2812i2s project, 
// available at https://github.com/cnlohr/esp8266ws2812i2s

var colorsys = require("colorsys");
var express = require("express");
const dgram = require('dgram');
const config = require("./config.json");


const udpSocket = dgram.createSocket('udp4');
var app = express();
var pixels;

Startup();

function Startup(){
    const highLEDIdx = config.segments.reduce((maxLED,seg) => maxLED > seg.lastLED ? maxLED : seg.lastLED, 0);
    pixels = new Array(highLEDIdx + 1);
    fillBlack();
    app.listen(8888);
    app.get('/', (req, res) => res.send('Hello World!'));
};

app.get('/:segment/random', function(req,res) {
    var color = colorsys.random();
    res.send("<body style='background-color: "+color+";'>"+color+"</body>");
    var rgb = colorsys.hex2Rgb(color);
    fillSeg(req.params.segment, rgb);
    pushLEDs();
});

app.get('/:segment/rainbow', function(req,res) {
    res.send("rainbow fill");
    rainbow(req.params.segment, {h:0, s:100, v:50});
    pushLEDs();
});

app.get('/off', function(req,res) {
    fillBlack();
    res.send("sent off signal");
    pushLEDs();
});

function toByteArray(colors){
    var outArray = new Uint8Array( colors.length * 3);
    for (let i = 0; i < colors.length; i++){
        outArray[3 * i + 0] = colors[i].g;
        outArray[3 * i + 1] = colors[i].r;
        outArray[3 * i + 2] = colors[i].b;
    }
    console.log(outArray.length);
    return outArray;
}

function fillBlack() {
	pixels.fill({r: 0, g: 0, b:0});
};

function fillSeg(segName, colorRGB){
	var segment = getSeg(segName);
	for(ledIdx = segment.firstLED; ledIdx < segment.lastLED; ledIdx++){
		pixels[ledIdx] = colorRGB;
	}
}

function rainbow(segName, seedColor){
    if(!seedColor)
        seedColor = {h: Math.round(Math.random()*360), s:100, v:50};
    var segment = getSeg(segName);
    var segLen = (segment.lastLED - segment.firstLED + 1);
    for(ledIdx = segment.firstLED; ledIdx < segment.lastLED; ledIdx++){
        hue = Math.round(seedColor.h + (360/segLen)*(ledIdx-segment.firstLED)) % 360;
        console.log(ledIdx-segment.firstLED + "  " + hue);
        pixels[ledIdx] = colorsys.hsvToRgb({h: hue, s: seedColor.s, v: seedColor.v});
	}
}

// Finds the segment with the corresponding name
function getSeg(name) {
	return config.segments.find(x => x.name === name);
}

function pushLEDs(){
    udpSocket.send(
        toByteArray(pixels), //new Uint8Array([0,0,0, 255,0,0, 0,0,0, 0,255,0, 0,0,0, 0,0,255, 0,0,0]),
        config.port, 
        config.address, 
        (err) => { }
    );
}