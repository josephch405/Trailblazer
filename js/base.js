/**
 * BASE.js
 * for (more or less) independent functions
 */

/**
 * MISC
 * Generates and returns a <div> head based on params
 * Params selected according to internal array
 * @param  {object} params      class, id, title
 * @param  {object} styleParams style properties
 * @return {String}             returns the div head
 */
divHeadGen = function(params, styleParams) {
    var text = "<div";
    var paramList = ["id", "class", "title"];
    var styleParamList = ["top", "bottom", "left", "right", "height",
        "width", "background-color", "border-top", "border-bottom", "border-left", "border-right"
    ];

    if (params) {
        for (var i in paramList) {
            if (params[paramList[i]]) {
                text += " " + paramList[i] + " = '" + params[paramList[i]] + "'";
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

divClass = function(className) {
    return divHeadGen({ "class": className });
}

/**
 * MISC
 * Converts boolean to its appropriate button class
 * @param  {bool} ticked    True is green, false is orange
 * @return {String}         Button class
 */
bToCClass = function(ticked) {
    if (ticked) {
        return 'but_green';
    }
    return 'but_orange';
}

/**
 * MISC
 * Converts boolean to its appropriate color
 * @param  {bool} ticked    True is green, false is orange
 * @return {String}         Color
 */
boolToCol = function(ticked) {
    if (ticked) {
        return STYLE.colors.GREEN;
    }
    return STYLE.colors.ORANGE;
}


setBaseOnclicks = function() {
    $("#categ_1").click(function() { pushCategToBoard(0); });
    $("#categ_2").click(function() { pushCategToBoard(1); });
    $("#categ_3").click(function() { pushCategToBoard(2); });


    $('#greypage').click(returnToMain);

    $('#reset_btn').click(checkoutNodes);

    $('#tutorial').click(openTutorial);

    $('#settings').click(openSettings);
}

/**
 * Finds and returns first item in array with id
 * @param  {[type]} arr [description]
 * @param  {[type]} i   [description]
 * @return {[type]}     [description]
 */
findById = function(arr, i) {
    return arr[findIndexById(arr, i)];
}

findIndexById = function(arr, i) {
    index = arr.findIndex(x => x.id == i)
    return index;
}

openTutorial = function() {
    chrome.app.window.create('/html/tutorial.html', {
        'state': "maximized"
    });
}


JSONexport = function(_node) {
    var returnText = JSON.stringify(_node);
    return returnText;
}

JSONimport = function(string) {
    return JSON.parse(string);
}

clampNum = function(min, num, max){
     return Math.min(Math.max(num, min), max);
}