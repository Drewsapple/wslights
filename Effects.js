var colorsys = require("colorsys");

var Effects = module.exports = {}

function Effect(name, mode, functionalMap) {
    this.name = name
    this.mode = mode
    if(typeof functionalMap === 'function') {
        this.functionalMap = functionalMap 
    }
}

Effects.list = []

//Effect.prototype = Effect

Effects.Christmas = new Effect('Christmas', 'static', 
    function (colors) {
        var bandWidth = 3
        return colors.map( 
            function(color, index) {
                var mod = index % (bandWidth*3)
                return {
                    r: mod < bandWidth || mod >= 2*bandWidth ? 255 : 0,
                    g: mod < 2*bandWidth ? 255:0,
                    b: mod < bandWidth ? 255:0
                }
            }
        )
    }
)
Effects.list.push(Effects.Christmas)

Effects.HalfBrightness = new Effect('HalfBrightness', 'static', 
    function (colors) {
        return colors.map( 
            function(color, index) {
                var colorHSL = colorsys.rgbToHsl(color)
                colorHSL.l = colorHSL.l * .5
                return colorsys.hslToRgb(colorHSL)
            }
        )
    }
)
Effects.list.push(Effects.HalfBrightness)

Effects.Roll = new Effect('Roll', 'static',
    function (colors) {
        console.log(colors.length)
        var lastColor = colors.shift()
        colors.push(lastColor)
        console.log(colors.length)
        return colors
    }
)
Effects.list.push(Effects.Roll)

Effects.RandomColor = new Effect('RandomColor', 'static',
    function (colors) {
        var color = colorsys.hex2Rgb(colorsys.random())
        return colors.map( rgb => color)
    }
)
Effects.list.push(Effects.RandomColor)

Effects.Reverse = new Effect('Reverse', 'static',
    function (colors) {
        return colors.reverse()
    }
)
Effects.list.push(Effects.Reverse)

Effects.Dummy = new Effect('Dummy', 'static',
    function (colors) {
        return colors
    }
)
Effects.list.push(Effects.Dummy)


/**
 * Brightness effects taking a percentage
 * @param {*} name 
 * @param {*} mode 
 * @param {*} functionalMap 
 * @param {*} percentage 
 */
function BrightnessEffect(name, mode, functionalMap,  percentage) {
    Effect.call(this, name, mode, functionalMap)
    this.percentage = percentage
}
BrightnessEffect.prototype = Object.create(Effect.prototype)

Effects.PixelHalfBrightness = new BrightnessEffect("PixelHalfBrightness", "static", 
    function(colors) {
        return colors.map( rgb => colorsys.hslToRgb( colorsys.rgbToHsl(rgb)["l"]=255*this.percentage ))
    },
    .5
)
Effects.list.push(Effects.PixelHalfBrightness)