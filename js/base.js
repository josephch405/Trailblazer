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

/**
 * GET
 * Find a node based on ID
 * RECURSIVE - Initializes at mainNode, propogates search throughout children
 * @param  {int || String}      _id          Top-layer nodes may have int ids
 * @param  {Array || Object}    _reference   Search is performed in this range
 * @return {int || }            [description]
 */
findNode = function(_id, _reference) {
    if (_.isArray(_reference)) {
        //propogate search through array
        for (var i in _reference) {
            var obj1 = findNode(_id, _reference[i]);
            if (obj1 != -1)
                return obj1;
        }
    } else if (typeof _reference == "object") {
        //either return object, or propogate search downwards
        if (_reference.id == _id)
            return _reference;
        for (var j in _reference.children) {
            var obj2 = findNode(_id, _reference.children[j]);
            if (obj2 != -1)
                return obj2;
        }
        return -1;
    } else {
        //initial call, start in mainNode
        for (var k in mainNode) {
            var _array = mainNode[k];
            var obj3 = findNode(_id, _array);
            if (obj3 != -1)
                return obj3;
        }
    }
    return -1;
}

/**
 * [refresh_card description]
 * @param  {[type]} _id [description]
 * @return {[type]}     [description]
 */
refresh_card = function(_id) {
    findNode(_id).refresh_card();
}

/**
 * [flip_check description]
 * @param  {[type]} _id [description]
 * @return {[type]}     [description]
 */
flip_check = function(_id) {
    findNode(_id).flip_check();
}

/**
 * ATTACH
 * Attaches jquery tooltips to boxes
 * Use whenever new boxes are added
 * @return {null}
 */
attachTooltips = function() {
    $(".box").tooltip(STYLE.tooltip);
}

/**
 * [set_onclicks description]
 * @param {[type]} _id [description]
 */
set_onclicks = function(_id) {
    findNode(_id).set_onclicks();
    attachTooltips();
}