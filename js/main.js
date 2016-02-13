//GLOBALS
var colors = {
    "LINE": "#FFFFFF",
    "LINE2": "#A3A3A3",
    "GREEN": "#00FF00",
    "ORANGE": "#FFA500",
};
var lineStyle = ["solid 1px " + colors.LINE, "solid 1px " + colors.LINE2];
var partitionStyles = [{
        'top': '50%',
        'height': '50%'
    }, {
        'top': '60%',
        'height': '40%',
        'border-top': lineStyle[0]
    }, //style="top:60%; height:40%; border-top:solid 1px #E8E8E8;
    {
        'top': '70%',
        'height': '30%',
        'border-top': lineStyle[0]
    }
];

var testCard = [false, 
    [false, false, true],
    [true],
    [false, [false, false, true], true, [false, false]]
];


var id = 0;
var name = "Japanese";

function generateCardHTML(ref) {
    var text = '<div id = "card_' + id + '" class="inline card">';

    //top div
    text += '<div style="height:50%; border-bottom: ' + lineStyle[1] + '; box-shadow: 0px 2px 2px -2px; z-index: 3">';
    text += '<div style="text-align:center; padding-top:6%; width:80%;">' + name + '</div>';
    text += '<div style="text-align:center; width:20%; left:80%; border-left: ' + lineStyle[1] + '">';
    text += '<div class = "fade but_ok" style="height:50%; border-bottom:' + lineStyle[1] + '"></div>';
    text += '<div class = "fade but_ed" style="top: 50%; height:25%; border-bottom:' + lineStyle[1] + '"></div>';
    text += '<div class = "fade but_del" style="top: 75%; height:25%""></div>';
    text += '</div>';
    text += '</div>';

    text += recurseBottomDiv(ref);

    return text;
}



$('#cup_main').append(generateCardHTML(testCard));


function CardHandler() {
    var name, parent, children, checked;

}

function divHeadGen(params, styleParams) {
    var text = "<div";
    var paramList = ["id", "class"];
    var styleParamList = ["top", "bottom", "left", "right", "height", "width", "background-color", "border-top", "border-bottom", "border-left", "border-right"];

    if (params) {
        for (var i in paramList) {
            if (params[paramList[i]]) {
                text += " " + paramList[i] + " = " + params[paramList[i]];
            }
        }
    }

    if (styleParams) {
        text += " style = '";
        for (var i in styleParamList) {
            if (styleParams[styleParamList[i]]) {
                text += styleParamList[i] + ": " + styleParams[styleParamList[i]] + ";";
            }
        }
        text += "'";
    }
    text += ">";
    return text;
}

function boolToCol(ticked) {
    if (ticked) {
        return colors.GREEN;
    }
    return colors.ORANGE;
}

function bToCClass(ticked) {
    if (ticked) {
        return 'but_green';
    }
    return 'but_orange';
}

function recurseBottomDiv(ref, layer) {
    if (typeof layer == 'undefined')
        layer = 0;

    var txt = '';

    if (ref.length > 1) {
        txt += divHeadGen({}, partitionStyles[layer]);
        var topWidth = 100 / (ref.length - 1);
        var children = ref.slice(1);
        for (var i in children) {
            txt += '<div class = "fade ';
            if(children[i] == true)
                txt += bToCClass(true);
            else
                txt += bToCClass(children[i][0]);
            txt += '"';
            txt += ' style="left: ' + topWidth * i + '%; ';
            txt += 'width:' + topWidth + '%; ';
            
            if (i > 0) {
                txt += 'border-left:' + lineStyle[0];
            }
            txt += '">';
            txt += recurseBottomDiv(children[i], layer + 1);
            txt += '</div>';
        }
        txt += '</div>';
    }

    return txt;
}
