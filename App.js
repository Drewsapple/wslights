// Adapted from elements of Charles Lohr's esp8266ws2812i2s project, 
// available at https://github.com/cnlohr/esp8266ws2812i2s

var colorsys = require("colorsys");
var express = require("express");
var fs = require("fs");
const dgram = require('dgram');
var model = require("./Model")
var Effects = require("./Effects")

const configFile = fs.readFileSync("config.json");
const config = JSON.parse(configFile);
var groups = []
var devices = []
var segments = []

fs.readFile("groups.json", (err, data) => {
    if (err) {
        if(err.code === 'ENOENT'){
            fs.writeFile("groups.json", "[]", (err) => {if(err) throw err;});
        }
        else throw err;
    }
    groups = JSON.parse(data);
})

// dgram startup
const udpSocket = dgram.createSocket('udp4');
var app = express();


Startup();

function Startup(){
    for(device of config.devices){
        var pixelCount = device.segments.reduce((maxLED,seg) => maxLED > seg.lastLED ? maxLED : seg.lastLED, 0) // gets highest led index used on the device
        var newDev = new model.Device(device.name, device.address, device.port, pixelCount)
        device.pixels = new Array(pixelCount + 1)
        
        devices.push(newDev)
        for(seg of device.segments){
            var newSeg = new model.Segment(seg.name, seg.direction, seg.firstLED, seg.lastLED)
            newSeg.device = newDev
            segments.push(newSeg)
        }
        
    }
    app.listen(8888);
    app.use(express.static('public'));

    setInterval(pushLEDs, 30)
};

app.get('/:group/random', function(req,res) {
    var color = colorsys.random();
    res.send("<body style='background-color: "+color+";'>"+color+"</body>");
    var rgb = colorsys.hex2Rgb(color);
    fillGroup(req.params.group, rgb);
    pushLEDs();
});

app.get('/:group/eachRandom', function(req,res) {
    var group = getGroup(req.params.group);
    for(segment of group.segments) {
        segment.applyEffects([effectRandomColor,effectHalfBrightness])
    }
    res.status(200)
    res.send()
});

app.get('/off', function(req,res) {
    allOff();
    res.send("sent off signal");
    pushLEDs();
});

app.get('/:group/rainbow', function(req,res) {
    var group = getGroup(req.params.group)
    for(segment of group.segments){
        rainbow(segment, {h:0, s:100, l:50});
        segment.applyEffects([
            Effects.HalfBrightness,
            Effects.Reverse
        ])
    }
    res.status(200)
    res.send()
    pushLEDs()
});

app.get('/:group/christmas', function(req,res) {
    var group = getGroup(req.params.group)
    for(segment of group.segments){
        segment.applyEffects([
            Effects.Christmas,
            Effects.HalfBrightness
        ])
    }
    res.status(200)
    res.send()
});

app.get('/:group/roll', function(req,res) {
    var group = getGroup(req.params.group)
    for(segment of group.segments){
        segment.applyEffects([
            Effects.Roll
        ])
    }
    res.status(200)
    res.send()
});

app.get('/generic/:group/:effect', function(req,res) {
    var group = getGroup(req.params.group)
    for(segment of group.segments){
        let effect = Effects.list.find((effect) => effect.name == req.params.effect )
        segment.applyEffects([
            effect
        ])
    }
    res.status(200)
    res.send()
});

app.get("/segments", function(req,res) {
    var segList = segments.reduce( (segList, seg) => segList.concat(seg.name), []);
    res.send(segList);
});

app.get("/:device/info", function(req,res) {
    var device = devices.find((device) => device.address == req.params.device)
    res.send(device)
})

app.get("/devices", function(req,res) {
    res.status(200)
    res.send(devices)
})

app.get("/groups", function(req,res) {
    res.status(200)
    res.send(groups)
})

app.get("/newGroup", function(req, res) {
    groups.push({
        name: req.query.name,
        segments: req.query.segments.map( name => segments.find(x => x.name === name))
    })
    res.status(204); // Set "no content" status
    res.send();
});

function toByteArray(colors){
    var outArray = new Uint8Array( colors.length * 3);
    for (let i = 0; i < colors.length; i++){
        if(colors[i] != null){
            outArray[3 * i + 0] = colors[i].g;
            outArray[3 * i + 1] = colors[i].r;
            outArray[3 * i + 2] = colors[i].b;
        }
        else{
            outArray[3 * i + 0] = 0;
            outArray[3 * i + 1] = 0;
            outArray[3 * i + 2] = 0;
        }
    }
    return outArray;
}

function allOff(){
    for(seg of segments){
        fillBlack(seg.name);
        clearInterval(seg.currentMode);
    }
}

function fillBlack(groupName) {
    fillGroup(groupName, {r: 0, b: 0, g: 0});
}

function fillGroup(groupName, colorRGB){
    var group = getGroup(groupName);
    for(segment of group.segments){
        segment.setLeds( segment.getLeds().map( (color, index) => colorRGB))
    }
}

function rainbow(segment, seedColor){
    if(!seedColor)
        seedColor = {h: Math.round(Math.random()*360), s:100, v:50};
    var colors = segment.getLeds().map( function(color, index) {
        hue = Math.round(seedColor.h + (360/segment.getLength() * index)) % 360
        return colorsys.hslToRgb({h: hue, s: seedColor.s, l: seedColor.l})
    })
    segment.setLeds(colors)
}

// Finds the group with the corresponding name
function getGroup(name) {
    var seg = segments.find(x => x.name === name)
    if(seg){
        return {name: seg.name+"_segment", segments: [seg]}
    }
    else {
        var group = groups.find(x => x.name === name)
        // console.log("Found Group from ")
        // console.log(groups)
        // console.log(group)
        group.segments = group.segments.map( segment => segments.find(x => x.name === segment.name), group)
        return group
    }
}

function pushLEDs(){
    for(device of devices){
        udpSocket.send(
            toByteArray(device.pixels), 
            device.port, 
            device.address, 
            (err) => { }
        );
        //console.log(device.address + ": \n" + device.pixels.map( color => "#" + color.r.toString(16) + color.g.toString(16) + color.b.toString(16) ));
    }
}


/**
 * OLD CODE BELOW
 */

// // Finds the segment with the corresponding name
// function getSeg(name) {
// 	return segments.find(x => x.name === name);
// }

// function seizureLEDs(rate, segName){
//     var seg = getSeg(segName);
//     clearInterval(seg.currentMode);
//     seg.currentMode = setInterval( function (){
//         fillSeg(segName, colorsys.hex2Rgb(colorsys.random()));
//         pushLEDs();
        
//     }, 
//     1000/rate);
// }