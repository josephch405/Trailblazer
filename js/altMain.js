//GLOBALS
var colors = {
    "LINE": "#FFFFFF",
    "LINE2": "#A3A3A3",
    "GREEN": "#00FF00",
    "ORANGE": "#FFA500",
};
var lineStyle = ["solid 1px " + colors.LINE, "solid 1px " + colors.LINE2];
var botPartitionStyles = [{
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

var topPartitionStyles = [{
        'height': '50%'
    }, {
        'height': '60%',
    }, //style="top:60%; height:40%; border-top:solid 1px #E8E8E8;
    {
        'height': '70%',
    }
];

var testCard = [false, [false, false, true],
    [true],
    [false, [false, false, true], true, [false, false]]
];
var testCard2 = [false];


var rootNode = new TreeNode({ "name": "Japanese" });
rootNode.children[0] = new TreeNode({ "name": "Hiragana", "checked": true, parent: rootNode });

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
$('#cup_main').append(generateCardHTML(testCard2));
$('#cup_main').append(generateCardHTML(rootNode.generateCardStruct()));


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

function initRecurBotDiv(ref) {
    var txt = '';
    if (ref.length > 1) {
        txt += divHeadGen({}, botPartitionStyles[layer]);

        var topWidth = 100 / (ref.length - 1);
        var children = ref.slice(1);

        for (var i in children) {
            txt += recurseBottomDiv(children[i], 0, topWidth, i);
        }
        txt += '</div>';
    } else {
        txt += divHeadGen({ "class": "fade " + bToCClass(ref) }, {});
        txt += '</div>';
    }

    return txt;
}

function recurBottomDiv(ref, layer, topWidth, index) {
    if (typeof layer == 'undefined')
        layer = 0;

    var txt = '';

    var trueClass, iGEZero;
    if (ref === true)
        trueClass = bToCClass(true);
    else
        trueClass = bToCClass(ref[0]);
    if (index > 0) {
        iGEZero = true;
    }


    txt += divHeadGen({}, { "left": topWidth * index + '%', "width": topWidth + "%" });

    if (ref.length > 1) {
        if (iGEZero){

        }
        txt += divHeadGen({ "class": "fade " + trueClass }, topPartitionStyles[layer]:);
        txt += '</div>';

        var children = ref.slice(1);
        for (var i in children) {
            txt += recurseBottomDiv(children[i], layer + 1, 100 / (ref.length - 1), i);

            txt += '<div class = "fade ';

            if (i > 0) {
                txt += 'border-left:' + lineStyle[0] + ";";
            }

            txt += '">';
            txt += '</div>';
        }
        txt += '</div>';
    } else {
        txt += divHeadGen({ "class": "fade " + trueClass }, {});
        txt += '</div>';
    }

    txt += '</div>';
    return txt;
}
