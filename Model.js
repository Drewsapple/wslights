function Segment(name, direction, firstLED, lastLED) {
    this.name = name
    this.direction = direction
    this.firstLED = firstLED
    this.lastLED = lastLED
    this.device
}

Segment.prototype = new Segment;

Segment.prototype.getLeds = function() {
    var returnArray = []
    for(var i = this.firstLED; i <= this.lastLED; i++){
        returnArray.push(this.device.pixels[i])
    }
    return returnArray
}
Segment.prototype.setLeds = function(ledArray) {
    for(var i = 0; i < ledArray.length; i++) {
        this.device.pixels[this.firstLED+i] = ledArray[i]
    }
    // ledArray.forEach( function (color,index) {
    //     this.device.pixels[seg.firstLed+index-1] = color//{color.r, color.b, color.g}
    // })
}
Segment.prototype.getLength = function() {
    return (this.lastLED - this.firstLED + 1);
}
Segment.prototype.applyEffects = function(effects) {
    for( effect of effects){
        console.log(effect)
        console.log("Applying effect: " + effect.name + " [" + effect.mode + "]")
        this.setLeds(effect.functionalMap(this.getLeds()))
    }
}

/**
 * Device Object
 * @param {*} name
 * @param {*} address 
 * @param {*} port 
 * @param {*} pixelCount 
 */
function Device(name, address, port, pixelCount) {
    this.name = name
    this.address = address
    this.port = port
    this.pixels = new Array(pixelCount + 1)
    this.pixels.fill({r: 0, b: 0, g:0})
}

Device.prototype = Device;

module.exports = {
    Segment, Device
}  